// assets/js/svgLoader.js
import svgData from '../json/svgs.json'; // Importa o JSON diretamente

document.addEventListener("DOMContentLoaded", function () {
  try {
    const data = svgData; // Usa o JSON importado
    const iconElements = document.querySelectorAll(".icon-logoYM, .icon-globo, .icon-dolby, .icon-uol, .icon-gpa, .icon-zello, .icon-iasys, .icon-halo, .icon-whatsApp, .icon-fiverr, .icon-email, .icon-linkedin, .icon-instagram, .icon-audioOff, .icon-audioOn, .icon-seta-1, .icon-seta-2");
    iconElements.forEach((iconEl) => {
      let svgDataKey = null;
      if (iconEl.classList.contains("icon-logoYM")) svgDataKey = "logoYM";
      else if (iconEl.classList.contains("icon-globo")) svgDataKey = "globo";
      else if (iconEl.classList.contains("icon-dolby")) svgDataKey = "dolby";
      else if (iconEl.classList.contains("icon-uol")) svgDataKey = "uol";
      else if (iconEl.classList.contains("icon-gpa")) svgDataKey = "gpa";
      else if (iconEl.classList.contains("icon-zello")) svgDataKey = "zello";
      else if (iconEl.classList.contains("icon-iasys")) svgDataKey = "iasys";
      else if (iconEl.classList.contains("icon-halo")) svgDataKey = "halo";
      else if (iconEl.classList.contains("icon-whatsApp")) svgDataKey = "whatsApp";
      else if (iconEl.classList.contains("icon-fiverr")) svgDataKey = "fiverr";
      else if (iconEl.classList.contains("icon-email")) svgDataKey = "email";
      else if (iconEl.classList.contains("icon-linkedin")) svgDataKey = "linkedin";
      else if (iconEl.classList.contains("icon-instagram")) svgDataKey = "instagram";
      else if (iconEl.classList.contains("icon-audioOff")) svgDataKey = "audioOff";
      else if (iconEl.classList.contains("icon-audioOn")) svgDataKey = "audioOn";
      else if (iconEl.classList.contains("icon-seta-1")) svgDataKey = "seta-1";
      else if (iconEl.classList.contains("icon-seta-2")) svgDataKey = "seta-2";

      if (svgDataKey && data[svgDataKey]) {
        iconEl.innerHTML = data[svgDataKey];
        iconEl.classList.add("svg-icon");
      }
    });

    console.log("SVGs loaded and processed by svgLoader.js. Dispatching event 'svgsProcessed'.");
    document.dispatchEvent(new CustomEvent('svgsProcessed'));

  } catch (error) {
    console.error("Erro ao carregar ou processar os SVGs:", error);
    document.dispatchEvent(new CustomEvent('svgsProcessed')); // Despacha mesmo em caso de erro
  }
});
