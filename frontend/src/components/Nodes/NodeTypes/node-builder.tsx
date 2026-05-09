import { customEvents } from "@/components/Events/Events";
import { useNodeTreeStore } from "@/components/Stores/nodeTree";
import { chakra, Flex, Text } from "@chakra-ui/react";
import { Handle, Position, useNodeId } from "@xyflow/react";
import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { NodeColors, NodeDataTypes } from "./interface";

interface NodeContextProps {
    updateTrigger: number;
    data: any;
    updateNode: (newData: any) => void;
    update: (newData: any) => void;
    addNodeOutput: (nodeId: string, output: any) => void;
}

export const NodeContext = createContext<NodeContextProps>({} as NodeContextProps);

export function NodeProvider({ children, ...props }: { children: React.ReactNode } & NodeContextProps) {
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const nodeId = useNodeId();
    const storeData = useNodeTreeStore((state) => state.nodeInfo[nodeId].data);
    const data = useMemo(() => storeData, [storeData, updateTrigger]);

    const storeUpdateNodeData = useNodeTreeStore((state) => state.updateNodeData);
    const updateNodeInfo = useNodeTreeStore((state) => state.updateNodeInfo);
    const addNodeOutput = useNodeTreeStore((state) => state.addNodeOutput);

    const updateNode = useCallback((newData: any) => {
        updateNodeInfo(nodeId, newData);
        setUpdateTrigger((prev) => prev + 1);
    }, [nodeId, updateNodeInfo]);

    const update = useCallback((newData: any) => {
        storeUpdateNodeData(nodeId, newData);
        setUpdateTrigger((prev) => prev + 1);
    }, [nodeId, storeUpdateNodeData]);

    useEffect(() => {
        const handleNodeDataUpdate = () => {
            setUpdateTrigger((prev) => prev + 1);
        };

        customEvents.on('nodeDataUpdate', handleNodeDataUpdate);

        return () => {
            customEvents.off('nodeDataUpdate', handleNodeDataUpdate);
        };
    }, []);

    return (
        <NodeContext.Provider value={{ ...props, updateTrigger, data, update, updateNode, addNodeOutput }}>
            {children}
        </NodeContext.Provider>
    );
}

export function useNodeContext() {
    const context = useContext(NodeContext);
    if (!context) {
        throw new Error("useNodeContext must be used within a NodeProvider");
    }
    return context;
}


const NodeRoot = chakra('div', {
    base: {
        borderRadius: '5px',
        border: '1px solid var(--border-color, #f8f8f8)',
        minWidth: "25ch",
        position: 'relative',
    }
}, {
    defaultProps: {
        className: 'node-root',
    }
})

const NodeRootHandler = forwardRef<any, any
//{ children: React.ReactNode } & HTMLDivElement & NodeContextProps,
//{ children: React.ReactNode } & ChakraComponent<"div", ChakraProviderProps> & NodeContextProps
>(
    (props, ref) => {
        const localRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (!ref) return;
            if (typeof ref === 'function') {
                ref(localRef.current);
            } else {
                (ref as any).current = localRef.current;
            }
        }, [ref]);

        return (
            <NodeProvider {...props}>
                <NodeRoot {...props} ref={localRef}>
                    {props.children}
                </NodeRoot>
            </NodeProvider>
        );
    }
);


const NodeLabel = chakra('div', {
    base: {
        width: '100%',
        fontSize: '0.7em',
        //fontWeight: 'bold',
        padding: '5px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--node-color, rgba(255, 255, 255, 0.7))',
        color: '#000000',
        borderRadius: '5px 5px 0 0',
        cursor: 'move',
        //border: '1px solid var(--border-color)',
    }
}, {
    defaultProps: {
        className: 'node-label',
    }
})

const NodeContent = chakra('div', {
    base: {
        padding: '10px',
        borderRadius: '0px 0px 5px 5px',
        backgroundColor: 'var(--node-bg, rgba(255, 255, 255, 1))',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        position: 'relative',
    }
}, {
    defaultProps: {
        className: 'node-content',
    }
})

const CustomHandleStyles = {
    '--size': '10px',
    width: 'var(--size)',
    height: 'var(--size)',
    top: '50%',
    //right: 'calc(0px - var(--content-padding, 10px))',
    //transform: 'translateY(-50%)',
    outline: '1px solid var(--border-color)',
}

