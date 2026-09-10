# 🐎 RampVet 3D · Plataforma Clínica Veterinaria con IA y Atlas 3D

Prototipo interactivo de alta fidelidad diseñado para médicos veterinarios de grandes especies (equinos y bovinos) en Colombia.

---

## 🌟 Características Principales

1. **Atlas Anatómico 3D Interactivo (Three.js):**
   * Visualización tridimensional de anatomía equina y bovina.
   * Órbita 360°, zoom táctil y selección de cámaras rápidas (Lateral, Anterior/Cabeza, Posterior, Miembro Anterior).
   * **Hotspots / Puntos de interés 3D interactivos:** Detección de lesiones y clics con sincronización inmediata a la historia clínica.
2. **Dictado por Voz Manos Libres en Campo (Web Speech API):**
   * El veterinario puede dictar directamente desde su celular con manos libres y sucias.
   * Modos de prueba rápida con 4 casos clínicos reales:
     * 🦵 **Ortopedia:** Claudicación en miembro anterior izquierdo y prueba de flexión.
     * ⚠️ **Cólico Agudo:** Evaluación de flanco derecho y dolor abdominal.
     * 🦷 **Odontología:** Puntas de esmalte y ganchos premolares.
     * 🧬 **Reproducción:** Folículo preovulatorio y ecografía reproductiva.
3. **Estructuración con Inteligencia Artificial (IA Core):**
   * Extracción automática de diagnóstico presuntivo, plan terapéutico con dosis y vías de administración.
   * Detección automática de servicios clínicos para cobro en pesos colombianos ($ COP).
   * Programación de próximo control.
4. **Exportación Inmediata:**
   * 💬 **Botón de WhatsApp:** Envía el resumen médico formateado al dueño de la finca en 1 clic.
   * 📄 **Cuenta de Cobro Oficial en PDF:** Formato listo para impresión y cobro según la legislación colombiana (consecutivo, desglose de ítems, cuentas bancarias Bancolombia/Nequi y firma).

---

## 🚀 Cómo Ejecutar Localmente

```bash
cd e:\apps\vet3d-demo
node server.js
```
Abre en tu navegador o celular: **`http://localhost:3000`**

---

Desarrollado por **Christian Felipe Reyes** (`Christancho-co`).
