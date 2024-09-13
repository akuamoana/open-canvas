# OpenCanvas for Obsidian

OpenCanvas is a plugin for Obsidian that enhances the Canvas feature with custom node rendering, improved multi-canvas management, and a grouped view of canvas elements.

## Features

- Efficient handling of multiple open canvases
- Custom node types with unique visualizations
- Real-time tracking of active and background canvases
- Grouped view of canvas nodes by type (text, file, group, link)
- File content reading for .txt and .ts files
- Customizable link filtering and categorization
- Seamless integration with Obsidian's existing canvas functionality

## Installation

1. Open Obsidian and go to Settings
2. Navigate to Community Plugins and disable Safe Mode
3. Click on Browse and search for "OpenCanvas"
4. Install the plugin and enable it

## Usage

Once installed, OpenCanvas will automatically enhance your Canvas experience in Obsidian:

### Viewing Grouped Nodes

1. Open a canvas in Obsidian
2. The OpenCanvas view will automatically open in the right sidebar
3. Nodes are grouped by type: text, file, group, and link
4. Link nodes are further categorized based on your link filters
5. For .txt and .ts file nodes, you can view the file content in a collapsible section

### Customizing Link Filters

1. Go to the OpenCanvas settings in Obsidian
2. Add, edit, or remove link filters using the provided interface
3. Each filter consists of a title and a URL
4. Links matching a filter will be grouped under the filter's title in the OpenCanvas view

## Configuration

Visit the OpenCanvas settings tab in Obsidian to customize your experience:

- Set default colors for nodes and edges
- Enable or disable auto-grouping
- Manage link filters

## For Developers

OpenCanvas provides a modular structure for extending canvas functionality. Key components include:

- `main.ts`: The main plugin file
- `PluginView.ts`: Defines the custom view for grouped nodes
- `CanvasManager.ts`: Handles canvas-related operations
- `NodeManager.ts`: Manages node-related functionality, including file content reading
- `LinkManager.ts`: Handles link-specific operations
- `SettingsManager.ts`: Manages plugin settings

See the `DOCUMENTATION.md` file for details on the project structure and how to contribute.

## Contributing

We welcome contributions! Please see our `CONTRIBUTING.md` file for details on how to get started.

## Support

If you encounter any issues or have questions, please file an issue on our [GitHub repository](https://github.com/yourusername/obsidian-opencanvas).

## License

OpenCanvas is released under the MIT License. See the `LICENSE` file for more details.

## Changelog

### [1.1.0] - 2023-MM-DD
- Added file content reading for .txt and .ts files
- Implemented user-configurable link filters in settings
- Improved asynchronous processing of canvas nodes

### [1.0.0] - 2023-MM-DD
- Initial release of OpenCanvas plugin