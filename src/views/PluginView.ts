import { ItemView, WorkspaceLeaf } from 'obsidian';
import OpenCanvas from '../main';
import { GroupedNodes, StructuredNode } from '../types';

export const VIEW_TYPE_OPEN_CANVAS = "open-canvas-view";

export class PluginView extends ItemView {
    private plugin: OpenCanvas;
    private groupedNodes: GroupedNodes;

    constructor(leaf: WorkspaceLeaf, plugin: OpenCanvas) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return VIEW_TYPE_OPEN_CANVAS;
    }

    getDisplayText(): string {
        return "OpenCanvas View";
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl('h4', { text: 'OpenCanvas View' });
        
        // Create containers for different sections
        const nodesContainer = container.createEl('div', { cls: 'opencanvas-nodes-container' });
        const actionsContainer = container.createEl('div', { cls: 'opencanvas-actions-container' });

        this.renderActions(actionsContainer);
    }

    async setGroupedNodes(groupedNodes: GroupedNodes) {
        this.groupedNodes = groupedNodes;
        await this.renderGroupedNodes();
    }

    private async renderGroupedNodes() {
        const container = this.containerEl.children[1];
        const nodesContainer = container.querySelector('.opencanvas-nodes-container');
        if (nodesContainer) {
            nodesContainer.empty();

            Object.entries(this.groupedNodes).forEach(([nodeType, nodes]) => {
                const typeContainer = nodesContainer.createEl('div', { cls: 'node-type-container' });
                if (nodeType === 'link') {
                    this.renderLinkNodes(typeContainer, nodes as GroupedNodes['link']);
                } else {
                    this.renderNodeGroup(typeContainer, nodeType, nodes as StructuredNode[]);
                }
            });
        }
    }

    private renderLinkNodes(container: HTMLElement, linkGroups: GroupedNodes['link']) {
        const linkContainer = container.createEl('details', { cls: 'link-container' });
        linkContainer.createEl('summary', { text: `Links` });

        Object.entries(linkGroups).forEach(([filterName, linkNodes]) => {
            const groupContainer = linkContainer.createEl('details', { cls: 'link-group-container' });
            groupContainer.createEl('summary', { text: `${filterName} (${linkNodes.length})` });
            linkNodes.forEach(node => this.renderNode(groupContainer, node));
        });
    }

    private renderNodeGroup(container: HTMLElement, type: string, nodes: StructuredNode[]) {
        const groupContainer = container.createEl('details', { cls: 'node-group-container' });
        groupContainer.createEl('summary', { text: `${type} (${nodes.length})` });
        nodes.forEach(node => this.renderNode(groupContainer, node));
    }

    private renderNode(container: HTMLElement, node: StructuredNode) {
        const nodeEl = container.createEl('div', { cls: 'node-item' });
        nodeEl.createEl('strong', { text: `Node ${node.id}` });
        nodeEl.createEl('div', { text: `Type: ${node.type}` });
        nodeEl.createEl('div', { text: `Position: (${node.position.x}, ${node.position.y})` });
        nodeEl.createEl('div', { text: `Size: ${node.size.width}x${node.size.height}` });
        
        if (node.content) {
            const contentEl = nodeEl.createEl('div', { cls: 'node-content' });
            contentEl.createEl('strong', { text: 'Content:' });
            if (typeof node.content === 'string') {
                contentEl.createEl('div', { text: node.content });
            } else if ('file' in node.content) {
                contentEl.createEl('div', { text: `File: ${node.content.file}` });
                if (node.fileContent) {
                    const fileContentEl = contentEl.createEl('details', { cls: 'file-content' });
                    fileContentEl.createEl('summary', { text: 'File Content' });
                    fileContentEl.createEl('pre', { text: node.fileContent });
                }
            } else if ('url' in node.content) {
                const linkEl = contentEl.createEl('a', { text: node.content.url, href: node.content.url });
                linkEl.setAttribute('target', '_blank');
            }
        }

        if (node.customData) {
            const customDataEl = nodeEl.createEl('div', { cls: 'node-custom-data' });
            customDataEl.createEl('strong', { text: 'Custom Data:' });
            Object.entries(node.customData).forEach(([key, value]) => {
                customDataEl.createEl('div', { text: `${key}: ${JSON.stringify(value)}` });
            });
        }
    }

    private renderActions(container: HTMLElement) {
        const refreshButton = container.createEl('button', { text: 'Refresh View' });
        refreshButton.addEventListener('click', async () => {
            const activeFile = this.plugin.canvasManager.getActiveCanvasFile();
            if (activeFile) {
                const groupedNodes = await this.plugin.canvasManager.renderGroupedCanvasNodes(activeFile);
                await this.setGroupedNodes(groupedNodes);
            }
        });

        // Add more action buttons or controls here as needed
    }
}