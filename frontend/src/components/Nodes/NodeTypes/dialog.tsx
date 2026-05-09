

import { Button, Collapsible, Flex, Input, Portal, Text } from '@chakra-ui/react';
import { Position, useNodeId } from '@xyflow/react';
import { useCallback, useRef, useState } from 'react';
import { IoIosArrowDropdown, IoMdAdd } from 'react-icons/io';
import { CharacterInput } from './Character';
import { NodeColors, NodeDataTypes } from './interface';
import { CustomNode, useNodeContext } from './node-builder';

/*
const incomers = getIncomers(
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'node' } },
  nodes,
  edges,
);*/

export function DialogOutput() {
    return (
        
            <CustomNode.Handle
                dataType={NodeDataTypes.dialog}
                type="source"
                position={Position.Right}
            />
        
    )
}

export function DialogMessage() {
    const { data, update } = useNodeContext();
    return (
        <Input placeholder="Dialog Message" size={"xs"} value={data.message} onChange={(e) => update({ ...data, message: e.target.value })} />
    )
}


const defaultOption = [
    { text: "", requires: [] },
]

export function DialogOptions() {
    const { data, update, updateNode, addNodeOutput } = useNodeContext();
    //const [options, setOptions] = useState(data.options || [...defaultOption]);
    const options = data.dialog.options
    const [open, setOpen] = useState(true);
    const nodeId = useNodeId();
    const portalRef = useRef<HTMLDivElement>(null);

    const addOption = useCallback(() => {
        const optionId = `option-${options.length + 1}`;
        const outputId = `dialog-option-output-${optionId}`;
        const newOptions = [...options, {
            id: optionId,
            text: "",
            requires: [],
            outputId,
            handle: {
                id: `dialog-requirements-${optionId}`,
                dataType: NodeDataTypes.dialogRequirements,
            }
        }];
        addNodeOutput(nodeId, {
            id: outputId,
            dataType: NodeDataTypes.dialogOptionOutput,
            label: `Option ${options.length + 1} Output`,
            output: []
        });
        //setOptions(newOptions);
        update({
            ...data,
            dialog: {
                ...data.dialog,
                options: newOptions
            }
        });
    }, [options, data, update]);

    const editOption = useCallback((index: number, text: string) => {
        const newOptions = [...options];
        newOptions[index].text = text;
        //setOptions(newOptions);
        update({ ...data, dialog: { ...data.dialog, options: newOptions } });
    }, [options, data, update]);

    const removeOption = useCallback((index: number) => {
        const newOptions = options.filter((_, i) => i !== index);
        //setOptions(newOptions);
        update({
            ...data, dialog: {
                ...data.dialog,
                options: newOptions
            }
        });
    }, [options, data, update]);

    return (
        <Flex direction={"column"} gap={2} bg={'blackAlpha.100'} borderRadius={5}>
            <Collapsible.Root onOpenChange={(e) => setOpen(e.open)} defaultOpen={open}>
                <Collapsible.Trigger w="100%">
                    <Collapsible.Indicator />

                    <Flex w="100%" fontSize={"0.45rem"} gap={2} alignItems={"center"}>
                        <IoIosArrowDropdown size={12} style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
                        <Text fontSize={"0.45rem"}>{`Options`}</Text>
                    </Flex>
                    <Flex ref={portalRef} id={"options-target-" + nodeId} position={"relative"} zIndex={1} />
                </Collapsible.Trigger>
                <Collapsible.Content overflow={open ? "visible" : "hidden"}>
                    {options.map((option: any, index: number) => (
                        <Flex key={index} direction={"column"} gap={1} p={1} borderRadius={5}>
                            <Flex w="100%" fontSize={"0.45rem"} gap={2} alignItems={"center"}>
                                <Text fontSize={"0.45rem"}>{`Option ${index + 1} ${option.text ? `- ${option.text}` : ""}`}</Text>
                            </Flex>


                            <Input placeholder="Dialog Option" size={"xs"}
                                value={option.text}
                                onChange={(e) => editOption(index, e.target.value)}
                            />

                            <Flex position={"relative"} gap={1} alignItems={"center"}>
                                <Portal container={portalRef} disabled={open}>
                                    <CustomNode.Handle
                                        dataType={NodeDataTypes.dialogRequirements}
                                        type="target"
                                        position={Position.Left}
                                        handlePath={`dialog.options.[${index}]`}
                                        isConnectable={open ? true : false}
                                        label='Requirements'
                                    />
                                    <CustomNode.Handle
                                        dataType={NodeDataTypes.event}
                                        type="source"
                                        position={Position.Right}
                                        outputId={option.outputId}
                                        isConnectable={open ? true : false}
                                        label='Events'
                                    />
                                </Portal>
                            </Flex>
                        </Flex>
                    ))}
                    <Flex justifyContent={"flex-end"} p={1}>
                        <Button size={"2xs"} onClick={addOption}><IoMdAdd /></Button>
                    </Flex>
                </Collapsible.Content>
            </Collapsible.Root>
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
                <DialogMessage />
                <DialogOptions />
            </CustomNode.Content>
        </CustomNode.Root>
    );
};