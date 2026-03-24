(function () {
  'use strict';

  window.addEventListener('touchstart', function () {}, { passive: true });

  function bindAvatarInteraction(avatar) {
    if (!avatar || avatar.dataset.cvAvatarBound === 'true') {
      return;
    }

    avatar.dataset.cvAvatarBound = 'true';

    function startRotate() {
      avatar.classList.add('rotating');
    }

    function stopRotate() {
      avatar.classList.remove('rotating');
    }

    avatar.addEventListener('touchstart', startRotate, { passive: true });
    avatar.addEventListener('touchend', stopRotate, { passive: true });
    avatar.addEventListener('touchcancel', stopRotate, { passive: true });
  }

  function initCvPage() {
    var cvPanel = document.querySelector('.cv-panel');
    var downloadLabel = document.getElementById('download');

    if (!cvPanel || !downloadLabel) {
      return;
    }

    document.documentElement.setAttribute('lang', 'zh-CN');
    downloadLabel.textContent = '下载';
    bindAvatarInteraction(document.querySelector('.avatar'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCvPage, { once: true });
  } else {
    initCvPage();
  }

  window.addEventListener('pageshow', initCvPage);
  document.addEventListener('pjax:complete', initCvPage);
})();
