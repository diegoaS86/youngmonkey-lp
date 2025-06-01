// assets/js/services.js
// Não precisa de imports de GSAP aqui, pois recebe as instâncias como parâmetros.

/**
 * Initializes all animations and setups for the Services section (Section 2).
 * @param {object} gsapInstance - The GSAP instance.
 * @param {object} ScrollTriggerInstance - The ScrollTrigger instance.
 */
export function initializeServicesSection(gsapInstance, ScrollTriggerInstance) {
    // Element selectors specific to this section
    const servicesSection = document.getElementById('section-2');
    if (!servicesSection) {
        console.warn("Services Section (section-2) not found.");
        return;
    }

    const servicesContainerForPin = servicesSection.querySelector('.services-container');
    const serviceCards = gsapInstance.utils.toArray(servicesSection.querySelectorAll('.service-card'));
    const servicesCounterElement = document.getElementById('servicesCounter');

    // Desktop Arrow Elements
    const serviceArrowDesktop = servicesSection.querySelector('.service-arrow'); // Renomeado para clareza
    const servicePathDesktop = document.getElementById('service-path');
    const serviceDrawDesktop = servicesSection.querySelector('.service-arrow .service-draw'); // Mais específico
    const serviceArrowPointDesktop = document.getElementById('service-arrow-point');

    // Mobile Arrow Elements
    const serviceArrowMobile = servicesSection.querySelector('.service-arrow-mobile');
    const servicePathMobile = document.getElementById('service-path-mobile');
    const serviceDrawMobile = servicesSection.querySelector('.service-arrow-mobile .service-draw-mobile'); // Mais específico
    const serviceArrowPointMobile = document.getElementById('service-arrow-point-mobile');


    // Utility function
    const formatCounterNumber = (num) => {
        return num.toString().padStart(2, '0');
    };

    // --- Services Section Animations ---
    const setupStackingCardsAnimation = () => {
        if (!servicesContainerForPin || !serviceCards.length) {
            console.warn("Services StackingCards: Essential elements not found.");
            return;
        }

        serviceCards.forEach((card, index) => {
            if (index === 0) { // Card inicial já no centro
                gsapInstance.set(card, {
                    xPercent: -50, yPercent: -50, opacity: 1, scale: 1, padding: "0px", zIndex: serviceCards.length // zIndex mais alto para o primeiro
                });
            } else { // Outros cards posicionados fora da tela à direita e um pouco maiores
                gsapInstance.set(card, {
                    x: "110%", yPercent: -50, opacity: 1, scale: 1.1, padding: "200px", zIndex: serviceCards.length - index // zIndex decrescente
                });
            }
        });

        const cardStackTimeline = gsapInstance.timeline({
            scrollTrigger: {
                trigger: servicesSection,
                pin: servicesContainerForPin,
                pinSpacing: true,
                start: "top top",
                end: () => "+=" + (window.innerHeight * (serviceCards.length -1) * 0.5), // Ajuste a duração do pin conforme necessário
                scrub: 1, // Animação suave com o scroll
                invalidateOnRefresh: true,
                // markers: true, // Para debug
            }
        });

        // Anima cada card (exceto o primeiro) para a posição central
        serviceCards.forEach((card, index) => {
            if (index > 0) { // Começa a animar a partir do segundo card
                cardStackTimeline.to(card, {
                    x: "0%", // Move para o centro horizontalmente
                    xPercent: -50, // Centraliza o card
                    scale: 1,      // Retorna ao tamanho normal
                    padding: "0px",// Remove padding extra
                    opacity: 1,
                    duration: 0.8, // Duração da transição de cada card
                    ease: "expo.inOut",
                    onStart: () => {
                        // Garante que o card atual fique na frente dos anteriores, mas atrás dos que ainda não animaram
                        gsapInstance.set(card, { zIndex: serviceCards.length + 10 + index });
                    },
                }, `-=${0.35}`); // Sobrepõe levemente as animações para um efeito mais fluido
            }
        });
    };

    const setupServicesCounter = (isMobile) => {
        const total = serviceCards.length;
        if (!servicesCounterElement || total === 0) {
            console.warn(`ServicesCounter (${isMobile ? 'Mobile' : 'Desktop'}): Counter element or service cards not found.`);
            return;
        }
        servicesCounterElement.textContent = `01 / ${formatCounterNumber(total)}`;

        const arrowContainer = isMobile ? serviceArrowMobile : serviceArrowDesktop;
        const path = isMobile ? servicePathMobile : servicePathDesktop;
        const drawElement = isMobile ? serviceDrawMobile : serviceDrawDesktop;
        const arrowPoint = isMobile ? serviceArrowPointMobile : serviceArrowPointDesktop;

        if (!arrowContainer || !path || !drawElement || !arrowPoint) {
            console.warn(`ServicesCounter (${isMobile ? 'Mobile' : 'Desktop'}): Arrow elements not found.`);
            return;
        }
         if (getComputedStyle(arrowContainer).display === 'none') {
            // console.log(`ServicesCounter (${isMobile ? 'Mobile' : 'Desktop'}): Arrow container is hidden, skipping animation setup.`);
            return; // Não configura a animação se o container da seta estiver oculto
        }


        gsapInstance.set(arrowPoint, { opacity: 0, scale: 0.8, rotation: 0, transformOrigin: "center center" });

        const servicesTl = gsapInstance.timeline({
            scrollTrigger: {
                trigger: servicesSection, // O mesmo trigger da animação dos cards
                start: "top top",
                end: () => "+=" + (window.innerHeight * (total - 1) * 0.5),
                scrub: true,
                invalidateOnRefresh: true,
                onUpdate: self => {
                    const progress = self.progress;
                    const currentIndex = Math.min(Math.floor(progress * total), total - 1);
                    if (servicesCounterElement) { // Verifica novamente se o elemento existe
                        servicesCounterElement.textContent = `${formatCounterNumber(currentIndex + 1)} / ${formatCounterNumber(total)}`;
                    }
                }
            }
        });
        servicesTl.to(arrowPoint, { opacity: 1, duration: 0.01 }, 0) // Torna a ponta da seta visível
            .fromTo(drawElement, { drawSVG: "0%" }, { drawSVG: "100%", ease: "none" }, 0) // Anima o desenho do caminho
            .to(arrowPoint, {
                motionPath: {
                    path: path,
                    align: path,
                    alignOrigin: [0.5, 0.5],
                    autoRotate: -90, // Ajuste o ângulo conforme a orientação do seu SVG
                    start: 0,
                    end: 1
                },
                ease: "none",
            }, 0); // Anima a ponta da seta ao longo do caminho
    };


    // Initialize Services section specific animations
    setupStackingCardsAnimation();

    ScrollTriggerInstance.matchMedia({
        "(min-width: 1025px)": function() {
            // console.log("Setting up desktop services counter");
            setupServicesCounter(false); // false para isMobile
        },
        "(max-width: 1024px)": function() {
            // console.log("Setting up mobile services counter");
            setupServicesCounter(true); // true para isMobile
        }
    });
    console.log("Services Section (Section 2) Initialized");
}
