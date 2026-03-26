import React, { useState } from 'react';
import { Book, LorebookEntry } from '../types';
import { Command, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

interface LorebookProps {
  book: Book | null;
  onUpdate: (updates: Partial<Book>) => void;
}

export default function Lorebook({ book, onUpdate }: LorebookProps) {
  const [form, setForm] = useState<Partial<LorebookEntry> & { kws?: string } | null>(null);
  const lorebook = book?.lorebook || [];

  const saveEntry = () => {
    if (!form?.kws || !form?.content) return;
    const keywords = form.kws.split(",").map(k => k.trim()).filter(Boolean);
    const entry: LorebookEntry = {
      id: form.id || Date.now().toString(),
      keywords,
      content: form.content
    };
    
    const newLorebook = form.id 
      ? lorebook.map(e => e.id === form.id ? entry : e)
      : [...lorebook, entry];
    onUpdate({ lorebook: newLorebook });
    setForm(null);
  };

  const deleteEntry = (id: string) => {
    if (confirm("¿Borrar entrada del Lorebook?")) {
      onUpdate({ lorebook: lorebook.filter(e => e.id !== id) });
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-serif text-[#1a1825] font-normal flex items-center gap-3">
            <Command className="text-[#7c3aed]" /> Lorebook
          </h2>
          <p className="text-sm text-[#6b6580] font-serif mt-2">La IA activa estas entradas cuando detecta las palabras clave en tu texto.</p>
        </div>
        <button 
          onClick={() => setForm({ kws: "", content: "" })}
          className="flex items-center gap-2 py-2.5 px-5 bg-[#7c3aed] text-white rounded-full font-serif font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all"
        >
          <Plus size={18} /> Entrada
        </button>
      </header>

      {lorebook.length === 0 ? (
        <div className="bg-white border border-[#e8e5f0] rounded-2xl p-12 text-center text-[#a09ab8] font-serif">
          El Lorebook está vacío. Añade claves para que la IA las recuerde.
        </div>
      ) : (
        <div className="space-y-4">
          {lorebook.map(e => (
            <div key={e.id} className="bg-white border border-[#e8e5f0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-wrap gap-2">
                  {e.keywords.map(kw => (
                    <span key={kw} className="px-2.5 py-1 rounded-lg bg-[#f5f3ff] text-[#7c3aed] text-[10px] font-bold uppercase tracking-wider font-serif border border-[#7c3aed]/10">
                      {kw}
                    </span>
                  ))}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setForm({ ...e, kws: e.keywords.join(", ") })} className="p-1.5 text-[#a09ab8] hover:text-[#7c3aed] transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => deleteEntry(e.id)} className="p-1.5 text-[#a09ab8] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="text-sm text-[#6b6580] font-serif leading-relaxed">{e.content}</p>
            </div>
          ))}
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
                <label className="block text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">Palabras clave (separadas por coma) *</label>
                <input 
                  value={form.kws} 
                  onChange={e => setForm({ ...form, kws: e.target.value })} 
                  className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-3 text-[#1a1825] font-serif outline-none focus:border-[#7c3aed] transition-colors"
                  placeholder="Reino, Aldara, la Reina..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">Información contextual *</label>
                <textarea 
                  value={form.content} 
                  onChange={e => setForm({ ...form, content: e.target.value })} 
                  className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-4 text-[#1a1825] text-sm font-serif leading-relaxed outline-none focus:border-[#7c3aed] transition-colors min-h-[150px] resize-none"
                  placeholder="Todo lo que la IA debe saber cuando estas palabras aparezcan..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-[#e8e5f0] flex gap-3">
              <button 
                onClick={saveEntry} 
                disabled={!form.kws?.trim() || !form.content?.trim()}
                className={`flex-1 py-3 rounded-xl font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${!form.kws?.trim() || !form.content?.trim() ? 'bg-[#e5e0f5] text-[#a09ab8] cursor-not-allowed' : 'bg-[#7c3aed] text-white hover:shadow-xl active:scale-95'}`}
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
