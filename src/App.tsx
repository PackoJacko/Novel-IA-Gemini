import React, { useState, useEffect, useCallback, useRef } from 'react';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, User, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, collection, writeBatch, deleteDoc } from 'firebase/firestore';
import { Book } from './types';
import DeskScene from './components/DeskScene';
import LibraryPanel from './components/LibraryPanel';
import NewBookModal from './components/NewBookModal';
import Sidebar from './components/Sidebar';
import Engine from './components/Engine';
import Manuscript from './components/Manuscript';
import Characters from './components/Characters';
import World from './components/World';
import StructureComp from './components/Structure';
import EscaletaComp from './components/Escaleta';
import Planning from './components/Planning';
import Codex from './components/Codex';
import Lorebook from './components/Lorebook';
import Brainstorm from './components/Brainstorm';
import MapComp from './components/Map';
import ImportComp from './components/Import';
import PublishComp from './components/Publish';
import { callAI } from './lib/ai';
import { LogOut, Settings, Home, Cloud, CloudOff, Loader2, Cpu, Key } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [screen, setScreen] = useState<'loading' | 'login' | 'home' | 'app'>('loading');
  const [library, setLibrary] = useState<Book[]>([]);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [newBookType, setNewBookType] = useState<'new' | 'connected' | null>(null);
  const [view, setView] = useState('engine');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser);
      setAuthReady(true);
      if (fbUser) {
        setScreen('home');
      } else {
        setScreen('login');
      }
    });
    return unsub;
  }, []);

  // Library listener
  useEffect(() => {
    if (!user) return;
    const path = `users/${user.uid}`;
    const unsub = onSnapshot(doc(db, path), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.library) {
          setLibrary(data.library);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return unsub;
  }, [user]);

  // Active book listener
  useEffect(() => {
    if (!user || !activeBook?.id) return;
    const path = `users/${user.uid}/books/${activeBook.id}`;
    const unsub = onSnapshot(doc(db, path), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Book;
        setActiveBook(data);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return unsub;
  }, [user, activeBook?.id]);

  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/popup-blocked') {
        setLoginError("Tu navegador bloqueó la ventana de login. Por favor, permite las ventanas emergentes o abre la app en una pestaña nueva.");
      } else if (error.code === 'auth/unauthorized-domain') {
        setLoginError("Este dominio no está autorizado en Firebase. Por favor, añade este dominio a la lista de dominios autorizados en la consola de Firebase.");
      } else {
        setLoginError("Error al iniciar sesión: " + error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setScreen('login');
      setActiveBook(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const saveBookData = useCallback(async (updates: Partial<Book>) => {
    if (!user || !activeBook?.id) return;
    setSyncStatus('syncing');
    const path = `users/${user.uid}/books/${activeBook.id}`;
    try {
      await setDoc(doc(db, path), { ...updates, lastEdited: new Date().toISOString() }, { merge: true });
      setSyncStatus('synced');
      setSavedAt(new Date().toISOString());
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }, [user, activeBook?.id]);

  const createBook = async (data: any) => {
    if (!user) return;
    const bookId = 'book_' + Date.now().toString(36);
    const newBook: Book = {
      id: bookId,
      title: data.title,
      type: data.type,
      color: data.color,
      sagaName: data.sagaName || "",
      sagaOrder: data.sagaOrder || 1,
      connectedTo: data.connectedTo || [],
      createdAt: new Date().toISOString(),
      lastEdited: new Date().toISOString(),
      wordCount: 0,
    };

    const newLibrary = [newBook, ...library];
    const userPath = `users/${user.uid}`;
    const bookPath = `users/${user.uid}/books/${bookId}`;

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, userPath), { library: newLibrary }, { merge: true });
      batch.set(doc(db, bookPath), newBook);
      await batch.commit();
      setLibrary(newLibrary);
      setActiveBook(newBook);
      setScreen('app');
      setNewBookType(null);
    } catch (error) {
      console.error('Create book error:', error);
    }
  };

  const deleteBook = async (bookId: string) => {
    if (!user) return;
    const newLibrary = library.filter(b => b.id !== bookId);
    const userPath = `users/${user.uid}`;
    const bookPath = `users/${user.uid}/books/${bookId}`;

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, userPath), { library: newLibrary }, { merge: true });
      batch.delete(doc(db, bookPath));
      await batch.commit();
      setLibrary(newLibrary);
      if (activeBook?.id === bookId) {
        setActiveBook(null);
        setScreen('home');
      }
    } catch (error) {
      console.error('Delete book error:', error);
    }
  };

  const openBook = (book: Book) => {
    setActiveBook(book);
    setScreen('app');
    setShowLibrary(false);
  };

  if (screen === 'loading') {
    return (
      <div className="w-full h-screen bg-[#0c0a14] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-serif text-[#fdf6e3] tracking-widest">Novel<span className="text-[#a78bfa]">AI</span></div>
          <div className="text-[10px] text-[#a78bfa]/40 tracking-[0.4em] uppercase font-serif mt-4 animate-pulse">Cargando...</div>
        </div>
      </div>
    );
  }

  if (screen === 'login') {
    return (
      <div className="w-full h-screen bg-[#0c0a14] flex items-center justify-center p-4 overflow-auto">
        <div className="bg-[#161224]/95 border border-[#7c3aed]/30 rounded-3xl p-10 max-w-md w-full shadow-2xl text-center">
          <div className="text-5xl font-serif text-[#fdf6e3] tracking-widest mb-2">Novel<span className="text-[#a78bfa]">AI</span></div>
          <div className="text-[10px] text-[#a78bfa]/50 tracking-[0.4em] uppercase font-serif mb-8">Studio</div>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#a78bfa]/40 to-transparent mx-auto mb-8" />
          <p className="text-[#fff0d2]/75 font-serif text-lg leading-relaxed mb-10">
            Tu escritorio de escritura,<br /><strong className="text-[#a78bfa]">sincronizado en la nube</strong>.<br />
            <span className="text-sm text-[#c8b4ff]/50">Escribe en cualquier lugar, continúa siempre.</span>
          </p>
          <button 
            onClick={handleLogin}
            className="w-full py-4 px-6 rounded-xl border border-[#c8b4ff]/20 bg-white/5 text-[#fdf6e3] cursor-pointer text-base font-serif font-medium flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            Continuar con Google
          </button>
          
          {loginError && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs font-serif max-w-xs text-center mx-auto">
              {loginError}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'home') {
    return (
      <>
        <DeskScene 
          library={library} 
          user={user} 
          onNewBook={() => setNewBookType('new')}
          onConnectedBook={() => setNewBookType('connected')}
          onOpenLibrary={() => setShowLibrary(true)}
          onOpenRecent={(book) => book ? openBook(book) : (library.length > 0 ? openBook(library[0]) : null)}
          onSettings={() => setShowSettings(true)}
        />
        {showLibrary && <LibraryPanel library={library} onOpen={openBook} onDelete={deleteBook} onClose={() => setShowLibrary(false)} />}
        {newBookType && <NewBookModal type={newBookType} library={library} onConfirm={createBook} onClose={() => setNewBookType(null)} />}
        {showSettings && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[2000] p-4">
            <div className="bg-[#1a1528] border border-[#7c3aed]/25 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="p-6 border-b border-[#7c3aed]/15 flex justify-between items-center">
                <h3 className="text-lg font-serif text-[#fdf6e3]">Ajustes</h3>
                <button onClick={() => setShowSettings(false)} className="text-[#c8b4ff]/40 hover:text-white transition-colors">✕</button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-white/5 border border-[#7c3aed]/15 rounded-xl">
                  {user?.photoURL ? <img src={user.photoURL} className="w-10 h-10 rounded-full" alt="" /> : <div className="w-10 h-10 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-xl">{user?.displayName?.[0]}</div>}
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-serif font-semibold text-[#fdf6e3] truncate">{user?.displayName}</div>
                    <div className="text-xs text-[#c8b4ff]/40 font-serif truncate">{user?.email}</div>
                  </div>
                </div>

                {/* AI Settings */}
                <div className="space-y-4 pt-4 border-t border-[#7c3aed]/15">
                  <h4 className="text-[10px] font-bold text-[#a78bfa] uppercase tracking-widest font-serif flex items-center gap-2">
                    <Cpu size={12} /> Configuración de IA
                  </h4>
                  
                  <div className="space-y-3">
                    <label className="block text-xs text-[#c8b4ff]/60 font-serif">Proveedor de IA</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => saveBookData({ aiSettings: { ...activeBook?.aiSettings, provider: 'gemini' } as any })}
                        className={`py-2 px-3 rounded-lg border text-xs font-serif transition-all ${activeBook?.aiSettings?.provider !== 'claude' ? 'bg-[#7c3aed]/20 border-[#7c3aed] text-white' : 'bg-white/5 border-white/10 text-[#c8b4ff]/40 hover:bg-white/10'}`}
                      >
                        Google Gemini
                      </button>
                      <button 
                        onClick={() => saveBookData({ aiSettings: { ...activeBook?.aiSettings, provider: 'claude' } as any })}
                        className={`py-2 px-3 rounded-lg border text-xs font-serif transition-all ${activeBook?.aiSettings?.provider === 'claude' ? 'bg-[#7c3aed]/20 border-[#7c3aed] text-white' : 'bg-white/5 border-white/10 text-[#c8b4ff]/40 hover:bg-white/10'}`}
                      >
                        Anthropic Claude
                      </button>
                    </div>
                  </div>

                  {activeBook?.aiSettings?.provider === 'claude' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-xs text-[#c8b4ff]/60 font-serif flex items-center gap-2">
                        <Key size={12} /> Claude API Key
                      </label>
                      <input 
                        type="password"
                        placeholder="sk-ant-..."
                        value={activeBook?.aiSettings?.claudeApiKey || ""}
                        onChange={e => saveBookData({ aiSettings: { ...activeBook?.aiSettings, claudeApiKey: e.target.value } as any })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-xs text-white font-mono outline-none focus:border-[#7c3aed]/50 transition-all"
                      />
                      <p className="text-[9px] text-[#c8b4ff]/30 font-serif leading-tight">
                        Tu clave se guarda de forma segura en tu base de datos privada de Firebase.
                      </p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-full py-3 rounded-xl border border-[#c8b4ff]/15 bg-transparent text-[#c8b4ff]/60 hover:bg-white/5 transition-all text-sm font-serif flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8f7f5] overflow-hidden relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-[299] backdrop-blur-[2px] md:hidden" />
      )}

      {/* Sidebar */}
      <Sidebar 
        activeBook={activeBook} 
        view={view} 
        setView={setView} 
        setScreen={setScreen} 
        setSidebarOpen={setSidebarOpen} 
        sidebarOpen={sidebarOpen}
        syncStatus={syncStatus}
        savedAt={savedAt}
        user={user}
        library={library}
      />

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto ${view === 'mapa' ? '' : 'p-4 md:p-12 pt-16 md:pt-12'}`}>
        {/* Mobile Top Bar */}
        <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#e8e5f0] flex items-center justify-between px-4 z-[200] shadow-sm md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-[#1a1825]"><Settings size={20} /></button>
          <div className="flex-1 text-center truncate px-2 text-sm font-serif font-semibold text-[#1a1825]">
            {activeBook?.title}
          </div>
          <button onClick={() => setScreen('home')} className="p-2 text-[#a09ab8]"><Home size={20} /></button>
        </div>

        <div className="max-w-4xl mx-auto">
          {view === 'engine' && <Engine book={activeBook} onUpdate={saveBookData} />}
          {view === 'manuscript' && <Manuscript book={activeBook} onUpdate={saveBookData} />}
          {view === 'characters' && <Characters book={activeBook} onUpdate={saveBookData} />}
          {view === 'world' && <World book={activeBook} onUpdate={saveBookData} />}
          {view === 'structure' && <StructureComp book={activeBook} onUpdate={saveBookData} />}
          {view === 'escaleta' && <EscaletaComp book={activeBook} onUpdate={saveBookData} />}
          {view === 'planning' && <Planning book={activeBook} onUpdate={saveBookData} />}
          {view === 'codex' && <Codex book={activeBook} onUpdate={saveBookData} />}
          {view === 'lorebook' && <Lorebook book={activeBook} onUpdate={saveBookData} />}
          {view === 'brainstorm' && <Brainstorm book={activeBook} onUpdate={saveBookData} />}
          {view === 'mapa' && <MapComp book={activeBook} onUpdate={saveBookData} />}
          {view === 'importar' && <ImportComp book={activeBook} onUpdate={saveBookData} />}
          {view === 'publicar' && <PublishComp book={activeBook} onUpdate={saveBookData} />}
        </div>
      </main>

      {/* Sync Badge */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-md border border-black/10 rounded-full py-1.5 px-3.5 text-[11px] font-serif font-semibold flex items-center gap-2 shadow-sm z-[500]">
        <div className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-green-500' : syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
        <span className={syncStatus === 'synced' ? 'text-green-600' : syncStatus === 'syncing' ? 'text-yellow-600' : 'text-red-600'}>
          {syncStatus === 'synced' ? 'Sincronizado' : syncStatus === 'syncing' ? 'Guardando...' : 'Offline'}
        </span>
        {savedAt && <span className="text-[#a09ab8] font-normal border-l border-[#e8e5f0] pl-2">{new Date(savedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>}
      </div>
    </div>
  );
}
