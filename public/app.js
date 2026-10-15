(() => {
  'use strict';

  // ---------- Textos (español / inglés) ----------
  const STRINGS = {
    es: {
      skip: 'Saltar al contenido',
      brandSub: 'Asistente virtual de inmigración',
      contactBtn: 'Hablar con el abogado',
      urgent: '¿Está detenido o tiene una audiencia en corte próxima? No espere: llame al despacho ahora.',
      eyebrow: 'Residencia · Ciudadanía · Seguro Social',
      heroTitle: 'Entienda sus opciones migratorias, paso a paso',
      heroLede: 'Responda algunas preguntas y el asistente le explicará de forma preliminar qué trámites podrían aplicar a su familia. Al final puede enviar un resumen de su caso al abogado.',
      noticeTitle: 'Antes de comenzar',
      notice1: 'Este asistente da información general. <strong>No es asesoría legal</strong> ni crea una relación abogado-cliente.',
      notice2: 'Un abogado con licencia revisa cada caso antes de cualquier recomendación.',
      notice3: 'No escriba su número de Seguro Social, A-Number ni pasaporte. El despacho se los pedirá por un medio seguro.',
      notice4: 'La conversación no se guarda en este dispositivo; se borra al cerrar la página.',
      consent: 'Entiendo que esta es una orientación preliminar y no asesoría legal.',
      topicsTitle: '¿En qué le podemos ayudar?',
      t1: 'Residencia por familia', t1d: 'Pedir a un esposo, hijo, padre o hermano (<span class="nw">I-130</span>)',
      t2: 'Ciudadanía', t2d: 'Naturalización (<span class="nw">N-400</span>) o ciudadanía por sus padres (<span class="nw">N-600</span>)',
      t3: 'Número de Seguro Social', t3d: 'Quién puede obtenerlo y cómo se solicita',
      t4: 'Otra pregunta', t4d: 'Escriba su situación con sus propias palabras',
      consentHint: 'Marque la casilla de arriba para comenzar.',
      newChat: 'Nueva conversación',
      summaryBtn: 'Resumen para el abogado',
      masked: 'Por su seguridad ocultamos un número que parece de Seguro Social o A-Number.',
      inputLabel: 'Escriba su mensaje',
      placeholder: 'Escriba su respuesta o pregunta…',
      composerNote: 'Orientación preliminar · No incluya números de identificación',
      footer: 'La información de este sitio es general y no constituye asesoría legal. Las leyes, tarifas y procesos de inmigración cambian con frecuencia; confirme siempre con el abogado y en uscis.gov.',
      contactTitle: 'Hablar con el abogado',
      contactMissing: 'Los datos de contacto del despacho estarán disponibles pronto.',
      close: 'Cerrar',
      summaryTitle: 'Resumen de su caso para el abogado',
      summaryIntro: 'Revíselo. Si algo no es correcto, cierre esta ventana y aclárelo en la conversación antes de enviarlo.',
      copy: 'Copiar', download: 'Descargar', email: 'Enviar por correo', whatsapp: 'Enviar por WhatsApp',
      // Dinámicos
      send: 'Enviar',
      langLabel: 'Change language to English',
      call: 'Llamar', writeWhatsapp: 'Escribir por WhatsApp', sendEmail: 'Enviar un correo',
      attorneyLine: 'Atiende: {name}',
      starters: {
        residency: 'Quiero saber si puedo obtener la residencia o pedir a un familiar.',
        citizenship: 'Quiero saber si puedo solicitar la ciudadanía estadounidense.',
        ssn: 'Quiero saber si puedo obtener un número de Seguro Social.',
      },
      otherIntro: 'Cuénteme su situación con sus propias palabras: quién busca el trámite, qué estatus tiene hoy y qué le gustaría lograr. Puede escribir en español o en inglés.',
      thinking: 'El asistente está escribiendo',
      errorGeneric: 'No se pudo enviar el mensaje. Revise su conexión e intente de nuevo.',
      retry: 'Su mensaje se devolvió al cuadro de texto para que lo envíe otra vez.',
      confirmNew: '¿Empezar una nueva conversación? Se borrará la conversación actual.',
      summaryNeed: 'Converse un poco más con el asistente antes de generar el resumen.',
      summaryLoading: 'Preparando el resumen…',
      copied: 'Resumen copiado',
      copyFail: 'No se pudo copiar. Seleccione el texto manualmente.',
      tooLong: 'La conversación ya es larga. Genere el resumen para el abogado o empiece una nueva conversación.',
      mailSubject: 'Resumen de caso – Asistente de inmigración',
      truncated: '\n\n[Texto recortado. El resumen completo está en el archivo descargado.]',
      fileName: 'resumen-caso',
      you: 'Usted', ai: 'IA',
    },
    en: {
      skip: 'Skip to content',
      brandSub: 'Virtual immigration assistant',
      contactBtn: 'Talk to the attorney',
      urgent: 'Are you detained or do you have an upcoming court hearing? Don’t wait: call the office now.',
      eyebrow: 'Green card · Citizenship · Social Security',
      heroTitle: 'Understand your immigration options, step by step',
      heroLede: 'Answer a few questions and the assistant will give you a preliminary explanation of which processes might apply to your family. At the end you can send a summary of your case to the attorney.',
      noticeTitle: 'Before you start',
      notice1: 'This assistant provides general information. <strong>It is not legal advice</strong> and does not create an attorney-client relationship.',
      notice2: 'A licensed attorney reviews every case before making any recommendation.',
      notice3: 'Do not type your Social Security number, A-Number or passport number. The office will request them through a secure channel.',
      notice4: 'The conversation is not saved on this device; it is erased when you close the page.',
      consent: 'I understand this is preliminary guidance and not legal advice.',
      topicsTitle: 'How can we help you?',
      t1: 'Family-based green card', t1d: 'Petition for a spouse, child, parent or sibling (<span class="nw">I-130</span>)',
      t2: 'Citizenship', t2d: 'Naturalization (<span class="nw">N-400</span>) or citizenship through parents (<span class="nw">N-600</span>)',
      t3: 'Social Security number', t3d: 'Who can get one and how to apply',
      t4: 'Something else', t4d: 'Describe your situation in your own words',
      consentHint: 'Check the box above to begin.',
      newChat: 'New conversation',
      summaryBtn: 'Summary for the attorney',
      masked: 'For your safety, we hid a number that looks like a Social Security number or A-Number.',
      inputLabel: 'Type your message',
      placeholder: 'Type your answer or question…',
      composerNote: 'Preliminary guidance · Do not include ID numbers',
      footer: 'The information on this site is general and is not legal advice. Immigration laws, fees and processes change often; always confirm with the attorney and at uscis.gov.',
      contactTitle: 'Talk to the attorney',
      contactMissing: 'The office’s contact details will be available soon.',
      close: 'Close',
      summaryTitle: 'Your case summary for the attorney',
      summaryIntro: 'Please review it. If something is wrong, close this window and clarify it in the conversation before sending.',
      copy: 'Copy', download: 'Download', email: 'Send by email', whatsapp: 'Send by WhatsApp',
      send: 'Send',
      langLabel: 'Cambiar idioma a español',
      call: 'Call', writeWhatsapp: 'Message on WhatsApp', sendEmail: 'Send an email',
      attorneyLine: 'Attorney: {name}',
      starters: {
        residency: 'I want to know if I can get a green card or petition for a family member.',
        citizenship: 'I want to know if I can apply for U.S. citizenship.',
        ssn: 'I want to know if I can get a Social Security number.',
      },
      otherIntro: 'Tell me about your situation in your own words: who needs the process, what status they have today and what you would like to achieve. You can write in English or Spanish.',
      thinking: 'The assistant is typing',
      errorGeneric: 'The message could not be sent. Check your connection and try again.',
      retry: 'Your message was returned to the text box so you can send it again.',
      confirmNew: 'Start a new conversation? The current conversation will be erased.',
      summaryNeed: 'Talk with the assistant a little more before creating the summary.',
      summaryLoading: 'Preparing the summary…',
      copied: 'Summary copied',
      copyFail: 'Could not copy. Please select the text manually.',
      tooLong: 'This conversation is getting long. Create the summary for the attorney or start a new conversation.',
      mailSubject: 'Case summary – Immigration assistant',
      truncated: '\n\n[Text shortened. The full summary is in the downloaded file.]',
      fileName: 'case-summary',
      you: 'You', ai: 'AI',
    },
  };

  const MAX_MESSAGES = 40;
  const $ = (id) => document.getElementById(id);

  const state = {
    lang: 'es',
    messages: [],      // [{role:'user'|'assistant', content}]
    busy: false,
    config: { firmName: '', attorneyName: '', phone: '', whatsapp: '', email: '' },
    summary: '',
  };

  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* sin almacenamiento */ } },
  };

  const t = (key) => STRINGS[state.lang][key] ?? STRINGS.es[key] ?? key;

  // ---------- Privacidad ----------
  function maskSensitive(text) {
    return text
      .replace(/\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g, '[número oculto]')
      .replace(/\bA[- ]?\d{2,3}[- ]?\d{3}[- ]?\d{3}\b/gi, '[A-Number oculto]');
  }

  // ---------- Markdown seguro (solo lo básico) ----------
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function inline(s) {
    return escapeHtml(s)
      .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\bhttps?:\/\/[^\s<]+[^\s<.,;:)]/g,
        (u) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${u}</a>`);
  }
  function renderMarkdown(src) {
    const lines = src.replace(/\r/g, '').split('\n');
    let html = '';
    let list = null;   // 'ul' | 'ol'
    let para = [];
    const flushPara = () => { if (para.length) { html += `<p>${para.map(inline).join('<br>')}</p>`; para = []; } };
    const closeList = () => { if (list) { html += `</${list}>`; list = null; } };
    for (const raw of lines) {
      const line = raw.trimEnd();
      let m;
      if (!line.trim() || /^```/.test(line.trim())) { flushPara(); closeList(); continue; }
      if ((m = line.match(/^\s*#{1,6}\s+(.*)$/))) {
        flushPara(); closeList(); html += `<h3>${inline(m[1])}</h3>`; continue;
      }
      if ((m = line.match(/^\s*>\s?(.*)$/))) {
        flushPara(); closeList(); html += `<blockquote>${inline(m[1])}</blockquote>`; continue;
      }
      if ((m = line.match(/^\s*(?:[-*•])\s+(.*)$/))) {
        flushPara(); if (list !== 'ul') { closeList(); html += '<ul>'; list = 'ul'; }
        html += `<li>${inline(m[1])}</li>`; continue;
      }
      if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) {
        flushPara(); if (list !== 'ol') { closeList(); html += '<ol>'; list = 'ol'; }
        html += `<li>${inline(m[1])}</li>`; continue;
      }
      if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { flushPara(); closeList(); continue; }
      closeList(); para.push(line.trim());
    }
    flushPara(); closeList();
    return html;
  }

  // ---------- Idioma ----------
  function applyLanguage() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.innerHTML = t(el.dataset.i18n); // textos propios, no del usuario
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    const toggle = $('lang-toggle');
    toggle.textContent = state.lang === 'es' ? 'EN' : 'ES';
    toggle.setAttribute('aria-label', t('langLabel'));
    $('send').setAttribute('aria-label', t('send'));
    document.querySelectorAll('.msg-avatar[data-role="assistant"]').forEach((a) => { a.textContent = t('ai'); });
    renderContact();
  }

  // ---------- Configuración del despacho ----------
  async function loadConfig() {
    try {
      const r = await fetch('/api/config');
      if (r.ok) state.config = { ...state.config, ...(await r.json()) };
    } catch { /* se usan valores por defecto */ }
    if (state.config.firmName) {
      $('firm-name').textContent = state.config.firmName;
      document.title = `${state.config.firmName} · Asistente de Inmigración`;
    }
    const urgent = $('urgent-phone');
    if (state.config.phone) {
      urgent.href = `tel:${state.config.phone.replace(/[^\d+]/g, '')}`;
      urgent.textContent = state.config.phone;
      urgent.hidden = false;
    }
    renderContact();
  }

  function renderContact() {
    const c = state.config;
    const box = $('contact-links');
    if (!box) return;
    box.innerHTML = '';
    const add = (href, label, detail, external) => {
      const a = document.createElement('a');
      a.className = 'btn-secondary';
      a.href = href;
      if (external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      a.textContent = `${label} · ${detail}`;
      box.appendChild(a);
    };
    if (c.phone) add(`tel:${c.phone.replace(/[^\d+]/g, '')}`, t('call'), c.phone);
    if (c.whatsapp) add(`https://wa.me/${c.whatsapp}`, t('writeWhatsapp'), `+${c.whatsapp}`, true);
    if (c.email) add(`mailto:${c.email}`, t('sendEmail'), c.email);
    $('contact-missing').hidden = box.children.length > 0;
    const line = $('attorney-line');
    line.textContent = c.attorneyName ? t('attorneyLine').replace('{name}', c.attorneyName) : '';
    line.hidden = !c.attorneyName;
  }

  // ---------- Mensajes ----------
  function addBubble(role, content, opts = {}) {
    const li = document.createElement('li');
    li.className = `msg ${role}${opts.error ? ' error' : ''}`;
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    if (role === 'assistant') {
      const avatar = document.createElement('span');
      avatar.className = 'msg-avatar';
      avatar.dataset.role = 'assistant';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = t('ai');
      li.appendChild(avatar);
      bubble.classList.add('md');
      if (opts.typing) {
        bubble.innerHTML = `<span class="typing" role="img" aria-label="${escapeHtml(t('thinking'))}"><span></span><span></span><span></span></span>`;
      } else {
        bubble.innerHTML = renderMarkdown(content);
      }
    } else {
      bubble.textContent = content;
    }
    li.appendChild(bubble);
    $('messages').appendChild(li);
    li.scrollIntoView({ behavior: 'smooth', block: 'end' });
    return li;
  }

  function setBusy(busy) {
    state.busy = busy;
    $('send').disabled = busy;
    $('summary-btn').disabled = busy || !canSummarize();
    $('new-chat').disabled = busy;
  }

  function canSummarize() {
    const users = state.messages.filter((m) => m.role === 'user').length;
    const last = state.messages[state.messages.length - 1];
    return users >= 2 && last?.role === 'assistant';
  }

  async function callApi(messages, mode) {
    const r = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, lang: state.lang, mode }),
    });
    let data = {};
    try { data = await r.json(); } catch { /* respuesta no JSON */ }
    if (!r.ok || !data.reply) throw new Error(data.error || t('errorGeneric'));
    return data.reply;
  }

  async function sendMessage(text) {
    text = text.trim();
    if (!text || state.busy) return;
    if (state.messages.length >= MAX_MESSAGES - 1) { toast(t('tooLong')); return; }

    const masked = maskSensitive(text);
    if (masked !== text) flashPrivacy();

    // Si el asistente habló primero (tema "Otra pregunta"), ese saludo no se envía a la API.
    state.messages.push({ role: 'user', content: masked });
    const userEl = addBubble('user', masked);
    const typingEl = addBubble('assistant', '', { typing: true });
    setBusy(true);

    try {
      const reply = await callApi(state.messages);
      typingEl.remove();
      state.messages.push({ role: 'assistant', content: reply });
      addBubble('assistant', reply);
    } catch (err) {
      typingEl.remove();
      userEl.remove();
      state.messages.pop();
      $('input').value = text;
      autoGrow();
      const errEl = addBubble('assistant', `${err.message}\n\n${t('retry')}`, { error: true });
      setTimeout(() => errEl.remove(), 12000);
    } finally {
      setBusy(false);
      $('input').focus();
    }
  }

  function flashPrivacy() {
    const el = $('privacy-flash');
    el.hidden = false;
    clearTimeout(flashPrivacy.timer);
    flashPrivacy.timer = setTimeout(() => { el.hidden = true; }, 7000);
  }

  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { el.hidden = true; }, 3500);
  }

  // ---------- Flujo ----------
  function startChat(topic) {
    $('welcome').hidden = true;
    $('chat').hidden = false;
    window.scrollTo(0, 0);
    if (topic === 'other') {
      // Mensaje local de bienvenida; no forma parte del historial enviado.
      addBubble('assistant', t('otherIntro'));
      $('input').focus();
    } else {
      sendMessage(t('starters')[topic]);
    }
  }

  function resetChat() {
    state.messages = [];
    state.summary = '';
    $('messages').innerHTML = '';
    $('input').value = '';
    autoGrow();
    $('chat').hidden = true;
    $('welcome').hidden = false;
    setBusy(false);
    window.scrollTo(0, 0);
  }

  async function makeSummary() {
    if (!canSummarize()) { toast(t('summaryNeed')); return; }
    setBusy(true);
    toast(t('summaryLoading'));
    try {
      state.summary = await callApi(state.messages, 'summary');
      $('summary-body').innerHTML = renderMarkdown(state.summary);
      setupShareLinks();
      $('toast').hidden = true;
      $('summary-dialog').showModal();
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  function summaryText(limit) {
    const head = `${t('summaryTitle')}\n${new Date().toLocaleDateString(state.lang === 'en' ? 'en-US' : 'es-MX')}\n\n`;
    const full = head + state.summary;
    return limit && full.length > limit ? full.slice(0, limit) + t('truncated') : full;
  }

  function setupShareLinks() {
    const c = state.config;
    const mail = $('email-summary');
    mail.hidden = !c.email;
    if (c.email) {
      mail.href = `mailto:${c.email}?subject=${encodeURIComponent(t('mailSubject'))}&body=${encodeURIComponent(summaryText(1800))}`;
    }
    const wa = $('whatsapp-summary');
    wa.hidden = !c.whatsapp;
    if (c.whatsapp) wa.href = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(summaryText(1500))}`;
  }

  function downloadSummary() {
    const blob = new Blob([summaryText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${t('fileName')}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summaryText());
      toast(t('copied'));
    } catch {
      toast(t('copyFail'));
    }
  }

  function autoGrow() {
    const el = $('input');
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }

  // ---------- Eventos ----------
  function bind() {
    const consent = $('consent');
    const topics = document.querySelectorAll('.topic');
    const syncConsent = () => {
      topics.forEach((b) => { b.disabled = !consent.checked; });
      $('consent-hint').hidden = consent.checked;
      store.set('lawyeria-consent', consent.checked ? '1' : '');
    };
    consent.checked = store.get('lawyeria-consent') === '1';
    consent.addEventListener('change', syncConsent);
    syncConsent();

    topics.forEach((b) => b.addEventListener('click', () => startChat(b.dataset.topic)));

    $('composer').addEventListener('submit', (e) => {
      e.preventDefault();
      const text = $('input').value;
      $('input').value = '';
      autoGrow();
      sendMessage(text);
    });
    $('input').addEventListener('input', autoGrow);
    $('input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        $('composer').requestSubmit();
      }
    });

    $('new-chat').addEventListener('click', () => {
      if (state.messages.length === 0 || confirm(t('confirmNew'))) resetChat();
    });
    $('summary-btn').addEventListener('click', makeSummary);
    $('copy-summary').addEventListener('click', copySummary);
    $('download-summary').addEventListener('click', downloadSummary);
    $('close-summary').addEventListener('click', () => $('summary-dialog').close());

    $('contact-open').addEventListener('click', () => $('contact-dialog').showModal());
    [$('contact-dialog'), $('summary-dialog')].forEach((d) => {
      d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
    });

    $('lang-toggle').addEventListener('click', () => {
      state.lang = state.lang === 'es' ? 'en' : 'es';
      store.set('lawyeria-lang', state.lang);
      applyLanguage();
    });

    window.addEventListener('beforeunload', (e) => {
      if (state.messages.length > 0) { e.preventDefault(); e.returnValue = ''; }
    });
  }

  // ---------- Inicio ----------
  const savedLang = store.get('lawyeria-lang');
  state.lang = savedLang === 'en' ? 'en' : 'es'; // español por defecto

  bind();
  applyLanguage();
  setBusy(false);
  loadConfig();
})();
