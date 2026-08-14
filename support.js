(function loadTimelineRuntimeAndPresentationLink() {
  'use strict';

  document.write('<script src="support-runtime.js"><\\/script>');

  function mountPresentationLink() {
    if (document.querySelector('[data-cdm-presentation-link]')) return;
    var header = document.querySelector('header');
    if (!header) return;

    var link = document.createElement('a');
    link.href = 'apresentacao/';
    link.textContent = 'Apresentação';
    link.setAttribute('data-cdm-presentation-link', 'true');
    link.setAttribute('aria-label', 'Abrir apresentação do CDM');
    link.style.marginLeft = 'auto';
    link.style.display = 'inline-flex';
    link.style.alignItems = 'center';
    link.style.minHeight = '34px';
    link.style.padding = '0 13px';
    link.style.border = '1px solid #e0e5de';
    link.style.borderRadius = '999px';
    link.style.background = '#ffffff';
    link.style.color = '#315f2b';
    link.style.fontSize = '12px';
    link.style.fontWeight = '700';
    link.style.letterSpacing = '.04em';
    link.style.textDecoration = 'none';
    link.style.boxShadow = '0 8px 24px rgba(23,32,22,.06)';
    link.style.transition = 'transform .22s ease, box-shadow .22s ease, border-color .22s ease';
    link.onmouseenter = function () { link.style.transform = 'translateY(-1px)'; link.style.borderColor = '#b8c9b4'; link.style.boxShadow = '0 12px 30px rgba(23,32,22,.10)'; };
    link.onmouseleave = function () { link.style.transform = 'translateY(0)'; link.style.borderColor = '#e0e5de'; link.style.boxShadow = '0 8px 24px rgba(23,32,22,.06)'; };
    header.appendChild(link);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountPresentationLink, { once: true });
  } else {
    mountPresentationLink();
  }
})();