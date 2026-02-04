import { useState, useRef, useEffect } from 'react';

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Mmm, donuts! Hi there! I'm Homer, your friendly donut expert. Ask me anything about donuts, donut shops, or where to find the best donuts in your area!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "D'oh! Something went wrong. Please try again!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-yellow-50 to-orange-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-500 to-orange-400 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/donut.svg" alt="Donut" className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold text-white">Homer Bot</h1>
              <p className="text-pink-100 text-sm">Your Friendly Donut Expert</p>
            </div>
          </div>
          <img
            src="/homer.png"
            alt="Homer Simpson"
            className="w-20 h-20 object-contain drop-shadow-lg"
          />
        </div>
      </header>

      {/* Chat Container */}
      <main className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Messages */}
          <div className="chat-messages h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🍩</span>
                      <span className="font-semibold text-pink-600">Homer</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🍩</span>
                    <span className="font-semibold text-pink-600">Homer</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="typing-dot w-2 h-2 bg-pink-400 rounded-full"></span>
                    <span className="typing-dot w-2 h-2 bg-pink-400 rounded-full"></span>
                    <span className="typing-dot w-2 h-2 bg-pink-400 rounded-full"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={sendMessage}
            className="border-t border-gray-200 p-4 bg-gray-50"
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about donuts..."
                className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold rounded-full hover:from-pink-600 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Send
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-4">
          Powered by ChatGPT | Built with React & Datadog
        </p>
      </main>
    </div>
  );
}

export default App;
