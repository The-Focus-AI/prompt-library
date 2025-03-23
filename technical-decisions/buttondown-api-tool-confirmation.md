- Date: 2024-03-26
  Category: API Tool Usage
  Content: When using Buttondown API tools that modify state (create_draft, schedule_draft), these should only be called after explicit user confirmation
  Context: This ensures users have full control over when drafts are created or scheduled, preventing accidental state changes
  
Implementation Guidelines:
1. For create_draft:
   - Tool should only be called after user explicitly confirms content and title
   - Confirmation should show preview of what will be created
   - Default to draft status for safety

2. For schedule_draft:
   - Tool should only be called after user confirms scheduling details
   - Show preview of scheduling time in user's local timezone
   - Validate ISO 8601 datetime format before proceeding
   - Confirm the draft exists and is in draft status

3. Error Handling:
   - Clear error messages if confirmation is missing
   - Validation of all parameters before API calls
   - Rollback capability if operation fails mid-way

4. Documentation:
   - Clear examples of confirmation flow
   - Warning about state modification
   - Best practices for confirmation UX