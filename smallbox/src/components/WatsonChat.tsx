"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Minus,
  RotateCcw,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

const STATIC_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ["hello", "hi", "hey", "start"],
    response:
      "Hello! I'm your SmallBox AI assistant, powered by watsonx.ai. I can help you understand your business performance, suggest ways to cut costs, generate marketing ideas, or answer questions about your dashboard. What would you like to explore?",
  },
  {
    keywords: ["revenue", "income", "sales", "money", "earn"],
    response:
      "Based on your dashboard, your business generated **$4,280 in revenue** this month — up 18% compared to last month. Your strongest income day was Wednesday. To keep growing, consider running a weekend promotion using the Marketing tab to generate AI-powered ad copy.",
  },
  {
    keywords: ["expense", "spend", "cost", "spending"],
    response:
      "Your total expenses this month are **$2,150**, giving you a net profit of $2,130. Your largest expense category is Rent ($1,200), followed by Supplies ($780). I noticed your Supplies budget is at 78% — you may want to review supplier pricing or consolidate orders to reduce costs.",
  },
  {
    keywords: ["budget", "limit", "over", "exceed"],
    response:
      "I see your Rent budget has hit 100% and Supplies is at 78%. Here are two suggestions:\n\n1. **Supplies** — Order in bulk to negotiate volume discounts with your supplier.\n2. **Rent** — If you're consistently hitting your rent budget, it may be worth reviewing whether your space is sized right for your current revenue.\n\nWould you like me to help you set new budget targets for next month?",
  },
  {
    keywords: ["website", "site", "publish", "build"],
    response:
      "Your website is live at **sweetcrumbs.smallbox.app** and received 1,847 views this month — a 12% increase! A few tips to grow traffic:\n\n1. Add your site URL to your Google Business Profile.\n2. Share your site link in your next email campaign.\n3. Consider adding a blog section (coming in v2) to help with SEO.\n\nGo to the Website Builder tab to edit your content anytime.",
  },
  {
    keywords: ["marketing", "campaign", "social", "post", "instagram", "email"],
    response:
      "You've sent 12 campaigns this month. Your last email had a strong open rate. Here are some content ideas for this week:\n\n1. **Instagram**: Showcase a behind-the-scenes video of your baking process — authenticity drives engagement.\n2. **Email**: A \"Thank You\" loyalty offer for repeat customers.\n3. **Google Ad**: Target \"custom cakes Mississauga\" — it's a high-intent search term.\n\nHead to the Marketing tab and I'll generate the copy for any of these!",
  },
  {
    keywords: ["review", "customer", "feedback", "sentiment"],
    response:
      "Your customer sentiment score is **78/100** — well above average for small businesses. Customers love your quality and custom cakes. The main concern flagged is delivery timing. A quick fix: send an automated SMS confirmation with an estimated delivery window when an order is placed.",
  },
  {
    keywords: ["profit", "net", "margin"],
    response:
      "This month's **net profit is $2,130** (a 50% margin on $4,280 revenue). That's a healthy margin for a food business — industry average is 35–45%. To push it higher:\n\n1. Introduce a premium tier product (e.g. wedding cake packages).\n2. Reduce supply costs with bulk purchasing.\n3. Use the AI marketing tools to grow revenue without increasing spend.",
  },
  {
    keywords: ["help", "what can you do", "features", "can you"],
    response:
      "Here's what I can help you with:\n\n- **Business performance** — ask about revenue, expenses, or profit\n- **Budget advice** — flag overruns and suggest optimizations\n- **Marketing ideas** — content suggestions for your business\n- **Website tips** — how to drive more traffic\n- **Customer insights** — review and sentiment summaries\n\nJust ask naturally — I'm here to help!",
  },
  {
    keywords: ["ibm", "watson", "ai", "powered"],
    response:
      "SmallBox is powered by several IBM services:\n\n- **watsonx.ai** — generates your website copy, marketing content, and powers me (your AI assistant)\n- **Watson NLU** — analyzes customer review sentiment\n- **IBM Cloudant** — stores all your business data securely\n- **IBM Cloud Continuous Delivery** — deploys your website automatically\n- **IBM Verify** — handles your login and security\n\nAll services are on IBM's free tier — no cost to you.",
  },
  {
    keywords: ["tip", "advice", "suggest", "improve", "grow", "better"],
    response:
      "Based on your current data, here are my top 3 recommendations:\n\n1. **Grow revenue**: Your website traffic is up 12% — capitalize on it with a weekend-only promo email campaign.\n2. **Cut costs**: Your supplies spending is trending up. Consider reviewing your top 3 suppliers for better rates.\n3. **Engage customers**: Your sentiment score shows customers love quality but have delivery concerns — address this proactively in your next newsletter.",
  },
];

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const entry of STATIC_RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response;
    }
  }
  return "That's a great question! As a watsonx.ai-powered assistant, I'm currently running in demo mode. Once IBM integration is connected, I'll be able to give you real-time analysis of that. In the meantime, try asking me about your revenue, expenses, budget, marketing, or website performance!";
}

