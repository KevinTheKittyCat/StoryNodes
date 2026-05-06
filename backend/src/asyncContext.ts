import { AsyncLocalStorage } from 'async_hooks';

// This is the store that holds data for the current execution chain
const asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

export class Context {
    /**
     * Start a new context for a function execution
     */
    static run<T>(callback: () => T): T {
        return asyncLocalStorage.run(new Map(), callback);
    }

    /**
     * Add data to the current context.
     * Example: Context.add({ userId: 123, role: 'admin' })
     */
    static add(data: Record<string, any>) {
        const store = asyncLocalStorage.getStore();
        if (store) {
            for (const key in data) {
                store.set(key, data[key]);
            }
        }
    }

    static exclude(keys: string[]) {
        const store = asyncLocalStorage.getStore();
        if (!store) return;
        const currentData = Object.fromEntries(store);
        if (!currentData.excludedKeys) return store.set('excludedKeys', keys);
        store.set('excludedKeys', [...currentData.excludedKeys, ...keys]);
    }

    // Get all accumulated data as a simple object
    static get(): Record<string, any> {
        const store = asyncLocalStorage.getStore();
        if (!store) return {};
        return Object.fromEntries(store);
    }
}