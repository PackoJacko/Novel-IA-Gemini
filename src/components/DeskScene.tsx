import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { Book } from '../types';
import { Settings, Plus, Layers, Library, Play, Lightbulb, FileText, Cloud } from 'lucide-react';

interface DeskSceneProps {
  library: Book[];
  user: User | null;
  onNewBook: () => void;
  onConnectedBook: () => void;
  onOpenLibrary: () => void;
  onOpenRecent: (book?: Book) => void;
  onSettings: () => void;
}

export default function DeskScene({ library, user, onNewBook, onConnectedBook, onOpenLibrary, onOpenRecent, onSettings }: DeskSceneProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const recent = [...library].sort((a, b) => new Date(b.lastEdited || 0).getTime() - new Date(a.lastEdited || 0).getTime())[0];

  const actions = [
    { id: "typewriter", icon: <FileText size={32} />, label: "Nueva Obra", sub: "Libro independiente", color: "#7c3aed", fn: onNewBook },
    { id: "connected", icon: <Layers size={32} />, label: "Nueva Saga", sub: "Libro conectado", color: "#2563eb", fn: onConnectedBook },
    { id: "bookstack", icon: <Library size={32} />, label: "Mis Libros", sub: `${library.length} guardados`, color: "#059669", fn: onOpenLibrary, badge: library.length > 0 ? library.length : null },
    ...(recent ? [{ id: "recent", icon: <Play size={32} />, label: "Continuar", sub: recent.title, color: recent.color || "#d97706", fn: () => onOpenRecent(recent) }] : [{ id: "empty", icon: <Plus size={32} />, label: "Empezar", sub: "Crea tu primera obra", color: "#6b6580", fn: onNewBook }]),
    { id: "coffee", icon: <Lightbulb size={32} />, label: "Brainstorm", sub: "Generar ideas", color: "#ec4899", fn: () => onOpenRecent(undefined) },
    { id: "papers", icon: <FileText size={32} />, label: "Manuscrito", sub: "Abrir editor", color: "#8b5cf6", fn: () => onOpenRecent(undefined) },
  ];

  return (
    <div className="w-screen h-screen bg-[#0c0a14] overflow-auto flex flex-col relative">
      {/* Stars background */}
      {[...Array(20)].map((_, i) => (
        <div key={i} className="fixed rounded-full bg-white/50" style={{ width: 1, height: 1, top: `${(i * 9 + 3) % 95}%`, left: `${(i * 13 + 7) % 100}%`, opacity: 0.3 + (i % 4) * 0.15 }} />
      ))}

      {/* Header */}
      <header className="text-center p-8 md:p-12 shrink-0 relative">
        <button onClick={onSettings} className="absolute top-8 right-8 bg-[#7c3aed]/15 border border-[#7c3aed]/25 rounded-full p-2 text-[#c8b4ff]/60 hover:text-white transition-colors">
          <Settings size={20} />
        </button>
        <div className="text-4xl md:text-5xl font-serif text-[#fdf6e3] tracking-widest">Novel<span className="text-[#a78bfa]">AI</span></div>
        <div className="text-[10px] text-[#a78bfa]/50 tracking-[0.4em] uppercase font-serif mt-2">Studio</div>
      </header>

      {/* User chip */}
      {user && (
        <div className="mx-8 md:mx-auto mb-8 p-2 px-4 bg-white/5 border border-[#7c3aed]/15 rounded-2xl flex items-center gap-3 max-w-xs">
          {user.photoURL ? <img src={user.photoURL} className="w-8 h-8 rounded-full" alt="" /> : <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-xs shrink-0">{user.displayName?.[0]}</div>}
          <div className="flex-1 overflow-hidden">
            <div className="text-xs text-[#fff0d2]/70 font-serif truncate">{user.displayName}</div>
            <div className="text-[10px] text-[#c8b4ff]/35 font-serif flex items-center gap-1"><Cloud size={10} /> Sincronizado en nube</div>
          </div>
        </div>
      )}

      {/* Action Grid */}
      <div className="px-8 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto w-full flex-1">
        {actions.map(item => (
          <button 
            key={item.id} 
            onClick={item.fn} 
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            className="relative group overflow-hidden rounded-3xl p-8 cursor-pointer flex flex-col items-start gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
            style={{
              background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
              border: `1px solid ${item.color}40`,
            }}
          >
            {item.badge && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#7c3aed] text-white text-[10px] font-bold flex items-center justify-center font-serif shadow-lg">
                {item.badge}
              </div>
            )}
            <div className="text-white/80 transition-transform group-hover:scale-110 duration-300">
              {item.icon}
            </div>
            <div className="text-lg font-serif text-[#fdf6e3] font-semibold">{item.label}</div>
            <div className="text-xs text-[#c8b4ff]/50 font-serif leading-relaxed">{item.sub}</div>
            
            {/* Hover glow */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        ))}
      </div>

      <footer className="p-6 text-center text-[#c8b4ff]/25 text-[10px] font-serif tracking-widest uppercase">
        ☁ Tus datos se guardan en nube · disponibles en todos tus dispositivos
      </footer>
    </div>
  );
}
