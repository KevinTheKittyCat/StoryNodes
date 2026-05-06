

import { Flex } from '@chakra-ui/react';
import { Handle, Position } from '@xyflow/react';
import { CharacterInput } from './Character';
import { NodeColors } from './interface';
import { CustomHandleStyles, CustomNode } from './node-builder';



export function DialogOutput() {
    return (
        <Flex position={"relative"}>
            <CharacterInput character={{ id: 'character1', name: 'Character 1' }} />
            <Handle
                type="source"
                position={Position.Right}
                style={{
                    ...CustomHandleStyles,
                    background: NodeColors.dialog,
                }}
                className='offset-circle'

            />
        </Flex>
    )
}

export function DialogNode() {
    return (
        <CustomNode.NodeRoot>
            <CustomNode.NodeLabel style={{"--node-color": NodeColors.dialog}}>Dialog Node</CustomNode.NodeLabel>
            <CustomNode.NodeContent>
                <DialogOutput />
            </CustomNode.NodeContent>
        </CustomNode.NodeRoot>
    );
};