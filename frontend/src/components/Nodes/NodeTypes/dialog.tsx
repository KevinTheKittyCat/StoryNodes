

import { Flex } from '@chakra-ui/react';
import { Handle, Position } from '@xyflow/react';
import { CharacterInput } from './Character';
import { NodeColors } from './interface';
import { CustomHandleStyles, CustomNode } from './node-builder';

/*
const incomers = getIncomers(
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'node' } },
  nodes,
  edges,
);*/

export function DialogOutput() {
    return (
        <Flex position={"relative"}>
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
        <CustomNode.Root>
            <CustomNode.Label style={{ "--node-color": NodeColors.dialog }}>Dialog Node</CustomNode.Label>
            <CustomNode.Content>
                <DialogOutput />
                <CharacterInput />
            </CustomNode.Content>
        </CustomNode.Root>
    );
};