# MCP Server Implementation Guide

## 1. Project Setup

### Base Configuration

```json
{
  "name": "your-mcp-server",
  "version": "1.0.0",
  "type": "module", // Use ES modules
  "bin": {
    "your-stdio": "./dist/mcp-stdio.js",
    "your-sse": "./dist/mcp-sse.js"
  }
}
```

### Required Dependencies

- Core: `@modelcontextprotocol/sdk` (^1.7.0 or later)
- For SSE server:
  - `express` (^4.18.2 or later)
  - `cors` (^2.8.5 or later)
- For validation: `zod` (^3.22.4 or later)

### Development Dependencies

```json
{
  "@types/express": "^4.17.21",
  "@types/node": "^20.11.0",
  "tsx": "^4.7.1",
  "typescript": "^5.3.3"
}
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"]
}
```

## 2. Project Structure

```
src/
├── mcp-stdio.ts    # STDIO server implementation
├── mcp-sse.ts      # SSE server implementation
└── service.ts      # Core service implementation
dist/               # Compiled JavaScript
package.json
tsconfig.json
```

## 3. Implementation Guidelines

### 3.1 Core Server Setup

Create a base server instance that can be shared between STDIO and SSE:

```typescript
const server = new McpServer({
  name: "your-service",
  version: "1.0.0",
});
```

### 3.2 Tool Implementation

1. Define interfaces for your data structures
2. Implement helper functions for external API calls
3. Register tools using the server.tool() method with:
   - Unique name
   - Description
   - Zod schema for parameters
   - Async handler function

Example structure:

```typescript
export function setupTools(server: McpServer) {
  server.tool(
    "tool-name",
    "Tool description",
    {
      param1: z.string().describe("Parameter description"),
      param2: z.number().describe("Parameter description"),
    },
    async ({ param1, param2 }) => {
      // Implementation
      return {
        content: [
          {
            type: "text",
            text: "Response",
          },
        ],
      };
    }
  );
}
```

### 3.3 STDIO Implementation (mcp-stdio.ts)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

### 3.4 SSE Implementation (mcp-sse.ts)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";

