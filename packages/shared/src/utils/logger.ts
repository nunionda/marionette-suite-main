// ---------------------------------------------------------------------------
// Simple structured logger wrapping console
// ---------------------------------------------------------------------------

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export interface Logger {
  debug: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
}

export function createLogger(
  name: string,
  minLevel: LogLevel = "info",
): Logger {
  const shouldLog = (level: LogLevel): boolean =>
    LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel];

  const log =
    (level: LogLevel) =>
    (message: string, meta?: Record<string, unknown>): void => {
      if (!shouldLog(level)) return;
      const ts = new Date().toISOString();
      const prefix = `[${ts}] [${level.toUpperCase()}] [${name}]`;
      const suffix = meta ? ` ${JSON.stringify(meta)}` : "";
      // eslint-disable-next-line no-console
      console[level === "debug" ? "log" : level](`${prefix} ${message}${suffix}`);
    };

  return {
    debug: log("debug"),
    info: log("info"),
    warn: log("warn"),
    error: log("error"),
  };
}
