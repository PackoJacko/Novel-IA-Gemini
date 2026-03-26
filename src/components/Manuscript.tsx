import React, { useState, useRef, useEffect } from 'react';
import { Book } from '../types';
import { callAI } from '../lib/gemini';
import { Edit3, Sparkles, Loader2, X, Check } from 'lucide-react';

interface ManuscriptProps {
  book: Book | null;
  onUpdate: (updates: Partial<Book>) => void;
}

const TOOLS = [
  { id: "descriptivo", label: "🎨 Descriptivo", group: "estilo" },
  { id: "intenso", label: "🔥 Intenso", group: "estilo" },
  { id: "corto", label: "✂ Corto", group: "estilo" },
  { id: "cliffhanger", label: "🪝 Cliffhanger", group: "drama" },
  { id: "giro", label: "🌀 Giro", group: "drama" },
  { id: "tension", label: "⚡ Tensión", group: "drama" },
  { id: "dialogo", label: "💬 Diálogo", group: "drama" },
  { id: "flashback", label: "⏮ Flashback", group: "narrativa" },
  { id: "foreshadow", label: "🔮 Presagio", group: "narrativa" },
  { id: "metafora", label: "🌿 Metáfora", group: "narrativa" },
];

export default function Manuscript({ book, onUpdate }: ManuscriptProps) {
  const [selText, setSelText] = useState("");
  const [selRange, setSelRange] = useState<[number, number]>([0, 0]);
  const [showTools, setShowTools] = useState(false);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<{ type: 'rewrite' | 'describe', results?: any, mode?: string } | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const handleSel = () => {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.value.substring(ta.selectionStart, ta.selectionEnd).trim();
    if (s.length > 3) {
      setSelText(s);
      setSelRange([ta.selectionStart, ta.selectionEnd]);
      setShowTools(true);
    } else {
      setShowTools(false);
    }
  };

  const buildCtx = () => {
    let ctx = "";
    if (book?.characters?.length) {
      ctx += "PERSONAJES:\n";
      book.characters.forEach(c => {
        ctx += `• ${c.name}(${c.role}):${c.appearance}\n`;
      });
      ctx += "\n";
    }
    return ctx;
  };

  const openRewrite = async (mode: string) => {
    setBusy(true);
    setModal({ type: 'rewrite', mode, results: null });
    const pm: Record<string, string> = {
      descriptivo: "Reescribe más descriptivo:",
      intenso: "Reescribe con más tensión:",
      corto: "Reescribe más conciso:",
      cliffhanger: "Reescribe terminando en cliffhanger:",
      giro: "Reescribe con un giro:",
      tension: "Reescribe con urgencia y frases cortas:",
      dialogo: "Convierte en diálogo:",
      flashback: "Transforma en flashback:",
      foreshadow: "Añade presagios:",
      metafora: "Añade metáforas:",
    };
    try {
      const r = await callAI([{ role: "user", content: pm[mode] + "\n\n\"" + selText + "\"" }], "Novelista." + buildCtx(), 800);
      setModal({ type: 'rewrite', mode, results: r });
    } catch (e) {
      console.error(e);
      setModal(null);
    }
    setBusy(false);
  };

  const insertResult = (text: string) => {
    if (!book) return;
    const m = book.manuscript || "";
    const n = m.substring(0, selRange[0]) + text + m.substring(selRange[1]);
    onUpdate({ manuscript: n });
    setModal(null);
    setShowTools(false);
  };

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h2 className="text-3xl font-serif text-[#1a1825] font-normal flex items-center gap-3">
          <Edit3 className="text-[#7c3aed]" /> Manuscrito
        </h2>
        <p className="text-sm text-[#6b6580] font-serif mt-2">Escribe. Selecciona texto para herramientas de IA.</p>
      </header>

      {showTools && (
        <div className="bg-white border border-[#7c3aed]/30 rounded-2xl p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 overflow-x-auto">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] text-[#6b6580] font-serif italic truncate max-w-[200px]">«{selText}»</span>
            <button onClick={() => setShowTools(false)} className="text-[#a09ab8] hover:text-[#1a1825] transition-colors"><X size={16} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {TOOLS.map(t => (
              <button 
                key={t.id} 
                onClick={() => openRewrite(t.id)}
                className="px-3 py-1.5 rounded-full border border-[#7c3aed]/20 bg-[#f5f3ff] text-[#7c3aed] text-[11px] font-serif font-semibold hover:bg-[#ede9fe] transition-all"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <textarea 
          ref={taRef}
          value={book?.manuscript || ""}
          onChange={e => onUpdate({ manuscript: e.target.value })}
          onMouseUp={handleSel}
          onKeyUp={handleSel}
          placeholder="Escribe aquí tu novela..."
          className="w-full min-h-[600px] bg-white border border-[#e8e5f0] rounded-2xl p-8 md:p-12 text-[#1a1825] text-lg font-serif leading-[2] outline-none resize-y shadow-sm focus:border-[#7c3aed] transition-colors"
        />
        <div className="absolute bottom-4 right-8 text-[10px] text-[#a09ab8] font-serif">
          {(book?.manuscript || "").split(/\s+/).filter(Boolean).length} palabras
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#e8e5f0] flex justify-between items-center">
              <h3 className="text-lg font-serif text-[#1a1825]">Reescritura: {modal.mode}</h3>
              <button onClick={() => setModal(null)} className="text-[#a09ab8] hover:text-[#1a1825] transition-colors"><X size={24} /></button>
            </div>
            <div className="p-8 overflow-y-auto flex-1 space-y-6">
              <div className="p-4 bg-[#f8f7f5] rounded-xl text-sm text-[#6b6580] font-serif italic border-l-4 border-[#e8e5f0]">
                «{selText}»
              </div>
              
              {busy ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 size={32} className="animate-spin text-[#7c3aed]" />
                  <p className="text-sm text-[#6b6580] font-serif">Generando con IA...</p>
                </div>
              ) : (
                <div className="p-6 bg-[#f5f3ff] border border-[#7c3aed]/20 rounded-2xl text-[#1a1825] text-lg font-serif leading-relaxed">
                  {modal.results}
                </div>
              )}
            </div>
            {!busy && (
              <div className="p-6 border-t border-[#e8e5f0] flex gap-3">
                <button 
                  onClick={() => insertResult(modal.results)} 
                  className="flex-1 py-3 bg-[#7c3aed] text-white rounded-xl font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                  <Check size={18} /> Reemplazar texto
                </button>
                <button 
                  onClick={() => setModal(null)} 
                  className="px-6 py-3 border border-[#e8e5f0] text-[#6b6580] rounded-xl font-serif text-sm hover:bg-[#f8f7f5] transition-all"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
