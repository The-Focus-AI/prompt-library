# Prompt Runner

A simple tool to run prompts against files using various LLM models.

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

npx @modelcontextprotocol/inspector uv run run_prompt.py mcp

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
