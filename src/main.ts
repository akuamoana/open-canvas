import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, TAbstractFile, CachedMetadata, EventRef, TFile } from 'obsidian';

interface OpenCanvasSettings {
    customNodeTypes: CustomNodeType[];
}

interface CustomNodeType {
    id: string;
    name: string;
    description: string;
    defaultData: any;
}

const DEFAULT_SETTINGS: OpenCanvasSettings = {
    customNodeTypes: []
}

interface CanvasData {
    nodes: CanvasNode[];
    edges: any[]; // We're not modifying edges in this example
}

interface CanvasNode {
    id: string;
    type: string;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    customData?: {
        type: string;
        data: any;
    };
}

interface CanvasState {
    leaf: WorkspaceLeaf;
    isActive: boolean;
    customNodes: Map<string, CustomNodeType>;
}

type CustomNodeRenderer = (data: any, element: HTMLElement) => void;

export default class OpenCanvas extends Plugin {
    settings: OpenCanvasSettings;
    canvasStates: Map<string, CanvasState> = new Map();
    activeCanvasPath: string | null = null;
    customNodeRenderers: Map<string, CustomNodeRenderer> = new Map();

    async onload() {
        await this.loadSettings();

        this.registerEvent(
            this.app.workspace.on('active-leaf-change', (leaf) => {
                this.handleActiveLeafChange(leaf);
            })
        );

        this.registerEvent(
            this.app.workspace.on('layout-change', () => {
                this.updateCanvasStates();
            })
        );

        this.registerEvent(
            this.app.workspace.on('file-open', (file: TFile) => {
                if (file && file.extension === 'canvas') {
                    this.handleCanvasOpen(file);
                }
            })
        );

        // Add a command to create each type of custom node
        this.settings.customNodeTypes.forEach(nodeType => {
            this.addCommand({
                id: `create-${nodeType.id}-node`,
                name: `Create ${nodeType.name} Node`,
                callback: () => this.createCustomNode(nodeType.id)
            });
        });

        // Add the settings tab
        this.addSettingTab(new OpenCanvasSettingTab(this.app, this));

        // Register a default custom node renderer
        this.registerCustomNodeRenderer('default', (data, element) => {
            element.createEl('div', { text: data.text || 'Custom Node' });
        });
    }

    handleActiveLeafChange(leaf: WorkspaceLeaf | null) {
        if (leaf) {
            const view = leaf.view;
            if (view.getViewType() === "canvas") {
                const canvasPath = (view as any).file?.path;
                if (canvasPath) {
                    this.setActiveCanvas(canvasPath);
                    console.log(`Canvas became active: ${canvasPath}`);
                    this.updateCanvasUI();
                }
            } else {
                this.setActiveCanvas(null);
            }
        }
    }

    updateCanvasStates() {
        const newCanvasStates = new Map<string, CanvasState>();

        this.app.workspace.iterateAllLeaves((leaf) => {
            if (leaf.view.getViewType() === "canvas") {
                const canvasPath = (leaf.view as any).file?.path;
                if (canvasPath) {
                    newCanvasStates.set(canvasPath, {
                        leaf: leaf,
                        isActive: canvasPath === this.activeCanvasPath,
                        customNodes: this.canvasStates.get(canvasPath)?.customNodes || new Map(),
                    });
                }
            }
        });

        // Handle closed canvases
        for (const [path, state] of this.canvasStates) {
            if (!newCanvasStates.has(path)) {
                console.log(`Canvas closed: ${path}`);
                // Implement any cleanup logic for closed canvases here
            }
        }

        // Handle newly opened canvases
        for (const [path, state] of newCanvasStates) {
            if (!this.canvasStates.has(path)) {
                console.log(`New canvas opened: ${path}`);
                // Implement any initialization logic for new canvases here
            }
        }

        this.canvasStates = newCanvasStates;
        this.updateCanvasUI();
    }

