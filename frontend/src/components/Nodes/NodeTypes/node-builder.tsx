import { chakra } from "@chakra-ui/react"



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
    right: 'calc(0px - var(--content-padding, 10px))',
    //transform: 'translateY(-50%)',
    outline: '1px solid var(--border-color)',
}

const CustomNode = {
    NodeRoot,
    NodeLabel,
    NodeContent,
}

export { CustomHandleStyles, CustomNode }

