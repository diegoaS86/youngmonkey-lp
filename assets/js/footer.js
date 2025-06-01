// assets/js/footer.js
// Não precisa de imports de GSAP aqui, pois recebe as instâncias como parâmetros.

/**
 * Initializes all animations and setups for the Footer section.
 * @param {object} gsapInstance - The GSAP instance.
 * @param {object} ScrollTriggerInstance - The ScrollTrigger instance.
 */
export function initializeFooterSection(gsapInstance, ScrollTriggerInstance) {
    // Element selectors specific to this section
    const footerArrow = document.querySelector('.footer-arrow');
    const footerPath = document.getElementById('footer-path');
    const footerDraw = document.querySelector('.footer-draw'); // Classe correta para o elemento a ser desenhado
    const footerArrowPoint = document.getElementById('footer-arrow-point');
    const footerElement = document.getElementById('footer'); // Trigger element

    // --- Footer Animations ---
    const setupFooterArrow = () => {
        if (!footerArrow || !footerPath || !footerDraw || !footerArrowPoint || !footerElement) {
            console.warn("Footer Arrow: Elements or trigger not found.");
            return;
        }
        gsapInstance.set(footerArrowPoint, { opacity: 0, transformOrigin: "50% 50%" });
        gsapInstance.set(footerDraw, { drawSVG: "0%" }); // Inicializa o desenho do SVG

        const arrowTimeline = gsapInstance.timeline();
        arrowTimeline.to(footerArrowPoint, { opacity: 1, duration: 0.01, scale: 0.8, ease: "none" }, 0)
            .to(footerArrowPoint, {
                motionPath: {
                    path: footerPath,
                    align: footerPath,
                    alignOrigin: [0.5, 0.5], // Centraliza a ponta da seta no caminho
                    autoRotate: -90, // Ajuste este valor para a orientação correta da sua seta
                    start: 0, // Início do caminho
                    end: 1    // Fim do caminho
                },
                ease: "none"
            }, 0)
            .to(footerDraw, { drawSVG: "100%", ease: "none" }, 0); // Anima o desenho do caminho

        ScrollTriggerInstance.create({
            trigger: footerElement, // Usa o elemento footer como gatilho
            start: "top 80%", // Começa quando o topo do footer está a 80% da altura da viewport
            end: "bottom bottom", // Termina quando o final do footer atinge o final da viewport
            scrub: 1.5, // Animação suave vinculada ao scroll
            animation: arrowTimeline,
            // markers: true, // Para debug
        });
    };

    // Initialize Footer section specific animations
    if (footerArrow) {
        setupFooterArrow();
    }
    console.log("Footer Section Initialized");
}
