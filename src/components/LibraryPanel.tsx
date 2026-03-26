import React, { useState } from 'react';
import { Book } from '../types';
import { X, Trash2, BookOpen } from 'lucide-react';

interface LibraryPanelProps {
  library: Book[];
  onOpen: (book: Book) => void;
  onDelete: (bookId: string) => void;
  onClose: () => void;
}

export default function LibraryPanel({ library, onOpen, onDelete, onClose }: LibraryPanelProps) {
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const sorted = [...library].sort((a, b) => new Date(b.lastEdited || 0).getTime() - new Date(a.lastEdited || 0).getTime());

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4 md:p-6">
      <div className="bg-[#1a1528] border border-[#7c3aed]/25 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-[#7c3aed]/15 flex justify-between items-center sticky top-0 bg-[#1a1528] z-10">
          <div>
            <h2 className="text-2xl font-serif text-[#fdf6e3] font-normal">Biblioteca</h2>
            <p className="text-xs text-[#c8b4ff]/50 font-serif mt-1">{library.length} obra{library.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} className="text-[#c8b4ff]/50 hover:text-white transition-colors p-2">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {library.length === 0 ? (
            <div className="text-center py-12 text-[#c8b4ff]/35 font-serif">
              <div className="text-4xl mb-3">📚</div>
              <div>Tu biblioteca está vacía.</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sorted.map(book => (
                <div key={book.id} className="group relative bg-white/5 border border-[#7c3aed]/15 rounded-2xl p-4 cursor-pointer hover:bg-white/10 transition-all flex flex-col items-center text-center">
                  <div onClick={() => onOpen(book)} className="w-full aspect-[3/4] relative rounded-lg overflow-hidden mb-3 shadow-lg group-hover:scale-[1.02] transition-transform">
                    <div className="absolute inset-0 flex flex-col justify-end p-3" style={{ background: `linear-gradient(160deg, ${book.color}cc, ${book.color}88)` }}>
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.03),rgba(0,0,0,0.03)_1px,transparent_1px,transparent_8px)]" />
                      <div className="absolute top-0 bottom-0 right-0 w-1 bg-black/20" />
                      <div className="text-[10px] font-serif text-white/90 font-semibold leading-tight relative z-10 truncate">{book.title}</div>
                      {book.type === "saga" && <div className="text-[8px] text-white/50 font-serif relative z-10 truncate">∞ {book.sagaName}</div>}
                    </div>
                  </div>
                  
                  <div onClick={() => onOpen(book)} className="w-full">
                    <div className="text-xs font-serif text-[#fdf6e3] font-semibold mb-1 truncate">{book.title}</div>
                    <div className="text-[10px] text-[#c8b4ff]/35 font-serif">
                      {(book.wordCount || 0).toLocaleString()}p · {book.lastEdited ? new Date(book.lastEdited).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "—"}
                    </div>
                  </div>

                  {confirmDel === book.id ? (
                    <div className="absolute inset-0 bg-[#1a1528]/95 flex flex-col items-center justify-center p-4 rounded-2xl z-20">
                      <p className="text-[10px] text-red-400 font-serif mb-3">¿Borrar definitivamente?</p>
                      <div className="flex gap-2 w-full">
                        <button onClick={() => onDelete(book.id)} className="flex-1 py-1.5 rounded-lg border border-red-500/50 bg-red-500/10 text-red-500 text-[10px] font-serif hover:bg-red-500/20">Sí</button>
                        <button onClick={() => setConfirmDel(null)} className="flex-1 py-1.5 rounded-lg border border-[#c8b4ff]/15 text-[#c8b4ff]/50 text-[10px] font-serif hover:bg-white/5">No</button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setConfirmDel(book.id); }} 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 hover:bg-red-500/20 hover:text-red-400 text-white/30 p-1.5 rounded-full"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
