import React, { useState } from 'react';
import { Book } from '../types';
import { X, Plus, Layers, BookOpen } from 'lucide-react';

interface NewBookModalProps {
  type: 'new' | 'connected';
  library: Book[];
  onConfirm: (data: any) => void;
  onClose: () => void;
}

const BOOK_PALETTE = ["#7c3aed", "#2563eb", "#dc2626", "#059669", "#d97706", "#ec4899", "#0891b2", "#92400e", "#065f46", "#1d4ed8"];

export default function NewBookModal({ type, library, onConfirm, onClose }: NewBookModalProps) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(BOOK_PALETTE[0]);
  const [sagaName, setSagaName] = useState("");
  const [sagaOrder, setSagaOrder] = useState(1);
  const [connectedTo, setConnectedTo] = useState<string[]>([]);
  
  const isConnected = type === "connected";
  const canSubmit = title.trim() && (!isConnected || sagaName.trim());

  const toggleConn = (id: string) => {
    setConnectedTo(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[1001] p-4 md:p-6 overflow-y-auto">
      <div className="bg-[#1a1528] border border-[#7c3aed]/25 rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="p-6 border-b border-[#7c3aed]/15 flex justify-between items-center sticky top-0 bg-[#1a1528] z-10">
          <h3 className="text-xl font-serif text-[#fdf6e3] font-normal">
            {isConnected ? "∞ Nueva Saga" : "✦ Nueva Obra"}
          </h3>
          <button onClick={onClose} className="text-[#c8b4ff]/40 hover:text-white transition-colors p-2">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="space-y-2">
            <label className="block text-xs text-[#c8b4ff]/60 font-serif uppercase tracking-wider font-semibold">Título</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="El nombre de tu historia..."
              className="w-full bg-white/5 border border-[#7c3aed]/25 rounded-xl p-4 text-[#fdf6e3] text-lg font-serif outline-none focus:border-[#7c3aed]/80 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-[#c8b4ff]/60 font-serif uppercase tracking-wider font-semibold">Color de portada</label>
            <div className="flex flex-wrap gap-2.5">
              {BOOK_PALETTE.map(c => (
                <button 
                  key={c} 
                  onClick={() => setColor(c)} 
                  className={`w-8 h-8 rounded-full transition-all ${color === c ? 'scale-125 border-4 border-white/60 shadow-lg' : 'scale-100 border-4 border-transparent hover:scale-110'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {isConnected && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs text-[#c8b4ff]/60 font-serif uppercase tracking-wider font-semibold">Nombre de la saga</label>
                <input 
                  value={sagaName} 
                  onChange={e => setSagaName(e.target.value)} 
                  placeholder="Crónicas del Vacío..."
                  className="w-full bg-white/5 border border-[#7c3aed]/25 rounded-xl p-4 text-[#fdf6e3] text-lg font-serif outline-none focus:border-[#7c3aed]/80 transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs text-[#c8b4ff]/60 font-serif uppercase tracking-wider font-semibold">Nº en la saga</label>
                <input 
                  type="number" 
                  min="1" 
                  value={sagaOrder} 
                  onChange={e => setSagaOrder(Number(e.target.value))}
                  className="w-24 bg-white/5 border border-[#7c3aed]/25 rounded-xl p-4 text-[#fdf6e3] text-lg font-serif outline-none focus:border-[#7c3aed]/80 transition-all"
                />
              </div>

              {library.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-xs text-[#c8b4ff]/60 font-serif uppercase tracking-wider font-semibold">Conectar con (opcional)</label>
                  <div className="flex flex-wrap gap-2">
                    {library.map(b => (
                      <button 
                        key={b.id} 
                        onClick={() => toggleConn(b.id)} 
                        className={`px-4 py-2 rounded-full border text-xs font-serif flex items-center gap-2 transition-all ${connectedTo.includes(b.id) ? 'bg-[#7c3aed]/15 border-[#7c3aed]/70 text-[#a78bfa]' : 'bg-transparent border-[#7c3aed]/20 text-[#c8b4ff]/50 hover:border-[#7c3aed]/40'}`}
                      >
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: b.color || '#7c3aed' }} />
                        {b.title.length > 18 ? b.title.slice(0, 17) + "…" : b.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          <div className="flex justify-center py-4">
            <div className="w-20 h-28 rounded-lg shadow-2xl relative overflow-hidden flex flex-col justify-end p-2.5 transition-all" style={{ background: `linear-gradient(160deg, ${color}cc, ${color}77)` }}>
              <div className="absolute top-0 bottom-0 right-0 w-1.5 bg-black/15" />
              <div className="text-[10px] font-serif text-white/90 font-bold leading-tight relative z-10 truncate">{title || "Mi nueva obra"}</div>
            </div>
          </div>

          <button 
            onClick={() => canSubmit && onConfirm({ title: title.trim(), color, type: isConnected ? "saga" : "standalone", sagaName: sagaName.trim(), sagaOrder, connectedTo })} 
            disabled={!canSubmit}
            className={`w-full py-4 rounded-xl text-base font-serif font-bold transition-all flex items-center justify-center gap-2 ${canSubmit ? 'text-white shadow-xl' : 'bg-[#6b6580]/30 text-[#c8b4ff]/30 cursor-not-allowed'}`}
            style={{ background: canSubmit ? color : undefined, boxShadow: canSubmit ? `0 4px 20px ${color}55` : 'none' }}
          >
            {isConnected ? "∞ Crear Saga" : "✦ Comenzar Obra"}
          </button>
        </div>
      </div>
    </div>
  );
}
