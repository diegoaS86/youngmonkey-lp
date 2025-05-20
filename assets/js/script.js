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

    const serviceArrowMobile = document.querySelector('.service-arrow-mobile');
    const servicePathMobile = document.getElementById('service-path-mobile');
    const serviceDrawMobile = document.querySelector('.service-draw-mobile');
    const serviceArrowPointMobile = document.getElementById('service-arrow-point-mobile');

    const footerArrow = document.querySelector('.footer-arrow');
    const footerPath = document.getElementById('footer-path');
    const footerDraw = document.querySelector('.footer-draw');
    const footerArrowPoint = document.getElementById('footer-arrow-point');

    let smoother;

    // Registro de Plugins GSAP
    try {
        if (typeof gsap === 'undefined') {
            console.error("GSAP não carregado.");
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
        console.error("Erro ao registrar plugins GSAP:", error);
        return;
    }

    const wordSets = {
        line1: [ "Design", "Videos", "Campaigns", "Content", "Reels", "Branding" ],
        line2: [ "solves", "sells", "speaks", "adds", "gets", "is" ],
        line3: [ "problem", "more", "loud", "value", "attention", "is" ]
    };

    // Inicialização do ScrollSmoother
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
            console.error("Erro no ScrollSmoother:", e);
        }
    }

    // Função: Formatar Números do Contador
    const formatCounterNumber = (num) => {
        return num.toString().padStart(2, '0');
    };

    // Função: Configuração do Menu Hamburguer
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

    // Função: Configuração do Modal de Contato
    const setupContactModal = () => {
        if (contactBtn) {
            // Implementação do modal aqui
        }
    };

    // Função: Efeitos de Hover nos Links do Menu
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

    // Função: Animação de Texto Scramble
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

    // Função: Controles de Performance
    const setupPerformanceControls = () => {
        document.addEventListener('visibilitychange', () => {
            if (gsap.globalTimeline) {
                gsap.globalTimeline[ document.hidden ? 'pause' : 'resume' ]();
            }
        });
    };

    // Função: Criação dos Pontos Animados
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

    // Função: Animação dos Pontos com Scroll
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

    // Função: Animação dos Pontos no CTA
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

    // Função: Animação do Contador Dinâmico (Seção 1)
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

    // Função: Efeito de Sombra Longa no Texto
    const applyLongShadow = (elementId, shadowColor = '#00151B', length = 100, spacing = 0.1) => {
        const textElement = document.getElementById(elementId);
        if (!textElement) return;
        let shadow = [];
        for (let i = 1; i <= length; i++) {
            shadow.push(`${ i * spacing }px ${ i * spacing }px ${ shadowColor }`);
        }
        textElement.style.textShadow = shadow.join(', ');
    };

    // Função: Animação de Aparecimento do Texto
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

    // Função: Animação da Seta (Seção 1)
    const setupNewArrowAnimation = () => {
        const newArrowSvgContainer = document.querySelector('.new-arrow-path-container');
        const newArrowSvgContainerMobile = document.querySelector('.new-arrow-path-container-mobile');
        const triggerSection = document.querySelector("#section-1");

        let currentMainPath;
        let currentVisiblePath;
        let currentArrowHead;
        let activeContainer = null; 

        if (window.innerWidth < 1200 && newArrowSvgContainerMobile && getComputedStyle(newArrowSvgContainerMobile).display !== 'none') {
            activeContainer = newArrowSvgContainerMobile;
        } else if (newArrowSvgContainer && getComputedStyle(newArrowSvgContainer).display !== 'none') {
            activeContainer = newArrowSvgContainer;
        } else if (newArrowSvgContainerMobile && getComputedStyle(newArrowSvgContainerMobile).display !== 'none') {
            activeContainer = newArrowSvgContainerMobile;
        } else if (newArrowSvgContainer) {
            activeContainer = newArrowSvgContainer;
        }

        if (!activeContainer) {
            console.warn("NewArrowAnimation: Nenhum container da seta ativo/visível ou encontrado.");
            return;
        }

        if (activeContainer) {
            currentMainPath = activeContainer.querySelector('#main-path');
            currentVisiblePath = activeContainer.querySelector('.draw');
            currentArrowHead = activeContainer.querySelector('#arrow');
        }

        if (!currentMainPath || !currentVisiblePath || !currentArrowHead) {
            console.warn("NewArrowAnimation: Elementos SVG internos não encontrados no container ativo.");
            return; 
        }
        
        if (!triggerSection) {
            console.warn("NewArrowAnimation: Seção de trigger '#section-1' não encontrada.");
            return; 
        }

        if (!newArrowSvgContainer && !newArrowSvgContainerMobile) {
            console.warn("NewArrowAnimation: Seletores globais para containers da seta não encontraram elementos.");
        }

        gsap.set(currentArrowHead, { opacity: 0 });
        gsap.set(currentVisiblePath, { drawSVG: "0%" });

        const adjustRightPosition = () => {
            const screenWidth = window.innerWidth;
            const R_inicial = -500;
            const W_inicial = 1920;
            const K_slope = -0.5; 
            let calculatedRightValue = R_inicial + K_slope * (W_inicial - screenWidth);

            if (document.querySelector('.new-arrow-path-container')) { 
                document.querySelector('.new-arrow-path-container').style.right = `${calculatedRightValue}px`;
            }
            if (document.querySelector('.new-arrow-path-container-mobile')) { 
                document.querySelector('.new-arrow-path-container-mobile').style.right = `${calculatedRightValue}px`;
            }
            
            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 0);
        };

        adjustRightPosition();
        window.addEventListener('resize', adjustRightPosition);

        const arrowTimeline = gsap.timeline();
        arrowTimeline.to(currentArrowHead, { opacity: 1, duration: 0.01, ease: "none" }, 0);
        arrowTimeline.to(currentArrowHead, {
            motionPath: {
                path: currentMainPath,
                align: currentMainPath,
                alignOrigin: [0.5, 0.5],
                autoRotate: 265,
                start: 0,
                end: 1
            },
            ease: "none"
        }, 0);
        arrowTimeline.to(currentVisiblePath, { drawSVG: "100%", ease: "none" }, 0);

        ScrollTrigger.create({
            trigger: triggerSection,
            start: "top 80%",
            end: () => "+=" + (triggerSection.offsetHeight * 1.3),
            scrub: 1.5,
            animation: arrowTimeline,
        });
    };

