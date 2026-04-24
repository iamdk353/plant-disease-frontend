# Copilot Instructions - Plant Disease Frontend

## Build, Test, and Lint Commands

### Development
```bash
npm run dev
```
- Starts Next.js dev server at `http://localhost:3000` with hot reload
- Source code located in `app/` and `lib/`, `hooks/`

### Production Build
```bash
npm run build
npm run start
```
- `build`: Compiles TypeScript and optimizes for production
- `start`: Runs the production-optimized server

### Linting
```bash
npm run lint
```
- ESLint configuration uses Next.js core web vitals + TypeScript rules
- Config file: `eslint.config.mjs` (flat config format)
- Linted directories: all `.ts` and `.tsx` files except `.next/**`, `next-env.d.ts`

### Installing Dependencies
```bash
npm install
```
- Required after `package.json` changes
- Uses `package-lock.json` for deterministic installs

---

## High-Level Architecture

### Tech Stack
- **Framework**: Next.js 16.2.2 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + PostCSS
- **Backend Integration**: Firebase Auth + Firestore (optional) + Cloud Storage
- **Animations**: GSAP 3.15.0 for UI animations

### Layered Architecture

```
┌─────────────────────────────────────────┐
│   Pages / Routes (app/**/page.tsx)      │ ← Presentation
├─────────────────────────────────────────┤
│   Reusable Components (app/components/) │ ← UI Components
├─────────────────────────────────────────┤
│   Custom Hooks (hooks/)                 │ ← State & Logic
├─────────────────────────────────────────┤
│   Firebase Config (lib/firebase.ts)     │ ← External Services
└─────────────────────────────────────────┘
```

### Directory Structure
- **`app/`**: Next.js App Router pages and layout
  - `layout.tsx`: Root layout with fonts (Inter, Manrope) and global CSS
  - `globals.css`: Tailwind directives and custom CSS variables (Material Design 3 color tokens)
  - `page.tsx`: Home page
  - `app/`: Nested app routes (activities, advise, diagnose, history, profile)
  - `auth/`: Authentication pages (login, signup)
  - `components/`: Shared UI components (Nav, RecentActivity)
  - `uploads/`: File upload functionality
- **`hooks/`**: Custom React hooks (`useCurrentUser.ts`)
- **`lib/`**: Utilities and configuration (`firebase.ts`)
- **`public/`**: Static assets (images, etc.)

### Routing Note
- Route folder names are literal: `adivise` maps to `/adivise`, `diagnoise` maps to `/diagnoise`
- See README for future improvements on spelling corrections

### Firebase Setup
- Client SDK only (no Admin SDK)
- Singleton pattern: `getApps().length === 0` prevents re-initialization on hot reload
- Exports: `app` (Firebase app instance), `auth` (Firebase Auth)
- All Firebase config keys are environment variables prefixed with `NEXT_PUBLIC_`
- Required env vars in `.env.local`:
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  NEXT_PUBLIC_FIREBASE_PROJECT_ID
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  NEXT_PUBLIC_FIREBASE_APP_ID
  ```

### API Rewrites
- Next.js `next.config.ts` rewrites `/api/*` requests to `http://129.159.239.239:8000/api/*`
- Backend API is external; frontend proxies requests through Next.js

---

## Key Conventions

### 1. **Component Naming**
- Files use PascalCase: `Nav.tsx`, `RecentActivity.tsx`
- Components are functional and exported as default

### 2. **Hooks Pattern**
- Custom hooks in `hooks/` directory
- `useCurrentUser()` encapsulates Firebase auth state + loading
- Returns object with `{ user, loading }` properties
- Listens to `onAuthStateChanged` and cleans up subscriptions on unmount

### 3. **TypeScript Strict Mode**
- `tsconfig.json` has `"strict": true`
- All types must be explicitly declared
- Use `React.ReactNode` for children props (see `layout.tsx`)

### 4. **Styling**
- Tailwind CSS 4 as primary utility framework
- PostCSS for processing (config: `postcss.config.mjs`)
- Custom CSS variables from Material Design 3 palette (referenced in `globals.css`)
- Semantic token usage: `bg-surface`, `text-on-surface`, `bg-primary-container`, etc.

### 5. **Path Aliases**
- `@/*` resolves to repository root (see `tsconfig.json`)
- Example: `import { auth } from "@/lib/firebase"`

### 6. **Environment Variables**
- All Firebase config keys must be prefixed with `NEXT_PUBLIC_` to be accessible in browser
- Non-public secrets should not be prefixed (for server-side only)
- Verify in `.env.local` before starting dev server

### 7. **Font Loading**
- Google Fonts loaded in root layout using Next.js `next/font/google`
- Fonts available globally as CSS variables: `--font-inter`, `--font-manrope`
- Material Symbols Outlined icon font loaded via CDN link in layout head

### 8. **Metadata & SEO**
- Page titles and descriptions set via Next.js `Metadata` API
- Root metadata in `app/layout.tsx`: "AgriNex - Nurturing Digital Growth"

---

## When to Check These Resources
- **Confused about routes?** → Check `app/` folder structure; remember folder names are literal
- **Firebase config issues?** → Verify `.env.local` against `lib/firebase.ts`
- **Need to add a new page?** → Create `app/feature-name/page.tsx` following Next.js conventions
- **Styling not applying?** → Check `globals.css` for token definitions and Tailwind setup
- **Auth state not working?** → Review `useCurrentUser.ts` hook and ensure Firebase is initialized
