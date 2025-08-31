# MCP Server for Prompt Library

This document provides comprehensive documentation for the Model Context Protocol (MCP) server built into the prompt library.

## Overview

The MCP server provides a standardized interface for AI assistants and tools to programmatically access your prompt library. It supports listing, loading, and saving prompts with full metadata support.

## Features

- 🔍 **Discover Prompts**: List all available prompts with descriptions and metadata
- 📖 **Load Content**: Retrieve the full content of any prompt
- 💾 **Save & Update**: Create new prompts or update existing ones
- 🏷️ **Rich Metadata**: Support for descriptions and usage information
- 🔗 **Standard Protocol**: Compatible with any MCP-enabled application
- 📁 **Auto-Discovery**: Automatically scans directory structure for prompts

## Quick Start

### Starting the Server

```bash
# Start MCP server (STDIO mode for most AI assistants)
./run-prompt mcp
```

### Using with MCP Inspector

For development and testing:

```bash
# Install MCP Inspector (if not already installed)
npm install -g @modelcontextprotocol/inspector

# Launch inspector with the server
npx @modelcontextprotocol/inspector uv run run-prompt mcp
```

## AI Assistant Configuration

### Claude Desktop

Add to your Claude Desktop MCP configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "prompt-library": {
      "command": "uv",
      "args": ["run", "/path/to/your/prompt-library/run-prompt", "mcp"],
      "cwd": "/path/to/your/prompt-library"
    }
  }
}
```

### Other MCP-Compatible Tools

The server works with any MCP-compatible application. Check your specific tool's documentation for configuration details.

## Available Tools

### `mcp_prompt_library_list_prompts`

Lists all available prompts in your library.

**Parameters:** None

**Returns:** Formatted list of prompts organized by category, including:
- Prompt names (hyphenated format for easy reference)
- Descriptions (if available in metadata)
- Usage scenarios (if specified in metadata)

**Example output:**
```
Available prompts:

- code-lint
  Description: Assess code quality and suggest improvements
  When to use:
    - Before committing code
    - During code reviews
    - When refactoring

- content-summarize
  Description: Generate 5 different two-sentence summaries
  When to use:
    - For blog posts and articles
    - Creating social media content
```

### `mcp_prompt_library_load_prompt`

Loads the complete content of a specific prompt.

**Parameters:**
- `prompt_name` (string): The prompt to load. Can be specified as:
  - Hyphenated format: `content-summarize`, `code-lint`
  - Path format: `content/summarize`, `code/lint`
  - Just the filename: `summarize`, `lint`

**Returns:** Full prompt content including any YAML front matter

**Example usage:**
```typescript
// Load a prompt by hyphenated name
await loadPrompt("content-summarize");

// Load by path
await loadPrompt("content/summarize");

// Load by filename (searches all directories)
await loadPrompt("summarize");
```

### `mcp_prompt_library_save_prompt`

Creates a new prompt or updates an existing one.

**Parameters:**
- `section` (string, required): Category/directory (lowercase, hyphens only)
- `title` (string, required): Prompt filename without .md (lowercase, hyphens only)
- `body` (string, required): The prompt content
- `description` (string, optional): Brief description of the prompt's purpose
- `when_to_use` (array, optional): List of usage scenarios

**Returns:** Confirmation message with file path

**Example usage:**
```typescript
await savePrompt({
  section: "content",
  title: "blog-intro",
  body: "Write an engaging introduction for a blog post about:\n\n{{TOPIC}}\n\nMake it compelling and hook the reader immediately.",
  description: "Creates engaging blog post introductions",
  when_to_use: [
    "Starting a new blog post",
    "Improving existing introductions",
    "Creating content marketing materials"
  ]
});
```

## Prompt Organization

The MCP server automatically discovers prompts based on your directory structure:

```
prompt-library/
├── code/                    # → "code" section
│   ├── lint.md             # → "code-lint" 
│   ├── git-commit-message.md # → "code-git-commit-message"
│   └── repomix/            # → "code-repomix" section
│       └── security-review.md # → "code-repomix-security-review"
├── content/                # → "content" section
│   ├── summarize.md        # → "content-summarize"
│   └── key-themes.md       # → "content-key-themes"
└── planning/               # → "planning" section
    └── project-brief.md    # → "planning-project-brief"