function formatText(text: string) {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function WatsonChat() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I'm your SmallBox AI assistant, powered by **watsonx.ai**. Ask me about your revenue, expenses, marketing, or any business question!",
      timestamp: new Date(),
    },
  ]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, open, minimized]);

  const send = () => {
    const text = input.trim();
    if (!text || typing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      const response = getResponse(text);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: response,
          timestamp: new Date(),
        },
      ]);
      setTyping(false);
    }, delay);
  };

  const reset = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        text: "Hi! I'm your SmallBox AI assistant, powered by **watsonx.ai**. Ask me about your revenue, expenses, marketing, or any business question!",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1, boxShadow: "0 0 32px rgba(0,98,255,0.6)" }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#0062ff] flex items-center justify-center shadow-[0_4px_24px_rgba(0,98,255,0.5)] glow-animation"
          >
            <MessageSquare size={22} className="text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[380px] flex flex-col rounded-2xl border border-[#2a3a55] bg-[#111827] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden"
            style={{ maxHeight: minimized ? "auto" : "520px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a3a55] bg-[#0a0e1a] shrink-0">
              <div className="w-8 h-8 rounded-xl bg-[#0062ff] flex items-center justify-center shadow-[0_0_12px_rgba(0,98,255,0.5)]">
                <Sparkles size={15} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">SmallBox AI</p>
                <p className="text-[10px] text-[#4b5e7a] leading-tight">Powered by watsonx.ai</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={reset}
                  className="w-7 h-7 rounded-lg hover:bg-[#1a2235] flex items-center justify-center text-[#4b5e7a] hover:text-[#8b9cb6] transition-colors"
                  title="Clear chat"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  onClick={() => setMinimized((m) => !m)}
                  className="w-7 h-7 rounded-lg hover:bg-[#1a2235] flex items-center justify-center text-[#4b5e7a] hover:text-[#8b9cb6] transition-colors"
                >
                  <Minus size={13} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg hover:bg-[#1a2235] flex items-center justify-center text-[#4b5e7a] hover:text-[#8b9cb6] transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <AnimatePresence initial={false}>
              {!minimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="flex flex-col overflow-hidden"
                  style={{ flex: 1, minHeight: 0 }}
                >
                  <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: "360px" }}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-6 h-6 rounded-lg bg-[#0062ff]/20 border border-[#0062ff]/30 flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles size={11} className="text-[#0062ff]" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                            msg.role === "user"
                              ? "bg-[#0062ff] text-white rounded-tr-sm"
                              : "bg-[#1a2235] text-[#8b9cb6] rounded-tl-sm border border-[#2a3a55]"
                          }`}
                        >
                          {msg.role === "assistant" ? formatText(msg.text) : msg.text}
                        </div>
                      </motion.div>
                    ))}

                    {/* Typing indicator */}
                    {typing && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2"
                      >
                        <div className="w-6 h-6 rounded-lg bg-[#0062ff]/20 border border-[#0062ff]/30 flex items-center justify-center shrink-0">
                          <Sparkles size={11} className="text-[#0062ff]" />
                        </div>
                        <div className="bg-[#1a2235] border border-[#2a3a55] px-4 py-3 rounded-2xl rounded-tl-sm">
                          <div className="flex gap-1 items-center h-4">
                            {[0, 1, 2].map((i) => (
                              <motion.span
                                key={i}
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                className="w-1.5 h-1.5 rounded-full bg-[#4b5e7a] block"
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Suggested prompts */}
                  {messages.length === 1 && (
                    <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                      {["How's my revenue?", "Budget tips", "Marketing ideas", "What can you do?"].map((prompt) => (
                        <motion.button
                          key={prompt}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                          className="text-[11px] px-2.5 py-1 rounded-full border border-[#2a3a55] bg-[#1a2235] text-[#8b9cb6] hover:text-white hover:border-[#0062ff]/40 transition-all"
                        >
                          {prompt}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Input */}
                  <div className="p-3 border-t border-[#2a3a55] flex items-center gap-2 shrink-0">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && send()}
                      placeholder="Ask about your business..."
                      className="flex-1 bg-[#1a2235] border border-[#2a3a55] focus:border-[#0062ff]/50 rounded-xl px-3 py-2 text-sm text-white placeholder:text-[#4b5e7a] outline-none transition-colors"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={send}
                      disabled={!input.trim() || typing}
                      className="w-9 h-9 rounded-xl bg-[#0062ff] disabled:opacity-40 flex items-center justify-center hover:bg-[#0050d0] transition-colors shrink-0"
                    >
                      <Send size={15} className="text-white" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
