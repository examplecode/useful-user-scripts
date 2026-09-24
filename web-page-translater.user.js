// ==UserScript==
// @name         网页翻译器
// @description  微软/谷歌/腾讯/DeepSeek四引擎翻译，支持双语对照翻译，支持划词翻译。
// @version      11.3
// @match        *://*/*
// @match        menu_item.page_trans
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @connect      translate.googleapis.com
// @connect      translate-pa.googleapis.com
// @connect      transmart.qq.com
// @connect      edge.microsoft.com
// @connect      api.deepseek.com
// @run-at       document-end
// @namespace    https://greasyfork.org/users/452911
// @downloadURL https://update.greasyfork.org/scripts/573432/%E7%BD%91%E9%A1%B5%E7%BF%BB%E8%AF%91%E5%99%A8.user.js
// @updateURL https://update.greasyfork.org/scripts/573432/%E7%BD%91%E9%A1%B5%E7%BF%BB%E8%AF%91%E5%99%A8.meta.js
// ==/UserScript==

(async () => {
  'use strict';

  try {
    if (document.contentType === 'application/xml') {
      return;
    }
  } catch (_) {}

  const deviceLang = (navigator.language || navigator.userLanguage || 'zh-CN').split('-')[0];

  const [
    _engine,
    _targetLang,
    _autoMode,
    _excludedHosts,
    _displayMode,
    _pos,
    _forceTranslate,
    _enableSelection,
    _interactionMode,
    _lastTransMode,
    _snapOffset,
    _dsKey,
    _dsModel
  ] = await Promise.all([
    GM_getValue('engine', 'microsoft'),
    GM_getValue('targetLang', deviceLang === 'zh' ? 'zh-CN' : deviceLang),
    GM_getValue('autoMode', true),
    GM_getValue('excludedHosts', '[]'),
    GM_getValue('displayMode', 'translated'),
    GM_getValue('uiPos', JSON.stringify({ right: 20, bottom: 20 })),
    GM_getValue('forceTranslate', false),
    GM_getValue('enableSelection', true),
    GM_getValue('interactionMode', 'classic'),
    GM_getValue('lastTransMode', 'translated'),
    GM_getValue('snapOffset', -21),
    GM_getValue('deepseekApiKey', ''),
    GM_getValue('deepseekModel', 'deepseek-chat')
  ]);

  const ALL_LANGUAGES = {
    "zh-CN": "中文（简体）",
    "zh-TW": "中文（繁體）",
    "en": "English",
    "ja": "日本語",
    "ko": "한국어",
    "fr": "Français",
    "de": "Deutsch",
    "es": "Español",
    "ru": "Русский",
    "pt": "Português",
    "ar": "العربية",
    "th": "ไทย",
    "vi": "Tiếng Việt",
    "it": "Italiano",
    "tr": "Türkçe",
    "id": "Indonesia",
    "ms": "Bahasa Melayu",
    "nl": "Nederlands",
    "pl": "Polski",
    "uk": "Українська",
    "cs": "Čeština",
    "sk": "Slovenčina",
    "hu": "Magyar",
    "ro": "Română",
    "bg": "Български",
    "hr": "Hrvatski",
    "sr": "Српски",
    "sl": "Slovenščina",
    "lt": "Lietuvių",
    "lv": "Latviešu",
    "et": "Eesti",
    "fi": "Suomi",
    "sv": "Svenska",
    "da": "Dansk",
    "no": "Norsk",
    "is": "Íslenska",
    "el": "Ελληνικά",
    "he": "עברית",
    "hi": "हिन्दी",
    "bn": "বাংলা",
    "ta": "தமிழ்",
    "te": "తెలుగు",
    "kn": "ಕನ್ನಡ",
    "ml": "മലയാളം",
    "pa": "ਪੰਜਾਬੀ",
    "gu": "ગુજરાતી",
    "mr": "मराठी",
    "ne": "नेपाली",
    "si": "සිංහල",
    "ur": "اردو",
    "fa": "فارسی",
    "ps": "پښتو",
    "my": "မြန်မာ",
    "km": "ខ្មែរ",
    "lo": "ລາວ",
    "ka": "ქართული",
    "hy": "Հայերեն",
    "az": "Azərbaycan",
    "kk": "Қазақ",
    "uz": "Oʻzbek",
    "mn": "Монгол",
    "sq": "Shqip",
    "mk": "Македонски",
    "be": "Беларуская",
    "bs": "Bosanski",
    "ca": "Català",
    "gl": "Galego",
    "eu": "Euskara",
    "mt": "Malti",
    "cy": "Cymraeg",
    "ga": "Gaeilge",
    "gd": "Gàidhlig",
    "lb": "Lëtzebuergesch",
    "af": "Afrikaans",
    "sw": "Kiswahili",
    "ha": "Hausa",
    "ig": "Igbo",
    "yo": "Yorùbá",
    "zu": "isiZulu",
    "xh": "isiXhosa",
    "sn": "chiShona",
    "st": "Sesotho",
    "so": "Soomaali",
    "am": "አማርኛ",
    "ti": "ትግርኛ",
    "om": "Oromoo",
    "mg": "Malagasy",
    "ny": "Chichewa",
    "lg": "Luganda",
    "rw": "Kinyarwanda",
    "tg": "Тоҷикӣ",
    "tk": "Türkmen",
    "ky": "Кыргызча",
    "tt": "Татар",
    "eo": "Esperanto",
    "la": "Latina",
    "co": "Corsu",
    "fy": "Frysk",
    "haw": "ʻŌlelo Hawaiʻi",
    "sm": "Gagana Samoa",
    "mi": "Te Reo Māori",
    "ceb": "Cebuano",
    "fil": "Filipino",
    "jv": "Basa Jawa",
    "su": "Basa Sunda",
    "hmn": "Hmong",
    "ht": "Kreyòl Ayisyen",
    "ku": "Kurdî",
    "ckb": "کوردی",
    "sd": "سنڌي",
    "or": "ଓଡ଼ିଆ",
    "as": "অসমীয়া",
    "sa": "संस्कृतम्",
    "mai": "मैथिली",
    "bho": "भोजपुरी",
    "doi": "डोगरी",
    "ug": "ئۇيغۇرچە",
    "dv": "ދިވެހި",
    "ak": "Akan",
    "ee": "Eʋegbe",
    "gn": "Guarani",
    "ay": "Aymar",
    "bm": "Bamanankan",
    "ln": "Lingála",
    "nso": "Sepedi",
    "ts": "Xitsonga",
    "qu": "Runasimi",
    "ilo": "Ilokano",
    "kri": "Krio",
    "lus": "Mizo tawng",
    "mni-Mtei": "ꯃꯤꯇꯩꯂꯣꯟ",
    "gom": "कोंकणी",
    "ab": "Аԥсуа",
    "ace": "Bahsa Acèh",
    "ach": "Lwo",
    "aa": "Qafaraf",
    "alz": "Alur",
    "av": "Авар",
    "awa": "अवधी",
    "ban": "ᬩᬮᬶ",
    "bal": "بلوچی",
    "bci": "Baoulé",
    "ba": "Башҡорт",
    "btx": "Batak Karo",
    "bts": "Batak Simalungun",
    "bbc": "Batak Toba",
    "bem": "Bemba",
    "bew": "Betawi",
    "bik": "Bikol",
    "br": "Brezhoneg",
    "bua": "Буряад",
    "yue": "粵語",
    "ch": "Chamoru",
    "ce": "Нохчийн",
    "chk": "Chuukese",
    "cv": "Чӑваш",
    "crh": "Qırımtatar",
    "prs": "دری",
    "din": "Thuɔŋjäŋ",
    "dov": "Dombe",
    "dyu": "Julakan",
    "dz": "རྫོང་ཁ",
    "fo": "Føroyskt",
    "fj": "Na Vosa Vakaviti",
    "fon": "Fɔ̀ngbè",
    "fr-CA": "Français (Canada)",
    "fur": "Furlan",
    "ff": "Pulaar",
    "gaa": "Gã",
    "cnh": "Lai",
    "hil": "Hiligaynon",
    "hrx": "Hunsrik",
    "iba": "Iban",
    "iu-Latn": "ᐃᓄᒃᑎᑐᑦ (Latin)",
    "jam": "Jamaican Patois",
    "kac": "Jingpo",
    "kl": "Kalaallisut",
    "kr": "Kanuri",
    "pam": "Kapampangan",
    "kha": "Khasi",
    "cgg": "Rukiga",
    "kg": "Kikongo",
    "mkw": "Kituba",
    "trp": "Kokborok",
    "kv": "Коми",
    "ltg": "Latgaļu",
    "lij": "Lìgure",
    "li": "Limburgs",
    "lmo": "Lombard",
    "luo": "Dholuo",
    "mad": "Madhurâ",
    "mak": "Makassar",
    "ms-Arab": "بهاس ملايو",
    "mam": "Mam",
    "gv": "Gaelg",
    "mh": "Kajin Majōl",
    "mwr": "मारवाड़ी",
    "mfe": "Kreol Morisien",
    "chm": "Марий",
    "min": "Minangkabau",
    "nhe": "Nahuatl",
    "ndc-ZW": "Ndau",
    "nr": "isiNdebele",
    "new": "नेपाल भाषा",
    "nqo": "ߒߞߏ",
    "nus": "Thok Nath",
    "oc": "Occitan",
    "os": "Ирон",
    "pag": "Pangasinan",
    "pap": "Papiamento",
    "pa-Arab": "پنجابی",
    "kek": "Qʼeqchiʼ",
    "rom": "Romani",
    "rn": "Ikirundi",
    "se": "Davvisámiegiela",
    "sg": "Sängö",
    "bo": "བོད་ཡིག",
    "dsb": "Dolnoserbšćina",
    "hsb": "Hornoserbšćina",
    "ikt": "Inuinnaqtun",
    "iu": "ᐃᓄᒃᑎᑐᑦ",
    "lzh": "文言文",
    "mvf": "ᠮᠣᠩᠭᠣᠯ",
    "brx": "बर'",
    "hne": "छत्तीसगढ़ी",
    "ks": "कॉशुर",
    "mrj": "Мары",
    "sa-Latn": "Sanskrit (Latin)",
    "sc": "Sardu",
    "scn": "Sicilianu",
    "szl": "Ślůnski",
    "su-Latn": "Sunda (Latin)",
    "tcy": "ತುಳು",
    "vec": "Vèneto",
    "war": "Winaray",
    "wo": "Wolof",
    "zap": "Zapotec",
    "ms-Latn": "Malay (Latin)"
  };

  const LANG_GROUPS = {
    "常用": ["zh-CN", "zh-TW", "en", "ja", "ko", "fr", "de", "es", "ru", "pt", "ar", "th", "vi", "it", "tr", "id"],
    "欧洲": ["nl", "pl", "uk", "cs", "sk", "hu", "ro", "bg", "hr", "sr", "sl", "lt", "lv", "et", "fi", "sv", "da", "no", "is", "el", "be", "bs", "ca", "gl", "eu", "mt", "cy", "ga", "gd", "lb", "af", "eo", "la", "co", "fy", "fo", "br", "oc", "sc", "scn", "szl", "fur", "lij", "lmo", "li", "vec", "ltg", "dsb", "hsb", "gv", "se"],
    "亚洲": ["hi", "bn", "ta", "te", "kn", "ml", "pa", "gu", "mr", "ne", "si", "ur", "fa", "ps", "my", "km", "lo", "ka", "hy", "az", "kk", "uz", "mn", "tg", "tk", "ky", "tt", "ug", "dv", "or", "as", "sa", "mai", "bho", "doi", "mni-Mtei", "gom", "awa", "ks", "brx", "hne", "mwr", "trp", "kac", "kha", "bo", "dz", "yue", "lzh", "ms", "fil", "ceb", "jv", "su", "hmn", "ilo", "hil", "bik", "pam", "pag", "war", "ban", "mad", "mak", "min", "ace", "btx", "bts", "bbc", "bew", "iba", "ms-Arab"],
    "非洲": ["sw", "ha", "ig", "yo", "zu", "xh", "sn", "st", "so", "am", "ti", "om", "mg", "ny", "lg", "rw", "ak", "ee", "bm", "ln", "nso", "ts", "kri", "wo", "ff", "gaa", "fon", "bci", "dyu", "bem", "luo", "sg", "kg", "mkw", "dov", "nus", "din", "ach", "alz", "ndc-ZW", "nr", "rn", "mfe"],
    "美洲/大洋洲": ["pt-PT", "fr-CA", "ht", "qu", "gn", "ay", "haw", "sm", "mi", "fj", "mh", "ch", "chk", "jam", "nhe", "mam", "kek", "pap", "hrx", "ikt", "iu", "iu-Latn", "kl"],
    "其他": ["ab", "av", "ba", "bua", "ce", "cv", "crh", "kv", "chm", "mrj", "os", "rom", "nqo", "aa", "bal", "cnh", "kr", "prs", "pa-Arab", "sd", "ckb", "ku", "he"]
  };

  const Utils = {
    escapeHTML(t) {
      const d = document.createElement('div');
      d.appendChild(document.createTextNode(t));
      return d.innerHTML;
    },
    unescapeHTML(t) {
      const d = new DOMParser().parseFromString(t, 'text/html');
      return d.documentElement.textContent;
    }
  };

  function gmFetch(opts) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        timeout: 20000,
        ...opts,
        onload: resolve,
        onerror: reject,
        ontimeout: reject
      });
    });
  }

  // ══════════ 持久化缓存 ══════════
  const CACHE_KEY = 'translationCache';
  const MAX_CACHE = 5000;
  const cache = new Map();
  let _cacheDirty = false;
  let _cacheSaveTimer = null;

  (function loadCache() {
    try {
      const raw = GM_getValue(CACHE_KEY, '');
      if (!raw) {
        return;
      }
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object') {
        for (const k in obj) {
          const it = obj[k];
          if (typeof it === 'string') {
            cache.set(k, { v: it, t: Date.now() });
          } else if (it && it.v) {
            cache.set(k, { v: it.v, t: it.t || Date.now() });
          }
        }
        console.log('[翻译缓存] 已恢复', cache.size, '条');
      }
    } catch (e) {
      console.warn('[翻译缓存] 恢复失败:', e);
    }
  })();

  function scheduleSaveCache() {
    _cacheDirty = true;
    if (_cacheSaveTimer) {
      return;
    }
    _cacheSaveTimer = setTimeout(() => {
      _cacheSaveTimer = null;
      if (!_cacheDirty) {
        return;
      }
      _cacheDirty = false;
      try {
        const obj = {};
        for (const [k, it] of cache) {
          obj[k] = it;
        }
        GM_setValue(CACHE_KEY, JSON.stringify(obj));
      } catch (e) {
        console.warn('[翻译缓存] 保存失败:', e);
      }
    }, 1500);
  }

  function cacheGet(t) {
    const it = cache.get(t);
    if (it && typeof it === 'object') {
      return it.v;
    }
    return it;
  }

  function cacheSet(t, v) {
    if (cache.size >= MAX_CACHE) {
      const sorted = [...cache.entries()].sort((a, b) => (a[1].t || 0) - (b[1].t || 0));
      const n = Math.max(1, Math.floor(MAX_CACHE * 0.1));
      for (let i = 0; i < n; i++) {
        if (sorted[i]) {
          cache.delete(sorted[i][0]);
        }
      }
    }
    cache.set(t, { v, t: Date.now() });
    scheduleSaveCache();
  }

  function clearCache() {
    cache.clear();
    _cacheDirty = false;
    if (_cacheSaveTimer) {
      clearTimeout(_cacheSaveTimer);
      _cacheSaveTimer = null;
    }
    try {
      GM_setValue(CACHE_KEY, '');
    } catch (e) {}
    console.log('[翻译缓存] 已清空');
  }

  window.addEventListener('beforeunload', () => {
    if (_cacheDirty) {
      try {
        const obj = {};
        for (const [k, it] of cache) {
          obj[k] = it;
        }
        GM_setValue(CACHE_KEY, JSON.stringify(obj));
      } catch (e) {}
    }
  });

  // ══════════ Google Auth ══════════
  const GoogleHelper_v2 = {
    _lastRequestAuthTime: null,
    _translateAuth: null,
    _authNotFound: false,
    _authPromise: null,

    get translateAuth() {
      return this._translateAuth;
    },

    _getAlternativeKey() {
      return new TextDecoder().decode(new Uint8Array([
        65, 73, 122, 97, 83, 121, 65, 84, 66, 88, 97, 106, 118, 122,
        81, 76, 84, 68, 72, 69, 81, 98, 99, 112, 113, 48, 73, 104,
        101, 48, 118, 87, 68, 72, 109, 79, 53, 50, 48
      ]));
    },

    async findAuth() {
      if (this._authPromise) {
        return await this._authPromise;
      }

      this._authPromise = new Promise((resolve) => {
        let needUpdate = false;

        if (this._lastRequestAuthTime) {
          const d = new Date();
          if (this._translateAuth) {
            d.setMinutes(d.getMinutes() - 20);
          } else if (this._authNotFound) {
            d.setMinutes(d.getMinutes() - 5);
          } else {
            d.setMinutes(d.getMinutes() - 1);
          }
          if (d.getTime() > this._lastRequestAuthTime) {
            needUpdate = true;
          }
        } else {
          needUpdate = true;
        }

        if (needUpdate) {
          this._lastRequestAuthTime = Date.now();
          const altKey = this._getAlternativeKey();

          GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://translate.googleapis.com/_/translate_http/_/js/k=translate_http.tr.en_US.YusFYy3P_ro.O/am=AAg/d=1/exm=el_conf/ed=1/rs=AN8SPfq1Hb8iJRleQqQc8zhdzXmF9E56eQ/m=el_main',
            timeout: 8000,
            onload: (r) => {
              if (r.responseText && r.responseText.length > 1) {
                const m = r.responseText.match(/['"]x-goog-api-key['"]\s*:\s*['"](\w{39})['"]/i);
                if (m && m.length === 2) {
                  this._translateAuth = m[1];
                  this._authNotFound = false;
                } else {
                  this._authNotFound = true;
                  this._translateAuth = altKey;
                }
              } else {
                this._authNotFound = true;
                this._translateAuth = altKey;
              }
              resolve();
            },
            onerror: () => {
              this._translateAuth = altKey;
              resolve();
            },
            ontimeout: () => {
              this._translateAuth = altKey;
              resolve();
            }
          });
        } else {
          resolve();
        }
      });

      const p = this._authPromise;
      p.finally(() => {
        this._authPromise = null;
      });

      return await p;
    }
  };

  const GoogleHelper = {
    googleTranslateTKK: "448487.932609646",

    shiftLeftOrRightThenSumOrXor(num, optString) {
      for (let i = 0; i < optString.length - 2; i += 3) {
        let acc = optString.charAt(i + 2);
        acc = ("a" <= acc) ? acc.charCodeAt(0) - 87 : Number(acc);
        acc = (optString.charAt(i + 1) === "+") ? num >>> acc : num << acc;
        num = (optString.charAt(i) === "+") ? (num + acc) & 4294967295 : num ^ acc;
      }
      return num;
    },

    transformQuery(query) {
      const b = [];
      let idx = 0;
      for (let i = 0; i < query.length; i++) {
        let c = query.charCodeAt(i);
        if (128 > c) {
          b[idx++] = c;
        } else {
          if (2048 > c) {
            b[idx++] = (c >> 6) | 192;
          } else {
            if (55296 === (c & 64512) && i + 1 < query.length && 56320 === (query.charCodeAt(i + 1) & 64512)) {
              c = 65536 + ((c & 1023) << 10) + (query.charCodeAt(++i) & 1023);
              b[idx++] = (c >> 18) | 240;
              b[idx++] = ((c >> 12) & 63) | 128;
            } else {
              b[idx++] = (c >> 12) | 224;
            }
            b[idx++] = ((c >> 6) & 63) | 128;
          }
          b[idx++] = (c & 63) | 128;
        }
      }
      return b;
    },

    calcHash(query) {
      const s = this.googleTranslateTKK.split(".");
      const tkkIdx = Number(s[0]) || 0;
      const tkkKey = Number(s[1]) || 0;
      const bytes = this.transformQuery(query);
      let enc = tkkIdx;

      for (const item of bytes) {
        enc += item;
        enc = this.shiftLeftOrRightThenSumOrXor(enc, "+-a^+6");
      }

      enc = this.shiftLeftOrRightThenSumOrXor(enc, "+-3^+b+-f");
      enc ^= tkkKey;

      if (enc <= 0) {
        enc = (enc & 2147483647) + 2147483648;
      }

      const n = enc % 1000000;
      return n.toString() + "." + (n ^ tkkIdx);
    }
  };

  // ══════════ 微软引擎 ══════════
  const MicrosoftHelper = {
    name: 'Microsoft',

    _fixLang(lang) {
      const map = {
        'zh-CN': 'zh-Hans',
        'zh-TW': 'zh-Hant',
        'zh-Hans': 'zh-Hans',
        'zh-Hant': 'zh-Hant',
        'pt-PT': 'pt',
        'pt-BR': 'pt'
      };
      return map[lang] || lang.split('-')[0];
    },

    async translate(text, toLang) {
      const targetTl = this._fixLang(toLang);
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: 'POST',
          url: `https://edge.microsoft.com/translate/translatetext?from=&to=${targetTl}&isEnterpriseClient=false`,
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'sec-ch-ua': '"Microsoft Edge";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
            'sec-mesh-client-os': 'Windows',
            'sec-mesh-client-edge-channel': 'stable',
            'sec-mesh-client-edge-version': '123.0.0.0',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0'
          },
          data: JSON.stringify([text]),
          timeout: 10000,
          onload(res) {
            if (res.status >= 200 && res.status < 300) {
              try {
                const data = JSON.parse(res.responseText);
                let translation = '';
                if (Array.isArray(data) && data[0]) {
                  if (data[0].translations && data[0].translations[0]) {
                    translation = data[0].translations[0].text;
                  } else if (typeof data[0] === 'string') {
                    translation = data[0];
                  }
                }
                if (translation) {
                  resolve(translation);
                } else {
                  reject(new Error('微软翻译未返回有效译文'));
                }
              } catch (e) {
                reject(new Error('微软翻译数据解析失败: ' + e.message));
              }
            } else {
              reject(new Error(`微软翻译请求失败 (HTTP ${res.status})`));
            }
          },
          ontimeout() {
            reject(new Error('微软翻译请求超时'));
          },
          onerror() {
            reject(new Error('微软翻译网络连接失败'));
          }
        });
      });
    },

    async translateBatch(texts, toLang) {
      const targetTl = this._fixLang(toLang);
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: 'POST',
          url: `https://edge.microsoft.com/translate/translatetext?from=&to=${targetTl}&isEnterpriseClient=false`,
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'sec-ch-ua': '"Microsoft Edge";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
            'sec-mesh-client-os': 'Windows',
            'sec-mesh-client-edge-channel': 'stable',
            'sec-mesh-client-edge-version': '123.0.0.0',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0'
          },
          data: JSON.stringify(texts),
          timeout: 15000,
          onload(res) {
            if (res.status >= 200 && res.status < 300) {
              try {
                const data = JSON.parse(res.responseText);
                const results = [];
                if (Array.isArray(data)) {
                  for (const item of data) {
                    if (item.translations && item.translations[0]) {
                      results.push(item.translations[0].text);
                    } else if (typeof item === 'string') {
                      results.push(item);
                    } else {
                      results.push(null);
                    }
                  }
                  resolve(results);
                } else {
                  reject(new Error('微软批量翻译返回格式异常'));
                }
              } catch (e) {
                reject(new Error('微软批量翻译数据解析失败: ' + e.message));
              }
            } else {
              reject(new Error(`微软批量翻译请求失败 (HTTP ${res.status})`));
            }
          },
          ontimeout() {
            reject(new Error('微软批量翻译请求超时'));
          },
          onerror() {
            reject(new Error('微软批量翻译网络连接失败'));
          }
        });
      });
    }
  };

  // ══════════ Google 引擎 ══════════
  const GoogleEngine_v2 = {
    name: 'Google (v2)',

    _fixLang(lang) {
      return lang === "prs" ? "fa-AF" : lang;
    },

    _transformResponse(result, dontSort) {
      if (result.indexOf("<pre>") !== -1) {
        result = result.replace("<pre>", "");
        const i = result.indexOf(">");
        result = result.slice(i + 1);
      }

      const sentences = [];
      let idx = 0;
      while (true) {
        const s = result.indexOf("<b>", idx);
        if (s === -1) {
          break;
        }
        const e = result.indexOf("</b>", s);
        if (e === -1) {
          sentences.push(result.slice(s + 3));
          break;
        } else {
          sentences.push(result.slice(s + 3, e));
        }
        idx = e;
      }

      result = sentences.length > 0 ? sentences.join(" ") : result;
      result = result.replace(/<\/b>/g, "");

      let resultArray = [];
      let lastEnd = 0;

      for (const r of result.matchAll(/(<a i="[0-9]+">)([^<>]*(?=<\/a>))*/g)) {
        const fl = r[0].length;
        const pos = r.index;
        if (pos > lastEnd) {
          resultArray.push(r[1] + result.slice(lastEnd, pos).replace(/<\/a>/g, "") + (r[2] || ""));
        } else {
          resultArray.push(r[0]);
        }
        lastEnd = pos + fl;
      }

      let indexes;
      if (resultArray.length > 0) {
        indexes = resultArray
          .map(v => parseInt(v.match(/[0-9]+(?=>)/g)?.[0]))
          .filter(v => !isNaN(v));
        resultArray = resultArray.map(v => v.slice(v.indexOf(">") + 1));
      } else {
        resultArray = [result];
        indexes = [0];
      }

      resultArray = resultArray.map(v => Utils.unescapeHTML(v));

      if (dontSort) {
        return resultArray;
      }

      const final = [];
      for (const j in indexes) {
        if (final[indexes[j]]) {
          final[indexes[j]] += " " + resultArray[j];
        } else {
          final[indexes[j]] = resultArray[j];
        }
      }

      return final;
    },

    async translate(text, toLang) {
      const to = this._fixLang(toLang);
      await GoogleHelper_v2.findAuth();

      if (!GoogleHelper_v2.translateAuth) {
        throw new Error('No auth');
      }

      const r = await gmFetch({
        method: 'POST',
        url: 'https://translate-pa.googleapis.com/v1/translateHtml',
        headers: {
          'Content-Type': 'application/json+protobuf',
          'X-Goog-Api-Key': GoogleHelper_v2.translateAuth
        },
        data: JSON.stringify([[[text], "auto", to], "te"]),
      });

      if (r.status !== 200) {
        throw new Error('v2 error: ' + r.status);
      }

      const data = JSON.parse(r.responseText);
      if (data && data[0]) {
        const raw = Array.isArray(data[0]) ? data[0][0] : data[0];
        const parsed = this._transformResponse(raw, false);
        return parsed[0] || raw;
      }

      throw new Error('v2 empty');
    },

    async translateBatch(texts, toLang) {
      const to = this._fixLang(toLang);
      await GoogleHelper_v2.findAuth();

      if (!GoogleHelper_v2.translateAuth) {
        throw new Error('No auth');
      }

      const r = await gmFetch({
        method: 'POST',
        url: 'https://translate-pa.googleapis.com/v1/translateHtml',
        headers: {
          'Content-Type': 'application/json+protobuf',
          'X-Goog-Api-Key': GoogleHelper_v2.translateAuth
        },
        data: JSON.stringify([[texts, "auto", to], "te"]),
      });

      if (r.status !== 200) {
        throw new Error('v2 batch error: ' + r.status);
      }

      const data = JSON.parse(r.responseText);

      if (data && data[0] && Array.isArray(data[0])) {
        return data[0].map(item => {
          const p = this._transformResponse(item, false);
          return p[0] || item;
        });
      }

      if (data && data[0]) {
        const p = this._transformResponse(Array.isArray(data[0]) ? data[0][0] : data[0], false);
        return [p[0]];
      }

      throw new Error('v2 batch empty');
    }
  };

  const GoogleEngine_legacy = {
    name: 'Google (Legacy)',

    async translate(text, toLang) {
      const tk = GoogleHelper.calcHash(text);
      const r = await gmFetch({
        method: 'GET',
        url: 'https://translate.googleapis.com/translate_a/single?client=webapp&sl=auto&tl=' + toLang + '&hl=' + toLang + '&dt=t&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=at&ie=UTF-8&oe=UTF-8&otf=1&ssel=0&tsel=0&kc=7&tk=' + tk + '&q=' + encodeURIComponent(text),
      });

      if (r.status !== 200) {
        return await this._gtx(text, toLang);
      }

      const data = JSON.parse(r.responseText);
      return data[0].filter(s => s && s[0]).map(s => s[0]).join('');
    },

    async _gtx(text, to) {
      const r = await gmFetch({
        method: 'GET',
        url: 'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=auto&tl=' + to + '&q=' + encodeURIComponent(text)
      });

      if (r.status !== 200) {
        throw new Error('gtx error');
      }

      const data = JSON.parse(r.responseText);
      return data[0].filter(s => s && s[0]).map(s => s[0]).join('');
    }
  };

  const GoogleEngine = {
    name: 'Google (Auto)',

    async translate(text, toLang) {
      try {
        return await GoogleEngine_v2.translate(text, toLang);
      } catch (e) {
        return await GoogleEngine_legacy.translate(text, toLang);
      }
    },

    async translateBatch(texts, toLang) {
      try {
        return await GoogleEngine_v2.translateBatch(texts, toLang);
      } catch (e) {
        const res = [];
        for (const t of texts) {
          try {
            res.push(await GoogleEngine_legacy.translate(t, toLang));
          } catch (_) {
            res.push(null);
          }
        }
        return res;
      }
    }
  };

  // ══════════ 腾讯引擎 ══════════
  const TencentHelper = {
    name: 'Tencent',
    _clientKey: null,

    getClientKey() {
      if (this._clientKey) {
        return this._clientKey;
      }
      this._clientKey = 'browser-chrome-120.0-Windows_10-' + crypto.randomUUID() + '-' + Date.now();
      return this._clientKey;
    },

    langCode(l) {
      const m = {
        'zh': 'zh',
        'zh-CN': 'zh',
        'zh-TW': 'zh-TW'
      };
      return m[l] || l;
    },

    async translate(text, toLang) {
      const to = this.langCode(toLang);
      const r = await gmFetch({
        method: 'POST',
        url: 'https://transmart.qq.com/api/imt',
        headers: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          header: {
            fn: 'auto_translation',
            session: '',
            client_key: this.getClientKey(),
            user: ''
          },
          type: 'plain',
          model_category: 'normal',
          text_domain: 'general',
          source: {
            lang: 'auto',
            text_list: [text]
          },
          target: {
            lang: to
          }
        }),
      });

      if (r.status !== 200) {
        throw new Error('Tencent error');
      }

      return JSON.parse(r.responseText).auto_translation[0];
    },

    async translateBatch(texts, toLang) {
      const to = this.langCode(toLang);
      const r = await gmFetch({
        method: 'POST',
        url: 'https://transmart.qq.com/api/imt',
        headers: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          header: {
            fn: 'auto_translation',
            session: '',
            client_key: this.getClientKey(),
            user: ''
          },
          type: 'plain',
          model_category: 'normal',
          text_domain: 'general',
          source: {
            lang: 'auto',
            text_list: texts
          },
          target: {
            lang: to
          }
        }),
      });

      if (r.status !== 200) {
        throw new Error('Tencent batch error');
      }

      return JSON.parse(r.responseText).auto_translation;
    }
  };

  // ══════════ DeepSeek 引擎 ══════════
  const DeepSeekHelper = {
    name: 'DeepSeek',
    _apiKey: _dsKey,
    _model: _dsModel,

    _reloadConfig() {
      this._apiKey = GM_getValue('deepseekApiKey', '');
      this._model = GM_getValue('deepseekModel', 'deepseek-chat');
    },

    _saveConfig(apiKey, model) {
      this._apiKey = apiKey;
      this._model = model;
      GM_setValue('deepseekApiKey', apiKey);
      GM_setValue('deepseekModel', model);
    },

    isConfigured() {
      this._reloadConfig();
      return !!(this._apiKey && this._apiKey.trim());
    },

    _getLangName(langCode) {
      return ALL_LANGUAGES[langCode] || langCode;
    },

    _buildSystemPrompt(toLang) {
      const langName = this._getLangName(toLang);
      return `你是一个专业的翻译引擎。请将用户输入的文本翻译成${langName}。要求：\n1. 只输出翻译结果，不要添加任何解释、注释或额外内容。\n2. 保持原文的格式、换行和标点符号。\n3. 准确传达原文的含义和语气。\n4. 如果是专有名词或技术术语，保留原文或使用最通用的译法。\n5. 不要翻译代码、URL、邮箱地址等不需要翻译的内容。`;
    },

    async translate(text, toLang) {
      this._reloadConfig();

      if (!this._apiKey) {
        throw new Error('DeepSeek API Key 未设置，请点击设置按钮配置');
      }

      const systemPrompt = this._buildSystemPrompt(toLang);
      const model = this._model || 'deepseek-chat';

      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: 'POST',
          url: 'https://api.deepseek.com/chat/completions',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this._apiKey}`
          },
          data: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: text }
            ],
            temperature: 0.1,
            max_tokens: Math.max(text.length * 3, 200),
            stream: false
          }),
          timeout: 30000,
          onload: (res) => {
            if (res.status >= 200 && res.status < 300) {
              try {
                const data = JSON.parse(res.responseText);
                const content = data.choices?.[0]?.message?.content;
                if (content && content.trim()) {
                  let t = content.trim();
                  t = t.replace(/^(翻译[：:]\s*|译文[：:]\s*|Translation:\s*|Translated text:\s*)/i, '');
                  if (
                    (t.startsWith('"') && t.endsWith('"')) ||
                    (t.startsWith('「') && t.endsWith('」')) ||
                    (t.startsWith('『') && t.endsWith('』'))
                  ) {
                    t = t.slice(1, -1);
                  }
                  resolve(t.trim());
                } else {
                  reject(new Error('DeepSeek 返回内容为空'));
                }
              } catch (e) {
                reject(new Error('DeepSeek 响应解析失败: ' + e.message));
              }
            } else {
              let errMsg = `DeepSeek API 请求失败 (HTTP ${res.status})`;
              try {
                const errData = JSON.parse(res.responseText);
                if (errData.error && errData.error.message) {
                  errMsg = `DeepSeek API 错误: ${errData.error.message}`;
                }
              } catch (_) {}
              reject(new Error(errMsg));
            }
          },
          ontimeout: () => reject(new Error('DeepSeek 请求超时')),
          onerror: () => reject(new Error('DeepSeek 网络连接失败'))
        });
      });
    },

    async translateBatch(texts, toLang) {
      this._reloadConfig();

      if (!this._apiKey) {
        throw new Error('DeepSeek API Key 未设置，请点击设置按钮配置');
      }

      const langName = this._getLangName(toLang);
      const model = this._model || 'deepseek-chat';
      const systemPrompt = `你是一个专业的翻译引擎。请将用户提供的JSON数组中的每个字符串翻译成${langName}。\n要求：\n1. 返回严格的JSON数组格式，保持与输入数组相同的顺序和长度。\n2. 只返回JSON数组，不要添加任何解释或额外内容。\n3. 保持原文的格式、换行和标点符号。\n4. 准确传达原文的含义和语气。\n5. 不要翻译代码、URL、邮箱地址等不需要翻译的内容。\n6. 如果某个元素不需要翻译或无法翻译，返回原文。`;
      const userContent = JSON.stringify(texts);

      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: 'POST',
          url: 'https://api.deepseek.com/chat/completions',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this._apiKey}`
          },
          data: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userContent }
            ],
            temperature: 0.1,
            max_tokens: Math.max(texts.reduce((s, t) => s + t.length, 0) * 3, 1000),
            stream: false
          }),
          timeout: 60000,
          onload: (res) => {
            if (res.status >= 200 && res.status < 300) {
              try {
                const data = JSON.parse(res.responseText);
                let content = data.choices?.[0]?.message?.content;
                if (!content) {
                  reject(new Error('DeepSeek 批量翻译返回为空'));
                  return;
                }
                content = content.trim();
                content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
                const start = content.indexOf('[');
                const end = content.lastIndexOf(']');
                if (start !== -1 && end !== -1 && end > start) {
                  content = content.slice(start, end + 1);
                }
                const parsed = JSON.parse(content);
                if (Array.isArray(parsed)) {
                  const result = texts.map((t, i) => parsed[i] !== undefined ? String(parsed[i]) : null);
                  resolve(result);
                } else {
                  reject(new Error('DeepSeek 批量翻译返回格式不是数组'));
                }
              } catch (e) {
                console.warn('DeepSeek 批量解析失败，回退逐条翻译:', e);
                this._fallbackBatch(texts, toLang).then(resolve).catch(reject);
              }
            } else {
              let errMsg = `DeepSeek 批量请求失败 (HTTP ${res.status})`;
              try {
                const errData = JSON.parse(res.responseText);
                if (errData.error && errData.error.message) {
                  errMsg = `DeepSeek API 错误: ${errData.error.message}`;
                }
              } catch (_) {}
              reject(new Error(errMsg));
            }
          },
          ontimeout: () => reject(new Error('DeepSeek 批量翻译请求超时')),
          onerror: () => reject(new Error('DeepSeek 网络连接失败'))
        });
      });
    },

    async _fallbackBatch(texts, toLang) {
      const results = [];
      for (const t of texts) {
        try {
          results.push(await this.translate(t, toLang));
        } catch (_) {
          results.push(null);
        }
      }
      return results;
    }
  };

  const VALID_ENGINES = ['microsoft', 'tencent', 'google', 'google_v2', 'google_legacy', 'deepseek'];
  const DEFAULT_ENGINE = 'microsoft';

  const Engine = {
    microsoft: MicrosoftHelper,
    tencent: TencentHelper,
    google: GoogleEngine,
    google_v2: GoogleEngine_v2,
    google_legacy: GoogleEngine_legacy,
    deepseek: DeepSeekHelper
  };

  let currentEngine = _engine;
  if (!VALID_ENGINES.includes(currentEngine)) {
    currentEngine = DEFAULT_ENGINE;
    GM_setValue('engine', DEFAULT_ENGINE);
  }

  let targetLang = _targetLang;
  let autoMode = _autoMode;
  let excludedHosts = JSON.parse(_excludedHosts);
  let displayMode = _displayMode;
  let uiPos = JSON.parse(_pos);
  let forceTranslate = _forceTranslate;
  let enableSelection = _enableSelection;

  let interactionMode = (
    _interactionMode === 'quick' ||
    _interactionMode === 'classic' ||
    _interactionMode === 'hidden'
  ) ? _interactionMode : 'classic';

  let lastTransMode = (_lastTransMode === 'bilingual' || _lastTransMode === 'translated')
    ? _lastTransMode
    : 'translated';

  let snapOffset = Number(_snapOffset) || -21;

  const LONG_PRESS_MS = 500;
  const DRAG_START_PX = 5;
  const LONG_PRESS_CANCEL_PX = 14;
  const FOUR_FINGER_LONG_PRESS_MS = 800;
  const FINGER_MOVE_THRESHOLD = 30;

  function haptic(ms) {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(ms);
      }
    } catch (_) {}
  }

  if (excludedHosts.includes(location.host)) {
    GM_registerMenuCommand('✅ 在此网站重新启用翻译', () => {
      const idx = excludedHosts.indexOf(location.host);
      if (idx > -1) {
        excludedHosts.splice(idx, 1);
      }
      GM_setValue('excludedHosts', JSON.stringify(excludedHosts));
      location.reload();
    });
    return;
  }

  // ══════════ 语言检测 ══════════
  const _langRegex = {};

  function getLangRegex(lang) {
    if (_langRegex[lang]) {
      return _langRegex[lang];
    }

    const patterns = {
      'zh': /^[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\s\d\p{P}]+$/u,
      'en': /^[a-zA-Z\s\d\p{P}]+$/u,
      'ja': /^[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff\s\d\p{P}]+$/u,
      'ko': /^[\uac00-\ud7af\u1100-\u11ff\s\d\p{P}]+$/u,
      'ar': /^[\u0600-\u06ff\u0750-\u077f\s\d\p{P}]+$/u,
      'th': /^[\u0e00-\u0e7f\s\d\p{P}]+$/u,
      'ru': /^[\u0400-\u04ff\s\d\p{P}]+$/u
    };

    _langRegex[lang] = patterns[lang] || null;
    return _langRegex[lang];
  }

  function isTargetLang(text) {
    if (!text || !text.trim()) {
      return true;
    }
    if (forceTranslate) {
      return false;
    }
    const lang = targetLang.split('-')[0];
    const re = getLangRegex(lang);
    return re ? re.test(text.trim()) : false;
  }

  // ══════════ 翻译核心 ══════════
  async function translate(text) {
    if (!text || !text.trim()) {
      return null;
    }

    const trimmed = text.trim();

    if (/^\d+$/.test(trimmed)) {
      return null;
    }

    const cached = cacheGet(trimmed);
    if (cached) {
      return cached;
    }

    try {
      const result = await Engine[currentEngine].translate(trimmed, targetLang);
      if (result && result !== trimmed) {
        cacheSet(trimmed, result);
        return result;
      }
    } catch (e) {
      if (currentEngine === 'deepseek') {
        console.warn('DeepSeek 翻译失败:', e.message);
      }

      const fallbackOrder = ['microsoft', 'tencent', 'google'];
      for (const fallback of fallbackOrder) {
        if (fallback === currentEngine) {
          continue;
        }
        try {
          const result = await Engine[fallback].translate(trimmed, targetLang);
          if (result && result !== trimmed) {
            cacheSet(trimmed, result);
            return result;
          }
        } catch (_) {}
      }
    }

    return null;
  }

  async function batchTranslate(texts) {
    const results = new Array(texts.length).fill(null);
    const uncached = [];
    const uncachedIdx = [];

    for (let i = 0; i < texts.length; i++) {
      const t = texts[i].trim();
      if (!t || /^\d+$/.test(t)) {
        continue;
      }
      const c = cacheGet(t);
      if (c) {
        results[i] = c;
        continue;
      }
      uncached.push(t);
      uncachedIdx.push(i);
    }

    if (uncached.length === 0) {
      return results;
    }

    const engine = Engine[currentEngine];

    if (engine.translateBatch && uncached.length > 1) {
      try {
        const BATCH_SIZE = currentEngine === 'microsoft'
          ? 50
          : (currentEngine === 'tencent'
            ? 50
            : (currentEngine === 'deepseek' ? 15 : 25));

        const chunks = [];
        for (let b = 0; b < uncached.length; b += BATCH_SIZE) {
          chunks.push({
            texts: uncached.slice(b, b + BATCH_SIZE),
            idxs: uncachedIdx.slice(b, b + BATCH_SIZE)
          });
        }

        await Promise.all(chunks.map(async ({ texts: chunk, idxs }) => {
          try {
            const batchResults = await engine.translateBatch(chunk, targetLang);
            if (batchResults) {
              for (let j = 0; j < batchResults.length; j++) {
                if (batchResults[j] && batchResults[j] !== chunk[j]) {
                  cacheSet(chunk[j], batchResults[j]);
                  results[idxs[j]] = batchResults[j];
                }
              }
            }
          } catch (e) {
            console.warn('批量翻译失败，回退逐条:', e.message);
            for (let j = 0; j < chunk.length; j++) {
              try {
                const r = await translate(chunk[j]);
                if (r) {
                  results[idxs[j]] = r;
                }
              } catch (_) {}
            }
          }
        }));

        return results;
      } catch (e) {}
    }

    const CONCURRENCY = 5;
    for (let i = 0; i < uncached.length; i += CONCURRENCY) {
      const batch = uncached.slice(i, i + CONCURRENCY);
      const batchIdx = uncachedIdx.slice(i, i + CONCURRENCY);
      await Promise.allSettled(batch.map(async (text, j) => {
        const r = await translate(text);
        if (r) {
          results[batchIdx[j]] = r;
        }
      }));
    }

    return results;
  }

  // ══════════ 跳过判断 ══════════
  const SKIP_TAGS = /^(script|style|code|pre|svg|math|noscript|iframe|canvas|video|audio|img|br|hr|input|select|option|textarea)$/i;
  const SKIP_CLASS = /translate-ui|notranslate|katex|mathjax/i;

  function shouldSkip(node) {
    if (!node) {
      return true;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      if (SKIP_TAGS.test(node.tagName)) {
        return true;
      }
      if (SKIP_CLASS.test(node.className)) {
        return true;
      }
      if (node.isContentEditable) {
        return true;
      }
      if (node.dataset && node.dataset.translated) {
        return true;
      }
      if (node.classList && node.classList.contains('tu-bi')) {
        return true;
      }
      if (node.classList && node.classList.contains('tu-src')) {
        return true;
      }
      if (node.classList && node.classList.contains('tu-trans')) {
        return true;
      }
    }

    return false;
  }

  function isInlineElement(el) {
    if (!el) {
      return false;
    }
    const tag = el.tagName.toLowerCase();
    const inlineTags = ['a', 'span', 'em', 'strong', 'b', 'i', 'label', 'small', 'sub', 'sup', 'u', 'button'];
    const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const tableTags = ['td', 'th'];
    return inlineTags.includes(tag) || headingTags.includes(tag) || tableTags.includes(tag);
  }

  // ══════════ 标题翻译 ══════════
  let _originalTitle = null;
  let _translatedTitle = null;
  let _isUpdatingTitle = false;
  let _isTranslatingTitle = false;
  let _titleBackup = null;

  function saveOriginalTitle() {
    if (_originalTitle === null) {
      _originalTitle = document.title;
      _titleBackup = document.title;
    }
    return _originalTitle;
  }

  function getCurrentOriginalTitle() {
    if (_originalTitle !== null) {
      return _originalTitle;
    }

    const match = document.title.match(/\((.+)\)$/);
    if (match) {
      _originalTitle = match[1];
      _titleBackup = _originalTitle;
      return _originalTitle;
    }

    _originalTitle = document.title;
    _titleBackup = _originalTitle;
    return _originalTitle;
  }

  async function translateDocumentTitle() {
    if (_isTranslatingTitle) {
      return;
    }
    if (displayMode === 'original') {
      return;
    }
    if (!autoMode) {
      return;
    }

    _isTranslatingTitle = true;

    try {
      const rawTitle = getCurrentOriginalTitle().trim();
      if (!rawTitle) {
        return;
      }
      if (!forceTranslate && isTargetLang(rawTitle)) {
        return;
      }
      if (_translatedTitle && document.title.includes(_translatedTitle)) {
        return;
      }

      const translated = await translate(rawTitle);
      if (!translated || translated === rawTitle) {
        return;
      }

      _translatedTitle = translated;
      _isUpdatingTitle = true;

      if (displayMode === 'bilingual') {
        document.title = `${translated} (${_originalTitle})`;
      } else {
        document.title = translated;
      }

      _isUpdatingTitle = false;
    } finally {
      _isTranslatingTitle = false;
    }
  }

  function restoreDocumentTitle() {
    if (_titleBackup) {
      _isUpdatingTitle = true;
      document.title = _titleBackup;
      _isUpdatingTitle = false;
      _translatedTitle = null;
    } else if (_originalTitle) {
      _isUpdatingTitle = true;
      document.title = _originalTitle;
      _isUpdatingTitle = false;
      _translatedTitle = null;
    }
  }

  function resetTitleState() {
    _originalTitle = document.title;
    _titleBackup = document.title;
    _translatedTitle = null;
    _isTranslatingTitle = false;
  }

  let titleObserver = null;

  function setupTitleObserver() {
    const titleEl = document.querySelector('title');
    if (!titleEl) {
      return;
    }

    saveOriginalTitle();

    if (titleObserver) {
      titleObserver.disconnect();
      titleObserver = null;
    }

    titleObserver = new MutationObserver(() => {
      if (_isUpdatingTitle || _isTranslatingTitle) {
        return;
      }

      const currentTitle = document.title;

      if (_originalTitle && currentTitle !== _originalTitle) {
        const isOurTranslation = _translatedTitle && (
          currentTitle === _translatedTitle ||
          currentTitle === `${_translatedTitle} (${_originalTitle})`
        );

        if (!isOurTranslation) {
          const match = currentTitle.match(/\((.+)\)$/);
          if (match) {
            _originalTitle = match[1];
            _titleBackup = _originalTitle;
          } else {
            _originalTitle = currentTitle;
            _titleBackup = currentTitle;
          }
          _translatedTitle = null;
        }
      }

      if (autoMode && displayMode !== 'original') {
        setTimeout(() => translateDocumentTitle(), 100);
      }
    });

    titleObserver.observe(titleEl, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  // ══════════ 划词翻译 ══════════
  let selectionTooltip = null;
  let lastSelectionText = '';
  let _isTranslatingSelection = false;
  let selectionDebounceTimer = null;
  let selectionMouseUpTimer = null;

  function createSelectionTooltip() {
    if (selectionTooltip) {
      return selectionTooltip;
    }
    selectionTooltip = document.createElement('div');
    selectionTooltip.className = 'tu-selection-tooltip';
    document.body.appendChild(selectionTooltip);
    return selectionTooltip;
  }

  function getTooltipPosition(rect) {
    const tooltip = createSelectionTooltip();
    tooltip.style.display = 'block';
    tooltip.style.opacity = '0';

    const tr = tooltip.getBoundingClientRect();
    const tw = tr.width || 300;
    const th = tr.height || 60;

    tooltip.style.display = 'none';
    tooltip.style.opacity = '1';

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = rect.left + rect.width / 2 - tw / 2;
    left = Math.max(10, Math.min(left, vw - tw - 10));

    const BG = 12;
    const TG = 40;
    const sb = vh - rect.bottom - BG;
    const sa = rect.top - TG;
    const nb = th + BG;
    const na = th + TG;

    let top;

    if (sb >= nb) {
      top = rect.bottom + BG;
    } else if (sa >= na) {
      top = rect.top - th - TG;
    } else {
      top = sa > sb ? Math.max(5, rect.top - th - TG) : Math.min(vh - th - 5, rect.bottom + BG);
    }

    top = Math.max(5, top);
    top = Math.min(top, vh - th - 5);

    return { left, top };
  }

  function showSelectionTranslation(text, translatedText, rect) {
    const tooltip = createSelectionTooltip();

    let dt = translatedText;
    if (dt.length > 200) {
      dt = dt.slice(0, 200) + '...';
    }

    const od = text.length > 50 ? text.slice(0, 50) + '...' : text;

    tooltip.innerHTML = `<div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:4px;">${Utils.escapeHTML(od)}</div><div class="tu-trans-text">${Utils.escapeHTML(dt)}</div>`;

    const pos = getTooltipPosition(rect);
    tooltip.style.left = pos.left + 'px';
    tooltip.style.top = pos.top + 'px';
    tooltip.style.display = 'block';
    tooltip.style.opacity = '1';
  }

  function hideSelectionTooltip() {
    if (selectionTooltip) {
      selectionTooltip.style.display = 'none';
    }
    if (selectionDebounceTimer) {
      clearTimeout(selectionDebounceTimer);
      selectionDebounceTimer = null;
    }
    if (selectionMouseUpTimer) {
      clearTimeout(selectionMouseUpTimer);
      selectionMouseUpTimer = null;
    }
  }

  async function handleSelectionTranslation(text, rect) {
    if (!enableSelection) {
      hideSelectionTooltip();
      return;
    }

    if (!text || text.length < 2) {
      hideSelectionTooltip();
      return;
    }

    if (_isTranslatingSelection) {
      return;
    }

    if (
      text === lastSelectionText &&
      selectionTooltip &&
      selectionTooltip.style.display === 'block'
    ) {
      return;
    }

    lastSelectionText = text;

    if (!forceTranslate && isTargetLang(text)) {
      hideSelectionTooltip();
      return;
    }

    _isTranslatingSelection = true;

    try {
      const tooltip = createSelectionTooltip();
      tooltip.innerHTML = `<div style="color:rgba(255,255,255,0.6);">翻译中...</div>`;

      const pos = getTooltipPosition(rect);
      tooltip.style.left = pos.left + 'px';
      tooltip.style.top = pos.top + 'px';
      tooltip.style.display = 'block';
      tooltip.style.opacity = '1';

      const translated = await translate(text);

      const currentText = window.getSelection().toString().trim();
      if (currentText !== text) {
        hideSelectionTooltip();
        return;
      }

      if (translated && translated !== text) {
        showSelectionTranslation(text, translated, rect);
      } else {
        hideSelectionTooltip();
      }
    } catch (e) {
      console.error('划词翻译失败:', e);
      if (selectionTooltip) {
        selectionTooltip.innerHTML = `<div style="color:#ff6b6b;">翻译失败</div>`;
        setTimeout(() => {
          if (selectionTooltip) {
            selectionTooltip.style.opacity = '0';
            setTimeout(() => {
              if (selectionTooltip) {
                selectionTooltip.style.display = 'none';
              }
            }, 200);
          }
        }, 1500);
      }
    } finally {
      _isTranslatingSelection = false;
    }
  }

  function getSelectionInfo() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    const text = selection.toString().trim();
    if (!text) {
      return null;
    }

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width < 5 || rect.height < 5) {
        return null;
      }
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        return null;
      }
      return { text, rect };
    } catch (e) {
      return null;
    }
  }

  function setupSelectionTranslation() {
    document.addEventListener('mouseup', function (e) {
      if (selectionTooltip && selectionTooltip.contains(e.target)) {
        return;
      }

      if (selectionMouseUpTimer) {
        clearTimeout(selectionMouseUpTimer);
        selectionMouseUpTimer = null;
      }

      requestAnimationFrame(() => {
        selectionMouseUpTimer = setTimeout(() => {
          const info = getSelectionInfo();
          if (info) {
            handleSelectionTranslation(info.text, info.rect);
          } else {
            hideSelectionTooltip();
          }
          selectionMouseUpTimer = null;
        }, 200);
      });
    });

    document.addEventListener('keyup', function (e) {
      if (
        e.key === 'Shift' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'Control' ||
        e.key === 'Meta'
      ) {
        if (selectionMouseUpTimer) {
          clearTimeout(selectionMouseUpTimer);
          selectionMouseUpTimer = null;
        }

        selectionMouseUpTimer = setTimeout(() => {
          const info = getSelectionInfo();
          if (info) {
            handleSelectionTranslation(info.text, info.rect);
          } else {
            hideSelectionTooltip();
          }
          selectionMouseUpTimer = null;
        }, 300);
      }
    });

    document.addEventListener('mousedown', function (e) {
      if (selectionTooltip && selectionTooltip.contains(e.target)) {
        return;
      }
      setTimeout(() => hideSelectionTooltip(), 50);
    });

    window.addEventListener('scroll', () => hideSelectionTooltip(), { passive: true });
    window.addEventListener('resize', () => hideSelectionTooltip(), { passive: true });

    document.addEventListener('click', function (e) {
      if (selectionTooltip && selectionTooltip.contains(e.target)) {
        return;
      }
      hideSelectionTooltip();
    });

    let sct = null;

    document.addEventListener('selectionchange', function () {
      if (!enableSelection) {
        return;
      }
      if (_isTranslatingSelection) {
        return;
      }

      if (sct) {
        clearTimeout(sct);
        sct = null;
      }

      sct = setTimeout(() => {
        const selection = window.getSelection();

        if (!selection || selection.isCollapsed || !selection.toString().trim()) {
          if (selectionTooltip && selectionTooltip.style.display === 'block') {
            if (!selection.toString().trim()) {
              hideSelectionTooltip();
            }
          }
          sct = null;
          return;
        }

        const info = getSelectionInfo();
        if (info) {
          handleSelectionTranslation(info.text, info.rect);
        }

        sct = null;
      }, 150);
    });
  }

  // ══════════ 页面翻译 ══════════
  function collectTextNodes(root) {
    const nodes = [];

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (shouldSkip(node.parentElement)) {
            return NodeFilter.FILTER_REJECT;
          }

          const text = node.textContent.trim();

          if (!text || text.length < 2 || /^\d+$/.test(text)) {
            return NodeFilter.FILTER_REJECT;
          }

          if (!forceTranslate && isTargetLang(text)) {
            return NodeFilter.FILTER_REJECT;
          }

          if (node.parentElement?.classList?.contains('tu-trans')) {
            return NodeFilter.FILTER_REJECT;
          }

          if (node.parentElement?.classList?.contains('tu-src')) {
            return NodeFilter.FILTER_REJECT;
          }

          if (node.parentElement?.dataset?.translated) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    return nodes;
  }

  function collectPlaceholders(root) {
    return [...root.querySelectorAll('input[placeholder], textarea[placeholder]')].filter(el => {
      if (el.dataset.translated) {
        return false;
      }

      const text = el.placeholder.trim();

      if (!text) {
        return false;
      }

      if (!forceTranslate && isTargetLang(text)) {
        return false;
      }

      return true;
    });
  }

  let isTranslating = false;
  let pendingRoot = null;
  let translateCounter = 0;

  function renderTranslation(originalText, translatedText, node) {
    if (!translatedText || translatedText === originalText) {
      return;
    }

    const parent = node.parentElement;
    if (!parent) {
      return;
    }

    const container = document.createElement('span');
    container.className = 'tu-container';
    container.dataset.translated = '1';

    const srcSpan = document.createElement('span');
    srcSpan.className = 'tu-src';
    srcSpan.textContent = originalText;

    const transSpan = document.createElement('span');
    transSpan.className = 'tu-trans';
    transSpan.textContent = translatedText;
    transSpan.dataset.originalText = translatedText;

    container.appendChild(srcSpan);
    container.appendChild(transSpan);

    if (displayMode === 'original') {
      srcSpan.style.display = 'inline';
      transSpan.style.display = 'none';
    } else if (displayMode === 'translated') {
      srcSpan.style.display = 'none';
      transSpan.style.display = 'inline';
    } else {
      srcSpan.style.display = 'inline';

      if (isInlineElement(parent)) {
        transSpan.style.display = 'inline';
        transSpan.textContent = `(${translatedText})`;
        transSpan.style.color = '#5a8fb4';
        transSpan.style.fontSize = '.88em';
        transSpan.style.marginLeft = '4px';
      } else {
        transSpan.style.display = 'block';
        transSpan.textContent = translatedText;
        transSpan.style.color = '#5a8fb4';
        transSpan.style.marginTop = '2px';
        transSpan.style.fontSize = '.9em';
        transSpan.style.lineHeight = '1.5';
        transSpan.style.borderLeft = '2px solid rgba(66,165,245,0.3)';
        transSpan.style.paddingLeft = '8px';
      }
    }

    node.replaceWith(container);
  }

  function renderPlaceholderTranslation(originalText, translatedText, el) {
    if (!translatedText || translatedText === originalText) {
      return;
    }

    el.dataset.originalPlaceholder = originalText;
    el.placeholder = translatedText;
    el.dataset.translated = '1';
  }

  async function translatePage(root) {
    if (displayMode !== 'original' && autoMode) {
      translateDocumentTitle();
    }

    if (isTranslating) {
      pendingRoot = root || document.body;
      return;
    }

    isTranslating = true;
    const taskId = ++translateCounter;

    try {
      root = root || document.body;

      let iterationCount = 0;
      const MAX_ITERATIONS = 20;

      do {
        if (taskId !== translateCounter) {
          console.log('翻译任务被取代，停止当前任务');
          break;
        }

        pendingRoot = null;
        iterationCount++;

        if (iterationCount > MAX_ITERATIONS) {
          break;
        }

        const textNodes = collectTextNodes(root);
        const placeholders = collectPlaceholders(root);

        if (textNodes.length === 0 && placeholders.length === 0) {
          break;
        }

        const allTexts = [];
        const allMeta = [];

        for (let i = 0; i < textNodes.length; i++) {
          allTexts.push(textNodes[i].textContent.trim());
          allMeta.push({ type: 'text', node: textNodes[i] });
        }

        for (let i = 0; i < placeholders.length; i++) {
          allTexts.push(placeholders[i].placeholder.trim());
          allMeta.push({ type: 'ph', el: placeholders[i] });
        }

        const results = await batchTranslate(allTexts);

        if (taskId !== translateCounter) {
          console.log('翻译任务被取代，放弃渲染结果');
          break;
        }

        for (let i = 0; i < allMeta.length; i++) {
          if (!results[i]) {
            continue;
          }

          const meta = allMeta[i];

          if (meta.type === 'text') {
            renderTranslation(allTexts[i], results[i], meta.node);
          } else {
            renderPlaceholderTranslation(allTexts[i], results[i], meta.el);
          }
        }

        if (pendingRoot) {
          root = pendingRoot;
        }
      } while (pendingRoot);
    } finally {
      isTranslating = false;
    }
  }

  function clearTranslations() {
    document.querySelectorAll('.tu-container').forEach(el => {
      const src = el.querySelector('.tu-src');
      if (src) {
        const textNode = document.createTextNode(src.textContent);
        el.replaceWith(textNode);
      }
    });

    document.querySelectorAll('[data-original-placeholder]').forEach(el => {
      el.placeholder = el.dataset.originalPlaceholder;
      delete el.dataset.originalPlaceholder;
      delete el.dataset.translated;
    });

    _translatedTitle = null;
    _isTranslatingTitle = false;

    if (_titleBackup && document.title !== _titleBackup) {
      _isUpdatingTitle = true;
      document.title = _titleBackup;
      _isUpdatingTitle = false;
    }
  }

  function applyDisplayMode(mode) {
    displayMode = mode;
    GM_setValue('displayMode', mode);

    if (mode !== 'original' && lastTransMode !== mode) {
      lastTransMode = mode;
      GM_setValue('lastTransMode', lastTransMode);
    }

    if (mode === 'original') {
      clearTranslations();
      restoreDocumentTitle();
      return;
    }

    document.querySelectorAll('.tu-container').forEach(container => {
      const src = container.querySelector('.tu-src');
      const trans = container.querySelector('.tu-trans');

      if (!src || !trans) {
        return;
      }

      const parent = container.parentElement;
      const isInline = parent ? isInlineElement(parent) : false;

      if (mode === 'translated') {
        src.style.display = 'none';
        trans.style.display = 'inline';

        const text = trans.dataset.originalText || trans.textContent;
        trans.textContent = text.replace(/^\(|\)$/g, '');
        trans.style.color = '';
        trans.style.fontSize = '';
        trans.style.marginLeft = '';
        trans.style.borderLeft = '';
        trans.style.paddingLeft = '';
        trans.style.marginTop = '';
        trans.style.lineHeight = '';
        trans.style.display = 'inline';
      } else {
        src.style.display = 'inline';

        let text = trans.dataset.originalText || trans.textContent;
        text = text.replace(/^\(|\)$/g, '');

        if (isInline) {
          trans.style.display = 'inline';
          trans.textContent = `(${text})`;
          trans.style.color = '#5a8fb4';
          trans.style.fontSize = '.88em';
          trans.style.marginLeft = '4px';
          trans.style.borderLeft = '';
          trans.style.paddingLeft = '';
          trans.style.marginTop = '';
          trans.style.lineHeight = '';
        } else {
          trans.style.display = 'block';
          trans.textContent = text;
          trans.style.color = '#5a8fb4';
          trans.style.marginTop = '2px';
          trans.style.fontSize = '.9em';
          trans.style.lineHeight = '1.5';
          trans.style.borderLeft = '2px solid rgba(66,165,245,0.3)';
          trans.style.paddingLeft = '8px';
        }
      }
    });
  }

  // ══════════ 快捷交互 ══════════
  function syncModeButtons() {
    if (!modesEl) {
      return;
    }
    modesEl.querySelectorAll('button').forEach(x => {
      x.classList.toggle('on', x.dataset.m === displayMode);
    });
  }

  function setIconActive(on) {
    if (quickBtn) {
      quickBtn.classList.toggle('active', !!on);
    }
  }

  async function toggleQuickTranslate() {
    if (displayMode === 'original') {
      const target = (lastTransMode === 'bilingual') ? 'bilingual' : 'translated';
      applyDisplayMode(target);
      setIconActive(true);
      syncModeButtons();
      haptic(15);
      setStatus(target === 'bilingual' ? '双语模式' : '仅译文模式');

      if (autoMode) {
        translateDocumentTitle();
        await translatePage(document.body);
      }
    } else {
      applyDisplayMode('original');
      setIconActive(false);
      syncModeButtons();
      haptic(15);
      setStatus('显示原文');
    }
  }

  // ══════════ 交互模式 ══════════
  let fourFingerGestureEnabled = false;

  function setInteractionMode(mode) {
    if (mode !== 'quick' && mode !== 'classic' && mode !== 'hidden') {
      return;
    }

    interactionMode = mode;
    GM_setValue('interactionMode', mode);

    if (mode === 'hidden') {
      if (quickBtn) {
        quickBtn.style.display = 'none';
      }
      fourFingerGestureEnabled = true;
      setStatus('🔒 隐藏模式：四指长按0.8秒打开设置面板');
    } else {
      if (quickBtn) {
        quickBtn.style.display = 'flex';
      }
      fourFingerGestureEnabled = false;
      setStatus(mode === 'quick' ? '⚡ 快捷模式：点击切换翻译/原文，长按开面板' : '📋 经典模式：点击开面板');
    }

    if (interBtn) {
      const modeNames = {
        'quick': '⚡ 快捷',
        'classic': '📋 经典',
        'hidden': '🔒 隐藏'
      };
      interBtn.textContent = modeNames[mode] || mode;
      const colors = {
        'quick': '#7c4dff',
        'classic': '#9e9e9e',
        'hidden': '#ff6b35'
      };
      interBtn.style.background = colors[mode] || '#9e9e9e';
    }

    haptic(20);
  }

  // ══════════ 四指手势 ══════════
  let fourFingerTimer = null;
  let touchStartTime = 0;
  let touchStartPositions = [];

  function setupFourFingerGesture() {
    document.addEventListener('touchstart', (e) => {
      if (!fourFingerGestureEnabled) {
        return;
      }

      const touches = e.touches;

      if (touches.length === 4) {
        touchStartTime = Date.now();
        touchStartPositions = [];

        for (let i = 0; i < touches.length; i++) {
          touchStartPositions.push({
            x: touches[i].clientX,
            y: touches[i].clientY
          });
        }

        if (fourFingerTimer) {
          clearTimeout(fourFingerTimer);
          fourFingerTimer = null;
        }

        fourFingerTimer = setTimeout(() => {
          if (e.touches && e.touches.length === 4) {
            let ok = true;

            for (let i = 0; i < e.touches.length && i < touchStartPositions.length; i++) {
              const dx = e.touches[i].clientX - touchStartPositions[i].x;
              const dy = e.touches[i].clientY - touchStartPositions[i].y;
              if (Math.hypot(dx, dy) > FINGER_MOVE_THRESHOLD) {
                ok = false;
                break;
              }
            }

            if (ok) {
              haptic(40);
              if (panelEl) {
                panelEl.classList.toggle('show');
                setStatus(
                  panelEl.classList.contains('show')
                    ? '🔓 设置面板已打开（四指长按）'
                    : '🔒 设置面板已关闭'
                );
              }
            }

            fourFingerTimer = null;
          }

          fourFingerTimer = null;
        }, FOUR_FINGER_LONG_PRESS_MS);
      } else {
        if (fourFingerTimer) {
          clearTimeout(fourFingerTimer);
          fourFingerTimer = null;
        }
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!fourFingerGestureEnabled) {
        return;
      }

      if (fourFingerTimer && e.touches.length === 4) {
        let ok = true;

        for (let i = 0; i < e.touches.length && i < touchStartPositions.length; i++) {
          const dx = e.touches[i].clientX - touchStartPositions[i].x;
          const dy = e.touches[i].clientY - touchStartPositions[i].y;
          if (Math.hypot(dx, dy) > FINGER_MOVE_THRESHOLD) {
            ok = false;
            break;
          }
        }

        if (!ok) {
          clearTimeout(fourFingerTimer);
          fourFingerTimer = null;
        }
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      if (fourFingerTimer) {
        clearTimeout(fourFingerTimer);
        fourFingerTimer = null;
      }
    }, { passive: true });

    document.addEventListener('touchcancel', () => {
      if (fourFingerTimer) {
        clearTimeout(fourFingerTimer);
        fourFingerTimer = null;
      }
    }, { passive: true });
  }

  // ══════════ DeepSeek 设置弹窗 ══════════
  function showDeepSeekSettings() {
    const existing = document.getElementById('tuDeepSeekModal');
    if (existing) {
      existing.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'tuDeepSeekModal';
    modal.style.cssText = `position:fixed;z-index:2147483647;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;`;

    const dialog = document.createElement('div');
    dialog.style.cssText = `background:#fff;border-radius:12px;padding:20px 24px;width:400px;max-width:90vw;box-shadow:0 8px 32px rgba(0,0,0,0.2);color:#333;`;

    dialog.innerHTML = `<h3 style="margin:0 0 16px;font-size:16px;font-weight:600;">DeepSeek API 设置</h3>
    <label style="display:block;font-size:12px;color:#888;margin-bottom:4px;">API Key</label>
    <input id="tuDSKey" type="password" placeholder="sk-..." value="${Utils.escapeHTML(DeepSeekHelper._apiKey || '')}" style="width:100%;padding:8px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;outline:none;box-sizing:border-box;margin-bottom:12px;" />
    <label style="display:block;font-size:12px;color:#888;margin-bottom:4px;">模型</label>
    <select id="tuDSModel" style="width:100%;padding:8px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;outline:none;box-sizing:border-box;background:#fff;margin-bottom:16px;">
      <option value="deepseek-chat" ${DeepSeekHelper._model === 'deepseek-chat' ? 'selected' : ''}>deepseek-chat</option>
      <option value="deepseek-reasoner" ${DeepSeekHelper._model === 'deepseek-reasoner' ? 'selected' : ''}>deepseek-reasoner</option>
    </select>
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button id="tuDSCancel" style="padding:8px 16px;border:none;border-radius:6px;background:#f0f0f0;color:#555;font-size:13px;cursor:pointer;">取消</button>
      <button id="tuDSSave" style="padding:8px 16px;border:none;border-radius:6px;background:#4a9eff;color:#fff;font-size:13px;cursor:pointer;font-weight:500;">保存</button>
    </div>
    <p style="margin:12px 0 0;font-size:11px;color:#aaa;line-height:1.5;">API Key 仅保存在本地。请在 <a href="https://platform.deepseek.com/api_keys" target="_blank" style="color:#4a9eff;">platform.deepseek.com</a> 获取。</p>`;

    modal.appendChild(dialog);
    document.body.appendChild(modal);

    setTimeout(() => {
      const inp = document.getElementById('tuDSKey');
      if (inp) {
        inp.focus();
      }
    }, 100);

    function closeModal() {
      modal.remove();
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.getElementById('tuDSCancel').addEventListener('click', closeModal);

    document.getElementById('tuDSSave').addEventListener('click', () => {
      const key = document.getElementById('tuDSKey').value.trim();
      const model = document.getElementById('tuDSModel').value;

      DeepSeekHelper._saveConfig(key, model);
      closeModal();

      setStatus(key ? `✅ DeepSeek API 已保存 (模型: ${model})` : '⚠️ API Key 为空');

      if (currentEngine === 'deepseek' && key && displayMode !== 'original' && autoMode) {
        clearTranslations();
        resetTitleState();
        setStatus('正在使用 DeepSeek 重新翻译...');
        translatePage(document.body).then(() => setStatus('翻译完成'));
      }
    });
  }

  // ══════════ 按钮交互 ══════════
  function setupButtonInteraction(btn, panel, ui) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startRight = 0;
    let startBottom = 0;
    let hasMoved = false;
    let pressTimer = null;
    let longPressFired = false;
    let pressStart = 0;
    let maxDist = 0;
    let pressToggled = false;
    let activeInput = null;
    let autoHideTimer = null;
    let isSnapped = false;
    const AUTO_HIDE_DELAY = 1000;

    function getSnapOffset() {
      return snapOffset;
    }

    function getEdgeThreshold() {
      return Math.abs(snapOffset);
    }

    function isPanelOpen() {
      return panel.classList.contains('show');
    }

    function clearAutoHideTimer() {
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
        autoHideTimer = null;
      }
    }

    function doSnap() {
      if (isPanelOpen()) {
        return;
      }
      if (isSnapped || isDragging || interactionMode === 'hidden') {
        return;
      }

      const rect = btn.getBoundingClientRect();
      const rd = window.innerWidth - rect.right;

      if (rd >= getEdgeThreshold()) {
        return;
      }

      ui.style.right = getSnapOffset() + 'px';
      ui.style.opacity = '0.5';
      isSnapped = true;

      const newPos = { right: getSnapOffset(), bottom: uiPos.bottom };
      GM_setValue('uiPos', JSON.stringify(newPos));
      uiPos = newPos;
    }

    function doRestore() {
      if (!isSnapped) {
        return;
      }

      clearAutoHideTimer();
      ui.style.right = '0px';
      ui.style.opacity = '1';
      isSnapped = false;

      const newPos = { right: 0, bottom: uiPos.bottom };
      GM_setValue('uiPos', JSON.stringify(newPos));
      uiPos = newPos;
    }

    function scheduleAutoHide() {
      clearAutoHideTimer();

      if (isPanelOpen()) {
        return;
      }
      if (interactionMode === 'hidden') {
        return;
      }
      if (isDragging || isSnapped) {
        return;
      }

      const rect = btn.getBoundingClientRect();
      const rd = window.innerWidth - rect.right;

      if (rd < getEdgeThreshold()) {
        autoHideTimer = setTimeout(() => {
          autoHideTimer = null;
          if (isPanelOpen()) {
            return;
          }
          doSnap();
        }, AUTO_HIDE_DELAY);
      }
    }

    function clearPress() {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    }

    function togglePanel() {
      panel.classList.toggle('show');
      if (isPanelOpen()) {
        lastPanelOpenAt = Date.now();
        clearAutoHideTimer();
      }
    }

    function togglePanelFromPress() {
      if (pressToggled) {
        return;
      }
      pressToggled = true;
      togglePanel();
    }

    function fireLongPress(expectClick) {
      if (expectClick) {
        longPressFired = true;
      }
      hasMoved = true;
      isDragging = false;
      haptic(35);
      togglePanelFromPress();
    }

    function onDown(cx, cy) {
      if (interactionMode === 'hidden') {
        return;
      }

      if (isSnapped) {
        doRestore();
      }

      clearAutoHideTimer();
      startRight = parseInt(ui.style.right) || 0;
      startBottom = parseInt(ui.style.bottom) || 0;
      isDragging = true;
      startX = cx;
      startY = cy;
      hasMoved = false;
      longPressFired = false;
      pressStart = Date.now();
      maxDist = 0;
      pressToggled = false;

      if (interactionMode === 'quick') {
        clearPress();
        pressTimer = setTimeout(() => {
          if (!isDragging) {
            return;
          }
          fireLongPress(true);
        }, LONG_PRESS_MS);
      }
    }

    function onMove(cx, cy) {
      if (!isDragging || interactionMode === 'hidden') {
        return;
      }

      const dx = startX - cx;
      const dy = startY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist > maxDist) {
        maxDist = dist;
      }

      if (dist > DRAG_START_PX) {
        hasMoved = true;
      }

      if (dist > LONG_PRESS_CANCEL_PX) {
        clearPress();
      }

      let newRight = startRight + dx;
      let newBottom = startBottom + dy;

      const maxX = window.innerWidth - ui.offsetWidth;
      const maxY = window.innerHeight - ui.offsetHeight;

      newRight = Math.max(0, Math.min(newRight, maxX));
      newBottom = Math.max(0, Math.min(newBottom, maxY));

      if (isSnapped) {
        isSnapped = false;
      }

      ui.style.opacity = '1';
      ui.style.right = newRight + 'px';
      ui.style.bottom = newBottom + 'px';
    }

    function onUp() {
      clearPress();

      if (!isDragging || interactionMode === 'hidden') {
        isDragging = false;
        return;
      }

      isDragging = false;

      if (hasMoved && !longPressFired) {
        uiPos = {
          right: parseInt(ui.style.right) || 0,
          bottom: parseInt(ui.style.bottom) || 0
        };
        GM_setValue('uiPos', JSON.stringify(uiPos));
      }

      if (!isSnapped) {
        ui.style.opacity = '1';
      }

      if (hasMoved) {
        scheduleAutoHide();
      }
    }

    function onTap() {
      if (interactionMode === 'hidden') {
        return;
      }

      if (isSnapped) {
        doRestore();
        hasMoved = false;
        longPressFired = false;
        return;
      }

      ui.style.opacity = '1';

      if (longPressFired) {
        longPressFired = false;
        return;
      }

      if (hasMoved) {
        hasMoved = false;
        return;
      }

      if (interactionMode === 'quick') {
        toggleQuickTranslate();
      } else {
        togglePanel();
      }

      if (!isPanelOpen()) {
        scheduleAutoHide();
      }
    }

    (function initSnapState() {
      const cr = parseInt(ui.style.right) || 0;
      if (cr < 0) {
        isSnapped = true;
        ui.style.opacity = '0.5';
      }
    })();

    btn.addEventListener('touchstart', (e) => {
      if (activeInput === 'mouse') {
        return;
      }
      if (interactionMode === 'hidden') {
        return;
      }
      if (e.touches.length !== 1) {
        return;
      }

      activeInput = 'touch';
      const t = e.touches[0];
      onDown(t.clientX, t.clientY);
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      if (activeInput !== 'touch') {
        return;
      }
      if (!isDragging) {
        return;
      }

      const t = e.touches[0];
      if (!t) {
        return;
      }

      onMove(t.clientX, t.clientY);

      if (hasMoved) {
        e.preventDefault();
      }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
      if (activeInput !== 'touch') {
        return;
      }

      activeInput = null;
      const wasMoved = hasMoved;
      const wasLong = longPressFired;
      const wasDragging = isDragging;

      onUp();

      if (wasDragging && !wasMoved && !wasLong) {
        onTap();
      }

      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });

    document.addEventListener('touchcancel', () => {
      if (activeInput !== 'touch') {
        return;
      }

      activeInput = null;
      clearPress();
      clearAutoHideTimer();
      isDragging = false;
      hasMoved = true;
    }, { passive: true });

    let mouseDownOnBtn = false;

    btn.addEventListener('mousedown', (e) => {
      if (activeInput === 'touch') {
        return;
      }
      if (interactionMode === 'hidden') {
        return;
      }
      if (e.button !== 0) {
        return;
      }

      activeInput = 'mouse';
      mouseDownOnBtn = true;
      onDown(e.clientX, e.clientY);
      e.preventDefault();
      e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
      if (activeInput !== 'mouse' || !mouseDownOnBtn) {
        return;
      }

      onMove(e.clientX, e.clientY);

      if (hasMoved) {
        e.preventDefault();
      }
    });

    document.addEventListener('mouseup', (e) => {
      if (activeInput !== 'mouse') {
        return;
      }

      activeInput = null;

      if (!mouseDownOnBtn) {
        return;
      }

      mouseDownOnBtn = false;
      const wasMoved = hasMoved;
      const wasLong = longPressFired;
      const wasDragging = isDragging;

      onUp();

      if (wasDragging && !wasMoved && !wasLong) {
        onTap();
      }

      e.stopPropagation();
    });

    window.addEventListener('blur', () => {
      if (activeInput === 'mouse') {
        activeInput = null;
        mouseDownOnBtn = false;
        clearPress();
        isDragging = false;
      }
    });

    btn.addEventListener('contextmenu', (e) => {
      if (interactionMode !== 'quick' || interactionMode === 'hidden') {
        return;
      }
      e.preventDefault();
      haptic(20);
      togglePanelFromPress();
    });

    btn.addEventListener('mouseenter', () => {
      if (isSnapped) {
        return;
      }
      clearAutoHideTimer();
    });

    btn.addEventListener('mouseleave', () => {
      if (isDragging || isSnapped || interactionMode === 'hidden') {
        return;
      }
      if (isPanelOpen()) {
        return;
      }
      if (activeInput === 'mouse') {
        return;
      }
      scheduleAutoHide();
    });

    const panelObserver = new MutationObserver(() => {
      if (!isPanelOpen() && !isSnapped && interactionMode !== 'hidden') {
        const rect = btn.getBoundingClientRect();
        const rd = window.innerWidth - rect.right;
        if (rd < getEdgeThreshold()) {
          scheduleAutoHide();
        }
      }
    });

    panelObserver.observe(panel, { attributes: true, attributeFilter: ['class'] });

    setTimeout(() => {
      if (interactionMode !== 'hidden' && !isSnapped && !isPanelOpen()) {
        const rect = btn.getBoundingClientRect();
        const rd = window.innerWidth - rect.right;
        if (rd < getEdgeThreshold()) {
          scheduleAutoHide();
        }
      }
    }, 1000);

    window.__tuRefreshSnap = () => {
      clearAutoHideTimer();

      if (isSnapped) {
        ui.style.right = getSnapOffset() + 'px';
        ui.style.opacity = '0.5';
        const newPos = { right: getSnapOffset(), bottom: uiPos.bottom };
        GM_setValue('uiPos', JSON.stringify(newPos));
        uiPos = newPos;
      } else {
        const rect = btn.getBoundingClientRect();
        const rd = window.innerWidth - rect.right;
        if (rd < getEdgeThreshold()) {
          scheduleAutoHide();
        }
      }
    };
  }

  function restorePage() {
    clearTranslations();
    resetTitleState();
    autoMode = false;
    GM_setValue('autoMode', false);
    displayMode = 'original';
    GM_setValue('displayMode', 'original');

    if (quickBtn) {
      quickBtn.classList.remove('active');
    }

    syncModeButtons();
  }

  let statusEl = null;
  let forceBtn = null;
  let modesEl = null;
  let quickBtn = null;
  let interBtn = null;
  let panelEl = null;
  let lastPanelOpenAt = 0;
  let ui = null;

  function toggleForceTranslate() {
    forceTranslate = !forceTranslate;
    GM_setValue('forceTranslate', forceTranslate);

    const status = forceTranslate ? '开启' : '关闭';

    if (forceBtn) {
      if (forceTranslate) {
        forceBtn.textContent = '强制翻译✓';
        forceBtn.style.background = '#ff5722';
        forceBtn.style.color = '#fff';
      } else {
        forceBtn.textContent = '强制翻译';
        forceBtn.style.background = '#ff9800';
        forceBtn.style.color = '#fff';
      }
    }

    if (statusEl) {
      setStatus(`强制翻译已${status}，正在重新翻译...`);
    }

    clearCache();
    clearTranslations();
    resetTitleState();

    if (autoMode && displayMode !== 'original') {
      setTimeout(() => {
        translatePage(document.body).then(() => {
          if (statusEl) {
            setStatus(`强制翻译已${status}，翻译完成`);
          }
        }).catch(() => {
          if (statusEl) {
            setStatus(`强制翻译已${status}，翻译完成（部分失败）`);
          }
        });
      }, 300);
    } else if (autoMode && displayMode === 'original') {
      if (statusEl) {
        setStatus(`强制翻译已${status}（原文模式）`);
      }
    } else {
      if (statusEl) {
        setStatus(`强制翻译已${status}（自动翻译已关闭）`);
      }
    }
  }

  let lastHeight = 0;

  function onScroll() {
    const h = document.documentElement.scrollHeight;
    if (h > lastHeight) {
      lastHeight = h;
      if (autoMode && displayMode !== 'original') {
        translatePage();
      }
    }
  }

  let mutationRafId = null;
  const pendingMutationRoots = new Set();

  const observer = new MutationObserver((mutations) => {
    if (!autoMode || displayMode === 'original') {
      return;
    }

    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE && !shouldSkip(node)) {
          pendingMutationRoots.add(node);
        }
      }
    }

    if (pendingMutationRoots.size > 0 && !mutationRafId) {
      mutationRafId = setTimeout(() => {
        mutationRafId = null;
        const roots = [...pendingMutationRoots];
        pendingMutationRoots.clear();

        if (roots.length > 5) {
          translatePage(document.body);
        } else {
          roots.forEach(r => translatePage(r));
        }
      }, 200);
    }
  });

  function buildLangOptions() {
    let html = '';

    for (const [group, codes] of Object.entries(LANG_GROUPS)) {
      html += '<optgroup label="' + group + '">';

      for (const code of codes) {
        const name = ALL_LANGUAGES[code] || code;
        html += '<option value="' + code + '"' + (code === targetLang ? ' selected' : '') + '>' + name + '</option>';
      }

      html += '</optgroup>';
    }

    return html;
  }

  function setStatus(msg) {
    if (statusEl) {
      statusEl.textContent = msg;
      console.log('[翻译状态]', msg);
    }
  }

  function initWhenBodyReady() {
    if (document.body) {
      init();
    } else {
      requestAnimationFrame(initWhenBodyReady);
    }
  }

  let _initialized = false;

  async function init() {
    if (_initialized) {
      return;
    }
    _initialized = true;

    saveOriginalTitle();
    setupTitleObserver();
    lastHeight = document.documentElement.scrollHeight;

    GM_addStyle(
      '.translate-ui{position:fixed;z-index:2147483647 !important;font-family:system-ui,-apple-system,sans-serif;transition:opacity .2s,right .2s;pointer-events:none !important}' +
      '.translate-ui *{box-sizing:border-box;margin:0;padding:0}' +
      '.tu-btn{width:42px;height:42px;border-radius:50%;border:none;background:rgba(0,0,0,0.5);color:#fff;cursor:grab;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 2px 8px rgba(0,0,0,0.15);transition:transform .2s,background .2s;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;pointer-events:auto !important;touch-action:manipulation !important}' +
      '.tu-btn:active{cursor:grabbing;transform:scale(0.9)}' +
      '.tu-btn.active{background:rgba(34,128,255,0.8)}' +
      '.tu-panel{position:absolute;bottom:52px;right:0;width:280px;max-height:80vh;overflow-y:auto;background:rgba(255,255,255,0.97);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.12);padding:12px;display:none;color:#333;font-size:13px;pointer-events:auto !important}' +
      '.tu-panel.show{display:block}' +
      '.tu-panel label{display:block;margin:8px 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px}' +
      '.tu-panel select{width:100%;padding:6px 8px;border:1px solid #ddd;border-radius:6px;font-size:12px;background:#fff;color:#333;outline:none;appearance:auto}' +
      '.tu-panel select:focus{border-color:#4a9eff}' +
      '.tu-status{margin-top:8px;padding:6px;background:#f8f8f8;border-radius:6px;font-size:11px;color:#666;text-align:center}' +
      '.tu-modes{display:flex;margin-top:6px;background:#f0f0f0;border-radius:8px;padding:2px;gap:2px}' +
      '.tu-modes button{flex:1;padding:6px 0;border:none;border-radius:6px;font-size:11px;cursor:pointer;background:transparent;color:#999;transition:all .15s;font-weight:500}' +
      '.tu-modes button.on{background:#fff;color:#333;box-shadow:0 1px 3px rgba(0,0,0,0.1)}' +
      '.tu-row{display:flex;gap:6px;margin-top:10px}' +
      '.tu-row button{flex:1;padding:7px 0;border:none;border-radius:6px;font-size:12px;cursor:pointer;transition:background .2s}' +
      '.tu-row .tu-restore{background:#f0f0f0;color:#555}' +
      '.tu-row .tu-go{background:#4a9eff;color:#fff}' +
      '.tu-row .tu-exclude{background:#ff6b6b;color:#fff;font-size:11px}' +
      '.tu-row .tu-force{background:#ff9800;color:#fff;font-size:11px}' +
      '.tu-row .tu-inter{background:#7c4dff;color:#fff;font-size:11px}' +
      '.tu-row .tu-cache{background:#607d8b;color:#fff;font-size:11px}' +
      '.tu-container{display:inline;}' +
      '.tu-src{display:none;}' +
      '.tu-trans{display:inline;}' +
      '.tu-selection-tooltip{position:fixed;z-index:2147483647;display:none;background:rgba(40,40,40,0.95);color:#fff;padding:8px 14px;border-radius:8px;font-size:13px;font-family:system-ui,-apple-system,sans-serif;max-width:500px;min-width:60px;box-shadow:0 4px 20px rgba(0,0,0,0.3);pointer-events:none;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1);line-height:1.5;word-break:break-word}' +
      '.tu-hint{font-size:10px;color:#999;text-align:center;padding:4px 0;border-top:1px solid #eee;margin-top:6px}' +
      '.tu-ds-btn{width:100%;padding:7px 0;border:none;border-radius:6px;font-size:12px;cursor:pointer;background:#e8f0fe;color:#1a73e8;margin-top:6px;transition:background .2s}' +
      '.tu-ds-btn:hover{background:#d2e3fc}' +
      '@media(prefers-color-scheme:dark){' +
        '.tu-panel{background:rgba(30,30,30,0.97);color:#eee}' +
        '.tu-panel select{background:#2a2a2a;color:#eee;border-color:#444}' +
        '.tu-row .tu-restore{background:#333;color:#ccc}' +
        '.tu-status{background:#222;color:#999}' +
        '.tu-modes{background:#333}' +
        '.tu-modes button.on{background:#444;color:#eee}' +
        '.tu-hint{color:#666;border-color:#444}' +
        '.tu-ds-btn{background:#1a3a5c;color:#8ab4f8}' +
        '.tu-ds-btn:hover{background:#1e4a70}' +
      '}'
    );

    setupSelectionTranslation();

    ui = document.createElement('div');
    ui.className = 'translate-ui';

    const savedRight = uiPos.right;

    if (savedRight < 0) {
      ui.style.right = snapOffset + 'px';
      ui.style.opacity = '0.5';
    } else {
      ui.style.right = uiPos.right + 'px';
      ui.style.opacity = '1';
    }

    ui.style.bottom = uiPos.bottom + 'px';

    ui.innerHTML =
      '<div class="tu-panel" id="tuPanel">' +
        '<label>翻译引擎</label>' +
        '<select id="tuEngine">' +
          '<option value="microsoft">Microsoft</option>' +
          '<option value="tencent">Tencent</option>' +
          '<option value="google">Google (Auto)</option>' +
          '<option value="google_v2">Google (v2 API)</option>' +
          '<option value="google_legacy">Google (Legacy)</option>' +
          '<option value="deepseek">DeepSeek</option>' +
        '</select>' +
        '<label>目标语言</label>' +
        '<select id="tuLang">' + buildLangOptions() + '</select>' +
        '<label>显示模式</label>' +
        '<div class="tu-modes" id="tuModes">' +
          '<button data-m="translated"' + (displayMode === 'translated' ? ' class="on"' : '') + '>仅译文</button>' +
          '<button data-m="bilingual"' + (displayMode === 'bilingual' ? ' class="on"' : '') + '>双语</button>' +
          '<button data-m="original"' + (displayMode === 'original' ? ' class="on"' : '') + '>原文</button>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;margin-top:6px;font-size:11px;color:#888;">' +
          '<label style="display:flex;align-items:center;gap:4px;margin:0;cursor:pointer;text-transform:none;letter-spacing:0;">' +
            '<input type="checkbox" id="tuSelectionCheck" ' + (enableSelection ? 'checked' : '') + ' style="margin:0;"> 划词翻译' +
          '</label>' +
        '</div>' +
        '<div class="tu-status" id="tuStatus">就绪</div>' +
        '<div class="tu-row">' +
          '<button class="tu-restore" id="tuRestore">还原</button>' +
          '<button class="tu-go" id="tuGo">翻译</button>' +
        '</div>' +
        '<div class="tu-row">' +
          '<button class="tu-exclude" id="tuExclude">排除此站</button>' +
          '<button class="tu-force" id="tuForce">' + (forceTranslate ? '强制翻译✓' : '强制翻译') + '</button>' +
        '</div>' +
        '<div class="tu-row">' +
          '<button class="tu-inter" id="tuInter"></button>' +
          '<button class="tu-cache" id="tuCache">清缓存</button>' +
        '</div>' +
        '<div id="tuDSContainer" style="display:' + (currentEngine === 'deepseek' ? 'block' : 'none') + ';">' +
          '<div style="height:1px;background:#eee;margin:8px 0;"></div>' +
          '<button class="tu-ds-btn" id="tuDSSettingsBtn">⚙️ DeepSeek 设置</button>' +
        '</div>' +
        '<div class="tu-hint" id="tuHint">💡 点击切换交互模式</div>' +
      '</div>' +
      '<button class="tu-btn' + (autoMode && displayMode !== 'original' ? ' active' : '') + '" id="tuBtn" draggable="false">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          '<path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>' +
        '</svg>' +
      '</button>';

    document.body.appendChild(ui);

    const btn = document.getElementById('tuBtn');
    const panel = document.getElementById('tuPanel');
    const engineSelect = document.getElementById('tuEngine');
    const langSelect = document.getElementById('tuLang');

    statusEl = document.getElementById('tuStatus');
    modesEl = document.getElementById('tuModes');
    forceBtn = document.getElementById('tuForce');
    interBtn = document.getElementById('tuInter');
    quickBtn = btn;
    panelEl = panel;

    const selectionCheck = document.getElementById('tuSelectionCheck');
    const hintEl = document.getElementById('tuHint');
    const dsContainer = document.getElementById('tuDSContainer');
    const dsSettingsBtn = document.getElementById('tuDSSettingsBtn');
    const cacheBtn = document.getElementById('tuCache');

    if (displayMode === 'original') {
      btn.classList.remove('active');
    }

    setInteractionMode(interactionMode);

    function updateHint() {
      const hints = {
        'classic': '📋 经典模式：点击图标打开设置面板',
        'quick': '⚡ 快捷模式：点击切换翻译/原文，长按开面板',
        'hidden': '🔒 隐藏模式：图标已隐藏，四指长按0.8秒开面板'
      };
      if (hintEl) {
        hintEl.textContent = '💡 ' + (hints[interactionMode] || '点击切换交互模式');
      }
    }

    updateHint();
    setupFourFingerGesture();

    interBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const modes = ['classic', 'quick', 'hidden'];
      const nextIdx = (modes.indexOf(interactionMode) + 1) % modes.length;
      setInteractionMode(modes[nextIdx]);
      updateHint();
      if (!panel.classList.contains('show')) {
        panel.classList.add('show');
      }
      lastPanelOpenAt = Date.now();
    });

    if (dsSettingsBtn) {
      dsSettingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showDeepSeekSettings();
      });
    }

    cacheBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const n = cache.size;
      if (n === 0) {
        setStatus('缓存已经是空的');
        return;
      }
      if (!confirm(`确定清除全部 ${n} 条翻译缓存？`)) {
        return;
      }
      clearCache();
      setStatus(`✅ 已清除 ${n} 条缓存`);
    });

    if (!VALID_ENGINES.includes(engineSelect.value)) {
      engineSelect.value = DEFAULT_ENGINE;
    }

    if (forceBtn) {
      if (forceTranslate) {
        forceBtn.textContent = '强制翻译✓';
        forceBtn.style.background = '#ff5722';
        forceBtn.style.color = '#fff';
      } else {
        forceBtn.textContent = '强制翻译';
        forceBtn.style.background = '#ff9800';
        forceBtn.style.color = '#fff';
      }
    }

    engineSelect.value = currentEngine;
    langSelect.value = targetLang;

    function updateDSVisibility() {
      if (dsContainer) {
        dsContainer.style.display = (currentEngine === 'deepseek') ? 'block' : 'none';
      }
    }

    updateDSVisibility();

    selectionCheck.addEventListener('change', () => {
      enableSelection = selectionCheck.checked;
      GM_setValue('enableSelection', enableSelection);
      if (!enableSelection) {
        hideSelectionTooltip();
      }
      setStatus(enableSelection ? '✅ 划词翻译已开启' : '❌ 划词翻译已关闭');
    });

    setupButtonInteraction(btn, panel, ui);

    panel.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('click', (e) => {
      if (ui.contains(e.target)) {
        return;
      }
      if (panel.classList.contains('show') && Date.now() - lastPanelOpenAt < 400) {
        return;
      }
      panel.classList.remove('show');
    });

    forceBtn.addEventListener('click', () => {
      toggleForceTranslate();
      panel.classList.remove('show');
    });

    engineSelect.addEventListener('change', async () => {
      const oldEngine = currentEngine;
      currentEngine = engineSelect.value;
      GM_setValue('engine', currentEngine);

      clearCache();
      restoreDocumentTitle();
      resetTitleState();

      if (currentEngine === 'deepseek' && oldEngine !== 'deepseek') {
        updateDSVisibility();
        if (!DeepSeekHelper.isConfigured()) {
          setStatus('⚠️ 请先设置 DeepSeek API Key');
          showDeepSeekSettings();
          return;
        }
      }

      if (currentEngine !== 'deepseek') {
        updateDSVisibility();
      }

      setStatus('切换至: ' + (Engine[currentEngine] ? Engine[currentEngine].name : currentEngine));

      if (displayMode !== 'original' && autoMode) {
        isTranslating = false;
        clearTranslations();
        setStatus('正在重新翻译...');
        const start = performance.now();
        await translatePage(document.body);
        setStatus('翻译完成 (' + ((performance.now() - start) / 1000).toFixed(1) + 's)');
      }
    });

    langSelect.addEventListener('change', async () => {
      targetLang = langSelect.value;
      GM_setValue('targetLang', targetLang);

      clearCache();
      restoreDocumentTitle();
      resetTitleState();

      setStatus('语种切换: ' + (ALL_LANGUAGES[targetLang] || targetLang));

      if (displayMode !== 'original' && autoMode) {
        isTranslating = false;
        clearTranslations();
        setStatus('正在重新翻译...');
        const start = performance.now();
        await translatePage(document.body);
        setStatus('翻译完成 (' + ((performance.now() - start) / 1000).toFixed(1) + 's)');
      } else {
        setStatus('就绪');
      }
    });

    modesEl.addEventListener('click', async (e) => {
      const b = e.target.closest('button[data-m]');
      if (!b) {
        return;
      }

      const m = b.dataset.m;
      if (m === displayMode) {
        return;
      }

      modesEl.querySelectorAll('button').forEach(x => x.classList.remove('on'));
      b.classList.add('on');

      if (m === 'original') {
        applyDisplayMode('original');
        btn.classList.remove('active');
        setStatus('显示原文');
      } else {
        applyDisplayMode(m);
        btn.classList.add('active');
        if (autoMode) {
          translateDocumentTitle();
          await translatePage(document.body);
        }
        setStatus(m === 'bilingual' ? '双语模式' : '仅译文模式');
      }
    });

    document.getElementById('tuGo').addEventListener('click', async () => {
      panel.classList.remove('show');
      btn.classList.add('active');
      autoMode = true;
      GM_setValue('autoMode', true);

      if (displayMode === 'original') {
        displayMode = 'translated';
        GM_setValue('displayMode', 'translated');
        syncModeButtons();
      }

      clearTranslations();
      clearCache();
      resetTitleState();
      lastHeight = document.documentElement.scrollHeight;

      if (currentEngine === 'deepseek' && !DeepSeekHelper.isConfigured()) {
        setStatus('⚠️ 请先配置 DeepSeek API Key');
        showDeepSeekSettings();
        return;
      }

      setStatus('翻译中...');
      const start = performance.now();
      await translatePage(document.body);
      setStatus('翻译完成 (' + ((performance.now() - start) / 1000).toFixed(1) + 's)');
    });

    document.getElementById('tuRestore').addEventListener('click', () => {
      panel.classList.remove('show');
      restorePage();
      setStatus('已还原');
    });

    document.getElementById('tuExclude').addEventListener('click', () => {
      if (!excludedHosts.includes(location.host)) {
        excludedHosts.push(location.host);
        GM_setValue('excludedHosts', JSON.stringify(excludedHosts));
      }
      location.reload();
    });

    GM_registerMenuCommand('🚀 立即翻译当前页面', () => {
      if (displayMode === 'original') {
        displayMode = 'translated';
        GM_setValue('displayMode', 'translated');
        syncModeButtons();
        if (quickBtn) {
          quickBtn.classList.add('active');
        }
      }
      if (currentEngine === 'deepseek' && !DeepSeekHelper.isConfigured()) {
        showDeepSeekSettings();
        return;
      }
      translatePage(document.body);
    });

    GM_registerMenuCommand('⏪ 还原当前页面', () => {
      restorePage();
      setStatus('已还原');
    });

    GM_registerMenuCommand('🔄 强制翻译模式: ' + (forceTranslate ? '开启' : '关闭'), toggleForceTranslate);

    GM_registerMenuCommand('🔄 交互模式: 经典', () => {
      setInteractionMode('classic');
      updateHint();
    });

    GM_registerMenuCommand('🔄 交互模式: 快捷', () => {
      setInteractionMode('quick');
      updateHint();
    });

    GM_registerMenuCommand('🔄 交互模式: 隐藏图标', () => {
      setInteractionMode('hidden');
      updateHint();
    });

    GM_registerMenuCommand('🔀 立即切换翻译 / 原文', () => {
      toggleQuickTranslate();
    });

    GM_registerMenuCommand('⚙️ 打开 / 关闭设置面板', () => {
      if (panelEl) {
        panelEl.classList.toggle('show');
      }
    });

    GM_registerMenuCommand('📝 划词翻译: ' + (enableSelection ? '开启' : '关闭'), () => {
      enableSelection = !enableSelection;
      GM_setValue('enableSelection', enableSelection);
      if (!enableSelection) {
        hideSelectionTooltip();
      }
      if (selectionCheck) {
        selectionCheck.checked = enableSelection;
      }
    });

    GM_registerMenuCommand('🔧 半隐偏移量 (当前 ' + snapOffset + 'px)', () => {
      const v = prompt('半隐偏移量（负数向左移出屏幕，例如 -21）：', snapOffset);
      if (v === null) {
        return;
      }
      const n = parseInt(v, 10);
      if (isNaN(n)) {
        alert('请输入整数');
        return;
      }
      snapOffset = n;
      GM_setValue('snapOffset', n);
      if (window.__tuRefreshSnap) {
        window.__tuRefreshSnap();
      }
      setStatus('半隐偏移量已更新为 ' + n + 'px');
    });

    GM_registerMenuCommand('⚙️ DeepSeek API 设置', showDeepSeekSettings);

    GM_registerMenuCommand('🗑️ 清除翻译缓存 (' + cache.size + ' 条)', () => {
      const n = cache.size;
      if (n === 0) {
        alert('缓存已经是空的');
        return;
      }
      if (!confirm(`确定要清除全部 ${n} 条翻译缓存吗？\n清除后相同文本会重新请求翻译接口。`)) {
        return;
      }
      clearCache();
      alert(`✅ 已清除 ${n} 条翻译缓存`);
      location.reload();
    });

    GM_registerMenuCommand('📊 查看缓存状态 (' + cache.size + ' 条)', () => {
      const size = cache.size;
      let oldest = null;
      let newest = null;

      for (const [, item] of cache) {
        const t = item.t || 0;
        if (!oldest || t < oldest) {
          oldest = t;
        }
        if (!newest || t > newest) {
          newest = t;
        }
      }

      const fmt = (ts) => ts ? new Date(ts).toLocaleString() : '无';
      alert(`📊 翻译缓存状态\n\n缓存条数：${size} / ${MAX_CACHE}\n最早：${fmt(oldest)}\n最新：${fmt(newest)}`);
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    observer.observe(document.body, { childList: true, subtree: true });

    if (autoMode && displayMode !== 'original') {
      if (currentEngine === 'deepseek' && !DeepSeekHelper.isConfigured()) {
        setStatus('⚠️ 请先设置 DeepSeek API Key（点击面板中的设置按钮）');
      } else {
        queueMicrotask(async () => {
          setStatus(
            (forceTranslate ? '强制翻译中...' : '') +
            (displayMode === 'bilingual' ? '双语翻译中...' : '自动翻译中...')
          );
          const start = performance.now();
          await translatePage(document.body);
          setStatus('翻译完成 (' + ((performance.now() - start) / 1000).toFixed(1) + 's)');
        });
      }
    }

    console.log('🔍 划词翻译已启用');
    console.log('📌 DeepSeek 引擎已集成，缓存持久化，菜单可清缓存');
  }

  initWhenBodyReady();

})();