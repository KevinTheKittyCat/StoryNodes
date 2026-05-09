import { create } from 'zustand';
import { customEvents } from '../Events/Events';
import { NodeDataTypes } from '../Nodes/NodeTypes/interface';

interface NodeTreeState {
    setNodes: (nodes: any[] | ((prevNodes: any[]) => any[])) => void;
    setEdges: (edges: any[] | ((prevEdges: any[]) => any[])) => void;
    nodes: any[];
    edges: any[];
    nodeInfo: Record<string, NodeInfo>;
    updateNodeInfo: (nodeId: string, info: Partial<NodeInfo>) => void;
    updateNodeData: (nodeId: string, data: any) => void;
    updateEdge: (edgeId: string, info: Partial<any>) => void;
    addNodeOutput: (nodeId: string, output: any) => void;
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
    outputs: {
        handles: Record<string, any>;
    };
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

    addNodeOutput: (nodeId: string, output: any) => {
        set((state) => {
            const node = state.nodeInfo[nodeId];
            if (!node) {
                console.warn(`Node with id ${nodeId} not found when trying to add output`, { nodeId, output, nodeInfo: state.nodeInfo });
                return {};
            }
            return {
                nodeInfo: {
                    ...state.nodeInfo,
                    [nodeId]: {
                        ...node,
                        outputs: {
                            ...node.outputs,
                            handles: {
                                ...node.outputs?.handles,
                                [output.id]: output
                            }
                        }
                    }
                }
            };
        });
    },

    nodeInfo: {
        "character-output-1": {
            id: 'character-output-1',
            type: 'character',
            label: '',
            position: { x: -150, y: 0 },
            outputs: {
                handles: {
                    'character-output-1-handle': {
                        id: 'character-output-1-handle',
                        dataType: NodeDataTypes.character,
                        label: 'Character Output',
                        output: ["id"],
                    }
                },
            },
            data: {
                /*handle: {
                    id: 'character-output-1-handle',
                    dataType: 'character',
                },*/
            },
        },
        "character-output-2": {
            id: 'character-output-2',
            type: 'character',
            label: '',
            position: { x: 150, y: 0 },
            outputs: {
                handles: {
                    'character-output-2': {
                        id: 'character-output-2',
                        dataType: NodeDataTypes.character,
                        label: 'Character Output',
                        output: ["id"],
                    }
                },
            },
            data: {
                id: 'character2',
                name: 'Character 2',
                /*handle: {
                    id: 'character-output-2',
                    dataType: 'character',
                },*/
            },
        },

        "dialog-1": {
            id: 'dialog-1',
            type: 'dialog',
            label: '',
            position: { x: 0, y: 100 },
            outputs: {
                handles: {
                    'dialog-output-1': {
                        id: 'dialog-output-1',
                        dataType: NodeDataTypes.dialog,
                        label: 'Events',
                        output: ["character", "somethingElseExample"]
                    },
                }
            },
            data: {
                character: {
                    handle: { //input
                        id: 'character-output-6',
                        dataType: NodeDataTypes.character,
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
                somethingElseExample: {},
                dialog: {
                    message: "Hey, you there!",
                    options: [
                        /*{
                            text: "Who is this?",
                            requires: [],
                            handle: {
                                id: 'dialog-requirements-1',
                                dataType: NodeDataTypes.dialogRequirements,
                            }
                        },
                        {
                            text: "Leave me alone.",
                            requires: [],
                            handle: {
                                id: 'dialog-requirements-2',
                                dataType: NodeDataTypes.dialogRequirements,
                            }
                        },*/
                    ],
                }
            }
        }
    }
}));