import { Plugin, Modal,TAbstractFile, TFile, WorkspaceLeaf, View, App, PluginSettingTab, Setting, Notice } from 'obsidian';
import { PluginView, VIEW_TYPE_OPEN_CANVAS } from './views/PluginView';
import { CanvasManager } from './managers/CanvasManager';
import { NodeManager } from './managers/NodeManager';
import { LinkManager } from './managers/LinkManager';
import { SettingsManager } from './managers/SettingsManager';
import { OpenCanvasSettings } from './types';

import * as fs from 'fs';
import * as path from 'path';

interface Node {
    detach(): void;
    empty(): void;
    insertAfter<T extends Node>(node: T, child: Node | null): T;
    indexOf(other: Node): number;
    setChildrenInPlace(children: Node[]): void;
    appendText(val: string): void;
    /**
     * Cross-window capable instanceof check, a drop-in replacement
     * for instanceof checks on DOM Nodes. Remember to also check
     * for nulls when necessary.
     * @param type
     */
    instanceOf<T>(type: {
        new (): T;
    }): this is T;
    /**
     * The document this node belongs to, or the global document.
     */
    doc: Document;
    /**
     * The window object this node belongs to, or the global window.
     */
    win: Window;
    constructorWin: Window;
}

export default class OpenCanvas extends Plugin {
    settings: OpenCanvasSettings;
    canvasManager: CanvasManager;
    nodeManager: NodeManager;
    linkManager: LinkManager;
    settingsManager: SettingsManager;

