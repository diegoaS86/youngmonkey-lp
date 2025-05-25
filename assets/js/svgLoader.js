document.addEventListener("DOMContentLoaded", function () {
  const jsonUrl = "assets/json/svgs.json"; 

  fetch(jsonUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} while fetching ${jsonUrl}`);
      }
      return response.json();
    })
    .then(data => {
      const iconElements = document.querySelectorAll(".icon-logoYM, .icon-globo, .icon-dolby, .icon-uol, .icon-gpa, .icon-zello, .icon-iasys, .icon-halo, .icon-whatsApp, .icon-fiverr");

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

        if (svgDataKey && data[svgDataKey]) {
          iconEl.innerHTML = data[svgDataKey];
          iconEl.classList.add("svg-icon"); 
        }
      });

      console.log("SVGs loaded and processed by svgLoader.js. Dispatching event 'svgsProcessed'.");
      document.dispatchEvent(new CustomEvent('svgsProcessed'));

    })
    .catch(error => {
      console.error("Erro ao carregar os SVGs:", error);
      document.dispatchEvent(new CustomEvent('svgsProcessed'));
    });
});