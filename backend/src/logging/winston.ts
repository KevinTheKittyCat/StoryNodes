import chalk from 'chalk';
import { utilities } from 'nest-winston';
import { basename } from 'path';
import { MESSAGE, SPLAT } from 'triple-beam';
import winston, { format } from 'winston';
import { sanitizeContext } from './logger';
const { printf } = format;


/*
Font styles: 
bold, dim, italic, underline, inverse, hidden, strikethrough.

Font foreground colors: 
black, red, green, yellow, blue, magenta, cyan, white, gray, grey.

Background colors: 
blackBG, redBG, greenBG, yellowBG, blueBG magentaBG, cyanBG, whiteBG
*/
const myCustomLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        obj: 3,
        http: 4,
        debug: 5,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'blue',
        obj: 'gray',
    }
};
// WARNING - SLOW
function getContext(): string {
    const error = new Error();
    const stack = error.stack?.split('\n') || [];
    const callerLine = stack[3] || 'Unknown';

    // Regex to extract "ClassName.MethodName"
    // Matches "at ClassName.MethodName (" or "at FunctionName ("
    const match = callerLine.match(/at\s+(\S+)/);
    
    return match ? match[1] : 'Unknown Context';
  }

export class customLogger {

    static log<T>(data: T, context?: string) {
        customLevelLogger.info(data);
    }
    static info(message, ...args: any[] ) {
        const context = getContext();
        customLevelLogger.info(message, { context, ...args });
    }
    static obj<T>(data: T, context?: string) {
        customLevelLogger.log({ level: 'obj', message: 'Object', context, obj: data });
    }
    static error(error: Error, info: any, context?: string) {
        customLevelLogger.error(error.message, { error, info:info, context });
    }
    static warn(...args: any[]) {
        customLevelLogger.warn(args);
    }
    static http(...args: any[]) {
        customLevelLogger.http(args);
    }
    static debug(...args: any[]) {
        customLevelLogger.debug(args);
    }
}

type SerializedError = { raw: string; fullPath?: string; method?: string; file?: string; line?: number; column?: number }
type ParsedError = { name: string; message: string; stack: string; code?: any; parsedStack: Array<SerializedError> }

const customErrorPrint = printf(({ level, message, label, timestamp, error, context, ...args }): string => {
    const ctx = chalk.yellow(context ? `[${context}]` : '');
    const parsed = serializeError(args[SPLAT]?.[0].error) as ParsedError;
    const msg = chalk.red(message);
    //console.log(args);
    if (!parsed || !parsed.parsedStack || parsed.parsedStack.length === 0) {
        return `\n${chalk.red("[ERROR]")} ${ctx} ${msg} \n ${chalk.gray(parsed?.stack ?? 'No stack trace available')} \n`;
    }
    const errors = '\t' + parsed.parsedStack.map((e: SerializedError) =>
        `${chalk.yellow(e.method)} ${chalk.gray(e.file)} ${chalk.yellow('(' + e.line + ':' + e.column + ')')}`
    ).join('\n \t');
    return `\n${chalk.red("[ERROR]")} ${ctx} ${msg} \n ${errors} \n`;
});

const customObjFormat = printf(({ level, message, label, timestamp, error, context, ...args }): string => {
    const ctx = chalk.yellow(context ? `[${context}]` : '');
    const title = `${chalk.blue("[")}${chalk.yellow('OBJECT')}${chalk.blue("]")} ${ctx} ${chalk.blue(message)}`;
    if (!args.obj) return `\n${title} ${ctx} ${chalk.blue(message)} \n`;
    const objStr = chalk.blue(JSON.stringify(args.obj, null, 2));
    return `\n${title} ${ctx}: \n ${objStr} \n`;
});

const sanitizeTransform = format((info, opts) => {
    const sanetizedArgs = sanitizeContext(info);
    return sanetizedArgs;
});

const ignoreError = format((info, opts) => {
    if (info.level === 'error') { return false; }
    return info;
});
const onlyObj = format((info, opts) => {
    if (info.level === 'obj') info[MESSAGE] = JSON.stringify(info, null, 2);
    return info;
});

const jsonFormat = format.json();
const simpleFormat = format.simple();
const nestLike = utilities.format.nestLike('Twitch-Server', {
    colors: true,
    prettyPrint: true,
    processId: false,
    appName: false,
})
const customErrorFormat = format.combine(
    sanitizeTransform(),
    customErrorPrint,
);
const prettyPrintFormat = format.prettyPrint({ depth: 10, colorize: true });
const comboFormat = format.combine(
    sanitizeTransform(),
    customObjFormat,
);
//const infoLevelFormat = format((info, opts) => {


// 2. Create a custom format that delegates based on level
const conditionalFormat = format((info, opts) => {
    if (info.level === 'error') return customErrorFormat.transform(info, opts);
    if (info.level === 'obj') return comboFormat.transform(info, opts)

    // Otherwise apply simple format
    return nestLike.transform(info, opts);
});


export const customLoggerInfo = {
    //exitOnError: false
    levels: myCustomLevels.levels,
    level: 'http',
    transports: [
        new winston.transports.Console({
            format: conditionalFormat()
        }),
        new winston.transports.File({
            filename: 'src/logging/logs/combined.log',
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                sanitizeTransform(),
                winston.format.json(),
            ),
        }),
        new winston.transports.File({
            filename: 'src/logging/logs/errors.log',
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                sanitizeTransform(),
                winston.format.json(),
            ),
        })
    ],
}

export const customLevelLogger = winston.createLogger(customLoggerInfo);
export { customLogger as logger };


// Divides the stack into frames and extracts method, file, line and column info. Only works for V8-style stacks (e.g. Node.js)
export function parseStack(stack?: string) {
    if (!stack) return [];
    const lines = stack.split('\n').map(l => l.trim()).filter(Boolean);
    const frames: Array<any> = [];
    const re = /^at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?$/;

    for (const line of lines) {
        const m = line.match(re);
        if (m) {
            if (m[2].includes('node_modules')) continue; // Skip node_modules frames
            if (m[2].includes('node:internal') || m[2].includes('internal\\')) continue; // Skip internal Node.js frames
            if (m[2].includes('winston')) continue; // Skip winston frames
            if (m[2].includes('logger')) continue; // Skip logger frames
            if (!m[1] || m[1].includes('<anonymous>')) continue; // Skip frames without a named method
            frames.push({
                raw: line,
                fullPath: m[2],
                method: m[1],
                file: basename(m[2]),
                line: Number(m[3]),
                column: Number(m[4]),
            });
        }
    }
    return frames
}

export function serializeError(err: any) {
    if (!err) return null;
    try {
        const base: any = {
            name: err?.name,
            message: err?.message ?? String(err),
            stack: typeof err?.stack === 'string' ? err.stack : String(err),
            code: err?.code,
            parsedStack: []
        };
        base.parsedStack = parseStack(base.stack);
        return base as { name: string; message: string; stack: string; code?: any; parsedStack: Array<SerializedError> };
    } catch {
        return { message: String(err) };
    }
}