const NodeHandle = ({ dataType, styles, type, position, id, handlePath, label, labelSpacing=4, outputId, ...props }: {
    dataType: NodeDataTypes,
    styles?: React.CSSProperties,
    handlePath?: string,
    label?: string,
    labelSpacing?: number,
    outputId?: string
} & React.ComponentProps<typeof Handle>) => {
    const nodeId = useNodeId();
    const node = useNodeTreeStore((state) => state.nodeInfo[nodeId]);
    const handleId = useMemo(() => {
        if (id) return id;
        if (type === 'source') {
            const outputs = Object.values(node.outputs?.handles || {})
            //console.log(id, outputId, handlePath, dataType, outputs)
            if (outputId) {
                console
                const handle = outputs.find(handle => handle.id === outputId);
                if (handle) return handle.id;
                console.warn(`No handle found with outputId ${outputId} in node ${nodeId}`, { id, outputId, handlePath, dataType, outputs, handle, node });

            }
            for (const handle of outputs) {
                if (handle.dataType === dataType) {
                    return handle.id;
                }
            }
            console.warn(`No handle found for dataType ${dataType} in node ${nodeId}, though did have outputs:`, outputs.length);
        }
        const splitDataType = dataType.split('.');
        if (handlePath) {
            const splitHandlePath = handlePath.split('.');
            let data = node.data;
            for (let i = 0; i < splitHandlePath.length; i++) {
                const pathSegment = splitHandlePath[i];
                if (pathSegment.startsWith('[') && pathSegment.endsWith(']')) {
                    const index = parseInt(pathSegment.slice(1, -1));
                    data = data?.[index];
                } else {
                    data = data?.[pathSegment];
                }
                if (!data) {
                    console.warn(`Data path ${splitHandlePath.slice(0, i + 1).join('.')} not found in node data for node ${nodeId}`);
                    return '';
                }
            }
            if (!data?.handle) {
                console.warn(`No handle found at data path ${splitHandlePath.slice(0, -1).join('.')} in node data for node ${nodeId}`);
                return '';
            }
            return data.handle.id;
        }
        if (splitDataType.length > 1) {
            let data = node.data;
            for (let i = 0; i < splitDataType.length - 1; i++) {
                const pathSegment = splitDataType[i];
                data = data?.[pathSegment];
                if (!data) {
                    console.warn(`Data path ${splitDataType.slice(0, i + 1).join('.')} not found in node data for node ${nodeId}`);
                    return '';
                }
            }
            if (!data?.handle) {
                console.log(data)
                console.warn(`No handle found at data path ${splitDataType.slice(0, -1).join('.')} in node data for node ${nodeId}`);
                return '';
            }
        }
        return node.data[splitDataType[0]].handle.id;
    }, [type, node, dataType, id]);

    const accountForPaddingStyle = useMemo(() => {
        const style = "0px"//'calc(0px - var(--content-padding, 10px))'
        if (position === Position.Right) return { right: style };
        if (position === Position.Left) return { left: style };
        if (position === Position.Top) return { top: style };
        if (position === Position.Bottom) return { bottom: style };
        return {};
    }, [position]);
    /*
    const posStyle = useMemo(() => {
        //const style = 'calc(0px - var(--content-padding, 10px))'
        if (position === Position.Right) return { right: style };
        if (position === Position.Left) return { left: style };
        if (position === Position.Top) return { top: style };
        if (position === Position.Bottom) return { bottom: style };
        return {};
    }, [position]);*/


    return (
        <>
            <Flex position={"absolute"} gap={1} style={{ ...accountForPaddingStyle }}>
                <Flex position={"relative"}>
                    {
                        position === Position.Right && <Text fontSize={"0.5rem"} pr={2}>{label || (dataType + '-' + type)}</Text>
                    }
                    <Handle
                        type={type}
                        position={position}
                        style={{
                            background: NodeColors[dataType] || '#000',
                            ...CustomHandleStyles,
                            ...accountForPaddingStyle,
                            ...styles,
                        }}
                        className='offset-circle'
                        id={handleId}
                        {...props}
                    />
                    {position === Position.Left && <Text fontSize={"0.5rem"} pl={2}>{label || (dataType + '-' + type)}</Text>}
                </Flex>
            </Flex>
            {labelSpacing && <Flex h={labelSpacing} />}
        </>
    )

    return (
        <Handle
            type={type}
            //type="source"
            position={position}
            style={{
                background: NodeColors[dataType] || '#000',
                ...CustomHandleStyles,
                ...accountForPaddingStyle,
                ...styles,
            }}
            className='offset-circle'
            id={handleId}
            {...props}
        />
    )
}

const CustomNode = {
    Root: NodeRootHandler,
    Label: NodeLabel,
    Content: NodeContent,
    Handle: NodeHandle,
}

export { CustomHandleStyles, CustomNode };

