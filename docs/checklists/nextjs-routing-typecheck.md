# Next.js Routing & TypeScript Debug Checklist

## 🔍 Immediate Error Resolution (from build log)
```bash
src/app/api/auth/apikey/[id]/route.ts
Type error: Route "src/app/api/auth/apikey/[id]/route.ts" has an invalid "DELETE" export:
  Type "{ params: { id: string; }; }" is not a valid type for the function's second argument.
```

**Required Fixes:**
1. Update API route parameter typing:
```typescript
// Before
export const DELETE = (
  req: NextRequest,
  context: { params: { id: string } }
) => { ... }

// After (Next.js compatible typing)
export const DELETE = (
  req: NextRequest,
  { params }: { params: { id: string } }
) => { ... }
```

2. Verify all dynamic route handlers use Next.js types:
```typescript
// Proper typing pattern
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  // ...
}
```

## ✅ Comprehensive TypeScript Route Validation
1. **API Route Signatures**
   - [ ] All HTTP methods export proper Next.js types
   - [ ] Dynamic route params use `{ params: { [key]: string | string[] } }`
   - [ ] No custom type wrappers around `NextRequest`/`NextResponse`

2. **Middleware Typing**
   - [ ] `withAuth` middleware propagates proper types
   - [ ] Custom request types extend `NextRequest`
   ```typescript
   interface AuthenticatedRequest extends NextRequest {
     auth: { payload: JWTPayload }
   }
   ```

3. **Dynamic Route Components**
   - [ ] Page components use `useParams` with type assertions
   ```typescript
   const { id } = useParams() as { id: string }
   ```
   - [ ] Optional catch-all routes handle `string[]` types

## 🛠️ Build Process Checks
1. **Type Validation**
   ```bash
   npx tsc --noEmit --pretty
   ```
   - [ ] No errors in terminal output
   - [ ] Strict null checks passing

2. **Next.js Type Plugin**
   - [ ] `next-env.d.ts` exists with:
   ```typescript
   /// <reference types="next" />
   /// <reference types="next/types/global" />
   ```

3. **Route Handler Patterns**
   - [ ] No mixed Promise/non-Promise in page props
   ```typescript
   // Incorrect pattern (from error)
   export default function Page({ params }: { params: Promise<...> })
   
   // Correct pattern
   export default function Page({ params }: { params: { ... } })
   ```

## 🔄 Systematic Debugging Steps
1. **API Route Isolation Test**
   ```bash
   npm run dev -- --isolate
   ```
   - [ ] Check individual route compilation

2. **TypeScript Config Audit**
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "types": ["next"]
     }
   }
   ```

3. **Middleware Type Flow**
   - Trace auth middleware typing:
   ```typescript
   export function withAuth(
     req: NextRequest,
     handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
     context: { params: unknown }
   ): Promise<NextResponse> {
     // Ensure proper type assertion
     const authReq = req as AuthenticatedRequest
     // ...
   }
   ```

4. **Dynamic Route Parameter Tests**
   - Add type guards to critical paths:
   ```typescript
   function isParamsValid(params: unknown): params is { id: string } {
     return !!params && typeof params === 'object' && 'id' in params
   }
   ```

## 📋 Checklist Status
- Created: 2024-03-25
- Last Updated: 2024-03-25
- Current Status: ⚠️ Requires immediate attention to API route types

**Next Steps:**
1. Apply the API route parameter fix
2. Run isolated type check:
```bash
npx tsc --noEmit --skipLibCheck
```
3. Verify build process:
```bash
npm run build
``` 