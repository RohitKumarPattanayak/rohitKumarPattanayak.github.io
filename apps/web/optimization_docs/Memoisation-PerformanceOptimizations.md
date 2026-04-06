# React Performance Optimizations

## Overview
This document outlines the systematic performance improvements applied across the repository to ensure optimal rendering, stable object references, and avoidance of heavy re-computations during the React component lifecycle.

---

## 1. Chat Feature Optimizations ([features/Chat/chat.tsx](file:///d:/Interview%20requirement/rohitKumarPattanayak.github.io/apps/web/src/features/Chat/chat.tsx))

### **A. Component Extraction & Memoization**
**Before:** `EmptyState` was an inner functional component defined directly inside the [ChatPage](file:///d:/Interview%20requirement/rohitKumarPattanayak.github.io/apps/web/src/features/Chat/chat.tsx#47-234) render body. Because it was defined internally, a completely new function reference for the component was created on every single render (e.g., every keystroke in the chat input), causing it to unmount and remount or heavily re-render, killing performance.
**After:** 
- Moved `EmptyState` completely outside of [ChatPage](file:///d:/Interview%20requirement/rohitKumarPattanayak.github.io/apps/web/src/features/Chat/chat.tsx#47-234).
- Wrapped `EmptyState` in `React.memo(...)` to guarantee it only re-renders if its explicit props change.

### **B. Referential Stability with `useCallback`**
**Before:** Handlers like `scrollToBottom`, `scrollToBottomInstant`, and `handleSend` were recreated on every render.
**After:** Safely wrapped in `useCallback` with exact dependency arrays. This guarantees that components deeper in the tree, or `useEffect` hooks relying on these functions, aren't continuously triggered by reference changes.

### **C. Heavy Computation Caching with `useMemo`**
**Before:** `[...chatConversation].sort(...)` was being executed directly inside the JSX return. Sorting is an \(O(N \log N)\) operation and mapping occurs immediately after. Running this on every keypress significantly degrades UI responsiveness.
**After:** 
- Abstracted the sorting into `const sortedChatConversation = useMemo(() => ..., [chatConversation])`.
- Now, the array is only sorted when the actual conversation data changes from the backend/mutation, keeping keystrokes perfectly smooth.

---

## 2. Typewriter Component Optimizations ([features/Chat/TypewriterMarkdown.tsx](file:///d:/Interview%20requirement/rohitKumarPattanayak.github.io/apps/web/src/features/Chat/TypewriterMarkdown.tsx))

### **A. Memoizing Static Arrays**
**Before:** `<ReactMarkdown remarkPlugins={[remarkGfm]}>` was dynamically creating a new array `[remarkGfm]` dynamically on every render frame. Since objects/arrays in JavaScript use referential equality, this broke pure component heuristics downstream.
**After:** Moved `const remarkPlugins = [remarkGfm];` out of the functional component into the module scope. The array reference is now perfectly stable across the entire lifecycle of the application.

### **B. Component-level Memoization**
**Before:** The Markdown rendering engine is exceptionally heavy. The `TypewriterMarkdown` component lacked a boundary.
**After:** Wrapped default export in `React.memo`. Unless `content` or `animate` changes, the Markdown abstract-syntax-tree is not repeatedly parsed and flattened.

---

## 3. Dashboard Optimizations ([features/Dashboard/dashboard.tsx](file:///d:/Interview%20requirement/rohitKumarPattanayak.github.io/apps/web/src/features/Dashboard/dashboard.tsx))

### **A. Moving Static Data Outside Components**
**Before:** The `sectionOrder` array and the [getSectionIcon](file:///d:/Interview%20requirement/rohitKumarPattanayak.github.io/apps/web/src/features/Dashboard/dashboard.tsx#26-36) function were re-initialized inside the render cycle of [DashboardPage](file:///d:/Interview%20requirement/rohitKumarPattanayak.github.io/apps/web/src/features/Dashboard/dashboard.tsx#37-202).
**After:** Moved both `sectionOrder` and [getSectionIcon](file:///d:/Interview%20requirement/rohitKumarPattanayak.github.io/apps/web/src/features/Dashboard/dashboard.tsx#26-36) outside the component entirely. They now exist in the module scope, reducing the memory footprint directly.

### **B. Abstracting Heavy Sort Computations**
**Before:** `Object.keys(portfolio).sort(...)` executing \(O(N \log N)\) array sorts directly on render.
**After:** Wrapped `sections` with `useMemo`, ensuring it only recalculates if the fetched `portfolio` changes.

### **C. Memoizing Static Settings**
**Before:** React Markdown instances received dynamic array allocations for plugins: `<ReactMarkdown remarkPlugins={[remarkGfm]}>`.
**After:** Moved into a module-scoped constant: `const remarkPlugins = [remarkGfm];`. Same stable reference optimization across all markdown renders.
