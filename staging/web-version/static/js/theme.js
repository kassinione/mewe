(function () {
  function applyTheme() {
    var tg = window.Telegram && window.Telegram.WebApp;
    var scheme = tg ? tg.colorScheme : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', scheme);
  }

  applyTheme();

  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.onEvent('themeChanged', applyTheme);
  }
})();
