import { create } from 'zustand';

type DATA_ID = string; // e.g., "node-instance-123" or "global-player-health"

interface GameDataState {
    // Stores the actual values for every node, keyed by DATA_ID
    // e.g., { "dialog-123": { message: "Hello", speed: 5 } }
    nodeMemory: Record<DATA_ID, any>; 
    
    // Values that survive across different "Screens" or "Scenes"
    globals: Record<string, any>;

    // Actions
    updateMemory: (id: DATA_ID, payload: any) => void;
    getValue: (id: DATA_ID, path?: string) => any;
}

export const useGameDataStore = create<GameDataState>((set, get) => ({
    nodeMemory: {},
    globals: {},
    updateMemory: (id, payload) => set((state) => ({
        nodeMemory: { ...state.nodeMemory, [id]: { ...state.nodeMemory[id], ...payload } }
    })),
    getValue: (id, path) => {
        const data = get().nodeMemory[id];
        // optional: add path resolution here (e.g., "character.stats.hp")
        return data; 
    }
}));