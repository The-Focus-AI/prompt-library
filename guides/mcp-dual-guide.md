I'll analyze the repository thoroughly to extract a comprehensive guide for creating a similar project. I'll focus on the overall architecture, build setup, tools configuration, and key learnings to create a clear specification.

# Model Context Protocol Server Implementation Guide

## Project Overview

This guide outlines how to implement a Model Context Protocol (MCP) server that provides a standardized interface to external APIs. The implementation supports both STDIO and Server-Sent Events (SSE) transport protocols, making it usable from CLI tools and web applications.

## Core Architecture

### 1. Technology Stack

- **Language**: TypeScript (using ES modules)
- **Runtime**: Node.js 18+
- **Package Manager**: pnpm
- **HTTP Server**: Express.js (for SSE transport)
- **Schema Validation**: Zod
- **Testing**: Vitest
- **Authentication**: OAuth2 with JWT validation

### 2. Project Structure

```
src/
├── commands/          # Core command implementations
├── html/              # Static HTML files for web interface
├── lib/               # Shared utilities
├── schemas/           # Zod schemas for validation
├── tools/             # MCP tool implementations
├── types/             # TypeScript interfaces
├── mcp-stdio.ts       # STDIO transport entry point
└── mcp-sse.ts         # SSE transport entry point
scripts/               # Utility scripts
examples/              # Example client implementations
memory/                # Project documentation
tests/                 # Additional test files
```

### 3. Dual Transport Support

The server supports two transport mechanisms:

**STDIO**:
- Command-line interface support
- Synchronous request/response pattern
- Local token storage
- Used for CLI tools and offline applications

**SSE (Server-Sent Events)**:
- Web client support
- Real-time updates capability
- Server-side session management
- Event-based communication

## Implementation Guide

### Step 1: Project Setup

1. Initialize project with TypeScript and ES modules:

```bash
mkdir mcp-server && cd mcp-server
pnpm init
pnpm add -D typescript @types/node ts-node
```

2. Configure TypeScript for ES modules:

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

3. Install core dependencies:

```bash
pnpm add @modelcontextprotocol/sdk express cors zod axios jsonwebtoken dotenv
pnpm add -D @types/express @types/cors @types/jsonwebtoken vitest supertest
```

4. Set up scripts in package.json:

```json
"scripts": {
  "build": "tsc",
  "start:stdio": "node dist/mcp-stdio.js",
  "start:sse": "node dist/mcp-sse.js",
  "dev:stdio": "node --loader ts-node/esm src/mcp-stdio.ts",
  "dev:sse": "node --loader ts-node/esm src/mcp-sse.ts",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

### Step 2: API Response Collection

Before implementing code, you should collect real API responses to ensure type accuracy:

1. Create a script to capture real API responses:

```typescript
// scripts/capture-responses.ts
import axios from "axios";
import fs from "fs/promises";
import path from "path";

async function saveResponse(category: string, endpoint: string, data: any) {
  const dir = path.join(process.cwd(), "api-responses", category);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, `${endpoint}.json`),
    JSON.stringify(data, null, 2)
  );
}

