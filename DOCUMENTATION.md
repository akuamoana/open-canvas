# OpenCanvas Documentation

## Project Structure

```
open-canvas/
├── manifest.json
├── styles.css
└── src/
    ├── main.ts
    ├── types.ts
    ├── views/
    │   └── PluginView.ts
    ├── managers/
    │   ├── CanvasManager.ts
    │   ├── NodeManager.ts
    │   ├── LinkManager.ts
    │   └── SettingsManager.ts
    └── data/
        └── link-filters.json
```

## Core Components

### OpenCanvas (main.ts)

The main class that initializes the plugin and coordinates between different managers.

Key methods:
- `onload()`: Initializes the plugin
- `loadSettings()`: Loads plugin settings
- `initializeManagers()`: Sets up all manager classes
- `registerViews()`: Registers the custom plugin view
- `addCommands()`: Adds plugin commands
- `addEventListeners()`: Sets up event listeners for canvas-related events

### PluginView (views/PluginView.ts)

A custom view that displays grouped canvas nodes.

Key methods:
- `onOpen()`: Sets up the view structure
- `setGroupedNodes(groupedNodes: GroupedNodes)`: Updates the view with new grouped nodes
- `renderGroupedNodes()`: Renders the grouped nodes in the view
- `renderActions()`: Adds interactive elements to the view

### CanvasManager (managers/CanvasManager.ts)

Handles canvas-related operations.

Key methods:
- `handleCanvasOpen(file: TFile)`: Manages opening of a canvas file
- `setActiveCanvas(canvasFile: TFile | null)`: Sets the active canvas
- `renderGroupedCanvasNodes(file: TFile)`: Processes and groups canvas nodes
- `openOpenCanvasView(groupedNodes?: GroupedNodes)`: Opens or updates the plugin view

### NodeManager (managers/NodeManager.ts)

Manages node-related functionality.

Key methods:
- `createStructuredNode(node: CanvasNode)`: Converts a raw CanvasNode to a StructuredNode
- `getNodeColor(node: StructuredNode)`: Retrieves the color for a node
- `updateNodeContent(nodeId: string, content: string)`: Updates node content (placeholder)
- `deleteNode(nodeId: string)`: Deletes a node (placeholder)
- `createNode(type: string, position: { x: number, y: number })`: Creates a new node (placeholder)

### LinkManager (managers/LinkManager.ts)

Handles link-specific operations.

Key methods:
- `categorizeLink(linkGroup: GroupedNodes['link'], node: StructuredNode)`: Categorizes links based on filters
- `loadLinkFilters()`: Loads link filters from the JSON file
- `getLinkColor(node: StructuredNode)`: Retrieves the color for a link
- `updateLinkUrl(nodeId: string, newUrl: string)`: Updates a link's URL (placeholder)
- `createLink(url: string, position: { x: number, y: number })`: Creates a new link node (placeholder)

### SettingsManager (managers/SettingsManager.ts)

Manages plugin settings.

Key methods:
- `loadSettings()`: Loads settings from Obsidian's data storage
- `saveSettings()`: Saves current settings to Obsidian's data storage
- `updateSetting(key, value)`: Updates a specific setting
- `getSetting(key)`: Retrieves the value of a specific setting

## Types (types.ts)

Defines TypeScript interfaces and types used throughout the project:
- `CanvasNode`, `CanvasEdge`, `CanvasData`: Represent canvas elements
- `StructuredNode`, `GroupedNodes`: Used for node grouping and rendering
- `OpenCanvasSettings`: Defines the structure of plugin settings
- `CanvasColor`: Represents the color options for nodes and edges

## Key Features

### Canvas Node Grouping

Nodes are grouped into categories:
- Text nodes
- File nodes
- Group nodes
- Link nodes (further categorized by custom filters)

### Link Filtering

Links are categorized based on user-defined filters in the link filters JSON file:
- Filters are defined as key-value pairs (filter name: URL substring)
- Links matching a filter are grouped under that filter name
- Non-matching links are grouped under "other"

### Real-time Updates

The grouped nodes view updates automatically when:
- A new canvas is opened
- The active canvas is modified

## Extending OpenCanvas

To add new features or modify existing ones:

1. Update relevant interfaces in `types.ts`
2. Modify the appropriate manager class to implement new logic
3. Update `PluginView.ts` to reflect changes in the UI
4. If adding new settings, update `SettingsManager.ts` and the settings tab in `main.ts`

## Building and Packaging

1. Ensure you have Node.js and npm installed
2. Run `npm install` to install dependencies
3. Use `npm run build` to compile the plugin
4. The compiled plugin will be in the `build` directory

## Performance Considerations

- OpenCanvas efficiently manages multiple canvases by updating only when necessary
- Consider optimizing node rendering for large canvases
- Be mindful of memory usage when dealing with numerous or complex canvases

## Future Improvements

- Implement custom node types and renderers
- Add more advanced filtering and sorting options for grouped nodes
- Integrate with other Obsidian plugins for enhanced functionality
- Implement actual logic for updating, deleting, and creating nodes and links

For more detailed API documentation, please refer to the inline comments in each file.