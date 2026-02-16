# Agent Operating Contract

**Project**: DJ Forever 2 Wedding Website  
**Effective Date**: October 18, 2025  
**Version**: 1.0.0

This document defines the rules and constraints for GitHub Copilot's coding agent when working on this repository.

---

## Scope Rules

### ✅ Touch Scope (Allowed Modifications)

The agent may **edit** files under these paths:

- `client/src/**` - Frontend React application code
- `client/tests/**` - Frontend test files
- `client/public/**` (except binary images) - Public assets
- `server/src/**` - Backend Node.js application code
- `server/tests/**` - Backend test files
- `scripts/**` - Build and utility scripts
- `.github/**` - GitHub Actions workflows and templates
- `docs/**` - Documentation files

### ✅ Create Scope (New Files Allowed)

The agent may **create** new files under:

- `client/src/**`
- `server/src/**`
- `scripts/**`
- `.github/**`
- `docs/**`
- `server/src/migrations/**` (for database migrations)

### 🚫 Never Touch (Prohibited Paths)

The agent must **never** modify or delete:

- `DJ-Forever/**` - Legacy folder (unused, historical)
- `client/public/assets/images/**/*.{jpg,jpeg,png,svg}` - Binary image assets
- `server/qr-codes/**` - Generated QR code images
- `.env*` files - Environment configuration (read-only)
- `package-lock.json` files - Must be regenerated via npm
- `node_modules/**` - Dependency directories

---

## Quality Gates

### Tests Required

Every PR must include:

1. **Unit tests** for new business logic functions
2. **Integration tests** for database operations
3. **E2E tests** for user-facing features
4. **Test coverage** matching the task's "tests" section

### Build/CI Requirements

All PRs must:

1. ✅ Pass `npm run test` in `/client`
2. ✅ Pass `npm run test` in `/server`
3. ✅ Pass root CI workflow gates
4. ✅ Pass TypeScript compilation (`tsc --noEmit`)
5. ✅ Pass bundle size gates (when implemented)

### Code Quality Standards

- **TypeScript strict mode**: No `any` types without explicit justification
- **JSDoc required**: All exported functions must have JSDoc comments
- **Error handling**: All async operations must have try/catch
- **Logging**: Use centralized logger utility, never `console.log` in production code

---

## Security Requirements

### 1. Never Log Secrets

- JWT tokens
- API keys
- Passwords
- SMTP credentials
- Any environment variable containing "SECRET", "KEY", or "PASSWORD"

### 2. Validate Environment Variables

- Check required env vars on application boot
- Fail fast with actionable error messages
- Example: "Missing SMTP_HOST in .env - email sending disabled"

### 3. Input Validation

- Validate all user inputs at API boundaries
- Use zod or similar schema validation
- Sanitize data before database operations

---

## Database Operations

### Migration Requirements

For any schema change:

1. **Create migration script** under `server/src/migrations/`
2. **Filename format**: `YYYY-MM-description.ts`
3. **Idempotent**: Safe to run multiple times
4. **Reversible**: Include rollback instructions
5. **Test**: Dry-run on test database before production

### Index Changes

Before adding/removing indexes:

1. Document index strategy in model file
2. Test query performance with `explain()`
3. Include migration script for index changes

---

## Rollback Safety

Every task must include a rollback plan:

1. **Feature flags**: Use ENV vars to disable new features
2. **Database migrations**: Must be reversible
3. **API changes**: Maintain backward compatibility for 1 release
4. **Documentation**: Update rollback instructions in task

---

## Communication Standards

### Commit Messages

Follow conventional commits format:

```text
feat: add email retry queue with exponential backoff

- Create EmailJob model for persisted queue
- Implement retry logic (1m/5m/15m, max 5 attempts)
- Add health check endpoint GET /health/smtp
- Update AdminEmailReminders UI with health badge

Closes #123
```

### PR Descriptions

Required sections:

1. **What**: Summary of changes
2. **Why**: Motivation and business value
3. **How**: Key implementation details
4. **Testing**: How to verify the changes
5. **Acceptance Criteria**: Checklist from task JSON

### Code Comments