async function captureEndpoint(token: string, category: string, endpoint: string, path: string) {
  try {
    const response = await axios.get(`${BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await saveResponse(category, endpoint, response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      await saveResponse(category, `${endpoint}_error`, error.response.data);
    }
  }
}

// Implement main function to capture all endpoints
```

2. Generate TypeScript types from JSON responses:

```typescript
// scripts/generate-types.ts
import fs from "fs/promises";
import path from "path";
import { compile } from "json-schema-to-typescript";

async function generateSchema(data: any, name: string) {
  // Generate JSON schema from data
}

async function generateTypesForFile(filePath: string, outputDir: string) {
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  const schema = await generateSchema(data, path.basename(filePath, ".json"));
  const typescript = await compile(schema, schema.title);
  await fs.writeFile(path.join(outputDir, `${path.basename(filePath, ".json")}.ts`), typescript);
}
```

### Step 3: Core Server Implementation

1. Create shared server configuration:

```typescript
// src/lib/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function createServer(config: Config) {
  const server = new McpServer({
    name: "your-mcp-server",
    version: "1.0.0",
  });
  
  // Setup tools
  setupAuthTools(server, config);
  setupProfileTools(server, config);
  // Add more tool setups
  
  return server;
}
```

2. Implement STDIO transport:

```typescript
// src/mcp-stdio.ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { config } from "dotenv";
import { createServer } from "./lib/server.js";

// Mark as STDIO mode
(globalThis as any).IS_STDIO = true;

// Load environment variables
config();

async function main() {
  const serverConfig = {
    // Load from environment variables
  };
  
  const server = createServer(serverConfig);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

3. Implement SSE transport:

```typescript
// src/mcp-sse.ts
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { config } from "dotenv";
import { createServer } from "./lib/server.js";

// Keep track of active transports
export const transportMap = new Map<string, SSEServerTransport>();

// Create Express app
const app = express();

// Static files
app.use(express.static("src/html"));

// SSE endpoint
app.get("/sse", async (req, res) => {
  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  
  const config = {
    // Load from environment and request headers
  };
  
  const transport = new SSEServerTransport("/messages", res);
  transportMap.set(transport.sessionId, transport);
  
  // Clean up on connection close
  res.on("close", () => {
    transportMap.delete(transport.sessionId);
  });
  
  await createServer(config).connect(transport);
});

// Message endpoint
app.post("/messages", (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transportMap.get(sessionId);
  
  if (transport) {
    transport.handlePostMessage(req, res);
  } else {
    res.status(404).json({ error: "Session not found" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Step 4: Authentication Implementation

1. Create authentication types:

```typescript
// src/types/auth.ts
import { z } from "zod";

export const LoginRequestSchema = z.object({
  username: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const TokenDataSchema = z.object({
  access_token: z.string(),
  created_at: z.number(),
  expires_in: z.number(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type TokenData = z.infer<typeof TokenDataSchema>;

export interface Config {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  clientToken?: string;
}
```

2. Create token utilities:

```typescript
// src/lib/token-utils.ts
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { TokenData } from "../types/auth.js";

// Define token storage path
const tokenPath = path.join(process.cwd(), "token.json");

export function decodeToken(token: string) {
  try {
    // Remove Bearer prefix if present
    const tokenStr = token.startsWith("Bearer ") ? token.slice(7) : token;
    return jwt.decode(tokenStr);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string | JWTPayload): boolean {
  // Check token expiration
}

export async function saveToken(token: string): Promise<void> {
  await fs.writeFile(tokenPath, JSON.stringify({ access_token: token }, null, 2));
}

export async function loadToken(): Promise<string | null> {
  try {
    const data = await fs.readFile(tokenPath, "utf8");
    return JSON.parse(data).access_token;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw err;
  }
}
```

3. Implement authentication commands:

```typescript
// src/commands/auth.ts
import axios from "axios";
import { LoginParams, TokenData, Config } from "../types/auth.js";
import { loadToken, saveToken } from "../lib/token-utils.js";

export async function login({ email, password, config }: LoginParams): Promise<TokenData> {
  const response = await axios.post<TokenData>(
    `${config.baseUrl}/oauth/token`,
    {
      grant_type: "password",
      username: email,
      password: password,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      scope: "mobile", // Adjust scope as needed
    }
  );

  // For STDIO, save token to file
  if ((globalThis as any).IS_STDIO) {
    await saveToken(response.data.access_token);
  }

  return response.data;
}

export async function logout(): Promise<void> {
  // For STDIO, delete token file
  try {
    await fs.unlink(tokenPath);
  } catch (error) {
    // File might not exist, that's ok
  }
}

export async function session_status(): Promise<TokenData | null> {
  // Implementation
}
```

### Step 5: Tool Implementation

1. Set up tool schemas:

```typescript
// src/schemas/tools.ts
import { z } from "zod";

// Common schema fragments for reuse
export const PaginationSchema = z.object({
  page: z.number().int().min(1).optional()
    .describe("Page number for pagination, starting at 1"),
  per_page: z.number().int().min(1).max(100).optional()
    .describe("Number of items per page, max 100")
});

export const TimeRangeFields = {
  start_time: z.union([
    z.number().int(),
    z.string().transform(str => parseDate(str))
  ]).optional()
    .describe("Start time in yyyy-mm-dd hh:mm format or Unix timestamp"),
  end_time: z.union([
    z.number().int(),
    z.string().transform(str => parseDate(str))
  ]).optional()
    .describe("End time in yyyy-mm-dd hh:mm format or Unix timestamp")
};

// Tool-specific schemas
export const ListItemsSchema = z.object({
  ...PaginationSchema.shape,
  ...TimeRangeFields,
  type: z.enum(["type1", "type2"]).optional()
    .describe("Filter by specific type"),
  // Add more fields as needed
});
```

2. Implement tool registration:

```typescript
// src/tools/some-tools.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Config } from "../types/auth.js";
import axios from "axios";

export function setupSomeTools(server: McpServer, config: Config) {
  server.tool(
    "list_items",
    "List items with filtering and pagination",
    {
      ...PaginationSchema.shape,
      type: z.string().optional().describe("Filter by item type"),
      // Other parameters
    },
    async (params) => {
      try {
        const response = await axios.get(`${config.baseUrl}/api/items`, {
          headers: {
            Authorization: `Bearer ${config.clientToken}`,
          },
          params: {
            page: params.page || 1,
            per_page: params.per_page || 20,
            type: params.type,
            // Other parameters
          },
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to list items: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
        };
      }
    }
  );

  // Register more tools
}
```

### Step 6: Testing Setup

1. Configure Vitest:

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.d.ts"],
    },
    testTimeout: 10000,
  },
});
```

2. Create tests for tools:

```typescript
// src/tools/some-tools.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { setupSomeTools } from "./some-tools.js";

// Mock axios
vi.mock("axios");

describe("Some Tools", () => {
  // Setup test environment
  
  describe("list_items", () => {
    it("should fetch and return items", async () => {
      // Setup mock response
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse });
      
      // Call tool
      const result = await server.handleRequest({
        type: "function_call",
        name: "list_items",
        arguments: { type: "test" }
      });
      
      // Verify axios was called with correct parameters
      expect(axios.get).toHaveBeenCalledWith(
        `${config.baseUrl}/api/items`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${config.clientToken}` },
          params: { page: 1, per_page: 20, type: "test" }
        })
      );
      
      // Verify result
      expect(JSON.parse(result.content[0].text)).toEqual(mockResponse);
    });
    
    it("should handle errors gracefully", async () => {
      // Setup mock error
      const error = new Error("API Error");
      vi.mocked(axios.get).mockRejectedValueOnce(error);
      
      // Call tool
      const result = await server.handleRequest({
        type: "function_call",
        name: "list_items",
        arguments: { type: "test" }
      });
      
      // Verify error handling
      expect(result.content[0].text).toBe("Failed to list items: API Error");
    });
  });
});
```

3. Create integration tests:

```typescript
// src/mcp-sse.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import express, { Express } from "express";
import { Server } from "http";
import { transportMap } from "./mcp-sse.js";

describe("SSE Server Integration", () => {
  let app: Express;
  let server: Server;
  
  beforeAll(() => {
    // Setup test server
  });
  
  afterAll(() => {
    // Clean up server
    server.close();
  });
  
  describe("SSE Endpoint", () => {
    it("should accept SSE connections", async () => {
      const response = await request(app).get("/sse");
      expect(response.status).toBe(200);
      expect(response.get("Content-Type")).toContain("text/event-stream");
    });
  });
  
  // More tests
});
```

### Step 7: CLI Client Implementation

Create an example CLI client that interacts with the MCP server:

```typescript
// examples/cli.js
#!/usr/bin/env node
import { Command } from "commander";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import fs from "fs/promises";
import path from "path";

const program = new Command();
const tokenPath = path.join(process.cwd(), "token.json");
const SERVER_URL = "http://localhost:3000";

// Load token
async function loadToken() {
  try {
    const data = await fs.readFile(tokenPath, "utf8");
    return JSON.parse(data).access_token;
  } catch (err) {
    if (err.code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

// Create MCP client
async function createMcpClient() {
  const token = await loadToken();
  if (!token) {
    throw new Error("No token found. Please login first.");
  }
  
  const transport = new SSEClientTransport(
    new URL(`${SERVER_URL}/sse`),
    {
      authProvider: {
        tokens: () => ({ access_token: token }),
      },
    }
  );
  
  return new Client(transport);
}

// Define commands
program
  .name("mcp-cli")
  .description("CLI client for MCP server")
  .version("1.0.0");

program
  .command("login")
  .description("Login to the MCP server")
  .argument("<username>", "username for authentication")
  .argument("<password>", "password for authentication")
  .action(async (username, password) => {
    try {
      // Implementation
    } catch (err) {
      console.error("Login failed:", err);
      process.exit(1);
    }
  });

program
  .command("list-tools")
  .description("List available MCP tools")
  .action(async () => {
    try {
      const client = await createMcpClient();
      const tools = await client.listTools();
      
      console.log("\nAvailable Tools:");
      for (const tool of tools.tools) {
        console.log(`\n${tool.name}`);
        console.log(tool.description);
      }
      
      await client.close();
    } catch (err) {
      console.error("Failed to list tools:", err);
      process.exit(1);
    }
  });

// Parse arguments
program.parse();
```

## Key Lessons and Best Practices

1. **Always capture real API responses before implementation**
   - Collect actual API responses to understand structure and edge cases
   - Generate TypeScript types from real responses
   - Capture both success and error responses
   - Document rate limits and throttling behavior

2. **Use Zod for runtime validation**
   - Create reusable schema fragments
   - Add descriptive error messages
   - Add proper documentation to each field
   - Use refinements for complex validations

3. **Handle authentication securely**
   - Store tokens securely
   - Implement proper token validation
   - Handle token expiration
   - Add refresh token mechanism

4. **Implement comprehensive error handling**
   - Use try/catch in all async functions
   - Provide descriptive error messages
   - Include original error details when appropriate
   - Add debug logging for troubleshooting

5. **Test thoroughly**
   - Mock external dependencies
   - Test happy and error paths
   - Add integration tests
   - Use proper test cleanup

6. **Use proper ESM imports with file extensions**
   - Always include .js extension in imports (even for TypeScript files)
   - Use proper module resolution in tsconfig.json
   - Ensure compatibility with Node.js ES modules

7. **Implement proper connection cleanup**
   - Track active connections
   - Clean up on connection close
   - Handle connection errors
   - Monitor connection health

8. **Structure documentation effectively**
   - Document project goals and architecture
   - Track progress and lessons learned
   - Document API endpoints and schemas
   - Include usage examples

9. **Add visualization for complex data**
   - Use ASCII charts for numeric data
   - Add emoji formatting for better visual organization
   - Implement standardized output formatting
   - Consider color output for terminal displays

10. **Port configuration and error handling**
    - Handle port conflicts gracefully
    - Provide clear error messages
    - Suggest alternative ports when needed
    - Add proper shutdown hooks

## Environment Configuration

Create a `.env` file with necessary configuration:

```
# Server Configuration
PORT=3000

# API Configuration
API_BASE_URL=https://api.example.com
API_CLIENT_ID=your_client_id
API_CLIENT_SECRET=your_client_secret

# Debug Configuration
DEBUG=false
```

## Deployment

1. **Docker Setup**

Create a Dockerfile:

```dockerfile
FROM node:18-slim

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

COPY dist/ ./dist/
COPY src/html/ ./dist/html/

EXPOSE 3000
CMD ["node", "dist/mcp-sse.js"]
```

2. **CI/CD with GitHub Actions**

Create a GitHub workflow:

```yaml
name: Deploy
on:
  push:
    branches:
      - main
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm run build
      - run: pnpm run test
      # Add deployment steps
```

## Conclusion

This guide provides a comprehensive framework for implementing a Model Context Protocol server with both STDIO and SSE transports. By following these patterns and best practices, you can create a robust and maintainable MCP server that integrates with external APIs and provides a standardized interface for various client applications.

The key to success is thorough preparation (collecting real API responses), strong typing, comprehensive testing, and proper error handling. By adhering to these principles, you'll create a reliable service that's easy to maintain and extend.