// sayfa içeriği manipulasyonu
// content.js
const languageCodes = {
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

let mutatedElement; //mutosyona uğrayan element. bazen cümle ayrışmıyor. videoyu durdurunca ayrıştırmak için
let popupElement; // element dışında bir yere tıklanınca popup kapansın diye
let targetLang;
let activeWordElement;

chrome.storage.sync.get("targetLang", function (result) {
  targetLang = result.targetLang; // varsayılan değeri belirle

  // targetLang değerini kullan
  console.log("Hedef dil: " + targetLang);

  // languageSelect(targetLang);
});

function splitSentence(element) {
  let notSplittedContent = "";
  element.childNodes.forEach((spanOrText) => {
    if (spanOrText.nodeName == "#text") {
      notSplittedContent += spanOrText.textContent + " ";
      spanOrText.textContent = "";
    }
  });

  if (notSplittedContent.length > 0) {
    const originalText = notSplittedContent;
    const segmenter = new Intl.Segmenter([], { granularity: "word" }); //sentence to word japonca vs desteklesin diye
    const segmentedText = segmenter.segment(originalText);
    const words = [...segmentedText].filter((s) => s.isWordLike).map((s) => s.segment.trim());

    // element.innerHTML = "";

    words.forEach(function (word, index) {
      var spanElement = document.createElement("span");
      spanElement.style.cursor = "auto";
      spanElement.classList.add("ytp-caption-word");
      // spanElement.textContent = index === 0 ? word : " " + word; //ilk kelime ise başına boşluk gelmesin
      spanElement.textContent = word + " ";
      element.appendChild(spanElement);
      translateAndCreatePopup(spanElement);
    });
  }
}

setInterval(() => {
  const elements = document.querySelectorAll(".ytp-caption-segment");
  if (elements) {
    elements.forEach((element) => {
      element.childNodes.forEach((spanOrText) => {
        if (spanOrText.nodeName == "#text") {
          splitSentence(element);
        }
      });
    });
  }
}, 1);

// var observer = new MutationObserver(function (mutations) {
//   mutations.forEach(function (mutation) {
//     if (mutation.addedNodes) {
//       mutation.addedNodes.forEach(async function (element) {
//         if (element.classList && element.classList.contains("ytp-caption-segment")) {
//           splitSentence(element);
//           mutatedElement = element;
//         }
//         if (element.classList && element.classList.contains("youtube-caption-word")) {
//           if (element.textContent == " ") element.textContent = "";
//         }
//       });
//     }
//   });
// });

// var targetNode = document.body;
// var config = {
//   childList: true,
//   subtree: true,
// };
// observer.observe(targetNode, config);

function translateAndCreatePopup(spanElement) {
  spanElement.addEventListener("mouseover", function () {
    spanElement.style.opacity = 0.6;
  });

  spanElement.addEventListener("mouseleave", function () {
    spanElement.style.opacity = 1;
  });

  spanElement.addEventListener("click", function () {
    createPopup(spanElement);
  });
}

async function createPopup(element) {
  activeWordElement = element;
  let word = element.textContent;

  element.addEventListener("click", async function () {
    var rect = element.getBoundingClientRect();
    // console.log(rect.top, rect.right, rect.bottom, rect.left, rect.width, rect.height);

    if (!document.getElementById("sobeTranslate")) {
      popup = document.createElement("div");
      popup.id = "sobeTranslate";
      popup.style.position = "absolute";
      popup.style.width = "220px";
      popup.style.height = "180px";
      popup.style.backgroundColor = "#083544";
      popup.style.opacity = 0.9;
      popup.style.color = "white";
      popup.style.borderRadius = "10px";
      popup.style.padding = "10px";
      popup.style.zIndex = 1000;
      popup.style.left = `${rect.left}px`;
      popup.style.top = `${rect.top - 210}px`;

      popup.innerHTML = /*html*/ `
            <style>
              .form-select {
                display: block;
                width: 100px;
                padding: 0.375rem 0.75rem 0.375rem 2.25rem;
                font-size: 14px;
                font-weight: 600;
                color: rgb(40, 193, 193);
                background-color: #083544;
                padding: 2px 5px;
                margin-bottom: 3px;
                background-repeat: no-repeat;
                background-position: left 0.75rem center;
                background-size: 16px 12px;
                border: 1px solid black;
                border-radius: 5px;
                transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
              }
              .lds-ring {
                display: inline-block;
                position: relative;
                width: 19px;
                height: 19px;
              }
              .lds-ring div {
                box-sizing: border-box;
                display: block;
                position: absolute;
                width: 19px;
                height: 19px;
                border: 3px solid #fff;
                border-radius: 50%;
                animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                border-color: #fff transparent transparent transparent;
              }
              .lds-ring div:nth-child(1) {
                animation-delay: -0.45s;
              }
              .lds-ring div:nth-child(2) {
                animation-delay: -0.3s;
              }
              .lds-ring div:nth-child(3) {
                animation-delay: -0.15s;
              }
              @keyframes lds-ring {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
            </style>
          <div style="display: flex; justify-content: end">
            <svg id="sobeTranslateExitButton" style="cursor:pointer" width="25px" height="25px" viewBox="0 0 1024 1024">
              <path
                fill="#ffff"
                d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z"
              />
            </svg>
          </div>
            <div class="sobeSpinner">
              <div class="lds-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          <div id="detecdedLang" style="font-size: 14px; color: rgb(40, 193, 193)"></div>
          <div id="sobeOriginalWord" style="font-size: 16px; margin-bottom: 8px"></div>
          <div style="display: flex">
            <div style="font-size: 14px; color: rgb(40, 193, 193); margin-right: 8px; margin-top: 2px">
              Target:
            </div>
            <select class="form-select" id="targetLang"></select>
          </div>
          <div id="sobeTranslated" style="font-size: 16px; margin-bottom: 10px"></div>
          <div id="otherMeanings" style="font-size: 14px; color: bisque"></div>
            `;

      document.body.appendChild(popup);
      popupElement = popup;

      const exitButton = document.getElementById("sobeTranslateExitButton");

      //exit tıklandığında kapat
      exitButton.addEventListener("click", function () {
        popup.remove();
        exitButton.removeEventListener("click", this);
      });

      const result = await translateWord(word);

      let translatedWord = result.translatedWord;
      let detectedLang = result.detectedLang;
      const otherMeanings = result.otherMeanings;

      document.getElementById("sobeTranslated").textContent = translatedWord;

      document.getElementById("detecdedLang").textContent = `Detected Language: ${detectedLang}`;
      document.getElementById("otherMeanings").textContent = `Other Meanings: ${otherMeanings}`;
      document.getElementById("sobeOriginalWord").textContent = word;
      document.getElementById("targetLang").textContent = languageCodes[targetLang];

      document.querySelector(".sobeSpinner").innerHTML = ""; //delete spinner ring

      languageSelect(targetLang);

      // Sayfa üzerine başka bir tıklandığında popup'ı kapat
      document.addEventListener("click", closePopupHandler);
    }
  });
}

function closePopupHandler(event) {
  // Popup dışında bir yere tıklandığında popup'ı kapat
  if (popup && !popup.contains(event.target) && event.target !== popupElement) {
    popup.remove();
    document.removeEventListener("click", closePopupHandler);
  }
}

async function translateWord(word) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&hl=tr&dt=t&dt=bd&dj=1&source=icon&tk=952925.952925&q=${word}&tl=${targetLang}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const translatedWord = data.sentences?.[0]?.trans?.toLowerCase() ?? "Not Found";

    const detectedLang = data.src ?? "";

    const terms = data.dict?.[0]?.terms;
    const validTerms = terms ? terms.filter((term) => term !== undefined) : [];
    const otherMeanings = validTerms.slice(0, 3).join(", ");

    return {
      detectedLang: languageCodes[detectedLang] || "Unknown Language",
      translatedWord: translatedWord,
      otherMeanings: otherMeanings,
    };
  } catch (error) {
    console.error("Hata:", error);
    return "error";
  }
}

const videoElement = document.querySelector(".html5-main-video");

videoElement?.addEventListener("pause", function () {
  // splitSentence(mutatedElement);
});

function startInterval() {}

//////////////////////////////////////////////////////////////////////////////dil değiştirme

async function languageSelect(selectedLangCode) {
  // Dil seçimi için kullanılacak select elementini al
  const languageSelect = document.getElementById("targetLang");

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
  languageSelect.addEventListener("change", async function () {
    const selectedLangCode = languageSelect.value;

    targetLang = selectedLangCode;
    activeWordElement.click();
    setTimeout(() => {
      activeWordElement.click(); //selectbox change durumunda popup açılıp kapansın diye
    }, 100);

    // Seçilen dil kodunu storage'da kaydet
    chrome.storage.sync.set({ targetLang: selectedLangCode }, function () {
      console.log("Hedef dil güncellendi: " + selectedLangCode);
    });
  });
}
