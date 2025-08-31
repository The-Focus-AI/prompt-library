#!/usr/bin/env swift
import Cocoa
import Foundation
import CoreServices

// Check for debug flag
let isDebugMode = CommandLine.arguments.contains("--debug")

func debugPrint(_ message: String) {
    if isDebugMode {
        print(message)
    }
}

struct PromptFile {
    let path: String
    let name: String
    let category: String
    let lastModified: Date
}

class FileMonitor {
    private var eventStream: FSEventStreamRef?
    private let promptBar: PromptBar
    private let monitoredPaths: [String]
    
    init(promptBar: PromptBar, directory: String) {
        self.promptBar = promptBar
        self.monitoredPaths = [directory]
    }
    
    func startMonitoring() {
        debugPrint("🔍 Starting file monitoring for paths: \(monitoredPaths)")
        let callback: FSEventStreamCallback = { streamRef, clientCallBackInfo, numEvents, eventPaths, eventFlags, eventIds in
            debugPrint("📁 FSEvent callback triggered with \(numEvents) events")
            guard let info = clientCallBackInfo else { 
                debugPrint("❌ No client callback info")
                return 
            }
            let monitor = Unmanaged<FileMonitor>.fromOpaque(info).takeUnretainedValue()
            monitor.handleEvents(numEvents: numEvents, eventPaths: eventPaths, eventFlags: eventFlags)
        }
        
        var context = FSEventStreamContext()
        context.info = Unmanaged.passUnretained(self).toOpaque()
        
        eventStream = FSEventStreamCreate(
            kCFAllocatorDefault,
            callback,
            &context,
            monitoredPaths as CFArray,
            FSEventStreamEventId(kFSEventStreamEventIdSinceNow),
            0.5,
            FSEventStreamCreateFlags(kFSEventStreamCreateFlagFileEvents)
        )
        
        guard let stream = eventStream else { 
            debugPrint("❌ Failed to create FSEventStream")
            return 
        }
        
        debugPrint("✅ FSEventStream created successfully")
        FSEventStreamScheduleWithRunLoop(stream, CFRunLoopGetCurrent(), CFRunLoopMode.defaultMode.rawValue)
        FSEventStreamStart(stream)
        debugPrint("🚀 FSEventStream started")
    }
    
    private func handleEvents(numEvents: Int, eventPaths: UnsafeMutableRawPointer, eventFlags: UnsafePointer<FSEventStreamEventFlags>) {
        debugPrint("LOG-FSEVENT-001: handleEvents called with \(numEvents) events")
        
        // Add safety checks to prevent crashes
        guard numEvents > 0 && numEvents < 1000 else {
            debugPrint("LOG-FSEVENT-002: Invalid numEvents: \(numEvents) - RETURNING")
            return
        }
        
        debugPrint("LOG-FSEVENT-003: About to extract paths from eventPaths pointer")
        
        // Correct way to handle FSEvents callback - eventPaths is a C array of C strings
        debugPrint("LOG-FSEVENT-004: Converting C array to Swift strings")
        let pathsPointer = eventPaths.bindMemory(to: UnsafePointer<Int8>.self, capacity: numEvents)
        var paths: [String] = []
        
        for i in 0..<numEvents {
            let cString = pathsPointer[i]
            if let swiftString = String(cString: cString, encoding: .utf8) {
                paths.append(swiftString)
                debugPrint("LOG-FSEVENT-005-\(i): Got path: \(swiftString)")
            } else {
                debugPrint("LOG-FSEVENT-005-\(i): ERROR - Could not convert C string to Swift String")
            }
        }
        
        debugPrint("LOG-FSEVENT-006: Successfully got \(paths.count) paths")
        
        guard paths.count == numEvents else {
            debugPrint("LOG-FSEVENT-007: Path count mismatch: \(paths.count) != \(numEvents) - RETURNING")
            return
        }
        
        debugPrint("LOG-FSEVENT-008: About to process \(numEvents) events")
        
        for i in 0..<numEvents {
            debugPrint("LOG-FSEVENT-009: Processing event \(i)")
            
            let path = paths[i]
            let flags = eventFlags[i]
            debugPrint("LOG-FSEVENT-010: Event \(i) - path: \(path), flags: \(flags)")
            
            // Process events safely
            if flags & FSEventStreamEventFlags(kFSEventStreamEventFlagItemCreated) != 0 {
                debugPrint("LOG-FSEVENT-011: File created: \(path)")
                checkAndAddFile(at: path)
            }
            
            if flags & FSEventStreamEventFlags(kFSEventStreamEventFlagItemRemoved) != 0 {
                debugPrint("LOG-FSEVENT-012: File removed: \(path)")
                promptBar.removeFile(at: path)
            }
            
            if flags & FSEventStreamEventFlags(kFSEventStreamEventFlagItemModified) != 0 {
                debugPrint("LOG-FSEVENT-013: File modified: \(path)")
                checkAndAddFile(at: path)
            }
            
            debugPrint("LOG-FSEVENT-014: Finished processing event \(i)")
        }
        
        debugPrint("LOG-FSEVENT-015: handleEvents completing normally")
    }
    
