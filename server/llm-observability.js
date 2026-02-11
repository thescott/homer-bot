// Datadog LLM Observability tracking
import tracer from './tracer.js';
import logger from './logger.js';

/**
 * Execute an OpenAI chat completion inside a properly traced LLM Obs span.
 * The span starts when the call begins and ends once the response is returned,
 * mirroring the Python LLMObs.llm() context manager pattern.
 */
export async function tracedChatCompletion({ openai, messages, model = 'gpt-4o-mini', maxTokens = 500, temperature = 0.8 }) {
  return tracer.llmobs.trace(
    {
      kind: 'llm',
      name: 'openai-chat-completion',
      modelName: model,
      modelProvider: 'openai',
    },
    async () => {
      const startTime = Date.now();

      const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
      });

      const duration = Date.now() - startTime;
      const responseMessage = completion.choices[0].message.content;

      // Annotate the span with input/output data and token metrics
      tracer.llmobs.annotate({
        inputData: messages.map(m => ({ role: m.role, content: m.content })),
        outputData: [{ role: 'assistant', content: responseMessage }],
        metrics: {
          input_tokens: completion.usage?.prompt_tokens,
          output_tokens: completion.usage?.completion_tokens,
          total_tokens: completion.usage?.total_tokens,
        },
        metadata: {
          temperature,
          max_tokens: maxTokens,
        },
      });

      logger.info('LLM API Call', {
        llm: {
          model,
          provider: 'openai',
          request_type: 'chat',
          duration_ms: duration,
          tokens: {
            prompt: completion.usage?.prompt_tokens,
            completion: completion.usage?.completion_tokens,
            total: completion.usage?.total_tokens,
          },
        },
        ml_app: 'homer-bot',
      });

      return { responseMessage, usage: completion.usage, duration };
    }
  );
}

export default { tracedChatCompletion };
