import { addEdge, applyEdgeChanges, applyNodeChanges, Background, Controls, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useMemo } from 'react';
import { useNodeTreeStore } from '../Stores/nodeTree';
import { nodeTypes } from './NodeTypes/interface';

const initialNodes = [
    { id: 'n1', type: 'character', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
    { id: 'n2', type: 'dialog', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
];
const initialEdges = [{ id: 'n1-n2', source: 'character-output-1', target: 'character-output-6' }];


export function FlowCanvas() {
    const edges = useNodeTreeStore((state) => state.edges);
    //const nodes = useNodeTreeStore((state) => state.nodes);
    //const setNodes = useNodeTreeStore((state) => state.setNodes);
    const setEdges = useNodeTreeStore((state) => state.setEdges);
    // const [nodes, setNodes] = useState(initialNodes);
    // const [edges, setEdges] = useState(initialEdges);
    const nodeInfo = useNodeTreeStore((state) => state.nodeInfo);
    const updateNodeInfo = useNodeTreeStore((state) => state.updateNodeInfo);
    //const setNodes = useNodeTreeStore((state) => state.setNodes);
    //const [nodes, /*setNodes, onNodesChange*/] = useNodesState(initialNodes);
    //const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const newNodes = useMemo(() => Object.values(nodeInfo), [nodeInfo]);

    const onNodesChange = useCallback(
        (changes) => {
            const newChanges = applyNodeChanges(changes, newNodes);
            for (const change of newChanges) {
                const {id, type, ...newInfo} = change;
                updateNodeInfo(id, newInfo);
            }
        },
        [updateNodeInfo, newNodes],
    );
    
    const onEdgesChange = useCallback(
        (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );
    /*
    const onConnect = useCallback(
        (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
        [],
    );*/
    const onConnect = useCallback(
        (params) => {
            console.log(params);
            updateNodeInfo(params.source, { connections: params.target });
            setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot));
        },
        [],
    );

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodeTypes={nodeTypes}
                nodes={newNodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
            >
                <Controls />
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}