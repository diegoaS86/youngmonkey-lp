document.addEventListener("DOMContentLoaded", function () {
  const jsonUrl = "assets/json/svgs.json";
  
  fetch(jsonUrl)
    .then(response => response.json())
    .then(data => {
      // Seleciona TODOS os elementos com classe .icon-home e .icon-about
      const iconElements = document.querySelectorAll(".icon-logo");
      
      iconElements.forEach((iconEl) => {
        // Se o elemento tem a classe icon-home, insere o SVG correspondente
        if (iconEl.classList.contains("icon-logo") && data.logo) {
          iconEl.innerHTML = data.logo;
          iconEl.classList.add("svg-icon");
        }
        // Se o elemento tem a classe icon-about, insere o SVG correspondente
        else if (iconEl.classList.contains("icon-about") && data.about) {
          iconEl.innerHTML = data.about;
          iconEl.classList.add("svg-icon");
        }
        
        });
    })
    .catch(error => {
      console.error("Erro ao carregar os SVGs:", error);
    });
});
