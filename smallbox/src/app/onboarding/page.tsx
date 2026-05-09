"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
}

interface Answers {
  ownerName: string;
  businessName: string;
  description: string;
  industry: string;
  location: string;
  yearsInBusiness: string;
  hasWebsite: string;
  tracksFinances: string;
  biggestChallenge: string;
  goals: string[];
}

type Step =
  | "init"
  | "q1" | "q2" | "q3" | "q4" | "q5"
  | "q6" | "q7" | "q8" | "q9" | "q10"
  | "score" | "handoff";

const STEP_ORDER: Step[] = ["q1","q2","q3","q4","q5","q6","q7","q8","q9","q10"];
const OPTION_STEPS: Step[] = ["q4","q6","q7","q8","q9","q10"];

const OPTIONS: Partial<Record<Step, string[]>> = {
  q4: ["Retail","Food & Beverage","Health & Wellness","Professional Services","Trades & Home Services","Creative & Media","Other"],
  q6: ["Under 1 year","1–3 years","3+ years"],
  q7: ["Yes, with a custom domain","Yes, just a social media page","No"],
  q8: ["Accounting software","Spreadsheet","Paper","Nothing yet"],
  q9: ["Getting more customers","Managing money","Not enough time","Building an online presence","Other"],
  q10: ["Build or improve my website","Track finances","Create marketing content","Understand how my business is doing"],
};

function calcScore(a: Answers) {
  const onlinePresence =
    a.hasWebsite === "Yes, with a custom domain" ? 25 :
    a.hasWebsite === "Yes, just a social media page" ? 15 : 5;

  const financialTracking =
    a.tracksFinances === "Accounting software" ? 25 :
    a.tracksFinances === "Spreadsheet" ? 15 : 5;

  const businessMaturity =
    a.yearsInBusiness === "3+ years" ? 25 :
    a.yearsInBusiness === "1–3 years" ? 15 : 10;

  const goalClarity =
    a.goals.length >= 2 ? 25 :
    a.goals.length === 1 ? 15 : 5;

  return { onlinePresence, financialTracking, businessMaturity, goalClarity, total: onlinePresence + financialTracking + businessMaturity + goalClarity };
}

function buildScoreMessage(a: Answers, s: ReturnType<typeof calcScore>) {
  const biz = a.businessName;

  const presenceNote =
    s.onlinePresence === 25 ? `${biz} has a strong online foundation with a custom domain.` :
    s.onlinePresence === 15 ? `${biz} has a social media presence, but a dedicated website would open more doors.` :
    `${biz} doesn't have an online presence yet — that's the biggest opportunity to fix.`;

  const trackingNote =
    s.financialTracking === 25 ? "You're using proper accounting software — great financial hygiene." :
    s.financialTracking === 15 ? "You're tracking in a spreadsheet — a solid start, but there's room to level up." :
    "Your finances aren't tracked yet — SmallBox can change that today.";

  const maturityNote =
    s.businessMaturity === 25 ? "Your business has real experience behind it — that's a strong foundation." :
    s.businessMaturity === 15 ? "You're past the early stage and building momentum — keep going." :
    "You're just getting started — exciting times ahead, and SmallBox is here for it.";

  const goalNote =
    s.goalClarity === 25 ? "You know exactly what you need — that clarity means SmallBox can get to work fast." :
    s.goalClarity === 15 ? "You have a clear focus — SmallBox will double down on that." :
    "Let's help you find your footing and figure out where to focus first.";

  const summary =
    s.total >= 80 ? `${biz} is already in great shape. SmallBox will help you go from good to outstanding — faster than doing it alone.` :
    s.total >= 55 ? `${biz} has a solid base. A few focused improvements will make a real difference — and SmallBox will show you exactly where to start.` :
    `${biz} has real potential. SmallBox will start with what matters most and help you build step by step — no overwhelm, just progress.`;

  return `🏆 Your Business Health Score: ${s.total} / 100\n\nHere's how ${biz} is doing:\n\n- Online Presence — ${s.onlinePresence}/25: ${presenceNote}\n- Financial Tracking — ${s.financialTracking}/25: ${trackingNote}\n- Business Maturity — ${s.businessMaturity}/25: ${maturityNote}\n- Goal Clarity — ${s.goalClarity}/25: ${goalNote}\n\n${summary}`;
}

