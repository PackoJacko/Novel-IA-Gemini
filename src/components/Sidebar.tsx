import React from 'react';
import { Book } from '../types';
import { User } from 'firebase/auth';
import { 
  Zap, 
  Edit3, 
  Layout, 
  AlignLeft, 
  Diamond, 
  Circle, 
  User as UserIcon, 
  Globe, 
  Sparkles, 
  Hexagon, 
  Download, 
  Printer, 
  Square, 
  Command, 
  Home,
  Cloud,
  CloudOff,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeBook: Book | null;
  view: string;
  setView: (view: string) => void;
  setScreen: (screen: 'loading' | 'login' | 'home' | 'app') => void;
  setSidebarOpen: (open: boolean) => void;
  sidebarOpen: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';
  savedAt: string | null;
  user: User | null;
  library: Book[];
}

const NAV = [
  { group: "ESCRITURA", items: [{ id: "engine", icon: <Zap size={16} />, label: "Story Engine" }, { id: "manuscript", icon: <Edit3 size={16} />, label: "Manuscrito" }] },
  { group: "PLANIFICACIÓN", items: [{ id: "planning", icon: <Layout size={16} />, label: "Tablero" }, { id: "escaleta", icon: <AlignLeft size={16} />, label: "Escaleta" }, { id: "structure", icon: <Diamond size={16} />, label: "Estructura" }] },
  { group: "UNIVERSO", items: [{ id: "characters", icon: <Circle size={16} />, label: "Personajes" }, { id: "world", icon: <Circle size={16} />, label: "Mundo" }, { id: "voice", icon: <Diamond size={16} />, label: "Voz & Técnica" }] },
  { group: "HERRAMIENTAS", items: [{ id: "brainstorm", icon: <Sparkles size={16} />, label: "Brainstorm" }, { id: "mapa", icon: <Hexagon size={16} />, label: "Mapa" }, { id: "importar", icon: <Download size={16} />, label: "Importar" }, { id: "publicar", icon: <Printer size={16} />, label: "Publicar" }, { id: "codex", icon: <Square size={16} />, label: "Codex" }, { id: "lorebook", icon: <Command size={16} />, label: "Lorebook" }] },
];

export default function Sidebar({ activeBook, view, setView, setScreen, setSidebarOpen, sidebarOpen, syncStatus, savedAt, user, library }: SidebarProps) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-[300] w-[210px] bg-white border-r border-[#e8e5f0] flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'}`}>
      {/* Book header */}
      <div className="p-4 border-b border-[#f0eef8] cursor-pointer hover:bg-[#f8f7f5] transition-colors" onClick={() => { setScreen('home'); setSidebarOpen(false); }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: activeBook?.color || '#7c3aed' }} />
          <div className="text-xs font-serif text-[#1a1825] font-semibold truncate flex-1">{activeBook?.title || "Sin título"}</div>
        </div>
        {activeBook?.type === "saga" && <div className="text-[10px] text-[#a09ab8] font-serif">∞ {activeBook.sagaName} · #{activeBook.sagaOrder}</div>}
        <div className="text-[10px] text-[#a09ab8] font-serif mt-1 flex items-center gap-1"><Home size={10} /> Escritorio</div>
      </div>

      {/* Sync status strip */}
      <div className={`px-4 py-2 border-b border-[#f0eef8] flex items-center gap-2 ${syncStatus === 'offline' ? 'bg-red-50' : 'bg-[#f5f3ff]'}`}>
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${syncStatus === 'synced' ? 'bg-green-500' : syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
        <div className={`text-[10px] font-serif font-semibold ${syncStatus === 'synced' ? 'text-green-600' : syncStatus === 'syncing' ? 'text-yellow-600' : 'text-red-600'}`}>
          {syncStatus === 'synced' ? "☁ En nube" : syncStatus === 'syncing' ? "↑ Guardando..." : "◌ Sin conexión"}
          {syncStatus === 'synced' && savedAt && <span className="font-normal text-[#a09ab8]"> · {new Date(savedAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-4">
        {NAV.map(group => (
          <div key={group.group}>
            <div className="text-[9px] font-bold text-[#a09ab8] tracking-[0.12em] uppercase px-3 py-1 font-serif">{group.group}</div>
            <div className="space-y-0.5 mt-1">
              {group.items.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => { setView(item.id); setSidebarOpen(false); }}
                  className={`flex items-center gap-2.5 px-3 py-2 w-full rounded-xl transition-all text-left font-serif text-sm ${view === item.id ? 'bg-[#ede9fe] text-[#7c3aed] font-semibold' : 'text-[#6b6580] hover:bg-[#f8f7f5]'}`}
                >
                  <span className={`shrink-0 ${view === item.id ? 'text-[#7c3aed]' : 'text-[#a09ab8]'}`}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Stats & User */}
      <div className="p-2 space-y-2 border-t border-[#f0eef8]">
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#7c3aed]/5 to-[#8b5cf6]/10 border border-[#7c3aed]/10">
          <div className="text-[10px] font-bold text-[#7c3aed] mb-1 tracking-wider font-serif uppercase">BIBLIA</div>
          <div className="text-[11px] text-[#6b6580] leading-relaxed font-serif">
            {activeBook?.characters?.length || 0} personajes · {activeBook?.codex?.length || 0} codex
          </div>
          <div className="text-[10px] text-[#a09ab8] mt-0.5 font-serif">
            {activeBook?.wordCount || 0} palabras
          </div>
        </div>

        {user && (
          <div className="p-2 px-3 rounded-xl bg-white border border-[#e8e5f0] flex items-center gap-2.5 cursor-pointer hover:bg-[#f8f7f5] transition-colors" onClick={() => setScreen('home')}>
            {user.photoURL ? <img src={user.photoURL} className="w-6 h-6 rounded-full" alt="" /> : <div className="w-6 h-6 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-[10px] shrink-0 font-serif">{user.displayName?.[0]}</div>}
            <div className="flex-1 overflow-hidden">
              <div className="text-[10px] font-serif font-semibold text-[#6b6580] truncate">{user.displayName}</div>
              <div className="text-[9px] text-[#a09ab8] font-serif">Ajustes de cuenta</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
