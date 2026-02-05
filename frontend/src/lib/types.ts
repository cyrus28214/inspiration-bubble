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

export interface Connection {
    source: string; // keyword id
    target: string; // keyword id
    strength: number;
}

export interface IdeaInput {
    thoughts: any[];
    nodes: MindNode[];
    connections: Connection[];
    summary: string;
    inspiration: any[];
    voiceTextHistory: string[];
    showInspiration: boolean;
    isAnalyzing?: boolean;
    zoom: {
        scale: number;
        min: number;
        max: number;
        offsetX: number;
        offsetY: number;
    };
}
