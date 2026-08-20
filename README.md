# PocketWise

A modern web app that helps kids and teens track daily spending, save toward goals, and earn badges — while parents monitor allowances and habits in real time.

## Stack

- React 19 + Vite
- Tailwind CSS (glassmorphism UI)
- Firebase Auth (email/password) + Firestore snapshots
- Lucide React + Recharts

## Quick start

```bash
npm install
cp .env.example .env
# Fill Firebase keys in .env
npm run dev
```

## Firebase setup

1. Create a Firebase project and enable **Authentication → Email/Password**.
2. Create a **Firestore** database.
3. Deploy `firestore.rules` (or paste them in the Firebase console).
4. Copy web app config into `.env` (`VITE_FIREBASE_*` keys). Placeholders also live in `src/firebase/config.js` and `src/firebaseConfig.js`.

## Roles

- **Child:** log expenses, remaining balance, savings goals (piggy bank), category/weekly charts, budget splitter (50/30/20), badges.
- **Parent:** linked children, monthly allowance, aggregate charts, recent activity.

Parent–child linking uses a child code (`PW-XXXXXX`) stored on the child profile and `linkedChildren` on the parent.

## Firestore shape

```
users/{uid}
  expenses/{id}
  savingsGoals/{id}
  allowances/current
  badges/{badgeId}
```

UI data is wired through `src/hooks/useFirestoreData.js` (`onSnapshot`) so dashboards update live.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local Vite server |
| `npm run build` | Production bundle |
| `npm run preview` | Preview the build |
