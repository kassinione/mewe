/**
 * Must load right after https://telegram.org/js/telegram-web-app.js and
 * before any other script/CSS-dependent logic.
 *
 * Why this exists:
 * 1. On mobile, a Mini App opens minimized inside a BottomSheet — only
 *    ready()+expand() maximizes it immediately, instead of leaving the
 *    page rendered inside a fold the user has to drag/scroll open.
 * 2. safeAreaInset / contentSafeAreaInset are exposed by Telegram as JS
 *    properties, not as CSS variables — this mirrors them into
 *    --tg-safe-area-inset-* so plain CSS (env()-style calc()) can use them.
 *    (Note: --tg-viewport-height / --tg-viewport-stable-height are already
 *    set on <html> automatically by telegram-web-app.js itself.)
 */
(function () {
  var tg = window.Telegram && window.Telegram.WebApp;
  if (!tg) return;

  tg.ready();
  tg.expand();

  function applySafeArea() {
    var insets = tg.safeAreaInset || { top: 0, bottom: 0, left: 0, right: 0 };
    var contentInsets = tg.contentSafeAreaInset || insets;
    var root = document.documentElement.style;

    root.setProperty('--tg-safe-area-inset-top', insets.top + 'px');
    root.setProperty('--tg-safe-area-inset-bottom', insets.bottom + 'px');
    root.setProperty('--tg-safe-area-inset-left', insets.left + 'px');
    root.setProperty('--tg-safe-area-inset-right', insets.right + 'px');

    root.setProperty('--tg-content-safe-area-inset-top', contentInsets.top + 'px');
    root.setProperty('--tg-content-safe-area-inset-bottom', contentInsets.bottom + 'px');
  }

  applySafeArea();
  tg.onEvent('safeAreaChanged', applySafeArea);
  tg.onEvent('contentSafeAreaChanged', applySafeArea);
  tg.onEvent('viewportChanged', applySafeArea);
})();
