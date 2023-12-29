var languageCodes = {
  af: "Afrikaans",
  sq: "Albanian",
  am: "Amharic",
  ar: "Arabic",
  hy: "Armenian",
  as: "Assamese",
  ay: "Aymara",
  az: "Azerbaijani",
  bm: "Bambara",
  eu: "Basque",
  be: "Belarusian",
  bn: "Bengali",
  bho: "Bhojpuri",
  bs: "Bosnian",
  bg: "Bulgarian",
  ca: "Catalan",
  ceb: "Cebuano",
  "zh-CN": "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
  co: "Corsican",
  hr: "Croatian",
  cs: "Czech",
  da: "Danish",
  dv: "Dhivehi",
  doi: "Dogri",
  nl: "Dutch",
  en: "English",
  eo: "Esperanto",
  et: "Estonian",
  ee: "Ewe",
  fil: "Filipino (Tagalog)",
  fi: "Finnish",
  fr: "French",
  fy: "Frisian",
  gl: "Galician",
  ka: "Georgian",
  de: "German",
  el: "Greek",
  gn: "Guarani",
  gu: "Gujarati",
  ht: "Haitian Creole",
  ha: "Hausa",
  haw: "Hawaiian",
  he: "Hebrew",
  hi: "Hindi",
  hmn: "Hmong",
  hu: "Hungarian",
  is: "Icelandic",
  ig: "Igbo",
  ilo: "Ilocano",
  id: "Indonesian",
  ga: "Irish",
  it: "Italian",
  ja: "Japanese",
  jv: "Javanese",
  kn: "Kannada",
  kk: "Kazakh",
  km: "Khmer",
  rw: "Kinyarwanda",
  gom: "Konkani",
  ko: "Korean",
  kri: "Krio",
  ku: "Kurdish",
  ckb: "Kurdish (Sorani)",
  ky: "Kyrgyz",
  lo: "Lao",
  la: "Latin",
  lv: "Latvian",
  ln: "Lingala",
  lt: "Lithuanian",
  lg: "Luganda",
  lb: "Luxembourgish",
  mk: "Macedonian",
  mai: "Maithili",
  mg: "Malagasy",
  ms: "Malay",
  ml: "Malayalam",
  mt: "Maltese",
  mi: "Maori",
  mr: "Marathi",
  "mni-Mtei": "Meiteilon (Manipuri)",
  lus: "Mizo",
  mn: "Mongolian",
  my: "Myanmar (Burmese)",
  ne: "Nepali",
  no: "Norwegian",
  ny: "Nyanja (Chichewa)",
  or: "Odia (Oriya)",
  om: "Oromo",
  ps: "Pashto",
  fa: "Persian",
  pl: "Polish",
  pt: "Portuguese (Portugal, Brazil)",
  pa: "Punjabi",
  qu: "Quechua",
  ro: "Romanian",
  ru: "Russian",
  sm: "Samoan",
  sa: "Sanskrit",
  gd: "Scots Gaelic",
  nso: "Sepedi",
  sr: "Serbian",
  st: "Sesotho",
  sn: "Shona",
  sd: "Sindhi",
  si: "Sinhala (Sinhalese)",
  sk: "Slovak",
  sl: "Slovenian",
  so: "Somali",
  es: "Spanish",
  su: "Sundanese",
  sw: "Swahili",
  sv: "Swedish",
  tl: "Tagalog (Filipino)",
  tg: "Tajik",
  ta: "Tamil",
  tt: "Tatar",
  te: "Telugu",
  th: "Thai",
  ti: "Tigrinya",
  ts: "Tsonga",
  tr: "Turkish",
  tk: "Turkmen",
  ak: "Twi (Akan)",
  uk: "Ukrainian",
  ur: "Urdu",
  ug: "Uyghur",
  uz: "Uzbek",
  vi: "Vietnamese",
  cy: "Welsh",
  xh: "Xhosa",
  yi: "Yiddish",
  yo: "Yoruba",
  zu: "Zulu",
};

let targetLang;

// chrome.storage.sync.get fonksiyonu asenkron olduğu için içindeki işlemleri bir fonksiyon içine alın
function updateLanguageSelect(selectedLangCode) {
  // Dil seçimi için kullanılacak select elementini al
  const languageSelect = document.getElementById("languageSelect");

  // Dil kodları üzerinde dönerek select elementini doldur
  for (const code in languageCodes) {
    const option = document.createElement("option");
    option.value = code;
    option.text = languageCodes[code];
    languageSelect.add(option);

    // Seçili dil kodunu belirle
    if (code === selectedLangCode) {
      option.selected = true;
    }
  }

  // Kullanıcının dil seçimini dinle ve storage'a kaydet
  languageSelect.addEventListener("change", function () {
    const selectedLangCode = languageSelect.value;

    // Seçilen dil kodunu storage'da kaydet
    chrome.storage.sync.set({ targetLang: selectedLangCode }, function () {
      console.log("Hedef dil güncellendi: " + selectedLangCode);
    });
  });
}

// chrome.storage.sync.get fonksiyonunu kullanarak targetLang değerini al
chrome.storage.sync.get("targetLang", function (result) {
  targetLang = result.targetLang;

  // Aldığınız targetLang değeriyle languageSelect'i güncelle
  updateLanguageSelect(targetLang);
});

const reloadButton = document.getElementById("reloadButton");

// Butona tıklandığında sayfayı yeniden yükle
reloadButton.addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];
    chrome.tabs.reload(currentTab.id);
  });
});
