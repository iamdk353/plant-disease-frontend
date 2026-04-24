# Plant Disease Frontend

Frontend application for plant disease detection workflow, including:

- Authentication
- Disease diagnosis view
- Advice/recommendations
- Activity/history tracking
- Profile and uploads

Built with **Next.js (App Router)** and **Firebase**.

---

## System Architecture

### High-Level Design

```mermaid
flowchart LR
    U[User Browser] --> N[Next.js Frontend]
    N --> A[Firebase Auth]
    N --> D[Firestore / Realtime DB]
    N --> S[Cloud Storage]
    N --> B[Diagnosis Backend API (optional)]

    subgraph Frontend Modules
      R[Routes / Pages]
      C[Reusable Components]
      H[Custom Hooks]
      F[Firebase Client Config]
    end

    N --> R
    R --> C
    R --> H
    H --> F
    F --> A
    F --> D
    F --> S
```

Add this section to your README (below **Project Structure** or replace it).

````markdown
## File Tree Structure

```text
plant-disease-frontend/
├─ app/
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ app/
│  │  ├─ page.tsx
│  │  ├─ activities/
│  │  │  └─ page.tsx
│  │  ├─ adivise/
│  │  │  └─ page.tsx
│  │  ├─ diagnoise/
│  │  │  └─ page.tsx
│  │  ├─ history/
│  │  │  └─ page.tsx
│  │  └─ profile/
│  │     └─ page.tsx
│  ├─ auth/
│  │  ├─ login/
│  │  │  └─ page.tsx
│  │  └─ signup/
│  │     └─ page.tsx
│  ├─ components/
│  │  ├─ Nav.tsx
│  │  └─ RecentActivity.tsx
│  └─ uploads/
│     └─ page.tsx
├─ hooks/
│  └─ useCurrentUser.ts
├─ lib/
│  └─ firebase.ts
├─ public/
└─ README.md
```

> URLs currently follow folder names exactly, including `adivise` and `diagnoise`.
````

If you want, I can merge this directly into your full README and return the complete final file.

### Layered View

1. **Presentation Layer**
   - `app/**/page.tsx`
   - UI screens for diagnosis, advice, history, profile, uploads, auth.

2. **Component Layer**
   - `app/components/*`
   - Shared UI blocks (navigation, recent activity).

3. **State & Data Hooks**
   - `hooks/useCurrentUser.ts`
   - Encapsulates current user/session logic.

4. **Infrastructure Layer**
   - `lib/firebase.ts`
   - Firebase SDK initialization and service wiring.

5. **External Services**
   - Firebase Auth / DB / Storage
   - Optional ML or backend API for disease prediction.

---

## Project Structure

```text
app/
  globals.css
  layout.tsx
  page.tsx
  app/
    page.tsx
    activities/page.tsx
    adivise/page.tsx
    diagnoise/page.tsx
    history/page.tsx
    profile/page.tsx
  auth/
    login/page.tsx
    signup/page.tsx
  components/
    Nav.tsx
    RecentActivity.tsx
  uploads/page.tsx

hooks/
  useCurrentUser.ts

lib/
  firebase.ts

public/
  (static assets)
```

> Note: Route folder names `adivise` and `diagnoise` are currently spelled as in source and will map directly to URL paths.

---

## How to Run the App

## 1) Prerequisites

- **Node.js** 18+ (recommended: latest LTS)
- **npm** (or pnpm/yarn)
- Firebase project credentials

## 2) Install dependencies

From project root:

```powershell
npm install
```

## 3) Configure environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Make sure these match what `lib/firebase.ts` expects.

## 4) Start development server

```powershell
npm run dev
```

Open:

- `http://localhost:3000`

## 5) Build for production

```powershell
npm run build
npm run start
```

---

## Recommended Scripts

Typical Next.js scripts (verify in `package.json`):

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## Troubleshooting

- **Firebase init errors**: verify `.env.local` keys and restart dev server.
- **Blank page / route issues**: confirm route folder names match intended URLs.
- **Auth not persisting**: inspect `hooks/useCurrentUser.ts` and Firebase auth settings.

---

## Future Improvements

- Rename misspelled routes (`adivise` -> `advise`, `diagnoise` -> `diagnose`) with redirects.
- Add API client module for diagnosis backend.
- Add unit/integration tests for auth and page-level flows.
- Add CI for lint/build checks.
