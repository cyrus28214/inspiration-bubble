import { get } from 'svelte/store';
import { brainstormStore, isAnalyzing } from './stores';
import { api } from './api';
import { convertStoreToAPIMap } from './utils/mindmapTransform';

export async function performMindmapUpdate(input: string, options: { inputAlreadyInHistory?: boolean } = {}) {
    console.log("Performing Mindmap Update with input:", input);
    if (!input || !input.trim()) return;

    // Prevent concurrent updates if already analyzing
    if (get(isAnalyzing)) {
        console.warn("Skipping update, AI is already analyzing.");
        return;
    }

    isAnalyzing.set(true);

    try {
        const currentState = get(brainstormStore);
        
        let historyForApi: string[];
        
        if (options.inputAlreadyInHistory) {
             historyForApi = currentState.voiceTextHistory;
        } else {
             historyForApi = [...currentState.voiceTextHistory, input];
        }

        const mindmapMap = convertStoreToAPIMap(currentState.nodes);

        // 1. Parallel: Analyze Thought & Update Mindmap
        const [thoughtRes, updateRes] = await Promise.all([
            api.analyzeThought(input),
            api.updateMindmap({
                messages: historyForApi,
                mindmap: mindmapMap
            })
        ]);

        // 2. Update Store with AI changes
        brainstormStore.updateFromAI(updateRes.updated_nodes);
        
        // 3. Update History 
        // We use the Summary and Keywords from the dedicated 'analyzeThought' API
        // But we might also want to mix in meaningful new nodes from the mindmap as "keywords" if desired.
        // For now, let's respect the dedicated agent's output which is cleaner.
        brainstormStore.update(s => {
            const newThought = {
                original: input,
                summary: thoughtRes.summary,
                keywords: thoughtRes.keywords
            };
            
            const newState = {
                ...s,
                thoughts: options.inputAlreadyInHistory ? s.thoughts : [newThought, ...s.thoughts],
                voiceTextHistory: options.inputAlreadyInHistory ? s.voiceTextHistory : historyForApi,
                summary: updateRes.summary 
            };
            localStorage.setItem("brainstormData_MVP", JSON.stringify(newState));
            return newState;
        });
        
    } catch (error) {
        console.error("Analysis/Update failed:", error);
    } finally {
        isAnalyzing.set(false);
    }
}
