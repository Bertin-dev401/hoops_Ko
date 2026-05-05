// Sessions page — lists all upcoming games the logged-in user has signed up for
// Cards highlight today/tomorrow games with color-coded badges
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getUserUpcomingSessions, Session } from "@/lib/firestore";

function getDay(s: string) { return new Date(s + "T00:00:00").getDate(); }
function getMonth(s: string) { return new Date(s + "T00:00:00").toLocaleDateString("en-US", { month: "short" }); }
function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}
function daysUntil(dateStr: string) {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(dateStr + "T00:00:00");
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `In ${diff} days`;
}

export default function SessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const s = await getUserUpcomingSessions(user.uid);
        setSessions(s);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [user]);

  return (
    <div className="container" style={{ paddingTop: "0", paddingBottom: "60px" }}>
      <div className="page-header animate-in">
        <div>
          <h1 className="page-header__title">Your sessions</h1>
          <p className="page-header__sub">Games you&apos;re signed up for.</p>
        </div>
      </div>

      {loading ? (
        <div className="list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: "92px", borderRadius: "var(--r-lg)" }} />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <CalendarIcon />
          </div>
          <div className="empty-state__title">No upcoming games</div>
          <div className="empty-state__desc">
            Head over to a community and join a scheduled game.
          </div>
          <Link href="/communities" className="btn btn--primary btn--sm">
            Browse communities
          </Link>
        </div>
      ) : (
        <div className="list animate-in stagger-1">
          {sessions.map((s, i) => {
            const countdown = daysUntil(s.date);
            const isToday = countdown === "Today";
            const isTomorrow = countdown === "Tomorrow";

            return (
              <div key={s.id} className="session-card" style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="session-card__date-block" style={isToday ? { background: "var(--accent)", borderColor: "var(--accent)" } : {}}>
                  <div className="session-card__day" style={isToday ? { color: "#fff" } : {}}>
                    {getDay(s.date)}
                  </div>
                  <div className="session-card__month" style={isToday ? { color: "rgba(255,255,255,0.85)" } : {}}>
                    {getMonth(s.date)}
                  </div>
                </div>
                <div className="session-card__body">
                  <div className="session-card__time">{formatTime(s.time)}</div>
                  <div className="session-card__title">{formatDate(s.date)}</div>
                  {s.note && <div className="session-card__note">{s.note}</div>}
                  <div className="session-card__footer">
                    <span
                      className={`badge ${isToday ? "badge--green" : isTomorrow ? "badge--blue" : ""}`}
                      style={!isToday && !isTomorrow ? { background: "var(--surface-2)", color: "var(--text-2)" } : {}}
                    >
                      {countdown}
                    </span>
                    <span className="badge badge--blue">
                      {s.participantCount} {s.participantCount === 1 ? "player" : "players"}
                    </span>
                    <Link
                      href={`/communities/${s.communityId}`}
                      style={{ fontSize: "0.78rem", color: "var(--text-3)", marginLeft: "auto" }}
                    >
                      View court
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
