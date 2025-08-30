# Prompt Library Development Instructions

**ALWAYS follow these instructions first.** Only search for additional context or run exploratory commands if the information here is incomplete or found to be incorrect.

## Repository Overview

This is a Python-based prompt library with CLI tooling and PWA interface. The repository contains curated prompts for content analysis, code review, and development workflows, served through multiple interfaces:

- **CLI Tool**: `run-prompt` script for executing prompts via LLM APIs
- **MCP Server**: Model Context Protocol server for AI assistant integration  
- **PWA**: Progressive Web App for mobile/offline prompt browsing
- **Organized Library**: Structured prompt collection in markdown files

## Prerequisites and Setup

### System Requirements
- **Python 3.12+** (required for the run-prompt script)
- **Internet access** for LLM API calls (when using external providers)

### Essential Dependencies Installation
Run these commands in order. **NEVER CANCEL** - dependency installation takes 2-3 minutes:

```bash
# Install core Python dependencies (takes 2-3 minutes)
pip3 install --user click PyYAML fastmcp
```

**TIMEOUT WARNING**: Set timeouts to 5+ minutes for dependency installation. Installation of fastmcp and its dependencies can take up to 3 minutes on slower connections.

### Repository Setup
```bash
# Make the run-prompt script executable
chmod +x run-prompt

# Verify installation
python3 run-prompt --help
```

## Core Functionality Testing

### Test CLI Tool (Essential Validation)
```bash
# Test basic functionality - should show help in < 1 second
python3 run-prompt --help

# Test MCP server startup - takes 3-5 seconds to initialize
# NEVER CANCEL - let it run for at least 10 seconds
python3 run-prompt mcp &
sleep 5
kill %1  # Stop the background process
```

### Test PWA (Web Interface)
```bash
# Start PWA development server - takes 2-3 seconds
cd pwa
python3 -m http.server 8000 &

# Test PWA availability - should respond in < 1 second  
curl -s http://localhost:8000/ | head -5

# Test manifest file
curl -s http://localhost:8000/manifest.json

# Stop server
kill %1
cd ..
```

**VALIDATION REQUIREMENT**: After setup, you MUST test both the CLI tool and PWA to ensure they start correctly.

## Repository Structure

```
.
├── run-prompt              # Main Python CLI script
├── content/                # Content analysis prompts
│   ├── summarize.md        # Text summarization
│   ├── key-themes.md       # Theme extraction
│   └── linkedin.md         # Social media formatting
├── code/                   # Code-related prompts
│   ├── lint.md             # Code quality assessment
│   ├── git-commit-message.md # Commit message generation
│   └── repomix/            # Repository analysis tools
├── planning/               # Project planning prompts
├── guides/                 # Implementation guides
├── cursor/                 # IDE-specific prompts
├── pwa/                    # Progressive Web App
│   ├── index.html          # Main PWA interface
│   ├── app.js              # PWA functionality
│   ├── manifest.json       # PWA configuration
│   └── service-worker.js   # Offline support
└── .github/                # GitHub configuration
```

## Development Workflows

### Working with Prompts

**Add New Prompt**:
```bash
# Create new prompt file in appropriate directory
# Example: content analysis prompt
touch content/new-analysis.md

# Example: code review prompt  
touch code/new-review.md

# Example: repository analysis prompt
touch code/repomix/new-repo-analysis.md
```

**Test Prompt Structure**:
```bash
# Verify prompt file is discoverable
python3 run-prompt mcp &
sleep 3
# Check debug output for prompt registration
kill %1
```

### MCP Server Development

**Start MCP Server for Development**:
```bash
# NEVER CANCEL - server takes 5-10 seconds to fully initialize
python3 run-prompt mcp
# Server will show debug output of all discovered prompts
# Look for "DEBUG: Registering prompt endpoint:" messages
```

**Test MCP Integration**:
```bash
# Test with MCP inspector (if available)
npx @modelcontextprotocol/inspector python3 run-prompt mcp
```

### PWA Development

**PWA Development Server**:
```bash
cd pwa
# NEVER CANCEL - server starts in 2-3 seconds
python3 -m http.server 8000
# Access at http://localhost:8000
```

