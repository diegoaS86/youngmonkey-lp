import { areTranslationsReady } from './i18n.js';
import Player from '@vimeo/player';

/**
 * Verifica se o vídeo do Vimeo está disponível.
 * @param {string} videoId 
 * @returns {Promise<boolean>}
 */
const isVimeoAlive = (videoId) => {
    if (!videoId) return Promise.resolve(false);
    return new Promise((resolve) => {
        const timeout = 3000;
        const timer = setTimeout(() => resolve(false), timeout);
        fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`)
            .then(response => {
                clearTimeout(timer);
                resolve(response.ok);
            })
            .catch(() => {
                clearTimeout(timer);
                resolve(false);
            });
    });
};

/**
 * Cria um iframe para carregar o vídeo no Vimeo.
 * @param {string} videoId 
 * @returns {HTMLIFrameElement}
 */
const createVimeoIframe = (videoId) => {
    const videoUrl = `https://player.vimeo.com/video/${videoId}?background=1&autoplay=1&loop=1&autopause=0&muted=1`;
    const iframe = document.createElement('iframe');
    iframe.src = videoUrl;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
    return iframe;
};

/**
 * Cria um elemento de vídeo local para fallback.
 * @param {string} fallbackSrc 
 * @returns {HTMLVideoElement}
 */
const createFallbackVideo = (fallbackSrc) => {
    const videoEl = document.createElement('video');
    videoEl.src = fallbackSrc;
    videoEl.autoplay = true;
    videoEl.loop = true;
    videoEl.muted = true;
    videoEl.playsInline = true;
    return videoEl;
};

/**
 * Carrega o vídeo da seção hero utilizando Vimeo ou fallback local.
 * @param {object} gsapInstance 
 */
const loadHeroVideo = async (gsapInstance) => {
    const container = document.querySelector('.hero__video-container');
    if (!container) return;

    const { videoId, videoFallbackSrc: fallbackSrc } = container.dataset;
    // Se não houver nenhuma fonte, aborta.
    if (!videoId && !fallbackSrc) return;

    const thumbWrapper = container.querySelector('.hero-thumb');
    const useVimeo = await isVimeoAlive(videoId);
    let videoElement;

    if (useVimeo && typeof Player !== 'undefined') {
        console.log("Hero: Carregando player do Vimeo.");
        videoElement = createVimeoIframe(videoId);
    } else {
        if (!fallbackSrc) return;
        console.warn("Hero: Carregando vídeo de fallback local.");
        videoElement = createFallbackVideo(fallbackSrc);
    }

    // Prepara a animação inicial para a opacidade do vídeo.
    gsapInstance.set(videoElement, { opacity: 0 });
    const overlay = container.querySelector('.hero__video-overlay');
    container.insertBefore(videoElement, overlay);

    const onPlaying = () => {
        gsapInstance.to(videoElement, { opacity: 1, duration: 0.8 });
        if (thumbWrapper) {
            gsapInstance.to(thumbWrapper, { opacity: 0, duration: 1.2, onComplete: () => thumbWrapper.style.display = 'none' });
        }
    };

    if (useVimeo) {
        const player = new Player(videoElement);
        player.on('playing', onPlaying);
    } else {
        videoElement.addEventListener('playing', onPlaying);
    }
};

export function initializeHeroSection(gsapInstance, ScrollTriggerInstance, smootherInstance) {
    // Inicia o carregamento do vídeo na seção Hero.
    loadHeroVideo(gsapInstance);

    // ... O restante do código da seção hero permanece inalterado.
    
    const line1 = document.getElementById('line1');
    const line2 = document.getElementById('line2');
    const line3 = document.getElementById('line3');
    const scrambleGroup = document.getElementById('scrambleGroup');
    const ctaDotsPattern = document.querySelector('.cta-dots-pattern');
    const dotsContainer = document.getElementById('dotsContainer');
    const ctaLinkHero = document.querySelector('#hero .cta-fixed-container a[href="#section-2"]');

    let localWordSets = {}; 
    let scrambleAnimation; 

    const getSmootherSpeedValue = (instance) => {
        if (instance && typeof instance.speed === 'function') {
            try { return instance.speed(); } catch (e) { console.error("Error calling instance.speed():", e, instance); return 1; }
        }
        return 1;
    };

    const getSmootherLagValue = (instance) => {
        if (instance && typeof instance.lag === 'function') {
            try { return instance.lag(); } catch (e) { console.error("Error calling instance.lag():", e, instance); return 0; }
        }
        return 0;
    };

    const activateHeroContent = (wordSets) => {
        localWordSets = wordSets; 
        if (line1 && line2 && line3 && Object.keys(localWordSets).length > 0 &&
            localWordSets.line1?.length > 0 &&
            localWordSets.line2?.length > 0 &&
            localWordSets.line3?.length > 0) {
            
            line1.textContent = localWordSets.line1[0];
            line2.textContent = localWordSets.line2[0];
            line3.textContent = localWordSets.line3[0];
            
            document.fonts.ready.then(() => {
                gsapInstance.set([line1, line2, line3], { autoAlpha: 1, y: 0, overwrite: "auto" });
                gsapInstance.delayedCall(0.1, () => { 
                    if (smootherInstance && typeof smootherInstance.effects === 'function' && smootherInstance.content && typeof smootherInstance.content === 'function') {
                        smootherInstance.effects(smootherInstance.content(), { speed: getSmootherSpeedValue(smootherInstance), lag: getSmootherLagValue(smootherInstance) }); 
                    } else if (ScrollTriggerInstance && typeof ScrollTriggerInstance.refresh === 'function') {
                        ScrollTriggerInstance.refresh(true); 
                    }
                    setupScrambleAnimationLoop();
                });
            }).catch(e => {
                console.error('Hero: Erro ao esperar fontes:', e);
                line1.textContent = localWordSets.line1[0] || "VIDEO";
                line2.textContent = localWordSets.line2[0] || "GETS";
                line3.textContent = localWordSets.line3[0] || "ATTENTION";
                gsapInstance.set([line1, line2, line3], { autoAlpha: 1, y: 0 });
                gsapInstance.delayedCall(0.1, () => { 
                    if (smootherInstance && typeof smootherInstance.effects === 'function' && smootherInstance.content && typeof smootherInstance.content === 'function') {
                        smootherInstance.effects(smootherInstance.content(), { speed: getSmootherSpeedValue(smootherInstance), lag: getSmootherLagValue(smootherInstance) });
                    } else if (ScrollTriggerInstance && typeof ScrollTriggerInstance.refresh === 'function') {
                        ScrollTriggerInstance.refresh(true);
                    }
                    setupScrambleAnimationLoop();
                });
            });
        } else {
            if(line1) line1.textContent = "VIDEO";
            if(line2) line2.textContent = "GETS";
            if(line3) line3.textContent = "ATTENTION";
            if(line1 && line2 && line3) gsapInstance.set([line1, line2, line3], { autoAlpha: 1, y: 0 });
        }
    };
    
    const setupScrambleAnimationLoop = () => {
        if (!line1 || !line2 || !line3 || !scrambleGroup || Object.keys(localWordSets).length === 0) {
            if(line1) line1.textContent = "VIDEO";
            if(line2) line2.textContent = "GETS";
            if(line3) line3.textContent = "ATTENTION";
            if(line1 && line2 && line3) gsapInstance.set([line1, line2, line3], { autoAlpha: 1, y: 0, overwrite: "auto" });
            return;
        }
        
        const line1Words = localWordSets.line1 || ["VIDEO"];
        const line2Words = localWordSets.line2 || ["GETS"];
        const line3Words = localWordSets.line3 || ["ATTENTION"];

        if (line1Words.length === 0 || line2Words.length === 0 || line3Words.length === 0) {
            line1.textContent = "VIDEO"; 
            line2.textContent = "GETS";
            line3.textContent = "ATTENTION";
            gsapInstance.set([line1, line2, line3], { autoAlpha: 1, y: 0, overwrite: "auto" });
        }
        
        if (scrambleAnimation && typeof scrambleAnimation.kill === 'function' && scrambleAnimation.isActive()) {
            scrambleAnimation.kill(); 
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
        animate(); 
    };
    
    document.addEventListener('translationsReady', function(event) {
        if (event.detail && event.detail.scrambleWordSets) {
            activateHeroContent(event.detail.scrambleWordSets);
        } else {
            activateHeroContent({ line1: ["VIDEO"], line2: ["GETS"], line3: ["ATTENTION"] });
        }
    });

    if (areTranslationsReady()) {
        import('./i18n.js').then(i18nModule => {
            const wordSets = i18nModule.getScrambleWordSets();
            if (wordSets && wordSets.line1) { 
                activateHeroContent(wordSets);
            } else {
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
        dotsContainer.innerHTML = '';
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
        if (!dotsContainer || !dotsContainer.children.length) return;
        const allDots = gsapInstance.utils.toArray(dotsContainer.querySelectorAll(".dot"));
        const totalDots = allDots.length;
        if (totalDots === 0) return;
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
                    const targetElement = document.getElementById("section-2");
                    if (targetElement) { targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                }
            });
        }
    };
    
    if (dotsContainer) { 
        setupDotsCreation(); 
        if (smootherInstance) setupDotsScrollAnimation(); 
    }
    if (ctaDotsPattern) setupCtaDotsAnimation();
    setupCtaScroll();
    
    gsapInstance.set('#hero', { visibility: 'visible' });
}