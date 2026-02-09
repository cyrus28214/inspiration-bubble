export interface MindNode {
    id: string;   // Unique ID (e.g., snake_case from backend)
    text: string; // Display text (e.g., Chinese)
    parent?: string; // Parent ID
    level: number;
    isCore: boolean;
    isCollapsed: boolean;
    x: number;
    y: number;
    vx?: number;
    vy?: number;
    width?: number;
    height?: number;
    subtreeHeight?: number;
}

export interface Thought {
    original: string;
    summary: string;
    keywords: (string | { text?: string; name?: string })[];
}

export interface IdeaInput {
    thoughts: Thought[];
    nodes: MindNode[];
    summary: string;
    inspiration: any[];
    voiceTextHistory: string[];
    showInspiration: boolean;
}
