document.addEventListener("DOMContentLoaded", function () {
  const jsonUrl = "assets/json/svgs.json";

  fetch(jsonUrl)
    .then(response => response.json())
    .then(data => {
      const iconElements = document.querySelectorAll(".icon-logoYM, .icon-globo, .icon-dolby, .icon-uol, .icon-gpa, .icon-zello, .icon-iasys, .icon-halo, .icon-whatsApp, .icon-fiverr");

      iconElements.forEach((iconEl) => {
        if (iconEl.classList.contains("icon-logoYM") && data.logoYM) {
          iconEl.innerHTML = data.logoYM;
          iconEl.classList.add("svg-icon");
        }
        else if (iconEl.classList.contains("icon-globo") && data.globo) {
          iconEl.innerHTML = data.globo;
          iconEl.classList.add("svg-icon");
        }
        else if (iconEl.classList.contains("icon-dolby") && data.dolby) {
          iconEl.innerHTML = data.dolby;
          iconEl.classList.add("svg-icon");
        }
        else if (iconEl.classList.contains("icon-uol") && data.uol) {
          iconEl.innerHTML = data.uol;
          iconEl.classList.add("svg-icon");
        }
        else if (iconEl.classList.contains("icon-gpa") && data.gpa) {
          iconEl.innerHTML = data.gpa;
          iconEl.classList.add("svg-icon");
        }
        else if (iconEl.classList.contains("icon-zello") && data.zello) {
          iconEl.innerHTML = data.zello;
          iconEl.classList.add("svg-icon");
        }
        else if (iconEl.classList.contains("icon-iasys") && data.iasys) {
          iconEl.innerHTML = data.iasys;
          iconEl.classList.add("svg-icon");
        }
        else if (iconEl.classList.contains("icon-halo") && data.halo) {
          iconEl.innerHTML = data.halo;
          iconEl.classList.add("svg-icon");
        }
        else if (iconEl.classList.contains("icon-whatsApp") && data.whatsApp) {
          iconEl.innerHTML = data.whatsApp;
          iconEl.classList.add("svg-icon");
        }
        else if (iconEl.classList.contains("icon-fiverr") && data.fiverr) {
          iconEl.innerHTML = data.fiverr;
          iconEl.classList.add("svg-icon");
        }
      });
    })
    .catch(error => {
      console.error("Erro ao carregar os SVGs:", error);
    });
});
