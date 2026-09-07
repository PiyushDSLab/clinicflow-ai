---
name: API schema barrel
description: Orval-generated Zod barrel behavior when OpenAPI request-body schemas are present
---

When the OpenAPI contract includes request bodies, the generated Zod API module may already export the body schemas while Orval also writes a generated-types barrel export. Re-exporting both creates duplicate TypeScript symbols.

**Why:** The workspace uses generated Zod and React Query clients from one OpenAPI source, and body schemas are generated in both paths by the current Orval setup.

**How to apply:** After regenerating, keep `lib/api-zod/src/index.ts` single-sourced from `./generated/api` unless the generator configuration changes to remove the duplicate exports. Always run the library typecheck after codegen.