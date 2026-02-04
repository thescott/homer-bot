// Datadog LLM Observability tracking
import tracer from './tracer.js';
import logger from './logger.js';

/**
 * Track LLM API calls for Datadog LLM Observability
 * This sends metrics and traces for OpenAI API calls
 */
export function traceLLMCall({ model, prompt, response, duration, tokens }) {
  const span = tracer.scope().active();

  // Add LLM-specific tags to the current span
  if (span) {
    span.setTag('llm.request.model', model);
    span.setTag('llm.request.type', 'chat');
    span.setTag('llm.usage.prompt_tokens', tokens.prompt);
    span.setTag('llm.usage.completion_tokens', tokens.completion);
    span.setTag('llm.usage.total_tokens', tokens.total);
    span.setTag('llm.response.duration_ms', duration);

    // Tag for LLM Observability
    span.setTag('ml_app', 'homer-bot');
    span.setTag('model_name', model);
    span.setTag('model_provider', 'openai');
  }

  // Log for Datadog Logs correlation
  logger.info('LLM API Call', {
    llm: {
      model,
      provider: 'openai',
      request_type: 'chat',
      duration_ms: duration,
      tokens: {
        prompt: tokens.prompt,
        completion: tokens.completion,
        total: tokens.total,
      },
    },
    ml_app: 'homer-bot',
  });

  // Custom metrics for LLM monitoring
  const metrics = tracer.dogstatsd;
  if (metrics) {
    metrics.increment('llm.requests', 1, [`model:${model}`, 'provider:openai']);
    metrics.histogram('llm.duration', duration, [`model:${model}`]);
    metrics.histogram('llm.tokens.prompt', tokens.prompt, [`model:${model}`]);
    metrics.histogram('llm.tokens.completion', tokens.completion, [`model:${model}`]);
    metrics.histogram('llm.tokens.total', tokens.total, [`model:${model}`]);
  }
}

export default { traceLLMCall };
