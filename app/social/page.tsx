"use client"
import { useState } from "react";
import Link from "next/link";
import { Home, MessageCircle, Trophy, Video, Users } from "lucide-react";

const mockSocialMessages = [
  { id: 1, user: "SpeedKing", message: "Who do you think will win the next race?", timestamp: "09:15" },
  { id: 2, user: "TurboFan", message: "My bet is on Verstappen for pole position!", timestamp: "09:16" },
  { id: 3, user: "F1 Fan", message: "I think Norris will surprise everyone!", timestamp: "09:17", isUser: true },
  { id: 4, user: "RaceGuru", message: "Alonso for fastest lap, anyone?", timestamp: "09:18" },
  { id: 5, user: "AI Alonso", message: "Consistency is key. I always aim for the podium!", timestamp: "09:19", isAlonso: true },
  { id: 6, user: "F1 Fan", message: "Alonso, what’s your prediction for the winner?", timestamp: "09:20", isUser: true },
  { id: 7, user: "AI Alonso", message: "Every race is a new challenge. Let’s see who adapts best!", timestamp: "09:21", isAlonso: true },
  { id: 8, user: "SpeedKing", message: "Can Ferrari bounce back this weekend?", timestamp: "09:22" },
  { id: 9, user: "TurboFan", message: "I hope for a wet race, always more drama!", timestamp: "09:23" },
  { id: 10, user: "F1 Fan", message: "I’m excited for qualifying!", timestamp: "09:24", isUser: true },
];

const Navigation = () => {
  const navItems = [
    { id: "home", icon: Home, label: "Home", href: "/" },
    { id: "avatar", icon: MessageCircle, label: "Ask Alonso", href: "/ask-alonso" },
    { id: "predictions", icon: Trophy, label: "Predictions", href: "/#predictions" },
    { id: "reels", icon: Video, label: "Reels", href: "/#reels" },
    { id: "social", icon: Users, label: "Social", href: "/social" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[#333333] z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ id, icon: Icon, label, href }) => (
          <Link
            key={id}
            href={href}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors text-gray-400 hover:text-white`}
          >
            <Icon size={20} />
            <span className="text-xs mt-1">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default function SocialPage() {
  const [messages, setMessages] = useState(mockSocialMessages);
  const [input, setInput] = useState("");

  const sendMessage = () => {
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
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col pb-20">
      {/* Header */}
      <div className="bg-[#1A1A1A] border-b border-[#333333] p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">F1 Social Space</h1>
            <p className="text-gray-400 text-sm">Chat with fellow F1 fans</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#37D980] rounded-full animate-pulse"></div>
            <span className="text-[#37D980] text-sm">Live</span>
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
                    ? "bg-gradient-to-r from-[#005F41] to-[#37D980]/20 text-white border border-[#37D980]/50"
                    : "bg-[#2A2A2A] text-white"
              }`}
            >
              <div className="flex items-center mb-1">
                <span className="text-xs opacity-70">{msg.user}</span>
                {msg.isAlonso && (
                  <div className="ml-2 bg-[#37D980] text-black text-xs px-2 py-0.5 rounded-full">Premium AI</div>
                )}
              </div>
              <div>{msg.message}</div>
              <div className="text-xs opacity-70 mt-1">{msg.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Input */}
      <div className="p-4 bg-[#1A1A1A] border-t border-[#333333]">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Chat with F1 fans..."
            className="flex-1 bg-[#2A2A2A] text-white border border-[#333333] rounded-full px-4 py-2 focus:outline-none focus:border-[#37D980]"
          />
          <button
            onClick={sendMessage}
            className="bg-[#37D980] text-black p-2 rounded-full hover:bg-[#37D980]/90 transition-colors"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-send"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">🔴 WebSocket connected • Real-time chat active</div>
      </div>
      <Navigation />
    </div>
  );
}
