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
| Hosting | Vercel |

---

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
