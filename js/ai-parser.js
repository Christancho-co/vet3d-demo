// RampVet 3D - AI Clinical Structuring Engine
// Simula el procesamiento de VetGeni / LLM estructurado en español veterinario

export const PRESET_CASES = {
  ortopedia: {
    rawAudio: "Caballo cuarto de milla, 5 años. Presenta claudicación grado 2 en mano izquierda. A la flexión forzada de menudillo manifiesta dolor agudo y leve efusión sinovial en vaina digital flexora. Sospecha de desmitis incipiente del ligamento anular. Tratamiento: aplicar Fenilbutazona 20% 10 ml IV inicial y luego 5 ml cada 24 horas por 4 días. Aplicar frío local con hielo 20 minutos 3 veces al día y vendaje compresivo de descanso. Reposo absoluto en pesebrera. Programar control ecográfico en 5 días.",
    specialty: "Ortopedia & Podología Equina",
    hotspotTarget: "ortopedia",
    patientName: "Relámpago (Paso Fino Col.)",
    clientName: "Criadero San Rafael",
    diagnosis: "Claudicación grado 2 en miembro anterior izquierdo (mano izq). Efusión sinovial en vaina digital y dolor a la flexión forzada de menudillo. Presunta desmitis del ligamento anular.",
    treatmentItems: [
      { name: "Fenilbutazona 20%", detail: "10 ml IV inicial, luego 5 ml c/24h x 4 días" },
      { name: "Crioterapia con Hielo", detail: "Aplicación local 20 minutos, 3 veces al día" },
      { name: "Vendaje de Descanso", detail: "Compresivo suave + reposo estricto en pesebrera" }
    ],
    services: [
      { description: "Consulta especializada en ortopedia y claudicación equina", price: 150000 },
      { description: "Prueba de flexión forzada y bloqueo diagnóstico local", price: 120000 }
    ],
    nextControlDays: 5,
    nextControlDate: "15 de Septiembre de 2026"
  },

  colico: {
    rawAudio: "Yegua de 7 años presenta dolor abdominal agudo moderado a severo de 3 horas de evolución. Escarba el piso, se mira continuamente el flanco derecho y se echa con timpanismo cecal incipiente. Frecuencia cardíaca 52 lpm, mucosas congestivas rosadas, tiempo de llenado capilar 2 segundos. Borborigmos disminuidos en cuadrante superior derecho. Palpación transrectal: distensión moderada del ciego sin torsión de colon. Sondaje nasogástrico sin reflujo neto. Tratamiento: Dipirona con N-Butilhioscina 25 ml intravenosa lento, Flunixin Meglumine 10 ml IV y fluidoterapia con 15 litros de Ringer Lactato. Suspensión total de alimento concentrado y forraje por 12 horas. Caminatas de 15 minutos cada hora. Control en 6 horas.",
    specialty: "Clínica Médica / Síndrome Abdominal Agudo (Cólico)",
    hotspotTarget: "colico",
    patientName: "Gitana (Yegua Criolla)",
    clientName: "Pesebreras La Querencia",
    diagnosis: "Síndrome Abdominal Agudo (Cólico espasmódico / timpanismo cecal leve sin compromiso estrangulante). Motilidad intestinal disminuida.",
    treatmentItems: [
      { name: "Dipirona + N-Butilhioscina", detail: "25 ml IV lento como antiespasmódico" },
      { name: "Flunixin Meglumine 50mg/ml", detail: "10 ml IV dosis única analgésica visceral" },
      { name: "Fluidoterapia Ringer Lactato", detail: "15 Litros IV a flujo continuo de soporte" },
      { name: "Manejo de Pesebrera", detail: "Ayuno de grano y pasto x 12h, caminatas de 15 min" }
    ],
    services: [
      { description: "Atención de urgencia por cólico equino", price: 200000 },
      { description: "Sondaje nasogástrico y lavado gástrico de descompresión", price: 140000 },
      { description: "Protocolo de fluidoterapia intravenosa continua", price: 90000 }
    ],
    nextControlDays: 1,
    nextControlDate: "11 de Septiembre de 2026 (Mañana 6:00 AM)"
  },

  dental: {
    rawAudio: "Caballo reproductor de 8 años con dificultad para masticar grano, deja caer comida en el comedero y presenta cabeceo al contacto con la embocadura. En la exploración odontológica con abrebocas Haussmann se evidencian puntas de esmalte filosas en la arcada maxilar vestibular y primer premolar inferior con ganchos rostrales marcados que causan laceraciones en carrillos. Tratamiento: se realiza odontoplastia y nivelación odontológica motorizada completa, extracción de sarro en caninos y remoción de ganchos. Enjuague bucal antiséptico con clorhexidina al 0.12%. Se recomienda grano remojado por 2 días y retorno al bocado suave en 4 días. Próxima revisión odontológica en 6 meses.",
    specialty: "Odontología Equina Especializada",
    hotspotTarget: "dental",
    patientName: "Don Juan (Trote y Galope)",
    clientName: "Criadero San Rafael",
    diagnosis: "Puntas de esmalte filosas en arcadas maxilares y ganchos rostrales en primer premolar con úlceras en mucosa yugal (carrillos). Mala oclusión masticatoria.",
    treatmentItems: [
      { name: "Odontoplastia Motorizada", detail: "Nivelación completa de arcadas y rebaje de ganchos" },
      { name: "Enjuague con Clorhexidina 0.12%", detail: "Lavados bucales diarios tras la comida x 3 días" },
      { name: "Manejo Nutricional", detail: "Concentrado humedecido y forraje tierno x 48 horas" }
    ],
    services: [
      { description: "Odontología equina completa con equipo rotatorio de carburo", price: 220000 },
      { description: "Sedación profunda para procedimiento dental (Xilacina + Torbugesic)", price: 80000 }
    ],
    nextControlDays: 180,
    nextControlDate: "10 de Marzo de 2027 (Control Semestral)"
  },

  reproduccion: {
    rawAudio: "Yegua de vientre 'Esmeralda' de 6 años evaluada para programa de inseminación artificial. Evaluación ecográfica transrectal: útero con tono normal, edema endometrial grado 3 compatible con celo fértil. Ovario izquierdo en reposo con folículos de 12 mm. Ovario derecho presenta folículo preovulatorio dominante de 39 mm de diámetro, forma aperada, reblandecimiento a la palpación. Apta para servicio de inseminación artificial. Tratamiento: se administra Deslorelina 1.5 mg intramuscular como inductor de la ovulación hoy a las 4:00 PM. Inseminar mañana a las 8:00 AM con semen fresco refrigerado del reproductor 'Rey de Reyes'. Control ecográfico post-ovulación en 48 horas.",
    specialty: "Reproducción Equina / IATF",
    hotspotTarget: "dorso",
    patientName: "Esmeralda (Yegua de Vientre)",
    clientName: "Criadero San Rafael",
    diagnosis: "Celo fértil activo. Folículo preovulatorio dominante de 39 mm en ovario derecho con edema endometrial grado 3. Apta para inseminación.",
    treatmentItems: [
      { name: "Deslorelina Acetato 1.5 mg", detail: "1 dosis IM inductora de ovulación (Hoy 4:00 PM)" },
      { name: "Inseminación con Semen Refrigerado", detail: "Programada para mañana a las 8:00 AM" },
      { name: "Lavado Uterino Post-servicio", detail: "Con solución salina fisiológica según evolución" }
    ],
    services: [
      { description: "Ecografía reproductiva transrectal con transductor lineal", price: 130000 },
      { description: "Procedimiento de inseminación artificial transcervical", price: 180000 }
    ],
    nextControlDays: 2,
    nextControlDate: "12 de Septiembre de 2026 (Ecografía confirmación)"
  }
};

