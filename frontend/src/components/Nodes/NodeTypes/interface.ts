





import { CharacterNode } from "./Character";
import { DialogNode } from "./dialog";


export enum NodeDataTypes {
    character = 'character',
    dialog = 'dialog',
}

export enum NodeColors {
    character = 'rgba(202, 255, 153, 0.7)',//'#355219',
    dialog = 'rgba(153, 180, 255, 0.7)', // Replace with the actual color for dialog nodes
}

export const nodeTypes = {
    character: CharacterNode,
    dialog: DialogNode,
}
