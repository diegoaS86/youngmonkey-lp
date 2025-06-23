import svgData from '../json/svgs.json';

export function initializeSvgLoader() {
  try {
    const data = svgData;
    const icons = document.querySelectorAll(
      ".icon-logoYM, .icon-globo, .icon-dolby, .icon-uol, .icon-gpa, .icon-zello, .icon-iasys, .icon-halo, .icon-whatsApp, .icon-fiverr, .icon-email, .icon-linkedin, .icon-instagram, .icon-audioOff, .icon-audioOn, .icon-seta-1, .icon-seta-2, .icon-loader"
    );
    const map = {
      "icon-logoYM": "logoYM",
      "icon-globo": "globo",
      "icon-dolby": "dolby",
      "icon-uol": "uol",
      "icon-gpa": "gpa",
      "icon-zello": "zello",
      "icon-iasys": "iasys",
      "icon-halo": "halo",
      "icon-whatsApp": "whatsApp",
      "icon-fiverr": "fiverr",
      "icon-email": "email",
      "icon-linkedin": "linkedin",
      "icon-instagram": "instagram",
      "icon-audioOff": "audioOff",
      "icon-audioOn": "audioOn",
      "icon-seta-1": "seta-1",
      "icon-seta-2": "seta-2",
      "icon-loader": "loader"
    };
    icons.forEach(el => {
      const key = Object.keys(map).find(cls => el.classList.contains(cls));
      if (key && data[map[key]]) {
        el.innerHTML = data[map[key]];
        el.classList.add("svg-icon");
      }
    });
    console.log("SVGs loaded.");
  } catch (err) {
    console.error("Error loading SVGs:", err);
  }
  document.dispatchEvent(new CustomEvent('svgsProcessed'));
};