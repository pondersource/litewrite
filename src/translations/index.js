const lang = (navigator.language || navigator.browserLanguage).slice(0, 2)

const translations = {
  de: require('./de'),
  en: require('./en'),
  fr: require('./fr'),
  ru: require('./ru')
}

module.exports = translations[lang] || translations.en
