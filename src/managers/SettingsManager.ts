import OpenCanvas from '../main';
import { OpenCanvasSettings } from '../types';

export class SettingsManager {
    private plugin: OpenCanvas;

    constructor(plugin: OpenCanvas) {
        this.plugin = plugin;
    }

    async loadSettings() {
        this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS, await this.plugin.loadData());
    }

    async saveSettings() {
        await this.plugin.saveData(this.plugin.settings);
    }

    updateSetting<K extends keyof OpenCanvasSettings>(key: K, value: OpenCanvasSettings[K]) {
        this.plugin.settings[key] = value;
        this.saveSettings();
    }

    getSetting<K extends keyof OpenCanvasSettings>(key: K): OpenCanvasSettings[K] {
        return this.plugin.settings[key];
    }
}

export const DEFAULT_SETTINGS: OpenCanvasSettings = {
    defaultNodeColor: '1',
    defaultEdgeColor: '1',
    enableAutoGrouping: true,
    linkFiltersPath: 'data/link-filters.json',
    linkFilters: {}
};