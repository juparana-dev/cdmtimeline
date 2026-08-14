(function loadTimelineRuntimeAndPresentationLink() {
  'use strict';
  document.write('<script src="support-runtime.js"><' + '/script>');
  var OFFICIAL_SYMBOL = 'https://raw.githubusercontent.com/juparana-dev/cdmjuparana/2b5c9025af2e92a9509c608742403e1b672b6c5b/src/assets/brand/cdm-symbol.svg';

  function enhanceTimelineBrand() {
    var header = document.querySelector('header');
    if (!header) return;
    document.querySelectorAll('img[src="assets/logo.png"]').forEach(function (image) {
      image.src = OFFICIAL_SYMBOL;
    });

    if (!header.querySelector('[data-cdm-brand-link]')) {
      var brandLink = document.createElement('a');
      brandLink.href = 'apresentacao/';
      brandLink.setAttribute('data-cdm-brand-link', 'true');
      brandLink.setAttribute('aria-label', 'Abrir apresentação do CDM');
      brandLink.style.display = 'inline-flex';
      brandLink.style.alignItems = 'center';
      brandLink.style.gap = '12px';
      brandLink.style.color = 'inherit';
      brandLink.style.textDecoration = 'none';
      brandLink.style.borderRadius = '12px';
      brandLink.style.padding = '4px 8px 4px 4px';
      brandLink.style.margin = '-4px 0 -4px -4px';
      brandLink.style.transition = 'background .2s ease';
      brandLink.onmouseenter = function () { brandLink.style.background = '#f6f8f5'; };
      brandLink.onmouseleave = function () { brandLink.style.background = 'transparent'; };
      var children = Array.from(header.children).slice(0, 3);
      if (children.length === 3) {
        header.insertBefore(brandLink, children[0]);
        children.forEach(function (child) { brandLink.appendChild(child); });
      }
    }

    if (!document.querySelector('[data-cdm-presentation-link]')) {
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
      header.appendChild(link);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhanceTimelineBrand, { once: true });
  else enhanceTimelineBrand();
})();
