// sayfa içeriği manipulasyonu
// content.js

import languageCodes from "./languagesCodes.js";

let mutatedElement; //mutosyona uğrayan element. bazen cümle ayrışmıyor. videoyu durdurunca ayrıştırmak için
let popup; // Popup elementini saklamak için bir değişken
let selectedElement; // element dışında bir yere tıklanınca popup kapansın diye
let targetLang;

chrome.storage.sync.get("targetLang", function (result) {
  targetLang = result.targetLang; // varsayılan değeri belirle

  // targetLang değerini kullan
  console.log("Hedef dil: " + targetLang);
});

function splitSentence(element) {
  if (element?.textContent) {
    const originalText = element.textContent;
    const segmenter = new Intl.Segmenter([], { granularity: "word" }); //sentence to word japonca vs desteklesin diye
    const segmentedText = segmenter.segment(originalText);
    const words = [...segmentedText].filter((s) => s.isWordLike).map((s) => s.segment.trim());

    element.innerHTML = "";

    words.forEach(function (word) {
      var spanElement = document.createElement("span");
      spanElement.style.cursor = "auto";
      spanElement.classList.add("ytp-caption-word");
      spanElement.textContent = " " + word;
      element.appendChild(spanElement);
      translateAndCreatePopup(spanElement);
    });
  }
}

var observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.addedNodes) {
      mutation.addedNodes.forEach(async function (element) {
        if (element.classList && element.classList.contains("ytp-caption-segment")) {
          console.log(element);
          splitSentence(element);
          mutatedElement = element;
          // Burada istediğiniz işlemleri gerçekleştirin
        }
        if (element.classList && element.classList.contains("youtube-caption-word")) {
          if (element.textContent == " ") element.textContent = "";
        }
      });
    }
  });
});

var targetNode = document.body;
var config = {
  childList: true,
  subtree: true,
};
observer.observe(targetNode, config);

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
          <div id="detecdedLang" style="font-size: 13px; color: rgb(40, 193, 193)"></div>
          <div id="sobeOriginalWord" style="font-size: 15px; margin-bottom: 10px"></div>
          <div id="targetLang" style="font-size: 13px; color: rgb(40, 193, 193)"></div>
          <div id="sobeTranslated" style="font-size: 16px; margin-bottom: 10px"></div>
          <div id="otherMeanings" style="font-size: 14px; color: bisque"></div>
            `;

      document.body.appendChild(popup);
      selectedElement = popup;

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

      // Sayfa üzerine başka bir tıklandığında popup'ı kapat
      document.addEventListener("click", closePopupHandler);
    }
  });
}

function closePopupHandler(event) {
  // Popup dışında bir yere tıklandığında popup'ı kapat
  if (popup && !popup.contains(event.target) && event.target !== selectedElement) {
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
  splitSentence(mutatedElement);
});
