import { Select } from '@chakra-ui/react';








export function CustomSelect({ collection }: { collection: any }) {

    return (
        <Select.Root size="sm" mb={2} collection={collection}>
            <Select.Control>
                <Select.Trigger>
                    <Select.ValueText placeholder="Select Character" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                    <Select.Indicator />
                    <Select.ClearTrigger />
                </Select.IndicatorGroup>
            </Select.Control>

            <Select.Positioner>
                <Select.Content>
                    {collection.items.map((item: any) => (
                        <CharacterSelectItem key={item.id} item={item} />
                    ))}
                </Select.Content>
            </Select.Positioner>
        </Select.Root>
    )
}

function CharacterSelectItem({ item }: { item: { name: string } }) {

    return (
        <Select.Item item={item}>
            <img src="https://picsum.photos/200" alt="Character" style={{ width: '1em', height: '1em', marginRight: '10px' }} />
            <Select.ItemText>{item.name}</Select.ItemText>
        </Select.Item>
    );
}