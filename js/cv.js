// === Touch/hover helpers + Language switch with Apple-style toggle + PDF download ===
(function () {
  'use strict';

  // ---------------------------------------------------
  // 0) Improve iOS :active reliability (no side-effects)
  // ---------------------------------------------------
  window.addEventListener('touchstart', function(){}, { passive: true });

  // ---------------------------------------------------
  // 1) URL param -> language ("ch-zn" & common aliases)
  // ---------------------------------------------------
  function getLangFromQuery() {
    var params = new URLSearchParams(window.location.search);
    var raw = (params.get('lang') || '').trim().toLowerCase();
    if (raw === 'ch-zn' || raw === 'zh-cn' || raw === 'zh' || raw === 'cn') return 'zh';
    if (raw === 'en' || raw === 'en-us' || raw === 'en-gb') return 'en';
    return ''; // no explicit preference
  }

  // ---------------------------------------------------
  // 2) DOM references
  // ---------------------------------------------------
  var wrap   = document.querySelector('.wrap');
  var en     = document.getElementById('lang-en');
  var zh     = document.getElementById('lang-zh');
  var btnEn  = document.getElementById('btn-en'); // top-right existing button
  var btnZh  = document.getElementById('btn-zh'); // top-right existing button
  var actions = document.querySelector('.actions'); // container for Apple-style switch
  var pdfBtn = document.querySelector('.btn-print'); // the "Save to PDF" button

  if (!wrap || !en || !zh || !actions) return;

  // Clear inline display if any (avoid CSS fight)
  try { en.style.removeProperty('display'); } catch(e){}
  try { zh.style.removeProperty('display'); } catch(e){}

  // ---------------------------------------------------
  // 3) A11y helpers
  // ---------------------------------------------------
  function setHtmlLang(isEnglish) {
    document.documentElement.setAttribute('lang', isEnglish ? 'en' : 'zh-CN');
  }
  function showPanel(panel) {
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
    panel.style.display = '';
  }
  function hidePanel(panel) {
    panel.hidden = true;
    panel.setAttribute('aria-hidden', 'true');
    panel.style.display = 'none';
  }

  // ---------------------------------------------------
  // 4) Initial language (URL wins; default English)
  // ---------------------------------------------------
  var qlang = getLangFromQuery();
  var startEn = (qlang === 'en') || (qlang === '' /* default English when no param */);

  var current = startEn ? en : zh;
  if (startEn) { showPanel(en); hidePanel(zh); setHtmlLang(true); }
  else         { showPanel(zh); hidePanel(en); setHtmlLang(false); }

  // ---------------------------------------------------
  // 5) Toggle logic
  // ---------------------------------------------------
  function reflectButtons(isEn) {
    // If your buttons use aria-pressed, sync them
    if (btnEn) btnEn.setAttribute('aria-pressed', isEn ? 'true' : 'false');
    if (btnZh) btnZh.setAttribute('aria-pressed', isEn ? 'false' : 'true');
  }
  function toEnglish() {
    if (current === en) return;
    showPanel(en); hidePanel(zh); setHtmlLang(true);
    current = en;
    reflectButtons(true);
    reflectSwitch(true);
  }
  function toChinese() {
    if (current === zh) return;
    showPanel(zh); hidePanel(en); setHtmlLang(false);
    current = zh;
    reflectButtons(false);
    reflectSwitch(false);
  }
  function toggle(toEn) {
    if (typeof toEn === 'boolean') return toEn ? toEnglish() : toChinese();
    return (current === en) ? toChinese() : toEnglish();
  }
  reflectButtons(startEn);

  // ---------------------------------------------------
  // 6) Keep your existing buttons (#btn-en / #btn-zh)
  // ---------------------------------------------------
  if (btnEn) btnEn.addEventListener('click', function(e){ e.preventDefault(); toEnglish(); });
  if (btnZh) btnZh.addEventListener('click', function(e){ e.preventDefault(); toChinese(); });

  // ---------------------------------------------------
  // 7) Apple-style switch (preserved & injected at first in .actions)
  //    This mirrors the original "苹果风" look and ARIA behavior.
  // ---------------------------------------------------
  var sw = document.createElement('div');
  sw.className = 'lang-switch';
  sw.setAttribute('role','switch');
  sw.setAttribute('tabindex','0');
  sw.setAttribute('aria-checked', startEn ? 'true' : 'false');
  sw.dataset.lang = startEn ? 'en' : 'zh';

  // Structure: <span.label>EN/中文</span><span.track><span.thumb/></span>
  var lab = document.createElement('span');  lab.className = 'label';
  var track = document.createElement('span'); track.className = 'track';
  var thumb = document.createElement('span'); thumb.className = 'thumb';
  var download = document.getElementById("download");
  track.appendChild(thumb);
  sw.appendChild(lab);
  sw.appendChild(track);

  // Insert as the first element inside actions (keep your top-right area)
  actions.insertBefore(sw, actions.firstChild);

  // Transition helpers (CSS-independent timing; optional)
  var DUR = 280, EASE = 'cubic-bezier(0.2,0.8,0.2,1)';
  var reduceMotion = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function animateThumb(toEn) {
    if (reduceMotion) return;
    thumb.animate(
      [{ transform: 'translateX(' + (toEn ? '0' : '100%') + ')' }],
      { duration: DUR, easing: EASE, fill: 'both' }
    );
  }

  function reflectSwitch(isEn) {
    sw.setAttribute('aria-checked', isEn ? 'true' : 'false');
    sw.dataset.lang = isEn ? 'en' : 'zh';
    lab.textContent = isEn ? 'EN' : '中文';
    download.textContent = isEn ? "Download" : "下载";

    // optional: visual class
    sw.classList.toggle('is-on', !!isEn);
    animateThumb(isEn);
  }
  reflectSwitch(startEn);

  // Switch events
  sw.addEventListener('click', function(){ toggle(); });
  sw.addEventListener('keydown', function(e){
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); toggle(false); }
    if (e.key === 'ArrowRight') { e.preventDefault(); toggle(true); }
  });

  // ---------------------------------------------------
  // 8) "Save to PDF" -> download language-specific PDF (no print)
  // ---------------------------------------------------
  function currentLangKey() {
    // Return 'en' or 'zh' based on current panel
    // return (current === en) ? 'en' : 'zh';
	return 'zh'
  }
  var PDF_BY_LANG = {
    zh: { path: '/pdf/CV.pdf', name: '徐秀生-CV.pdf' }
  };

  // Try the simple anchor-download first; if blocked, fall back to fetch-blob so we can force the filename.
  function downloadWithFilename(path, filename) {
    // 1) Fast path: same-origin + browsers that honor <a download>
    try {
      var a1 = document.createElement('a');
      a1.href = path;
      a1.download = filename;   // suggest/save as this name
      // Some browsers require the link to be in the DOM
      document.body.appendChild(a1);
      a1.click();
      document.body.removeChild(a1);
    } catch (e) {
      // ignore, we will still try blob way
    }

    // 2) Robust path: fetch -> blob -> objectURL (forces filename if download attr works)
    //    Use setTimeout to avoid double save on browsers that already completed #1 successfully.
    setTimeout(function () {
      fetch(path, { credentials: 'same-origin' })
        .then(function (res) {
          // If cross-origin and CORS not allowed, this may fail.
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.blob();
        })
        .then(function (blob) {
          var url = URL.createObjectURL(blob);
          var a2 = document.createElement('a');
          a2.href = url;
          a2.download = filename;
          document.body.appendChild(a2);
          a2.click();
          document.body.removeChild(a2);
          // Clean up the temporary object URL
          setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
        })
        .catch(function () {
          // Final fallback: just navigate (may open in a new tab and let the server decide)
          window.location.href = path;
        });
    }, 50);
  }

  function downloadPDFForCurrentLang() {
    var key = currentLangKey();
    var cfg = PDF_BY_LANG[key] || PDF_BY_LANG.en;
    downloadWithFilename(cfg.path, cfg.name);
  }

  if (pdfBtn) {
    try { pdfBtn.removeAttribute('onclick'); } catch(e){}
    pdfBtn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      downloadPDFForCurrentLang();
    });
  }
  // ---------------------------------------------------
  // 9) Guard: ensure at least one panel visible when resuming
  // ---------------------------------------------------
  function ensureVisible(){
    var enOk = !en.hidden && en.getAttribute('aria-hidden') !== 'true';
    var zhOk = !zh.hidden && zh.getAttribute('aria-hidden') !== 'true';
    if (!enOk && !zhOk) {
      showPanel(en); hidePanel(zh); setHtmlLang(true);
      current = en;
      reflectButtons(true);
      reflectSwitch(true);
    }
  }
  document.addEventListener('visibilitychange', function(){ if (!document.hidden) ensureVisible(); });
  window.addEventListener('pageshow', ensureVisible);

})();
