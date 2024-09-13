import { App, TFile, WorkspaceLeaf, EventRef } from 'obsidian';
import * as fs from 'fs';
import * as path from 'path';
import { GroupedNodesView, VIEW_TYPE_GROUPED_NODES } from './GroupedNodesView';
import { CanvasNode, CanvasData, StructuredNode, GroupedNodes, LinkFiltersConfig } from './types';

export default class OpenCanvas {
    private app: App;
    private manifest: any;
    activeCanvasFile: TFile | null = null;
    activeCanvasChangeRef: EventRef | null = null;
    linkFilters: { [key: string]: string } = {};

    constructor(app: App, manifest: any) {
        this.app = app;
        this.manifest = manifest;
    }

    async onload() {
        await this.loadLinkFilters();

        this.app.workspace.on('file-open', async (file: TFile) => {
            if (file && file.extension === 'canvas') {
                await this.handleCanvasOpen(file);
            }
        });

        this.app.workspace.on('active-leaf-change', (leaf) => {
            this.handleActiveLeafChange(leaf);
        });
    }

    async loadLinkFilters() {
        const configPath = 'D:/01_Vaults/Nautilus/.obsidian/plugins/open-canvas/src/link-filters.json'
        console.log('Attempting to load link filters from:', configPath);
        try {
            const configContent = await fs.promises.readFile(configPath, 'utf8');
            const config: LinkFiltersConfig = JSON.parse(configContent);
            this.linkFilters = config.linkFilters || {};
        } catch (error) {
            console.error('Error loading link filters:', error);
            this.linkFilters = {};
        }
        console.log('Link Filters:', this.linkFilters);
    }

    handleActiveLeafChange(leaf: WorkspaceLeaf | null) {
        if (leaf) {
            const view = leaf.view;
            if (view.getViewType() === "canvas") {
                const canvasFile = (view as any).file;
                if (canvasFile && canvasFile instanceof TFile) {
                    this.setActiveCanvas(canvasFile);
                }
            } else {
                this.setActiveCanvas(null);
            }
        }
    }

    async setActiveCanvas(canvasFile: TFile | null) {
        if (this.activeCanvasFile !== canvasFile) {
            if (this.activeCanvasChangeRef) {
                this.app.vault.offref(this.activeCanvasChangeRef);
                this.activeCanvasChangeRef = null;
            }

            this.activeCanvasFile = canvasFile;

            if (canvasFile) {
                console.log(`Active canvas set to: ${canvasFile.path}`);
                
                const groupedNodes = await this.renderGroupedCanvasNodes(canvasFile);
                this.openGroupedNodesView(groupedNodes);
                
                this.activeCanvasChangeRef = this.app.vault.on('modify', (file: TFile) => {
                    if (file === this.activeCanvasFile) {
                        this.handleCanvasChange(file);
                    }
                });
            } else {
                console.log('No active canvas');
            }
        }
    }

    async handleCanvasOpen(file: TFile) {
        console.log(`Canvas opened: ${file.path}`);
        await this.setActiveCanvas(file);
    }

    async handleCanvasChange(file: TFile) {
        console.log(`Active canvas changed: ${file.path}`);
        const groupedNodes = await this.renderGroupedCanvasNodes(file);
        this.openGroupedNodesView(groupedNodes);
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

            canvasData.nodes.forEach(node => {
                const structuredNode = this.createStructuredNode(node);

                switch ((node as CanvasNode).type) {
                    case 'text':
                    case 'file':
                    case 'group':
                        (groupedNodes[node.type] as StructuredNode[]).push(structuredNode);
                        break;
                    case 'link':
                        this.categorizeLink(groupedNodes.link, structuredNode);
                        break;
                    default:
                        console.warn(`Unknown node type: ${node.type}`);
                }
            });

            return groupedNodes;
        } catch (error) {
            console.error('Error rendering grouped canvas nodes:', error);
            return { text: [], file: [], group: [], link: { other: [] } };
        }
    }

    createStructuredNode(node: CanvasNode): StructuredNode {
        const structuredNode: StructuredNode = {
            id: node.id,
            type: node.type,
            position: { x: node.x, y: node.y },
            size: { width: node.width, height: node.height }
        };

        if (node.type === 'text' && node.text) {
            structuredNode.content = node.text;
        } else if (node.type === 'file' && node.file) {
            structuredNode.content = { file: node.file };
        } else if (node.type === 'link' && node.url) {
            structuredNode.content = { url: node.url };
        }

        const standardFields = ['id', 'type', 'x', 'y', 'width', 'height', 'text', 'file', 'url'];
        const customData = Object.keys(node)
            .filter(key => !standardFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = (node as any)[key];
                return obj;
            }, {} as any);

        if (Object.keys(customData).length > 0) {
            structuredNode.customData = customData;
        }

        return structuredNode;
    }

    categorizeLink(linkGroup: GroupedNodes['link'], node: StructuredNode) {
        if (node.content && typeof node.content === 'object' && 'url' in node.content) {
            const url = node.content.url;
            const matchedFilter = Object.entries(this.linkFilters).find(([_, filterUrl]) => url.includes(filterUrl));
            
            if (matchedFilter) {
                const [filterName] = matchedFilter;
                if (!linkGroup[filterName]) {
                    linkGroup[filterName] = [];
                }
                linkGroup[filterName].push(node);
            } else {
                linkGroup.other.push(node);
            }
        } else {
            linkGroup.other.push(node);
        }
    }

    async activateView() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_GROUPED_NODES);

        const rightLeaf = this.app.workspace.getRightLeaf(false);
        if (rightLeaf) {
            await rightLeaf.setViewState({
                type: VIEW_TYPE_GROUPED_NODES,
                active: true,
            });
        } else {
            console.error('Failed to get right leaf');
        }

        this.app.workspace.revealLeaf(
            this.app.workspace.getLeavesOfType(VIEW_TYPE_GROUPED_NODES)[0]
        );
    }

    async updateGroupedNodesView(groupedNodes: GroupedNodes) {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_GROUPED_NODES);
        if (leaves.length === 0) {
            await this.activateView();
        }
        const leaf = leaves[0];
        const view = leaf.view as GroupedNodesView;
        await view.setGroupedNodes(groupedNodes);
    }

    async openGroupedNodesView(groupedNodes?: GroupedNodes) {
        if (!groupedNodes && this.activeCanvasFile) {
            this.renderGroupedCanvasNodes(this.activeCanvasFile).then(nodes => {
                this.updateGroupedNodesView(nodes);
            });
        } else if (groupedNodes) {
            await this.updateGroupedNodesView(groupedNodes);
        } else {
            console.log('No active canvas to display grouped nodes');
        }
    }

    onunload() {
        if (this.activeCanvasChangeRef) {
            this.app.vault.offref(this.activeCanvasChangeRef);
        }
    }
}