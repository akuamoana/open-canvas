import { Plugin, TAbstractFile, TFile, WorkspaceLeaf, View } from 'obsidian';
import { PluginView, VIEW_TYPE_OPEN_CANVAS } from './views/PluginView';
import { CanvasManager } from './managers/CanvasManager';
import { NodeManager } from './managers/NodeManager';
import { LinkManager } from './managers/LinkManager';
import { SettingsManager } from './managers/SettingsManager';
import { OpenCanvasSettings } from './types';

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
}

const DEFAULT_SETTINGS: Partial<OpenCanvasSettings> = {
    defaultNodeColor: '1',
    defaultEdgeColor: '1',
    enableAutoGrouping: true,
    linkFiltersPath: 'data/link-filters.json',
    linkFilters: {}
};

import { App, PluginSettingTab, Setting } from 'obsidian';

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
            .setName('Link Filters Path')
            .setDesc('Path to the link filters JSON file')
            .addText(text => text
                .setPlaceholder('data/link-filters.json')
                .setValue(this.plugin.settings.linkFiltersPath)
                .onChange(async (value) => {
                    this.plugin.settings.linkFiltersPath = value;
                    await this.plugin.saveSettings();
                }));
    }
}