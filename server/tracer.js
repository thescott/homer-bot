// Datadog APM Tracer
// When using --import dd-trace/initialize.mjs, tracer is already initialized
// via environment variables. We just export the instance here.
import tracer from 'dd-trace';

// Enable LLM Observability to track LLM spans with input/output data and metrics
tracer.llmobs.enable({
  mlApp: 'homer-bot',
});

export default tracer;
