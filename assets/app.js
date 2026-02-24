// --- Data ---
const LESSONS = [
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

const PISTA_STEPS = {
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

// --- State Management ---
let currentTrack = localStorage.getItem('microdsi_track') || 'itsm';
let currentStep = 0;
let answers = JSON.parse(localStorage.getItem('microdsi_answers') || '[]');

// --- Shared Functions ---
function setTrack(track) {
    currentTrack = track;
    localStorage.setItem('microdsi_track', track);
    renderContent();
}

function renderContent() {
    const path = window.location.pathname;
    if (path.includes('feed.html')) renderFeed();
    if (path.includes('pista.htm')) renderPistas();
}

// --- Feed Logic ---
function renderFeed() {
    const container = document.getElementById('feed-container');
    if (!container) return;

    container.innerHTML = LESSONS.map((lesson, idx) => `
        <div class="lesson-card">
            <span class="tag">${lesson.tag}</span>
            <h3>${lesson.title}</h3>
            <p class="text">${lesson.text}</p>
            <div class="lesson-details">
                <div>
                    <h4>Ejemplos: ${currentTrack}</h4>
                    <ul>
                        ${lesson.examples[currentTrack].map(ex => `<li>${ex}</li>`).join('')}
                    </ul>
                </div>
                <div class="check-box">
                    <h4>Micro-entregable</h4>
                    <p>${lesson.check}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// --- Pistas Logic ---
function renderPistas() {
    const container = document.getElementById('step-content');
    if (!container) return;

    const steps = PISTA_STEPS[currentTrack];
    const step = steps[currentStep];

    // Ensure answers array is long enough
    if (answers.length < steps.length) {
        answers = new Array(steps.length).fill('');
    }

    container.innerHTML = `
        <div class="step-meta">Paso ${currentStep + 1} de ${steps.length}</div>
        <h3>${step.question}</h3>
        <textarea id="step-answer" placeholder="${step.placeholder}">${answers[currentStep] || ''}</textarea>
    `;

    document.getElementById('step-answer').addEventListener('input', (e) => {
        answers[currentStep] = e.target.value;
        localStorage.setItem('microdsi_answers', JSON.stringify(answers));
    });

    // Update UI
    document.getElementById('progress-bar').style.width = `${((currentStep + 1) / steps.length) * 100}%`;
    document.getElementById('prev-step').disabled = currentStep === 0;
    document.getElementById('next-step').innerText = currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente';
    
    const indicator = document.getElementById('step-indicator');
    indicator.innerHTML = steps.map((_, i) => `<div class="dot ${i === currentStep ? 'active' : ''}"></div>`).join('');
}

// --- Lab Logic ---
let inventory = [{ id: 1, verbo: '', objeto: '' }];
let prioritization = [{ id: 1, name: '', impacto: 3, esfuerzo: 3, riesgo: 3, nota: '' }];

function renderLab() {
    renderInventory();
    renderPrioritization();
}

function renderInventory() {
    const list = document.getElementById('inventory-list');
    if (!list) return;
    list.innerHTML = inventory.map((item, idx) => `
        <div class="inventory-item">
            <span class="item-num">${idx + 1}.</span>
            <input type="text" placeholder="Verbo" value="${item.verbo}" oninput="updateInventory(${item.id}, 'verbo', this.value)">
            <input type="text" placeholder="Objeto" value="${item.objeto}" oninput="updateInventory(${item.id}, 'objeto', this.value)">
            <button class="btn-icon" onclick="removeInventory(${item.id})">×</button>
        </div>
    `).join('');
}

function updateInventory(id, field, value) {
    const item = inventory.find(i => i.id === id);
    if (item) item[field] = value;
}

function removeInventory(id) {
    if (inventory.length > 1) {
        inventory = inventory.filter(i => i.id !== id);
        renderInventory();
    }
}

function renderPrioritization() {
    const list = document.getElementById('prioritization-list');
    if (!list) return;
    list.innerHTML = prioritization.map((item, idx) => `
        <div class="prioritization-card">
            <div class="card-header">
                <input type="text" placeholder="Nombre del proceso" value="${item.name}" oninput="updatePrioritization(${item.id}, 'name', this.value)">
                <div class="score-badge">${item.impacto - item.esfuerzo - item.riesgo}</div>
            </div>
            <div class="sliders-grid">
                <div class="slider-group">
                    <label>Impacto <span>${item.impacto}</span></label>
                    <input type="range" min="1" max="5" value="${item.impacto}" oninput="updatePrioritization(${item.id}, 'impacto', parseInt(this.value))">
                </div>
                <div class="slider-group">
                    <label>Esfuerzo <span>${item.esfuerzo}</span></label>
                    <input type="range" min="1" max="5" value="${item.esfuerzo}" oninput="updatePrioritization(${item.id}, 'esfuerzo', parseInt(this.value))">
                </div>
                <div class="slider-group">
                    <label>Riesgo <span>${item.riesgo}</span></label>
                    <input type="range" min="1" max="5" value="${item.riesgo}" oninput="updatePrioritization(${item.id}, 'riesgo', parseInt(this.value))">
                </div>
            </div>
            <input type="text" class="note-input" placeholder="Nota (Dato o Condición)" value="${item.nota}" oninput="updatePrioritization(${item.id}, 'nota', this.value)">
            <button class="btn-icon" style="position: absolute; top: 10px; right: 10px;" onclick="removePrioritization(${item.id})">×</button>
        </div>
    `).join('');
}

function updatePrioritization(id, field, value) {
    const item = prioritization.find(i => i.id === id);
    if (item) {
        item[field] = value;
        renderPrioritization();
    }
}

function removePrioritization(id) {
    if (prioritization.length > 1) {
        prioritization = prioritization.filter(i => i.id !== id);
        renderPrioritization();
    }
}

function exportMarkdown() {
    const sipoc = {
        suppliers: document.getElementById('sipoc-suppliers').value,
        inputs: document.getElementById('sipoc-inputs').value,
        process: document.getElementById('sipoc-process').value,
        outputs: document.getElementById('sipoc-outputs').value,
        customers: document.getElementById('sipoc-customers').value
    };

    const aiLog = {
        objective: document.getElementById('ai-objective').value,
        prompt: document.getElementById('ai-prompt').value,
        result: document.getElementById('ai-result').value,
        changes: document.getElementById('ai-changes').value,
        verification: document.getElementById('ai-verification').value
    };

    let md = `# Entregable MicroDSI · M2-S10 · Track: ${currentTrack.toUpperCase()}\n\n`;
    
    md += `## 1) Inventario (L1)\n`;
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

    md += `## AI Log\n`;
    md += `- **Objetivo:** ${aiLog.objective}\n`;
    md += `- **Prompt:** ${aiLog.prompt}\n`;
    md += `- **Resultado:** ${aiLog.result}\n`;
    md += `- **Cambios:** ${aiLog.changes}\n`;
    md += `- **Verificación:** ${aiLog.verification}\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `entregable-microdsi-${currentTrack}.md`;
    a.click();
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const trackSelect = document.getElementById('track-select');
    if (trackSelect) {
        trackSelect.value = currentTrack;
        trackSelect.addEventListener('change', (e) => setTrack(e.target.value));
    }

    const prevBtn = document.getElementById('prev-step');
    const nextBtn = document.getElementById('next-step');
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                renderPistas();
            }
        });
        nextBtn.addEventListener('click', () => {
            const steps = PISTA_STEPS[currentTrack];
            if (currentStep < steps.length - 1) {
                currentStep++;
                renderPistas();
            } else {
                window.location.href = 'lab.html';
            }
        });
    }

    const addInvBtn = document.getElementById('add-inventory');
    if (addInvBtn) addInvBtn.addEventListener('click', () => {
        inventory.push({ id: Date.now(), verbo: '', objeto: '' });
        renderInventory();
    });

    const addPrioBtn = document.getElementById('add-prioritization');
    if (addPrioBtn) addPrioBtn.addEventListener('click', () => {
        prioritization.push({ id: Date.now(), name: '', impacto: 3, esfuerzo: 3, riesgo: 3, nota: '' });
        renderPrioritization();
    });

    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportMarkdown);

    renderContent();
    if (window.location.pathname.includes('lab.html')) renderLab();
});
