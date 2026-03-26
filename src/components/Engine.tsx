import React, { useState } from 'react';
import { Book } from '../types';
import { callAI } from '../lib/gemini';
import { Zap, RotateCcw, ArrowRight, Loader2 } from 'lucide-react';

interface EngineProps {
  book: Book | null;
  onUpdate: (updates: Partial<Book>) => void;
}

const STEPS = ["Idea", "Sinopsis", "Esquema", "Beats", "Prosa"];

export default function Engine({ book, onUpdate }: EngineProps) {
  const [busy, setBusy] = useState(false);
  const step = book?.step || 0;

  const buildCtx = () => {
    let ctx = "";
    if (book?.characters?.length) {
      ctx += "PERSONAJES:\n";
      book.characters.forEach(c => {
        ctx += `• ${c.name}(${c.role}):${c.appearance}|Miedo:${c.fears}|Arco:${c.arcStart}→${c.arcEnd}\n`;
      });
      ctx += "\n";
    }
    if (book?.world?.tone) ctx += "TONO:" + book.world.tone + "\n";
    if (book?.structure?.theme) ctx += "TEMA:" + book.structure.theme + "\n";
    return ctx;
  };

  const generate = async () => {
    if (!book) return;
    setBusy(true);
    const ctx = buildCtx();
    try {
      if (step === 0) {
        const r = await callAI([{ role: "user", content: "Sinopsis apasionante de 4 párrafos:\n\n" + book.idea }], "Maestro novelista en español." + ctx, 800);
        onUpdate({ synopsis: r, step: 1 });
      } else if (step === 1) {
        const r = await callAI([{ role: "user", content: "Esquema 12 capítulos:\n\n" + book.synopsis }], "Experto en estructura." + ctx, 1000);
        onUpdate({ outline: r, step: 2 });
      } else if (step === 2) {
        const r = await callAI([{ role: "user", content: "Story beats primeros 3 capítulos:\n\n" + book.outline }], "Experto en estructura narrativa." + ctx, 1000);
        onUpdate({ beats: r, step: 3 });
      } else if (step === 3) {
        const r = await callAI([{ role: "user", content: "Primer capítulo completo, mínimo 800 palabras. Beats:\n\n" + book.beats }], "Novelista talentoso." + ctx, 1500);
        onUpdate({ prose: r, step: 4 });
      }
    } catch (e) {
      console.error(e);
    }
    setBusy(false);
  };

  const reset = () => {
    if (confirm("¿Reiniciar el motor? Se perderá el progreso actual del Story Engine.")) {
      onUpdate({ step: 0, synopsis: "", outline: "", beats: "", prose: "" });
    }
  };

  const btnLabel = ["Generar Sinopsis", "Generar Esquema", "Generar Beats", "Generar Prosa"][step] || "";

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-serif text-[#1a1825] font-normal flex items-center gap-3">
          <Zap className="text-[#7c3aed]" /> Story Engine
        </h2>
        <p className="text-sm text-[#6b6580] font-serif mt-2">De una chispa a miles de palabras.</p>
      </header>

      {/* Progress */}
      <div className="flex justify-between relative px-4">
        {STEPS.map((s, i) => (
          <div key={i} className="flex flex-col items-center relative z-10 flex-1">
            {i > 0 && (
              <div className={`absolute left-[-50%] right-[50%] top-3.5 h-0.5 z-0 ${i <= step ? 'bg-[#7c3aed]' : 'bg-[#e8e5f0]'}`} />
            )}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-serif border-2 transition-all ${i < step ? 'bg-[#7c3aed] border-[#7c3aed] text-white' : i === step ? 'bg-white border-[#7c3aed] text-[#7c3aed] shadow-[0_0_0_4px_#ede9fe]' : 'bg-[#f8f7f5] border-[#e8e5f0] text-[#a09ab8]'}`}>
              {i < step ? "✓" : i + 1}
            </div>
            <div className={`mt-2 text-[10px] font-serif uppercase tracking-wider ${i <= step ? 'text-[#7c3aed] font-bold' : 'text-[#a09ab8]'}`}>{s}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {/* Idea */}
        <div className="bg-white border border-[#e8e5f0] rounded-2xl p-6 shadow-sm">
          <label className="block text-[10px] font-bold text-[#6b6580] uppercase tracking-widest mb-3 font-serif">Tu Idea</label>
          <textarea 
            value={book?.idea || ""} 
            onChange={e => onUpdate({ idea: e.target.value })} 
            placeholder="Una maga que perdió sus poderes..."
            className="w-full min-h-[100px] bg-transparent border-none text-[#1a1825] text-base font-serif leading-relaxed outline-none resize-none"
          />
        </div>

        {/* Synopsis */}
        {step >= 1 && (
          <div className="bg-white border border-[#e8e5f0] rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <label className="block text-[10px] font-bold text-[#6b6580] uppercase tracking-widest mb-3 font-serif">Sinopsis</label>
            <textarea 
              value={book?.synopsis || ""} 
              onChange={e => onUpdate({ synopsis: e.target.value })} 
              className="w-full min-h-[150px] bg-transparent border-none text-[#1a1825] text-sm font-serif leading-relaxed outline-none resize-y"
            />
          </div>
        )}

        {/* Outline */}
        {step >= 2 && (
          <div className="bg-white border border-[#e8e5f0] rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <label className="block text-[10px] font-bold text-[#6b6580] uppercase tracking-widest mb-3 font-serif">Esquema de Capítulos</label>
            <textarea 
              value={book?.outline || ""} 
              onChange={e => onUpdate({ outline: e.target.value })} 
              className="w-full min-h-[200px] bg-transparent border-none text-[#1a1825] text-sm font-serif leading-relaxed outline-none resize-y"
            />
          </div>
        )}

        {/* Beats */}
        {step >= 3 && (
          <div className="bg-white border border-[#e8e5f0] rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <label className="block text-[10px] font-bold text-[#6b6580] uppercase tracking-widest mb-3 font-serif">Story Beats</label>
            <textarea 
              value={book?.beats || ""} 
              onChange={e => onUpdate({ beats: e.target.value })} 
              className="w-full min-h-[180px] bg-transparent border-none text-[#1a1825] text-sm font-serif leading-relaxed outline-none resize-y"
            />
          </div>
        )}

        {/* Prose */}
        {step >= 4 && (
          <div className="bg-white border border-[#e8e5f0] rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <label className="block text-[10px] font-bold text-[#6b6580] uppercase tracking-widest mb-3 font-serif">Prosa Generada</label>
            <textarea 
              value={book?.prose || ""} 
              onChange={e => onUpdate({ prose: e.target.value })} 
              className="w-full min-h-[320px] bg-transparent border-none text-[#1a1825] text-lg font-serif leading-relaxed outline-none resize-y"
            />
            <div className="mt-4 pt-4 border-t border-[#f0eef8]">
              <button 
                onClick={() => {
                  const m = (book?.manuscript || "") + (book?.manuscript ? "\n\n" : "") + (book?.prose || "");
                  onUpdate({ manuscript: m });
                  alert("Prosa enviada al manuscrito.");
                }}
                className="text-xs font-serif text-[#7c3aed] font-semibold flex items-center gap-2 hover:underline"
              >
                Enviar al Manuscrito <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {step < 4 && (
        <div className="flex flex-wrap gap-4 items-center pt-4">
          <button 
            onClick={generate} 
            disabled={busy || !book?.idea?.trim()} 
            className={`flex items-center gap-2 py-3 px-8 rounded-full font-serif font-bold text-sm transition-all ${busy || !book?.idea?.trim() ? 'bg-[#e5e0f5] text-[#a09ab8] cursor-not-allowed' : 'bg-[#7c3aed] text-white shadow-lg hover:shadow-xl active:scale-95'}`}
          >
            {busy ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
            {busy ? "Generando..." : btnLabel}
          </button>
          
          {step > 0 && (
            <button 
              onClick={reset} 
              className="flex items-center gap-2 py-3 px-6 rounded-full border border-[#e8e5f0] bg-white text-[#6b6580] font-serif text-sm hover:bg-[#f8f7f5] transition-all"
            >
              <RotateCcw size={16} /> Reiniciar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
