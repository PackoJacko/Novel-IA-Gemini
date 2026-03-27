import React, { useState } from 'react';
import { Book } from '../types';
import { Printer, Copy, Download, Check, Loader2, Book as BookIcon, Globe, Mail, Instagram, Twitter, FileText } from 'lucide-react';
import { callAI } from '../lib/ai';

interface PublishProps {
  book: Book | null;
  onUpdate: (updates: Partial<Book>) => void;
}

const FORMATS = [
  { id: "libro", icon: <BookIcon size={20} />, label: "Libro / Novela", color: "#7c3aed", desc: "Formato editorial estándar." },
  { id: "blog", icon: <Globe size={20} />, label: "Web / Blog", color: "#3b82f6", desc: "Párrafos cortos, subtítulos." },
  { id: "substack", icon: <Mail size={20} />, label: "Substack / Newsletter", color: "#10b981", desc: "Primera persona, íntimo." },
  { id: "twitter", icon: <Twitter size={20} />, label: "Hilo X / Twitter", color: "#1a1825", desc: "Tweets de máx. 280 caracteres." },
  { id: "instagram", icon: <Instagram size={20} />, label: "Instagram", color: "#ec4899", desc: "Visual, emojis, hashtags." },
  { id: "guion", icon: <FileText size={20} />, label: "Guión Cine", color: "#ef4444", desc: "INT./EXT., diálogos centrados." },
];

export default function PublishComp({ book, onUpdate }: PublishProps) {
  const [format, setFormat] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const getFullText = () => {
    if (book?.manuscript) return book.manuscript;
    if (book?.chapters?.length) {
      return book.chapters.map(c => `## ${c.title}\n\n${c.content || ""}`).join("\n\n");
    }
    return "";
  };

  const generate = async () => {
    const fullText = getFullText();
    if (!format || !fullText) return;
    setBusy(true);
    setResult("");
    const fmt = FORMATS.find(f => f.id === format);
    try {
      const r = await callAI([{ role: "user", content: `Adapta el siguiente texto al formato: ${fmt?.label}. \n\nTEXTO:\n${fullText.substring(0, 5000)}` }], "Editor profesional.", 1500, book?.aiSettings);
      setResult(r);
    } catch (e) {
      console.error(e);
    }
    setBusy(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const download = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${book?.title || "novela"}-${format}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-serif text-[#1a1825] font-normal flex items-center gap-3">
          <Printer className="text-[#7c3aed]" /> Publicar
        </h2>
        <p className="text-sm text-[#6b6580] font-serif mt-2">Adapta tu texto a cualquier plataforma con un solo clic.</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {FORMATS.map(f => (
          <button 
            key={f.id} 
            onClick={() => { setFormat(f.id); setResult(""); }}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${format === f.id ? 'bg-[#f5f3ff] border-[#7c3aed] shadow-md' : 'bg-white border-[#e8e5f0] hover:border-[#7c3aed]/30'}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: f.color + '15', color: f.color }}>
                {f.icon}
              </div>
              <span className={`text-xs font-serif font-bold ${format === f.id ? 'text-[#7c3aed]' : 'text-[#1a1825]'}`}>{f.label}</span>
            </div>
            <p className="text-[10px] text-[#a09ab8] font-serif leading-relaxed line-clamp-2">{f.desc}</p>
          </button>
        ))}
      </div>

      {format && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-[#e8e5f0] rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-serif font-bold text-[#1a1825] mb-4 flex items-center gap-2">
                {FORMATS.find(f => f.id === format)?.icon} Configuración
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-[#f8f7f5] rounded-xl border border-[#e8e5f0]">
                  <div className="text-[10px] font-bold text-[#a09ab8] uppercase tracking-widest mb-1 font-serif">Fuente</div>
                  <div className="text-xs text-[#1a1825] font-serif font-semibold">Manuscrito principal</div>
                </div>
                <div className="p-3 bg-[#f8f7f5] rounded-xl border border-[#e8e5f0]">
                  <div className="text-[10px] font-bold text-[#a09ab8] uppercase tracking-widest mb-1 font-serif">Extensión</div>
                  <div className="text-xs text-[#1a1825] font-serif font-semibold">{getFullText().split(/\s+/).filter(Boolean).length} palabras</div>
                </div>
                <button 
                  onClick={generate} 
                  disabled={busy || !getFullText()}
                  className="w-full py-3 bg-[#7c3aed] text-white rounded-xl font-serif font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {busy ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  {busy ? "Adaptando..." : "Adaptar Contenido"}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {result ? (
              <div className="bg-white border border-[#e8e5f0] rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-serif font-bold text-[#1a1825]">Resultado</h3>
                  <div className="flex gap-2">
                    <button onClick={copy} className={`p-2 rounded-lg border transition-all ${copied ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-[#e8e5f0] text-[#6b6580] hover:bg-[#f8f7f5]'}`}>
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    <button onClick={download} className="p-2 rounded-lg border border-[#e8e5f0] bg-white text-[#6b6580] hover:bg-[#f8f7f5] transition-all">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-6 bg-[#f8f7f5] rounded-xl text-sm text-[#1a1825] font-serif leading-[1.8] whitespace-pre-wrap max-h-[500px] overflow-y-auto border border-[#e8e5f0]">
                  {result}
                </div>
              </div>
            ) : (
              <div className="bg-[#f8f7f5] border-2 border-dashed border-[#e8e5f0] rounded-3xl p-20 text-center flex flex-col items-center justify-center min-h-[400px]">
                <Printer size={48} className="text-[#a09ab8] mb-4 opacity-20" />
                <p className="text-sm text-[#a09ab8] font-serif">Haz clic en "Adaptar Contenido" para generar la versión final.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
