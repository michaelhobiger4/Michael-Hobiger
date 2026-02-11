// Konfiguration
const CONFIG = {
    MAX_CHUNK_SIZE: 5000,      // Zeichen pro Chunk
    WARNING_THRESHOLD: 10000,   // Ab wann Warnung angezeigt wird
    MAX_LENGTH: 50000          // Maximale Eingabe
};

// State
let isProcessing = false;

// Elemente
const elements = {
    input: document.getElementById('input'),
    output: document.getElementById('output'),
    charCount: document.getElementById('charCount'),
    progressFill: document.getElementById('progressFill'),
    lengthWarning: document.getElementById('lengthWarning'),
    convertBtn: document.getElementById('convertBtn'),
    btnText: document.getElementById('btnText'),
    btnProgress: document.getElementById('btnProgress'),
    outputProgress: document.getElementById('outputProgress'),
    currentChunk: document.getElementById('currentChunk'),
    totalChunks: document.getElementById('totalChunks'),
    outputProgressFill: document.getElementById('outputProgressFill')
};

// Längen-Check mit Fortschrittsbalken
function checkLength() {
    const length = elements.input.value.length;
    const percentage = (length / CONFIG.MAX_LENGTH) * 100;
    
    // Zähler aktualisieren
    elements.charCount.textContent = length.toLocaleString();
    
    // Fortschrittsbalken
    elements.progressFill.style.width = percentage + '%';
    
    // Farbe ändern bei hoher Auslastung
    elements.progressFill.classList.remove('warning', 'danger');
    if (percentage > 90) {
        elements.progressFill.classList.add('danger');
    } else if (percentage > 70) {
        elements.progressFill.classList.add('warning');
    }
    
    // Warnung anzeigen
    if (length > CONFIG.WARNING_THRESHOLD) {
        elements.lengthWarning.style.display = 'block';
    } else {
        elements.lengthWarning.style.display = 'none';
    }
}

// Text in Chunks aufteilen
function splitIntoChunks(text) {
    const chunks = [];
    for (let i = 0; i < text.length; i += CONFIG.MAX_CHUNK_SIZE) {
        chunks.push(text.slice(i, i + CONFIG.MAX_CHUNK_SIZE));
    }
    return chunks;
}

// Einzelnen Chunk transformieren
function transformChunk(chunk, style) {
    const replacements = {
        natural: {
            'durchführung': 'Umsetzung',
            'hinsichtlich': 'wegen',
            'aufgrund': 'weil',
            'bezüglich': 'zu',
            'des Weiteren': 'außerdem',
            'zudem': 'außerdem',
            'ferner': 'außerdem',
            'somit': 'deshalb',
            'demzufolge': 'deshalb',
            'infolgedessen': 'deshalb',
            'mithin': 'also',
            'demnach': 'also',
            'hierdurch': 'dadurch',
            'wodurch': 'so dass',
            'wobei': 'dabei',
            'im Rahmen': 'bei',
            'unter Berücksichtigung': 'mit',
            'im Hinblick auf': 'für',
            'in Anbetracht': 'wegen',
            'vor dem Hintergrund': 'wegen',
            'im Zuge': 'bei',
            'auf Seiten': 'bei',
            'seitens': 'von',
            'hinsichtlich': 'zu',
            'betreffend': 'zu',
            'in Bezug auf': 'zu',
            'mit Blick auf': 'für',
            'angesichts': 'wegen',
            'aufgrund von': 'wegen',
            'basierend auf': 'auf',
            'im Falle': 'wenn',
            'sofern': 'wenn',
            'soweit': 'wenn',
            'insoweit': 'wenn',
            'insofern': 'wenn',
            'dahingehend': 'so',
            'derart': 'so',
            'dermaßen': 'so'
        },
        professional: {
            'wegen': 'aufgrund',
            'weil': 'aufgrund der Tatsache, dass',
            'außerdem': 'darüber hinaus',
            'deshalb': 'folglich',
            'also': 'demnach',
            'dadurch': 'hierdurch',
            'bei': 'im Rahmen',
            'mit': 'unter Verwendung',
            'für': 'im Hinblick auf'
        },
        simple: {
            'durchführung': 'Durchführung',
            'hinsichtlich': 'zu',
            'aufgrund': 'wegen',
            'bezüglich': 'zu',
            'des Weiteren': 'auch',
            'zudem': 'auch',
            'ferner': 'auch',
            'somit': 'also',
            'demzufolge': 'also',
            'infolgedessen': 'also',
            'mithin': 'also',
            'demnach': 'also',
            'hierdurch': 'damit',
            'wodurch': 'damit',
            'wobei': 'wobei',
            'im Rahmen': 'bei',
            'unter Berücksichtigung': 'mit',
            'im Hinblick auf': 'für',
            'in Anbetracht': 'wegen'
        }
    };
    
    const rules = replacements[style] || replacements.natural;
    let result = chunk;
    
    Object.entries(rules).forEach(([from, to]) => {
        const regex = new RegExp(`\\b${from}\\b`, 'gi');
        result = result.replace(regex, to);
    });
    
    return result;
}

// Haupt-Transformations-Funktion mit Chunking
async function transform() {
    const text = elements.input.value.trim();
    
    if (!text) {
        alert('Bitte geben Sie einen Text ein!');
        return;
    }
    
    if (isProcessing) return;
    isProcessing = true;
    
    // Button-Status
    elements.convertBtn.disabled = true;
    elements.btnText.style.display = 'none';
    elements.btnProgress.style.display = 'flex';
    
    // Style ermitteln
    const style = document.querySelector('input[name="style"]:checked').value;
    
    // In Chunks aufteilen
    const chunks = splitIntoChunks(text);
    const totalChunks = chunks.length;
    
    // Fortschrittsanzeige für Output
    if (totalChunks > 1) {
        elements.outputProgress.style.display = 'block';
        elements.totalChunks.textContent = totalChunks;
    }
    
    // Chunks verarbeiten
    const results = [];
    
    for (let i = 0; i < chunks.length; i++) {
        // Fortschritt aktualisieren
        elements.currentChunk.textContent = i + 1;
        const progress = ((i + 1) / totalChunks) * 100;
        elements.outputProgressFill.style.width = progress + '%';
        
        // Chunk verarbeiten (mit kleiner Pause für UI-Update)
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const transformedChunk = transformChunk(chunks[i], style);
        results.push(transformedChunk);
    }
    
    // Ergebnis anzeigen
    const finalText = results.join('');
    elements.output.innerHTML = '<p>' + escapeHtml(finalText).replace(/\n/g, '<br>') + '</p>';
    
    // Aufräumen
    elements.outputProgress.style.display = 'none';
    elements.convertBtn.disabled = false;
    elements.btnText.style.display = 'block';
    elements.btnProgress.style.display = 'none';
    isProcessing = false;
    
    // Erfolgs-Meldung bei langen Texten
    if (totalChunks > 1) {
        showNotification(`Text erfolgreich verarbeitet! (${totalChunks} Abschnitte)`);
    }
}

// HTML escapen
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #c9a227;
        color: #1a1a1a;
        padding: 15px 20px;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animationen
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Init
checkLength();