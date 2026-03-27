import React, { useState, useRef, useEffect } from 'react';
import { Book, Chapter } from '../types';
import { callAI } from '../lib/ai';
import { Edit3, Sparkles, Loader2, X, Check, Plus, Trash2, ChevronRight, BookOpen, Wand2 } from 'lucide-react';

interface ManuscriptProps {
  book: Book | null;
  onUpdate: (updates: Partial<Book>) => void;
  aiSettings?: any;
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

export default function Manuscript({ book, onUpdate, aiSettings }: ManuscriptProps) {
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [selText, setSelText] = useState("");
  const [selRange, setSelRange] = useState<[number, number]>([0, 0]);
  const [showTools, setShowTools] = useState(false);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<{ type: 'rewrite' | 'generate', results?: any, mode?: string } | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const chapters = book?.chapters || [];
  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];

  useEffect(() => {
    if (chapters.length > 0 && !activeChapterId) {
      setActiveChapterId(chapters[0].id);
    }
  }, [chapters, activeChapterId]);

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
    if (book?.idea) ctx += `IDEA: ${book.idea}\n\n`;
    if (book?.synopsis) ctx += `SINOPSIS: ${book.synopsis}\n\n`;
    if (book?.outline) ctx += `ESQUEMA: ${book.outline}\n\n`;
    if (book?.characters?.length) {
      ctx += "PERSONAJES:\n";
      book.characters.forEach(c => {
        ctx += `• ${c.name}(${c.role}): ${c.appearance}. Miedo: ${c.fears}. Arco: ${c.arcStart} -> ${c.arcEnd}\n`;
      });
      ctx += "\n";
    }
    if (book?.world?.tone) ctx += `TONO: ${book.world.tone}\n`;
    if (book?.structure?.theme) ctx += `TEMA: ${book.structure.theme}\n`;
    return ctx;
  };

  const addChapter = () => {
    const newId = 'ch_' + Date.now();
    const newCh: Chapter = {
      id: newId,
      title: `Capítulo ${chapters.length + 1}`,
      content: "",
      status: 'draft'
    };
    onUpdate({ chapters: [...chapters, newCh] });
    setActiveChapterId(newId);
  };

  const deleteChapter = (id: string) => {
    if (!confirm("¿Eliminar este capítulo?")) return;
    const newChs = chapters.filter(c => c.id !== id);
    onUpdate({ chapters: newChs });
    if (activeChapterId === id) {
      setActiveChapterId(newChs[0]?.id || null);
    }
  };

  const updateChapterContent = (content: string) => {
    if (!activeChapter) return;
    const newChs = chapters.map(c => c.id === activeChapter.id ? { ...c, content } : c);
    onUpdate({ chapters: newChs });
  };

  const updateChapterTitle = (title: string) => {
    if (!activeChapter) return;
    const newChs = chapters.map(c => c.id === activeChapter.id ? { ...c, title } : c);
    onUpdate({ chapters: newChs });
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
      const r = await callAI([{ role: "user", content: pm[mode] + "\n\n\"" + selText + "\"" }], "Novelista experto." + buildCtx(), 800, aiSettings);
      setModal({ type: 'rewrite', mode, results: r });
    } catch (e) {
      console.error(e);
      setModal(null);
    }
    setBusy(false);
  };

  const generateChapter = async () => {
    if (!activeChapter) return;
    setBusy(true);
    setModal({ type: 'generate', mode: activeChapter.title, results: null });
    try {
      const prompt = `Escribe el capítulo completo titulado "${activeChapter.title}". 
      Usa toda la información de contexto proporcionada. 
      Mínimo 1000 palabras. Estilo literario de alta calidad.`;
      
      const r = await callAI([{ role: "user", content: prompt }], "Maestro novelista. Contexto:\n" + buildCtx(), 2000, aiSettings);
      setModal({ type: 'generate', mode: activeChapter.title, results: r });
    } catch (e) {
      console.error(e);
      setModal(null);
    }
    setBusy(false);
  };

  const insertResult = (text: string) => {
    if (!activeChapter) return;
    if (modal?.type === 'rewrite') {
      const m = activeChapter.content || "";
      const n = m.substring(0, selRange[0]) + text + m.substring(selRange[1]);
      updateChapterContent(n);
    } else {
      updateChapterContent(text);
    }
    setModal(null);
    setShowTools(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 pb-20 h-full min-h-[700px]">
      {/* Sidebar de Capítulos */}
      <aside className="w-full md:w-64 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-serif font-bold text-[#1a1825] uppercase tracking-widest">Capítulos</h3>
          <button 
            onClick={addChapter}
            className="p-1.5 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9] transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        
        <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2">
          {chapters.map((ch, i) => (
            <div 
              key={ch.id}
              onClick={() => setActiveChapterId(ch.id)}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${activeChapterId === ch.id ? 'bg-[#7c3aed] border-[#7c3aed] text-white shadow-md' : 'bg-white border-[#e8e5f0] text-[#6b6580] hover:border-[#7c3aed]/30'}`}
            >
              <div className="flex items-center gap-3 truncate">
                <span className={`text-[10px] font-bold ${activeChapterId === ch.id ? 'text-white/60' : 'text-[#a09ab8]'}`}>{i + 1}</span>
                <span className="text-sm font-serif truncate">{ch.title}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteChapter(ch.id); }}
                className={`p-1 rounded-md transition-colors ${activeChapterId === ch.id ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-[#a09ab8] hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100'}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {chapters.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-[#e8e5f0] rounded-2xl">
              <p className="text-[10px] text-[#a09ab8] font-serif uppercase tracking-wider">Sin capítulos</p>
            </div>
          )}
        </div>
      </aside>

      {/* Editor Principal */}
      <div className="flex-1 space-y-6">
        {activeChapter ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <input 
                type="text"
                value={activeChapter.title}
                onChange={e => updateChapterTitle(e.target.value)}
                className="text-3xl font-serif text-[#1a1825] bg-transparent border-none outline-none focus:ring-0 w-full"
              />
              <button 
                onClick={generateChapter}
                disabled={busy}
                className="flex items-center gap-2 px-4 py-2 bg-[#f5f3ff] text-[#7c3aed] border border-[#7c3aed]/20 rounded-xl font-serif font-bold text-sm hover:bg-[#ede9fe] transition-all disabled:opacity-50"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                Escribir con IA
              </button>
            </div>

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
                value={activeChapter.content || ""}
                onChange={e => updateChapterContent(e.target.value)}
                onMouseUp={handleSel}
                onKeyUp={handleSel}
                placeholder="Escribe aquí tu capítulo..."
                className="w-full min-h-[600px] bg-white border border-[#e8e5f0] rounded-2xl p-8 md:p-12 text-[#1a1825] text-lg font-serif leading-[2] outline-none resize-y shadow-sm focus:border-[#7c3aed] transition-colors"
              />
              <div className="absolute bottom-4 right-8 text-[10px] text-[#a09ab8] font-serif">
                {(activeChapter.content || "").split(/\s+/).filter(Boolean).length} palabras
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 bg-white border border-[#e8e5f0] rounded-3xl">
            <BookOpen size={48} className="text-[#e8e5f0] mb-4" />
            <h3 className="text-xl font-serif text-[#1a1825]">Selecciona o crea un capítulo</h3>
            <p className="text-sm text-[#6b6580] font-serif mt-2">Tu manuscrito te espera.</p>
            <button 
              onClick={addChapter}
              className="mt-6 px-6 py-3 bg-[#7c3aed] text-white rounded-xl font-serif font-bold text-sm shadow-lg hover:shadow-xl transition-all"
            >
              Crear primer capítulo
            </button>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#e8e5f0] flex justify-between items-center">
              <h3 className="text-lg font-serif text-[#1a1825]">
                {modal.type === 'rewrite' ? `Reescritura: ${modal.mode}` : `Generando: ${modal.mode}`}
              </h3>
              <button onClick={() => setModal(null)} className="text-[#a09ab8] hover:text-[#1a1825] transition-colors"><X size={24} /></button>
            </div>
            <div className="p-8 overflow-y-auto flex-1 space-y-6">
              {modal.type === 'rewrite' && (
                <div className="p-4 bg-[#f8f7f5] rounded-xl text-sm text-[#6b6580] font-serif italic border-l-4 border-[#e8e5f0]">
                  «{selText}»
                </div>
              )}
              
              {busy ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 size={32} className="animate-spin text-[#7c3aed]" />
                  <p className="text-sm text-[#6b6580] font-serif">La IA está redactando...</p>
                </div>
              ) : (
                <div className="p-6 bg-[#f5f3ff] border border-[#7c3aed]/20 rounded-2xl text-[#1a1825] text-lg font-serif leading-relaxed whitespace-pre-wrap">
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
                  <Check size={18} /> {modal.type === 'rewrite' ? 'Reemplazar texto' : 'Insertar en capítulo'}
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
