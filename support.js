(function loadTimelineRuntimeAndPresentationLink() {
  'use strict';
  document.write('<script src="support-runtime.js"><' + '/script>');

  var SYMBOL = 'https://raw.githubusercontent.com/juparana-dev/cdmjuparana/2b5c9025af2e92a9509c608742403e1b672b6c5b/src/assets/brand/cdm-symbol.svg';
  var HORIZONTAL = 'https://raw.githubusercontent.com/juparana-dev/cdmjuparana/2b5c9025af2e92a9509c608742403e1b672b6c5b/src/assets/brand/cdm-horizontal-sigla.svg';

  function enhanceTimelineBrand() {
    var header = document.querySelector('header');
    if (!header) return;

    document.querySelectorAll('img[src="assets/logo.png"]').forEach(function (image) {
      image.src = SYMBOL;
    });

    if (!header.querySelector('[data-cdm-brand-link]')) {
      var original = Array.from(header.children).slice(0, 3);
      var brandLink = document.createElement('a');
      brandLink.href = 'apresentacao/';
      brandLink.setAttribute('data-cdm-brand-link', 'true');
      brandLink.setAttribute('aria-label', 'Abrir apresentação do CDM');
      brandLink.style.display = 'inline-flex';
      brandLink.style.alignItems = 'center';
      brandLink.style.width = '290px';
      brandLink.style.maxWidth = '42vw';
      brandLink.style.textDecoration = 'none';
      brandLink.style.borderRadius = '12px';
      brandLink.style.padding = '5px 8px';
      brandLink.style.margin = '-5px 0';
      brandLink.style.transition = 'background .2s ease, transform .2s ease';
      brandLink.onmouseenter = function () {
        brandLink.style.background = '#f6f8f5';
        brandLink.style.transform = 'translateY(-1px)';
      };
      brandLink.onmouseleave = function () {
        brandLink.style.background = 'transparent';
        brandLink.style.transform = 'translateY(0)';
      };

      var image = document.createElement('img');
      image.src = HORIZONTAL;
      image.alt = 'CDM Central de Dados Mestres';
      image.style.display = 'block';
      image.style.width = '100%';
      image.style.height = '46px';
      image.style.objectFit = 'contain';
      image.style.objectPosition = 'left center';
      brandLink.appendChild(image);

      if (original[0]) header.insertBefore(brandLink, original[0]);
      else header.appendChild(brandLink);
      original.forEach(function (child) { child.remove(); });
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceTimelineBrand, { once: true });
  } else {
    enhanceTimelineBrand();
  }
})();
