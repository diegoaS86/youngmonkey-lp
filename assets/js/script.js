// assets/js/script.js
document.addEventListener('DOMContentLoaded', () => {
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
    const serviceCardCounterElement = document.getElementById('serviceCardCounter');


    let smoother;

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

    const wordSets = {
        line1: ["Design", "Videos", "Campaigns", "Content", "Reels", "Branding"],
        line2: ["solves", "sells", "speaks", "adds", "gets", "is"],
        line3: ["problem", "more", "loud", "value", "attention", "sexy"]
    };

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
        }
    }

    if (typeof initializeHeaderAnimation === 'function') {
        initializeHeaderAnimation(gsap, ScrollTrigger, smoother);
    }

    const setupMenu = () => {
        if (!hamburger || !navBox || !menu) {
            return;
        }
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

    const setupContactModal = () => {
        if (contactBtn) {
        }
    };

    const setupMenuHoverEffects = () => {
        if (!menuLinks.length) {
            return;
        }
        menuLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                gsap.to(link, { x: 5, color: 'var(--accent-color)', duration: 0.3 });
            });
            link.addEventListener('mouseleave', () => {
                gsap.to(link, { x: 0, color: 'var(--light-color)', duration: 0.3 });
            });
        });
    };

    function animateScrambleText() {
        if (!line1 || !line2 || !line3 || !scrambleGroup) {
            return;
        }
        let counter = 0;
        function animate() {
            const word1 = wordSets.line1[counter % wordSets.line1.length];
            const word2 = wordSets.line2[counter % wordSets.line2.length];
            const word3 = wordSets.line3[counter % wordSets.line3.length];
            const groupIndex = counter % wordSets.line1.length;
            scrambleGroup.className = 'scramble-title';
            scrambleGroup.classList.add(`group-${groupIndex}`);

            const tl = gsap.timeline({
                onComplete: () => {
                    gsap.delayedCall(3, animate);
                }
            });
            tl.to(line1, { duration: 1.5, scrambleText: { text: word1, chars: "!<>-_\\/[]{}—=+*^?#_", revealDelay: 0.3, speed: 0.7 }, ease: "power3.out" }, 0)
              .to(line2, { duration: 1.5, scrambleText: { text: word2, chars: "!<>-_\\/[]{}—=+*^?#_", revealDelay: 0.3, speed: 0.7 }, ease: "power3.out" }, 0)
              .to(line3, { duration: 1.5, scrambleText: { text: word3, chars: "!<>-_\\/[]{}—=+*^?#_", revealDelay: 0.3, speed: 0.7 }, ease: "power3.out" }, 0);
            counter++;
        }
        gsap.set([line1, line2, line3], { opacity: 1, delay: 0.1 });
        animate();
    }

    const setupPerformanceControls = () => {
        document.addEventListener('visibilitychange', () => {
            if (gsap.globalTimeline) {
                gsap.globalTimeline[document.hidden ? 'pause' : 'resume']();
            }
        });
    };

    const setupDotsCreation = () => {
        if (!dotsContainer) {
            return;
        }
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

    const setupDotsScrollAnimation = () => {
        if (!dotsContainer || !dotsContainer.children.length) {
            return;
        }
        const allDots = gsap.utils.toArray(dotsContainer.querySelectorAll(".dot"));
        const totalDots = allDots.length;
        let lastRandomizeScroll = 0;
        const scrollThreshold = 150;

        const randomizeDotOpacity = () => {
            gsap.to(allDots, {
                opacity: 0.2, scale: 1, backgroundColor: 'var(--light-color)', boxShadow: 'none',
                duration: 0.2, ease: "power2.out"
            });
            const numToActivate = Math.floor(totalDots * (0.1 + Math.random() * 0.4));
            const shuffledDots = gsap.utils.shuffle(allDots.slice());
            const dotsToActivate = shuffledDots.slice(0, numToActivate);
            gsap.to(dotsToActivate, {
                opacity: 1, scale: 1.4, backgroundColor: 'var(--accent-color)',
                boxShadow: '0 0 10px var(--accent-color)',
                duration: 0.3, ease: "power2.out", stagger: { each: 0.05, from: "random" }
            });
        };

        ScrollTrigger.create({
            trigger: 'body', start: "top top", end: "max",
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

    const setupCtaDotsAnimation = () => {
        if (!ctaDotsPattern) {
            return;
        }
        const patternClasses = ['pattern-1', 'pattern-2', 'pattern-3'];
        let currentPatternIndex = 0;
        gsap.timeline({ repeat: -1, repeatDelay: 0.5 })
            .call(() => {
                ctaDotsPattern.className = 'cta-dots-pattern ' + patternClasses[currentPatternIndex];
                currentPatternIndex = (currentPatternIndex + 1) % patternClasses.length;
            })
            .to({}, { duration: 1 });
    };

    const setupDynamicCounterAnimation = () => {
        if (!dynamicCounterElement) {
            return;
        }
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

    const applyLongShadow = (elementId, shadowColor = '#00151B', length = 100, spacing = 0.1) => {
        const textElement = document.getElementById(elementId);
        if (!textElement) {
            return;
        }
        let shadow = [];
        for (let i = 1; i <= length; i++) {
            shadow.push(`${i * spacing}px ${i * spacing}px ${shadowColor}`);
        }
        textElement.style.textShadow = shadow.join(', ');
    };

    const setupTextAppearAnimation = (elementId) => {
        const textContainer = document.getElementById(elementId);
        if (!textContainer) {
            return;
        }

        const words = gsap.utils.toArray(textContainer.querySelectorAll("span"));

        if (words.length === 0) {
            return;
        }
        
        const textAnimation = gsap.fromTo(words, 
            { autoAlpha: 0, y: 30 }, 
            { 
                autoAlpha: 1, 
                y: 0,
                duration: 1, 
                stagger: 0.2, 
                ease: "power2.out"
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

    const setupNewArrowAnimation = () => {
        if (!newArrowSvgContainer || !mainPathForMotion || !visiblePathToDraw || !arrowHeadElement) {
            return;
        }

        gsap.set(arrowHeadElement, { 
            opacity: 0,
        });
        gsap.set(visiblePathToDraw, { 
            drawSVG: "0%" 
        });

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
                alignOrigin: [0.5, 0.5], 
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

    const setupStackingCardsAnimation = () => {
        if (!servicesSection || !servicesContainerForPin || !servicesRightPanel || !serviceCards.length) {
            return;
        }

        // Define o estado inicial dos cards
        serviceCards.forEach((card, index) => {
            gsap.set(card, {
                // O CSS já posiciona com left: 50%; transform: translate(-50%, -50%);
                // Então, para x, 0 significa centralizado.
                // Para y, -50% já está no CSS para centralização vertical.
                x: index === 0 ? "-50%" : "110%", // Primeiro card no centro, outros à direita fora da tela (usando x em vez de xPercent para evitar conflito com transform no CSS)
                opacity: 1, // Todos os cards começam com opacidade 1
                scale: index === 0 ? 1 : 1.1, // Primeiro card em escala normal, outros começam um pouco maiores
                zIndex: index === 0 ? serviceCards.length : index, // zIndex para empilhamento inicial
                // yPercent: -50, // Já está no CSS via transform
            });
        });
        // Garante que o primeiro card esteja visível e no topo da "pilha" inicial (embora os outros estejam fora)
        if (serviceCards.length > 0) {
            gsap.set(serviceCards[0], { zIndex: serviceCards.length });
        }


        const cardStackTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: servicesSection,
                pin: servicesContainerForPin,
                pinSpacing: true,
                start: "top top",
                end: () => "+=" + (window.innerHeight * (serviceCards.length -1) * 0.5), // Ajuste este multiplicador (0.5)
                scrub: 1,
                invalidateOnRefresh: true,
                // markers: true,
            }
        });

        serviceCards.forEach((card, index) => {
            if (index > 0) { 
                cardStackTimeline.to(card, {
                    x: "-50%", // Move para a posição central (CSS: left: 50%; transform: translateX(-50%))
                    scale: 1, // Anima para a escala final de 1
                    duration: 0.8, 
                    ease: "expo.inOut",
                    onStart: () => {
                        gsap.set(card, { zIndex: serviceCards.length + index + 1 }); 
                        if(serviceCards[index-1]) {
                           // Efeito opcional no card anterior ao ser coberto
                           // gsap.to(serviceCards[index-1], { scale: 0.95, opacity:0.8, duration:0.3});
                        }
                    }
                }, `-=${0.35}`); // Ajustado o overlap para um fluxo potencialmente mais suave
            }
        });
    };


    setupMenu();
    setupContactModal();
    setupMenuHoverEffects();
    setupPerformanceControls();

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

    const transformeTextEl = document.getElementById('transformeText'); 
    if (transformeTextEl) {
        applyLongShadow('transformeText', '#00151B', 80, 0.1); 
        setupTextAppearAnimation('transformeText');
    }
    
    if (newArrowSvgContainer) {
        setupNewArrowAnimation();
    }

    if (servicesSection) {
        setupStackingCardsAnimation(); 
    }
    
    gsap.delayedCall(0.3, () => { 
        if (typeof ScrollTrigger !== 'undefined' && typeof ScrollTrigger.refresh === 'function') {
            ScrollTrigger.refresh();
        }
    });
});