**Test PWA Functionality**:
```bash
# Test manifest
curl http://localhost:8000/manifest.json

# Test service worker
curl http://localhost:8000/service-worker.js

# Test GitHub API integration
curl "http://localhost:8000/" | grep -o "GitHub API"
```

**MANUAL VALIDATION**: After PWA changes, manually test:
1. Navigate to http://localhost:8000
2. Verify prompt list loads correctly
3. Test folder navigation (content/, code/, etc.)
4. Test prompt content display
5. Test copy-to-clipboard functionality

## Common Commands and Expected Timing

### Quick Commands (< 2 seconds)
```bash
python3 run-prompt --help                    # ~0.5 seconds
ls -la                                       # Instant
find . -name "*.md" | wc -l                  # ~0.1 seconds
```

### Medium Commands (2-10 seconds)  
```bash
python3 run-prompt mcp &                     # 3-5 seconds to start
python3 -m http.server 8000                 # 2-3 seconds to start
```

### Long Commands (1-5 minutes)
```bash
pip3 install --user fastmcp                 # 2-3 minutes
# NEVER CANCEL - Set timeout to 10+ minutes
```

## Validation and Testing

### Essential Validation Steps
**ALWAYS run these after making changes:**

1. **Verify Python Dependencies**:
   ```bash
   python3 -c "import click, yaml, fastmcp; print('Dependencies OK')"
   ```

2. **Test CLI Functionality**:
   ```bash
   python3 run-prompt --help
   ```

3. **Test MCP Server**:
   ```bash
   python3 run-prompt mcp &
   sleep 5
   kill %1
   ```

4. **Test PWA**:
   ```bash
   cd pwa && python3 -m http.server 8000 &
   sleep 2
   curl -s http://localhost:8000/ >/dev/null && echo "PWA OK"
   kill %1
   cd ..
   ```

### Manual Testing Scenarios

**After adding new prompts:**
1. Start MCP server and verify prompt is registered in debug output
2. Test PWA and verify prompt appears in appropriate folder
3. Verify prompt content displays correctly

**After PWA changes:**  
1. Start PWA server
2. Navigate through all folders (content/, code/, planning/, etc.)
3. Test prompt loading and copy functionality
4. Test offline functionality (refresh with network disabled)

## Common Issues and Solutions

### Dependency Issues
```bash
# If fastmcp installation fails
pip3 install --user --upgrade pip
pip3 install --user fastmcp

# If Python version issues
python3 --version  # Must be 3.12+
```

### MCP Server Issues
```bash
# If MCP server won't start
python3 -c "import fastmcp"  # Test import
python3 run-prompt mcp 2>&1 | grep ERROR  # Check for errors
```

### PWA Issues  
```bash
# If PWA won't start
cd pwa
python3 -m http.server 8000 2>&1 | grep ERROR

# Test manifest validity
python3 -c "import json; print(json.load(open('manifest.json')))"
```

## File Modification Guidelines

### Never Modify
- `run-prompt` (core functionality)
- `pwa/manifest.json` (PWA configuration)
- `pwa/service-worker.js` (offline functionality)

### Safe to Modify
- Prompt files (*.md in content/, code/, planning/, guides/, cursor/)
- `pwa/style.css` (styling only)
- Documentation files (README.md, etc.)

### Modify with Caution
- `pwa/app.js` (test thoroughly after changes)
- `pwa/index.html` (test PWA functionality)

## Timeout and Timing Specifications

**CRITICAL**: Always use these timeout values:

- **Dependency installation**: 10+ minutes (never cancel)
- **MCP server startup**: 30+ seconds (never cancel)  
- **PWA server startup**: 30+ seconds (never cancel)
- **CLI commands**: 10+ seconds (for complex operations)

**NEVER CANCEL long-running operations**. This repository's tools may take several minutes to complete setup operations, especially on slower systems or networks.

## Success Indicators

After following these instructions, you should be able to:

✅ **CLI Tool**: `python3 run-prompt --help` shows usage information  
✅ **MCP Server**: Starts without errors and lists all prompt endpoints  
✅ **PWA**: Serves on localhost:8000 and displays prompt library  
✅ **Prompts**: All markdown files in organized folders are discoverable  
✅ **Dependencies**: Python imports work without errors

If any of these fail, review the validation steps and check for error messages before proceeding with development work.