# Routing & Authentication Improvements TODO

**Priority:** Medium  
**Estimated Time:** 4-6 hours  
**Created:** October 26, 2025

## Issue Summary

Currently, protected routes like `/admin` rely on localStorage token persistence, which can lead to confusing user experiences when:

1. **Stale tokens exist** - User has expired/invalid token in localStorage but UI doesn't clearly indicate auth failure
2. **Direct URL access** - Users navigate directly to `/admin` without proper authentication state
3. **Token corruption** - Malformed localStorage data causes silent failures
4. **Auth state mismatch** - localStorage says authenticated but server rejects token
5. **No user feedback** - Silent redirects without explaining why access was denied

## Current Implementation Review

### Existing Components

**`/client/src/components/AdminRoute.tsx`** ✅ Partially Implemented

```typescript
- ✅ Shows loading state while checking auth
- ✅ Redirects to "/" if not logged in
- ✅ Redirects to "/" if not admin
- ❌ No error message to user
- ❌ No indication of WHY redirect happened
- ❌ Doesn't handle token expiration gracefully
- ❌ No localStorage cleanup on invalid token
```

**`/client/src/context/AuthContext.tsx`** ✅ Good Foundation

```typescript
- ✅ Version-based cache invalidation
- ✅ Safe JSON parsing
- ✅ Token persistence
- ❌ No token expiration checking
- ❌ No automatic refresh on expired tokens
- ❌ Silent failures on corrupt localStorage
```

**`/client/src/App.tsx`** ✅ Basic Routing

```typescript
- ✅ Uses AdminRoute wrapper
- ✅ EnhancedSuspense for loading states
- ❌ No global error boundary for route failures
- ❌ No 404/catch-all route
```

## Improvements Needed

### 1. Enhanced AdminRoute with User Feedback

**File:** `/client/src/components/AdminRoute.tsx`

**Changes:**

- Add toast/notification when redirected due to missing auth
- Add toast/notification when redirected due to insufficient permissions
- Log redirect reasons for debugging
- Clean up localStorage on auth failures
- Provide "Login to Continue" message

**Implementation:**

```typescript
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading, logout } = useAuth();
  const [redirectReason, setRedirectReason] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      setRedirectReason("authentication_required");
      // Show toast: "Please log in to access the admin dashboard"
    } else if (!isLoading && user && !user.isAdmin) {
      setRedirectReason("insufficient_permissions");
      // Show toast: "You don't have permission to access this page"
    }
  }, [user, isLoading]);

  // ... rest of logic
};
```

### 2. Token Expiration Handling

**File:** `/client/src/context/AuthContext.tsx`

**Changes:**

- Decode JWT token to check expiration
- Auto-logout on expired token
- Show warning before token expires (5 min warning)
- Provide "Session Expired" message to user
- Clear localStorage on expiration

**Implementation:**

```typescript
// Add JWT decode utility
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true; // Treat invalid tokens as expired
  }
};

// In initializeAuth:
if (storedToken) {
  if (isTokenExpired(storedToken)) {
    logWarn("Stored token is expired, clearing auth", "AuthContext");
    localStorage.clear();
    setIsLoading(false);
    // Show toast: "Your session has expired. Please log in again."
    return;
  }
  // ... continue with valid token
}
```

### 3. Global Error Boundary for Routes

**File:** `/client/src/App.tsx`

**Changes:**

- Add catch-all route for 404 errors
- Add error boundary specific to routing failures
- Provide helpful error messages
- Add "Return to Home" button

**Implementation:**

```typescript
<Routes>
  {/* Existing routes */}

  {/* Catch-all 404 route */}
  <Route
    path="*"
    element={
      <NotFoundPage
        message="The page you're looking for doesn't exist"
        returnUrl="/"
      />
    }
  />
</Routes>
```

### 4. Protected Route Base Component

**File:** `/client/src/components/ProtectedRoute.tsx` (NEW)

**Purpose:** Generic protected route component that AdminRoute can extend

**Features:**

- Reusable for any route requiring authentication
- Configurable permission checks
- Consistent error messaging
- Automatic localStorage cleanup
- Redirect with state preservation

