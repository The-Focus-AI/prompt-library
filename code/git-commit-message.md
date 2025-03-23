---
description: Generate semantic commit messages following the Conventional Commits specification for code changes
when_to_use:
  - When preparing to commit code changes
  - As part of the code review process to ensure clear commit history
  - When you need to generate a standardized commit message
  - Before finalizing a pull request to ensure clear change documentation
---

Write a commit message based upon the diffs of the code.

Each commit should follow the Conventional Commits specification:

- Format: `<type>(<scope>): <description>`
- Description should be in imperative, present tense
- Include a longer description in the body if needed
- Add BREAKING CHANGE footer if applicable

Available types:

- feat: Introduces a new feature (correlates with MINOR in semantic versioning)
- fix: Patches a bug (correlates with PATCH in semantic versioning)
- docs: Documentation changes (e.g., updates to README or other markdown files)
- style: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- refactor: A code change that neither fixes a bug nor adds a feature
- perf: Improves performance
- test: Adds missing tests or corrects existing tests
- chore: Changes that do not relate to a fix or feature and don't modify src or test files
- build: Changes that affect the build system or external dependencies
- ci: Continuous integration related changes
- revert: Reverts a previous commit

Examples:

```
feat(auth): add user authentication system

- Implement JWT token generation and validation
- Add user login and registration endpoints
- Create middleware for protected routes

BREAKING CHANGE: API now requires authentication token
```

```
fix(parser): resolve date parsing in Safari browsers

Updated the date parsing logic to handle Safari's specific
datetime format requirements. This fixes issue #123.
```

```
docs: update installation guide with Docker setup

- Add Docker installation steps
- Include environment configuration
- Document common troubleshooting steps
```

Please analyze the provided code changes and generate a clear, descriptive commit message following these guidelines.
