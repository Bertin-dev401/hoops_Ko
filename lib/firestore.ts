// All Firestore read/write functions for communities, memberships, sessions, and participants
// Each function maps directly to a Firestore collection — see README for the full schema
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Types ────────────────────────────────────────────────────────────────────

export interface Community {
  id: string;
  name: string;
  description: string;
  location: string;
  ownerId: string;
  ownerName: string;
  createdAt: Timestamp;
  memberCount: number;
}

export interface Membership {
  userId: string;
  communityId: string;
  joinedAt: Timestamp;
}

export interface Session {
  id: string;
  communityId: string;
  createdBy: string;
  createdByName: string;
  date: string;       // ISO date string YYYY-MM-DD
  time: string;       // HH:MM
  note: string;
  createdAt: Timestamp;
  participantCount: number;
}

export interface SessionParticipant {
  userId: string;
  sessionId: string;
  displayName: string;
  joinedAt: Timestamp;
}

// ── Communities ───────────────────────────────────────────────────────────────

export async function createCommunity(
  ownerId: string,
  ownerName: string,
  data: { name: string; description: string; location: string }
): Promise<string> {
  const ref = await addDoc(collection(db, "communities"), {
    ...data,
    ownerId,
    ownerName,
    memberCount: 1,
    createdAt: serverTimestamp(),
  });
  // Auto-join as member
  await setDoc(doc(db, "memberships", `${ownerId}_${ref.id}`), {
    userId: ownerId,
    communityId: ref.id,
    joinedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getCommunities(): Promise<Community[]> {
  const snap = await getDocs(
    query(collection(db, "communities"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) } as Community));
}

export async function getCommunity(id: string): Promise<Community | null> {
  const snap = await getDoc(doc(db, "communities", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as DocumentData) } as Community;
}

export async function joinCommunity(userId: string, communityId: string): Promise<void> {
  const membershipId = `${userId}_${communityId}`;
  await setDoc(doc(db, "memberships", membershipId), {
    userId,
    communityId,
    joinedAt: serverTimestamp(),
  });
}

export async function leaveCommunity(userId: string, communityId: string): Promise<void> {
  await deleteDoc(doc(db, "memberships", `${userId}_${communityId}`));
}

export async function isMember(userId: string, communityId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "memberships", `${userId}_${communityId}`));
  return snap.exists();
}

export async function getUserCommunities(userId: string): Promise<Community[]> {
  const memberships = await getDocs(
    query(collection(db, "memberships"), where("userId", "==", userId))
  );
  const communityIds = memberships.docs.map((d) => d.data().communityId as string);
  if (communityIds.length === 0) return [];

  const communities: Community[] = [];
  for (const cid of communityIds) {
    const c = await getCommunity(cid);
    if (c) communities.push(c);
  }
  return communities;
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function createSession(
  communityId: string,
  createdBy: string,
  createdByName: string,
  data: { date: string; time: string; note: string }
): Promise<string> {
  const ref = await addDoc(collection(db, "sessions"), {
    communityId,
    createdBy,
    createdByName,
    ...data,
    participantCount: 1,
    createdAt: serverTimestamp(),
  });
  // Creator auto-joins
  await setDoc(doc(db, "sessionParticipants", `${createdBy}_${ref.id}`), {
    userId: createdBy,
    sessionId: ref.id,
    displayName: createdByName,
    joinedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getCommunitySessions(communityId: string): Promise<Session[]> {
  const snap = await getDocs(
    query(
      collection(db, "sessions"),
      where("communityId", "==", communityId),
      orderBy("date", "asc"),
      orderBy("time", "asc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) } as Session));
}

export async function joinSession(
  userId: string,
  sessionId: string,
  displayName: string
): Promise<void> {
  await setDoc(doc(db, "sessionParticipants", `${userId}_${sessionId}`), {
    userId,
    sessionId,
    displayName,
    joinedAt: serverTimestamp(),
  });
}

export async function leaveSession(userId: string, sessionId: string): Promise<void> {
  await deleteDoc(doc(db, "sessionParticipants", `${userId}_${sessionId}`));
}

export async function isSessionParticipant(userId: string, sessionId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "sessionParticipants", `${userId}_${sessionId}`));
  return snap.exists();
}

export async function getSessionParticipants(sessionId: string): Promise<SessionParticipant[]> {
  const snap = await getDocs(
    query(collection(db, "sessionParticipants"), where("sessionId", "==", sessionId))
  );
  return snap.docs.map((d) => d.data() as SessionParticipant);
}

export async function getUserUpcomingSessions(userId: string): Promise<Session[]> {
  const participations = await getDocs(
    query(collection(db, "sessionParticipants"), where("userId", "==", userId))
  );
  const sessionIds = participations.docs.map((d) => d.data().sessionId as string);
  if (sessionIds.length === 0) return [];

  const today = new Date().toISOString().split("T")[0];
  const sessions: Session[] = [];

  for (const sid of sessionIds) {
    const snap = await getDoc(doc(db, "sessions", sid));
    if (snap.exists()) {
      const s = { id: snap.id, ...(snap.data() as DocumentData) } as Session;
      if (s.date >= today) sessions.push(s);
    }
  }

  return sessions.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}
