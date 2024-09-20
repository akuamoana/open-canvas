import { App, TFile, WorkspaceLeaf, View, ViewState, Notice } from 'obsidian';
import { CanvasData, CanvasNode, GroupedNodes, StructuredNode, FileNode, TextNode } from '../types';
import { VIEW_TYPE_OPEN_CANVAS } from '../views/PluginView';
import OpenCanvas from '../main';

export class CanvasManager {
    private app: App;
    private plugin: OpenCanvas;
    private activeCanvasFile: TFile | null = null;
    private activeCanvasView: any | null = null;

    constructor(app: App, plugin: OpenCanvas) {
        this.app = app;
        this.plugin = plugin;
    }

    async updateCanvasFileContent(file: TFile) {
        console.log("canvas Object:", this.app.vault.getAbstractFileByPath(file.path));
        if (!file) return;

        try {
            const content = await this.app.vault.read(file);
            const canvasData: CanvasData = JSON.parse(content);

            let updated = false;
            const newNodes: CanvasNode[] = [];

            for (let node of canvasData.nodes) {
                if (node.type === 'file' && (node.file.endsWith('.txt') || node.file.endsWith('.ts'))) {
                    const fileContent = await this.plugin.nodeManager.readFileContent(node as FileNode);
                    if (fileContent !== null) {
                        const textNode: TextNode = {
                            ...node,
                            type: 'text',
                            text: `\`\`\`file-content:${(node as FileNode).file}\n${fileContent}\n\`\`\``,
                        };
                        newNodes.push(textNode);
                        updated = true;
                    } else {
                        newNodes.push(node);
                    }
                } else {
                    newNodes.push(node);
                }
            }

            if (updated) {
                canvasData.nodes = newNodes;
                await this.app.vault.modify(file, JSON.stringify(canvasData, null, 2));
                console.log(`Updated canvas file: ${file.path}`);
                await this.refreshCanvasView(file);
            }
        } catch (error) {
            console.error(`Error updating canvas file content: ${error}`);
        }
    }

    private async refreshCanvasView(file: TFile) {
        const leaves = this.app.workspace.getLeavesOfType('canvas');
        for (const leaf of leaves) {
            if ((leaf.view as any).file?.path === file.path) {
                const viewState = leaf.getViewState();
                await leaf.setViewState({
                    type: 'canvas',
                    state: viewState.state,
                    popstate: true,
                } as ViewState);
                break;
            }
        }
    }

    async handleCanvasOpen(file: TFile) {
        console.log(`Canvas opened: ${file.path}`);
        await this.updateCanvasFileContent(file);
        await this.setActiveCanvas(file);
    }

    async handleCanvasChange(file: TFile, view?: View) {
        console.log(`Active canvas changed: ${file.path}`);
        console.log(view)
        await this.updateCanvasFileContent(file);
        const groupedNodes = await this.renderGroupedCanvasNodes(file);
        this.openOpenCanvasView(groupedNodes);
    }

    async setActiveCanvas(canvasFile: TFile | null) {
        if (this.activeCanvasFile !== canvasFile) {
            this.activeCanvasFile = canvasFile;
    
            if (canvasFile) {
                console.log(`Active canvas set to: ${canvasFile.path}`);
                try {
                    const groupedNodes = await this.renderGroupedCanvasNodes(canvasFile);
                    await this.openOpenCanvasView(groupedNodes);
                    
                    // Find and store the active Canvas view
                    this.activeCanvasView = this.findCanvasView(canvasFile);
                    if (this.activeCanvasView) {
                        this.injectCustomRendering(this.activeCanvasView);
                    } else {
                        console.error('Active Canvas view not found');
                    }
                } catch (error) {
                    console.error('Error setting active canvas:', error);
                }
            } else {
                console.log('No active canvas');
                this.activeCanvasView = null;
            }
        }
    }

    private findCanvasView(file: TFile): any | null {
        const leaves = this.app.workspace.getLeavesOfType('canvas');
        for (const leaf of leaves) {
            const view = leaf.view as any;
            if (view.file && view.file.path === file.path) {
                return view;
            }
        }
        return null;
    }

    private injectCustomRendering(canvasView: any) {
        if (!canvasView || !canvasView.contentEl) {
            console.error('Canvas view or content element is undefined');
            return;
        }

        // Check if we've already injected our custom rendering
        if (canvasView.contentEl.querySelector('.canvas-file-content-overlay')) {
            return;
        }

        // Create a new layer for our custom rendering
        const overlayContainer = document.createElement('div');
        overlayContainer.addClass('canvas-file-content-overlay');
        canvasView.contentEl.appendChild(overlayContainer);





        return





        // Safely override the render method
        if (canvasView.renderer && typeof canvasView.renderer.render === 'function') {
            const originalRender = canvasView.renderer.render;
            canvasView.renderer.render = () => {
                originalRender.call(canvasView.renderer);
                this.renderFileContents(canvasView, overlayContainer);
            };
        } else {
            console.error('Cannot override render method: renderer or render function not found');
        }
    }

    private renderFileContents(canvasView: any, overlayContainer: HTMLElement) {
        if (!canvasView || !canvasView.canvas || !Array.isArray(canvasView.canvas.nodes)) {
            console.error('Invalid canvas view structure');
            return;
        }

        overlayContainer.empty();
        const nodes = canvasView.canvas.nodes;
        const viewport = canvasView.renderer?.viewport || { x: 0, y: 0 };

        nodes.forEach((node: any) => {
            if (node && node.file && (node.file.extension === 'txt' || node.file.extension === 'ts')) {
                const fileContent = this.plugin.nodeManager.getFileContent(node.id);
                if (fileContent) {
                    const contentEl = document.createElement('div');
                    contentEl.addClass('file-content-popup');
                    const preEl = contentEl.createEl('pre');
                    preEl.textContent = fileContent;
                    overlayContainer.appendChild(contentEl);
                    
                    if (typeof node.getBoundingRect === 'function') {
                        const nodeRect = node.getBoundingRect();
                        contentEl.style.left = `${nodeRect.left + viewport.x}px`;
                        contentEl.style.top = `${nodeRect.top + viewport.y - contentEl.offsetHeight}px`;
                    } else {
                        console.error('Node does not have getBoundingRect method');
                    }
                    
                    // Show content on hover
                    if (node.nodeEl) {
                        node.nodeEl.addEventListener('mouseenter', () => contentEl.style.display = 'block');
                        node.nodeEl.addEventListener('mouseleave', () => contentEl.style.display = 'none');
                    } else {
                        console.error('Node element not found');
                    }
                }
            }
        });
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