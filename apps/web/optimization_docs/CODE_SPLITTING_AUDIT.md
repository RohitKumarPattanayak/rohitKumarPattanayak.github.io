# Code Splitting & Performance Audit

**Date of Audit:** March 2026
**Focus:** React Application Performance Optimization via Code Splitting and Error Boundaries.

## 1. Executive Summary
This document serves as an audit trail for the architectural changes made to improve the initial loading performance of the React application. The primary strategy involved deferring the loading of non-critical JavaScript payloads until they are needed, utilizing React's built-in lazy-loading capabilities alongside robust error handling.

## 2. Route-Based Code Splitting
The core routing layer was refactored to prevent the browser from downloading the entire application upon initial visit.

- **File Altered:** `apps/web/src/app/router.tsx`
- **Mechanism:** `React.lazy` combined with `<Suspense>`.
- **Modifications:**
  - `DashboardLayout` is now lazily loaded.
  - `DashboardPage` is now lazily loaded.
  - `ChatPage` is now lazily loaded.
- **Impact:** Navigating to `/dashboard` fetches only the dashboard chunks. The heavy sub-components used in `ChatPage` are completely excluded from the initial bundle payload.

## 3. Component-Based Code Splitting
Strategic code splitting was applied to individual components that are either unusually large or conditionally rendered based on user state.

- **File Altered:** `apps/web/src/app/layout.tsx`
- **Target Component:** `OnboardingModal`
- **Mechanism:** The static import `import OnboardingModal from ...` was replaced with a dynamic lazy import.
- **Impact:** The `OnboardingModal` contains significant logic and markup. Since it is only rendered when a user is not authenticated (`!username`), returning users no longer evaluate or download this chunk, accelerating Time to Interactive (TTI).

## 4. Global Error Handling & Suspense Fallbacks
To ensure that lazy-loading chunks over network requests does not compromise application stability, a generic error-catching infrastructure was implemented.

- **New Component:** `apps/web/src/components/shared/ErrorBoundary.tsx`
- **New Component:** `apps/web/src/components/shared/LoadingFallback.tsx`
- **Implementation:**
  - The `<Routes>` tree in `router.tsx` is encapsulated within `<ErrorBoundary>`. If a chunk fails to load due to network instability, a graceful recovery UI ("Failed to load... Refresh Page") is shown instead of a white screen of death.
  - Replaced native `null` fallbacks with standard visual spinners using `LoadingFallback.tsx` to provide users with immediate visual feedback during chunk transitions.

## 5. Build & Verification
- **Process:** Vite build compiler (`npm run build`) alongside TypeScript checks.
- **Result:** Vite successfully generated granular asynchronous chunk (`.js`) and asset (`.css`) files corresponding to the routes and decoupled components, verifying the integrity of the code-splitting strategy.
