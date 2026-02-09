// Type definitions matching Backend Pydantic models
export interface APIInspirationItem {
    title: string;
    link: string;
    snippet: string;
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
    },

    analyzeThought: async (text: string): Promise<{summary: string, keywords: string[]}> => {
        const response = await fetch('/api/v1/thought/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (!response.ok) throw new Error('Failed to analyze thought');
        return response.json();
    }
};
