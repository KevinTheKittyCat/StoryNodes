// --- NodeRegistry.ts ---

// An in-memory cache of loaded functions so we don't fetch them twice
const executionCache = new Map<string, Function>();

export const loadNodeLogic = async (nodeType: string): Promise<Function> => {
    if (executionCache.has(nodeType)) {
        return executionCache.get(nodeType)!;
    }

    let logicModule;

    try {
        if (nodeType.startsWith('npm:')) {
            // 1. NPM Packages: Use a modern CDN like esm.sh which compiles NPM to ES Modules
            const pkgName = nodeType.replace('npm:', '');
            logicModule = await import(`https://esm.sh/${pkgName}`);
            
        } else if (nodeType.startsWith('custom:')) {
            // 2. Custom Scripts: Fetch from your own backend/S3 bucket
            const scriptId = nodeType.replace('custom:', '');
            logicModule = await import(`/api/scripts/${scriptId}.js`);
            
        } else {
            // 3. Built-in Engine Nodes
            logicModule = await import(`../engine/nodes/${nodeType}.ts`);
        }

        // Assuming every module exports a default `execute` function
        const executeFn = logicModule.default;
        executionCache.set(nodeType, executeFn);
        return executeFn;

    } catch (err) {
        console.error(`Failed to load logic for ${nodeType}`, err);
        return () => {}; // Fallback no-op
    }
};