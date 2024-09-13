import { Plugin } from 'obsidian';
import OpenCanvas from './OpenCanvas';
import { GroupedNodesView, VIEW_TYPE_GROUPED_NODES } from './GroupedNodesView';

export default class OpenCanvasPlugin extends Plugin {
    private openCanvas: OpenCanvas;

    async onload() {
        this.openCanvas = new OpenCanvas(this.app, this.manifest);

        this.registerView(
            VIEW_TYPE_GROUPED_NODES,
            (leaf) => new GroupedNodesView(leaf)
        );

        this.addCommand({
            id: 'open-grouped-nodes-view',
            name: 'Open Grouped Nodes View',
            callback: () => this.openCanvas.openGroupedNodesView(),
        });

        await this.openCanvas.onload();
    }

    async onunload() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_GROUPED_NODES);
        await this.openCanvas.onunload();
    }
}