

import { useNodeTreeStore } from '@/components/Stores/nodeTree';
import { Combobox, createListCollection, Flex, ListCollection, Text } from '@chakra-ui/react';
import { CustomComboBox } from '@ui/comboBox';
import { Position, useNodeId } from '@xyflow/react';
import { useMemo, useState } from 'react';
import { NodeColors, NodeDataTypes } from './interface';
import { CustomNode, useNodeContext } from './node-builder';



const mockCharacters = Array.from({ length: 10 }, (_, i) => ({
    id: `character${i + 1}`,
    name: `Character ${i + 1}`,
}));

const mockCharactersList = createListCollection({
    items: mockCharacters,
    itemToString: (option) => option.name,
    itemToValue: (option) => option.id,
})

export function CharacterOutput() {
    const [characters,] = useState<ListCollection>(mockCharactersList);
    const { data } = useNodeContext();
    const nodeId = useNodeId();
    const updateNodeData = useNodeTreeStore((state) => state.updateNodeData);
    //const data = useNodeTreeStore((state) => state.nodeInfo[nodeId].data);

    const onSelect = (e: any) => {
        const item = characters.find(e.value[0]);
        if (!item) return updateNodeData(nodeId, {
            id: null,
            name: null,
        })
        updateNodeData(nodeId, item)
    };

    return (
        <Flex position={"relative"}>
            <CustomComboBox
                collection={characters}
                render={CharacterSelectItem}
                onValueChange={onSelect}
                value={data?.id ? [data.id] : []}
            />
            <CustomNode.Handle
                dataType={NodeDataTypes.character}
                type="source"
                position={Position.Right}
            />
        </Flex>
    )
}

export function CharacterInputRender({ character }: { character?: any }) {
    if (!character?.id) return (
        <Flex
            p={"var(--combobox-input-padding-x)"}
            gap={2}
            paddingInline={"var(--combobox-input-padding-x)"}
            style={{
                border: "1px solid transparent",
                height: "var(--combobox-input-height)",
                width: "var(--chakra-sizes-full)",
                minWidth: "25ch",
                alignItems: "center",
                lineHeight: "1.25rem",
            }}>
            <Text mx={"auto"}>No Character</Text>
        </Flex>
    )
    return (
        <Flex
            p={"var(--combobox-input-padding-x)"}
            gap={2}
            paddingInline={"var(--combobox-input-padding-x)"}
            style={{
                border: "1px solid transparent",
                height: "var(--combobox-input-height)",
                width: "var(--chakra-sizes-full)",
                minWidth: "25ch",
                alignItems: "center",
                lineHeight: "1.25rem",
            }}>
            <img
                src="https://picsum.photos/200"
                alt="Character"
                style={{ width: '2em', height: '2em' }}
            />
            <Text>{character.name}</Text>
        </Flex>
    )
}

export function CharacterInput() {
    const { data, updateTrigger } = useNodeContext();
    const charData = data[NodeDataTypes.character];
    const character = useMemo(() => charData ? charData.character : null, [data, updateTrigger]);

    return (
        <Flex position={"relative"}>
            <Flex direction={"column"} gap={2} mb={2}>
                {Array.isArray(character) ? character.map((char, index) => (
                    <CharacterInputRender key={index} character={char} />
                ))
                    : <CharacterInputRender character={character} />
                }
            </Flex>

            <CustomNode.Handle
                dataType={NodeDataTypes.character}
                type="target"
                position={Position.Left}
            />
        </Flex>
    )
}

export function CharacterNode() {
    return (
        <CustomNode.Root>
            <CustomNode.Label style={{ "--node-color": NodeColors.character }}>
                Character Node
            </CustomNode.Label>
            <CustomNode.Content>
                <CharacterOutput />
            </CustomNode.Content>
        </CustomNode.Root>
    );
};

function CharacterSelectItem({ item }: { item: { name: string } }) {
    return (
        <Combobox.Item item={item} border="" p={"var(--combobox-input-padding-x)"}
            paddingInline={"var(--combobox-input-padding-x)"}
            style={{
                border: "1px solid transparent",
                height: "var(--combobox-input-height)",
                width: "var(--chakra-sizes-full)",
                minWidth: "25ch",
                alignItems: "center",
                lineHeight: "1.25rem",
            }}>
            <img
                src="https://picsum.photos/200"
                alt="Character"
                style={{ width: '2em', height: '2em' }}
            />
            <Combobox.ItemText>{item.name}</Combobox.ItemText>
        </Combobox.Item>
    );
}