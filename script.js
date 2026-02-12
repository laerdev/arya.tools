const translations = {
  es: {labelTone: "Cómo quieres sonar?", tone1: "👔 Profesional", tone2: "🌸 Amable", tone3: "⚡ Directo", tone4: "🖕 Sarcástico", labelSpicy: "Intensidad", labelText: "Texto:",
    placeholder: "Ej: Esta reunión es aburrida y podría haber sido un e-mail...", btnMain: "Transformar!", btnLoading: "Transformando...", labelResult: "Resultado:", btnCopy: "📋 Copiar al portapapeles",
    btnCopied: "✅ Copiado!", note: "Hecho con amor y píxeles 🌿", alertEmpty: "Escribe algo para que pueda ayudarte", alertBtn: "Entendido", languageNote: "Este botón solo cambia el idioma de la interfaz; el texto generado mantendrá el idioma original",
    spicyTooltip: "🌿 Nivel 0: Corrección exclusiva de ortografía y gramática. Mantiene tu estilo y vocabulario original intactos.\n\n🌶️ Nivel 1: Mejora sutil de la fluidez y el vocabulario. Elimina repeticiones para que el texto suene más natural.\n\n🌶️🌶️ Nivel 2: Reescribe párrafos para aportar profesionalidad y cohesión. Ideal para mensajes que buscan impactar.\n\n🌶️🌶️🌶️ Nivel 3: Reestructuración total para una máxima elocuencia. Transforma el orden y la fuerza de cada palabra."
  },
  en: {labelTone: "How do you want to sound?", tone1: "👔 Professional", tone2: "🌸 Kind", tone3: "⚡ Direct", tone4: "🖕 Sarcastic", labelSpicy: "Intensity", labelText: "Text:",
    placeholder: "Ex: This meeting is boring and could have been an email...", btnMain: "Transform!", btnLoading: "Transforming...", labelResult: "Result:", btnCopy: "📋 Copy to clipboard",
    btnCopied: "✅ Copied!", note: "Made with love and pixels 🌿", alertEmpty: "Write something so I can help you",	alertBtn: "Got it", languageNote: "This button only changes the interface language; the generated text will keep its original language",
    spicyTooltip: "🌿 Level 0: Pure spelling and grammar correction. Keeps your original style and vocabulary completely intact.\n\n🌶️ Level 1: Subtle flow and vocabulary improvements. Removes repetitions to make the text sound more natural.\n\n🌶️🌶️ Level 2: Rewrites paragraphs for better professionalism and cohesion. Ideal for high-impact communication.\n\n🌶️🌶️🌶️ Level 3: Full restructuring for maximum eloquence. Transforms the order and strength of every word."
  }
};

const intensidadMap = {
  "0": "Minimal changes (only correct grammar and slightly adjust tone)",
  "1": "Subtle changes (maintain the original structure but soften the language)",
  "2": "Moderate changes (rewrite sentences to fit the tone)",
  "3": "Bold and complete rewrite (total transformation to maximize the chosen tone)"
};

let currentLang = localStorage.getItem('aryaLang') || 'es';

function setLanguage(lang){
    currentLang = lang;
    localStorage.setItem('aryaLang', lang);
    const t = translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (t[key]) {
            element.textContent = t[key];
        }
    });
    document.getElementById('inputText').placeholder = t.placeholder;
    document.getElementById('btn-es').classList.toggle('active', lang === 'es');
    document.getElementById('btn-en').classList.toggle('active', lang === 'en');
    const tooltip = document.getElementById('spicy-tooltip');
      if (tooltip) {
        tooltip.setAttribute('data-tooltip', translations[lang].spicyTooltip);
      }
}

document.getElementById('btn-es').addEventListener('click', () => setLanguage('es'));
document.getElementById('btn-en').addEventListener('click', () => setLanguage('en'));

function savePref(key, value) {
  localStorage.setItem('arya_' + key, value);
}

