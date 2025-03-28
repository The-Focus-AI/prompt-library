# API Type Generation Process

When working with external APIs, always follow this process:

1. First, download and store actual JSON responses from the API endpoints into a dedicated directory
2. Store these responses with clear naming that indicates:
   - The endpoint called
   - The HTTP method used
   - Any relevant parameters
   - The response status (success/error)
3. Only after having real API responses, create or update TypeScript types to match the actual data structure
4. Use these stored JSON files as reference data for:
   - Type definitions
   - Test fixtures
   - Documentation
   - Schema validation

This ensures that:
- Types accurately reflect real API responses
- We have a historical record of API responses
- Tests use realistic data structures
- We can detect API changes by comparing new responses to stored ones

## Example Directory Structure
```
api-responses/
  buttondown/
    emails/
      GET_emails_success.json
      GET_emails_scheduled_success.json
      POST_email_create_success.json
      PATCH_email_schedule_success.json
    subscribers/
      GET_subscribers_success.json
    analytics/
      GET_analytics_success.json
```

## Type Generation Process
1. Make API calls and store responses
2. Review stored JSON for all possible field values
3. Create TypeScript interfaces matching the actual structure
4. Add JSDoc comments referencing source JSON files
5. Update tests to use real data patterns