```

## Metadata Format

Prompts can include YAML front matter for enhanced metadata:

```markdown
---
description: "Generate semantic commit messages from code diffs"
when_to_use:
  - "Before committing changes"
  - "During code reviews"
  - "When writing release notes"
---

# Your prompt content here
Analyze the following code diff and generate a semantic commit message...
```

## Error Handling

The server provides clear error messages for common issues:

- **Prompt not found**: `Error: Unable to find prompt file: prompt-name`
- **Invalid section/title**: `Error: Section must be lowercase letters, numbers, and hyphens only`
- **File access errors**: Descriptive messages about permission or path issues

## Development and Testing

### Local Testing with Inspector

1. Start the MCP Inspector:
   ```bash
   npx @modelcontextprotocol/inspector uv run run-prompt mcp
   ```

2. Open your browser to the provided URL (usually http://localhost:3000)

3. Test the available tools:
   - List all prompts
   - Load specific prompts
   - Save new prompts

### Debugging

Enable debug mode by setting environment variable:
```bash
DEBUG=1 ./run-prompt mcp
```

This will show detailed logging to stderr, including:
- Prompt file discovery process
- Tool registration
- Request handling

## Integration Examples

### With AI Assistants

Once configured, you can use natural language with your AI assistant:

```
"List all available prompts in my library"
"Load the content of the code-lint prompt"
"Save a new prompt for writing email subject lines"
```

### Programmatic Usage

For custom applications, use the MCP SDK:

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "uv",
  args: ["run", "/path/to/prompt-library/run-prompt", "mcp"]
});

const client = new Client(transport);

// List available prompts
const prompts = await client.callTool("mcp_prompt_library_list_prompts", {});
console.log(prompts.content[0].text);

// Load a specific prompt
const prompt = await client.callTool("mcp_prompt_library_load_prompt", {
  prompt_name: "content-summarize"
});
console.log(prompt.content[0].text);
```

## Security Considerations

- The MCP server only accesses files within the prompt library directory
- No network access or external API calls are made
- File operations are limited to reading and writing `.md` files
- All file paths are validated to prevent directory traversal

## Troubleshooting

### Common Issues

**"Command not found: uv"**
- Install uv: `curl -LsSf https://astral.sh/uv/install.sh | sh`

**"Permission denied"**
- Ensure the run-prompt script is executable: `chmod +x run-prompt`
- Check file permissions in the prompt library directory

**"No prompts found"**
- Verify `.md` files exist in subdirectories
- Check that directory names don't start with `.` (hidden directories are ignored)
- Ensure files are readable

**MCP Server not responding**
- Check that the server starts without errors: `./run-prompt mcp --debug`
- Verify the working directory is correct
- Check for conflicting processes

### Getting Help

1. Check the debug output with `DEBUG=1 ./run-prompt mcp`
2. Test with MCP Inspector for detailed diagnostics
3. Verify prompt file structure and permissions
4. Check the main README.md for general setup issues

## Advanced Usage

### Custom Directory Structure

Set a custom prompt library path:
```bash
PROMPT_LIBRARY_PATH=/path/to/custom/prompts ./run-prompt mcp
```

### Integration with Build Systems

Include the MCP server in your development workflow:

```bash
# In package.json
{
  "scripts": {
    "mcp:start": "uv run run-prompt mcp",
    "mcp:inspect": "npx @modelcontextprotocol/inspector uv run run-prompt mcp"
  }
}
```

### Automation

Use the MCP server in automated workflows:
```bash
#!/bin/bash
# Start MCP server in background
./run-prompt mcp &
MCP_PID=$!

# Your automation script here
# ...

# Clean up
kill $MCP_PID
```

This comprehensive MCP server enables seamless integration of your prompt library with AI assistants and custom applications, providing a standardized, reliable interface for prompt management and usage.