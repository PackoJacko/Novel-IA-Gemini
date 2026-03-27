import React, { useState } from 'react';
import { Book } from '../types';
import { Download, FileText, Loader2, Check, X, AlertCircle, Sparkles } from 'lucide-react';
import { callAI } from '../lib/ai';
import * as mammoth from 'mammoth';

interface ImportProps {
  book: Book | null;
  onUpdate: (updates: Partial<Book>) => void;
}

export default function ImportComp({ book, onUpdate }: ImportProps) {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<{ name: string, text: string, ok: boolean }[]>([]);
  const [busy, setBusy] = useState(false);
  const [extracted, setExtracted] = useState<any>(null);
  const [selection, setSelection] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.name.endsWith(".docx")) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const result = await mammoth.extractRawText({ arrayBuffer: e.target?.result as ArrayBuffer });
            resolve(result.value);
          } catch (err) {
            reject(err);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error("Error reading file"));
        reader.readAsText(file);
      }
    });
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(e.target.files || []);
    const results = [];
    for (const f of fileList) {
      try {
        const text = await readFile(f);
        results.push({ name: f.name, text, ok: true });
      } catch (err) {
        results.push({ name: f.name, text: "", ok: false });
      }
    }
    setFiles(results);
  };

  const process = async () => {
    const combined = files.filter(f => f.ok).map(f => `### ${f.name}\n${f.text}`).join("\n\n");
    if (!combined) return;

    setBusy(true);
    setStep(1);
    setError(null);

    const prompt = `Analiza este contenido y extrae información estructurada para una novela. Responde ÚNICAMENTE con un JSON válido con esta estructura:
    {
      "idea": "string",
      "synopsis": "string",
      "characters": [{"name": "string", "role": "protagonist|antagonist|secondary|mentor|other", "appearance": "string"}],
      "worldData": {"genre": "string", "tone": "string"},
      "manuscript": "string"
    }
    
    CONTENIDO:
    ${combined.substring(0, 10000)}`;

    try {
      const r = await callAI([{ role: "user", content: prompt }], "Analista literario experto. Responde solo JSON.", 2000, book?.aiSettings);
      const jsonStr = r.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(jsonStr);
      setExtracted(parsed);
      
      const initialSel: Record<string, boolean> = {};
      if (parsed.idea) initialSel.idea = true;
      if (parsed.synopsis) initialSel.synopsis = true;
      if (parsed.characters?.length) initialSel.characters = true;
      if (parsed.manuscript) initialSel.manuscript = true;
      setSelection(initialSel);
      setStep(2);
    } catch (e) {
      console.error(e);
      setError("No se pudo procesar el archivo. Asegúrate de que el contenido sea legible.");
      setStep(3);
    }
    setBusy(false);
  };

  const apply = () => {
    const updates: Partial<Book> = {};
    if (selection.idea) updates.idea = extracted.idea;
    if (selection.synopsis) updates.synopsis = extracted.synopsis;
    if (selection.manuscript) updates.manuscript = (book?.manuscript || "") + (book?.manuscript ? "\n\n" : "") + extracted.manuscript;
    if (selection.characters) updates.characters = [...(book?.characters || []), ...extracted.characters.map((c: any) => ({ ...c, id: Date.now().toString() + Math.random() }))];
    
    onUpdate(updates);
    setStep(0);
    setFiles([]);
    setExtracted(null);
    alert("Importación completada con éxito.");
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-serif text-[#1a1825] font-normal flex items-center gap-3">
          <Download className="text-[#7c3aed]" /> Importar
        </h2>
        <p className="text-sm text-[#6b6580] font-serif mt-2">La IA analiza tus documentos y distribuye el contenido automáticamente.</p>
      </header>

      {step === 0 && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-dashed border-[#e8e5f0] rounded-3xl p-12 text-center hover:border-[#7c3aed]/30 transition-colors">
            <div className="text-4xl mb-4">📂</div>
            <h3 className="text-lg font-serif text-[#1a1825] mb-2">Sube tus archivos</h3>
            <p className="text-sm text-[#a09ab8] font-serif mb-6">Aceptamos .txt, .md y .docx</p>
            <label className="inline-flex items-center gap-2 py-3 px-8 bg-[#7c3aed] text-white rounded-full font-serif font-bold text-sm shadow-lg cursor-pointer hover:shadow-xl active:scale-95 transition-all">
              Seleccionar archivos
              <input type="file" multiple accept=".txt,.md,.docx" onChange={handleFiles} className="hidden" />
            </label>
          </div>

          {files.length > 0 && (
            <div className="bg-white border border-[#e8e5f0] rounded-2xl overflow-hidden shadow-sm">
              {files.map((f, i) => (
                <div key={i} className="p-4 px-6 border-b border-[#f0eef8] last:border-none flex items-center gap-4">
                  <FileText className={f.ok ? "text-[#7c3aed]" : "text-red-400"} size={20} />
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-serif font-semibold text-[#1a1825] truncate">{f.name}</div>
                    <div className="text-[10px] text-[#a09ab8] font-serif uppercase tracking-wider">{f.ok ? "Listo para procesar" : "Error al leer"}</div>
                  </div>
                  <button onClick={() => setFiles(files.filter((_, j) => i !== j))} className="text-[#a09ab8] hover:text-red-500 transition-colors"><X size={18} /></button>
                </div>
              ))}
              <div className="p-4 bg-[#f8f7f5] flex justify-end">
                <button 
                  onClick={process} 
                  disabled={!files.some(f => f.ok)}
                  className="flex items-center gap-2 py-2 px-6 bg-[#7c3aed] text-white rounded-full font-serif font-bold text-xs shadow-md hover:shadow-lg transition-all"
                >
                  Continuar <Check size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="bg-white border border-[#e8e5f0] rounded-3xl p-20 text-center space-y-6">
          <Loader2 size={48} className="animate-spin text-[#7c3aed] mx-auto" />
          <div>
            <h3 className="text-xl font-serif text-[#1a1825]">Analizando con IA...</h3>
            <p className="text-sm text-[#6b6580] font-serif mt-2">Estamos extrayendo personajes, trama y mundo de tus archivos.</p>
          </div>
        </div>
      )}

      {step === 2 && extracted && (
        <div className="space-y-6">
          <div className="bg-[#f5f3ff] border border-[#7c3aed]/20 rounded-2xl p-4 flex items-center gap-3">
            <Sparkles className="text-[#7c3aed]" size={20} />
            <p className="text-sm text-[#7c3aed] font-serif font-semibold">Análisis completado. Selecciona qué deseas importar a tu proyecto.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { k: "idea", l: "💡 Idea", v: extracted.idea },
              { k: "synopsis", l: "📄 Sinopsis", v: extracted.synopsis },
              { k: "characters", l: "👤 Personajes", v: `${extracted.characters?.length || 0} detectados` },
              { k: "manuscript", l: "✍ Manuscrito", v: `${extracted.manuscript?.split(/\s+/).length || 0} palabras` },
            ].filter(s => s.v).map(s => (
              <button 
                key={s.k} 
                onClick={() => setSelection(p => ({ ...p, [s.k]: !p[s.k] }))}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${selection[s.k] ? 'bg-[#f5f3ff] border-[#7c3aed] shadow-md' : 'bg-white border-[#e8e5f0] hover:border-[#7c3aed]/30'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-serif font-bold ${selection[s.k] ? 'text-[#7c3aed]' : 'text-[#1a1825]'}`}>{s.l}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selection[s.k] ? 'bg-[#7c3aed] border-[#7c3aed]' : 'border-[#e8e5f0]'}`}>
                    {selection[s.k] && <Check size={12} className="text-white" />}
                  </div>
                </div>
                <p className="text-xs text-[#a09ab8] font-serif line-clamp-2 leading-relaxed">{s.v}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setStep(0)} className="px-6 py-3 border border-[#e8e5f0] text-[#6b6580] rounded-xl font-serif text-sm hover:bg-[#f8f7f5]">Atrás</button>
            <button onClick={apply} className="px-8 py-3 bg-[#7c3aed] text-white rounded-xl font-serif font-bold text-sm shadow-lg hover:shadow-xl transition-all">Importar Selección</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white border border-red-100 rounded-3xl p-12 text-center space-y-6">
          <AlertCircle size={48} className="text-red-500 mx-auto" />
          <div>
            <h3 className="text-xl font-serif text-[#1a1825]">Algo salió mal</h3>
            <p className="text-sm text-red-500 font-serif mt-2">{error}</p>
          </div>
          <button onClick={() => setStep(0)} className="px-8 py-3 bg-[#f8f7f5] text-[#1a1825] rounded-xl font-serif font-bold text-sm border border-[#e8e5f0]">Reintentar</button>
        </div>
      )}
    </div>
  );
}
