import React, { useState } from 'react';
import { Book, Structure } from '../types';
import { Diamond, Sparkles, Loader2 } from 'lucide-react';
import { callAI } from '../lib/ai';

interface StructureProps {
  book: Book | null;
  onUpdate: (updates: Partial<Book>) => void;
  aiSettings?: any;
}

export default function StructureComp({ book, onUpdate, aiSettings }: StructureProps) {
  const [busy, setBusy] = useState(false);
  const [aiField, setAiField] = useState<string | null>(null);

  const structure = book?.structure || {};

  const saveStr = (updates: Partial<Structure>) => {
    onUpdate({ structure: { ...structure, ...updates } });
  };

  const aiGen = async (field: string, label: string) => {
    setBusy(true);
    setAiField(field);
    try {
      const r = await callAI([{ role: "user", content: `Genera opciones para "${label}" en una historia con esta idea: ${book?.idea}` }], "Experto en estructura narrativa.", 600, aiSettings);
      saveStr({ [field]: r });
    } catch (e) {
      console.error(e);
    }
    setBusy(false);
    setAiField(null);
  };

  const fields = [
    { k: "incitingIncident", t: "Incidente Incitador", ph: "El evento que pone todo en marcha..." },
    { k: "midpointTwist", t: "Punto de Giro Central", ph: "El cambio radical a mitad de la historia..." },
    { k: "darkNight", t: "Noche Oscura del Alma", ph: "El momento de mayor desesperación..." },
    { k: "climax", t: "Clímax", ph: "El enfrentamiento final..." },
  ];

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-serif text-[#1a1825] font-normal flex items-center gap-3">
          <Diamond className="text-[#7c3aed]" /> Estructura Narrativa
        </h2>
        <p className="text-sm text-[#6b6580] font-serif mt-2">Los pilares que sostienen tu historia.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map(f => (
          <div key={f.k} className="bg-white border border-[#e8e5f0] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">{f.t}</label>
              <button 
                onClick={() => aiGen(f.k, f.t)}
                disabled={busy}
                className="text-[10px] text-[#7c3aed] font-bold uppercase flex items-center gap-1 hover:underline"
              >
                {busy && aiField === f.k ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Generar
              </button>
            </div>
            <textarea 
              value={(structure as any)[f.k] || ""} 
              onChange={e => saveStr({ [f.k]: e.target.value })} 
              placeholder={f.ph}
              className="w-full min-h-[100px] bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-4 text-[#1a1825] text-sm font-serif leading-relaxed outline-none focus:border-[#7c3aed] transition-colors resize-none"
            />
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#e8e5f0] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">Plot Twists</label>
          <button 
            onClick={() => aiGen("plotTwists", "Plot Twists")}
            disabled={busy}
            className="text-[10px] text-[#7c3aed] font-bold uppercase flex items-center gap-1 hover:underline"
          >
            {busy && aiField === 'plotTwists' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Generar 5 Giros
          </button>
        </div>
        <textarea 
          value={structure.plotTwists || ""} 
          onChange={e => saveStr({ plotTwists: e.target.value })} 
          placeholder="Lista todos los giros dramáticos..."
          className="w-full min-h-[120px] bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-4 text-[#1a1825] text-sm font-serif leading-relaxed outline-none focus:border-[#7c3aed] transition-colors resize-none"
        />
      </div>
    </div>
  );
}
