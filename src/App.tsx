import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home as HomeIcon, 
  Rss, 
  Lightbulb, 
  Beaker, 
  ArrowRight, 
  Download, 
  Plus, 
  Trash2,
  CheckCircle2,
  Info,
  ChevronRight,
  ChevronLeft,
  Settings2
} from 'lucide-react';

// --- Types ---
type Track = 'itsm' | 'hr' | 'proc';
type View = 'home' | 'feed' | 'pistas' | 'lab';

interface Lesson {
  tag: string;
  title: string;
  text: string;
  examples: Record<Track, string[]>;
  check: string;
}

interface PistaStep {
  question: string;
  placeholder: string;
}

interface InventoryItem {
  id: string;
  verbo: string;
  objeto: string;
}

interface PrioritizationItem {
  id: string;
  name: string;
  impacto: number;
  esfuerzo: number;
  riesgo: number;
  nota: string;
}

interface SipocData {
  suppliers: string;
  inputs: string;
  process: string;
  outputs: string;
  customers: string;
}

// --- Data ---
const LESSONS: Lesson[] = [
  {
    tag: "M2-S10 · Medición",
    title: "Baseline: medir antes de cambiar",
    text: "Sin baseline no puedes demostrar mejora. Es el punto de partida real.",
    examples: {
      itsm: ["Valor: % misrouting", "Coste: AHT triage", "Riesgo: % P1 mal clasificados"],
      hr: ["Valor: tiempo respuesta", "Coste: €/caso", "Riesgo: incidentes PII"],
      proc: ["Valor: lead time", "Coste: iteraciones doc", "Riesgo: excepciones sin trazabilidad"]
    },
    check: "Escribe 1 métrica valor/coste/riesgo y cómo la medirías."
  },
  {
    tag: "M2-S10 · Procesos",
    title: "Nivel L1: Verbo + Objeto",
    text: "Un proceso L1 define el 'qué' se hace, no el 'cómo'. Debe ser claro y repetible.",
    examples: {
      itsm: ["Gestionar Incidente", "Validar Acceso", "Aprobar Cambio"],
      hr: ["Registrar Candidato", "Validar Nómina", "Aprobar Vacaciones"],
      proc: ["Validar Proveedor", "Registrar Pedido", "Aprobar Factura"]
    },
    check: "Escribe 3 procesos L1 de tu área siguiendo la regla Verbo + Objeto."
  },
  {
    tag: "M2-S10 · Priorización",
    title: "Impacto vs Esfuerzo",
    text: "No todos los procesos valen lo mismo. Priorizamos por valor de negocio y facilidad.",
    examples: {
      itsm: ["Impacto: Reducción de caídas", "Esfuerzo: Integración API"],
      hr: ["Impacto: Experiencia empleado", "Esfuerzo: Cambio de política"],
      proc: ["Impacto: Ahorro en compras", "Esfuerzo: Portal proveedores"]
    },
    check: "Identifica un proceso de 'bajo esfuerzo' y 'alto impacto' en tu track."
  }
];

const PISTA_STEPS: Record<Track, PistaStep[]> = {
  itsm: [
    { question: "¿Cuál es el trigger principal de tu proceso de Triage?", placeholder: "Ej: Llega un correo al buzón de soporte..." },
    { question: "¿Qué datos son críticos para clasificar el ticket?", placeholder: "Ej: Categoría, Urgencia, Usuario..." },
    { question: "¿Cuál es la restricción técnica más fuerte?", placeholder: "Ej: El sistema legado no permite automatizar el cierre..." }
  ],
  hr: [
    { question: "¿Cómo se inicia la solicitud de contratación?", placeholder: "Ej: El manager rellena el formulario en el portal..." },
    { question: "¿Qué documentos PII se manejan en este paso?", placeholder: "Ej: DNI, Contrato firmado, Datos bancarios..." },
    { question: "¿Quién es el aprobador final del proceso?", placeholder: "Ej: Director de área y HR Business Partner..." }
  ],
  proc: [
    { question: "¿Qué dispara la necesidad de una nueva compra?", placeholder: "Ej: Stock por debajo del mínimo o solicitud de proyecto..." },
    { question: "¿Qué validaciones de compliance son obligatorias?", placeholder: "Ej: Verificación de paraísos fiscales, solvencia..." },
    { question: "¿Cuál es el output que recibe el proveedor?", placeholder: "Ej: Orden de compra firmada en PDF..." }
  ]
};

