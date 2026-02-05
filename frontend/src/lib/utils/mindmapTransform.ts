import type { MindNode } from '../types';

import type { MindmapNode } from '../api';

export interface MindMapData {
    data: {
        text: string;
        uid?: string;
        // extended properties
        [key: string]: any;
    };
    children: MindMapData[];
}

// Convert Frontend Nodes to Backend MindmapNode Map
export function convertStoreToAPIMap(nodes: MindNode[]): Record<string, MindmapNode> {
    const map: Record<string, MindmapNode> = {};
    
    // 1. Initialize nodes
    nodes.forEach(k => {
        // Fallback: if 'id' missing (legacy), use 'text' or a generated temp id?
        // Ideally we migrated data. Let's assume id exists or fallback to text (which was name)
        const id = k.id || k.text; 
        map[id] = { id: id, text: k.text, children: [] };
    });

    // 2. Build parent-child relationships
    nodes.forEach(k => {
        const id = k.id || k.text;
        const parentId = k.parent;
        
        if (parentId && map[parentId]) {
            map[parentId].children.push(id);
        }
    });

    return map;
}

export function transformNodesToMindMap(nodes: MindNode[]): MindMapData {
    if (!nodes || nodes.length === 0) {
        return {
            data: { 
                text: "中心主题",
                uid: "root" 
            },
            children: []
        };
    }

    // Identify root
    // Root usually has level 0 or no parent
    let root = nodes.find(k => k.level === 0 || !k.parent);
    
    // If no explicit root, pick the first one or create a dummy
    if (!root) {
        root = nodes[0]; // Fallback
    }

    const buildNode = (current: MindNode): MindMapData => {
        const currentId = current.id || current.text;
        
        const children = nodes
            .filter(k => k.parent === currentId)
            .map(child => buildNode(child));
            
        return {
            data: {
                text: current.text,
                uid: currentId,
                // Pass other props if needed
                expand: !current.isCollapsed,
                isActive: current.isCore
            },
            children: children
        };
    };

    return buildNode(root);
}

export function flattenMindMapData(root: MindMapData): MindNode[] {
    const result: MindNode[] = [];

    const traverse = (node: MindMapData, parentId?: string, level: number = 0) => {
        const text = node.data.text;
        const id = node.data.uid || text; // Getting back ID from node data
        
        const mindNode: MindNode = {
            id: id,
            text: text,
            parent: parentId,
            level: level,
            isCore: node.data.isActive || false, // Mapping custom props back
            isCollapsed: node.data.expand === false,
            x: 0, // Coordinates handled by layout usually
            y: 0
        };
        
        result.push(mindNode);

        if (node.children && node.children.length > 0) {
            node.children.forEach(child => traverse(child, id, level + 1));
        }
    };

    traverse(root);
    return result;
}
