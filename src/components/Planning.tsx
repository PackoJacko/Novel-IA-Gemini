import React from 'react';
import { Book, Chapter } from '../types';
import { Layout, Plus, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';

interface PlanningProps {
  book: Book | null;
  onUpdate: (updates: Partial<Book>) => void;
}

export default function Planning({ book, onUpdate }: PlanningProps) {
  const chapters = book?.chapters || [];

  const addChapter = () => {
    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: "Capítulo " + (chapters.length + 1),
      notes: "",
      status: "draft"
    };
    onUpdate({ chapters: [...chapters, newChapter] });
  };

  const updateChapter = (id: string, updates: Partial<Chapter>) => {
    onUpdate({
      chapters: chapters.map(c => c.id === id ? { ...c, ...updates } : c)
    });
  };

  const deleteChapter = (id: string) => {
    if (confirm("¿Borrar capítulo?")) {
      onUpdate({ chapters: chapters.filter(c => c.id !== id) });
    }
  };

  const STATUS_CONFIG = {
    done: { icon: <CheckCircle2 size={14} />, label: "Listo", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
    wip: { icon: <Clock size={14} />, label: "En progreso", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    draft: { icon: <Circle size={14} />, label: "Borrador", color: "text-[#a09ab8]", bg: "bg-[#f8f7f5]", border: "border-[#e8e5f0]" }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-serif text-[#1a1825] font-normal flex items-center gap-3">
            <Layout className="text-[#7c3aed]" /> Tablero de Capítulos
          </h2>
          <p className="text-sm text-[#6b6580] font-serif mt-2">Planifica el arco de tu novela.</p>
        </div>
        <button 
          onClick={addChapter}
          className="flex items-center gap-2 py-2.5 px-5 bg-[#7c3aed] text-white rounded-full font-serif font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all"
        >
          <Plus size={18} /> Capítulo
        </button>
      </header>

      {chapters.length === 0 ? (
        <div className="bg-white border border-[#e8e5f0] rounded-2xl p-12 text-center text-[#a09ab8] font-serif">
          Crea tu primer capítulo para empezar a organizar tu historia.
        </div>
      ) : (
        <div className="space-y-3">
          {chapters.map((ch, idx) => (
            <div key={ch.id} className="bg-white border border-[#e8e5f0] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs font-bold text-[#7c3aed] font-serif w-6">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <input 
                  value={ch.title} 
                  onChange={e => updateChapter(ch.id, { title: e.target.value })}
                  className="flex-1 bg-transparent border-none text-[#1a1825] font-serif font-semibold text-base outline-none focus:text-[#7c3aed] transition-colors"
                />
                <div className="flex items-center gap-2">
                  <select 
                    value={ch.status} 
                    onChange={e => updateChapter(ch.id, { status: e.target.value as any })}
                    className={`appearance-none px-3 py-1.5 rounded-full text-[10px] font-bold font-serif border cursor-pointer transition-all ${STATUS_CONFIG[ch.status].bg} ${STATUS_CONFIG[ch.status].color} ${STATUS_CONFIG[ch.status].border}`}
                  >
                    <option value="draft">○ Borrador</option>
                    <option value="wip">✏ En progreso</option>
                    <option value="done">✓ Listo</option>
                  </select>
                  <button 
                    onClick={() => deleteChapter(ch.id)}
                    className="p-2 text-[#a09ab8] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <textarea 
                value={ch.notes || ""} 
                onChange={e => updateChapter(ch.id, { notes: e.target.value })}
                placeholder="¿Qué ocurre en este capítulo? ¿Cuál es el conflicto principal?"
                className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-3 text-[#6b6580] text-sm font-serif leading-relaxed outline-none focus:border-[#7c3aed] transition-colors min-h-[60px] resize-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