function loadPrefs() {
  setLanguage(currentLang);
  const savedTone = localStorage.getItem('arya_tone');
  if (savedTone) {
    const radio = document.querySelector(`input[name="tone"][value="${savedTone}"]`);
    if (radio) radio.checked = true;
  }
  const savedSpicy = localStorage.getItem('arya_spicy');
  if (savedSpicy) {
    const radio = document.getElementById('s' + savedSpicy);
    if (radio) radio.checked = true;
  }
  document.body.classList.add('visible');
}
window.addEventListener('DOMContentLoaded', loadPrefs);

document.querySelectorAll('input[name="tone"]').forEach(r => r.addEventListener('change', e => savePref('tone', e.target.value)));
document.querySelectorAll('input[name="spicy"]').forEach(r => r.addEventListener('change', e => savePref('spicy', e.target.value)));

document.getElementById('ui-btn-main').addEventListener('click', formalize);

document.getElementById('btnClear').addEventListener('click', () => {
  document.getElementById('inputText').value = "";
  document.getElementById('output-container').style.display = 'none';
  document.getElementById('inputText').focus();
});

async function formalize() {
  const tone = document.querySelector('input[name="tone"]:checked').value;
  const text = document.getElementById('inputText').value;
  const spicy = document.querySelector('input[name="spicy"]:checked').value;
  const container = document.getElementById('output-container');
  const outputDiv = document.getElementById('output');
  const t = translations[currentLang];
  if (!text) {
    showAlert(t.alertEmpty);
    return;
  }
  container.style.display = 'block';
  outputDiv.textContent = currentLang === 'es' ? "Cocinando el mensaje... 🍳" : "Cooking the message... 🍳";
  setTimeout(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }, 50);
  const mainBtn = document.getElementById('ui-btn-main');
  mainBtn.disabled = true;
  mainBtn.textContent = t.btnLoading;
  try {
    const response = await fetch('https://arya-tools-proxy.laerdev.workers.dev', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
            role: "system",
            content: `You are an expert editor.

                    TASK:
                    Rewrite the user's text while strictly preserving the ORIGINAL LANGUAGE.
                    
                    CONSTRAINTS:
                    - Do NOT translate the text.
                    - Do NOT add new information.
                    - Do NOT remove relevant details.
                    - Do NOT add introductions, explanations, or meta comments.
                    - Return ONLY the rewritten text.
                    
                    STYLE:
                    - Tone: ${tone}
                    - Intensity: ${intensidadMap[spicy]}
                    
                    GUIDELINES:
                    - Adapt vocabulary and sentence structure to match the requested tone and intensity.
                    - Keep the result natural, clear, and fluent.
                    - Avoid unnecessary embellishment unless required by the chosen intensity.`
          },
          {
            role: "user",
            content: text
          }
        ]
      })
    });
    const data = await response.json();
    if (data.error) {
      showAlert("Error: " + data.error.message);
      container.style.display = 'none';
    } else {
      outputDiv.textContent = data.choices[0].message.content;
      setTimeout(() => window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      }), 50);
    }
  } catch (e) {
    showAlert(currentLang === 'es' ? "Error de conexión ☁️" : "Connection error ☁️");
    container.style.display = 'none';
  } finally {
    mainBtn.disabled = false;
    mainBtn.textContent = t.btnMain;
  }
}

document.getElementById('btnCopy').addEventListener('click', () => {
  const text = document.getElementById('output').textContent;
  const btn = document.getElementById('btnCopy');
  const oldText = btn.innerHTML;
  btn.innerHTML = translations[currentLang].btnCopied;
  navigator.clipboard.writeText(text).finally(() => setTimeout(() => btn.innerHTML = oldText, 2000));
});

function showAlert(msg) {
  document.getElementById('alertMessage').textContent = msg;
  document.getElementById('customAlert').style.display = 'flex';
}
document.getElementById('ui-btn-alert').addEventListener('click', () => document.getElementById('customAlert').style.display = 'none');