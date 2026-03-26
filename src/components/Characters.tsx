import React, { useState } from 'react';
import { Book, Character } from '../types';
import { User, Plus, Trash2, Edit2, X, Check, Sparkles, Loader2 } from 'lucide-react';
import { callAI } from '../lib/gemini';

interface CharactersProps {
  book: Book | null;
  onUpdate: (updates: Partial<Book>) => void;
}

const ROLES = [
  { id: "protagonist", label: "Protagonista", color: "#10b981" },
  { id: "antagonist", label: "Antagonista", color: "#ef4444" },
  { id: "secondary", label: "Secundario", color: "#3b82f6" },
  { id: "mentor", label: "Mentor", color: "#f59e0b" },
  { id: "other", label: "Otro", color: "#a09ab8" },
];

export default function Characters({ book, onUpdate }: CharactersProps) {
  const [form, setForm] = useState<Partial<Character> | null>(null);
  const [busy, setBusy] = useState(false);
  const [aiField, setAiField] = useState<string | null>(null);

  const characters = book?.characters || [];

  const saveChar = () => {
    if (!form?.name) return;
    const newChar = form.id 
      ? characters.map(c => c.id === form.id ? form as Character : c)
      : [...characters, { ...form, id: Date.now().toString() } as Character];
    onUpdate({ characters: newChar });
    setForm(null);
  };

  const deleteChar = (id: string) => {
    if (confirm("¿Borrar personaje?")) {
      onUpdate({ characters: characters.filter(c => c.id !== id) });
    }
  };

  const aiGen = async (field: string, prompt: string) => {
    setBusy(true);
    setAiField(field);
    try {
      const r = await callAI([{ role: "user", content: prompt }], "Psicólogo narrativo.", 500);
      setForm(prev => ({ ...prev, [field]: r }));
    } catch (e) {
      console.error(e);
    }
    setBusy(false);
    setAiField(null);
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-serif text-[#1a1825] font-normal flex items-center gap-3">
            <UserIcon className="text-[#7c3aed]" /> El Elenco
          </h2>
          <p className="text-sm text-[#6b6580] font-serif mt-2">Conoce a fondo a tus personajes.</p>
        </div>
        <button 
          onClick={() => setForm({ name: "", role: "protagonist" })}
          className="flex items-center gap-2 py-2.5 px-5 bg-[#7c3aed] text-white rounded-full font-serif font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all"
        >
          <Plus size={18} /> Personaje
        </button>
      </header>

      {characters.length === 0 ? (
        <div className="bg-white border border-[#e8e5f0] rounded-2xl p-12 text-center text-[#a09ab8] font-serif">
          El elenco está vacío. Crea tu primer personaje.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {characters.map(ch => (
            <div key={ch.id} className="bg-white border border-[#e8e5f0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-serif text-[#1a1825] font-semibold mb-1">{ch.name}</h3>
                  <span 
                    className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-serif"
                    style={{ 
                      backgroundColor: ROLES.find(r => r.id === ch.role)?.color + '15',
                      color: ROLES.find(r => r.id === ch.role)?.color,
                      border: `1px solid ${ROLES.find(r => r.id === ch.role)?.color}30`
                    }}
                  >
                    {ROLES.find(r => r.id === ch.role)?.label}
                  </span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setForm(ch)} className="p-2 text-[#a09ab8] hover:text-[#7c3aed] transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => deleteChar(ch.id)} className="p-2 text-[#a09ab8] hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              
              {ch.appearance && <p className="text-sm text-[#6b6580] font-serif leading-relaxed mb-4 line-clamp-2">{ch.appearance}</p>}
              
              <div className="space-y-2">
                {ch.fears && <div className="text-[11px] font-serif"><span className="text-red-500 font-bold uppercase tracking-tighter mr-1">Miedo ·</span> <span className="text-[#6b6580]">{ch.fears}</span></div>}
                {ch.secret && <div className="text-[11px] font-serif"><span className="text-[#8b5cf6] font-bold uppercase tracking-tighter mr-1">Secreto ·</span> <span className="text-[#6b6580]">{ch.secret}</span></div>}
              </div>

              {(ch.arcStart || ch.arcEnd) && (
                <div className="mt-4 p-3 bg-[#f5f3ff] rounded-xl border border-[#7c3aed]/10">
                  <div className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-widest mb-1 font-serif">Arco de Transformación</div>
                  <div className="text-[11px] font-serif text-[#6b6580]">
                    {ch.arcStart} <span className="text-[#7c3aed] mx-1">→</span> {ch.arcEnd}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#e8e5f0] flex justify-between items-center">
              <h3 className="text-xl font-serif text-[#1a1825]">{form.id ? "Editar Personaje" : "Nuevo Personaje"}</h3>
              <button onClick={() => setForm(null)} className="text-[#a09ab8] hover:text-[#1a1825] transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">Nombre *</label>
                  <input 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-3 text-[#1a1825] font-serif outline-none focus:border-[#7c3aed] transition-colors"
                    placeholder="Lyra..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">Rol</label>
                  <select 
                    value={form.role} 
                    onChange={e => setForm({ ...form, role: e.target.value as any })}
                    className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-3 text-[#1a1825] font-serif outline-none focus:border-[#7c3aed] transition-colors appearance-none"
                  >
                    {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">Apariencia</label>
                <textarea 
                  value={form.appearance} 
                  onChange={e => setForm({ ...form, appearance: e.target.value })} 
                  className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-4 text-[#1a1825] font-serif outline-none focus:border-[#7c3aed] transition-colors min-h-[80px] resize-none"
                  placeholder="28 años. Ojos verdes..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">😨 Miedo</span>
                    <button 
                      onClick={() => aiGen("fears", `3 miedos para un personaje llamado ${form.name} en una historia de: ${book?.idea}`)}
                      disabled={busy}
                      className="text-[10px] text-[#7c3aed] font-bold uppercase flex items-center gap-1 hover:underline"
                    >
                      {busy && aiField === 'fears' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Sugerir
                    </button>
                  </label>
                  <textarea 
                    value={form.fears} 
                    onChange={e => setForm({ ...form, fears: e.target.value })} 
                    className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-3 text-[#1a1825] font-serif outline-none focus:border-[#7c3aed] transition-colors min-h-[80px] text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#6b6580] uppercase tracking-widest font-serif">🤫 Secreto</span>
                    <button 
                      onClick={() => aiGen("secret", `3 secretos oscuros para un personaje llamado ${form.name} en una historia de: ${book?.idea}`)}
                      disabled={busy}
                      className="text-[10px] text-[#7c3aed] font-bold uppercase flex items-center gap-1 hover:underline"
                    >
                      {busy && aiField === 'secret' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Sugerir
                    </button>
                  </label>
                  <textarea 
                    value={form.secret} 
                    onChange={e => setForm({ ...form, secret: e.target.value })} 
                    className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-3 text-[#1a1825] font-serif outline-none focus:border-[#7c3aed] transition-colors min-h-[80px] text-sm"
                  />
                </div>
              </div>

              <div className="p-6 bg-[#f5f3ff] rounded-2xl border border-[#7c3aed]/10 space-y-4">
                <label className="block text-[11px] font-bold text-[#7c3aed] uppercase tracking-widest font-serif">🌱 Arco de Transformación</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[9px] font-bold text-[#a09ab8] uppercase tracking-widest font-serif">Inicio</label>
                    <input 
                      value={form.arcStart} 
                      onChange={e => setForm({ ...form, arcStart: e.target.value })} 
                      className="w-full bg-white border border-[#e8e5f0] rounded-lg p-2.5 text-sm font-serif outline-none focus:border-[#7c3aed]"
                      placeholder="Cobarde..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[9px] font-bold text-[#a09ab8] uppercase tracking-widest font-serif">Final</label>
                    <input 
                      value={form.arcEnd} 
                      onChange={e => setForm({ ...form, arcEnd: e.target.value })} 
                      className="w-full bg-white border border-[#e8e5f0] rounded-lg p-2.5 text-sm font-serif outline-none focus:border-[#7c3aed]"
                      placeholder="Valiente..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-[#a09ab8] uppercase tracking-widest font-serif">¿Cómo se transforma?</span>
                    <button 
                      onClick={() => aiGen("arcHow", `Describe el arco de transformación para ${form.name} que empieza siendo ${form.arcStart} y termina siendo ${form.arcEnd} en esta historia: ${book?.idea}`)}
                      disabled={busy}
                      className="text-[10px] text-[#7c3aed] font-bold uppercase flex items-center gap-1 hover:underline"
                    >
                      {busy && aiField === 'arcHow' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Generar Arco
                    </button>
                  </label>
                  <textarea 
                    value={form.arcHow} 
                    onChange={e => setForm({ ...form, arcHow: e.target.value })} 
                    className="w-full bg-white border border-[#e8e5f0] rounded-lg p-3 text-sm font-serif outline-none focus:border-[#7c3aed] min-h-[60px]"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#e8e5f0] flex gap-3">
              <button 
                onClick={saveChar} 
                disabled={!form.name?.trim()}
                className={`flex-1 py-3 rounded-xl font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${!form.name?.trim() ? 'bg-[#e5e0f5] text-[#a09ab8] cursor-not-allowed' : 'bg-[#7c3aed] text-white hover:shadow-xl active:scale-95'}`}
              >
                <Check size={18} /> Guardar Personaje
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

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