// Natural Language Parser for live voice or user-typed text
export function parseClinicalText(text) {
  const lower = text.toLowerCase();

  // Determine Case
  let matchedKey = 'ortopedia'; // Default

  if (lower.includes('cólico') || lower.includes('colico') || lower.includes('flanco') || lower.includes('abdominal') || lower.includes('ciego') || lower.includes('sondaje')) {
    matchedKey = 'colico';
  } else if (lower.includes('diente') || lower.includes('muela') || lower.includes('odont') || lower.includes('boca') || lower.includes('esmalte') || lower.includes('gancho')) {
    matchedKey = 'dental';
  } else if (lower.includes('útero') || lower.includes('utero') || lower.includes('ecograf') || lower.includes('folículo') || lower.includes('ovario') || lower.includes('inseminaci') || lower.includes('celo')) {
    matchedKey = 'reproduccion';
  } else if (lower.includes('pata') || lower.includes('mano') || lower.includes('cojera') || lower.includes('claudica') || lower.includes('carpo') || lower.includes('nudo') || lower.includes('casco') || lower.includes('tendón') || lower.includes('tendon')) {
    matchedKey = 'ortopedia';
  }

  // Get base structured template
  const template = { ...PRESET_CASES[matchedKey] };
  template.rawAudio = text;

  // Custom text adjustments if user spoke custom sentences
  if (text.length > 30 && !PRESET_CASES[matchedKey].rawAudio.startsWith(text.substring(0, 20))) {
    // User spoke something custom!
    template.diagnosis = `Hallazgo clínico registrado: "${text.substring(0, 120)}..."`;
  }

  return template;
}

// Format structured WhatsApp message for the horse/cow owner
export function formatWhatsAppMessage(data) {
  const totalMoney = data.services.reduce((acc, s) => acc + s.price, 0);
  const formattedTotal = '$' + totalMoney.toLocaleString('es-CO');

  let treatmentsText = '';
  data.treatmentItems.forEach(t => {
    treatmentsText += `• *${t.name}:* ${t.detail}\n`;
  });

  return `🐴 *REPORTE MÉDICO VETERINARIO - RAMPVET 3D*
---------------------------------------
*Paciente:* ${data.patientName}
*Finca/Criadero:* ${data.clientName}
*Fecha:* 10 de Septiembre de 2026
*Especialidad:* ${data.specialty}

🩺 *DIAGNÓSTICO:*
${data.diagnosis}

💊 *TRATAMIENTO Y MEDICAMENTOS:*
${treatmentsText}
📅 *PRÓXIMO CONTROL:*
${data.nextControlDate} (en ${data.nextControlDays} días)

💰 *SERVICIOS APLICADOS HOY:*
Total: ${formattedTotal} COP

---------------------------------------
*Dr. Christian Felipe Reyes*
Médico Veterinario Zootecnista · T.P. 45892
Santa Marta, Colombia`;
}
