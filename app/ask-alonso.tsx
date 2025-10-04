import { useState } from "react";

const API_KEY = "AIzaSyANB3ceVLXaVuCpN6arRPnLMBdYA6OfgjM";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

export default function AskAlonsoPage() {
  const [messages, setMessages] = useState<Array<{
    id: number;
    user: string;
    message: string;
    timestamp: string;
    isUser?: boolean;
    isAlonso?: boolean;
  }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = {
      id: Date.now(),
      user: "You",
      message: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isUser: true,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Gemini API call
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: userMsg.message }],
            },
          ],
        }),
      });
      const data = await response.json();
      const aiText =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/\*\*([^*]+)\*\*/g, "$1").trim() ||
        "Sorry, I couldn't answer that.";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          user: "AI Alonso",
          message: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isAlonso: true,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          user: "AI Alonso",
          message: "Error connecting to AI service.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isAlonso: true,
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-row pb-20">
      {/* Left: Alonso Image */}
      <div className="w-1/3 flex items-center justify-center bg-[#1A1A1A] border-r border-[#333333]">
        <img
          src="/alonso_avatar.png"
          alt="Alonso Selfie Avatar"
          className="w-full h-full object-cover shadow-lg"
          style={{ minHeight: "100%" }}
        />
      </div>
      {/* Right: Chat UI */}
      <div className="w-2/3 flex flex-col">
        {/* Header */}
        <div className="bg-[#1A1A1A] border-b border-[#333333] p-4">
          <div className="flex items-center">
            <img src="/alonso_avatar.png" alt="Alonso" className="w-12 h-12 rounded-full mr-3" />
            <div>
              <h2 className="text-white font-semibold">AI Alonso</h2>
              <p className="text-gray-400 text-sm">Ask me anything</p>
            </div>
          </div>
        </div>
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl p-3 ${
                  msg.isUser
                    ? "bg-[#37D980] text-black"
                    : msg.isAlonso
                      ? "bg-[#005F41] text-white border border-[#37D980]/30"
                      : "bg-[#2A2A2A] text-white"
                }`}
              >
                {!msg.isUser && <div className="text-xs opacity-70 mb-1">{msg.user}</div>}
                <div>{msg.message}</div>
                <div className="text-xs opacity-70 mt-1">{msg.timestamp}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-[#005F41] text-white border border-[#37D980]/30 rounded-2xl p-3">
                <div className="text-xs opacity-70 mb-1">AI Alonso</div>
                <div>
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Input */}
        <div className="p-4 bg-[#1A1A1A] border-t border-[#333333]">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask Alonso anything..."
              className="flex-1 bg-[#2A2A2A] text-white border border-[#333333] rounded-full px-4 py-2 focus:outline-none focus:border-[#37D980]"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              className="bg-[#37D980] text-black p-2 rounded-full hover:bg-[#37D980]/90 transition-colors"
              disabled={loading}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-send"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
