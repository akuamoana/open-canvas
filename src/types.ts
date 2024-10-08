// Canvas Node Types
export interface BaseNode {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color?: CanvasColor;
}

export interface TextNode extends BaseNode {
    type: 'text';
    text: string;
}

export interface FileNode extends BaseNode {
    type: 'file';
    file: string;
    subpath?: string;
}

export interface LinkNode extends BaseNode {
    type: 'link';
    url: string;
}

export interface GroupNode extends BaseNode {
    type: 'group';
    label?: string;
    background?: string;
    backgroundStyle?: 'cover' | 'ratio' | 'repeat';
}

export type CanvasNode = TextNode | FileNode | LinkNode | GroupNode;

// Canvas Edge Types
export interface CanvasEdge {
    id: string;
    fromNode: string;
    fromSide?: 'top' | 'right' | 'bottom' | 'left';
    fromEnd?: 'none' | 'arrow';
    toNode: string;
    toSide?: 'top' | 'right' | 'bottom' | 'left';
    toEnd?: 'none' | 'arrow';
    color?: CanvasColor;
    label?: string;
}

// Canvas Data Structure
export interface CanvasData {
    nodes: CanvasNode[];
    edges: CanvasEdge[];
}

// Updated Structured Node for Grouped View
export interface StructuredNode {
    id: string;
    type: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    content?: string | { file: string; subpath?: string } | { url: string };
    color?: CanvasColor;
    customData?: {
        label?: string;
        background?: string;
        backgroundStyle?: 'cover' | 'ratio' | 'repeat';
    };
    fileContent?: string | null; // New property for file content
}

// Grouped Nodes Structure
export interface GroupedNodes {
    text: StructuredNode[];
    file: StructuredNode[];
    group: StructuredNode[];
    link: {
        [filterName: string]: StructuredNode[];
        other: StructuredNode[];
    };
}

// Updated Plugin Settings
export interface OpenCanvasSettings {
    defaultNodeColor: CanvasColor;
    defaultEdgeColor: CanvasColor;
    enableAutoGrouping: boolean;
    linkFilters: LinkFilter[];
}

// New interface for link filters
export interface LinkFilter {
    title: string;
    url: string;
}

// Canvas Color Type
export type CanvasColor = string | '1' | '2' | '3' | '4' | '5' | '6';