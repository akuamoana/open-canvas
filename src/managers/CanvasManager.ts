import { App, TFile, WorkspaceLeaf } from 'obsidian';
import { CanvasData, GroupedNodes, StructuredNode } from '../types';
import { VIEW_TYPE_OPEN_CANVAS } from '../views/PluginView';
import OpenCanvas from '../main';

export class CanvasManager {
    private app: App;
    private plugin: OpenCanvas;
    private activeCanvasFile: TFile | null = null;

    constructor(app: App, plugin: OpenCanvas) {
        this.app = app;
        this.plugin = plugin;
    }

    async handleCanvasOpen(file: TFile) {
        console.log(`Canvas opened: ${file.path}`);
        await this.setActiveCanvas(file);
    }

    async setActiveCanvas(canvasFile: TFile | null) {
        if (this.activeCanvasFile !== canvasFile) {
            this.activeCanvasFile = canvasFile;

            if (canvasFile) {
                console.log(`Active canvas set to: ${canvasFile.path}`);
                const groupedNodes = await this.renderGroupedCanvasNodes(canvasFile);
                this.openOpenCanvasView(groupedNodes);
            } else {
                console.log('No active canvas');
            }
        }
    }

    async handleCanvasChange(file: TFile) {
        console.log(`Active canvas changed: ${file.path}`);
        const groupedNodes = await this.renderGroupedCanvasNodes(file);
        this.openOpenCanvasView(groupedNodes);
    }

    async renderGroupedCanvasNodes(file: TFile): Promise<GroupedNodes> {
        try {
            const content = await this.app.vault.read(file);
            const canvasData: CanvasData = JSON.parse(content);
            
            const groupedNodes: GroupedNodes = {
                text: [],
                file: [],
                group: [],
                link: {
                    other: []
                }
            };

            // Use Promise.all to handle asynchronous node creation
            await Promise.all(canvasData.nodes.map(async (node) => {
                const structuredNode = await this.plugin.nodeManager.createStructuredNode(node);

                switch (node.type) {
                    case 'text':
                    case 'file':
                    case 'group':
                        (groupedNodes[node.type] as StructuredNode[]).push(structuredNode);
                        break;
                    case 'link':
                        this.plugin.linkManager.categorizeLink(groupedNodes.link, structuredNode);
                        break;
                    default:
                        console.warn(`Unknown node type: ${(node as any).type}`);
                }
            }));

            return groupedNodes;
        } catch (error) {
            console.error('Error rendering grouped canvas nodes:', error);
            return { text: [], file: [], group: [], link: { other: [] } };
        }
    }

    async openOpenCanvasView(groupedNodes?: GroupedNodes) {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_OPEN_CANVAS);
        
        if (leaves.length === 0) {
            await this.activateView();
        }
        
        const leaf = leaves[0];
        const view = leaf.view as any; // Cast to any as we don't have a concrete type for our custom view
        
        if (view && typeof view.setGroupedNodes === 'function') {
            if (groupedNodes) {
                await view.setGroupedNodes(groupedNodes);
            } else if (this.activeCanvasFile) {
                const nodes = await this.renderGroupedCanvasNodes(this.activeCanvasFile);
                await view.setGroupedNodes(nodes);
            } else {
                console.log('No active canvas to display grouped nodes');
            }
        } else {
            console.error('OpenCanvas view not found or does not have setGroupedNodes method');
        }
    }

    private async activateView() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_OPEN_CANVAS);

        const rightLeaf = this.app.workspace.getRightLeaf(false);
        if (rightLeaf) {
            await rightLeaf.setViewState({
                type: VIEW_TYPE_OPEN_CANVAS,
                active: true,
            });
        } else {
            console.error('Right leaf is null');
        }

        this.app.workspace.revealLeaf(
            this.app.workspace.getLeavesOfType(VIEW_TYPE_OPEN_CANVAS)[0]
        );
    }

    getActiveCanvasFile(): TFile | null {
        return this.activeCanvasFile;
    }

    // Add more canvas-related methods here as needed
}