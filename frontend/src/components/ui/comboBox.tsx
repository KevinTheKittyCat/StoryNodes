import { Combobox, Flex, ListCollection, useComboboxContext } from "@chakra-ui/react";
import { JSX } from "react/jsx-runtime";

export function CustomComboBox({ collection, render, prefix, ...props }: {
    collection: ListCollection<any>,
    render?: (item: any) => JSX.Element,
    prefix?: JSX.Element,
} & React.ComponentProps<typeof Combobox.Root>) {
    return (
        <Combobox.Root size="sm" mb={2} collection={collection} {...props} >
            {/*<Combobox.Label />*/}

            <Combobox.Control>
                <Flex alignItems={"center"} gap={2} minW={"20ch"}>
                    <ReplaceWithItem render={render} />
                    <Combobox.IndicatorGroup>
                        <Combobox.ClearTrigger />
                        <Combobox.Trigger />
                    </Combobox.IndicatorGroup>
                </Flex>
            </Combobox.Control>
            {/*<Combobox.Control>
                <Combobox.Input placeholder="Type to search" />
                <Combobox.IndicatorGroup>
                    <Combobox.ClearTrigger />
                    <Combobox.Trigger />
                </Combobox.IndicatorGroup>
            </Combobox.Control>
            */}

            <Combobox.Positioner>
                <Combobox.Content>
                    <Combobox.Empty> No results found </Combobox.Empty>
                    <RenderSwitch collection={collection} render={render} />
                </Combobox.Content>
            </Combobox.Positioner>
        </Combobox.Root>
    )
}
// this should be a memoized component..
function RenderSwitch({ collection, render }: { collection: ListCollection<any>, render?: (item: any) => JSX.Element }) {

    if (render) return (<>{collection.items.map((item) => render({ item }))}</>)
    return (
        <>
            {collection.items.map((item) => (
                <ComboBoxItem key={item.id} item={item} />
            ))}
        </>
    )
}


export function ComboBoxItem({ item }: { item: any }) {
    return (
        <Combobox.Item item={item}>
            <Combobox.ItemText>{item.name}</Combobox.ItemText>
        </Combobox.Item>
    );
}

export function ReplaceWithItem({ render }: { render?: (item: any) => JSX.Element }) {
    const { selectedItems, hasSelectedItems, open } = useComboboxContext();
    if (!hasSelectedItems || open) return (
        <>
            <Combobox.Input placeholder="Type to search" />
        </>
    )

    if (render) return (
        <>
            {selectedItems.map((item) => render({ item }))}
        </>
    )
    return (
        <>
            {selectedItems.map((item) => (
                <ComboBoxItem key={item.id} item={item} />
            ))}
        </>
    )
}