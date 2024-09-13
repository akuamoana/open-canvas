# OpenCanvas for Obsidian

OpenCanvas is a plugin for Obsidian that enhances the Canvas feature with custom node rendering, improved multi-canvas management, and a grouped view of canvas elements.

## Features

- Efficient handling of multiple open canvases
- Custom node types with unique visualizations
- Real-time tracking of active and background canvases
- Grouped view of canvas nodes by type (text, file, group, link)
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

### Customizing Link Filters

1. Go to the OpenCanvas settings in Obsidian
2. Update the "Link Filters Path" to point to your custom JSON file
3. Edit the JSON file to add or modify link filters
4. Restart Obsidian or reload the plugin for changes to take effect

## Configuration

Visit the OpenCanvas settings tab in Obsidian to customize your experience:

- Set default colors for nodes and edges
- Enable or disable auto-grouping
- Specify the path to your link filters JSON file

## For Developers

OpenCanvas provides a modular structure for extending canvas functionality. Key components include:

- `main.ts`: The main plugin file
- `PluginView.ts`: Defines the custom view for grouped nodes
- `CanvasManager.ts`: Handles canvas-related operations
- `NodeManager.ts`: Manages node-related functionality
- `LinkManager.ts`: Handles link-specific operations
- `SettingsManager.ts`: Manages plugin settings

See the `DOCUMENTATION.md` file for details on the project structure and how to contribute.

## Contributing

We welcome contributions! Please see our `CONTRIBUTING.md` file for details on how to get started.

## Support

If you encounter any issues or have questions, please file an issue on our [GitHub repository](https://github.com/yourusername/obsidian-opencanvas).

## License

OpenCanvas is released under the MIT License. See the `LICENSE` file for more details.