    async onload() {
        console.log('Loading OpenCanvas plugin');

        await this.loadSettings();
        this.initializeManagers();
        this.registerViews();
        this.addCommands();
        this.addEventListeners();
        this.registerCodeBlockProcessor();

        this.addSettingTab(new OpenCanvasSettingTab(this.app, this));

        console.log('OpenCanvas plugin loaded');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    initializeManagers() {
        this.settingsManager = new SettingsManager(this);
        this.canvasManager = new CanvasManager(this.app, this);
        this.nodeManager = new NodeManager(this.app, this);
        this.linkManager = new LinkManager(this.app, this);
    }

    registerViews() {
        this.registerView(
            VIEW_TYPE_OPEN_CANVAS,
            (leaf: WorkspaceLeaf) => new PluginView(leaf, this)
        );
    }

    addCommands() {
        this.addCommand({
            id: 'open-open-canvas-view',
            name: 'Open OpenCanvas View',
            callback: () => this.canvasManager.openOpenCanvasView(),
        });
        this.addCommand({
            id: 'refresh-canvas',
            name: 'Refresh Canvas View',
            callback: () => {
                const activeLeaf = this.app.workspace.activeLeaf as any;
                if (activeLeaf && activeLeaf.view.getViewType() === 'canvas') {
                    console.log(activeLeaf)
                    activeLeaf.view.canvas.addNode(Node)
                    

                    new Notice('Canvas view refreshed');
                } else {
                    new Notice('Active view is not a canvas');
                }
            }
        });
        this.addCommand({
            id: 'create-DocDB-filesTree',
            name: 'Create DocDB filesTree',
            callback: () => {
                new CreateDatabaseModal(this.app, (result, vaultPath) => {
                    if (!result) {
                        new Notice('Database name cannot be empty');
                        return;
                    }
        
                    const basePath = "D:/01_Vaults/Nautilus/";
                    const fullDirectoryPath = basePath + '/' + vaultPath + '/' + `${result}-DocDB`;
                    const vaultDirectoryPath = vaultPath + '/' + `${result}-DocDB`;
        
                    if (!fs.existsSync(fullDirectoryPath)) {
                        fs.mkdirSync(fullDirectoryPath, { recursive: true });
        
                        const filesToCreate = [
                            `${result}-DB_Automations.canvas`,
                            `${result}-DB_Properties.canvas`,
                            `${result}-DB_RnD.canvas`,
                            `${result}-DB_Templates.canvas`,
                            `${result}-DB_Views.canvas`,
                            `${result}-Flowchart.canvas`,
                            `${result}-DocDB.canvas`
                        ];
        
                        const defaultCanvasContent = JSON.stringify({
                            nodes: [],
                            edges: [],
                            metadata: {}
                        }, null, 2);
        
                        filesToCreate.forEach(file => {
                            fs.writeFileSync(path.join(fullDirectoryPath, file), defaultCanvasContent);
                        });
        
                        const mainCanvasContent = {
                            nodes: [
                                {
                                    id: "f3e04de8a12428d2",
                                    type: "group",
                                    styleAttributes: {},
                                    x: 3760,
                                    y: -600,
                                    width: 3003,
                                    height: 460,
                                    color: "4",
                                    label: "Downstream Databases Relations"
                                },
                                {
                                    id: "52d51a575c5f6849",
                                    type: "group",
                                    styleAttributes: {},
                                    x: 3763,
                                    y: -2120,
                                    width: 3000,
                                    height: 460,
                                    color: "4",
                                    label: "Upstream Databases Relations"
                                },
                                {
                                    id: "c35d3b396aa1e778",
                                    type: "group",
                                    styleAttributes: {},
                                    x: 3160,
                                    y: -2120,
                                    width: 560,
                                    height: 1980,
                                    color: "4",
                                    label: "Alternative Databases Relations"
                                },
                                {
                                    id: "b8876f64dcb178eb",
                                    type: "file",
                                    file: vaultDirectoryPath + `/${result}-DB_Properties.canvas`,
                                    styleAttributes: {},
                                    x: 2122,
                                    y: -2120,
                                    width: 1000,
                                    height: 540
                                },
                                {
                                    id: "866c0defedb61927",
                                    type: "file",
                                    file: vaultDirectoryPath + `/${result}-DB_Templates.canvas`,
                                    styleAttributes: {},
                                    x: 1122,
                                    y: -2120,
                                    width: 1000,
                                    height: 540
                                },
                                {
                                    id: "9839f73ab6dde6af",
                                    type: "file",
                                    file: vaultDirectoryPath + `/${result}-DB_Automations.canvas`,
                                    styleAttributes: {},
                                    x: 122,
                                    y: -2120,
                                    width: 1000,
                                    height: 540
                                },
                                {
                                    id: "316396ad0aebc58f",
                                    type: "file",
                                    file: vaultDirectoryPath + `/${result}-DB_RnD.canvas`,
                                    styleAttributes: {},
                                    x: 122,
                                    y: -677,
                                    width: 1500,
                                    height: 537
                                },
                                {
                                    id: "e3477b0b4e16970f",
                                    type: "file",
                                    file: vaultDirectoryPath + `/${result}-DB_Views.canvas`,
                                    styleAttributes: {},
                                    x: 1622,
                                    y: -677,
                                    width: 1500,
                                    height: 537
                                },
                                {
                                    id: "b583b0a19ae0bed4",
                                    type: "file",
                                    file: vaultDirectoryPath + `/${result}-Flowchart.canvas`,
                                    styleAttributes: {},
                                    x: 122,
                                    y: -1460,
                                    width: 3000,
                                    height: 723
                                },
                                {
                                    id: "a5f078fd4f52b14b",
                                    type: "text",
                                    text: "# Weeks | `relation`",
                                    styleAttributes: {
                                        textAlign: "center"
                                    },
                                    x: 6383,
                                    y: -2100,
                                    width: 340,
                                    height: 80,
                                    color: "5"
                                },
                                {
                                    id: "5aba3d066da7ea51",
                                    type: "link",
                                    url: "https://www.notion.so/82811053840f473386247a42e0225e03?pvs=4",
                                    styleAttributes: {},
                                    x: 3763,
                                    y: -1580,
                                    width: 3000,
                                    height: 903
                                },
                                {
                                    id: "5710d941d7a03836",
                                    type: "text",
                                    text: "# Properties",
                                    styleAttributes: {
                                        textAlign: "center"
                                    },
                                    x: 122,
                                    y: -1520,
                                    width: 3000,
                                    height: 60,
                                    color: "3"
                                },
                                {
                                    id: "4c33a83a92b7dc69",
                                    type: "text",
                                    text: "# Flowchart",
                                    styleAttributes: {
                                        textAlign: "center"
                                    },
                                    x: 2122,
                                    y: -1580,
                                    width: 1000,
                                    height: 60,
                                    color: "3"
                                },
                                {
                                    id: "e1fc5c679c1d320a",
                                    type: "text",
                                    text: "# Templates",
                                    styleAttributes: {
                                        textAlign: "center"
                                    },
                                    x: 1122,
                                    y: -1580,
                                    width: 1000,
                                    height: 60,
                                    color: "3"
                                },
                                {
                                    id: "9bd44ccb8bc3982b",
                                    type: "text",
                                    text: "# Automations",
                                    styleAttributes: {
                                        textAlign: "center"
                                    },
                                    x: 122,
                                    y: -1580,
                                    width: 1000,
                                    height: 60,
                                    color: "3"
                                },
                                {
                                    id: "4c58cba2b3c775d1",
                                    type: "text",
                                    text: "# RnD",
                                    styleAttributes: {
                                        textAlign: "center"
                                    },
                                    x: 122,
                                    y: -737,
                                    width: 1500,
                                    height: 60,
                                    color: "3"
                                },
                                {
                                    id: "98f29bd66723282a",
                                    type: "text",
                                    text: "# Views\n",
                                    styleAttributes: {
                                        textAlign: "center"
                                    },
                                    x: 1622,
                                    y: -737,
                                    width: 1500,
                                    height: 60,
                                    color: "3"
                                }
                            ],
                            edges: [
                                {
                                    id: "838c088612f777a6",
                                    styleAttributes: {
                                        pathfindingMethod: "direct"
                                    },
                                    fromNode: "5aba3d066da7ea51",
                                    fromSide: "top",
                                    toNode: "52d51a575c5f6849",
                                    toSide: "bottom",
                                    color: "3"
                                },
                                {
                                    id: "c278e80dca42260c",
                                    styleAttributes: {
                                        pathfindingMethod: "direct"
                                    },
                                    fromNode: "f3e04de8a12428d2",
                                    fromSide: "top",
                                    toNode: "5aba3d066da7ea51",
                                    toSide: "bottom",
                                    color: "3"
                                }
                            ],
                            metadata: {}
                        };
        
                        fs.writeFileSync(path.join(fullDirectoryPath, `${result}-DocDB.canvas`), JSON.stringify(mainCanvasContent, null, 2));
        
                        new Notice('DocDB filesTree created successfully');
                    } else {
                        new Notice('Directory already exists');
                    }
                }).open();
            },
        });
        // Add more commands here as needed
    }

    addEventListeners() {
        this.registerEvent(
            this.app.workspace.on('file-open', this.handleFileOpen.bind(this))
        );
        this.registerEvent(
            this.app.workspace.on('active-leaf-change', this.handleActiveLeafChange.bind(this))
        );
        this.registerEvent(
            this.app.vault.on('modify', this.handleFileModify.bind(this))
        );
    }

    handleFileOpen(file: TFile | null) {
        if (file && file.extension === 'canvas') {
            this.canvasManager.handleCanvasOpen(file);
        }
    }

    handleActiveLeafChange(leaf: WorkspaceLeaf | null) {
        if (leaf) {
            const view = leaf.view;
            if (this.isCanvasView(view)) {
                const canvasFile = (view as any).file;
                if (canvasFile instanceof TFile) {
                    this.canvasManager.setActiveCanvas(canvasFile);
                }
            } else {
                this.canvasManager.setActiveCanvas(null);
            }
        }
    }

    handleFileModify(file: TAbstractFile) {
        if (file instanceof TFile && file.extension === 'canvas') {
            this.canvasManager.handleCanvasChange(file);
        }
    }

    isCanvasView(view: View): view is any {
        return view.getViewType() === "canvas";
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    onunload() {
        console.log('Unloading OpenCanvas plugin');
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_OPEN_CANVAS);
    }
    registerCodeBlockProcessor() {
        this.registerMarkdownCodeBlockProcessor("file-content", (source, el, ctx) => {
            const firstLine = source.split('\n')[0];
            const filePath = firstLine.trim();
            const content = source.split('\n').slice(1).join('\n');

            const filePathEl = el.createEl('div', { text: `File: ${filePath}`, cls: 'file-path' });
            const contentEl = el.createEl('pre', { cls: 'file-content' });
            contentEl.createEl('code', { text: content });

            // Add hover effect
            el.addEventListener('mouseenter', () => {
                filePathEl.style.display = 'block';
            });
            el.addEventListener('mouseleave', () => {
                filePathEl.style.display = 'none';
            });
        });
    }
}

const DEFAULT_SETTINGS: Partial<OpenCanvasSettings> = {
    defaultNodeColor: '1',
    defaultEdgeColor: '1',
    enableAutoGrouping: true,
    linkFilters: []
};

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
            .setName('Default Node Color')
            .setDesc('Choose the default color for new nodes')
            .addDropdown(dropdown => dropdown
                .addOption('1', 'Red')
                .addOption('2', 'Orange')
                .addOption('3', 'Yellow')
                .addOption('4', 'Green')
                .addOption('5', 'Cyan')
                .addOption('6', 'Purple')
                .setValue(this.plugin.settings.defaultNodeColor)
                .onChange(async (value) => {
                    this.plugin.settings.defaultNodeColor = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Enable Auto Grouping')
            .setDesc('Automatically group nodes based on their type')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableAutoGrouping)
                .onChange(async (value) => {
                    this.plugin.settings.enableAutoGrouping = value;
                    await this.plugin.saveSettings();
                }));

                new Setting(containerEl)
                .setName('Link Filters')
                .setDesc('Add, remove, or edit link filters')
                .addButton(button => button
                    .setButtonText('Add New Filter')
                    .onClick(() => {
                        if (!Array.isArray(this.plugin.settings.linkFilters)) {
                            this.plugin.settings.linkFilters = [];
                        }
                        this.plugin.settingsManager.addLinkFilter('New_Filter', 'https://example.com');
                        this.display();
                    }));
    
            if (Array.isArray(this.plugin.settings.linkFilters) && this.plugin.settings.linkFilters.length > 0) {
                this.plugin.settings.linkFilters.forEach((filter, index) => {
                    const filterSetting = new Setting(containerEl)
                        .addText(text => text
                            .setPlaceholder('Filter Title')
                            .setValue(filter.title)
                            .onChange(async (value) => {
                                this.plugin.settingsManager.updateLinkFilter(index, value, filter.url);
                            }))
                        .addText(text => text
                            .setPlaceholder('URL')
                            .setValue(filter.url)
                            .onChange(async (value) => {
                                this.plugin.settingsManager.updateLinkFilter(index, filter.title, value);
                            }))
                        .addButton(button => button
                            .setButtonText('Remove')
                            .onClick(() => {
                                this.plugin.settingsManager.removeLinkFilter(index);
                                this.display();
                            }));
                });
            } else {
                new Setting(containerEl)
                    .setDesc('No link filters added yet. Click "Add New Filter" to create one.');
            }
        }
    }

class CreateDatabaseModal extends Modal {
    result: string;
    vaultPath: string;
    onSubmit: (result: string, vaultPath: string) => void;

    constructor(app: App, onSubmit: (result: string, vaultPath: string) => void) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl("h1", { text: "Create DocDB filesTree" });

        new Setting(contentEl)
            .setName("Database name")
            .addText((text) =>
                text.onChange((value) => {
                    this.result = value;
                }));

        new Setting(contentEl)
            .setName("Vault path")
            .setDesc("Path inside the vault (e.g., 'References/Life-OS/Cycles')")
            .addText((text) =>
                text.onChange((value) => {
                    this.vaultPath = value;
                }));

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("Submit")
                    .setCta()
                    .onClick(() => {
                        this.close();
                        this.onSubmit(this.result, this.vaultPath);
                    }));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
