

import { Combobox, createListCollection, Flex, ListCollection, Text } from '@chakra-ui/react';
import { CustomComboBox } from '@ui/comboBox';
import { Handle, Position } from '@xyflow/react';
import { useState } from 'react';
import { NodeColors } from './interface';
import { CustomHandleStyles, CustomNode } from './node-builder';



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
    return (
        <Flex position={"relative"}>
            <CustomComboBox
                collection={characters}
                render={CharacterSelectItem}
            />
            <Handle
                type="source"
                position={Position.Right}
                style={{
                    ...CustomHandleStyles,
                    background: NodeColors.character,
                }}
                className='offset-circle'
            />
        </Flex>
    )
}

export function CharacterInputRender({ character }: { character?: any }) {
    if (!character) return (
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
            <Text>No Character</Text>
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
            <img src="https://picsum.photos/200" alt="Character"
                style={{ width: '2em', height: '2em' }}
            />
            <Text>{character.name}</Text>
        </Flex>
    )
}

export function CharacterInput({ character }: { character: any }) {
    return (
        <Flex position={"relative"}>
            <CharacterInputRender character={character} />

            <Handle
                type="target"
                position={Position.Left}
                style={{
                    ...CustomHandleStyles,
                    background: NodeColors.character,
                }}
                className='offset-circle'
            />
        </Flex>
    )
}

export function CharacterNode() {
    return (
        <CustomNode.NodeRoot>
            <CustomNode.NodeLabel style={{ "--node-color": NodeColors.character }}>
                Character Node
            </CustomNode.NodeLabel>
            <CustomNode.NodeContent>
                <CharacterOutput />
            </CustomNode.NodeContent>
        </CustomNode.NodeRoot>
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