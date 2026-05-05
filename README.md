# Hoops

Hoops is a pickup basketball organizer. Create communities for your local court, schedule games, and let players sign up — no group chats, no confusion.

---

## What You Can Do

- **Sign up / Sign in** — create an account with your name, email, and password
- **Browse communities** — see all courts and crews in the app
- **Create a community** — set a name, location, and description for your court
- **Join a community** — become a member to access its games
- **Schedule a game** — pick a date, time, and optional note for a session
- **Join / leave a game** — sign up for upcoming sessions or drop out
- **See who's playing** — tap the player count on any game to see the roster
- **Your sessions** — dedicated page showing every upcoming game you're signed up for
- **Dashboard** — quick overview of your upcoming games and joined communities
- **Profile** — view your name and email, sign out
- **Dark / light mode** — toggle in the nav bar, preference saved locally

---

## How to Navigate

```
/ (root)
├── /login          → Sign in to your account
├── /signup         → Create a new account
├── /dashboard      → Home screen after login — upcoming games + your communities
├── /communities    → Browse all communities, create or join one
├── /communities/[id] → Community detail — view/join/schedule games, see players
├── /sessions       → All upcoming games you're signed up for
└── /profile        → Your account info and sign out
```

The bottom nav bar is always visible on app pages and links to Dashboard, Communities, Sessions, and Profile.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Auth | Firebase Authentication (Email/Password) |
| Database | Firebase Firestore |
| Styling | Plain CSS (no Tailwind, no UI library) |
| Font | Plus Jakarta Sans via Google Fonts |
| Hosting | Vercel (recommended) |

---

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd hoops
npm install
```

### 2. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Sign-in method → **Email/Password**
4. Enable **Firestore Database** → Start in production mode

### 3. Add environment variables

```bash
cp .env.example .env.local
```

Fill in the values from Firebase project settings → Your apps → Web app:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### 4. Deploy Firestore rules and indexes

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

```bash
npx vercel --prod
```

Then:
- Add all `NEXT_PUBLIC_FIREBASE_*` variables in the Vercel dashboard under project settings → Environment Variables
- Add your Vercel domain in Firebase → Authentication → Authorized domains

---

## Firestore Schema

```
users/{uid}
  uid, email, displayName, createdAt

communities/{communityId}
  name, description, location, ownerId, ownerName, memberCount, createdAt

memberships/{userId}_{communityId}
  userId, communityId, joinedAt

sessions/{sessionId}
  communityId, createdBy, createdByName, date, time, note, participantCount, createdAt

sessionParticipants/{userId}_{sessionId}
  userId, sessionId, displayName, joinedAt
```