- **Why, not what**: Explain intent, not obvious syntax
- **TODOs**: Include ticket reference and reason
- **Warnings**: Flag performance-sensitive or security-critical code

---

## Task Execution Workflow

### 1. Before Starting

- [ ] Read entire task JSON
- [ ] Verify all touched_paths exist or are valid new paths
- [ ] Check prohibited_paths to avoid conflicts
- [ ] Review acceptance_criteria for clear success metrics

### 2. During Implementation

- [ ] Follow implementation_steps sequentially
- [ ] Write tests alongside code (not after)
- [ ] Run tests locally before pushing
- [ ] Update documentation if public APIs change

### 3. Before Submitting PR

- [ ] All tests pass locally
- [ ] TypeScript compiles without errors
- [ ] No ESLint warnings
- [ ] Acceptance criteria all met
- [ ] Rollback plan documented

### 4. PR Review Checklist

- [ ] CI/CD green
- [ ] Code review approved
- [ ] Acceptance criteria verified
- [ ] Documentation updated
- [ ] Rollback plan tested (if applicable)

---

## Error Handling Patterns

### API Errors

```typescript
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  logger.error("Operation failed", {
    operation: "riskyOperation",
    error: error.message,
    requestId: req.context?.requestId,
  });
  throw new ApiError("User-friendly message", { code: "ERROR_CODE" });
}
```

### GraphQL Errors

```typescript
// In resolvers
if (!user) {
  throw new ApolloError("User not found", "USER_NOT_FOUND");
}
```

### Service Layer Errors

```typescript
// Throw typed errors
throw new ValidationError("Invalid email format");
throw new NotFoundError("RSVP not found");
throw new UnauthorizedError("Admin access required");
```

---

## Performance Considerations

### Database Queries

- Use indexes for frequently queried fields
- Avoid N+1 queries (use populate/join)
- Limit result sets with pagination
- Use projection to select only needed fields

### Frontend Bundle

- Lazy load heavy components
- Code split by route
- Optimize images (already configured)
- Monitor bundle size gates

### API Response Times

- GraphQL queries: < 500ms (p95)
- Mutations: < 1s (p95)
- Health checks: < 100ms (p99)

---

## Testing Standards

### Unit Tests

- Test pure functions in isolation
- Mock external dependencies
- Cover edge cases and error paths
- Aim for 80%+ coverage on business logic

### Integration Tests

- Test database operations with real DB (test instance)
- Test GraphQL resolvers end-to-end
- Clean up test data after each test
- Use fixtures for realistic test data

### E2E Tests

- Test critical user journeys
- Use Playwright for browser automation
- Run against production-like environment
- Maintain visual regression baselines

---

## Deployment Considerations

### Render.com Specifics

- **Build command**: `npm run render-build`
- **Start command**: `npm start`
- **Port**: Uses `process.env.PORT` (assigned by Render)
- **Database**: MongoDB connection via env var

### Environment Variables

Required for production:

```bash
# Server
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=djforever2
JWT_SECRET=(min 24 chars)
CONFIG__FRONTEND_URL=https://dj-forever2.onrender.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sinnema1.jm@gmail.com
SMTP_PASS=(app password)

# Client
VITE_GRAPHQL_ENDPOINT=/graphql
```

---

## Emergency Procedures

### Hotfix Protocol

1. Create branch from `main`: `hotfix/critical-issue`
2. Make minimal change to fix issue
3. Fast-track PR review (skip non-critical checks)
4. Deploy immediately
5. Follow up with proper fix in next sprint

### Rollback Procedure

1. Identify problematic commit
2. Check rollback_plan in task JSON
3. Revert commit or disable via feature flag
4. Verify rollback in staging
5. Deploy rollback to production
6. Post-mortem: document what went wrong

---

## Questions & Support

- **Technical questions**: Check docs/ folder first
- **Task clarification**: Comment on GitHub issue
- **Architecture decisions**: Ping @Sinnema1
- **Emergency**: Contact wedding couple directly

---

**Contract Version**: 1.0.0  
**Last Updated**: October 18, 2025  
**Next Review**: After Phase 1 tasks complete
