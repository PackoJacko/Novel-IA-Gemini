import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Book, MapNode, MapLink } from '../types';
import * as d3 from 'd3';
import { Hexagon, Maximize2, Plus, X, Check } from 'lucide-react';

interface MapProps {
  book: Book | null;
  onUpdate: (updates: Partial<Book>) => void;
}

const NODE_COLORS: Record<string, string> = {
  protagonist: "#10b981",
  antagonist: "#ef4444",
  secondary: "#3b82f6",
  mentor: "#f59e0b",
  other: "#a09ab8",
  lugar: "#0ea5e9",
  objeto: "#f97316",
  mitología: "#8b5cf6",
  otro: "#6b7280",
  escena: "#d97706",
  custom: "#7c3aed"
};

export default function MapComp({ book, onUpdate }: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [filter, setFilter] = useState("all");
  const [addNodeForm, setAddNodeForm] = useState<{ label: string } | null>(null);
  const [addLinkForm, setAddLinkForm] = useState<{ source: string, target: string, label: string } | null>(null);

  const characters = book?.characters || [];
  const codex = book?.codex || [];
  const escaleta = book?.escaleta || [];
  const customNodes = book?.mapnodes || [];
  const customLinks = book?.maplinks || [];

  const buildNodes = useCallback(() => {
    const nodes: any[] = [];
    characters.forEach(c => nodes.push({ id: "c-" + c.id, label: c.name, type: c.role, group: "cast" }));
    codex.forEach(e => nodes.push({ id: "cx-" + e.id, label: e.name, type: e.type, group: "world" }));
    escaleta.slice(0, 12).forEach(e => nodes.push({ id: "es-" + e.id, label: e.title, type: "escena", group: "plot" }));
    customNodes.forEach(n => nodes.push({ ...n, group: "custom" }));
    return nodes;
  }, [characters, codex, escaleta, customNodes]);

  const allNodes = buildNodes();

  useEffect(() => {
    if (!svgRef.current) return;
    
    const nodesData = filter === "all" ? allNodes : allNodes.filter(n => n.group === filter);
    const nodeIds = new Set(nodesData.map(n => n.id));
    const linksData = customLinks.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target)).map(l => ({ ...l }));
    
    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation(nodesData as any)
      .force("link", d3.forceLink(linksData).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(60));

    const link = g.append("g")
      .selectAll("line")
      .data(linksData)
      .join("line")
      .attr("stroke", "#c4b5fd")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6);

    const linkText = g.append("g")
      .selectAll("text")
      .data(linksData.filter(l => l.label))
      .join("text")
      .text((d: any) => d.label)
      .attr("font-size", 10)
      .attr("fill", "#a09ab8")
      .attr("text-anchor", "middle")
      .attr("font-family", "serif");

    const node = g.append("g")
      .selectAll("g")
      .data(nodesData)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    node.append("circle")
      .attr("r", 30)
      .attr("fill", (d: any) => (NODE_COLORS[d.type] || "#7c3aed") + "20")
      .attr("stroke", (d: any) => NODE_COLORS[d.type] || "#7c3aed")
      .attr("stroke-width", 2);

    node.append("text")
      .text((d: any) => d.label.length > 12 ? d.label.slice(0, 10) + "..." : d.label)
      .attr("text-anchor", "middle")
      .attr("dy", "3.5em")
      .attr("font-size", 11)
      .attr("fill", "#1a1825")
      .attr("font-weight", "600")
      .attr("font-family", "serif");

    node.append("text")
      .text((d: any) => d.type.slice(0, 4).toUpperCase())
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", 8)
      .attr("fill", (d: any) => NODE_COLORS[d.type] || "#7c3aed")
      .attr("font-weight", "bold")
      .attr("font-family", "serif");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      linkText
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2 - 5);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [allNodes, customLinks, filter]);

  const saveNode = () => {
    if (!addNodeForm?.label) return;
    const newNode: MapNode = {
      id: "cn-" + Date.now(),
      label: addNodeForm.label,
      type: "custom",
      group: "custom"
    };
    onUpdate({ mapnodes: [...customNodes, newNode] });
    setAddNodeForm(null);
  };

  const saveLink = () => {
    if (!addLinkForm?.source || !addLinkForm?.target) return;
    const newLink: MapLink = {
      id: "ml-" + Date.now(),
      source: addLinkForm.source,
      target: addLinkForm.target,
      label: addLinkForm.label
    };
    onUpdate({ maplinks: [...customLinks, newLink] });
    setAddLinkForm(null);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8f7f5]">
      <div className="p-4 border-b border-[#e8e5f0] bg-white flex items-center gap-4 flex-wrap shrink-0">
        <h2 className="text-xl font-serif text-[#1a1825] flex items-center gap-2">
          <Hexagon size={20} className="text-[#7c3aed]" /> Mapa
        </h2>
        <div className="flex gap-2 flex-1">
          {[["all", "Todos"], ["cast", "Personajes"], ["world", "Mundo"], ["plot", "Trama"]].map(([f, l]) => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-serif font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-[#7c3aed] text-white' : 'bg-[#f8f7f5] text-[#6b6580] hover:bg-[#ede9fe]'}`}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setAddNodeForm({ label: "" })}
            className="p-2 bg-[#f5f3ff] text-[#7c3aed] rounded-full hover:bg-[#ede9fe] transition-colors"
            title="Añadir Nodo"
          >
            <Plus size={18} />
          </button>
          <button 
            onClick={() => setAddLinkForm({ source: "", target: "", label: "" })}
            className="p-2 bg-[#f5f3ff] text-[#7c3aed] rounded-full hover:bg-[#ede9fe] transition-colors"
            title="Añadir Conexión"
          >
            <Maximize2 size={18} className="rotate-45" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        
        {allNodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#a09ab8] font-serif pointer-events-none p-12 text-center">
            <Hexagon size={48} className="mb-4 opacity-20" />
            <p>Añade personajes o elementos al Codex para ver el mapa de relaciones.</p>
          </div>
        )}
      </div>

      {addNodeForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-lg font-serif text-[#1a1825]">Añadir Nodo</h3>
            <input 
              value={addNodeForm.label} 
              onChange={e => setAddNodeForm({ label: e.target.value })}
              placeholder="Etiqueta del nodo..."
              className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-3 text-sm font-serif outline-none focus:border-[#7c3aed]"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={saveNode} className="flex-1 py-2.5 bg-[#7c3aed] text-white rounded-xl font-serif font-bold text-sm">Añadir</button>
              <button onClick={() => setAddNodeForm(null)} className="px-4 py-2.5 border border-[#e8e5f0] text-[#6b6580] rounded-xl font-serif text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {addLinkForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-lg font-serif text-[#1a1825]">Crear Conexión</h3>
            <div className="space-y-3">
              <select 
                value={addLinkForm.source} 
                onChange={e => setAddLinkForm({ ...addLinkForm, source: e.target.value })}
                className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-3 text-sm font-serif outline-none"
              >
                <option value="">Desde...</option>
                {allNodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>
              <select 
                value={addLinkForm.target} 
                onChange={e => setAddLinkForm({ ...addLinkForm, target: e.target.value })}
                className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-3 text-sm font-serif outline-none"
              >
                <option value="">Hacia...</option>
                {allNodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>
              <input 
                value={addLinkForm.label} 
                onChange={e => setAddLinkForm({ ...addLinkForm, label: e.target.value })}
                placeholder="Relación (ej: rival de, ama a...)"
                className="w-full bg-[#f8f7f5] border border-[#e8e5f0] rounded-xl p-3 text-sm font-serif outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={saveLink} className="flex-1 py-2.5 bg-[#7c3aed] text-white rounded-xl font-serif font-bold text-sm">Conectar</button>
              <button onClick={() => setAddLinkForm(null)} className="px-4 py-2.5 border border-[#e8e5f0] text-[#6b6580] rounded-xl font-serif text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
