// Communities list page — browse, join, and create communities
// Modal form handles community creation, membership state tracked locally
"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  getCommunities,
  createCommunity,
  joinCommunity,
  isMember,
  Community,
} from "@/lib/firestore";

export default function CommunitiesPage() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [memberships, setMemberships] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [joinError, setJoinError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await getCommunities();
      setCommunities(list);
      const memberChecks = await Promise.all(list.map((c) => isMember(user.uid, c.id)));
      const memberSet = new Set(list.filter((_, i) => memberChecks[i]).map((c) => c.id));
      setMemberships(memberSet);
    } catch {
      setLoadError("Failed to load communities. Check your connection and refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) { setFormError("Name and location are required."); return; }
    if (!user) return;
    setFormError("");
    setFormLoading(true);
    try {
      await createCommunity(user.uid, user.displayName ?? "Player", {
        name: name.trim(),
        description: description.trim(),
        location: location.trim(),
      });
      setShowModal(false);
      setName(""); setDescription(""); setLocation("");
      await load();
    } catch {
      setFormError("Failed to create community. Try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleJoin = async (communityId: string) => {
    if (!user) return;
    setJoiningId(communityId);
    setJoinError("");
    try {
      await joinCommunity(user.uid, communityId);
      setMemberships((prev) => new Set([...prev, communityId]));
    } catch {
      setJoinError("Failed to join. Try again.");
    } finally {
      setJoiningId(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setName(""); setDescription(""); setLocation(""); setFormError("");
  };

  return (
    <>
      <div className="container" style={{ paddingTop: "0", paddingBottom: "60px" }}>
        <div className="page-header animate-in">
          <div>
            <h1 className="page-header__title">Communities</h1>
            <p className="page-header__sub">Find your court. Join the run.</p>
          </div>
          <button className="btn btn--primary btn--sm" onClick={() => setShowModal(true)}>
            <PlusIcon />
            New community
          </button>
        </div>

        {loadError && <div className="auth-form__error" role="alert">{loadError}</div>}
        {joinError && <div className="auth-form__error" role="alert">{joinError}</div>}

        {loading ? (
          <div className="grid grid--2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: "112px", borderRadius: "var(--r-lg)" }} />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__title">No communities yet</div>
            <div className="empty-state__desc">Be the first. Create one and bring your crew together.</div>
            <button className="btn btn--primary btn--sm" onClick={() => setShowModal(true)}>
              <PlusIcon /> Create community
            </button>
          </div>
        ) : (
          <div className="grid grid--2 animate-in stagger-1">
            {communities.map((c) => {
              const joined = memberships.has(c.id);
              return (
                <div key={c.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  <Link href={`/communities/${c.id}`} style={{ display: "block", flex: 1 }}>
                    <div className="card__title truncate">{c.name}</div>
                    <div className="card__meta" style={{ marginTop: "5px" }}>
                      <LocationIcon />
                      <span>{c.location}</span>
                      <span style={{ color: "var(--text-3)" }}>·</span>
                      <span>{c.memberCount} members</span>
                    </div>
                    {c.description && (
                      <div className="card__desc" style={{ WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {c.description}
                      </div>
                    )}
                  </Link>
                  <div className="card__actions">
                    {joined ? (
                      <Link href={`/communities/${c.id}`} className="btn btn--secondary btn--sm">
                        Open
                      </Link>
                    ) : (
                      <button
                        className="btn btn--primary btn--sm"
                        onClick={() => handleJoin(c.id)}
                        disabled={joiningId === c.id}
                      >
                        {joiningId === c.id ? <span className="btn-loading" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> : "Join"}
                      </button>
                    )}
                    {joined && <span className="badge badge--green">Joined</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal__header">
              <h2 className="modal__title" id="modal-title">New community</h2>
              <p className="modal__sub">Set up your court.</p>
            </div>

            <form className="modal__form" onSubmit={handleCreate} noValidate>
              {formError && (
                <div className="auth-form__error" role="alert">{formError}</div>
              )}

              <div className="field">
                <label className="field__label" htmlFor="c-name">Name</label>
                <input
                  id="c-name"
                  type="text"
                  className="field__input"
                  placeholder="West Side Ballers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={60}
                  required
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="c-location">Location</label>
                <input
                  id="c-location"
                  type="text"
                  className="field__input"
                  placeholder="Rugunga Courts, Kigali"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={80}
                  required
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="c-desc">Description <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(optional)</span></label>
                <textarea
                  id="c-desc"
                  className="field__textarea"
                  placeholder="Open to all levels. We run every Saturday morning."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={300}
                  rows={3}
                />
              </div>

              <div className="modal__actions">
                <button type="button" className="btn btn--ghost btn--sm" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={formLoading}>
                  {formLoading ? <span className="btn-loading" /> : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 14" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M6 1C3.79 1 2 2.79 2 5c0 3.25 4 8 4 8s4-4.75 4-8c0-2.21-1.79-4-4-4z"
        stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="6" cy="5" r="1.3" fill="currentColor" />
    </svg>
  );
}
