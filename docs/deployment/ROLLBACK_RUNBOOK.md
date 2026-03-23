# Deployment Rollback Runbook

Use this runbook when a production deployment causes user-facing failures or critical regressions.

## Scope

- Frontend static deployment rollback
- Backend service rollback
- Post-rollback validation
- Communication and incident notes

## Preconditions

1. Confirm incident severity and blast radius.
2. Capture current symptoms with timestamp and affected endpoints.
3. Confirm database status before rollback actions.

## Decision Tree

1. Frontend-only regression:

- Roll back frontend deployment first.
- Keep backend unchanged.

2. Backend-only regression:

- Roll back backend deployment first.
- Keep frontend unchanged unless API contract changed.

3. Full-stack regression:

- Roll back backend first, then frontend if needed.
- Validate API health before frontend redeploy validation.

## Rollback Procedure

### 1. Put Incident Context in Writing

Record:

- Incident start time
- Last known good commit or deploy ID
- Current failing deploy ID
- Affected URLs

### 2. Backend Rollback (Render)

1. Open Render backend service.
2. Go to Deploys.
3. Select last known good deploy.
4. Trigger rollback/redeploy from that deploy.
5. Wait for health check stabilization.

Validation:

- `curl https://api.djforever2026.com/health`
- `curl -X POST https://api.djforever2026.com/graphql -H "Content-Type: application/json" -d '{"query":"{ __typename }"}'`

### 3. Frontend Rollback (Render)

1. Open Render frontend service.
2. Go to Deploys.
3. Select last known good deploy.
4. Trigger rollback/redeploy from that deploy.
5. Wait for publish completion.

Validation:

- `curl -I https://www.djforever2026.com`
- Load key routes in browser: home, RSVP, admin.

### 4. Data Safety Check

If data integrity is impacted:

1. Verify latest backup snapshot exists.
2. Follow restore guidance in production readiness checklist.
3. Do not restore without explicit impact confirmation.

## Post-Rollback Validation Checklist

- [ ] Backend health endpoint returns success
- [ ] GraphQL endpoint responds successfully
- [ ] Frontend site loads without major console/network errors
- [ ] QR login path works
- [ ] RSVP read/write flows operate
- [ ] Admin page loads for authorized user

## Communication Template

- Incident: brief summary
- Action: rollback executed (service + target deploy)
- Status: stabilized/monitoring
- Next: root cause analysis and preventive action

## Follow-Up (Within 24 Hours)

1. Open post-incident action items.
2. Link failed deploy and rollback deploy IDs.
3. Update findings register with validation evidence.
