import React, { useState } from 'react';
import { Book, Escaleta } from '../types';
import { AlignLeft, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

interface EscaletaProps {
  book: Book | null;
  onUpdate: (updates: Partial<Book>) => void;
}

export default function EscaletaComp({ book, onUpdate }: EscaletaProps) {
  const [form, setForm] = useState<Partial<Escaleta> | null>(null);
  const escaleta = book?.escaleta || [];

  const saveEsc = () => {
    if (!form?.title) return;
    const newEsc = form.id 
      ? escaleta.map(e => e.id === form.id ? form as Escaleta : e)
      : [...escaleta, { ...form, id: Date.now().toString() } as Escaleta];
    onUpdate({ escaleta: newEsc });
    setForm(null);
  };

  const deleteEsc = (id: string) => {
    if (confirm("¿Borrar escena?")) {
      onUpdate({ escaleta: escaleta.filter(e => e.id !== id) });
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-serif text-[#1a1825] font-normal flex items-center gap-3">
            <AlignLeft className="text-[#7c3aed]" /> La Escaleta
          </h2>
          <p className="text-sm text-[#6b6580] font-serif mt-2">Define cada escena antes de escribirla.</p>
        </div>
        <button 
          onClick={() => setForm({ title: "" })}
          className="flex items-center gap-2 py-2.5 px-5 bg-[#7c3aed] text-white rounded-full font-serif font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all"
        >
          <Plus size={18} /> Escena
        </button>
      </header>

      {escaleta.length === 0 ? (
        <div className="bg-white border border-[#e8e5f0] rounded-2xl p-12 text-center text-[#a09ab8] font-serif">
          Sin escenas todavía. Empieza a planificar tu trama.
        </div>
      ) : (
        <div className="space-y-4">
          {escaleta.map((e, i) => (
            <div key={e.id} className="bg-white border border-[#e8e5f0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-[#f5f3ff] text-[#7c3aed] text-xs font-bold flex items-center justify-center shrink-0 font-serif border border-[#7c3aed]/10">
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-serif text-[#1a1825] font-semibold">{e.title}</h3>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setForm(e)} className="p-2 text-[#a09ab8] hover:text-[#7c3aed] transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => deleteEsc(e.id)} className="p-2 text-[#a09ab8] hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              
              {e.summary && <p className="text-sm text-[#6b6580] font-serif leading-relaxed mb-4">{e.summary}</p>}
              
              <div className="flex flex-wrap gap-4">
                {e.goal && <div className="text-[11px] font-serif"><span className="text-green-600 font-bold uppercase tracking-tighter mr-1">🎯 Objetivo ·</span> <span className="text-[#6b6580]">{e.goal}</span></div>}
                {e.conflict && <div className="text-[11px] font-serif"><span className="text-red-500 font-bold uppercase tracking-tighter mr-1">⚔ Conflicto ·</span> <span className="text-[#6b6580]">{e.conflict}</span></div>}
                {e.hook && <div className="text-[11px] font-serif"><span className="text-[#7c3aed] font-bold uppercase tracking-tighter mr-1">🎣 Gancho ·</span> <span className="text-[#6b6580]">{e.hook}</span></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#e8e5f0] flex justify-between items-center">
              <h3 className="text-xl font-serif text-[#1a1825]">{form.id ? "Editar Escena" : "Nueva Escena"}</h3>
              <button onClick={() => setForm(null)} className="text-[#a09ab8] hover:text-[#1a1825] transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">Título *</label>
                <input 
                  value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })} 
                  className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-3 text-[#1a1825] font-serif outline-none focus:border-[#7c3aed] transition-colors"
                  placeholder="La revelación en el castillo..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">¿Qué ocurre?</label>
                <textarea 
                  value={form.summary} 
                  onChange={e => setForm({ ...form, summary: e.target.value })} 
                  className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-4 text-[#1a1825] text-sm font-serif leading-relaxed outline-none focus:border-[#7c3aed] transition-colors min-h-[100px] resize-none"
                  placeholder="Lyra descubre que el mapa era una trampa..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">🎯 Objetivo</label>
                  <input 
                    value={form.goal} 
                    onChange={e => setForm({ ...form, goal: e.target.value })} 
                    className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-3 text-[#1a1825] text-xs font-serif outline-none focus:border-[#7c3aed]"
                    placeholder="Conseguir la llave..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">⚔ Conflicto</label>
                  <input 
                    value={form.conflict} 
                    onChange={e => setForm({ ...form, conflict: e.target.value })} 
                    className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-3 text-[#1a1825] text-xs font-serif outline-none focus:border-[#7c3aed]"
                    placeholder="El guardia sospecha..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">🎣 Gancho</label>
                  <input 
                    value={form.hook} 
                    onChange={e => setForm({ ...form, hook: e.target.value })} 
                    className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-3 text-[#1a1825] text-xs font-serif outline-none focus:border-[#7c3aed]"
                    placeholder="Encuentra una carta..."
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#e8e5f0] flex gap-3">
              <button 
                onClick={saveEsc} 
                disabled={!form.title?.trim()}
                className={`flex-1 py-3 rounded-xl font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${!form.title?.trim() ? 'bg-[#e5e0f5] text-[#a09ab8] cursor-not-allowed' : 'bg-[#7c3aed] text-white hover:shadow-xl active:scale-95'}`}
              >
                <Check size={18} /> Guardar Escena
              </button>
              <button 
                onClick={() => setForm(null)} 
                className="px-6 py-3 border border-[#e8e5f0] text-[#6b6580] rounded-xl font-serif text-sm hover:bg-[#f8f7f5] transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