    setActiveCanvas(canvasPath: string | null) {
        if (this.activeCanvasPath !== canvasPath) {
            if (this.activeCanvasPath) {
                const oldActiveState = this.canvasStates.get(this.activeCanvasPath);
                if (oldActiveState) {
                    oldActiveState.isActive = false;
                }
            }

            this.activeCanvasPath = canvasPath;

            if (canvasPath) {
                const newActiveState = this.canvasStates.get(canvasPath);
                if (newActiveState) {
                    newActiveState.isActive = true;
                }
            }

            this.updateCanvasUI();
        }
    }

    updateCanvasUI() {
        console.log("Updating canvas UI");
        for (const [path, state] of this.canvasStates) {
            console.log(`Canvas: ${path}, Active: ${state.isActive}`);
            this.renderCustomNodes(state);
        }
    }

    registerCustomNodeType(nodeType: CustomNodeType) {
        this.settings.customNodeTypes.push(nodeType);
        this.saveSettings();

        // Add a command for the new node type
        this.addCommand({
            id: `create-${nodeType.id}-node`,
            name: `Create ${nodeType.name} Node`,
            callback: () => this.createCustomNode(nodeType.id)
        });
    }

    registerCustomNodeRenderer(type: string, renderer: CustomNodeRenderer) {
        this.customNodeRenderers.set(type, renderer);
    }

    async handleCanvasOpen(file: TFile) {
        const content = await this.app.vault.read(file);
        const canvasData: CanvasData = JSON.parse(content);
        this.modifyCanvasNodes(canvasData);
        await this.app.vault.modify(file, JSON.stringify(canvasData, null, 2));
    }

    modifyCanvasNodes(canvasData: CanvasData) {
        canvasData.nodes.forEach(node => {
            if (node.type === "custom" && node.customData) {
                this.applyCustomNodeStyle(node);
            }
        });
    }

    applyCustomNodeStyle(node: CanvasNode) {
        console.log(`Applying custom style to node: ${node.id}`);
        const nodeElement = document.getElementById(node.id);
        if (nodeElement && node.customData) {
            const renderer = this.customNodeRenderers.get(node.customData.type) || this.customNodeRenderers.get('default');
            if (renderer) {
                renderer(node.customData.data, nodeElement);
            }
        }
    }

    async createCustomNode(typeId: string) {
        const nodeType = this.settings.customNodeTypes.find(type => type.id === typeId);
        if (!nodeType) {
            new Notice(`Custom node type ${typeId} not found`);
            return;
        }

        const activeLeaf = this.app.workspace.activeLeaf;
        if (activeLeaf && activeLeaf.view.getViewType() === "canvas") {
            const canvasView = activeLeaf.view as any; // Cast to any to access canvas properties
            const canvasFile = canvasView.file;

            if (canvasFile && canvasFile instanceof TFile) {
                try {
                    // Read the current canvas file content
                    const content = await this.app.vault.read(canvasFile);
                    const canvasData = JSON.parse(content);

                    // Create the new node
                    const newNode = {
                        id: this.generateUniqueId(),
                        type: "custom", // Set type as "custom" to differentiate from standard nodes
                        x: 0,
                        y: 0,
                        width: 200,
                        height: 100,
                        text: nodeType.name,
                        customData: {
                            type: nodeType.id,
                            data: nodeType.defaultData
                        }
                    };

                    // Add the new node to the canvas data
                    canvasData.nodes.push(newNode);

                    // Write the updated canvas data back to the file
                    await this.app.vault.modify(canvasFile, JSON.stringify(canvasData, null, 2));

                    // Refresh the canvas view
                    canvasView.load();

                    new Notice(`Created new ${nodeType.name} node`);
                } catch (error) {
                    console.error("Error creating custom node:", error);
                    new Notice("Failed to create custom node. Check console for details.");
                }
            }
        } else {
            new Notice("Please open a canvas before creating a custom node");
        }
    }

