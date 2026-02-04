// Datadog APM Tracer
// When using --import dd-trace/initialize.mjs, tracer is already initialized
// via environment variables. We just export the instance here.
import tracer from 'dd-trace';

export default tracer;
