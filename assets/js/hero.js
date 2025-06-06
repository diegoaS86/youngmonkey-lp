// assets/js/hero.js
// Importa a função para verificar o estado das traduções do i18n.js
import { areTranslationsReady } from './i18n.js';

export function initializeHeroSection(gsapInstance, ScrollTriggerInstance, smootherInstance) {
    // Seletores de elementos do DOM
    const line1 = document.getElementById('line1');
    const line2 = document.getElementById('line2');
    const line3 = document.getElementById('line3');
    const scrambleGroup = document.getElementById('scrambleGroup');
    const ctaDotsPattern = document.querySelector('.cta-dots-pattern');
    const dotsContainer = document.getElementById('dotsContainer');
    const ctaLinkHero = document.querySelector('#hero .cta-fixed-container a[href="#section-2"]');

    let localWordSets = {}; // Armazena os conjuntos de palavras para a animação de scramble
    let scrambleAnimation; // Controla a timeline da animação de scramble

    // Helper function to safely get the smoother's speed
    const getSmootherSpeedValue = (instance) => {
        if (instance && typeof instance.speed === 'function') {
            try {
                return instance.speed(); // Get the current speed
            } catch (e) {
                console.error("Error calling instance.speed():", e, instance);
                return 1; // Default speed on error
            }
        }
        // console.warn("smootherInstance.speed is not a function or instance is invalid, defaulting to 1");
        return 1; // Default speed
    };

    // Helper function to safely get the smoother's lag
    const getSmootherLagValue = (instance) => {
        if (instance && typeof instance.lag === 'function') {
            try {
                return instance.lag(); // Get the current lag
            } catch (e) {
                console.error("Error calling instance.lag():", e, instance);
                return 0; // Default lag on error
            }
        }
        // console.warn("smootherInstance.lag is not a function or instance is invalid, defaulting to 0");
        return 0; // Default lag
    };

    // Função para ativar o conteúdo do hero (texto e animação)
    const activateHeroContent = (wordSets) => {
        // console.log("Hero: Ativando conteúdo do herói.");
        localWordSets = wordSets; 

        if (line1 && line2 && line3 && Object.keys(localWordSets).length > 0 &&
            localWordSets.line1 && localWordSets.line1.length > 0 &&
            localWordSets.line2 && localWordSets.line2.length > 0 &&
            localWordSets.line3 && localWordSets.line3.length > 0) {
            
            line1.textContent = localWordSets.line1[0];
            line2.textContent = localWordSets.line2[0];
            line3.textContent = localWordSets.line3[0];
            // console.log("Hero: Conteúdo de texto inicial definido.");

            document.fonts.ready.then(function() {
                // console.log('Hero: Fontes carregadas. Tornando texto visível e iniciando animação.');

                gsapInstance.set([line1, line2, line3], { 
                    autoAlpha: 1, 
                    y: 0,        
                    overwrite: "auto" 
                });
                // console.log("Hero: GSAP.set autoAlpha:1 e y:0 aplicado.");

                gsapInstance.delayedCall(0.1, () => { 
                    if (smootherInstance && typeof smootherInstance.effects === 'function' && smootherInstance.content && typeof smootherInstance.content === 'function') {
                        // console.log("Hero: Chamando smootherInstance.effects() APÓS GSAP.set.");
                        smootherInstance.effects(smootherInstance.content(), { 
                            speed: getSmootherSpeedValue(smootherInstance), 
                            lag: getSmootherLagValue(smootherInstance) 
                        }); 
                    } else if (ScrollTriggerInstance && typeof ScrollTriggerInstance.refresh === 'function') {
                        // console.log("Hero: Chamando ScrollTrigger.refresh() APÓS GSAP.set (smootherInstance.effects não disponível).");
                        ScrollTriggerInstance.refresh(true); 
                    }
                    // console.log("Hero: ScrollTrigger.refresh() (ou via smoother.effects) chamado.");
                    
                    // console.log("Hero: Iniciando setupScrambleAnimationLoop após refresh.");
                    setupScrambleAnimationLoop();
                });
            }).catch(function(e) { 
                console.error('Hero: Erro ao esperar fontes:', e);
                line1.textContent = localWordSets.line1[0] || "VIDEO";
                line2.textContent = localWordSets.line2[0] || "GETS";
                line3.textContent = localWordSets.line3[0] || "ATTENTION";
                gsapInstance.set([line1, line2, line3], { autoAlpha: 1, y: 0 });
                gsapInstance.delayedCall(0.1, () => { 
                    if (smootherInstance && typeof smootherInstance.effects === 'function' && smootherInstance.content && typeof smootherInstance.content === 'function') {
                        smootherInstance.effects(smootherInstance.content(), { 
                            speed: getSmootherSpeedValue(smootherInstance), 
                            lag: getSmootherLagValue(smootherInstance) 
                        });
                    } else if (ScrollTriggerInstance && typeof ScrollTriggerInstance.refresh === 'function') {
                         ScrollTriggerInstance.refresh(true);
                    }
                    setupScrambleAnimationLoop();
                });
            });
        } else {
            console.warn("Hero ScrambleText: Elementos HTML ou wordSets para o scramble não encontrados ou inválidos na ativação.");
            if(line1) line1.textContent = "VIDEO";
            if(line2) line2.textContent = "GETS";
            if(line3) line3.textContent = "ATTENTION";
            if(line1 && line2 && line3) gsapInstance.set([line1, line2, line3], { autoAlpha: 1, y: 0 });
        }
    };
    
    const setupScrambleAnimationLoop = () => {
        if (!line1 || !line2 || !line3 || !scrambleGroup || Object.keys(localWordSets).length === 0) {
            console.warn("Hero ScrambleText Loop: Elementos ou localWordSets faltando para iniciar o loop.");
            if(line1) line1.textContent = "VIDEO";
            if(line2) line2.textContent = "GETS";
            if(line3) line3.textContent = "ATTENTION";
            if(line1 && line2 && line3) gsapInstance.set([line1, line2, line3], { autoAlpha: 1, y: 0 });
            return;
        }
        
        const line1Words = localWordSets.line1 || ["VIDEO"];
        const line2Words = localWordSets.line2 || ["GETS"];
        const line3Words = localWordSets.line3 || ["ATTENTION"];

        if (line1Words.length === 0 || line2Words.length === 0 || line3Words.length === 0) {
            console.warn("Hero ScrambleText Loop: Uma ou mais linhas de localWordSets estão vazias. Usando fallback no loop e garantindo visibilidade.");
            line1.textContent = "VIDEO"; 
            line2.textContent = "GETS";
            line3.textContent = "ATTENTION";
            gsapInstance.set([line1, line2, line3], { autoAlpha: 1, y: 0, overwrite: "auto" });
        }
        
        if (scrambleAnimation && typeof scrambleAnimation.kill === 'function' && scrambleAnimation.isActive()) {
            scrambleAnimation.kill(); 
            // console.log("Hero: Animação de scramble anterior interrompida para recomeçar.");
        }

        let counter = 0;
        function animate() {
            const currentLine1Words = (localWordSets.line1 && localWordSets.line1.length > 0) ? localWordSets.line1 : ["VIDEO"];
            const currentLine2Words = (localWordSets.line2 && localWordSets.line2.length > 0) ? localWordSets.line2 : ["GETS"];
            const currentLine3Words = (localWordSets.line3 && localWordSets.line3.length > 0) ? localWordSets.line3 : ["ATTENTION"];

            const word1 = currentLine1Words[counter % currentLine1Words.length];
            const word2 = currentLine2Words[counter % currentLine2Words.length];
            const word3 = currentLine3Words[counter % currentLine3Words.length];
            const groupIndex = currentLine1Words.length > 0 ? (counter % currentLine1Words.length) : 0;
            
            if (scrambleGroup) { 
                scrambleGroup.className = 'scramble-title'; 
                scrambleGroup.classList.add(`group-${groupIndex}`);
            }

            scrambleAnimation = gsapInstance.timeline({
                onComplete: () => {
                    gsapInstance.delayedCall(3, animate); 
                }
            });
            scrambleAnimation.to(line1, {
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
        // console.log("Hero: Chamando animate() para o loop de scramble.");
        animate(); 
    };
    
    document.addEventListener('translationsReady', function(event) {
        // console.log("Hero: Evento 'translationsReady' recebido.");
        if (event.detail && event.detail.scrambleWordSets) {
            activateHeroContent(event.detail.scrambleWordSets);
        } else {
             console.warn("Hero: Evento 'translationsReady' sem scrambleWordSets válidos.");
             activateHeroContent({ line1: ["VIDEO"], line2: ["GETS"], line3: ["ATTENTION"] });
        }
    });

    if (areTranslationsReady()) {
        // console.log("Hero: Traduções já estavam prontas na inicialização do hero.js. Ativando conteúdo.");
        import('./i18n.js').then(i18nModule => {
            const wordSets = i18nModule.getScrambleWordSets();
            if (wordSets && wordSets.line1) { 
                activateHeroContent(wordSets);
            } else {
                console.warn("Hero: getScrambleWordSets retornou inválido mesmo após areTranslationsReady ser true.");
                activateHeroContent({ line1: ["VIDEO"], line2: ["GETS"], line3: ["ATTENTION"] }); 
            }
        }).catch(error => {
            console.error("Hero: Erro ao importar i18n.js para getScrambleWordSets:", error);
            activateHeroContent({ line1: ["VIDEO"], line2: ["GETS"], line3: ["ATTENTION"] }); 
        });
    }

    const setupDotsCreation = () => {
        if (!dotsContainer) return;
        const rows = 4;
        const cols = 12;
        dotsContainer.innerHTML = ''; // Limpa dots existentes para evitar duplicatas
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
        gsapInstance.set(dotsContainer.querySelectorAll('.dot'), { opacity: 0.3, scale: 1 });
    };

    const setupDotsScrollAnimation = () => {
        if (!dotsContainer || !dotsContainer.children.length) { return; }
        const allDots = gsapInstance.utils.toArray(dotsContainer.querySelectorAll(".dot"));
        const totalDots = allDots.length;
        if (totalDots === 0) return; // Sai se não encontrar pontos
        let lastRandomizeScroll = 0;
        const scrollThreshold = 50; 

        const randomizeDotOpacity = () => {
            gsapInstance.to(allDots, { opacity: 0.1, scale: 1, backgroundColor: 'var(--light-color)', boxShadow: 'none', duration: 0.1, ease: "expo.InOut" });
            const numToActivate = Math.floor(totalDots * (0.1 + Math.random() * 0.4));
            const shuffledDots = gsapInstance.utils.shuffle(allDots.slice()); 
            const dotsToActivate = shuffledDots.slice(0, numToActivate);
            gsapInstance.to(dotsToActivate, { opacity: 1, scale: 1.4, backgroundColor: 'var(--accent-color)', boxShadow: '0 0 10px var(--accent-color)', duration: 0.1, ease: "expo.InOut", stagger: { each: 0.05, from: "random" } });
        };
        
        ScrollTriggerInstance.create({
            trigger: 'body', start: "top top", end: "max",
            onUpdate: (self) => {
                // Corrigido para obter a posição de rolagem corretamente
                const currentScrollY = (smootherInstance && typeof smootherInstance.scrollTop === 'function') ? smootherInstance.scrollTop() : self.scroll();
                if (Math.abs(currentScrollY - lastRandomizeScroll) >= scrollThreshold) {
                    randomizeDotOpacity();
                    lastRandomizeScroll = currentScrollY;
                }
            }
        });
        randomizeDotOpacity(); 
    };

    const setupCtaDotsAnimation = () => {
        if (!ctaDotsPattern) return;
        const patternClasses = ['pattern-1', 'pattern-2', 'pattern-3'];
        let currentPatternIndex = 0;
        gsapInstance.timeline({ repeat: -1, repeatDelay: 0.5 })
            .call(() => {
                if (ctaDotsPattern) { 
                   ctaDotsPattern.className = 'cta-dots-pattern ' + patternClasses[currentPatternIndex];
                }
                currentPatternIndex = (currentPatternIndex + 1) % patternClasses.length;
            })
            .to({}, { duration: 1 }); 
    };

    const setupCtaScroll = () => {
        if (ctaLinkHero) {
            ctaLinkHero.addEventListener('click', (event) => {
                event.preventDefault();
                if (smootherInstance && typeof smootherInstance.scrollTo === 'function') { 
                    smootherInstance.scrollTo("#section-2", true, "top");
                } else { 
                    // console.warn("ScrollSmoother instance not found for CTA link or scrollTo is not a function.");
                    const targetElement = document.getElementById("section-2");
                    if (targetElement) { targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                }
            });
        } else { 
            // console.warn("Link CTA para #section-2 não encontrado no Hero."); 
        }
    };

    if (dotsContainer) { setupDotsCreation(); if (smootherInstance) { setupDotsScrollAnimation(); } }
    if (ctaDotsPattern) { setupCtaDotsAnimation(); }
    setupCtaScroll();

    // console.log("Hero Section Initialized (verificando/aguardando traduções para ScrambleText).");
}
