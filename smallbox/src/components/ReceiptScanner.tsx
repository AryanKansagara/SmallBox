"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  X,
  ScanLine,
  CheckCircle,
  Loader2,
  RefreshCw,
  ImageIcon,
} from "lucide-react";

const CATEGORIES = [
  "Sales", "Supplies", "Marketing", "Utilities",
  "Rent", "Payroll", "Insurance", "Equipment", "Other",
];

export interface ScannedTransaction {
  description: string;
  amount: number;
  date: string;
  category: string;
  transactionType: "income" | "expense";
}

interface Props {
  onClose: () => void;
  onConfirm: (data: ScannedTransaction) => void;
}

// ── Receipt text parser ───────────────────────────────────────────────────────

function parseReceiptText(text: string): { description: string; amount: number; date: string } {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const amtRegex = /\$?\s*(\d{1,6}[.,]\d{2})/g;
  const amounts: number[] = [];
  let match: RegExpExecArray | null;
  while ((match = amtRegex.exec(text)) !== null) {
    const val = parseFloat(match[1]!.replace(",", "."));
    if (!isNaN(val) && val > 0) amounts.push(val);
  }

  let amount = 0;
  const totalLine = lines.find((l) => /\b(total|amount due|grand total|balance due|subtotal)\b/i.test(l));
  if (totalLine) {
    const m = totalLine.match(/\$?\s*(\d{1,6}[.,]\d{2})/);
    if (m) amount = parseFloat(m[1]!.replace(",", "."));
  }
  if (!amount && amounts.length > 0) amount = Math.max(...amounts);

  let date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const dateRegex =
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s*\d{4})\b/i;
  const dateMatch = text.match(dateRegex);
  if (dateMatch) {
    const d = new Date(dateMatch[0]!);
    if (!isNaN(d.getTime())) {
      date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  }

  const description =
    lines.find(
      (l) =>
        l.length > 3 &&
        !/^\d+$/.test(l) &&
        !/^[\$\#\*\-=_]+$/.test(l) &&
        !/^(date|time|receipt|invoice|thank|thank you)/i.test(l),
    ) ?? "Receipt";

  return { description: description.slice(0, 80), amount, date };
}

// ── Component ─────────────────────────────────────────────────────────────────

const inputCls = "w-full bg-black/4 dark:bg-white/6 border border-black/10 dark:border-white/10 focus:border-primary/50 rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-white text-sm placeholder:text-black/35 dark:placeholder:text-white/35 outline-none transition-colors mt-1";

type Step = "choose" | "camera" | "preview";

export default function ReceiptScanner({ onClose, onConfirm }: Props) {
  const [step, setStep] = useState<Step>("choose");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [categorizing, setCategorizing] = useState(false);
  const [form, setForm] = useState<ScannedTransaction | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = useCallback(async () => {
    setStep("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      alert("Camera access was denied. Please use the upload option instead.");
      setStep("choose");
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const url = canvas.toDataURL("image/jpeg", 0.92);
    stopCamera();
    setImageUrl(url);
    setStep("preview");
    void runOcr(url);
  }, [stopCamera]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileInput = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setStep("preview");
    void runOcr(url);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const runOcr = async (src: string) => {
    setScanning(true);
    setForm(null);
    setScanProgress(0);
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng", 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setScanProgress(Math.round((m.progress ?? 0) * 100));
          }
        },
      });
      const { data: { text } } = await worker.recognize(src);
      await worker.terminate();

      const parsed = parseReceiptText(text);
      setScanning(false);

      setCategorizing(true);
      let category = "Other";
      let transactionType: "income" | "expense" = "expense";
      try {
        const res = await fetch("/api/finance/categorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: parsed.description, amount: parsed.amount }),
        });
        if (res.ok) {
          const data = (await res.json()) as { category: string; transactionType: "income" | "expense" };
          category = data.category;
          transactionType = data.transactionType;
        }
      } catch {
        // silently use defaults
      }
      setCategorizing(false);
      setForm({ ...parsed, category, transactionType });
    } catch (err) {
      console.error("OCR error:", err);
      setScanning(false);
      setCategorizing(false);
    }
  };

  const reset = () => {
    stopCamera();
    setImageUrl(null);
    setForm(null);
    setScanProgress(0);
    setStep("choose");
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      >
        <motion.div
          className="glass-strong border border-black/8 dark:border-white/8 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 12 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/8 dark:border-white/8">
            <div className="flex items-center gap-2">
              <ScanLine size={17} className="text-primary" />
              <span className="text-[#1d1d1f] dark:text-white font-semibold text-sm">Scan Receipt</span>
              <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5 font-medium">
                OCR
              </span>
            </div>
            <button onClick={handleClose} className="text-black/35 dark:text-white/35 hover:text-black dark:hover:text-white transition-colors">
              <X size={17} />
            </button>
          </div>

          <div className="p-5 space-y-4">

            {/* ── Step: Choose ── */}
            {step === "choose" && (
              <div className="space-y-3">
                <p className="text-xs text-black/40 dark:text-white/40 text-center">
                  Take a photo or upload an image of your receipt. Text is read on-device — no data sent to OCR services.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={startCamera}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl border border-black/8 dark:border-white/8 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <Camera size={26} className="text-primary" />
                    <div className="text-center">
                      <div className="text-[#1d1d1f] dark:text-white text-sm font-medium">Camera</div>
                      <div className="text-black/40 dark:text-white/40 text-[11px] mt-0.5">Take a photo</div>
                    </div>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl border border-black/8 dark:border-white/8 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <ImageIcon size={26} className="text-primary" />
                    <div className="text-center">
                      <div className="text-[#1d1d1f] dark:text-white text-sm font-medium">Upload</div>
                      <div className="text-black/40 dark:text-white/40 text-[11px] mt-0.5">From your device</div>
                    </div>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileInput(f); e.target.value = ""; }}
                />
              </div>
            )}

            {/* ── Step: Camera ── */}
            {step === "camera" && (
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden bg-black aspect-[4/3] relative">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  {["tl", "tr", "bl", "br"].map((pos) => (
                    <div key={pos} className={`absolute w-6 h-6 ${pos.includes("t") ? "top-3" : "bottom-3"} ${pos.includes("l") ? "left-3" : "right-3"} border-2 border-primary ${pos === "tl" ? "border-b-0 border-r-0 rounded-tl" : pos === "tr" ? "border-b-0 border-l-0 rounded-tr" : pos === "bl" ? "border-t-0 border-r-0 rounded-bl" : "border-t-0 border-l-0 rounded-br"}`} />
                  ))}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { stopCamera(); setStep("choose"); }}
                    className="px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white text-sm transition-colors">
                    Cancel
                  </button>
                  <button onClick={capturePhoto}
                    className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                    <Camera size={14} /> Capture
                  </button>
                </div>
              </div>
            )}

            {/* ── Step: Preview + OCR + Form ── */}
            {step === "preview" && imageUrl && (
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden bg-black/10 dark:bg-black max-h-44 flex items-center justify-center relative border border-black/8 dark:border-white/8">
                  <img src={imageUrl} alt="Receipt" className="max-h-44 w-full object-contain" />

                  {scanning && (
                    <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center gap-3">
                      <div className="relative">
                        <ScanLine size={22} className="text-primary" />
                        <motion.div
                          className="absolute left-0 right-0 h-0.5 bg-primary/70"
                          animate={{ top: ["10%", "90%", "10%"] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                      <div className="text-white text-xs text-center">
                        Reading receipt...
                        {scanProgress > 0 && <span className="text-primary ml-1">{scanProgress}%</span>}
                      </div>
                      <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${scanProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {!scanning && categorizing && (
                  <div className="flex items-center gap-2 text-black/40 dark:text-white/40 text-xs">
                    <Loader2 size={11} className="animate-spin text-primary" />
                    Categorizing with AI...
                  </div>
                )}

                {form && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#10b981]">
                      <CheckCircle size={11} />
                      Receipt scanned — review and confirm
                    </div>

                    <div>
                      <label className="text-black/40 dark:text-white/40 text-[10px] uppercase tracking-wide font-medium">Description</label>
                      <input
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className={inputCls}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-black/40 dark:text-white/40 text-[10px] uppercase tracking-wide font-medium">Amount ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.amount || ""}
                          onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-black/40 dark:text-white/40 text-[10px] uppercase tracking-wide font-medium">Date</label>
                        <input
                          value={form.date}
                          onChange={(e) => setForm({ ...form, date: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-black/40 dark:text-white/40 text-[10px] uppercase tracking-wide font-medium">Category</label>
                        <select
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          className={inputCls}
                        >
                          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-black/40 dark:text-white/40 text-[10px] uppercase tracking-wide font-medium">Type</label>
                        <div className="flex gap-1 mt-1">
                          {(["expense", "income"] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setForm({ ...form, transactionType: t })}
                              className={`flex-1 py-2 rounded-xl text-[11px] font-semibold capitalize transition-colors border ${
                                form.transactionType === t
                                  ? t === "expense"
                                    ? "bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30"
                                    : "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30"
                                  : "bg-black/4 dark:bg-white/4 text-black/40 dark:text-white/40 border-black/10 dark:border-white/10"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={reset}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white text-xs transition-colors"
                      >
                        <RefreshCw size={11} /> Rescan
                      </button>
                      <button
                        onClick={() => onConfirm(form)}
                        disabled={!form.amount || !form.description.trim()}
                        className="flex-1 py-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <Upload size={13} /> Add Transaction
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
