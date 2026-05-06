import { Context } from '../asyncContext';
import { logger } from './winston';

// Error.stackTraceLimit = 5
export function ErrorHandler(): any {
    return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
        if (descriptor) {
            wrapMethod(descriptor, propertyKey!, target);
            return descriptor;
        }

        for (const key of Object.getOwnPropertyNames(target.prototype)) {
            const methodDescriptor = Object.getOwnPropertyDescriptor(target.prototype, key);
            if (key === 'constructor' || typeof methodDescriptor?.value !== 'function') continue;
            wrapMethod(methodDescriptor, key, target.prototype);
            Object.defineProperty(target.prototype, key, methodDescriptor);
        }
    };
}

function wrapMethod(descriptor: PropertyDescriptor, propertyKey: string, target: any) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
        return Context.run(() => {
            try {
                Context.add({ method: propertyKey, args: args });
                const result = originalMethod.apply(this, args);

                if (result && result instanceof Promise) {
                    return result.catch((error: any) => {
                        handleError(this, propertyKey, error, target);
                        // THROWING HERE MAKES THE SERVER COMPLETELY CRASH.
                        //throw error;
                    });
                }
                return result;
            } catch (error) {
                handleError(this, propertyKey, error, target);
                //throw error;
            }
        });
    };
}

function handleError(context: any, method: string, error: any, target: any) {
    // Don't log an error that has already been handled by a deeper ErrorHandler
    if (error && error._isLogged) {
        return;
    }

    // Retrieve accumulated context
    const executionContext = Context.get();

    // Sanitize Sensitive Data (Recursively)
    const safeContext = sanitizeContext(executionContext, executionContext.excludedKeys);

    //const contextString = JSON.stringify(safeContext, null, 2);

    if (logger && typeof logger.error === 'function') {
        //logger.error(error?.message ?? 'Error', error?.stack ?? String(error), target.constructor?.name);
        //const serializedError = serializeError(error);
        //const parsedStack = serializedError.parsedStack;
        //logger.error(error, { data: safeContext});
        //throw error;
        logger.error(error, { ...safeContext, context: target.constructor?.name, method });
        // Mark the error as logged
        if (error && typeof error === 'object') {
            Object.defineProperty(error, '_isLogged', {
                value: true,
                enumerable: false, // Hide it from JSON.stringify and loops
                writable: false,
                configurable: true,
            });
        }
    } else {
        console.error(`[${target.constructor.name}] Error in ${method}:`, error, executionContext);
    }
}

/**
 * Recursively removes sensitive keys from an object.
 * Handles nested objects (e.g. { streamer: { access_token: '...' } })
 */
const SENSITIVE_KEYS = [
    'token', 'secret', 'password', 'key', 'auth', 'cookie', 'credentials', 'jwt',
    'access_token', 'refresh_token', 'client_id', 'client_secret', 'api_key', 'authorization', 'auth_token',
    'session_id', 'cookie', 'pass', 'pwd', 'ssn', 'credit_card', 'card_number',
    'configmodule', 'configService'
];

const maxDepth = 5; // Limit the depth of arrays to prevent infinite recursion
//TODO: Implement a stack limit.
export function recursiveSanitize<T>(data: T, excludedKeys: string[] = [], currentDepth: number = 0): any {
    if (Array.isArray(data)) {
        if (currentDepth >= maxDepth) {
            return '[Array]';
        }
        return data.map(item => recursiveSanitize(item, excludedKeys, currentDepth + 1)) as unknown as T;
    }
    if (typeof data === 'function' && data.toString().startsWith('class ')) {
        return { [`${data?.name || 'Class'}`]: recursiveSanitize({ ...data }, excludedKeys) }
    }
    if (!data || typeof data !== 'object') return data;
    const sanitized: any = { ...data };
    for (const key in data) {
        if (typeof data[key] === 'function' && !data[key].name) {
            sanitized[key] = '[Function]';
            continue;
        }
        if (typeof data[key] === 'function' && data[key].toString().startsWith('class ')) {
            if (excludedKeys.some(k => key.toLowerCase().includes(k))) {
                sanitized[key] = '***REDACTED***';
                continue;
            }
        }
        if (currentDepth >= maxDepth) {
            return '[Object]';
        }
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const lowerKey = key.toLowerCase();

            // 1. Redact if key is sensitive (partial match, e.g. "access_token")
            if (excludedKeys.some(k => lowerKey.includes(k))) {
                sanitized[key] = '***REDACTED***';
            }
            // 2. Recurse if value is an object
            else if (typeof data[key] === 'object' && data[key] !== null) {
                sanitized[key] = recursiveSanitize(data[key], excludedKeys, currentDepth + 1);
            }
            // 3. Copy value otherwise
            else {
                sanitized[key] = data[key];
            }
        }
    }
    return sanitized;
}

export function sanitizeContext<T>(data: T, excludedKeys: string[] = []): T {
    const sensetiveKeys = [...SENSITIVE_KEYS, ...excludedKeys].map(k => k.toLowerCase());
    // Handle Arrays
    if (Array.isArray(data)) {
        return data.map(item => recursiveSanitize(item, sensetiveKeys)) as unknown as T;
    }

    // Handle Objects
    const sanitized: any = { ...data };
    if (typeof data === 'function' && data.toString().startsWith('class ')) {
        if (sensetiveKeys.some(k => data.name.toLowerCase().includes(k))) return sanitized;
    }
    if (!data || typeof data !== 'object') return data;
    for (const key in data) {
        if (typeof data[key] === 'function' && !data[key].name) {
            sanitized[key] = '[Function]';
            continue;
        }
        if (typeof data[key] === 'function' && data[key].toString().startsWith('class ')) {
            if (sensetiveKeys.some(k => key.toLowerCase().includes(k))) {
                sanitized[key] = '***REDACTED***';
                continue;
            }
        }
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const lowerKey = key.toLowerCase();

            // 1. Redact if key is sensitive (partial match, e.g. "access_token")
            if (sensetiveKeys.some(k => lowerKey.includes(k))) {
                sanitized[key] = '***REDACTED***';
            }
            // 2. Recurse if value is an object
            else if (typeof data[key] === 'object' && data[key] !== null) {
                sanitized[key] = recursiveSanitize(data[key], sensetiveKeys);
            }
            // 3. Copy value otherwise
            else {
                sanitized[key] = data[key];
            }
        }
    }
    return sanitized;
}