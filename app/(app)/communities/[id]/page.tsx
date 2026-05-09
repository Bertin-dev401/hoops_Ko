// Community detail page — shows sessions, lets members join/leave games and schedule new ones
// Participants list is loaded on demand when clicking the player count badge
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  getCommunity,
  getCommunitySessions,
  joinCommunity,
  leaveCommunity,
  isMember,
  createSession,
  joinSession,
  leaveSession,
  isSessionParticipant,
  getSessionParticipants,
  Community,
  Session,
  SessionParticipant,
} from "@/lib/firestore";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
function getDay(s: string) { return new Date(s + "T00:00:00").getDate(); }
function getMonth(s: string) { return new Date(s + "T00:00:00").toLocaleDateString("en-US", { month: "short" }); }
function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}
function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [community, setCommunity] = useState<Community | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Session participants cache
  const [participants, setParticipants] = useState<Record<string, SessionParticipant[]>>({});
  const [sessionJoined, setSessionJoined] = useState<Set<string>>(new Set());
  const [sessionActionId, setSessionActionId] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // Create session modal
  const [showCreate, setShowCreate] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const load = async () => {
    if (!user || !id) return;
    setLoading(true);
    try {
      const [comm, sess, memberStatus] = await Promise.all([
        getCommunity(id),
        getCommunitySessions(id),
        isMember(user.uid, id),
      ]);
      if (!comm) { router.replace("/communities"); return; }
      setCommunity(comm);
      setSessions(sess);
      setJoined(memberStatus);

      // Check which sessions user joined
      const joined = await Promise.all(sess.map((s) => isSessionParticipant(user.uid, s.id)));
      setSessionJoined(new Set(sess.filter((_, i) => joined[i]).map((s) => s.id)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id, user]);

  const handleJoinCommunity = async () => {
    if (!user || !id) return;
    setMembershipLoading(true);
    setActionError("");
    try {
      await joinCommunity(user.uid, id);
      setJoined(true);
      setCommunity((c) => c ? { ...c, memberCount: c.memberCount + 1 } : c);
    } catch { setActionError("Failed to join community. Try again."); }
    finally { setMembershipLoading(false); }
  };

  const handleLeaveCommunity = async () => {
    if (!user || !id) return;
    setMembershipLoading(true);
    setActionError("");
    try {
      await leaveCommunity(user.uid, id);
      setJoined(false);
      setCommunity((c) => c ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c);
    } catch { setActionError("Failed to leave community. Try again."); }
    finally { setMembershipLoading(false); }
  };

  const handleSessionAction = async (session: Session) => {
    if (!user) return;
    setSessionActionId(session.id);
    setActionError("");
    try {
      if (sessionJoined.has(session.id)) {
        await leaveSession(user.uid, session.id);
        setSessionJoined((prev) => { const n = new Set(prev); n.delete(session.id); return n; });
        setSessions((prev) => prev.map((s) => s.id === session.id ? { ...s, participantCount: Math.max(0, s.participantCount - 1) } : s));
      } else {
        await joinSession(user.uid, session.id, user.displayName ?? "Player");
        setSessionJoined((prev) => new Set([...prev, session.id]));
        setSessions((prev) => prev.map((s) => s.id === session.id ? { ...s, participantCount: s.participantCount + 1 } : s));
      }
    } catch { setActionError("Action failed. Check your connection and try again."); }
    finally { setSessionActionId(null); }
  };

  const loadParticipants = async (sessionId: string) => {
    if (participants[sessionId]) {
      setExpandedSession((e) => (e === sessionId ? null : sessionId));
      return;
    }
    try {
      const p = await getSessionParticipants(sessionId);
      setParticipants((prev) => ({ ...prev, [sessionId]: p }));
      setExpandedSession(sessionId);
    } catch { setActionError("Failed to load players. Try again."); }
  };

  const handleCreateSession = async (e: FormEvent) => {
    e.preventDefault();
    if (!date || !time) { setFormError("Date and time are required."); return; }
    if (!user || !id) return;
    setFormError("");
    setFormLoading(true);
    try {
      await createSession(id, user.uid, user.displayName ?? "Player", { date, time, note: note.trim() });
      setShowCreate(false);
      setDate(""); setTime(""); setNote("");
      await load();
    } catch {
      setFormError("Failed to create session. Try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const upcoming = sessions.filter((s) => s.date >= today);
  const past = sessions.filter((s) => s.date < today);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: "36px" }}>
        <div className="skeleton" style={{ height: "100px", borderRadius: "var(--r-lg)", marginBottom: "12px" }} />
        <div className="skeleton" style={{ height: "80px", borderRadius: "var(--r-lg)" }} />
      </div>
    );
  }

  if (!community) return null;

  return (
    <>
      <div className="container" style={{ paddingTop: "0", paddingBottom: "60px" }}>
        {/* Back */}
        <div style={{ padding: "20px 0 0" }}>
          <Link href="/communities" style={{ fontSize: "0.8125rem", color: "var(--text-3)", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <BackIcon /> Communities
          </Link>
        </div>

        {actionError && (
          <div className="auth-form__error" role="alert" style={{ marginBottom: "16px" }}>{actionError}</div>
        )}

        {/* Community header */}
        <div className="page-header animate-in">
          <div>
            <h1 className="page-header__title">{community.name}</h1>
            <p className="page-header__sub" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span>{community.location}</span>
              <span style={{ color: "var(--text-3)" }}>·</span>
              <span>{community.memberCount} members</span>
              {community.ownerId === user?.uid && <span className="badge badge--blue">Owner</span>}
            </p>
            {community.description && (
              <p style={{ color: "var(--text-2)", fontSize: "0.875rem", marginTop: "8px", lineHeight: "1.55" }}>
                {community.description}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            {joined ? (
              <>
                {joined && (
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => setShowCreate(true)}
                  >
                    <PlusIcon /> New game
                  </button>
                )}
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={handleLeaveCommunity}
                  disabled={membershipLoading || community.ownerId === user?.uid}
                  title={community.ownerId === user?.uid ? "Owners cannot leave" : "Leave community"}
                >
                  {membershipLoading ? <span className="btn-loading" style={{ borderColor: "rgba(0,0,0,0.2)", borderTopColor: "currentColor", width: 12, height: 12 }} /> : "Leave"}
                </button>
              </>
            ) : (
              <button className="btn btn--primary btn--sm" onClick={handleJoinCommunity} disabled={membershipLoading}>
                {membershipLoading ? <span className="btn-loading" /> : "Join community"}
              </button>
            )}
          </div>
        </div>

        {/* Upcoming sessions */}
        <section className="animate-in stagger-1" style={{ marginBottom: "36px" }}>
          <p className="section-label">Upcoming games</p>
          {upcoming.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 20px" }}>
              <div className="empty-state__title">No upcoming games</div>
              {joined && (
                <div className="empty-state__desc">Schedule the next one.</div>
              )}
              {joined && (
                <button className="btn btn--primary btn--sm" onClick={() => setShowCreate(true)}>
                  <PlusIcon /> Schedule a game
                </button>
              )}
            </div>
          ) : (
            <div className="list">
              {upcoming.map((s) => {
                const isJoined = sessionJoined.has(s.id);
                const isExpanded = expandedSession === s.id;
                return (
                  <div key={s.id} className="session-card" style={{ flexDirection: "column", gap: "0" }}>
                    <div style={{ display: "flex", gap: "18px", alignItems: "flex-start" }}>
                      <div className="session-card__date-block">
                        <div className="session-card__day">{getDay(s.date)}</div>
                        <div className="session-card__month">{getMonth(s.date)}</div>
                      </div>
                      <div className="session-card__body">
                        <div className="session-card__time">{formatTime(s.time)}</div>
                        <div className="session-card__title">{formatDate(s.date)}</div>
                        {s.note && <div className="session-card__note">{s.note}</div>}
                        <div className="session-card__footer">
                          <button
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                            onClick={() => loadParticipants(s.id)}
                          >
                            <span className="badge badge--blue" style={{ cursor: "pointer" }}>
                              {s.participantCount} {s.participantCount === 1 ? "player" : "players"}
                            </span>
                          </button>
                          {joined && (
                            <button
                              className={`btn btn--sm ${isJoined ? "btn--danger" : "btn--primary"}`}
                              onClick={() => handleSessionAction(s)}
                              disabled={sessionActionId === s.id}
                            >
                              {sessionActionId === s.id
                                ? <span className="btn-loading" style={{ width: 12, height: 12, borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
                                : isJoined ? "Leave game" : "Join game"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Participants expand */}
                    {isExpanded && participants[s.id] && (
                      <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--border)" }}>
                        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-3)", marginBottom: "8px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                          Players
                        </p>
                        <div className="participants-list">
                          {participants[s.id].map((p) => (
                            <div key={p.userId} className="participant-chip">
                              <div className="participant-chip__avatar">{initials(p.displayName)}</div>
                              {p.displayName}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Past sessions */}
        {past.length > 0 && (
          <section className="animate-in stagger-2">
            <p className="section-label">Past games</p>
            <div className="list">
              {past.map((s) => (
                <div key={s.id} className="session-card" style={{ opacity: 0.55 }}>
                  <div className="session-card__date-block">
                    <div className="session-card__day">{getDay(s.date)}</div>
                    <div className="session-card__month">{getMonth(s.date)}</div>
                  </div>
                  <div className="session-card__body">
                    <div className="session-card__time">{formatTime(s.time)}</div>
                    <div className="session-card__title">{formatDate(s.date)}</div>
                    <div className="session-card__footer">
                      <span className="badge badge--blue">{s.participantCount} played</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreate && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="session-modal-title">
            <div className="modal__header">
              <h2 className="modal__title" id="session-modal-title">Schedule a game</h2>
              <p className="modal__sub">{community.name}</p>
            </div>

            <form className="modal__form" onSubmit={handleCreateSession} noValidate>
              {formError && <div className="auth-form__error" role="alert">{formError}</div>}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="field">
                  <label className="field__label" htmlFor="s-date">Date</label>
                  <input
                    id="s-date"
                    type="date"
                    className="field__input"
                    value={date}
                    min={today}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="s-time">Time</label>
                  <input
                    id="s-time"
                    type="time"
                    className="field__input"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="s-note">Note <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(optional)</span></label>
                <textarea
                  id="s-note"
                  className="field__textarea"
                  placeholder="Bring your A-game. Full court."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={300}
                  rows={3}
                />
              </div>

              <div className="modal__actions">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={formLoading}>
                  {formLoading ? <span className="btn-loading" /> : "Schedule"}
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

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
