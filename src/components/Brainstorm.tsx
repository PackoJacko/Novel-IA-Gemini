import React, { useState } from 'react';
import { Book } from '../types';
import { Sparkles, Star, X, Loader2 } from 'lucide-react';
import { callAI } from '../lib/ai';

interface BrainstormProps {
  book: Book | null;
  onUpdate: (updates: Partial<Book>) => void;
}

const CATEGORIES = ["nombres", "giros", "objetos mágicos", "locaciones", "facciones", "conflictos", "poderes", "profecías"];

export default function Brainstorm({ book, onUpdate }: BrainstormProps) {
  const [cat, setCat] = useState(CATEGORIES[0]);
  const [ctx, setCtx] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const favs = book?.bsfavs || [];

  const run = async () => {
    setBusy(true);
    try {
      const r = await callAI([{ role: "user", content: `Genera 10 ideas creativas para: ${cat}${ctx ? `\nContexto adicional: ${ctx}` : ""}\nUna idea por línea, sin numeración.` }], "Generador creativo de ideas.", 600, book?.aiSettings);
      setResults(r.split("\n").map(l => l.trim()).filter(Boolean).slice(0, 10));
    } catch (e) {
      console.error(e);
    }
    setBusy(false);
  };

  const toggleFav = (idea: string) => {
    const newFavs = favs.includes(idea) ? favs.filter(x => x !== idea) : [...favs, idea];
    onUpdate({ bsfavs: newFavs });
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-serif text-[#1a1825] font-normal flex items-center gap-3">
          <Sparkles className="text-[#7c3aed]" /> Brainstorm
        </h2>
        <p className="text-sm text-[#6b6580] font-serif mt-2">Genera ideas infinitas. Guarda las mejores ⭐</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button 
            key={c} 
            onClick={() => setCat(c)}
            className={`px-4 py-2 rounded-full border text-xs font-serif font-semibold transition-all ${cat === c ? 'bg-[#7c3aed] border-[#7c3aed] text-white shadow-md' : 'bg-white border-[#e8e5f0] text-[#6b6580] hover:border-[#7c3aed]/30'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#e8e5f0] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">Contexto (opcional)</label>
          <textarea 
            value={ctx} 
            onChange={e => setCtx(e.target.value)} 
            placeholder="fantasía oscura, steampunk, ambientación invernal..."
            className="w-full min-h-[80px] bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-4 text-[#1a1825] text-sm font-serif leading-relaxed outline-none focus:border-[#7c3aed] transition-colors resize-none"
          />
        </div>
        <button 
          onClick={run} 
          disabled={busy}
          className={`flex items-center gap-2 py-3 px-8 rounded-full font-serif font-bold text-sm transition-all ${busy ? 'bg-[#e5e0f5] text-[#a09ab8] cursor-not-allowed' : 'bg-[#7c3aed] text-white shadow-lg hover:shadow-xl active:scale-95'}`}
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {busy ? "Generando..." : `Generar 10 ${cat}`}
        </button>
      </div>

      {results.length > 0 && (
        <div className="bg-white border border-[#e8e5f0] rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          {results.map((r, i) => (
            <div key={i} className="p-4 px-6 border-b border-[#f0eef8] last:border-none flex justify-between items-center gap-4 group hover:bg-[#f8f7f5] transition-colors">
              <span className="text-sm text-[#1a1825] font-serif leading-relaxed">{r}</span>
              <button 
                onClick={() => toggleFav(r)}
                className={`transition-all ${favs.includes(r) ? 'text-yellow-500 scale-110' : 'text-[#a09ab8] opacity-20 group-hover:opacity-100 hover:text-yellow-500'}`}
              >
                <Star size={20} fill={favs.includes(r) ? "currentColor" : "none"} />
              </button>
            </div>
          ))}
        </div>
      )}

      {favs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-[#a09ab8] uppercase tracking-[0.2em] font-serif border-b border-[#e8e5f0] pb-2">⭐ Favoritos</h3>
          <div className="bg-white border border-[#e8e5f0] rounded-2xl overflow-hidden shadow-sm">
            {favs.map((r, i) => (
              <div key={i} className="p-4 px-6 border-b border-[#f0eef8] last:border-none flex justify-between items-center gap-4 hover:bg-[#f8f7f5] transition-colors">
                <span className="text-sm text-[#6b6580] font-serif">{r}</span>
                <button onClick={() => toggleFav(r)} className="text-[#a09ab8] hover:text-red-500 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
