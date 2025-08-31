# Prompt Library

A comprehensive prompt library with multiple interfaces: CLI tool, macOS menubar app, MCP server, and PWA. Easily access, copy, and use AI prompts across different platforms and AI tools.

## Interfaces

This prompt library offers four different ways to access your prompts:

1. **🧠 macOS Menubar App** - Quick access with click-to-copy functionality
2. **⌨️ CLI Tool** - Command-line interface for automation and scripting
3. **🔗 MCP Server** - Standardized interface for AI assistants and tools
4. **📱 PWA (Progressive Web App)** - Cross-platform web app for mobile devices

Choose the interface that best fits your workflow!

## Installation

1. Make sure you have the `llm` command line tool installed
2. Clone this repository
3. Make the script executable: `chmod +x run-prompt`

### ZSH Completion

To enable zsh completion for run-prompt:

(update to where you have this installed)

```bash
# Add this to your .zshrc
PROMPT_LIBRARY_PATH="/Users/wschenk/prompt-library"
fpath=($PROMPT_LIBRARY_PATH $fpath)
export PATH="$PROMPT_LIBRARY_PATH:$PATH"
autoload -Uz compinit
compinit
```

## Usage

### macOS Menubar App

The macOS menubar app provides quick access to all your prompts with a simple click-to-copy interface.

**Features:**
- 🧠 Brain icon in the macOS menubar
- 📁 Hierarchical menu organized by categories
- 📋 One-click copy to clipboard with notification
- 🔍 Automatic file monitoring and updates
- ✨ Clean, formatted prompt names

**Quick Start:**
```bash
cd menubar
swift pdfbar.swift --dir ~/prompt-library &
```

**Usage:**
1. Click the brain icon (🧠) in your menubar
2. Navigate through categories (Code, Content, Planning, etc.)
3. Click any prompt name to copy its content to clipboard
4. You'll see a notification confirming the copy
5. Paste anywhere with Cmd+V

For detailed installation instructions and troubleshooting, see [menubar/README.md](menubar/README.md).

### CLI

```bash
run-prompt <prompt_file> <input_file>
```

You can optionally specify a different model using the MODEL environment variable:

```bash
MODEL=claude-3.7-sonnet run-prompt <prompt_file> <input_file>
```

The default model is claude-3.7-sonnet.

### MCP Server

The Model Context Protocol (MCP) server provides a standardized interface for AI assistants to access your prompt library programmatically.

**Features:**
- 🔍 **List Prompts**: Discover all available prompts with descriptions
- 📖 **Load Prompts**: Retrieve the full content of specific prompts
- 💾 **Save Prompts**: Create or update prompts with metadata
- 🏷️ **Metadata Support**: Add descriptions and usage information
- 🔗 **Standardized Interface**: Compatible with MCP-enabled AI tools

**Quick Start:**
```bash
# Start MCP server in STDIO mode
./run-prompt mcp

# Or inspect with MCP Inspector
npx @modelcontextprotocol/inspector uv run run-prompt mcp
```

**Available MCP Tools:**
- `mcp_prompt_library_list_prompts` - List all available prompts
- `mcp_prompt_library_load_prompt` - Load a specific prompt's content  
- `mcp_prompt_library_save_prompt` - Save a new prompt or update existing

**Usage with AI Assistants:**
Configure your AI assistant (Claude Desktop, etc.) to use this MCP server by adding to your MCP configuration file:

```json
{
  "mcpServers": {
    "prompt-library": {
      "command": "uv",
      "args": ["run", "/path/to/prompt-library/run-prompt", "mcp"],
      "cwd": "/path/to/prompt-library"
    }
  }
}
```

**📚 Documentation:**
- [MCP-SERVER.md](MCP-SERVER.md) - Complete MCP server user guide
- [guides/mcp-implementation-guide.md](guides/mcp-implementation-guide.md) - MCP development guide

## Available Prompts

### Content Analysis

- [summarize.md](content/summarize.md) - Generate 5 different two-sentence summaries to encourage readership
- [key-themes.md](content/key-themes.md) - Extract key themes from the input text
- [linkedin.md](content/linkedin.md) - Format content as an engaging LinkedIn post

### Code Review

- [lint.md](code/lint.md) - Assess code quality and suggest improvements
- [git-commit-message.md](code/git-commit-message.md) - Generate semantic commit messages from code diffs

### Repository Analysis

- [architecture-review.md](code/repomix/architecture-review.md) - Review architectural patterns and decisions
- [api-documentation.md](code/repomix/api-documentation.md) - Generate API documentation
- [performance-review.md](code/repomix/performance-review.md) - Analyze performance considerations
- [security-review.md](code/repomix/security-review.md) - Review security implications
- [developer-guide.md](code/repomix/developer-guide.md) - Create developer documentation

## Examples

Summarize a README file:

```bash
./run-prompt content/summarize README.md
```

Extract key themes from a document:

```bash
./run-prompt content/key-themes document.txt
```

Format content for LinkedIn:

```bash
./run-prompt content/linkedin article.txt
```

Generate a commit message:

```bash
./run-prompt code/git-commit-message.md diff.txt
```

Review code quality:

```bash
./run-prompt code/lint.md source_code.py
```

## Adding New Prompts

Add new prompt files to the appropriate directory:

- `content/` - For content analysis and formatting prompts
- `code/` - For code-related prompts
- `code/repomix/` - For repository analysis prompts

The prompt file should contain the instructions/prompt that will be sent to the LLM along with the content of your input file.

# Usage examples

## ollama

```
cat repomix-output.txt | ollama run gemma3:12b "$(cat ~/prompts/code/repomix/developer-guide.md )"
```

llm install llm-ollama

## llm

```bash
MODEL=${MODEL:-claude-3.7-sonnet}

cat repomix-output.txt | \
llm -m $MODEL \
	"$(cat ~/prompts/code/repomix/developer-guide.md )"
```

---

## Prompt Viewer PWA

This repository also includes a Progressive Web App (PWA) for browsing and copying prompts on mobile devices.

### Features

- 📱 Install as a mobile app
- 🔍 Browse all prompts with folder navigation
- 📋 One-click copy to clipboard
- 🌐 Works offline
- 🌓 Auto light/dark mode

### Deployment

The PWA is located in the `pwa/` directory. To deploy it on GitHub Pages:

1. Go to Settings → Pages in your GitHub repository
2. Select "Deploy from a branch"
3. Choose your main branch and `/pwa` folder as the source
4. Save the settings

After a few minutes, your PWA will be available at:
```
https://the-focus-ai.github.io/prompt-library/
```

### Using the PWA

1. Visit the URL on your mobile device
2. You'll see an "Add to Home Screen" prompt (or use browser menu)
3. Once installed, it works like a native app
4. Click refresh to cache all prompts for offline use

For more details, see [pwa/deployment.md](pwa/deployment.md).
