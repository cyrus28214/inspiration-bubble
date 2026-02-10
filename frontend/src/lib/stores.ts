import { writable } from 'svelte/store';
import type { IdeaInput, MindNode } from './types';
import type { MindmapNode } from './api';

const defaultData: IdeaInput = {
    thoughts: [],
    nodes: [],
    summary: "",
    inspiration: [],
    voiceTextHistory: [],
    showInspiration: true,
    autoInspiration: true
};

export const highlightedKeyword = writable<string | null>(null);
// Separate transient state proper: loading indicator
export const isAnalyzing = writable<boolean>(false);
export const isRecommending = writable<boolean>(false);

function createBrainstormStore() {
    const { subscribe, set, update } = writable<IdeaInput>(defaultData);

    return {
        subscribe,
        set,
        update,
        updateFromAI: (updatedNodes: MindmapNode[]) => {
            update(state => {
                 let hasChanges = false;
                 
                 // Process each updated node from AI
                 updatedNodes.forEach(updateNode => {
                    const existingIdx = state.nodes.findIndex(k => k.id === updateNode.id);
                    
                    if (existingIdx !== -1) {
                         // Update existing text if changed
                         if (state.nodes[existingIdx].text !== updateNode.text) {
                             state.nodes[existingIdx].text = updateNode.text;
                             hasChanges = true;
                         }
                    } else {
                        // New node
                        state.nodes.push({
                            id: updateNode.id,
                            text: updateNode.text,
                            level: 1, // Default, will need recalc or layout
                            isCore: false,
                            isCollapsed: false,
                            x: Math.random() * 400 + 200,
                            y: Math.random() * 400 + 100,
                            parent: undefined // Will be set below
                        });
                        hasChanges = true;
                    }
                 });

                 // Rebuild parent pointers based on the children lists in updatedNodes
                 updatedNodes.forEach(parentNode => {
                     parentNode.children.forEach(childId => {
                         const childKw = state.nodes.find(k => k.id === childId);
                         if (childKw) {
                             if (childKw.parent !== parentNode.id) {
                                 childKw.parent = parentNode.id;
                                 hasChanges = true;
                             }
                         }
                     });
                 });
                 
                 if (hasChanges) {
                    localStorage.setItem("brainstormData_MVP", JSON.stringify(state));
                 }
                 return state;
            });
        },
        init: () => {
            const stored = localStorage.getItem("brainstormData_MVP");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    
                    // Legacy migration: Map 'allKeywords' to 'nodes'
                    // And ensure old 'Keyword' structure with 'name' maps to '{id, text}'
                    if (parsed.allKeywords) {
                         parsed.nodes = parsed.allKeywords.map((k: any) => ({
                             ...k,
                             id: k.id || k.name,
                             text: k.text || k.name
                         }));
                         delete parsed.allKeywords;
                    }

                    update(stats => ({ ...stats, ...parsed }));
                } catch (e) {
                    console.error("Failed to load local storage", e);
                }
            }
        },
        save: () => {
             update(state => {
                 localStorage.setItem("brainstormData_MVP", JSON.stringify(state));
                 return state;
             });
        },
        toggleInspiration: () => {
            update(state => {
                const newState = { ...state, showInspiration: !state.showInspiration };
                localStorage.setItem("brainstormData_MVP", JSON.stringify(newState));
                return newState;
            });
        },
        toggleAutoInspiration: () => {
            update(state => {
                const newState = { ...state, autoInspiration: !state.autoInspiration };
                localStorage.setItem("brainstormData_MVP", JSON.stringify(newState));
                return newState;
            });
        },
        updateNodePosition: (id: string, x: number, y: number) => {
            update(state => {
                const nodeIndex = state.nodes.findIndex(k => k.id === id);
                if (nodeIndex !== -1) {
                    state.nodes[nodeIndex].x = x;
                    state.nodes[nodeIndex].y = y;
                }
                localStorage.setItem("brainstormData_MVP", JSON.stringify(state));
                return state;
            });
        },
        toggleCore: (id: string) => {
            update(state => {
                const node = state.nodes.find(k => k.id === id);
                if (node) {
                    node.isCore = !node.isCore;
                }
                localStorage.setItem("brainstormData_MVP", JSON.stringify(state));
                return state;
            });
        },
        addInspirationNode: (nodeId: string, text: string, parentId: string) => {
            update(state => {
                // Don't add if already exists
                if (state.nodes.find(n => n.id === nodeId)) return state;

                state.nodes.push({
                    id: nodeId,
                    text: text,
                    level: 1,
                    isCore: false,
                    isCollapsed: false,
                    x: Math.random() * 400 + 200,
                    y: Math.random() * 400 + 100,
                    parent: parentId
                });
                localStorage.setItem("brainstormData_MVP", JSON.stringify(state));
                return state;
            });
        },
        deleteNode: (id: string) => {
             update(state => {
                 const toDelete = new Set<string>([id]);

                 // Recursive helper to find descendants
                 const findDescendants = (parentId: string) => {
                     state.nodes.forEach(k => {
                         if (k.parent === parentId) {
                             toDelete.add(k.id);
                             findDescendants(k.id);
                         }
                     });
                 };
                 findDescendants(id);

                 // Filter lists
                 state.nodes = state.nodes.filter(k => !toDelete.has(k.id));
                 
                 localStorage.setItem("brainstormData_MVP", JSON.stringify(state));
                 return state;
             });
        }
    };
}

export const brainstormStore = createBrainstormStore();
