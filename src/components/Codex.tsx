import React, { useState } from 'react';
import { Book, CodexEntry } from '../types';
import { Square, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

interface CodexProps {
  book: Book | null;
  onUpdate: (updates: Partial<Book>) => void;
}

const TYPES = [
  { id: "personaje", label: "Personaje" },
  { id: "lugar", label: "Lugar" },
  { id: "objeto", label: "Objeto" },
  { id: "mitología", label: "Mitología" },
  { id: "otro", label: "Otro" },
];

export default function Codex({ book, onUpdate }: CodexProps) {
  const [form, setForm] = useState<Partial<CodexEntry> | null>(null);
  const codex = book?.codex || [];

  const saveEntry = () => {
    if (!form?.name || !form?.type) return;
    const newCodex = form.id 
      ? codex.map(e => e.id === form.id ? form as CodexEntry : e)
      : [...codex, { ...form, id: Date.now().toString() } as CodexEntry];
    onUpdate({ codex: newCodex });
    setForm(null);
  };

  const deleteEntry = (id: string) => {
    if (confirm("¿Borrar entrada del Codex?")) {
      onUpdate({ codex: codex.filter(e => e.id !== id) });
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-serif text-[#1a1825] font-normal flex items-center gap-3">
            <Square className="text-[#7c3aed]" /> El Codex
          </h2>
          <p className="text-sm text-[#6b6580] font-serif mt-2">La IA lo consulta para mantener la coherencia de tu mundo.</p>
        </div>
        <button 
          onClick={() => setForm({ name: "", type: "personaje", desc: "" })}
          className="flex items-center gap-2 py-2.5 px-5 bg-[#7c3aed] text-white rounded-full font-serif font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all"
        >
          <Plus size={18} /> Entrada
        </button>
      </header>

      {codex.length === 0 ? (
        <div className="bg-white border border-[#e8e5f0] rounded-2xl p-12 text-center text-[#a09ab8] font-serif">
          El Codex está vacío. Añade detalles sobre tu mundo.
        </div>
      ) : (
        <div className="space-y-8">
          {TYPES.map(type => {
            const entries = codex.filter(e => e.type === type.id);
            if (entries.length === 0) return null;
            return (
              <div key={type.id} className="space-y-4">
                <h3 className="text-[10px] font-bold text-[#a09ab8] uppercase tracking-[0.2em] font-serif border-b border-[#e8e5f0] pb-2">{type.label}s</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entries.map(e => (
                    <div key={e.id} className="bg-white border border-[#e8e5f0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-base font-serif text-[#1a1825] font-semibold">{e.name}</h4>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setForm(e)} className="p-1.5 text-[#a09ab8] hover:text-[#7c3aed] transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => deleteEntry(e.id)} className="p-1.5 text-[#a09ab8] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <p className="text-sm text-[#6b6580] font-serif leading-relaxed line-clamp-3">{e.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#e8e5f0] flex justify-between items-center">
              <h3 className="text-xl font-serif text-[#1a1825]">{form.id ? "Editar Entrada" : "Nueva Entrada"}</h3>
              <button onClick={() => setForm(null)} className="text-[#a09ab8] hover:text-[#1a1825] transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">Nombre *</label>
                <input 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-3 text-[#1a1825] font-serif outline-none focus:border-[#7c3aed] transition-colors"
                  placeholder="El Arma Prohibida..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">Tipo</label>
                <select 
                  value={form.type} 
                  onChange={e => setForm({ ...form, type: e.target.value as any })}
                  className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-3 text-[#1a1825] font-serif outline-none focus:border-[#7c3aed] transition-colors appearance-none"
                >
                  {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">Descripción</label>
                <textarea 
                  value={form.desc} 
                  onChange={e => setForm({ ...form, desc: e.target.value })} 
                  className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-4 text-[#1a1825] text-sm font-serif leading-relaxed outline-none focus:border-[#7c3aed] transition-colors min-h-[150px] resize-none"
                  placeholder="Describe detalladamente este elemento..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-[#e8e5f0] flex gap-3">
              <button 
                onClick={saveEntry} 
                disabled={!form.name?.trim()}
                className={`flex-1 py-3 rounded-xl font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${!form.name?.trim() ? 'bg-[#e5e0f5] text-[#a09ab8] cursor-not-allowed' : 'bg-[#7c3aed] text-white hover:shadow-xl active:scale-95'}`}
              >
                <Check size={18} /> Guardar
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
