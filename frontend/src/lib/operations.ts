import { get } from 'svelte/store';
import { brainstormStore } from './stores';
import { api } from './api';
import { convertStoreToAPIMap } from './utils/mindmapTransform';

export async function performMindmapUpdate(input: string, options: { inputAlreadyInHistory?: boolean } = {}) {
    console.log("Performing Mindmap Update with input:", input);
    if (!input || !input.trim()) return;

    // Prevent concurrent updates if already analyzing
    if (get(brainstormStore).isAnalyzing) {
        console.warn("Skipping update, AI is already analyzing.");
        return;
    }

    brainstormStore.setAnalyzing(true);

    try {
        const currentState = get(brainstormStore);
        
        let historyForApi: string[];
        
        if (options.inputAlreadyInHistory) {
             historyForApi = currentState.voiceTextHistory;
        } else {
             historyForApi = [...currentState.voiceTextHistory, input];
        }

        const mindmapMap = convertStoreToAPIMap(currentState.nodes);

        // 1. Call Update Mindmap API
        const updateRes = await api.updateMindmap({
            messages: historyForApi,
            mindmap: mindmapMap
        });

        // 2. Update Store with AI changes
        brainstormStore.updateFromAI(updateRes.updated_nodes);
        
        // 3. Update History (only if not already there) Summary is always updated
        brainstormStore.update(s => ({
            ...s,
            voiceTextHistory: options.inputAlreadyInHistory ? s.voiceTextHistory : historyForApi,
            summary: updateRes.summary 
        }));
        
    } catch (error) {
        console.error("Analysis/Update failed:", error);
    } finally {
        brainstormStore.setAnalyzing(false);
    }
}
