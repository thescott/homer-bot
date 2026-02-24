// Datadog LLM Observability tracking
import tracer from './tracer.js';
import logger from './logger.js';

/**
 * Execute an OpenAI chat completion inside a properly traced LLM Obs span.
 * The span starts when the call begins and ends once the response is returned,
 * mirroring the Python LLMObs.llm() context manager pattern.
 */
export async function tracedChatCompletion({ openai, messages, model = 'gpt-4o-mini', maxTokens = 200, temperature = 0.8 }) {
  return tracer.llmobs.trace(
    {
      kind: 'llm',
      name: 'openai-chat-completion',
      modelName: model,
      modelProvider: 'openai',
    },
    async () => {
      const startTime = Date.now();
      let timeToFirstToken = null;

      // Use streaming to capture time_to_first_token
      const stream = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
        stream: true,
        stream_options: { include_usage: true },
      });

      const chunks = [];
      let usage = null;

      for await (const chunk of stream) {
        // Record TTFT on the first content chunk
        if (timeToFirstToken === null && chunk.choices?.[0]?.delta?.content) {
          timeToFirstToken = (Date.now() - startTime) / 1000; // seconds
        }

        if (chunk.choices?.[0]?.delta?.content) {
          chunks.push(chunk.choices[0].delta.content);
        }

        // The final chunk with stream_options includes usage
        if (chunk.usage) {
          usage = chunk.usage;
        }
      }

      const duration = Date.now() - startTime;
      const responseMessage = chunks.join('');

      // Annotate the span with input/output data, token metrics, and TTFT
      tracer.llmobs.annotate({
        inputData: messages.map(m => ({ role: m.role, content: m.content })),
        outputData: [{ role: 'assistant', content: responseMessage }],
        metrics: {
          input_tokens: usage?.prompt_tokens,
          output_tokens: usage?.completion_tokens,
          total_tokens: usage?.total_tokens,
          time_to_first_token: timeToFirstToken,
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
          time_to_first_token_s: timeToFirstToken,
          tokens: {
            prompt: usage?.prompt_tokens,
            completion: usage?.completion_tokens,
            total: usage?.total_tokens,
          },
        },
        ml_app: 'homer-bot',
      });

      return { responseMessage, usage, duration };
    }
  );
}

export default { tracedChatCompletion };
