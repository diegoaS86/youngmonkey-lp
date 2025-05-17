// assets/js/script.js
document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const hamburger = document.getElementById('hamburger');
    const navBox = document.getElementById('navBox');
    const menu = document.getElementById('menu');
    const contactBtn = document.getElementById('contactBtn');
    const menuLinks = document.querySelectorAll('.menu-nav a, .menu-social a, .menu-lang a');

    const line1 = document.getElementById('line1');
    const line2 = document.getElementById('line2');
    const line3 = document.getElementById('line3');
    const scrambleGroup = document.getElementById('scrambleGroup');
    const ctaDotsPattern = document.querySelector('.cta-dots-pattern');
    const dotsContainer = document.getElementById('dotsContainer');
    const dynamicCounterElement = document.getElementById('dynamicCounter');
    const transformeTextElement = document.getElementById('transformeText');

    const newArrowSvgContainer = document.querySelector('.new-arrow-path-container');
    const mainPathForMotion = document.getElementById('main-path');
    const visiblePathToDraw = document.querySelector('.new-arrow-path-container .draw');
    const arrowHeadElement = document.getElementById('arrow');

    const servicesSection = document.getElementById('section-2');
    const servicesContainerForPin = servicesSection ? servicesSection.querySelector('.services-container') : null;
    const servicesLeftPanel = servicesSection ? servicesSection.querySelector('.services-left-panel') : null;
    const servicesRightPanel = servicesSection ? servicesSection.querySelector('.services-right-panel') : null;
    const serviceCards = servicesSection ? gsap.utils.toArray(servicesSection.querySelectorAll('.service-card')) : [];
    const servicesCounterElement = document.getElementById('servicesCounter');

    const serviceArrow = document.querySelector('.service-arrow');
    const servicePath = document.getElementById('service-path');
    const serviceDraw = document.querySelector('.service-draw');
    const serviceArrowPoint = document.getElementById('service-arrow-point');

let smoother;

    // Verifica se GSAP está disponível e registra plugins
    try {
        if (typeof gsap === 'undefined') {
            return;
        }
        gsap.registerPlugin(
            MotionPathPlugin,
            Observer,
            ScrambleTextPlugin,
            ScrollTrigger,
            DrawSVGPlugin,
            ScrollSmoother,
            ScrollToPlugin,
            TextPlugin
        );
    } catch (error) {
        return;
    }

    // Conjuntos de palavras para animação de scramble
    const wordSets = {
        line1: [ "Design", "Videos", "Campaigns", "Content", "Reels", "Branding" ],
        line2: [ "solves", "sells", "speaks", "adds", "gets", "is" ],
        line3: [ "problem", "more", "loud", "value", "attention", "sexy" ]
    };

    // Inicializa ScrollSmoother
