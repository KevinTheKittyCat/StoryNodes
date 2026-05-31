import { Node as ReactFlowNode } from '@xyflow/react'; // or 'reactflow' depending on your version
import { NodeDataTypes } from "../Nodes/NodeTypes/interface";

type DATA_ID = string;

interface NodeInput {
    id: string;
    name: string;
    type: string;
}

interface NodeOutput {
    id: string;
    name: string;
    type: string;
    output: string[]; 
}

interface FieldInput {
    id: string; 
    name: string;
    type: string;
    overrideBy?: NodeInput['id']; // Excellent pattern here!
    valueId: string; 
}

// 1. Define what lives inside the node's 'data' property
export interface CustomNodeData {
    label: string;
    inputs: { [key: string]: NodeInput };
    outputs: { [key: string]: NodeOutput };
    fields: { [key: string]: FieldInput };
    
    // The reference ID to your second store (the actual game values)
    valueReferenceId: DATA_ID; 
}

// 2. Extend the base React Flow Node with your custom data
export type EngineNode = ReactFlowNode<CustomNodeData, NodeDataTypes | string>;