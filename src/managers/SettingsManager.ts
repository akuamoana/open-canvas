import OpenCanvas from '../main';
import { OpenCanvasSettings, LinkFilter } from '../types';

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

    addLinkFilter(title: string, url: string) {
        this.plugin.settings.linkFilters.push({ title, url });
        this.saveSettings();
    }

    removeLinkFilter(index: number) {
        this.plugin.settings.linkFilters.splice(index, 1);
        this.saveSettings();
    }

    updateLinkFilter(index: number, title: string, url: string) {
        this.plugin.settings.linkFilters[index] = { title, url };
        this.saveSettings();
    }
}

export const DEFAULT_SETTINGS: OpenCanvasSettings = {
    defaultNodeColor: '1',
    defaultEdgeColor: '1',
    enableAutoGrouping: true,
    linkFilters: []
};