const setupStackingCardsAnimation = () => {
    if (!servicesSection || !servicesContainerForPin || !serviceCards.length) {
        console.warn("StackingCards: Elementos essenciais não encontrados (servicesSection, servicesContainerForPin, ou serviceCards).");
        return;
    }

    serviceCards.forEach((card, index) => {
        if (index === 0) {
            gsap.set(card, {
                xPercent: -50, 
                yPercent: -50, 
                opacity: 1,
                scale: 1,
                padding: "0px", 
                zIndex: serviceCards.length 
            });
        } else {
            gsap.set(card, {
                x: "110%",     
                yPercent: -50, 
                opacity: 1,    
                scale: 1.1,   
                padding: "200px", 
                zIndex: serviceCards.length - index 
            });
        }
    });

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
                x: "0%",     
                xPercent: -50, 
                scale: 1,     
                padding: "0px",
                opacity: 1,    
                duration: 0.8, 
                ease: "expo.inOut",
                onStart: () => {
                    gsap.set(card, { zIndex: serviceCards.length + 10 + index }); 
                },
                onComplete: () => {
                }
            }, `-=${0.35}`); 
        }
    });
};

    // Função: Contador e Animação da Seta de Serviços
    const setupServicesCounter = () => {
        if (!servicesCounterElement || !serviceCards.length || !servicePath || !serviceArrowPoint) {
             console.warn("ServicesCounter: Elementos necessários não encontrados!");
            return;
        }
        const total = serviceCards.length;
        servicesCounterElement.textContent = `01 / ${ formatCounterNumber(total) }`;
        gsap.set(serviceArrowPoint, {
            opacity: 1,
            x: -400, 
            y: 461, 
            rotation: 0,
            transformOrigin: "center center"
        });
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
        servicesTl.fromTo(serviceDraw, { drawSVG: "0%" }, { drawSVG: "100%", ease: "none" }, 0);
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

        // Função: Contador e Animação da Seta de Serviços Mobile
const setupServicesCounterMobile = () => {
    if (!servicePathMobile || !serviceArrowPointMobile || !serviceDrawMobile) {
        console.warn("setupServicesCounterMobile: Elementos da seta mobile (path, point, ou draw) não encontrados!");
        return;
    }

    if (servicesCounterElement && serviceCards && serviceCards.length > 0) {
        const total = serviceCards.length; 
        servicesCounterElement.textContent = `01 / ${formatCounterNumber(total)}`; 
    } else {
        console.warn("setupServicesCounterMobile: Elementos do contador ou cards não encontrados para a lógica do contador.");
    }

    gsap.set(serviceArrowPointMobile, {
        opacity: 1, // Garante que a ponta da seta esteja visível
        // x: 0, // Removido - MotionPathPlugin posicionará no início do path
        // y: 0, // Removido
        rotation: 0, // Pode ser necessário se o ícone da seta não estiver orientado corretamente
        transformOrigin: "center center"
    });

    const servicesTlMobile = gsap.timeline({
        scrollTrigger: {
            trigger: servicesSection, 
            start: "top top",
            end: () => "+=" + (window.innerHeight * (serviceCards.length - 1) * 0.5), 
            scrub: true,
            invalidateOnRefresh: true, 
            onUpdate: self => {
                if (servicesCounterElement && serviceCards && serviceCards.length > 0) {
                    const progress = self.progress;
                    const total = serviceCards.length; 
                    const currentIndex = Math.min(Math.floor(progress * total), total - 1);
                    servicesCounterElement.textContent = `${formatCounterNumber(currentIndex + 1)} / ${formatCounterNumber(total)}`; 
                }
            }
        }
    });

    servicesTlMobile.fromTo(serviceDrawMobile, 
        { drawSVG: "0%" }, 
        { drawSVG: "100%", ease: "none" }
    , 0); 

    servicesTlMobile.to(serviceArrowPointMobile, {
        motionPath: {
            path: servicePathMobile,
            align: servicePathMobile,
            alignOrigin: [0.5, 0.5],
            autoRotate: -90, 
            start: 0, // Garante que comece no início do path
            end: 1
        },
        ease: "none",
    }, 0); 
};

    // Função: Animação da Seta do Footer
    const setupFooterArrow = () => {
        if (!footerArrow || !footerPath || !footerDraw || !footerArrowPoint) return;
        gsap.set(footerArrowPoint, { opacity: 0, transformOrigin: "50% 50%" });
        gsap.set(footerDraw, { drawSVG: "0%" });
        const arrowTimeline = gsap.timeline();
        arrowTimeline.to(footerArrowPoint, { opacity: 1, duration: 0.01, ease: "none" }, 0);
        arrowTimeline.to(footerArrowPoint, {
            motionPath: {
                path: footerPath,
                align: footerPath,
                alignOrigin: [0.5, 0.5],
                autoRotate: -90, 
                start: 0,
                end: 1
            },
            ease: "none"
        }, 0);
        arrowTimeline.to(footerDraw, { drawSVG: "100%", ease: "none" }, 0);
        ScrollTrigger.create({
            trigger: "#footer",
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1.5,
            animation: arrowTimeline,
        });
    };
    


    // Chamadas de Inicialização
    setupMenu();
    setupContactModal();
    setupMenuHoverEffects();
    setupPerformanceControls();

    if (typeof initializeHeaderAnimation === 'function') {
        initializeHeaderAnimation(gsap, ScrollTrigger, smoother);
    } else {
        console.warn("Função initializeHeaderAnimation não encontrada.");
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

    const arrowContainerForCheck = document.querySelector('.new-arrow-path-container');
    if (arrowContainerForCheck) {
        setupNewArrowAnimation();
    }

    if (servicesSection) {
        setupStackingCardsAnimation();
        setupServicesCounter();
                setupServicesCounterMobile();
    }


    if (document.getElementById('section-3')) {
        setupLogoMarqueeWithGSAP();
        setupTestimonialSlider();
        ScrollTrigger.normalizeScroll(true);
        ScrollTrigger.config({
            limitCallbacks: true,
            ignoreMobileResize: true
        });
        setupSVGAnimation();
    }

    if (footerArrow) { 
        setupFooterArrow();
    }

    gsap.delayedCall(0.3, () => {
        if (typeof ScrollTrigger !== 'undefined' && typeof ScrollTrigger.refresh === 'function') {
            ScrollTrigger.refresh();
        }
    });
});
