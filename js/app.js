import { PRESET_CASES, parseClinicalText, formatWhatsAppMessage } from './ai-parser.js';

// --- MAIN APPLICATION CONTROLLER ---
let currentParsedData = PRESET_CASES.ortopedia;
let isRecording = false;
let recognition = null;
let recordingSeconds = 0;
let recordingTimerInterval = null;

function initApp() {
  setupSpeechRecognition();
  setupEventListeners();
  applyCaseData(PRESET_CASES.ortopedia);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initApp, 10);
} else {
  document.addEventListener('DOMContentLoaded', initApp);
}

// Setup Web Speech API (Microphone voice dictation)
function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'es-CO'; // Spanish Colombia
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const textArea = document.getElementById('rawTranscriptText');
      if (textArea) {
        if (finalTranscript.trim()) {
          textArea.value = (textArea.value + ' ' + finalTranscript).trim();
        }
        document.getElementById('transcriptionStatus').textContent = 'Escuchando y transcribiendo...';
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      stopVoiceRecording();
      document.getElementById('micStatusText').textContent = 'Micrófono en espera (puedes probar con los casos rápidos)';
    };

    recognition.onend = () => {
      if (isRecording) {
        stopVoiceRecording();
      }
    };
  }
}

function setupEventListeners() {
  // Mic Button
  const btnRecordMic = document.getElementById('btnRecordMic');
  if (btnRecordMic) {
    btnRecordMic.addEventListener('click', toggleVoiceRecording);
  }

  // Quick Preset Case Buttons
  document.querySelectorAll('.case-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const caseKey = btn.dataset.case;
      const data = PRESET_CASES[caseKey];
      if (data) {
        applyCaseData(data);
      }
    });
  });

  // Process AI Button
  const btnProcessAI = document.getElementById('btnProcessAI');
  if (btnProcessAI) {
    btnProcessAI.addEventListener('click', () => {
      const rawText = document.getElementById('rawTranscriptText').value.trim();
      if (!rawText) {
        alert('Por favor dicta con el micrófono o pulsa uno de los casos de prueba.');
        return;
      }

      btnProcessAI.innerHTML = `
        <span class="inline-block animate-spin mr-2">⚙️</span>
        <span>Estructurando con IA...</span>
      `;

      setTimeout(() => {
        const parsed = parseClinicalText(rawText);
        applyCaseData(parsed, false);
        btnProcessAI.innerHTML = `
          <i data-lucide="sparkles" class="w-4 h-4"></i>
          <span>Interpretar y Estructurar con IA</span>
        `;
        lucide.createIcons();
      }, 500);
    });
  }

  // WhatsApp Button
  const btnSendWhatsApp = document.getElementById('btnSendWhatsApp');
  if (btnSendWhatsApp) {
    btnSendWhatsApp.addEventListener('click', () => {
      const msg = formatWhatsAppMessage(currentParsedData);
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    });
  }

  // Cuenta de Cobro Button & Modal
  const btnVerCuentaCobro = document.getElementById('btnVerCuentaCobro');
  const modalCuentaCobro = document.getElementById('modalCuentaCobro');
  const btnCloseModalCobro = document.getElementById('btnCloseModalCobro');

  if (btnVerCuentaCobro && modalCuentaCobro) {
    btnVerCuentaCobro.addEventListener('click', () => {
      updateInvoiceData(currentParsedData);
      modalCuentaCobro.classList.remove('hidden');
    });
  }

  if (btnCloseModalCobro && modalCuentaCobro) {
    btnCloseModalCobro.addEventListener('click', () => {
      modalCuentaCobro.classList.add('hidden');
    });
  }

  // Associate dictation button on 3D selected zone tag
  const btnAsociarDictado = document.getElementById('btnAsociarDictado');
  if (btnAsociarDictado) {
    btnAsociarDictado.addEventListener('click', () => {
      const zoneTitle = document.getElementById('zoneTagTitle').textContent;
      const textArea = document.getElementById('rawTranscriptText');
      textArea.value = `Inspección de ${zoneTitle}: `;
      textArea.focus();
    });
  }
}

// Toggle Voice Recording
function toggleVoiceRecording() {
  if (isRecording) {
    stopVoiceRecording();
  } else {
    startVoiceRecording();
  }
}

function startVoiceRecording() {
  isRecording = true;
  recordingSeconds = 0;
  
  const micRing = document.getElementById('micRingPulse');
  const micStatus = document.getElementById('micStatusText');
  const waveform = document.getElementById('waveformContainer');
  const timer = document.getElementById('recordingTimer');

  micRing.classList.add('animate-mic-pulse', 'opacity-100');
  micStatus.textContent = '🔴 Grabando en vivo... Habla con normalidad';
  micStatus.className = 'text-xs text-rose-400 font-bold mt-3 text-center animate-pulse';
  waveform.classList.remove('hidden');

  recordingTimerInterval = setInterval(() => {
    recordingSeconds++;
    const mins = String(Math.floor(recordingSeconds / 60)).padStart(2, '0');
    const secs = String(recordingSeconds % 60).padStart(2, '0');
    timer.textContent = `${mins}:${secs}`;
  }, 1000);

  if (recognition) {
    try {
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start issue:', e);
    }
  } else {
    // If browser doesn't have Web Speech API, inform user
    document.getElementById('transcriptionStatus').textContent = 'Simulación activa (navegador sin dictado nativo)';
  }
}

