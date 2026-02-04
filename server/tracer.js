// Datadog APM Tracer - must be initialized before other imports
import tracer from 'dd-trace';

tracer.init({
  service: process.env.DD_SERVICE || 'homer-bot',
  env: process.env.DD_ENV || 'development',
  version: '1.0.0',
  logInjection: true,
  runtimeMetrics: true,
  profiling: true,
  appsec: true,
});

export default tracer;
