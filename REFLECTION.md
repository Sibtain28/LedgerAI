# Reflection

## What went well?
- The core audit engine calculations were successfully decoupled into pure TypeScript functions, making them highly testable.
- The UI feels premium, with a robust dark-mode aesthetic and smooth micro-animations.

## What was challenging?
- Handling PDF export on the client side without breaking Next.js Server-Side Rendering (SSR) required implementing dynamic imports for `jspdf` and `html2canvas`.
- Navigating the complexities of React 19's strict `useEffect` rules during CI deployment required careful configuration of `eslint.config.mjs`.

## Future Improvements
- Migrate the hardcoded pricing data out of `engine.ts` into a dynamically updated database table so vendors' price changes automatically reflect in the audit.
- Add full Supabase Auth to replace the current lightweight `localStorage` session tracking.
