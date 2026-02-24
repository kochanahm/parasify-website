(function () {
  var params = new URLSearchParams(window.location.search);
  var lang = params.get('lang') || 'en';
  var page = document.documentElement.getAttribute('data-page');

  document.documentElement.lang = lang;

  // Set language selector
  var selector = document.getElementById('lang-selector');
  if (selector) {
    selector.value = lang;
    selector.addEventListener('change', function () {
      var newLang = this.value;
      var url = new URL(window.location);
      if (newLang === 'en') {
        url.searchParams.delete('lang');
      } else {
        url.searchParams.set('lang', newLang);
      }
      window.location.href = url.toString();
    });
  }

  // Propagate lang param to internal links
  function propagateLinks() {
    var links = document.querySelectorAll('a[href^="/parasify-website/"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var url = new URL(a.href, window.location.origin);
      if (lang !== 'en') {
        url.searchParams.set('lang', lang);
      } else {
        url.searchParams.delete('lang');
      }
      a.href = url.toString();
    }
  }

  // Reveal content (remove anti-FOUC class)
  function reveal() {
    document.documentElement.classList.remove('i18n-loading');
  }

  // Load translations for non-English languages
  if (lang !== 'en' && page) {
    fetch('/parasify-website/lang/' + page + '/' + lang + '.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Translation not found');
        return res.json();
      })
      .then(function (translations) {
        var els = document.querySelectorAll('[data-i18n]');
        for (var i = 0; i < els.length; i++) {
          var key = els[i].getAttribute('data-i18n');
          if (translations[key] !== undefined) {
            els[i].innerHTML = translations[key];
          }
        }
        if (translations['page-title']) {
          document.title = translations['page-title'];
        }
        propagateLinks();
        reveal();
      })
      .catch(function () {
        propagateLinks();
        reveal();
      });
  } else {
    propagateLinks();
  }
})();
