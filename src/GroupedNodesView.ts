import { ItemView, WorkspaceLeaf } from 'obsidian';
import { GroupedNodes, StructuredNode } from './types';

export const VIEW_TYPE_GROUPED_NODES = "grouped-nodes-view";

export class GroupedNodesView extends ItemView {
    groupedNodes: GroupedNodes;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPE_GROUPED_NODES;
    }

    getDisplayText() {
        return "Grouped Nodes";
    }

    async setGroupedNodes(groupedNodes: GroupedNodes) {
        this.groupedNodes = groupedNodes;
        await this.render();
    }

    async render() {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl('h4', { text: 'Grouped Canvas Nodes' });

        Object.entries(this.groupedNodes).forEach(([nodeType, nodes]) => {
            const typeContainer = container.createEl('div', { cls: 'node-type-container' });
            if (nodeType === 'link') {
                this.renderLinkNodes(typeContainer, nodes as GroupedNodes['link']);
            } else {
                this.renderNodeGroup(typeContainer, nodeType, nodes as StructuredNode[]);
            }
        });
    }

    renderLinkNodes(container: HTMLElement, linkGroups: GroupedNodes['link']) {
        const linkContainer = container.createEl('details', { cls: 'link-container' });
        linkContainer.createEl('summary', { text: `Links` });

        Object.entries(linkGroups).forEach(([filterName, linkNodes]) => {
            const groupContainer = linkContainer.createEl('details', { cls: 'link-group-container' });
            groupContainer.createEl('summary', { text: `${filterName} (${linkNodes.length})` });
            linkNodes.forEach(node => this.renderNode(groupContainer, node));
        });
    }

    renderNodeGroup(container: HTMLElement, type: string, nodes: StructuredNode[]) {
        const groupContainer = container.createEl('details', { cls: 'node-group-container' });
        groupContainer.createEl('summary', { text: `${type} (${nodes.length})` });
        nodes.forEach(node => this.renderNode(groupContainer, node));
    }

    renderNode(container: HTMLElement, node: StructuredNode) {
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
}