# macOS Menubar Prompt Library

A native macOS menubar application that provides instant access to your prompt library with click-to-copy functionality.

## Features

- 🧠 **Brain Icon**: Clean, recognizable brain icon in your macOS menubar
- 📁 **Hierarchical Organization**: Prompts organized by categories (Code, Content, Planning, etc.)
- 📋 **Click-to-Copy**: One-click copying of prompt content to clipboard
- 🔔 **Notifications**: Visual feedback when prompts are copied
- ✨ **Clean Names**: Automatic formatting of prompt names (e.g., "git-commit-message.md" → "Git Commit Message")
- 🔍 **Auto-Discovery**: Automatically scans and monitors your prompt directory
- ⚡ **Real-time Updates**: File system monitoring for instant updates when prompts change

## Installation

### Requirements
- macOS 10.15+ (Catalina or later)
- Swift runtime (included with Xcode or Command Line Tools)

### Setup
1. Clone the prompt library repository
2. Navigate to the menubar directory:
   ```bash
   cd menubar
   ```
3. Run the app:
   ```bash
   swift promptbar.swift --dir ~/prompt-library
   ```

### Running in Background
To run the app in the background (recommended):
```bash
swift promptbar.swift --dir ~/prompt-library &
```

### Auto-start on Login
To automatically start the app when you log in:

1. Create a simple shell script:
   ```bash
   #!/bin/bash
   cd /path/to/prompt-library/menubar
   swift promptbar.swift --dir ~/prompt-library
   ```
2. Save it as `start-prompt-bar.sh` and make it executable
3. Add it to your login items in System Preferences

## Usage

1. **Launch**: Look for the brain icon (🧠) in your menubar
2. **Browse**: Click the icon to see hierarchical categories
3. **Copy**: Click any prompt name to copy its content to clipboard
4. **Notification**: You'll see a system notification confirming the copy
5. **Paste**: Use Cmd+V anywhere to paste the prompt content

## Configuration

### Custom Directory
By default, the app looks for prompts in `~/prompt-library`. You can specify a different directory:

```bash
swift promptbar.swift --dir /path/to/your/prompts
```

### Debug Mode
For troubleshooting, enable debug logging:
```bash
swift promptbar.swift --dir ~/prompt-library --debug
```

## File Organization

The app automatically organizes prompts based on your directory structure:

```
prompt-library/
├── code/                    # → "Code" category
│   ├── lint.md             # → "Lint"
│   └── git-commit-message.md # → "Git Commit Message"
├── content/                 # → "Content" category
│   ├── summarize.md        # → "Summarize"
│   └── key-themes.md       # → "Key Themes"
└── planning/               # → "Planning" category
    └── project-brief.md    # → "Project Brief"
```

## Technical Details

### Architecture
- **Language**: Swift
- **Frameworks**: Cocoa, Foundation, CoreServices
- **File Monitoring**: FSEvents for real-time directory watching
- **Notifications**: AppleScript for system notifications
- **Memory**: Low memory footprint with efficient file handling

### File Types
- Currently supports: `.md` (Markdown) files
- Easily extensible to support other text-based file types

### Performance
- Lazy loading of file contents (only reads when clicked)
- Efficient file system monitoring
- Minimal CPU usage when idle

## Troubleshooting

### App Not Appearing
- Check if Swift is installed: `swift --version`
- Ensure the directory path is correct and accessible
- Try running with `--debug` flag for detailed logging

### No Prompts Showing
- Verify the directory contains `.md` files
- Check file permissions (files should be readable)
- Ensure directory structure has subdirectories for categories

### Notifications Not Working
- Check System Preferences → Notifications
- Grant permission for Terminal/Script Editor notifications
- Fallback: App will beep if notifications fail

## Development

### Modifying the App
The main file is `promptbar.swift`. Key components:

- `PromptFile`: Data structure for prompt metadata
- `PromptBar`: Core logic for file management
- `FileMonitor`: Real-time file system monitoring
- `MenuManager`: Menu creation and interaction handling
- `AppDelegate`: App lifecycle management

### Adding Features
Common modifications:
- Support additional file types: Modify the `checkAndAddFile` method
- Change notification style: Update the `showNotification` method
- Customize menu appearance: Modify the `updateMenu` method

## License

Same as the main prompt library project.