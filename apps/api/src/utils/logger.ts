type LogLevel = "info" | "warn" | "error";

interface LogFields {
  requestId?: string;
  userId?: string;
  service?: string;
  [key: string]: unknown;
}

/**
 * Every line is one JSON object with a timestamp and severity — ready to
 * ship to a real aggregator (Datadog, Better Stack, CloudWatch...) without
 * changing a single call site. Swap the console.* calls below for that
 * aggregator's SDK when you have one; nothing else in the codebase needs
 * to change.
 */
function write(level: LogLevel, message: string, fields: LogFields = {}) {
  const line = JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, fields?: LogFields) => write("info", message, fields),
  warn: (message: string, fields?: LogFields) => write("warn", message, fields),
  error: (message: string, fields?: LogFields) => write("error", message, fields),
};
