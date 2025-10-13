# RSVP Test Suite

This document describes the comprehensive test suite for RSVP validation functionality, covering all the scenarios that were debugged and fixed.

## 🎯 Test Coverage

The test suite validates the following critical RSVP scenarios:

### Server-Side Tests (`server/tests/rsvp.e2e.test.ts`)

- ✅ **Legacy RSVP submission** with `submitRSVP` mutation
- ✅ **Modern RSVP creation** with `createRSVP` mutation
- ✅ **Attending RSVPs** requiring guest names and meal preferences
- ✅ **Non-attending RSVPs** allowing empty guest details
- ✅ **Maybe RSVPs** allowing empty guest details
- ✅ **RSVP editing** from attending to non-attending
- ✅ **Validation edge cases** (invalid meal preferences, long notes)

### Client-Side Tests (`client/tests/RSVPForm.e2e.test.tsx`)

- ✅ **Form rendering** and user interactions
- ✅ **Attendance selection** (Yes/No/Maybe) with conditional fields
- ✅ **Mobile touch interactions** and rapid click handling
- ✅ **Form validation** based on attendance status
- ✅ **State management** when switching between attendance options
- ✅ **Required field validation** for attending vs non-attending guests

### GraphQL Integration Tests (`debug-rsvp-graphql.js`)

- ✅ **Authentication** via QR token
- ✅ **Direct GraphQL mutations** bypassing frontend
- ✅ **Error message validation** with detailed GraphQL paths
- ✅ **Schema validation** ensuring input compatibility

## 🚀 Running Tests

### Run All RSVP Tests

```bash
npm run test:rsvp
```

This runs the comprehensive test suite script that:

1. Checks if the server is running
2. Runs server-side E2E tests
3. Runs client-side E2E tests
4. Runs GraphQL integration tests
5. Provides a detailed summary

### Run Individual Test Suites

#### Server-side only:

```bash
npm run test:rsvp:server
```

#### Client-side only:

```bash
npm run test:rsvp:client
```

#### GraphQL integration only:

```bash
npm run test:rsvp:graphql
```

#### All tests (server + client):

```bash
npm test
```

## 🔧 Test Setup

### Prerequisites

- MongoDB running locally
- Node.js and npm installed
- Development server running on port 3001

### Test Data

Tests use isolated test users with unique QR tokens to avoid conflicts. Each test scenario:

- Creates fresh test users
- Cleans up existing RSVPs
- Uses proper authentication
- Validates against exact GraphQL schemas

## 🐛 Debugging Failed Tests

### Common Issues

#### Authentication Failures

- Verify QR tokens are valid in the database
- Check JWT token generation
- Ensure `loginWithQrToken` mutation works

#### Validation Errors

- Check if schema changes match test expectations
- Verify required fields are properly validated
- Ensure conditional validation (attending vs non-attending) works

#### GraphQL Errors

- Use GraphQL playground at `http://localhost:3001/graphql`
- Check mutation input types match server expectations
- Verify error messages include proper paths and extensions

### Debug Commands

Check server status:

```bash
lsof -i :3001
```

View database users:

```bash
echo 'db.users.find({}, {firstName: 1, lastName: 1, qrToken: 1, isInvited: 1}).limit(5)' | mongosh djforever2_dev --quiet
```

Test GraphQL directly:

```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __schema { queryType { name } } }"}'
```

## 📋 Test Scenarios Covered

### ✅ Fixed Issues

1. **QR Token Validation** - Alphanumeric tokens vs ObjectId format
2. **User Permissions** - `isInvited` field validation
3. **Non-Attending Validation** - No name/meal requirements
4. **Maybe Validation** - No name/meal requirements
5. **Mobile Touch Events** - Proper radio button handling
6. **GraphQL Type Mismatch** - `CreateRSVPInput` vs `RSVPInput`
7. **Mongoose Schema Validation** - Conditional required fields
8. **Server Validation Logic** - Attendance-based validation

### 🎯 Edge Cases

- Empty guest details for non-attending
- Invalid meal preferences
- Very long additional notes (500+ chars)
- Rapid mobile touch interactions
- Form state changes between attendance options
- Authentication token handling

## 🔄 Continuous Integration

These tests should be run:

- ✅ Before committing changes to RSVP functionality
- ✅ In CI/CD pipeline before deployment
- ✅ When modifying GraphQL schemas
- ✅ When updating validation logic
- ✅ When fixing mobile/frontend issues

## 🎉 Success Criteria

All tests passing indicates:

- ✅ All RSVP submission scenarios work correctly
- ✅ Validation logic properly handles attending vs non-attending
- ✅ Mobile interactions work smoothly
- ✅ GraphQL API matches frontend expectations
- ✅ No regression in previously fixed issues