function buildHandoffMessage(a: Answers, s: ReturnType<typeof calcScore>) {
  const { onlinePresence, financialTracking } = s;

  let toolMsg: string;
  if (onlinePresence < 15 && financialTracking < 15) {
    toolMsg = "Since both your online presence and financial tracking need attention, start with the **Website Builder** to get found online — then move to **Finance & Budgeting** to get your numbers in order.";
  } else if (onlinePresence < 15) {
    toolMsg = "Your first stop should be the **Website Builder** — getting a proper online presence will make everything else easier.";
  } else if (financialTracking < 15) {
    toolMsg = "Head to **Finance & Budgeting** first — getting your money organized gives you a clear picture of how your business is really doing.";
  } else if (a.goals.includes("Build or improve my website")) {
    toolMsg = "Based on your goals, kick things off in the **Website Builder** — it's ready for you.";
  } else if (a.goals.includes("Track finances")) {
    toolMsg = "Head to **Finance & Budgeting** first — it's the best place to start given what you're aiming for.";
  } else {
    toolMsg = "Your **Dashboard** is ready with a full overview of everything SmallBox has set up for you.";
  }

  return `${toolMsg}\n\nYour profile is saved. Let's build something great, ${a.ownerName}. Your dashboard is ready whenever you are. 🚀`;
}

function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, li) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={li} className={li > 0 ? "mt-1.5" : ""}>
            {parts.map((part, pi) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={pi} className="font-semibold text-[#1d1d1f] dark:text-white">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                <span key={pi}>{part}</span>
              )
            )}
          </p>
        );
      })}
    </>
  );
}

