import React, { useState } from 'react';
import { Book, WorldData } from '../types';
import { Globe, Sparkles, Loader2 } from 'lucide-react';
import { callAI } from '../lib/ai';

interface WorldProps {
  book: Book | null;
  onUpdate: (updates: Partial<Book>) => void;
  aiSettings?: any;
}

export default function World({ book, onUpdate, aiSettings }: WorldProps) {
  const [busy, setBusy] = useState(false);
  const [aiField, setAiField] = useState<string | null>(null);

  const worldData = book?.world || {};

  const saveWorld = (updates: Partial<WorldData>) => {
    onUpdate({ world: { ...worldData, ...updates } });
  };

  const aiGen = async (field: string, label: string) => {
    setBusy(true);
    setAiField(field);
    try {
      const r = await callAI([{ role: "user", content: `Expande la sección de "${label}" para una historia con esta idea: ${book?.idea}` }], "Worldbuilder experto.", 600, aiSettings);
      saveWorld({ [field]: r });
    } catch (e) {
      console.error(e);
    }
    setBusy(false);
    setAiField(null);
  };

  const fields = [
    { k: "genre", l: "Género y Ambientación", ph: "Fantasía oscura, distopía urbana..." },
    { k: "magicRules", l: "Reglas de Magia / Tecnología", ph: "La magia consume la energía vital..." },
    { k: "geography", l: "Geografía y Espacios", ph: "Tres reinos divididos por un mar de cristal..." },
    { k: "society", l: "Sociedad y Política", ph: "Una jerarquía basada en el color de los ojos..." },
  ];

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-serif text-[#1a1825] font-normal flex items-center gap-3">
          <Globe className="text-[#7c3aed]" /> Construcción del Mundo
        </h2>
        <p className="text-sm text-[#6b6580] font-serif mt-2">Las reglas y atmósfera de tu universo.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map(f => (
          <div key={f.k} className="bg-white border border-[#e8e5f0] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">{f.l}</label>
              <button 
                onClick={() => aiGen(f.k, f.l)}
                disabled={busy}
                className="text-[10px] text-[#7c3aed] font-bold uppercase flex items-center gap-1 hover:underline"
              >
                {busy && aiField === f.k ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Expandir
              </button>
            </div>
            <textarea 
              value={(worldData as any)[f.k] || ""} 
              onChange={e => saveWorld({ [f.k]: e.target.value })} 
              placeholder={f.ph}
              className="w-full min-h-[120px] bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-4 text-[#1a1825] text-sm font-serif leading-relaxed outline-none focus:border-[#7c3aed] transition-colors resize-none"
            />
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#e8e5f0] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">Atmósfera y Tono</label>
          <button 
            onClick={() => aiGen("tone", "Atmósfera y Tono")}
            disabled={busy}
            className="text-[10px] text-[#7c3aed] font-bold uppercase flex items-center gap-1 hover:underline"
          >
            {busy && aiField === 'tone' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Definir Tono
          </button>
        </div>
        <textarea 
          value={worldData.tone || ""} 
          onChange={e => saveWorld({ tone: e.target.value })} 
          placeholder="Oscura, melancólica, esperanzadora..."
          className="w-full min-h-[100px] bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-4 text-[#1a1825] text-sm font-serif leading-relaxed outline-none focus:border-[#7c3aed] transition-colors resize-none"
        />
      </div>
    </div>
  );
}