    private func checkAndAddFile(at path: String) {
        let url = URL(fileURLWithPath: path)
        let fileExtension = url.pathExtension.lowercased()
        
        guard fileExtension == "md" else { return }
        
        do {
            let attributes = try FileManager.default.attributesOfItem(atPath: path)
            guard let modificationDate = attributes[.modificationDate] as? Date else { return }
            
            let fileName = url.lastPathComponent
            let category = url.deletingLastPathComponent().lastPathComponent
            
            let promptFile = PromptFile(path: path, name: fileName, category: category, lastModified: modificationDate)
            promptBar.addFile(promptFile)
        } catch {
            return
        }
    }
    
    func stopMonitoring() {
        debugPrint("🛑 Stopping file monitoring...")
        guard let stream = eventStream else { 
            debugPrint("⚠️ No event stream to stop")
            return 
        }
        FSEventStreamStop(stream)
        FSEventStreamInvalidate(stream)
        FSEventStreamRelease(stream)
        eventStream = nil
        debugPrint("✅ File monitoring stopped")
    }
}

class PromptBar {
    private var promptFiles: [PromptFile] = []
    var menuManager: MenuManager?
    
    func addFile(_ file: PromptFile) {
        print("📄 New prompt detected: \(file.name)")
        promptFiles.removeAll { $0.name == file.name && $0.category == file.category }
        promptFiles.append(file)
        
        promptFiles.sort { $0.lastModified > $1.lastModified }
        debugPrint("📋 Current prompts count: \(promptFiles.count)")
        menuManager?.updateMenu()
    }
    
    func removeFile(at path: String) {
        promptFiles.removeAll { $0.path == path }
        menuManager?.updateMenu()
    }
    
    func getPromptFiles() -> [PromptFile] {
        return promptFiles.filter { FileManager.default.fileExists(atPath: $0.path) }
    }
    
    func getPromptsByCategory() -> [String: [PromptFile]] {
        let allFiles = getPromptFiles()
        let grouped = Dictionary(grouping: allFiles) { $0.category }
        return grouped
    }
}

class MenuManager: NSObject {
    private let statusItem: NSStatusItem
    private let promptBar: PromptBar
    private var filePaths: [String] = []
    
    init(promptBar: PromptBar) {
        self.promptBar = promptBar
        self.statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        super.init()
        
        if let button = statusItem.button {
            if #available(macOS 11.0, *) {
                button.image = NSImage(systemSymbolName: "brain", accessibilityDescription: "PromptBar")
            } else {
                // Fallback for macOS 10.15
                button.image = NSImage(named: NSImage.quickLookTemplateName)
            }
        }
        
