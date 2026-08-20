# PocketWise

A real-time expense & savings tracker for kids/teens, with a parent oversight dashboard — built with **React (Vite)**, **Tailwind CSS**, and **Firebase (Auth + Firestore)**.

## Features

- **Email/Password auth** with two roles: **Child** and **Parent**, linked via a 6-character code the parent shares.
- **Child dashboard**: balance, monthly allowance, spend-this-month, expense logging with categories, dynamic folders (grouped by day/event), savings goals with progress bars, a Budget Splitter (Essentials/Fun/Savings %), a Digital Piggy Bank, and gamification badges.
- **Parent dashboard**: link-code sharing, a switcher across linked children, allowance limit + balance top-up controls, and read-only charts/goals/badges per child.
- **Real-time everywhere**: every read is a Firestore `onSnapshot` listener — a parent depositing an allowance, or a child logging an expense, shows up instantly on the other device with no refresh.
- **Bilingual UI**: English / Arabic toggle with full RTL layout support (persisted in `localStorage`).
- **Glassmorphism visual style** built on Tailwind CSS design tokens (see `tailwind.config.js`).

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Backend | Firebase Authentication + Firestore |
| Icons | lucide-react |
| Charts | Recharts |
| State | React Context (`AuthContext`, `LanguageContext`) + Firestore real-time listeners |

## Getting started

### 1. Create a Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com) and create a project.
2. **Authentication** → Sign-in method → enable **Email/Password**.
3. **Firestore Database** → create a database (production mode is fine — the included rules handle access control).
4. **Project settings** → **General** → add a Web App → copy the config values.

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in the six `VITE_FIREBASE_*` values from step 1. `src/firebase/firebaseConfig.js` reads them via `import.meta.env` and falls back to placeholder strings if unset (so the app won't crash on boot, but auth/Firestore calls will fail until they're set).

### 3. Deploy the security rules

Using the [Firebase CLI](https://firebase.google.com/docs/cli):

```bash
firebase login
firebase init firestore   # point it at this project, keep the default rules file name
firebase deploy --only firestore:rules
```

Or paste the contents of `firestore.rules` directly into the Firestore Console → Rules tab.

### 4. Install and run

```bash
npm install
npm run dev
```

Open the printed local URL. Sign up as a **Parent** first, copy the link code shown on their dashboard, then sign up a second account as a **Child** using that code.

### 5. Build for production

```bash
npm run build
```

Outputs a static `dist/` folder deployable to Firebase Hosting, Vercel, Netlify, or any static host.

## Data model (Firestore)

```
users/{uid}
  role: 'parent' | 'child'
  name, email
  # parent-only:
  linkCode: string                 # 6-char code shared with a child
  # child-only:
  parentId: string                 # uid of the linked parent
  balance: number                  # spendable funds
  monthlyAllowance: number
  budgetSplit: { essentials, fun, savings }  # percentages, sum to 100

  users/{uid}/expenses/{expenseId}
    amount, category, note, date, folderId, createdAt

  users/{uid}/folders/{folderId}
    name, date, total, expenseCount, createdAt

  users/{uid}/goals/{goalId}
    title, targetAmount, currentAmount, completed, createdAt

  users/{uid}/badges/{badgeKey}     # doc ID == badge key, makes awarding idempotent
    badgeKey, earnedAt

linkCodes/{code}
  parentId: string                 # public-read lookup used only during child signup
```

All balance-affecting writes (`addExpense`, `deleteExpense`, `contributeToGoal`) run inside a Firestore **transaction** in `src/services/`, so the balance can never drift out of sync with the underlying records even under concurrent writes from a child's and parent's device.

## Where to plug in / extend things

- **Add a badge**: add an entry to `BADGE_DEFINITIONS` in `src/services/badgeService.js`, add its `name`/`desc` translation keys in `src/i18n/translations.js`, then call `awardBadgeIfNew(uid, 'your_key')` wherever it should trigger (see `src/utils/badgeRules.js` for the pattern of pure "did they earn it" checks).
- **Add a language**: add a new top-level key to `src/i18n/translations.js` (e.g. `fr: {...}`) mirroring the `en` shape — nothing else needs to change, `useLanguage()`'s `t()` reads from it automatically.
- **Add an expense category**: add it to the `CATEGORIES` array in `src/components/ExpenseModal.jsx` and its translation under `expenseModal.categories` in both languages.

## Known simplifications (MVP-grade, called out for transparency)

- **One parent per child**: the data model supports a single `parentId`, not multiple guardians.
- **Date bucketing uses UTC** (`toISOString().slice(0,10)`) for simplicity — near local midnight, an expense could land in the "wrong" day for timezones far from UTC.
- **Security rules are owner/parent-scoped but not field-scoped**: a linked parent can currently write any field on the child's `users/{uid}` doc, not just `monthlyAllowance`/`balance`. Tightening this further with `request.resource.data` diffing is a natural next step before a real production launch.
- **RTL styling** relies on Tailwind's built-in `rtl:`/`ltr:` variants plus flex layouts, which cover the whole app; a few components use explicit `rtl:` overrides. For pixel-perfect Arabic typography spacing, a design pass is worth doing before shipping to a broad audience.