    generateUniqueId(): string {
        return 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    renderCustomNodes(state: CanvasState) {
        state.customNodes.forEach((nodeType, nodeId) => {
            const nodeElement = document.getElementById(nodeId);
            if (nodeElement) {
                const renderer = this.customNodeRenderers.get(nodeType.id) || this.customNodeRenderers.get('default');
                if (renderer) {
                    renderer(nodeType.defaultData, nodeElement);
                }
            }
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class OpenCanvasSettingTab extends PluginSettingTab {
    plugin: OpenCanvas;

    constructor(app: App, plugin: OpenCanvas) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        containerEl.createEl('h2', {text: 'OpenCanvas Settings'});

        new Setting(containerEl)
            .setName('Custom Node Types')
            .setDesc('Manage your custom node types')
            .addButton(button => button
                .setButtonText('Add Custom Node Type')
                .onClick(() => {
                    new CustomNodeTypeModal(this.app, this.plugin).open();
                }));

        // Display existing custom node types
        this.plugin.settings.customNodeTypes.forEach(nodeType => {
            new Setting(containerEl)
                .setName(nodeType.name)
                .setDesc(nodeType.description)
                .addButton(button => button
                    .setButtonText('Edit')
                    .onClick(() => {
                        new CustomNodeTypeModal(this.app, this.plugin, nodeType).open();
                    }))
                .addButton(button => button
                    .setButtonText('Delete')
                    .onClick(() => {
                        this.plugin.settings.customNodeTypes = this.plugin.settings.customNodeTypes.filter(t => t.id !== nodeType.id);
                        this.plugin.saveSettings();
                        this.display(); // Refresh the settings tab
                    }));
        });
    }
}

class CustomNodeTypeModal extends Modal {
    plugin: OpenCanvas;
    nodeType: CustomNodeType | null;

    constructor(app: App, plugin: OpenCanvas, nodeType: CustomNodeType | null = null) {
        super(app);
        this.plugin = plugin;
        this.nodeType = nodeType;
    }

    onOpen() {
        const {contentEl} = this;
        contentEl.createEl('h2', {text: this.nodeType ? 'Edit Custom Node Type' : 'Add Custom Node Type'});

        new Setting(contentEl)
            .setName('ID')
            .addText(text => text
                .setValue(this.nodeType?.id || '')
                .onChange(value => {
                    if (this.nodeType) this.nodeType.id = value;
                }));

        new Setting(contentEl)
            .setName('Name')
            .addText(text => text
                .setValue(this.nodeType?.name || '')
                .onChange(value => {
                    if (this.nodeType) this.nodeType.name = value;
                }));

        new Setting(contentEl)
            .setName('Description')
            .addText(text => text
                .setValue(this.nodeType?.description || '')
                .onChange(value => {
                    if (this.nodeType) this.nodeType.description = value;
                }));

        new Setting(contentEl)
            .setName('Default Data')
            .addTextArea(textarea => textarea
                .setValue(this.nodeType ? JSON.stringify(this.nodeType.defaultData, null, 2) : '{}')
                .onChange(value => {
                    if (this.nodeType) {
                        try {
                            this.nodeType.defaultData = JSON.parse(value);
                        } catch (e) {
                            console.error('Invalid JSON for default data');
                        }
                    }
                }));

        new Setting(contentEl)
            .addButton(button => button
                .setButtonText(this.nodeType ? 'Save Changes' : 'Add Node Type')
                .onClick(() => {
                    if (this.nodeType) {
                        // Update existing node type
                        this.plugin.saveSettings();
                    } else {
                        // Add new node type
                        const newNodeType: CustomNodeType = {
                            id: (contentEl.querySelector('[placeholder="ID"]') as HTMLInputElement).value,
                            name: (contentEl.querySelector('[placeholder="Name"]') as HTMLInputElement).value,
                            description: (contentEl.querySelector('[placeholder="Description"]') as HTMLInputElement).value,
                            defaultData: JSON.parse((contentEl.querySelector('textarea') as HTMLTextAreaElement).value)
                        };
                        this.plugin.registerCustomNodeType(newNodeType);
                    }
                    this.close();
                }));
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}