// assets/js/section-1.js
// Não precisa de imports de GSAP aqui, pois recebe as instâncias como parâmetros.

/**
 * Initializes all animations and setups for Section 1.
 * @param {object} gsapInstance - The GSAP instance.
 * @param {object} ScrollTriggerInstance - The ScrollTrigger instance.
 */
export function initializeSection1(gsapInstance, ScrollTriggerInstance) {
    // Element selectors specific to this section
    const transformeTextElement = document.getElementById('transformeText');
    const odometerContainer = document.getElementById('dynamicOdometer');
    const hundredsReel = document.getElementById('odometer-hundreds');
    const tensReel = document.getElementById('odometer-tens');
    const unitsReel = document.getElementById('odometer-units');
    const section1Trigger = document.getElementById('section-1'); // Main trigger for this section

    // --- Section 1 Animations ---
    const setupOdometerCounterAnimation = () => {
        if (!odometerContainer || !hundredsReel || !tensReel || !unitsReel || !section1Trigger) {
            console.error("Section 1 Odometer: Elements or trigger not found.");
            return;
        }

        let digitHeight = 0;
        if (unitsReel.children.length > 0) {
            const reelSpanStyle = window.getComputedStyle(unitsReel.children[0]);
            digitHeight = parseFloat(reelSpanStyle.height);
        }

        if (isNaN(digitHeight) || digitHeight === 0) {
            const odometerStyle = window.getComputedStyle(odometerContainer);
            const baseFontSize = odometerStyle.fontSize;
            if (baseFontSize.startsWith('var(')) {
                const varName = baseFontSize.match(/--[a-zA-Z0-9_-]+/)[0];
                const resolvedVar = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
                digitHeight = parseFloat(resolvedVar);
            } else {
                digitHeight = parseFloat(baseFontSize);
            }
            if (isNaN(digitHeight) || digitHeight === 0) {
                console.error("Section 1 Odometer: Could not determine digit height. Defaulting to 1em equivalent if possible or skipping.");
                // Tentar um fallback se tudo mais falhar, ou simplesmente retornar
                // digitHeight = parseFloat(getComputedStyle(odometerContainer).fontSize); // Última tentativa
                // if (isNaN(digitHeight) || digitHeight === 0) return;
                return;
            }
        }
        // console.log("Section 1 Odometer: Digit height:", digitHeight, "px");

        let currentDisplayValue = -1;
        const MAX_ODOMETER_VALUE = 560;
        const counterData = { value: 0 };

        function setOdometerReels(valueToDisplay) {
            const hundreds = Math.floor(valueToDisplay / 100) % 10;
            const tens = Math.floor(valueToDisplay / 10) % 10;
            const units = valueToDisplay % 10;
            gsapInstance.set(hundredsReel, { y: -hundreds * digitHeight });
            gsapInstance.set(tensReel, { y: -tens * digitHeight });
            gsapInstance.set(unitsReel, { y: -units * digitHeight });
        }
        setOdometerReels(0); // Initial set

        ScrollTriggerInstance.create({
            trigger: section1Trigger,
            start: "top 90%",
            end: "+=4550", // Duração da animação em pixels de scroll
            scrub: true,
            animation: gsapInstance.fromTo(counterData,
                { value: 0 },
                {
                    value: MAX_ODOMETER_VALUE,
                    ease: "none",
                    onUpdate: () => {
                        const newValue = Math.round(counterData.value);
                        if (newValue !== currentDisplayValue) {
                            currentDisplayValue = newValue;
                            setOdometerReels(currentDisplayValue);
                        }
                    }
                }
            ),
        });
    };

    const applyLongShadow = (elementId, shadowColor = '#00151B', length = 100, spacing = 0.1) => {
        const textElement = document.getElementById(elementId);
        if (!textElement) return;
        let shadow = [];
        for (let i = 1; i <= length; i++) {
            shadow.push(`${i * spacing}px ${i * spacing}px ${shadowColor}`);
        }
        textElement.style.textShadow = shadow.join(', ');
    };

    const setupTextAppearAnimation = (elementId) => {
        const textContainer = document.getElementById(elementId);
        if (!textContainer) return;
        const words = gsapInstance.utils.toArray(textContainer.querySelectorAll("span"));
        if (words.length === 0) return;

        const textAnimation = gsapInstance.fromTo(words,
            { autoAlpha: 0, y: 30 },
            {
                autoAlpha: 1, y: 0, duration: 1, stagger: 0.2, ease: "power4.out"
            }
        );
        ScrollTriggerInstance.create({
            trigger: textContainer,
            start: "top 90%", // Inicia quando o topo do container atinge 80% da altura da viewport
            end: "bottom 50%", // Termina quando o fundo do container atinge 20% da altura da viewport
            scrub: 1, // Suaviza a animação com o scroll
            animation: textAnimation,
        });
    };

    const setupNewArrowAnimation = () => {
        const newArrowSvgContainer = document.querySelector('.new-arrow-path-container');
        const newArrowSvgContainerMobile = document.querySelector('.new-arrow-path-container-mobile'); // Para a versão mobile
        // const triggerSection = document.querySelector("#section-1"); // Já temos section1Trigger

        let currentMainPath, currentVisiblePath, currentArrowHead, activeContainer = null;

        // Determina qual container de seta está ativo
        if (window.innerWidth < 1200 && newArrowSvgContainerMobile && getComputedStyle(newArrowSvgContainerMobile).display !== 'none') {
            activeContainer = newArrowSvgContainerMobile;
        } else if (newArrowSvgContainer && getComputedStyle(newArrowSvgContainer).display !== 'none') {
            activeContainer = newArrowSvgContainer;
        } else if (newArrowSvgContainerMobile && getComputedStyle(newArrowSvgContainerMobile).display !== 'none') { // Fallback
            activeContainer = newArrowSvgContainerMobile;
        } else if (newArrowSvgContainer) { // Fallback
             activeContainer = newArrowSvgContainer;
        }


        if (!activeContainer) { console.warn("Section 1 NewArrowAnimation: No active arrow container found."); return; }

        currentMainPath = activeContainer.querySelector('#main-path'); // Usa #main-path ou #main-path-mobile
        currentVisiblePath = activeContainer.querySelector('.draw'); // Usa .draw ou .draw-mobile
        currentArrowHead = activeContainer.querySelector('#arrow'); // Usa #arrow ou #arrow-mobile

        if (!currentMainPath || !currentVisiblePath || !currentArrowHead) { console.warn("Section 1 NewArrowAnimation: SVG elements not found in active container."); return; }
        if (!section1Trigger) { console.warn("Section 1 NewArrowAnimation: Trigger section '#section-1' not found."); return; }


        gsapInstance.set(currentVisiblePath, { drawSVG: "0%" });
        gsapInstance.set(currentArrowHead, { opacity: 1, transformOrigin: "center center" }); // Garante que a opacidade inicial seja 1

        // Ajusta a escala da seta com base no tamanho da tela
        ScrollTriggerInstance.matchMedia({
            "(min-width: 1025px)": () => gsapInstance.set(currentArrowHead, { scale: 0.8 }),
            "(min-width: 768px) and (max-width: 1024px)": () => gsapInstance.set(currentArrowHead, { scale: 0.8 }), // Tablets
            "(max-width: 767px)": () => gsapInstance.set(currentArrowHead, { scale: 0.8 }) // Celulares
        });


        // Função para ajustar a posição 'right' do container da seta
        const adjustRightPosition = () => {
            const screenWidth = window.innerWidth;
            // Valores de exemplo, ajuste conforme necessário
            const R_inicial = -500; // Posição right inicial para W_inicial
            const W_inicial = 2560; // Largura de tela de referência inicial
            const K_slope = 0.12;   // Fator de ajuste da inclinação

            let calculatedRightValue = R_inicial + K_slope * (W_inicial - screenWidth);

            // Aplica o valor calculado ao container ativo
            if (newArrowSvgContainer) newArrowSvgContainer.style.right = `${calculatedRightValue}px`;
            if (newArrowSvgContainerMobile) newArrowSvgContainerMobile.style.right = `${calculatedRightValue}px`; // Garante que o mobile também seja ajustado se for o ativo
            setTimeout(() => ScrollTriggerInstance.refresh(), 0); // Dá um tempo para o DOM atualizar antes do refresh
        };
        adjustRightPosition(); // Chamada inicial
        window.addEventListener('resize', adjustRightPosition); // Reajusta no resize


        const arrowTimeline = gsapInstance.timeline();
        arrowTimeline.to(currentArrowHead, {
            opacity: 1, // Garante que a seta seja visível durante a animação
            motionPath: { path: currentMainPath, align: currentMainPath, alignOrigin: [0.5, 0.5], autoRotate: 265, start: 0, end: 1 },
            ease: "none"
        }, 0).to(currentVisiblePath, { drawSVG: "100%", ease: "none" }, 0);

        // Ajuste do start/end do ScrollTrigger para mobile e desktop
        ScrollTriggerInstance.matchMedia({
            "(max-width: 767px)": () => { // Mobile
                ScrollTriggerInstance.create({
                    trigger: section1Trigger,
                    start: "top bottom+=50px", // Começa um pouco depois que o topo da seção entra na base da viewport
                    end: () => "+=" + (section1Trigger.offsetHeight * 1.1),
                    scrub: 1.5,
                    animation: arrowTimeline,
                    id: "newArrowMobileStart"
                });
            },
            "(min-width: 768px)": () => { // Desktop e Tablet
                ScrollTriggerInstance.create({
                    trigger: section1Trigger,
                    start: "top 80%", // Começa quando 80% da seção está visível
                    end: () => "+=" + (section1Trigger.offsetHeight * 1.1),
                    scrub: 1.5,
                    animation: arrowTimeline,
                    id: "newArrowDesktopStart"
                });
            }
        });
    };


    // Initialize Section 1 specific animations
    if (odometerContainer) {
        setupOdometerCounterAnimation();
    }
    if (transformeTextElement) {
        applyLongShadow('transformeText', '#00151B', 80, 0.1);
        setupTextAppearAnimation('transformeText');
    }
    if (document.querySelector('.new-arrow-path-container') || document.querySelector('.new-arrow-path-container-mobile')) {
        setupNewArrowAnimation();
    }
    console.log("Section 1 Initialized");
}
