import { customEvents } from "@/components/Events/Events";
import { useNodeTreeStore } from "@/components/Stores/nodeTree";
import { chakra } from "@chakra-ui/react";
import { Handle, Position, useNodeId } from "@xyflow/react";
import { createContext, forwardRef, useContext, useEffect, useMemo, useRef, useState } from "react";
import { NodeColors, NodeDataTypes } from "./interface";

interface NodeContextProps {
    updateTrigger: number;
    data: any;
}

export const NodeContext = createContext<NodeContextProps>({} as NodeContextProps);

export function NodeProvider({ children, ...props }: { children: React.ReactNode } & NodeContextProps) {
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const nodeId = useNodeId();
    const storeData = useNodeTreeStore((state) => state.nodeInfo[nodeId].data);
    const data = useMemo(() => storeData, [storeData, updateTrigger]);

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
        <NodeContext.Provider value={{ ...props, updateTrigger, data }}>
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
        "--border-color": "#f8f8f8",
        borderRadius: '5px',
        border: '1px solid var(--border-color)',
        minWidth: "25ch"
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

const NodeHandle = ({ dataType, styles, type, position, ...props }: { dataType: NodeDataTypes, styles?: React.CSSProperties } & React.ComponentProps<typeof Handle>) => {
    const nodeId = useNodeId();
    const node = useNodeTreeStore((state) => state.nodeInfo[nodeId]);
    const handleId = type === 'source' ? node.data.handle.id : node.data[dataType].handle.id;

    const accountForPaddingStyle = useMemo(() => {
        const style = 'calc(0px - var(--content-padding, 10px))'
        if (position === Position.Right) return { right: style };
        if (position === Position.Left) return { left: style };
        if (position === Position.Top) return { top: style };
        if (position === Position.Bottom) return { bottom: style };
        return {};
    }, [position]);

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