function createSSEServer(mcpServer: McpServer) {
  const app = express();
  const transportMap = new Map<string, SSEServerTransport>();

  app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport("/messages", res);
    transportMap.set(transport.sessionId, transport);
    await mcpServer.connect(transport);
  });

  app.post("/messages", (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transportMap.get(sessionId);
    if (transport) {
      transport.handlePostMessage(req, res);
    }
  });

  return app;
}
```

## 4. Scripts Configuration

Add these scripts to package.json:

```json
{
  "scripts": {
    "build": "tsc",
    "start:stdio": "node dist/mcp-stdio.js",
    "start:sse": "node dist/mcp-sse.js",
    "dev:stdio": "tsx src/mcp-stdio.ts",
    "dev:sse": "tsx src/mcp-sse.ts",
    "inspect:stdio": "npx @modelcontextprotocol/inspector node dist/mcp-stdio.js",
    "inspect:sse": "npx @modelcontextprotocol/inspector node dist/mcp-sse.js"
  }
}
```

## 5. Best Practices

1. **Error Handling**

   - Implement comprehensive error handling for external API calls
   - Return meaningful error messages to clients
   - Log errors appropriately

2. **Type Safety**

   - Use TypeScript interfaces for all data structures
   - Implement Zod schemas for parameter validation
   - Maintain strict TypeScript configuration

3. **Response Format**

   - Support multiple output formats (e.g., text and JSON)
   - Provide consistent response structures
   - Include appropriate content types

4. **Transport Management**

   - Maintain clean session management for SSE
   - Handle connection cleanup properly
   - Implement proper error handling for transport issues

5. **Development Workflow**
   - Use development scripts with `tsx` for quick iterations
   - Implement inspection capabilities for debugging
   - Maintain separate production and development configurations

## 6. Testing

1. Use the MCP Inspector for manual testing:

```bash
npx @modelcontextprotocol/inspector node dist/mcp-stdio.js
```

2. Test both transport methods:
   - STDIO for CLI usage
   - SSE for web integration

This specification provides a solid foundation for building MCP servers that can run both locally via STDIO and over the web via SSE. The implementation is type-safe, maintainable, and follows modern JavaScript/TypeScript practices.

## Lessons learned

# Lessons Learned

## Project Structure and Organization

[2024-03-26 21:34] Project Structure: Organizing project with memory-bank directory for documentation → Created dedicated files for different aspects (project-brief.md, active-context.md, etc.) → Why: Essential for maintaining clear project context and progress tracking across multiple aspects of development.

[2024-03-26 21:34] Documentation Strategy: Need for comprehensive documentation across different areas → Implemented separate files for technical context, active work, and progress → Why: Helps maintain clear separation of concerns and makes it easier to track different aspects of the project.

## Technical Implementation

[2024-03-26 21:34] API Integration: Issue: Initial API integration lacked proper type definitions → Fix: Generated types based on actual API responses stored in api-responses directory → Why: Ensures type definitions match real API behavior and prevents runtime type mismatches.

[2024-03-26 21:34] Authentication: Challenge with secure API key management → Solution: Implemented 1Password integration for API key storage → Why: Critical for maintaining security best practices and preventing accidental exposure of credentials.

[2024-03-26 21:34] MCP Tools: Initial tool implementations lacked proper validation → Added Zod schemas for parameter validation and improved error handling → Why: Essential for providing clear feedback and preventing invalid API calls.

## Development Process

[2024-03-26 21:34] Testing Strategy: Need for comprehensive testing across different layers → Implemented unit tests, CLI command tests, and planned MCP server tests → Why: Ensures reliability and catches issues early in development.

[2024-03-26 21:34] Package Management: Decision to use pnpm as package manager → Implemented workspace setup with pnpm → Why: Provides better dependency management and disk space efficiency.

## Error Handling and Edge Cases

[2024-03-26 21:34] Error Handling: Initial error messages weren't user-friendly → Improved error handling with descriptive messages → Why: Better user experience and easier debugging.

[2024-03-26 21:34] API Key Validation: Initial implementation checked API key too frequently → Optimized to check only during command execution → Why: Improves performance and user experience.

## Documentation and User Experience

[2024-03-26 21:34] Tool Documentation: Initial tool descriptions lacked clarity → Added comprehensive descriptions and parameter documentation → Why: Essential for users to understand tool capabilities and requirements.

[2024-03-26 21:34] Progress Tracking: Need for clear progress indicators → Added status markers [X], [-], [ ], [!], [?] → Why: Provides clear visual indication of task status and progress.

## Integration and Testing

[2024-03-26 21:34] Integration Testing: Need for thorough testing of MCP server → Planned comprehensive test suite including unit and integration tests → Why: Ensures reliability and proper functionality of all components.

[2024-03-26 21:34] Email Scheduling: Complex edge cases in email scheduling → Implemented proper validation and error handling → Why: Prevents invalid scheduling attempts and provides clear feedback.

## Security and Best Practices

[2024-03-26 21:34] Security: Need for secure credential handling → Implemented 1Password integration and never store API key in code → Why: Critical for maintaining security and preventing credential exposure.

[2024-03-26 21:34] Input Validation: Need for thorough parameter validation → Implemented Zod schemas for all tool parameters → Why: Prevents invalid input and provides clear error messages.

## Future Considerations

[2024-03-26 21:34] Rate Limiting: Need to handle API rate limits → Planned implementation of rate limiting handling → Why: Prevents API abuse and ensures reliable operation.

[2024-03-26 21:34] Progress Indicators: Need for better progress feedback → Planned implementation of progress indicators → Why: Improves user experience during long-running operations.

## Deployment and Maintenance

[2024-03-26 21:34] CI/CD Setup: Need for automated testing and deployment → Planned implementation of CI/CD pipeline → Why: Ensures consistent testing and deployment process.

[2024-03-26 21:34] Documentation Maintenance: Need for keeping documentation up-to-date → Created structured documentation system → Why: Ensures documentation remains useful and accurate.
