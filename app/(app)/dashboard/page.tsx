// Dashboard page — shows user's upcoming games and joined communities
// Loads data on mount and displays empty states if nothing found
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getUserCommunities, getUserUpcomingSessions, Community, Session } from "@/lib/firestore";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getDay(dateStr: string) {
  return new Date(dateStr + "T00:00:00").getDate();
}

function getMonth(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short" });
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [comms, sess] = await Promise.all([
          getUserCommunities(user.uid),
          getUserUpcomingSessions(user.uid),
        ]);
        setCommunities(comms);
        setSessions(sess);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const firstName = user?.displayName?.split(" ")[0] ?? "Player";

  return (
    <div className="container" style={{ paddingTop: "36px", paddingBottom: "60px" }}>
      {/* Greeting */}
      <div className="animate-in" style={{ marginBottom: "36px" }}>
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.15,
            color: "var(--text)",
          }}
        >
          Hey, {firstName}.
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: "0.9rem", marginTop: "5px" }}>
          {sessions.length > 0
            ? `You have ${sessions.length} upcoming ${sessions.length === 1 ? "game" : "games"}.`
            : "No upcoming games. Join a community to get started."}
        </p>
      </div>

      {/* Upcoming Sessions */}
      <section className="animate-in stagger-1" style={{ marginBottom: "40px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
          }}
        >
          <p className="section-label">Upcoming games</p>
          <Link
            href="/sessions"
            style={{ fontSize: "0.8125rem", color: "var(--accent)", fontWeight: 600 }}
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="list">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton" style={{ height: "84px", borderRadius: "var(--r-lg)" }} />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="empty-state" style={{ padding: "32px 20px" }}>
            <div className="empty-state__title">No upcoming games</div>
            <div className="empty-state__desc">Join communities and sign up for sessions.</div>
          </div>
        ) : (
          <div className="list">
            {sessions.slice(0, 3).map((s) => (
              <div key={s.id} className="session-card">
                <div className="session-card__date-block">
                  <div className="session-card__day">{getDay(s.date)}</div>
                  <div className="session-card__month">{getMonth(s.date)}</div>
                </div>
                <div className="session-card__body">
                  <div className="session-card__time">{formatTime(s.time)}</div>
                  <div className="session-card__title">{formatDate(s.date)}</div>
                  {s.note && (
                    <div className="session-card__note" style={{ marginTop: "4px" }}>
                      {s.note}
                    </div>
                  )}
                  <div className="session-card__footer">
                    <span className="badge badge--blue">
                      {s.participantCount} {s.participantCount === 1 ? "player" : "players"}
                    </span>
                    <Link
                      href={`/communities/${s.communityId}`}
                      style={{ fontSize: "0.78rem", color: "var(--text-3)" }}
                    >
                      View court
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My Communities */}
      <section className="animate-in stagger-2">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
          }}
        >
          <p className="section-label">My communities</p>
          <Link
            href="/communities"
            style={{ fontSize: "0.8125rem", color: "var(--accent)", fontWeight: 600 }}
          >
            Browse all
          </Link>
        </div>

        {loading ? (
          <div className="grid grid--2">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton" style={{ height: "100px", borderRadius: "var(--r-lg)" }} />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <div className="empty-state" style={{ padding: "32px 20px" }}>
            <div className="empty-state__title">No communities yet</div>
            <div className="empty-state__desc">Browse and join one to see it here.</div>
            <Link href="/communities" className="btn btn--secondary btn--sm">
              Browse communities
            </Link>
          </div>
        ) : (
          <div className="grid grid--2">
            {communities.map((c) => (
              <Link key={c.id} href={`/communities/${c.id}`} className="card card--link">
                <div className="card__title truncate">{c.name}</div>
                <div className="card__meta">
                  <span>{c.location}</span>
                  <span>{c.memberCount} members</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
