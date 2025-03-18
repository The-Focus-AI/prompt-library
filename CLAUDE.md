# CLAUDE.md - Agent Guidelines

## Commands
- Run prompts: `./run-prompt <prompt_file> <input_file>`
- Change model: `MODEL=claude-3.7-sonnet ./run-prompt <prompt_file> <input_file>`
- Run with ollama: `cat input.txt | ollama run gemma3:12b "$(cat ~/prompts/code/prompt.md)"`
- Run with llm: `cat input.txt | llm -m $MODEL "$(cat ~/prompts/code/prompt.md)"`

## Code Style Guidelines
- Maintain consistent file organization in directories: `content/`, `code/`, `planning/`
- Follow naming conventions: use descriptive, lowercase filenames with hyphens
- Markdown files should be structured with clear headings and concise content
- Shell scripts should include proper error handling and parameter validation
- Include helpful comments for complex logic
- Prompt files should be focused on a specific task and include clear instructions

## Project Structure
- Content analysis: stored in `content/` directory 
- Code analysis: stored in `code/` directory
- Repository analysis: stored in `code/repomix/` directory
- Planning tools: stored in `planning/` directory

When creating new prompts, follow existing patterns and place in appropriate directories.