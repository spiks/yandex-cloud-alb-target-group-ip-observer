import winston, { transports, format } from 'winston';

export const logger = winston.createLogger({
  format: format.combine(
    format.splat(),
    format.timestamp(),
    format.printf(({ level, message, timestamp }) => `${timestamp} ${level.toUpperCase()}: ${message}`),
  ),
  levels: winston.config.syslog.levels,
  transports: [new transports.Console()],
});