        updateMenu()
    }
    
    private func formatPromptTitle(_ filename: String) -> String {
        // Remove .md extension
        let nameWithoutExtension = filename.replacingOccurrences(of: ".md", with: "")
        
        // Replace hyphens and underscores with spaces
        let withSpaces = nameWithoutExtension.replacingOccurrences(of: "-", with: " ")
                                           .replacingOccurrences(of: "_", with: " ")
        
        // Capitalize each word
        let titleCased = withSpaces.capitalized
        
        return titleCased
    }
    
    func updateMenu() {
        debugPrint("🍽️ Updating menu")
        let menu = NSMenu()
        menu.delegate = self
        let promptsByCategory = promptBar.getPromptsByCategory()
        debugPrint("📝 Menu will show \(promptsByCategory.keys.count) categories")
        
        // Clear and rebuild file paths array
        filePaths.removeAll()
        
        if promptsByCategory.isEmpty {
            let item = NSMenuItem(title: "No prompts found", action: nil, keyEquivalent: "")
            item.isEnabled = false
            menu.addItem(item)
        } else {
            // Sort categories alphabetically
            let sortedCategories = promptsByCategory.keys.sorted()
            
            for category in sortedCategories {
                guard let prompts = promptsByCategory[category] else { continue }
                
                // Create category submenu
                let categoryItem = NSMenuItem(title: category.capitalized, action: nil, keyEquivalent: "")
                let submenu = NSMenu()
                
                // Sort prompts by name within category
                let sortedPrompts = prompts.sorted { $0.name < $1.name }
                
                for prompt in sortedPrompts {
                    debugPrint("🔗 Adding prompt: \(prompt.name) in category \(category)")
                    
                    let cleanTitle = formatPromptTitle(prompt.name)
                    let promptItem = NSMenuItem(title: cleanTitle, 
                                              action: #selector(openFileAtIndex(_:)), keyEquivalent: "")
                    promptItem.target = self
                    promptItem.tag = filePaths.count
                    promptItem.isEnabled = true
                    
                    filePaths.append(prompt.path)
                    submenu.addItem(promptItem)
                }
                
                categoryItem.submenu = submenu
                menu.addItem(categoryItem)
            }
        }
        
        menu.addItem(NSMenuItem.separator())
        let quitItem = NSMenuItem(title: "Quit", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        menu.addItem(quitItem)
        
        statusItem.menu = menu
        debugPrint("✅ Menu updated successfully")
    }
    
    @objc private func openFileAtIndex(_ sender: NSMenuItem) {
        debugPrint("LOG-CLICK-001: openFileAtIndex method ENTERED")
        debugPrint("LOG-CLICK-002: sender type: \(type(of: sender))")
        debugPrint("LOG-CLICK-003: sender.tag = \(sender.tag)")
        debugPrint("LOG-CLICK-004: filePaths.count = \(filePaths.count)")
        
        guard sender.tag >= 0 && sender.tag < filePaths.count else {
            debugPrint("LOG-CLICK-005: GUARD FAILED - Invalid file index: \(sender.tag)")
            return
        }
        debugPrint("LOG-CLICK-006: Guard passed - valid index")
        
        let path = filePaths[sender.tag]
        debugPrint("LOG-CLICK-007: Got path from array: \(path)")
        
        guard FileManager.default.fileExists(atPath: path) else {
            debugPrint("LOG-CLICK-008: GUARD FAILED - File does not exist: \(path)")
            return
        }
        debugPrint("LOG-CLICK-009: File exists check passed")
        
        debugPrint("LOG-CLICK-010: About to create URL")
        let fileURL = URL(fileURLWithPath: path)
        debugPrint("LOG-CLICK-011: File URL created: \(fileURL)")
        
        // Get the filename for the print statement
        let fileName = fileURL.lastPathComponent
        print("📋 Copying prompt to clipboard: \(fileName)")
        
        // Read file content and copy to clipboard
        debugPrint("LOG-CLICK-012: About to dispatch to background queue")
        DispatchQueue.global(qos: .userInitiated).async {
            debugPrint("LOG-CLICK-013: NOW ON BACKGROUND THREAD")
            debugPrint("LOG-CLICK-014: About to read file content")
            
            do {
                let content = try String(contentsOfFile: path, encoding: .utf8)
                debugPrint("LOG-CLICK-015: Successfully read file content")
                
                DispatchQueue.main.async {
                    debugPrint("LOG-CLICK-016: Back on main thread")
                    
                    // Copy to clipboard
                    let pasteboard = NSPasteboard.general
                    pasteboard.clearContents()
                    pasteboard.setString(content, forType: .string)
                    
                    debugPrint("LOG-CLICK-017: Content copied to clipboard")
                    
                    // Show notification
                    self.showNotification(title: "Prompt Copied", message: self.formatPromptTitle(fileName))
                    
                    debugPrint("LOG-CLICK-018: Notification shown")
                }
            } catch {
                debugPrint("LOG-CLICK-015: Error reading file: \(error)")
                DispatchQueue.main.async {
                    self.showNotification(title: "Error", message: "Could not read prompt file")
                }
            }
        }
        
        debugPrint("LOG-CLICK-021: About to return from openFileAtIndex")
        debugPrint("LOG-CLICK-022: openFileAtIndex method EXITING")
    }
    
    private func showNotification(title: String, message: String) {
        // Use osascript to display a notification
        let script = """
        display notification "\(message)" with title "\(title)" sound name "Glass"
        """
        
        let task = Process()
        task.launchPath = "/usr/bin/osascript"
        task.arguments = ["-e", script]
        
        do {
            try task.run()
            debugPrint("✅ Notification displayed successfully")
        } catch {
            debugPrint("⚠️ Could not show notification: \(error)")
            // Fallback to a simple beep
            NSSound.beep()
        }
    }
}

extension MenuManager: NSMenuDelegate {
    func menuWillOpen(_ menu: NSMenu) {
        debugPrint("LOG-MENU-001: menuWillOpen called")
        debugPrint("LOG-MENU-002: menu has \(menu.items.count) items")
    }
    
    func menuDidClose(_ menu: NSMenu) {
        debugPrint("LOG-MENU-003: menuDidClose called")
    }
}

class AppDelegate: NSObject, NSApplicationDelegate {
    private var promptBar: PromptBar!
    private var fileMonitor: FileMonitor!
    private var menuManager: MenuManager!
    private var promptDirectory: String!
    
    init(directory: String) {
        self.promptDirectory = directory
        super.init()
    }
    
    func applicationDidFinishLaunching(_ notification: Notification) {
        debugPrint("🚀 App launched with directory: \(promptDirectory!)")
        promptBar = PromptBar()
        debugPrint("📋 PromptBar initialized")
        
        menuManager = MenuManager(promptBar: promptBar)
        debugPrint("🍽️ MenuManager initialized")
        
        // Set up the bidirectional relationship properly
        promptBar.menuManager = menuManager
        debugPrint("🔗 PromptBar-MenuManager relationship established")
        
        fileMonitor = FileMonitor(promptBar: promptBar, directory: promptDirectory)
        debugPrint("👀 FileMonitor initialized")
        fileMonitor.startMonitoring()
        
        // Scan for prompt files from the specified directory
        debugPrint("🔍 Scanning for prompt files in \(promptDirectory!)...")
        DispatchQueue.global(qos: .background).async {
            self.scanForPromptFiles()
        }
        
        debugPrint("✅ App initialization completed")
    }
    
    func applicationWillTerminate(_ notification: Notification) {
        debugPrint("LOG-APP-001: applicationWillTerminate called")
        debugPrint("LOG-APP-002: About to stop file monitoring")
        fileMonitor?.stopMonitoring()
        debugPrint("LOG-APP-003: File monitoring stopped")
        debugPrint("LOG-APP-004: applicationWillTerminate finishing")
    }
    
    private func scanForPromptFiles() {
        debugPrint("📂 Starting prompt file scan...")
        
        // Recursively scan for .md files
        scanDirectory(path: promptDirectory)
        
        debugPrint("✅ Prompt file scanning completed")
    }
    
    private func scanDirectory(path: String) {
        debugPrint("📁 Scanning directory: \(path)")
        
        do {
            let contents = try FileManager.default.contentsOfDirectory(atPath: path)
            
            for item in contents {
                let fullPath = (path as NSString).appendingPathComponent(item)
                
                var isDirectory: ObjCBool = false
                guard FileManager.default.fileExists(atPath: fullPath, isDirectory: &isDirectory) else {
                    continue
                }
                
                if isDirectory.boolValue {
                    // Skip hidden directories and common non-prompt directories
                    if !item.hasPrefix(".") && !["node_modules", "build", "dist", ".git"].contains(item) {
                        scanDirectory(path: fullPath)
                    }
                } else {
                    let url = URL(fileURLWithPath: fullPath)
                    let fileExtension = url.pathExtension.lowercased()
                    
                    if fileExtension == "md" {
                        do {
                            let attributes = try FileManager.default.attributesOfItem(atPath: fullPath)
                            if let modificationDate = attributes[.modificationDate] as? Date {
                                let fileName = url.lastPathComponent
                                let category = url.deletingLastPathComponent().lastPathComponent
                                
                                let promptFile = PromptFile(path: fullPath, name: fileName, category: category, lastModified: modificationDate)
                                
                                // Add on main thread
                                DispatchQueue.main.async {
                                    debugPrint("📄 Adding prompt: \(fileName) in category \(category)")
                                    self.promptBar.addFile(promptFile)
                                }
                            }
                        } catch {
                            debugPrint("⚠️ Could not read attributes for: \(item)")
                        }
                    }
                }
            }
            
        } catch {
            debugPrint("❌ Error reading directory \(path): \(error)")
        }
    }
}

// Parse command line arguments
func parseArguments() -> String {
    let args = CommandLine.arguments
    
    // Look for --dir argument
    for i in 0..<args.count {
        if args[i] == "--dir" && i + 1 < args.count {
            let dir = args[i + 1]
            // Expand tilde if present
            if dir.hasPrefix("~") {
                return NSString(string: dir).expandingTildeInPath
            }
            return dir
        }
    }
    
    // Default to ~/prompt-library
    return NSString(string: "~/prompt-library").expandingTildeInPath
}

debugPrint("LOG-MAIN-001: Creating NSApplication")
let app = NSApplication.shared
debugPrint("LOG-MAIN-002: Parsing arguments")
let promptDirectory = parseArguments()
debugPrint("LOG-MAIN-003: Using directory: \(promptDirectory)")
debugPrint("LOG-MAIN-004: Creating AppDelegate")
let delegate = AppDelegate(directory: promptDirectory)
debugPrint("LOG-MAIN-005: Setting delegate")
app.delegate = delegate
debugPrint("LOG-MAIN-006: Setting activation policy")
app.setActivationPolicy(.accessory)
debugPrint("LOG-MAIN-007: About to call app.run()")
app.run()
debugPrint("LOG-MAIN-008: app.run() returned - this should never print!")