import { create } from 'zustand';





interface NodeTreeState {
    nodeTree: any;
    setNodeTree: (tree: any) => void;
}

export const useNodeTreeStore = create<NodeTreeState>((set) => ({
    nodeTree: {},
    setNodeTree: (tree) => set({ nodeTree: tree }),
}));