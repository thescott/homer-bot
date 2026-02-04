// Winston logger configured for Datadog log integration
import winston from 'winston';

// Use JSON format for Datadog log correlation
// dd-trace automatically injects trace_id, span_id when DD_LOGS_INJECTION=true
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: process.env.DD_SERVICE || 'homer-bot',
    env: process.env.DD_ENV || 'development',
    version: process.env.DD_VERSION || '1.0.0',
  },
  transports: [
    new winston.transports.Console({
      // Output pure JSON for Datadog to parse and correlate with traces
      format: winston.format.json(),
    }),
  ],
});

export default logger;