if (typeof ScrollSmoother !== 'undefined') {
    try {
        if (document.getElementById('smooth-wrapper') && document.getElementById('smooth-content')) {
            smoother = ScrollSmoother.create({
                wrapper: "#smooth-wrapper",
                content: "#smooth-content",
                smooth: 1.2,
                effects: true,
                smoothTouch: 0.1,
            });
        }
    } catch (e) {
        console.error("ScrollSmoother error:", e);
    }
}

    // Função para formatar números do contador
    const formatCounterNumber = (num) => {
        return num.toString().padStart(2, '0');
    };

    // Configuração do menu hamburguer
    const setupMenu = () => {
        if (!hamburger || !navBox || !menu) return;

        hamburger.addEventListener('click', () => {
            navBox.classList.toggle('expanded');
            gsap.to(menu, {
                opacity: navBox.classList.contains('expanded') ? 1 : 0,
                visibility: navBox.classList.contains('expanded') ? 'visible' : 'hidden',
                duration: 0.3,
                ease: "power2.inOut"
            });
        });
    };

    // Configuração do modal de contato
    const setupContactModal = () => {
        if (contactBtn) {
            // Implementação do modal aqui
        }
    };

    // Efeitos de hover nos links do menu
    const setupMenuHoverEffects = () => {
        if (!menuLinks.length) return;

        menuLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                gsap.to(link, { x: 5, color: 'var(--accent-color)', duration: 0.3 });
            });
            link.addEventListener('mouseleave', () => {
                gsap.to(link, { x: 0, color: 'var(--light-color)', duration: 0.3 });
            });
        });
    };

    // Animação de texto scramble
    const animateScrambleText = () => {
        if (!line1 || !line2 || !line3 || !scrambleGroup) return;

        let counter = 0;
        function animate() {
            const word1 = wordSets.line1[ counter % wordSets.line1.length ];
            const word2 = wordSets.line2[ counter % wordSets.line2.length ];
            const word3 = wordSets.line3[ counter % wordSets.line3.length ];
            const groupIndex = counter % wordSets.line1.length;

            scrambleGroup.className = 'scramble-title';
            scrambleGroup.classList.add(`group-${ groupIndex }`);

            const tl = gsap.timeline({
                onComplete: () => {
                    gsap.delayedCall(3, animate);
                }
            });

            tl.to(line1, {
                duration: 1.5,
                scrambleText: { text: word1, chars: "!<>-_\\/[]{}—=+*^?#_", revealDelay: 0.3, speed: 0.7 },
                ease: "power3.out"
            }, 0)
                .to(line2, {
                    duration: 1.5,
                    scrambleText: { text: word2, chars: "!<>-_\\/[]{}—=+*^?#_", revealDelay: 0.3, speed: 0.7 },
                    ease: "power3.out"
                }, 0)
                .to(line3, {
                    duration: 1.5,
                    scrambleText: { text: word3, chars: "!<>-_\\/[]{}—=+*^?#_", revealDelay: 0.3, speed: 0.7 },
                    ease: "power3.out"
                }, 0);

            counter++;
        }

        gsap.set([ line1, line2, line3 ], { opacity: 1, delay: 0.1 });
        animate();
    };

    // Controles de performance
    const setupPerformanceControls = () => {
        document.addEventListener('visibilitychange', () => {
            if (gsap.globalTimeline) {
                gsap.globalTimeline[ document.hidden ? 'pause' : 'resume' ]();
            }
        });
    };

    // Criação dos pontos animados
    const setupDotsCreation = () => {
        if (!dotsContainer) return;

        const rows = 4;
        const cols = 12;

        for (let c = 0; c < cols; c++) {
            const col = document.createElement('div');
            col.className = 'dots-column';

            for (let r = 0; r < rows; r++) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                col.appendChild(dot);
            }

            dotsContainer.appendChild(col);
        }

        gsap.set(dotsContainer.querySelectorAll('.dot'), { opacity: 0.3, scale: 1 });
    };

    // Animação dos pontos com scroll
    const setupDotsScrollAnimation = () => {
        if (!dotsContainer || !dotsContainer.children.length) return;

        const allDots = gsap.utils.toArray(dotsContainer.querySelectorAll(".dot"));
        const totalDots = allDots.length;
        let lastRandomizeScroll = 0;
        const scrollThreshold = 150;

        const randomizeDotOpacity = () => {
            gsap.to(allDots, {
                opacity: 0.2,
                scale: 1,
                backgroundColor: 'var(--light-color)',
                boxShadow: 'none',
                duration: 0.2,
                ease: "power2.out"
            });

            const numToActivate = Math.floor(totalDots * (0.1 + Math.random() * 0.4));
            const shuffledDots = gsap.utils.shuffle(allDots.slice());
            const dotsToActivate = shuffledDots.slice(0, numToActivate);

            gsap.to(dotsToActivate, {
                opacity: 1,
                scale: 1.4,
                backgroundColor: 'var(--accent-color)',
                boxShadow: '0 0 10px var(--accent-color)',
                duration: 0.3,
                ease: "power2.out",
                stagger: { each: 0.05, from: "random" }
            });
        };

        ScrollTrigger.create({
            trigger: 'body',
            start: "top top",
            end: "max",
            onUpdate: (self) => {
                const currentScroll = smoother ? smoother.scrollTop() : self.scroll();
                if (Math.abs(currentScroll - lastRandomizeScroll) >= scrollThreshold) {
                    randomizeDotOpacity();
                    lastRandomizeScroll = currentScroll;
                }
            }
        });

        randomizeDotOpacity();
    };

    // Animação dos pontos no CTA
    const setupCtaDotsAnimation = () => {
        if (!ctaDotsPattern) return;

        const patternClasses = [ 'pattern-1', 'pattern-2', 'pattern-3' ];
        let currentPatternIndex = 0;

        gsap.timeline({ repeat: -1, repeatDelay: 0.5 })
            .call(() => {
                ctaDotsPattern.className = 'cta-dots-pattern ' + patternClasses[ currentPatternIndex ];
                currentPatternIndex = (currentPatternIndex + 1) % patternClasses.length;
            })
            .to({}, { duration: 1 });
    };

    // Animação do contador dinâmico
    const setupDynamicCounterAnimation = () => {
        if (!dynamicCounterElement) return;

        dynamicCounterElement.textContent = "000";
        const counterData = { value: 0 };

        const counterTween = gsap.to(counterData, {
            value: 490,
            ease: "none",
            onUpdate: () => {
                dynamicCounterElement.textContent = Math.round(counterData.value).toString().padStart(3, '0');
            }
        });

        ScrollTrigger.create({
            trigger: "#section-1",
            start: "top 90%",
            endTrigger: "body",
            end: "bottom bottom",
            scrub: 1.5,
            animation: counterTween,
        });
    };

    // Efeito de sombra longa no texto
    const applyLongShadow = (elementId, shadowColor = '#00151B', length = 100, spacing = 0.1) => {
        const textElement = document.getElementById(elementId);
        if (!textElement) return;

        let shadow = [];
        for (let i = 1; i <= length; i++) {
            shadow.push(`${ i * spacing }px ${ i * spacing }px ${ shadowColor }`);
        }
        textElement.style.textShadow = shadow.join(', ');
    };

    // Animação de aparecimento do texto
    const setupTextAppearAnimation = (elementId) => {
        const textContainer = document.getElementById(elementId);
        if (!textContainer) return;

        const words = gsap.utils.toArray(textContainer.querySelectorAll("span"));
        if (words.length === 0) return;

        const textAnimation = gsap.fromTo(words,
            { autoAlpha: 0, y: 30 },
            {
                autoAlpha: 1,
                y: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power4.out"
            }
        );

        ScrollTrigger.create({
            trigger: textContainer,
            start: "top 90%",
            end: "bottom 50%",
            scrub: 1,
            animation: textAnimation,
        });
    };

    // Animação da seta
    const setupNewArrowAnimation = () => {
        if (!newArrowSvgContainer || !mainPathForMotion || !visiblePathToDraw || !arrowHeadElement) return;

        gsap.set(arrowHeadElement, { opacity: 0 });
        gsap.set(visiblePathToDraw, { drawSVG: "0%" });

        const arrowTimeline = gsap.timeline();

        arrowTimeline.to(arrowHeadElement, {
            opacity: 1,
            duration: 0.01,
            ease: "none"
        }, 0);

        arrowTimeline.to(arrowHeadElement, {
            motionPath: {
                path: mainPathForMotion,
                align: mainPathForMotion,
                alignOrigin: [ 0.5, 0.5 ],
                autoRotate: 265,
                start: 0,
                end: 1
            },
            ease: "none"
        }, 0);

        arrowTimeline.to(visiblePathToDraw, {
            drawSVG: "100%",
            ease: "none"
        }, 0);

        ScrollTrigger.create({
            trigger: "#section-1",
            start: "top 80%",
            end: () => "+=" + (document.querySelector("#section-1").offsetHeight * 1.3),
            scrub: 1.5,
            animation: arrowTimeline,
        });
    };

    // Animação dos cards de serviços
    const setupStackingCardsAnimation = () => {
        if (!servicesSection || !servicesContainerForPin || !serviceCards.length) return;

        // Estado inicial dos cards
        serviceCards.forEach((card, index) => {
            gsap.set(card, {
                x: index === 0 ? "-50%" : "110%",
                opacity: 1,
                scale: index === 0 ? 1 : 1.1,
                padding: index === 0 ? "0px" : "200px",
                zIndex: index === 0 ? serviceCards.length : index,
            });
        });

        if (serviceCards.length > 0) {
            gsap.set(serviceCards[ 0 ], { zIndex: serviceCards.length });
        }

        const cardStackTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: servicesSection,
                pin: servicesContainerForPin,
                pinSpacing: true,
                start: "top top",
                end: () => "+=" + (window.innerHeight * (serviceCards.length - 1) * 0.5),
                scrub: 1,
                invalidateOnRefresh: true,
            }
        });

        serviceCards.forEach((card, index) => {
            if (index > 0) {
                cardStackTimeline.to(card, {
                    x: "-50%",
                    scale: 1,
                    duration: 0.8,
                    ease: "expo.inOut",
                    onStart: () => {
                        gsap.set(card, { zIndex: serviceCards.length + index + 1 });
                    }
                }, `-=${ 0.35 }`);
            }
        });
    };

    const setupServicesCounter = () => {
        if (!servicesCounterElement || !serviceCards.length || !servicePath || !serviceArrowPoint) {
            console.error("Elementos necessários não encontrados!");
            return;
        }

        const total = serviceCards.length;
        servicesCounterElement.textContent = `01 / ${ formatCounterNumber(total) }`;

        gsap.set(serviceArrowPoint, {
            opacity: 1,
            x: -400, // Posição X inicial do path
            y: 461, // Posição Y inicial do path
            rotation: 0,
            transformOrigin: "center center"
        });

        // Cria uma timeline principal
        const servicesTl = gsap.timeline({
            scrollTrigger: {
                trigger: servicesSection,
                start: "top top",
                end: () => "+=" + (window.innerHeight * (serviceCards.length - 1) * 0.5),
                scrub: true,
                onUpdate: self => {
                    const progress = self.progress;
                    const currentIndex = Math.min(Math.floor(progress * total), total - 1);
                    servicesCounterElement.textContent = `${ formatCounterNumber(currentIndex + 1) } / ${ formatCounterNumber(total) }`;
                }
            }
        });

        // Animação da linha
        servicesTl.fromTo(serviceDraw,
            { drawSVG: "0%" },
            { drawSVG: "100%", ease: "none" },
            0
        );

        // Animação da seta
        servicesTl.to(serviceArrowPoint, {
            motionPath: {
                path: servicePath,
                align: servicePath,
                alignOrigin: [ 0.5, 0.5 ],
                autoRotate: -90,
                start: 0,
                end: 1
            },
            ease: "none",
        }, 0);
    };

    setupMenu();
    setupContactModal();
    setupMenuHoverEffects();
    setupPerformanceControls();

    if (typeof initializeHeaderAnimation === 'function') {
        initializeHeaderAnimation(gsap, ScrollTrigger, smoother);
    } else {
        console.error("Função initializeHeaderAnimation não encontrada. Verifique se header.js está carregado corretamente.");
    }

    if (line1 && line2 && line3 && scrambleGroup) {
        animateScrambleText();
    }

    if (dotsContainer) {
        setupDotsCreation();
        setupDotsScrollAnimation();
    }

    if (ctaDotsPattern) {
        setupCtaDotsAnimation();
    }

    if (dynamicCounterElement) {
        setupDynamicCounterAnimation();
    }

    if (transformeTextElement) {
        applyLongShadow('transformeText', '#00151B', 80, 0.1);
        setupTextAppearAnimation('transformeText');
    }

    if (newArrowSvgContainer) {
        setupNewArrowAnimation();
    }

    if (servicesSection) {
        setupStackingCardsAnimation();
        setupServicesCounter();
    }

if (document.getElementById('section-3')) {
    setupLogoMarqueeWithGSAP();
    setupTestimonialSlider();
    
    // Configura o ScrollTrigger para trabalhar com ScrollSmoother
    ScrollTrigger.normalizeScroll(true);
    ScrollTrigger.config({
        limitCallbacks: true,
        ignoreMobileResize: true
    });
    
    setupSVGAnimation();
}


    

    gsap.delayedCall(0.3, () => {
        if (typeof ScrollTrigger !== 'undefined' && typeof ScrollTrigger.refresh === 'function') {
            ScrollTrigger.refresh();
        }
    });
});