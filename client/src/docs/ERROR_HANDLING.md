# Error Handling and Logging Guide

This project uses a comprehensive error reporting and logging system to track and handle errors
effectively in both development and production environments.

## Overview

The error handling system consists of two main components:

1. **Logger Utility** (`utils/logger.ts`) - Structured logging with environment-aware levels
2. **Error Reporting Service** (`services/errorReportingService.ts`) - Comprehensive error tracking
   with context

## Quick Start

### Basic Error Reporting

```typescript
import { reportError } from '../services/errorReportingService';

try {
  // Your code here
} catch (error) {
  reportError(error as Error, {
    component: 'MyComponent',
    action: 'user_action',
  });
  throw error; // Re-throw if needed
}
```

### GraphQL Error Reporting

```typescript
import { reportGraphQLError } from '../services/errorReportingService';

try {
  const result = await myMutation({ variables });
} catch (error) {
  reportGraphQLError(error, 'myMutation', variables);
  throw error;
}
```

### Component Error Boundaries

```typescript
import ErrorBoundary from '../components/ErrorBoundary';

function MyPage() {
  return (
    <ErrorBoundary componentName="MyPage">
      <MyComponent />
    </ErrorBoundary>
  );
}
```

## Error Reporting Functions

### `reportError(error, context)`

- **Purpose**: Report general errors with context
- **Use for**: Try-catch blocks, async operation failures
- **Example**:

```typescript
reportError(new Error('Operation failed'), {
  component: 'UserProfile',
  action: 'save_settings',
  userId: user.id,
});
```

### `reportGraphQLError(error, operation, variables)`

- **Purpose**: Report GraphQL-specific errors
- **Use for**: Apollo Client mutations and queries
- **Automatically includes**: GraphQL errors, network errors, operation context

### `reportNetworkError(error, url, method)`

- **Purpose**: Report network/HTTP errors
- **Use for**: Fetch requests, API calls outside GraphQL
- **Example**:

```typescript
reportNetworkError(new Error('Request failed'), '/api/upload', 'POST');
```

### `reportComponentError(error, errorInfo, componentName)`

- **Purpose**: Report React component errors
- **Use for**: Error Boundaries (automatically handled by ErrorBoundary component)

### `reportAsyncError(error, operation, context)`

- **Purpose**: Report async operation failures
- **Use for**: Background tasks, service worker operations

## Context Information

All error reports include automatic context:

- Session ID
- Current URL
- User agent
- Viewport size
- Network connection info (when available)
- Timestamp

### Custom Context

Add specific context for better debugging:

```typescript
reportError(error, {
  component: 'PhotoUpload',
  action: 'compress_image',
  fileSize: file.size,
  fileName: file.name,
  compressionLevel: 0.8,
  // Add any relevant data
});
```

## Logging Levels

The logger supports four levels:

### `logError(message, context, data)`

- **Visible**: Always (production and development)
- **Use for**: Critical errors that need immediate attention

### `logWarn(message, context, data)`

- **Visible**: Production and development
- **Use for**: Important issues that should be monitored

### `logInfo(message, context, data)`

- **Visible**: Development only
- **Use for**: General information, successful operations

### `logDebug(message, context, data)`

- **Visible**: Development only
- **Use for**: Detailed debugging information

## Best Practices

### 1. Always Provide Context

```typescript
// ❌ Poor
reportError(error);

// ✅ Good
reportError(error, {
  component: 'RSVPForm',
  action: 'submit_rsvp',
  formData: { ...sanitizedData },
});
```

### 2. Use Specific Error Types

```typescript
// ❌ Generic
reportError(error, { component: 'API' });

// ✅ Specific
reportGraphQLError(error, 'createRSVP', variables);
```

### 3. Sanitize Sensitive Data

```typescript
// ❌ Sensitive data
reportError(error, { password: userPassword });

// ✅ Sanitized
reportError(error, {
  hasPassword: !!userPassword,
  passwordLength: userPassword.length,
});
```

### 4. Re-throw When Appropriate

```typescript
try {
  await criticalOperation();
} catch (error) {
  reportError(error, { component: 'CriticalComponent' });
  throw error; // Let caller handle the error too
}
```

### 5. Use Error Boundaries for Components

```typescript
// Wrap error-prone components
<ErrorBoundary componentName="PhotoGallery">
  <PhotoGallery photos={photos} />
</ErrorBoundary>
```

## Development vs Production

### Development

- All log levels visible in console
- Errors stored in localStorage
- Error details shown in UI (Error Boundary fallbacks)

### Production

- Only errors and warnings in console
- Errors ready for external service integration
- User-friendly error messages
- Automatic error fingerprinting for grouping

## External Service Integration

The error reporting service is designed to integrate with external services:

```typescript
// In errorReportingService.ts - sendToExternalServices method
// Add your preferred service:

// Sentry
Sentry.captureException(report.error, {
  contexts: { custom: report.context },
});

// LogRocket
LogRocket.captureException(report.error);

// Bugsnag
Bugsnag.notify(report.error, { context: report.context });
```

## Debugging

### View Stored Errors

```typescript
import { errorReporting } from '../services/errorReportingService';

// Get all stored error reports
const reports = errorReporting.getStoredReports();

// Get session info
const session = errorReporting.getSessionInfo();

// Clear stored reports
errorReporting.clearStoredReports();
```

### View Stored Logs

```typescript
import { logger } from '../utils/logger';

// Get stored error logs
const logs = logger.getStoredLogs();

// Clear stored logs
logger.clearStoredLogs();
```

## Migration from console.error

### Before

```typescript
try {
  await operation();
} catch (error) {
  console.error('Operation failed:', error);
}
```

### After

```typescript
try {
  await operation();
} catch (error) {
  reportError(error as Error, {
    component: 'MyComponent',
    action: 'operation_name',
  });
}
```

## Common Patterns

### API Error Handling

```typescript
const handleApiError = (error: Error, endpoint: string) => {
  if (error.name === 'NetworkError') {
    reportNetworkError(error, endpoint);
  } else {
    reportError(error, {
      component: 'API',
      action: endpoint,
    });
  }
};
```

### Form Submission Errors

```typescript
const handleFormError = (error: Error, formType: string, formData: any) => {
  reportError(error, {
    component: 'Form',
    action: `submit_${formType}`,
    formData: sanitizeFormData(formData),
  });
};
```

### Service Worker Errors

```typescript
const handleServiceWorkerError = (error: Error, operation: string) => {
  reportAsyncError(error, operation, {
    component: 'ServiceWorker',
    isOffline: !navigator.onLine,
  });
};
```

This error handling system provides comprehensive tracking while maintaining good performance and
user experience.
