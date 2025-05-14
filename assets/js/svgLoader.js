document.addEventListener("DOMContentLoaded", function () {
  const jsonUrl = "assets/json/svgs.json";
  
  fetch(jsonUrl)
    .then(response => response.json())
    .then(data => {
      const iconElements = document.querySelectorAll(".icon-logo");
      
      iconElements.forEach((iconEl) => {
        if (iconEl.classList.contains("icon-logo") && data.logo) {
          iconEl.innerHTML = data.logo;
          iconEl.classList.add("svg-icon");
        }
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
