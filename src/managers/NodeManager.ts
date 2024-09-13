import { App } from 'obsidian';
import OpenCanvas from '../main';
import { CanvasNode, StructuredNode, CanvasColor } from '../types';

export class NodeManager {
    private app: App;
    private plugin: OpenCanvas;

    constructor(app: App, plugin: OpenCanvas) {
        this.app = app;
        this.plugin = plugin;
    }

    createStructuredNode(node: CanvasNode): StructuredNode {
        const structuredNode: StructuredNode = {
            id: node.id,
            type: node.type,
            position: { x: node.x, y: node.y },
            size: { width: node.width, height: node.height },
            color: node.color
        };

        switch (node.type) {
            case 'text':
                structuredNode.content = node.text;
                break;
            case 'file':
                structuredNode.content = { file: node.file, subpath: node.subpath };
                break;
            case 'link':
                structuredNode.content = { url: node.url };
                break;
            case 'group':
                structuredNode.customData = {
                    label: node.label,
                    background: node.background,
                    backgroundStyle: node.backgroundStyle
                };
                break;
        }

        return structuredNode;
    }

    getNodeColor(node: StructuredNode): string {
        if (node.color) {
            return this.translateColor(node.color);
        }
        return this.translateColor(this.plugin.settings.defaultNodeColor);
    }

    private translateColor(color: CanvasColor): string {
        const colorMap: Record<string, string> = {
            '1': 'red',
            '2': 'orange',
            '3': 'yellow',
            '4': 'green',
            '5': 'cyan',
            '6': 'purple'
        };
        return colorMap[color] || color;
    }

    async updateNodeContent(nodeId: string, content: string): Promise<void> {
        // Implementation for updating node content
        // This would involve finding the node in the active canvas and updating its content
        console.log(`Updating content for node ${nodeId}`);
        // Actual implementation would depend on how we're storing and accessing the active canvas data
    }

    async deleteNode(nodeId: string): Promise<void> {
        // Implementation for deleting a node
        console.log(`Deleting node ${nodeId}`);
        // Actual implementation would depend on how we're storing and accessing the active canvas data
    }

    async createNode(type: string, position: { x: number, y: number }): Promise<string> {
        // Implementation for creating a new node
        console.log(`Creating new ${type} node at position (${position.x}, ${position.y})`);
        // Actual implementation would depend on how we're generating new node IDs and adding to the canvas
        return 'new-node-id';
    }
}