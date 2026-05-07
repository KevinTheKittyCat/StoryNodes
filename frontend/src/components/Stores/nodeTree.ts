import { create } from 'zustand';
import { customEvents } from '../Events/Events';

interface NodeTreeState {
    setNodes: (nodes: any[] | ((prevNodes: any[]) => any[])) => void;
    setEdges: (edges: any[] | ((prevEdges: any[]) => any[])) => void;
    nodes: any[];
    edges: any[];
    nodeInfo: Record<string, NodeInfo>;
}

const initialNodes = [
    { id: 'n1', type: 'character', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
    { id: 'n2', type: 'dialog', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
];
const initialEdges = [
    //{ id: 'n1-n2', source: 'character-output-1', target: 'character-output-6' }
    { id: 'n1-n2', source: 'character-output-1', sourceHandle: 'character-output-1-handle', target: 'dialog-1', targetHandle: 'character-output-6' }
];

type NodeInfo = {
    type: string;
    label: string;
    position: { x: number; y: number };
    data: any;
};

export const useNodeTreeStore = create<NodeTreeState>((set) => ({
    nodes: initialNodes,
    edges: initialEdges,
    setNodes: (nodes) => set((state) => ({ nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes })),
    setEdges: (edges) => set((state) => ({ edges: typeof edges === 'function' ? edges(state.edges) : edges })),

    updateEdge: (edgeId: string, info: Partial<any>) =>
        set((state) => ({
            edges: state.edges.map((edge) =>
                edge.id === edgeId ? { ...edge, ...info } : edge
            ),
        })),

    updateNodeInfo: (nodeId: string, info: Partial<NodeInfo>) =>
        set((state) => ({
            nodeInfo: {
                ...state.nodeInfo,
                [nodeId]: {
                    ...state.nodeInfo[nodeId],
                    ...info,
                },
            },
        })),

    updateNodeData: (nodeId: string, data: any) => {
        customEvents.emit('nodeDataUpdate', { nodeId, data });
        set((state) => ({
            nodeInfo: {
                ...state.nodeInfo,
                [nodeId]: {
                    ...state.nodeInfo[nodeId],
                    data: {
                        ...state.nodeInfo[nodeId].data,
                        ...data,
                    },
                },
            },
        }));
    },

    nodeInfo: {
        "character-output-1": {
            id: 'character-output-1',
            type: 'character',
            label: '',
            position: { x: -150, y: 0 },
            data: {
                handle: {
                    id: 'character-output-1-handle',
                    dataType: 'character',
                },
            },
        },
        "character-output-2": {
            id: 'character-output-2',
            type: 'character',
            label: '',
            position: { x: 150, y: 0 },
            data: {
                id: 'character2',
                name: 'Character 2',
                handle: {
                    id: 'character-output-2',
                    dataType: 'character',
                },
            },
        },

        "dialog-1": {
            id: 'dialog-1',
            type: 'dialog',
            label: '',
            position: { x: 0, y: 100 },
            data: {
                character: {
                    handle: {
                        id: 'character-output-6',
                        dataType: 'character',
                        //connections: []
                    },
                    get character() {
                        const state = useNodeTreeStore.getState();
                        //console.log(info.edges)
                        const characterNodes = state.edges.filter(edge => edge.targetHandle === this.handle.id)
                        if (!characterNodes.length) return null;
                        if (characterNodes.length > 1) {
                            console.warn('Multiple connections found for character input handle:', this.handle.id, characterNodes);
                            return characterNodes.map(node => {
                                const nodeInfo = state.nodeInfo[node.source === this.handle.id ? node.target : node.source];
                                return nodeInfo ? nodeInfo.data : null;
                            });
                        }

                        const characterData = state.nodeInfo[characterNodes[0].source].data;
                        return characterData
                    }
                },
            }
        }
    }
}));