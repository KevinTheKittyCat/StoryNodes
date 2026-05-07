export class CustomEventEmitter {
    listeners = [] as { name: string; callback: Function }[];

    emit(eventName: string, data: any) {
        this.listeners
            .filter(({ name }) => name === eventName)
            .forEach(
                ({ callback }: { callback: Function }) => queueMicrotask(
                    () => callback.apply(this, Array.isArray(data) ? [...data] : [data])
                )
            );

        const dataWithType = { eventType: eventName, data };
        this.listeners
            .filter(({ name }) => name === '*' || name === 'all')
            .forEach(
                ({ callback }: { callback: Function }) => queueMicrotask(
                    () => callback.apply(this, Array.isArray(dataWithType) ? [...dataWithType] : [dataWithType])
                )
            );
    }
    on(name: string, callback: Function) {
        if (
            typeof callback === 'function'
            && typeof name === 'string'
        ) {
            this.listeners.push({ name, callback });
        }
    }
    off(eventName: string, callback: Function) {
        this.listeners = this.listeners.filter(
            listener => !(listener.name === eventName &&
                listener.callback === callback)
        );
    }
    destroy() {
        this.listeners.length = 0;
    }
}

export const customEvents = new CustomEventEmitter();