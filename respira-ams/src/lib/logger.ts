type LogLevel = "debug" | "info" | "warn" | "error";

const isProd = process.env.NODE_ENV === "production";
const currentLevel = (process.env.LOG_LEVEL || (isProd ? "info" : "debug")) as LogLevel;

const logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const isBrowser = typeof window !== "undefined";

const colors: Record<LogLevel, string> = {
    debug: "\x1b[36m",
    info: "\x1b[32m",
    warn: "\x1b[33m",
    error: "\x1b[31m",
};

const reset = "\x1b[0m";

function getTimestamp(): string {
    const now = new Date();
    if (isProd) {
        return now.toISOString();
    }
    return now.toLocaleTimeString("en-US", { hour12: false });
}

function shouldLog(level: LogLevel): boolean {
    return logLevels[level] >= logLevels[currentLevel];
}

function formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const ts = getTimestamp();
    if (isProd) {
        return JSON.stringify({ timestamp: ts, level, message, ...meta });
    }
    const color = isBrowser ? "" : colors[level];
    const rst = isBrowser ? "" : reset;
    const levelStr = level.toUpperCase().padEnd(5);
    let output = `${color}[${ts}] ${levelStr}:${rst} ${message}`;
    if (meta && Object.keys(meta).length > 0) {
        output += ` ${JSON.stringify(meta)}`;
    }
    return output;
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    if (!shouldLog(level)) return;
    const formatted = formatMessage(level, message, meta);
    switch (level) {
        case "error":
            console.error(formatted);
            break;
        case "warn":
            console.warn(formatted);
            break;
        case "info":
            console.info(formatted);
            break;
        case "debug":
            console.debug(formatted);
            break;
    }
}

const logger = {
    debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
    info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
    error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
};

export default logger;