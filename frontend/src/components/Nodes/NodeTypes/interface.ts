





import { CharacterNode } from "./Character";
import { DialogNode } from "./dialog";



export enum NodeDataTypes {
    character = 'character',

    dialog = 'dialog',
    dialogRequirements = 'dialog.requirements',
    dialogOptionOutput = 'dialog.option.output',

    event = 'event',
}

export enum NodeColors {
    character = 'rgba(202, 255, 153, 0.7)',//'#355219',
    dialog = 'rgba(153, 180, 255, 0.7)', // Replace with the actual color for dialog nodes
    "dialog.requirements" = 'rgba(255, 153, 153, 0.7)', // Replace with the actual color for dialog requirement nodes
    "dialog.option.output" = 'rgba(153, 224, 255, 0.7)', // Replace with the actual color for dialog option output nodes
    "event" = 'rgba(255, 168, 80, 0.7)', // Replace with the actual color for event nodes
}

export const nodeTypes = {
    character: CharacterNode,
    dialog: DialogNode,
}