**Implementation:**

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireRSVP?: boolean;
  redirectTo?: string;
  showError?: boolean;
  errorMessage?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireRSVP = false,
  redirectTo = "/",
  showError = true,
  errorMessage,
}) => {
  // Generic protection logic
  // Can be used for /admin, /rsvp, /dashboard, etc.
};
```

### 5. Automatic Token Refresh (Future Enhancement)

**Priority:** Low (for post-wedding v2.0)

**Changes:**

- Implement refresh token flow
- Auto-renew tokens before expiration
- Silent re-authentication
- Reduces login friction

### 6. Auth Debug Improvements

**File:** `/client/src/pages/AuthDebug.tsx`

**Changes:**

- Add localStorage viewer
- Show token expiration time
- Add "Clear All Auth Data" button
- Show auth state timeline
- Validate token format

### 7. Redirect with Intent Preservation

**Feature:** Remember where user was trying to go

**Implementation:**

```typescript
// In ProtectedRoute, before redirecting:
const location = useLocation();
return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;

// After login, redirect back:
const navigate = useNavigate();
const location = useLocation();
const from = location.state?.from || "/";
navigate(from);
```

## Implementation Plan

### Phase 1: Critical Fixes (2-3 hours)

- [ ] Add token expiration checking in AuthContext
- [ ] Auto-logout on expired tokens
- [ ] Clear localStorage on auth failures
- [ ] Add user feedback messages to AdminRoute

### Phase 2: Enhanced UX (2-3 hours)

- [ ] Create ProtectedRoute base component
- [ ] Add catch-all 404 route
- [ ] Implement redirect with intent preservation
- [ ] Add toast notifications for auth failures

### Phase 3: Polish & Testing (1-2 hours)

- [ ] Enhance AuthDebug page
- [ ] Add auth state logging
- [ ] Test all redirect scenarios
- [ ] Test with expired tokens
- [ ] Test with corrupt localStorage
- [ ] Document new auth flow

## Testing Scenarios

### Test Case 1: Expired Token

1. Login as admin
2. Manually edit localStorage token to have expired `exp`
3. Navigate to `/admin`
4. **Expected:** Redirect to home with "Session expired" message

### Test Case 2: Direct URL Access (Not Logged In)

1. Clear localStorage
2. Navigate directly to `http://localhost:3002/admin`
3. **Expected:** Redirect to home with "Please log in" message

### Test Case 3: Non-Admin User

1. Login as regular guest (Charlie)
2. Navigate to `/admin`
3. **Expected:** Redirect to home with "Insufficient permissions" message

### Test Case 4: Corrupt localStorage

1. Login as admin
2. Manually corrupt `user` in localStorage (invalid JSON)
3. Refresh page
4. **Expected:** Clear localStorage, show login prompt

### Test Case 5: Token/User Mismatch

1. Login as User A
2. Manually change `user` in localStorage to User B's data
3. Make API call
4. **Expected:** Logout and show "Session invalid" message

## Related Files to Review/Modify

- ✅ `/client/src/components/AdminRoute.tsx` - Add user feedback
- ✅ `/client/src/context/AuthContext.tsx` - Token expiration
- ✅ `/client/src/App.tsx` - 404 route
- 🆕 `/client/src/components/ProtectedRoute.tsx` - Create new
- 🆕 `/client/src/pages/NotFoundPage.tsx` - Create new
- 📝 `/client/src/pages/AuthDebug.tsx` - Enhance
- 📝 `/client/src/utils/tokenUtils.ts` - Create new (JWT helpers)

## Success Criteria

✅ **User Experience**

- Users always know WHY they were redirected
- Clear error messages for auth failures
- Expired tokens handled gracefully
- No silent failures

✅ **Technical**

- Token expiration checked before use
- localStorage cleared on invalid auth
- All protected routes use consistent logic
- Comprehensive logging for debugging

✅ **Edge Cases**

- Corrupt localStorage handled
- Expired tokens handled
- Missing tokens handled
- Permission mismatches handled
- Network failures handled

## Notes

- This is a **quality of life improvement**, not a critical bug
- Can be implemented incrementally
- Should align with existing error reporting service
- Consider mobile UX for error messages (toasts vs modals)
- Don't break existing QR login flow

## Priority vs Wedding Timeline

**If wedding is soon:**

- Focus on Phase 1 only (critical fixes)
- Defer UX enhancements to post-wedding

**If time permits:**

- Implement all phases for better admin experience
- Will help with pre-wedding RSVP management

---

**Related Issues:**

- Email system testing (in progress)
- Mobile drawer scroll fix (completed)
- Accessibility review (deferred)

**Depends On:**

- None (can implement independently)

**Blocks:**

- Nothing critical (enhancement only)
