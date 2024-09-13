import { App } from 'obsidian';
import OpenCanvas from '../main';
import { StructuredNode, GroupedNodes, CanvasColor } from '../types';

export class LinkManager {
    private app: App;
    private plugin: OpenCanvas;

    constructor(app: App, plugin: OpenCanvas) {
        this.app = app;
        this.plugin = plugin;
    }

    categorizeLink(linkGroup: GroupedNodes['link'], node: StructuredNode) {
        if (node.content && typeof node.content === 'object' && 'url' in node.content) {
            const url = node.content.url;
            const linkFilters = Array.isArray(this.plugin.settings.linkFilters) ? this.plugin.settings.linkFilters : [];
            const matchedFilter = linkFilters.find(filter => url.includes(filter.url));
            
            if (matchedFilter) {
                if (!linkGroup[matchedFilter.title]) {
                    linkGroup[matchedFilter.title] = [];
                }
                linkGroup[matchedFilter.title].push(node);
            } else {
                linkGroup.other.push(node);
            }
        } else {
            linkGroup.other.push(node);
        }
    }

    getLinkColor(node: StructuredNode): string {
        if (node.color) {
            return this.translateColor(node.color);
        }
        return this.translateColor(this.plugin.settings.defaultEdgeColor);
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

    async updateLinkUrl(nodeId: string, newUrl: string): Promise<void> {
        // Implementation for updating link URL
        console.log(`Updating URL for link node ${nodeId}`);
        // Actual implementation would depend on how we're storing and accessing the active canvas data
    }

    async createLink(url: string, position: { x: number, y: number }): Promise<string> {
        // Implementation for creating a new link node
        console.log(`Creating new link node at position (${position.x}, ${position.y}) with URL: ${url}`);
        // Actual implementation would depend on how we're generating new node IDs and adding to the canvas
        return 'new-link-node-id';
    }
}