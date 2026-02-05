// Type definitions matching Backend Pydantic models
export interface APIKeyword {
    name: string;
    level: number;
    isCore: boolean;
    parent?: string | null;
}

export interface APIConnection {
    source: string;
    target: string;
    strength: number;
}

export interface APIThought {
    original: string;
    summary: string;
    keywords: string[];
}

export interface APIInspirationItem {
    title: string;
    link: string;
    snippet: string;
}

export interface AnalyzeResponse {
    summary: string;
    keywords: APIKeyword[];
    connections: APIConnection[];
    thoughts: APIThought[];
    inspiration: APIInspirationItem[];
}

export interface SummarizeResponse {
    summary: string;
    tags: string[];
}

export interface InspirationResponse {
    items: APIInspirationItem[];
}

export interface MindmapNode {
    id: string;
    text: string;
    children: string[];
}

export interface MindmapUpdateRequest {
    messages: string[];
    mindmap?: Record<string, MindmapNode>;
}

export interface MindmapUpdateResponse {
    summary: string;
    updated_nodes: MindmapNode[];
}

// API Client
export const api = {
    analyze: async (text: string, context_history: string[] = []): Promise<AnalyzeResponse> => {
        const response = await fetch('/api/v1/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, context_history })
        });
        if (!response.ok) throw new Error('Failed to analyze idea');
        return response.json();
    },

    summarize: async (title: string, content: string): Promise<SummarizeResponse> => {
        const response = await fetch('/api/v1/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });
        if (!response.ok) throw new Error('Failed to summarize content');
        return response.json();
    },

    getInspiration: async (query: string): Promise<InspirationResponse> => {
        const response = await fetch(`/api/v1/inspiration?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to get inspiration');
        return response.json();
    },

    updateMindmap: async (req: MindmapUpdateRequest): Promise<MindmapUpdateResponse> => {
        const response = await fetch('/api/v1/mindmap/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req)
        });
        if (!response.ok) throw new Error('Failed to update mindmap');
        return response.json();
    }
};