export default function OnboardingPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<Step>("init");
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Partial<Answers>>({ goals: [] });
  const [botTyping, setBotTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  const addBotMsg = useCallback((text: string, delay = 700): Promise<void> => {
    return new Promise((resolve) => {
      setBotTyping(true);
      setTimeout(() => {
        setBotTyping(false);
        setMessages((prev) => [...prev, { id: `bot-${Date.now()}`, role: "bot", text }]);
        resolve();
      }, delay);
    });
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    addBotMsg(
      "Welcome to SmallBox! 👋 I'm your setup assistant — I'll help you get your business profile ready in about 3 minutes, so SmallBox knows exactly how to help you.\n\nFirst things first — what's your first name?",
      800
    ).then(() => setStep("q1"));
  }, [addBotMsg]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botTyping]);

  const addUserMsg = (text: string) => {
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: "user", text }]);
  };

  const processAnswer = useCallback(async (value: string, currentStep: Step, currentAnswers: Partial<Answers>) => {
    const a = { ...currentAnswers } as Answers;

    switch (currentStep) {
      case "q1":
        a.ownerName = value;
        setAnswers(a);
        await addBotMsg(`Nice to meet you, ${value}! 😊 What's the name of your business?`);
        setStep("q2");
        break;

      case "q2":
        a.businessName = value;
        setAnswers(a);
        await addBotMsg(`Love it! What does ${value} do? Describe it like you'd tell a friend.`);
        setStep("q3");
        break;

      case "q3":
        a.description = value;
        setAnswers(a);
        await addBotMsg(`That sounds great! What industry does ${a.businessName} belong to?`);
        setStep("q4");
        break;

      case "q4":
        a.industry = value;
        setAnswers(a);
        await addBotMsg(`Got it! Where is ${a.businessName} based? (city and country)`);
        setStep("q5");
        break;

      case "q5":
        a.location = value;
        setAnswers(a);
        await addBotMsg(`${value} — perfect! How long has ${a.businessName} been in business?`);
        setStep("q6");
        break;

      case "q6":
        a.yearsInBusiness = value;
        setAnswers(a);
        await addBotMsg(`Does ${a.businessName} currently have a website?`);
        setStep("q7");
        break;

      case "q7":
        a.hasWebsite = value;
        setAnswers(a);
        await addBotMsg(`Are you tracking income and expenses anywhere right now?`);
        setStep("q8");
        break;

      case "q8":
        a.tracksFinances = value;
        setAnswers(a);
        await addBotMsg(`What's your biggest challenge right now?`);
        setStep("q9");
        break;

      case "q9":
        a.biggestChallenge = value;
        setAnswers(a);
        await addBotMsg(`Almost done! What would help ${a.businessName} the most? You can pick up to 2.`);
        setStep("q10");
        break;

      case "q10": {
        a.goals = value.split(", ").filter(Boolean);
        setAnswers(a);
        const scores = calcScore(a);
        setStep("score");
        await addBotMsg(buildScoreMessage(a, scores), 1400);
        await addBotMsg(buildHandoffMessage(a, scores), 900);
        setStep("handoff");

        // Output JSON silently (IBM Cloudant payload)
        const profileJSON = {
          owner_name: a.ownerName,
          business_name: a.businessName,
          description: a.description,
          industry: a.industry,
          location: a.location,
          years_in_business: a.yearsInBusiness,
          has_website: a.hasWebsite,
          tracks_finances: a.tracksFinances,
          biggest_challenge: a.biggestChallenge,
          goals: a.goals,
          health_score: {
            total: scores.total,
            online_presence: scores.onlinePresence,
            financial_tracking: scores.financialTracking,
            business_maturity: scores.businessMaturity,
            goal_clarity: scores.goalClarity,
          },
        };
        console.log("[SmallBox → IBM Cloudant]", JSON.stringify(profileJSON, null, 2));
        break;
      }
    }
  }, [addBotMsg]);

  const handleOptionClick = (opt: string) => {
    if (step === "q10") {
      setSelected((prev) =>
        prev.includes(opt) ? prev.filter((o) => o !== opt) : prev.length < 2 ? [...prev, opt] : prev
      );
    } else {
      addUserMsg(opt);
      processAnswer(opt, step, answers);
    }
  };

  const handleMultiConfirm = () => {
    if (selected.length === 0) return;
    const value = selected.join(", ");
    addUserMsg(value);
    setSelected([]);
    processAnswer(value, step, answers);
  };

  const handleTextSubmit = () => {
    const text = input.trim();
    if (!text || botTyping) return;
    setInput("");
    addUserMsg(text);
    processAnswer(text, step, answers);
    inputRef.current?.focus();
  };

  const stepIndex = STEP_ORDER.indexOf(step);
  const progress = stepIndex >= 0 ? ((stepIndex + 1) / 10) * 100 : step === "score" || step === "handoff" ? 100 : 0;
  const progressLabel = stepIndex >= 0 ? `Question ${stepIndex + 1} of 10` : step === "score" || step === "handoff" ? "Complete" : "";

  const showOptions = !botTyping && OPTION_STEPS.includes(step) && (OPTIONS[step]?.length ?? 0) > 0;
  const showTextInput = !botTyping && !showOptions && step !== "score" && step !== "handoff" && step !== "init";
  const showDashboard = step === "handoff" && !botTyping;

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#080810] grid-bg flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-black/8 dark:border-white/8 bg-white/60 dark:bg-black/30 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_12px_rgba(0,98,255,0.4)]">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <span className="font-semibold text-[#1d1d1f] dark:text-white text-sm">SmallBox</span>
        </div>
        <ThemeToggle />
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center py-8 px-4">
        <div className="w-full max-w-2xl flex flex-col gap-4">
          {/* Title */}
          <div className="text-center">
            <p className="text-[11px] font-medium tracking-wider uppercase text-black/40 dark:text-white/40 mb-1">
              Setup Wizard · Phase 2 — Business Profile
            </p>
            <h1 className="text-2xl font-bold text-[#1d1d1f] dark:text-white">
              Let&apos;s set up your business profile
            </h1>
          </div>

          {/* Progress */}
          <AnimatePresence>
            {progressLabel && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-black/40 dark:text-white/40">{progressLabel}</span>
                  <span className="text-[11px] text-black/40 dark:text-white/40">{Math.round(progress)}%</span>
                </div>
                <div className="h-1 bg-black/8 dark:bg-white/8 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat card */}
          <div
            className="rounded-2xl border border-black/8 dark:border-white/8 bg-white/92 dark:bg-[#12141f]/92 backdrop-blur-xl shadow-[0_16px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_60px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
            style={{ minHeight: 480 }}
          >
            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-5 space-y-4"
              style={{ maxHeight: 480 }}
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2.5`}
                >
                  {msg.role === "bot" && (
                    <div className="w-7 h-7 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles size={13} className="text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-tr-sm"
                        : "bg-black/5 dark:bg-white/8 text-[#1d1d1f] dark:text-white rounded-tl-sm border border-black/6 dark:border-white/8"
                    }`}
                  >
                    {msg.role === "bot" ? <RichText text={msg.text} /> : msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {botTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="flex items-start gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                      <Sparkles size={13} className="text-primary" />
                    </div>
                    <div className="bg-black/5 dark:bg-white/8 border border-black/6 dark:border-white/8 px-4 py-3 rounded-2xl rounded-tl-sm">
                      <div className="flex gap-1 items-center h-4">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            className="w-1.5 h-1.5 rounded-full bg-black/30 dark:bg-white/30 block"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-black/8 dark:border-white/8 p-4">
              <AnimatePresence mode="wait">
                {showOptions && (
                  <motion.div
                    key="options"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="space-y-2.5"
                  >
                    <div className="flex flex-wrap gap-2">
                      {OPTIONS[step]?.map((opt) => {
                        const isSelected = selected.includes(opt);
                        return (
                          <motion.button
                            key={opt}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleOptionClick(opt)}
                            className={`px-3.5 py-2 rounded-xl text-sm border transition-all text-left flex items-center gap-2 ${
                              isSelected
                                ? "bg-primary/15 border-primary/40 text-primary font-medium"
                                : "bg-black/4 dark:bg-white/5 border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-white hover:border-primary/30 hover:bg-primary/8"
                            }`}
                          >
                            {step === "q10" && (
                              <span
                                className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                                  isSelected ? "bg-primary border-primary" : "border-black/20 dark:border-white/20"
                                }`}
                              >
                                {isSelected && <Check size={10} className="text-white" />}
                              </span>
                            )}
                            {opt}
                          </motion.button>
                        );
                      })}
                    </div>
                    {step === "q10" && (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleMultiConfirm}
                        disabled={selected.length === 0}
                        className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-35 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,98,255,0.35)]"
                      >
                        Confirm my choices <ArrowRight size={14} />
                      </motion.button>
                    )}
                  </motion.div>
                )}

                {showTextInput && (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex gap-2"
                  >
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
                      placeholder="Type your answer..."
                      autoFocus
                      className="flex-1 bg-black/5 dark:bg-white/6 border border-black/8 dark:border-white/8 focus:border-primary/40 rounded-xl px-3.5 py-2.5 text-sm text-[#1d1d1f] dark:text-white placeholder:text-black/35 dark:placeholder:text-white/35 outline-none transition-colors"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleTextSubmit}
                      disabled={!input.trim()}
                      className="w-10 h-10 rounded-xl bg-primary disabled:opacity-35 flex items-center justify-center shrink-0 shadow-[0_4px_16px_rgba(0,98,255,0.35)]"
                    >
                      <Send size={15} className="text-white" />
                    </motion.button>
                  </motion.div>
                )}

                {showDashboard && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Link href="/dashboard">
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 8px_32px rgba(0,98,255,0.5)" }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(0,98,255,0.4)]"
                      >
                        Open My Dashboard <ArrowRight size={16} />
                      </motion.button>
                    </Link>
                  </motion.div>
                )}

                {(step === "score" || (botTyping && step !== "q1")) && !showOptions && !showTextInput && !showDashboard && (
                  <motion.div
                    key="calculating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-xs text-black/35 dark:text-white/35 py-2"
                  >
                    {step === "score" ? "Calculating your Business Health Score..." : ""}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