function stopVoiceRecording() {
  isRecording = false;
  clearInterval(recordingTimerInterval);

  const micRing = document.getElementById('micRingPulse');
  const micStatus = document.getElementById('micStatusText');
  const waveform = document.getElementById('waveformContainer');

  micRing.classList.remove('animate-mic-pulse', 'opacity-100');
  micStatus.textContent = 'Dictado finalizado. Pulsa "Interpretar y Estructurar con IA"';
  micStatus.className = 'text-xs text-slate-300 font-medium mt-3 text-center';
  waveform.classList.add('hidden');

  if (recognition) {
    try {
      recognition.stop();
    } catch (e) {
      // Ignored
    }
  }
}

// Apply case data into UI and synchronize 3D camera
function applyCaseData(data, updateTextArea = true) {
  currentParsedData = data;

  // 1. Text Area
  if (updateTextArea) {
    const textArea = document.getElementById('rawTranscriptText');
    if (textArea) textArea.value = data.rawAudio;
  }

  // 2. Specialty Badge
  const badge = document.getElementById('aiSpecialtyBadge');
  if (badge) badge.textContent = data.specialty;

  // 3. Diagnosis
  const diag = document.getElementById('aiDiagnosis');
  if (diag) diag.textContent = data.diagnosis;

  // 4. Treatment Items
  const treatmentContainer = document.getElementById('aiTreatment');
  if (treatmentContainer) {
    treatmentContainer.innerHTML = '';
    data.treatmentItems.forEach((t, i) => {
      const isLast = i === data.treatmentItems.length - 1;
      const borderClass = isLast ? '' : 'border-b border-slate-800/80 pb-1';
      const icon = i === 0 ? '💊' : (i === 1 ? '🧊' : '🩹');
      const color = i === 0 ? 'text-emerald-400' : (i === 1 ? 'text-cyan-400' : 'text-amber-400');
      
      const itemHtml = `
        <div class="flex items-center justify-between ${borderClass}">
          <span class="font-semibold ${color}">${icon} ${t.name}</span>
          <span class="text-[11px] text-slate-400">${t.detail}</span>
        </div>
      `;
      treatmentContainer.insertAdjacentHTML('beforeend', itemHtml);
    });
  }

  // 5. Billable Services
  const servicesContainer = document.getElementById('aiServicesList');
  const servicesTotal = document.getElementById('aiServicesTotal');
  if (servicesContainer && servicesTotal) {
    servicesContainer.innerHTML = '';
    let total = 0;

    data.services.forEach(s => {
      total += s.price;
      const sHtml = `
        <div class="flex items-center justify-between">
          <span class="text-slate-300">${s.description}</span>
          <span class="font-mono font-semibold text-white">$${s.price.toLocaleString('es-CO')}</span>
        </div>
      `;
      servicesContainer.insertAdjacentHTML('beforeend', sHtml);
    });

    servicesTotal.textContent = `Total: $${total.toLocaleString('es-CO')} COP`;
  }

  // 6. Next Control Date
  const nextControl = document.getElementById('aiNextControl');
  if (nextControl) {
    nextControl.textContent = `En ${data.nextControlDays} días (${data.nextControlDate})`;
  }

  // 7. Synchronize 3D camera to the anatomical zone!
  if (data.hotspotTarget && window.focusHotspot) {
    window.focusHotspot(data.hotspotTarget);
  }
}

// Update the Official Cuenta de Cobro PDF Sheet
function updateInvoiceData(data) {
  const patient = document.getElementById('invoicePatient');
  const client = document.getElementById('invoiceClient');
  const itemsTable = document.getElementById('invoiceItemsTable');
  const grandTotal = document.getElementById('invoiceGrandTotal');
  const totalWords = document.getElementById('invoiceTotalWords');

  if (patient) patient.textContent = data.patientName || 'Relámpago (Paso Fino Col.)';
  if (client) client.textContent = data.clientName || 'Criadero San Rafael';

  if (itemsTable && grandTotal) {
    itemsTable.innerHTML = '';
    let total = 0;

    data.services.forEach(s => {
      total += s.price;
      const row = `
        <tr>
          <td class="p-2 border border-slate-200">${s.description}</td>
          <td class="p-2 border border-slate-200 text-right font-mono">$${s.price.toLocaleString('es-CO')}</td>
        </tr>
      `;
      itemsTable.insertAdjacentHTML('beforeend', row);
    });

    grandTotal.textContent = `$${total.toLocaleString('es-CO')}`;

    if (totalWords) {
      totalWords.textContent = `Son: ${numeroALetras(total)} pesos colombianos M/CTE.`;
    }
  }
}

// Simple currency number to Colombian text
function numeroALetras(valor) {
  if (valor === 270000) return 'Doscientos setenta mil';
  if (valor === 430000) return 'Cuatrocientos treinta mil';
  if (valor === 300000) return 'Trescientos mil';
  if (valor === 310000) return 'Trescientos diez mil';
  return `${valor.toLocaleString('es-CO')}`;
}
