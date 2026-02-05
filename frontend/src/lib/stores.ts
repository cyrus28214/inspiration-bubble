import { writable } from 'svelte/store';
import type { IdeaInput, MindNode } from './types';
import type { MindmapNode } from './api';

const defaultData: IdeaInput = {
    thoughts: [],
    nodes: [],
    connections: [],
    summary: "",
    inspiration: [],
    voiceTextHistory: [],
    showInspiration: false,
    isAnalyzing: false,
    zoom: {
        scale: 1,
        min: 0.2,
        max: 3,
        offsetX: 0,
        offsetY: 0
    }
};

export const highlightedKeyword = writable<string | null>(null);

function createBrainstormStore() {
    const { subscribe, set, update } = writable<IdeaInput>(defaultData);

    return {
        subscribe,
        set,
        update,
        setAnalyzing: (isAnalyzing: boolean) => {
            update(s => ({ ...s, isAnalyzing }));
        },
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

                    // Also cleanup legacy 'keywords' property
                    delete parsed.keywords;

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
                 state.connections = state.connections.filter(c => !toDelete.has(c.source) && !toDelete.has(c.target));
                 
                 localStorage.setItem("brainstormData_MVP", JSON.stringify(state));
                 return state;
             });
        },
        // This is mainly for legacy AI response merging, if still needed.
        // It assumes the AI result uses the new MindNode structure.
        mergeAIResult: (result: { nodes: MindNode[], connections: {source:string, target:string}[] }) => {
            update(state => {
                 let hasChanges = false;
                 // Merge Nodes
                 result.nodes.forEach(newNode => {
                     const existing = state.nodes.find(k => k.id === newNode.id);
                     if (existing) {
                         if (existing.level !== newNode.level || (newNode.parent && existing.parent !== newNode.parent)) {
                            existing.level = newNode.level;
                            existing.parent = newNode.parent;
                            hasChanges = true;
                         }
                     } else {
                         state.nodes.push({
                             ...newNode,
                             isCollapsed: false,
                             // Assign temp coords, layout will fix
                             x: Math.random() * 400 + 200,
                             y: Math.random() * 400 + 100
                         });
                         hasChanges = true;
                     }
                 });

                 // Merge Connections
                 if (result.connections) {
                    result.connections.forEach(newConn => {
                        const exists = state.connections.some(c => c.source === newConn.source && c.target === newConn.target);
                        if (!exists) {
                            state.connections.push(newConn);
                            hasChanges = true;
                        }
                    });
                 }
                 
                 if (hasChanges) {
                    localStorage.setItem("brainstormData_MVP", JSON.stringify(state));
                 }
                 return state;
            });
        }
    };
}

export const brainstormStore = createBrainstormStore();