// --- Components ---

const TrackSelector = ({ track, setTrack }: { track: Track, setTrack: (t: Track) => void }) => (
  <div className="flex items-center gap-3 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
    {(['itsm', 'hr', 'proc'] as Track[]).map((t) => (
      <button
        key={t}
        onClick={() => setTrack(t)}
        className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
          track === t 
            ? 'bg-white text-zinc-900 shadow-sm' 
            : 'text-zinc-400 hover:text-zinc-600'
        }`}
      >
        {t}
      </button>
    ))}
  </div>
);

const Navbar = ({ currentView, setView }: { currentView: View, setView: (v: View) => void }) => {
  const navItems: { id: View; label: string; icon: any }[] = [
    { id: 'home', label: 'Inicio', icon: HomeIcon },
    { id: 'feed', label: 'Feed', icon: Rss },
    { id: 'pistas', label: 'Pistas', icon: Lightbulb },
    { id: 'lab', label: 'Lab', icon: Beaker },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-zinc-200 px-4 py-2 rounded-full shadow-2xl z-50 flex items-center gap-2">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            currentView === item.id 
              ? 'bg-zinc-900 text-white shadow-lg' 
              : 'text-zinc-500 hover:bg-zinc-100'
          }`}
        >
          <item.icon size={18} />
          <span className="text-sm font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

const Home = ({ setView }: { setView: (v: View) => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="max-w-4xl mx-auto py-24 px-6"
  >
    <header className="mb-20 text-center">
      <div className="inline-block px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-6">
        MicroDSI · M2-S10 · Febrero 2026
      </div>
      <h1 className="text-7xl font-serif font-medium tracking-tight text-zinc-900 mb-8 leading-[0.9]">
        Modo <span className="italic text-zinc-400">Mapa Mental</span> 🎯
      </h1>
      <p className="text-2xl text-zinc-500 max-w-2xl mx-auto leading-relaxed font-light">
        Desbloquea un proceso candidato: inventario → priorización → SIPOC. 
        Avanza por tarjetas, resuelve el caso y genera tu entregable.
      </p>
      <div className="mt-12">
        <button 
          onClick={() => setView('feed')}
          className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-medium hover:bg-zinc-800 transition-all shadow-xl flex items-center gap-3 mx-auto group"
        >
          Empezar el flujo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        { view: 'feed' as View, title: 'Feed', desc: 'Micro-lecciones en tarjetas interactivas.', icon: Rss, color: 'text-blue-500' },
        { view: 'pistas' as View, title: 'Pistas', desc: 'Caso guiado paso a paso según tu track.', icon: Lightbulb, color: 'text-amber-500' },
        { view: 'lab' as View, title: 'Lab', desc: 'Fabrica y exporta tu entregable final.', icon: Beaker, color: 'text-emerald-500' },
      ].map((card) => (
        <div key={card.view} className="p-8 bg-white border border-zinc-100 rounded-[32px] shadow-sm hover:shadow-xl transition-all border-b-4 border-b-zinc-200">
          <card.icon size={32} className={`${card.color} mb-6`} />
          <h3 className="text-xl font-bold text-zinc-900 mb-3">{card.title}</h3>
          <p className="text-zinc-500 text-sm leading-relaxed mb-6">{card.desc}</p>
          <button 
            onClick={() => setView(card.view)}
            className="text-zinc-900 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
          >
            Ir ahora <ChevronRight size={14} />
          </button>
        </div>
      ))}
    </div>
  </motion.div>
);

const Feed = ({ track, setTrack }: { track: Track, setTrack: (t: Track) => void }) => {
  const [marked, setMarked] = useState<number[]>([]);

  const toggleMark = (idx: number) => {
    setMarked(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto py-24 px-6"
    >
      <header className="mb-16 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif font-medium text-zinc-900 mb-4">Feed</h1>
          <p className="text-zinc-500">Recorre las tarjetas y marca lo que te sirva.</p>
        </div>
        <TrackSelector track={track} setTrack={setTrack} />
      </header>
      
      <div className="grid grid-cols-1 gap-8">
        {LESSONS.map((lesson, i) => (
          <div key={i} className={`p-10 bg-white border rounded-[40px] transition-all relative overflow-hidden ${marked.includes(i) ? 'border-zinc-900 shadow-xl' : 'border-zinc-100 shadow-sm'}`}>
            <div className="flex justify-between items-start mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">{lesson.tag}</span>
              <button 
                onClick={() => toggleMark(i)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  marked.includes(i) ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
                }`}
              >
                {marked.includes(i) ? 'Marcado' : 'Marcar'}
              </button>
            </div>
            <h3 className="text-3xl font-serif font-medium text-zinc-900 mb-6">{lesson.title}</h3>
            <p className="text-zinc-600 text-lg mb-10 leading-relaxed">{lesson.text}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-zinc-50 p-8 rounded-3xl">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                  <Settings2 size={14} /> Ejemplos: {track}
                </h4>
                <ul className="space-y-4">
                  {lesson.examples[track].map((ex, j) => (
                    <li key={j} className="text-zinc-700 flex items-start gap-3 text-sm">
                      <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full mt-1.5 flex-shrink-0" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-2 border-dashed border-zinc-100 p-8 rounded-3xl">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Micro-entregable
                </h4>
                <p className="text-zinc-500 italic text-sm leading-relaxed">{lesson.check}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const Pistas = ({ track, setTrack }: { track: Track, setTrack: (t: Track) => void }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(PISTA_STEPS[track].length).fill(''));
  const currentSteps = PISTA_STEPS[track];

  const updateAnswer = (val: string) => {
    const newAnswers = [...answers];
    newAnswers[step] = val;
    setAnswers(newAnswers);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto py-24 px-6"
    >
      <header className="mb-16 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif font-medium text-zinc-900 mb-4">Pistas</h1>
          <p className="text-zinc-500">Secuencia guiada para tu track: {track}.</p>
        </div>
        <TrackSelector track={track} setTrack={setTrack} />
      </header>

      <div className="bg-white border border-zinc-100 rounded-[48px] p-12 shadow-2xl relative min-h-[500px] flex flex-col">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-zinc-50 rounded-t-[48px] overflow-hidden">
          <motion.div 
            className="h-full bg-zinc-900"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / currentSteps.length) * 100}%` }}
          />
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="text-zinc-300 font-mono text-sm tracking-widest uppercase">Paso {step + 1} de {currentSteps.length}</div>
              <h3 className="text-4xl font-serif font-medium text-zinc-900 leading-tight">
                {currentSteps[step].question}
              </h3>
              <textarea
                value={answers[step]}
                onChange={(e) => updateAnswer(e.target.value)}
                placeholder={currentSteps[step].placeholder}
                className="w-full bg-zinc-50 border border-zinc-100 rounded-3xl p-8 text-lg focus:outline-none focus:border-zinc-300 transition-all min-h-[200px] resize-none"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center mt-12">
          <button
            disabled={step === 0}
            onClick={() => setStep(s => s - 1)}
            className="p-4 rounded-full bg-zinc-100 text-zinc-400 disabled:opacity-30 hover:bg-zinc-200 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex gap-2">
            {currentSteps.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-zinc-900 w-6' : 'bg-zinc-200'}`} />
            ))}
          </div>

          <button
            disabled={step === currentSteps.length - 1}
            onClick={() => setStep(s => s + 1)}
            className="p-4 rounded-full bg-zinc-900 text-white disabled:opacity-30 hover:scale-105 transition-all shadow-lg"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Lab = ({ track }: { track: Track }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([{ id: '1', verbo: '', objeto: '' }]);
  const [prioritization, setPrioritization] = useState<PrioritizationItem[]>([
    { id: '1', name: '', impacto: 3, esfuerzo: 3, riesgo: 3, nota: '' }
  ]);
  const [sipoc, setSipoc] = useState<SipocData>({
    suppliers: '',
    inputs: '',
    process: '',
    outputs: '',
    customers: ''
  });
  const [aiLog, setAiLog] = useState({
    model: 'Gemini 3.1 Pro',
    objective: '',
    prompt: '',
    result: '',
    changes: '',
    verification: ''
  });

  const addInventory = () => setInventory([...inventory, { id: Date.now().toString(), verbo: '', objeto: '' }]);
  const removeInventory = (id: string) => setInventory(inventory.filter(i => i.id !== id));
  
  const addPrioritization = () => setPrioritization([...prioritization, { id: Date.now().toString(), name: '', impacto: 3, esfuerzo: 3, riesgo: 3, nota: '' }]);
  const removePrioritization = (id: string) => setPrioritization(prioritization.filter(i => i.id !== id));

  const exportMarkdown = () => {
    let md = `# Entregable MicroDSI · M2-S10 · Track: ${track.toUpperCase()}\n\n`;
    
    md += `## 1) Inventario (L1) — “Verbo + Objeto”\n`;
    inventory.forEach((item, i) => {
      if (item.verbo && item.objeto) md += `${i + 1}. ${item.verbo} ${item.objeto}\n`;
    });
    
    md += `\n## 2) Priorización (Top 5)\n`;
    md += `| Proceso | Impacto | Esfuerzo | Riesgo | Score | Nota |\n| --- | --- | --- | --- | --- | --- |\n`;
    prioritization.forEach(item => {
      if (item.name) {
        const score = item.impacto - item.esfuerzo - item.riesgo;
        md += `| ${item.name} | ${item.impacto} | ${item.esfuerzo} | ${item.riesgo} | ${score} | ${item.nota} |\n`;
      }
    });
    
    md += `\n## 3) SIPOC (Proceso Ganador)\n`;
    md += `### Suppliers\n${sipoc.suppliers}\n\n`;
    md += `### Inputs\n${sipoc.inputs}\n\n`;
    md += `### Process\n${sipoc.process}\n\n`;
    md += `### Outputs\n${sipoc.outputs}\n\n`;
    md += `### Customers\n${sipoc.customers}\n\n`;

    md += `## Decisión Final\n`;
    const winner = prioritization[0]?.name || "N/A";
    md += `- **Proceso ganador:** ${winner}\n`;
    md += `- **Criterio 1:** Prioridad por impacto\n`;
    md += `- **Criterio 2:** Viabilidad técnica\n`;
    md += `- **Restricción dominante:** PII / Compliance\n`;
    md += `- **Trade-off:** Velocidad vs Calidad de datos\n\n`;

    md += `## AI Log\n`;
    md += `1. **Herramienta / modelo:** ${aiLog.model}\n`;
    md += `2. **Objetivo del prompt:** ${aiLog.objective}\n`;
    md += `3. **Prompt usado:** ${aiLog.prompt}\n`;
    md += `4. **Qué devolvió:** ${aiLog.result}\n`;
    md += `5. **Qué cambié yo:** ${aiLog.changes}\n`;
    md += `6. **Qué verifiqué:** ${aiLog.verification}\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `entregable-microdsi-${track}.md`;
    a.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto py-24 px-6 pb-48"
    >
      <header className="mb-20 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif font-medium text-zinc-900 mb-4">Laboratorio</h1>
          <p className="text-zinc-500">Fabrica tu entregable para el track: <span className="text-zinc-900 font-bold uppercase">{track}</span>.</p>
        </div>
        <button 
          onClick={exportMarkdown}
          className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-medium hover:bg-zinc-800 transition-all shadow-xl flex items-center gap-3 group"
        >
          <Download size={20} /> Generar y Descargar .md
        </button>
      </header>

      <div className="space-y-24">
        {/* Section 1: Inventory */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-serif font-medium text-zinc-900">1) Inventario (L1)</h2>
            <button onClick={addInventory} className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-all">
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-4">
            {inventory.map((item, idx) => (
              <div key={item.id} className="flex gap-4 items-center group">
                <span className="w-8 text-zinc-300 font-mono text-xs font-bold">{idx + 1}.</span>
                <input 
                  placeholder="Verbo (ej. Validar)" 
                  value={item.verbo}
                  onChange={e => setInventory(inventory.map(i => i.id === item.id ? { ...i, verbo: e.target.value } : i))}
                  className="flex-1 bg-white border border-zinc-100 rounded-2xl px-6 py-3 text-sm focus:outline-none focus:border-zinc-300 shadow-sm"
                />
                <input 
                  placeholder="Objeto (ej. Factura)" 
                  value={item.objeto}
                  onChange={e => setInventory(inventory.map(i => i.id === item.id ? { ...i, objeto: e.target.value } : i))}
                  className="flex-1 bg-white border border-zinc-100 rounded-2xl px-6 py-3 text-sm focus:outline-none focus:border-zinc-300 shadow-sm"
                />
                <button 
                  onClick={() => removeInventory(item.id)} 
                  className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-rose-500 transition-all p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Prioritization */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-serif font-medium text-zinc-900">2) Priorización (Top 5)</h2>
            <button onClick={addPrioritization} className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-all">
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-8">
            {prioritization.map((item, idx) => (
              <div key={item.id} className="p-10 bg-white border border-zinc-100 rounded-[40px] shadow-sm relative group">
                <div className="flex gap-6 mb-10">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3 block">Nombre del Proceso</label>
                    <input 
                      placeholder="Ej: Triage de Incidentes Críticos" 
                      value={item.name}
                      onChange={e => setPrioritization(prioritization.map(p => p.id === item.id ? { ...p, name: e.target.value } : p))}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-3 text-sm focus:outline-none focus:border-zinc-300"
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3 block">Score</label>
                    <div className="h-[46px] flex items-center justify-center bg-zinc-900 text-white rounded-2xl font-mono text-xl">
                      {item.impacto - item.esfuerzo - item.riesgo}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">
                  {[
                    { key: 'impacto', label: 'Impacto', color: 'accent-emerald-500' },
                    { key: 'esfuerzo', label: 'Esfuerzo', color: 'accent-amber-500' },
                    { key: 'riesgo', label: 'Riesgo', color: 'accent-rose-500' }
                  ].map(attr => (
                    <div key={attr.key}>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
                        <span>{attr.label}</span>
                        <span className="text-zinc-900">{item[attr.key as keyof PrioritizationItem]}</span>
                      </div>
                      <input 
                        type="range" min="1" max="5" 
                        value={item[attr.key as keyof PrioritizationItem]}
                        onChange={e => setPrioritization(prioritization.map(p => p.id === item.id ? { ...p, [attr.key]: parseInt(e.target.value) } : p))}
                        className={`w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer ${attr.color}`}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3 block">Nota (Dato o Condición)</label>
                  <input 
                    placeholder="Ej: 500 tickets/mes, requiere PII..." 
                    value={item.nota}
                    onChange={e => setPrioritization(prioritization.map(p => p.id === item.id ? { ...p, nota: e.target.value } : p))}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-3 text-sm focus:outline-none focus:border-zinc-300"
                  />
                </div>

                {prioritization.length > 1 && (
                  <button 
                    onClick={() => removePrioritization(item.id)} 
                    className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-rose-500 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: SIPOC */}
        <section>
          <h2 className="text-3xl font-serif font-medium text-zinc-900 mb-10">3) SIPOC (Proceso Ganador)</h2>
          <div className="grid grid-cols-1 gap-8">
            {[
              { id: 'suppliers', label: 'Suppliers', placeholder: '¿Quién entrega la información?' },
              { id: 'inputs', label: 'Inputs', placeholder: '¿Qué se necesita para empezar?' },
              { id: 'process', label: 'Process (4-6 pasos)', placeholder: '1. Recibir...\n2. Validar...\n3. ...' },
              { id: 'outputs', label: 'Outputs', placeholder: '¿Qué se obtiene al final?' },
              { id: 'customers', label: 'Customers', placeholder: '¿Quién recibe el resultado?' },
            ].map(field => (
              <div key={field.id} className="bg-white border border-zinc-100 rounded-[32px] p-8 shadow-sm">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4 block">{field.label}</label>
                <textarea 
                  placeholder={field.placeholder}
                  value={sipoc[field.id as keyof SipocData]}
                  onChange={e => setSipoc({ ...sipoc, [field.id]: e.target.value })}
                  className="w-full bg-transparent text-zinc-900 text-lg focus:outline-none min-h-[100px] resize-none leading-relaxed"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: AI Log */}
        <section className="bg-zinc-900 text-white rounded-[48px] p-12 shadow-2xl">
          <h2 className="text-3xl font-serif font-medium mb-10">AI Log (Evidencia)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              { id: 'objective', label: 'Objetivo del Prompt', placeholder: '¿Qué querías conseguir?' },
              { id: 'prompt', label: 'Prompt Usado', placeholder: 'Copia aquí tu prompt...' },
              { id: 'result', label: 'Qué Devolvió', placeholder: 'Resumen de la respuesta...' },
              { id: 'changes', label: 'Qué Cambié Yo', placeholder: 'Tus correcciones...' },
              { id: 'verification', label: 'Qué Verifiqué', placeholder: 'Tus comprobaciones...' },
            ].map(field => (
              <div key={field.id}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 block">{field.label}</label>
                <textarea 
                  placeholder={field.placeholder}
                  value={aiLog[field.id as keyof typeof aiLog]}
                  onChange={e => setAiLog({ ...aiLog, [field.id]: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-white/30 min-h-[120px] resize-none text-zinc-300"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<View>('home');
  const [track, setTrack] = useState<Track>('itsm');

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  return (
    <div className="min-h-screen bg-[#fcfcf9] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <div key="home">
            <Home setView={setView} />
          </div>
        )}
        {view === 'feed' && (
          <div key="feed">
            <Feed track={track} setTrack={setTrack} />
          </div>
        )}
        {view === 'pistas' && (
          <div key="pistas">
            <Pistas track={track} setTrack={setTrack} />
          </div>
        )}
        {view === 'lab' && (
          <div key="lab">
            <Lab track={track} />
          </div>
        )}
      </AnimatePresence>

      <Navbar currentView={view} setView={setView} />
      
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-zinc-100 rounded-full blur-[160px] opacity-40" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-amber-50 rounded-full blur-[160px] opacity-40" />
      </div>

      {/* Track Indicator (Floating) */}
      {view !== 'home' && (
        <div className="fixed top-6 right-6 z-50">
          <div className="px-4 py-2 bg-white/80 backdrop-blur-md border border-zinc-200 rounded-full shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 bg-zinc-900 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Track: {track}</span>
          </div>
        </div>
      )}
    </div>
  );
}
