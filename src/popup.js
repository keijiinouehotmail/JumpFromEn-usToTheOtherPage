function getCurrentUrlOfTab(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true,
  };

  chrome.tabs.query(queryInfo, function (tabs) {
    var tab = tabs[0];

    var url = tab.url;
    console.assert(typeof url == "string", "tab.url should be a string");

    callback(url);
  });
}

function renderStatus(statusText) {
  document.getElementById("status").textContent = statusText;
}

function getLocales() {
  return [
    "ar-sa",
    "bg-bg",
    "bs-cyrl-ba",
    "bs-latn-ba",
    "ca-es",
    "cs-cz",
    "da-dk",
    "de-AT",
    "de-CH",
    "de-de",
    "el-gr",
    "en-AU",
    "en-CA",
    "en-GB",
    "en-IE",
    "en-IN",
    "en-MY",
    "en-NZ",
    "en-SG",
    "en-us",
    "en-ZA",
    "es-es",
    "es-MX",
    "et-ee",
    "eu-es",
    "fi-fi",
    "fil-ph",
    "fr-BE",
    "fr-CA",
    "fr-CH",
    "fr-fr",
    "ga-ie",
    "gl-es",
    "he-il",
    "hi-in",
    "hr-hr",
    "hu-hu",
    "id-id",
    "is-is",
    "it-CH",
    "it-it",
    "ja-jp",
    "kk-kz",
    "ko-kr",
    "lb-lu",
    "lt-lt",
    "lv-lv",
    "ms-my",
    "mt-mt",
    "nb-NO",
    "nl-BE",
    "nl-nl",
    "pl-pl",
    "pt-BR",
    "pt-pt",
    "ro-ro",
    "ru-ru",
    "sk-sk",
    "sl-si",
    "sr-cyrl-rs",
    "sr-latn-rs",
    "sv-se",
    "th-th",
    "tr-tr",
    "uk-ua",
    "vi-vn",
    "zh-CN",
    "zh-hk",
    "zh-tw",
  ];
}
document.addEventListener("DOMContentLoaded", function () {
  var UILanguage = chrome.i18n.getUILanguage(); // ja
  var locales = getLocales();

  // default locale of page jumped From
  var defaultLocaleFrom = "en-us";
  // default locale of page jump To
  var defaultLocaleTo = "ja-jp";
  for (var l of locales) {
    if (l.indexOf(UILanguage) == 0) {
      defaultLocaleTo = l;
      break;
    }
  }

  getCurrentUrlOfTab(function (url) {
    chrome.storage.sync.get(
      {
        newTab: false,
        localeFrom: defaultLocaleFrom,
        localeTo: defaultLocaleTo,
      },
      function (items) {
        var langFrom, langTo;
        var _url = url.toLowerCase();
        var _pathname = new URL(url).pathname.toLowerCase();
        var urlTo;

        var localeFrom = items.localeFrom;
        var _localeFrom = items.localeFrom.toLowerCase();
        var localeTo = items.localeTo;
        var _localeTo = items.localeTo.toLowerCase();

        // "/en-us/"
        if (0 < _url.indexOf(`/${_localeFrom}/`)) {
          langFrom = localeFrom;
          langTo = localeTo;
          urlTo = _url.replace(`/${_localeFrom}/`, `/${localeTo}/`);
        }
        // "/en/"
        else if (0 < _url.indexOf(`/${_localeFrom.split("-")[0]}/`)) {
          langFrom = localeFrom.split("-")[0];
          langTo = localeTo.split("-")[0];
          urlTo = _url.replace(
            `/${_localeFrom.split("-")[0]}/`,
            `/${localeTo.split("-")[0]}/`
          );
        } 
        // "/ja-jp/"
        else if (0 < _url.indexOf(`/${_localeTo}/`)) {
          langFrom = localeTo;
          langTo = localeFrom;
          urlTo = _url.replace(`/${_localeTo}/`, `/${localeFrom}/`);
        } 
        // "/ja/"
        else if (0 < _url.indexOf(`/${_localeTo.split("-")[0]}/`)) {
          langFrom = localeTo.split("-")[0];
          langTo = localeFrom.split("-")[0];
          urlTo = _url.replace(
            `/${_localeTo.split("-")[0]}/`,
            `/${localeFrom.split("-")[0]}/`
          );
        }
        // "?hl=en"
        else if (0 < _url.indexOf(`?hl=${_localeFrom.split("-")[0]}`)) {
          langFrom = localeFrom.split("-")[0];
          langTo = localeTo.split("-")[0];
          urlTo = _url.replace(
            `?hl=${_localeFrom.split("-")[0]}`,
            `?hl=${localeTo.split("-")[0]}`
          );
        }
        // "?hl=ja"
        else if (0 < _url.indexOf(`?hl=${_localeTo.split("-")[0]}`)) {
          langFrom = localeTo.split("-")[0];
          langTo = localeFrom.split("-")[0];
          urlTo = _url.replace(
            `?hl=${_localeTo.split("-")[0]}`,
            `?hl=${localeFrom.split("-")[0]}`
          );
        }
        // "_en.html" or "_en.htm"
        else if ((new RegExp(`_${_localeFrom.split("-")[0]}\\.html?$`)).test(_pathname)) {
          langFrom = localeFrom.split("-")[0];
          langTo = localeTo.split("-")[0];
          const found = _pathname.match(`_${_localeFrom.split("-")[0]}\\.html?$`);
          const htmlFrom = found[0];
          const htmlTo = htmlFrom.replace(`_${_localeFrom.split("-")[0]}`, `_${localeTo.split("-")[0]}`);
          pathnameTo = _pathname.replace(htmlFrom, htmlTo);
          const Url = new URL(url);
          urlTo = `${Url.origin}${pathnameTo}${Url.search}${Url.hash}`;
        }
        // "_ja.html" or "_ja.htm"
        else if ((new RegExp(`_${_localeTo.split("-")[0]}\\.html?$`)).test(_pathname)) {
          langFrom = localeTo.split("-")[0];
          langTo = localeFrom.split("-")[0];
          const found = _pathname.match(`_${_localeTo.split("-")[0]}\\.html?$`);
          const htmlTo = found[0];
          const htmlFrom = htmlTo.replace(`_${_localeTo.split("-")[0]}`, `_${localeFrom.split("-")[0]}`);
          pathnameTo = _pathname.replace(htmlTo, htmlFrom);
          const Url = new URL(url);
          urlTo = `${Url.origin}${pathnameTo}${Url.search}${Url.hash}`;
        }

        if (urlTo) {
          if (items.newTab) {
            // Do not render, because it opens a new tab.
            chrome.tabs.create({
              url: urlTo,
            });
          } else {
            renderStatus(
              chrome.i18n
                .getMessage("openInCurrentTab", [langFrom, langTo])
            );
            chrome.tabs.update({
              url: urlTo,
            });
          }
        } else renderStatus(chrome.i18n.getMessage("languageUnknown"));
      }
    );
  });
});

/// i18n
document.title = chrome.i18n.getMessage("popupTitle");
