/** Global UI configuration */
export const APP_CONFIG = {
    /** Whether to show the "AI 正在优化思维导图" overlay mask when updating the mindmap */
    showAnalyzingOverlay: false,
} as const satisfies Record<string, unknown>;

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

export interface InspirationSuggestion {
    title: string;
    description: string;
    reason: string;
    node_id: string;
    parent_node_id: string;
}

export interface IdeaInput {
    thoughts: Thought[];
    nodes: MindNode[];
    summary: string;
    inspiration: InspirationSuggestion[];
    voiceTextHistory: string[];
    showInspiration: boolean;
    autoInspiration: boolean;
}
