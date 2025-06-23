import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import Player from '@vimeo/player';

// Variáveis e configurações locais ao módulo
let items = [];
let vimeoPlayers = {};
let localPlayers = {};
let carouselWrapper, videoTitleClientElement, prevButton, nextButton;
let section4Element, section3Element, navVideoElement, sectionTitleShowcaseElement;
let currentIndex = 0;
let isAnimating = false;
let slideWidth;
let positions = {};

const ASPECT_RATIO = 1150 / 647;
const BASE_CONFIG = {
    baseMinVwFactor: 0.60,
    basePreferredPx: 1150,
    baseMaxVwFactor: 0.70,
    baseMaxHeightFactor: 0.70,
    smallScreenBreakpoint: 768,
    intermediateBreakpoint: 1024,
    smallScreenVwFactor: 0.95,
    intermediateVwFactor: 0.80,
    smallScreenMaxHeightFactor: 0.75
};

// Funções helper para cálculos
const calculateGapBetweenSlides = (viewportWidth) => {
    const calculatedGap = viewportWidth > BASE_CONFIG.intermediateBreakpoint
        ? viewportWidth * 0.03
        : viewportWidth > BASE_CONFIG.smallScreenBreakpoint
            ? viewportWidth * 0.04
            : viewportWidth * 0.01;
    return Math.max(10, Math.min(calculatedGap, 50));
};

const calculatePreviewPositions = (containerWidth, slideWidth, gapBetweenSlides) => {
    const centerLeftPos = (containerWidth / 2) - (slideWidth / 2);
    const leftPreviewPos = window.innerWidth < BASE_CONFIG.smallScreenBreakpoint
        ? -slideWidth - gapBetweenSlides
        : centerLeftPos - (slideWidth + gapBetweenSlides);
    const rightPreviewPos = window.innerWidth < BASE_CONFIG.smallScreenBreakpoint
        ? containerWidth + gapBetweenSlides
        : centerLeftPos + (slideWidth + gapBetweenSlides);
    const hiddenExtraOffset = slideWidth * 0.5;
    return {
        centerLeftPos,
        leftPreviewPos,
        rightPreviewPos,
        hiddenLeft: leftPreviewPos - hiddenExtraOffset,
        hiddenRight: rightPreviewPos + hiddenExtraOffset
    };
};

const calculateTranslateYString = (viewportWidth) => {
    const [minWidth, maxWidth] = [360, 1200];
    const [minY, maxY] = [20, -20];
    const currentY = viewportWidth <= minWidth
        ? minY
        : viewportWidth >= maxWidth
            ? maxY
            : minY + (maxY - minY) * ((viewportWidth - minWidth) / (maxWidth - minWidth));
    return `${currentY.toFixed(2)}px`;
};

const calculateActualSlideWidth = () => {
    const { innerWidth: viewportWidth, innerHeight: viewportHeight } = window;
    if (viewportWidth <= 0 || viewportHeight <= 0) return 300;
    
    let currentMinVw, currentPreferredPx = BASE_CONFIG.basePreferredPx, currentMaxVw, currentMaxHeightFactorUsed;
    
    if (viewportWidth < BASE_CONFIG.smallScreenBreakpoint) {
        currentMinVw = BASE_CONFIG.baseMinVwFactor * viewportWidth;
        currentMaxVw = BASE_CONFIG.smallScreenVwFactor * viewportWidth;
        currentMaxHeightFactorUsed = BASE_CONFIG.smallScreenMaxHeightFactor;
    } else if (viewportWidth <= BASE_CONFIG.intermediateBreakpoint) {
        currentMinVw = BASE_CONFIG.baseMinVwFactor * viewportWidth;
        currentMaxVw = BASE_CONFIG.intermediateVwFactor * viewportWidth;
        currentMaxHeightFactorUsed = BASE_CONFIG.baseMaxHeightFactor;
    } else {
        currentMinVw = BASE_CONFIG.baseMinVwFactor * viewportWidth;
        currentMaxVw = BASE_CONFIG.baseMaxVwFactor * viewportWidth;
        currentMaxHeightFactorUsed = BASE_CONFIG.baseMaxHeightFactor;
    }
    
    const widthFromClamp = Math.max(currentMinVw, Math.min(currentPreferredPx, currentMaxVw));
    const correspondingHeight = widthFromClamp / ASPECT_RATIO;
    const maxHeightPixels = currentMaxHeightFactorUsed * viewportHeight;
    const finalWidth = correspondingHeight > maxHeightPixels ? (maxHeightPixels * ASPECT_RATIO) : widthFromClamp;
    
    return (finalWidth <= 0 || isNaN(finalWidth))
        ? Math.max(100, viewportWidth * 0.6)
        : finalWidth;
};

const calculateRenderedItemHeight = () => slideWidth && !isNaN(slideWidth) ? slideWidth / ASPECT_RATIO : 0;

const updateCarouselPositions = () => {
    if (!carouselWrapper) return;
    slideWidth = calculateActualSlideWidth();
    const renderedItemHeight = calculateRenderedItemHeight();
    document.documentElement.style.setProperty('--dynamic-slide-height', renderedItemHeight + 'px');
    document.documentElement.style.setProperty('--dynamic-slide-width', slideWidth + 'px');

    const containerWidth = carouselWrapper.offsetWidth;
    const viewportWidth = window.innerWidth;
    const gapBetweenSlides = calculateGapBetweenSlides(viewportWidth);
    positions = calculatePreviewPositions(containerWidth, slideWidth, gapBetweenSlides);
    positions.center = { left: positions.centerLeftPos, top: 162, scale: 1, opacity: 1, zIndex: 1, translateY: calculateTranslateYString(viewportWidth) };
    positions.leftPreview = { left: positions.leftPreviewPos, top: 222, scale: 1, opacity: 0.9, zIndex: 1 };
    positions.rightPreview = { left: positions.rightPreviewPos, top: 222, scale: 1, opacity: 0.9, zIndex: 1 };
    positions.hiddenSlideOutLeft = { left: positions.hiddenLeft, top: 222, scale: 1, opacity: 0, zIndex: 0 };
    positions.hiddenSlideOutRight = { left: positions.hiddenRight, top: 222, scale: 1, opacity: 0, zIndex: 0 };
    positions.initialHidden = { left: positions.centerLeftPos, top: 222, scale: 1, opacity: 0, zIndex: 0 };
};

const applyCurrentItemStates = (useAnimation = false) => {
    if (!items.length || !Object.keys(positions).length) return;
    items.forEach((item, index) => {
        let targetKey;
        if (items.length === 1) targetKey = "center";
        else if (index === currentIndex) targetKey = "center";
        else if (index === (currentIndex - 1 + items.length) % items.length) targetKey = "leftPreview";
        else if (index === (currentIndex + 1) % items.length) targetKey = "rightPreview";
        if (targetKey && positions[targetKey]) {
            const finalWidth = slideWidth > 0 ? `${slideWidth}px` : '80%';
            useAnimation
                ? gsap.to(item, { ...positions[targetKey], width: finalWidth, duration: 0.4 })
                : gsap.set(item, { ...positions[targetKey], width: finalWidth });
        } else {
            gsap.set(item, { opacity: 0, scale: 0.8, width: '80%' });
        }
    });
    if (videoTitleClientElement && items[currentIndex]?.dataset) {
        const title = items[currentIndex].dataset.title || 'Título Indisponível';
        useAnimation
            ? gsap.to(videoTitleClientElement, { opacity: 1, duration: 0.35, text: title })
            : gsap.set(videoTitleClientElement, { opacity: 1, textContent: title });
    }
};

const adjustSectionHeight = () => {
    if (!section4Element || !carouselWrapper || !navVideoElement || !sectionTitleShowcaseElement || !Object.keys(positions).length || !slideWidth) return;
    const renderedItemHeight = calculateRenderedItemHeight();
    if (!renderedItemHeight) return;
    const titleHeight = sectionTitleShowcaseElement.offsetHeight;
    const computedStyle = window.getComputedStyle(sectionTitleShowcaseElement);
    const totalTitleSpace = titleHeight +
        parseFloat(computedStyle.marginTop || 0) +
        parseFloat(computedStyle.marginBottom || 0);
    const centerTranslateY = parseFloat(positions.center?.translateY) || 0;
    const centerEffectiveTop = (positions.center?.top || 0) + centerTranslateY;
    const centerItemBottom = centerEffectiveTop + renderedItemHeight;
    const previewItemBottom = (positions.leftPreview?.top || 0) + renderedItemHeight;
    const carouselLowest = Math.max(centerItemBottom, previewItemBottom);
    
    const navVideoHeight = navVideoElement.offsetHeight;
    const viewportHeight = window.innerHeight;
    const gapItemsNav = Math.max(20, viewportHeight * 0.02);
    const requiredCarouselHeight = carouselLowest + gapItemsNav + navVideoHeight;
    
    carouselWrapper.style.height = `${requiredCarouselHeight}px`;
    
    const gapAfterTitle = Math.max(30, viewportHeight * 0.03);
    const totalRequiredHeight = totalTitleSpace + gapAfterTitle + requiredCarouselHeight;
    const minOverallHeight = viewportHeight * 0.5;
    
    section4Element.style.height = `${Math.max(minOverallHeight, totalRequiredHeight)}px`;
};

const handleResize = () => {
    updateCarouselPositions();
    applyCurrentItemStates(false);
    adjustSectionHeight();
    if (typeof ScrollTrigger !== 'undefined' && typeof ScrollTrigger.refresh === 'function') {
        ScrollTrigger.refresh();
    }
};

const isVimeoAlive = (videoId) => {
    if (!videoId) return Promise.resolve(false);
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            console.warn("Vimeo API timed out.");
            resolve(false);
        }, 3000);
        fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`)
            .then(response => { clearTimeout(timer); resolve(response.ok); })
            .catch(() => { clearTimeout(timer); resolve(false); });
    });
};

const setupAudioToggle = (item, player, isMuted, playerType) => {
    const audioButton = item.querySelector('.video-audio-toggle');
    if (!audioButton) return;
    const newBtn = audioButton.cloneNode(true);
    audioButton.parentNode.replaceChild(newBtn, audioButton);
    newBtn.classList.toggle('is-unmuted', !isMuted);
    newBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (playerType === 'vimeo') {
            try {
                const volume = await player.getVolume();
                volume > 0
                    ? await player.setVolume(0)
                    : await player.setVolume(1);
                newBtn.classList.toggle('is-unmuted', volume === 0);
            } catch (error) {
                console.error("Erro ao alternar áudio Vimeo:", error);
            }
        } else {
            player.muted = !player.muted;
            newBtn.classList.toggle('is-unmuted', !player.muted);
        }
    });
};

const loadAndPlayVideo = async (item, index, startMuted = false) => {
    const { videoId, videoFallbackSrc } = item.dataset;
    const container = item.querySelector('.vimeo-player-container');
    if ((!videoId && !videoFallbackSrc) || !container) return;
    const thumb = container.querySelector('img');
    const playIcon = container.querySelector('.play-icon-overlay');
    if (await isVimeoAlive(videoId) && typeof Player !== 'undefined') {
        const iframe = document.createElement('iframe');
        iframe.src = `https://player.vimeo.com/video/${videoId}?autoplay=1&loop=1&autopause=0&controls=0&title=0&byline=0&portrait=0&dnt=1${startMuted ? '&muted=1' : ''}`;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
        iframe.setAttribute('allowfullscreen', '');
        gsap.set(iframe, { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0 });
        container.appendChild(iframe);
        const player = new Player(iframe);
        vimeoPlayers[index] = player;
        player.on('playing', () => {
            gsap.to(iframe, { opacity: 1, duration: 0.4 });
            if (thumb) gsap.to(thumb, { opacity: 0, duration: 0.4, onComplete: () => thumb.style.display = 'none' });
            if (playIcon) gsap.to(playIcon, { autoAlpha: 0, duration: 0.4 });
        });
        player.ready().then(() => setupAudioToggle(item, player, startMuted, 'vimeo'));
    } else {
        if (!videoFallbackSrc) {
            console.error(`Vimeo offline e sem fallback para o slide ${index}`);
            return;
        }
        console.warn(`Vimeo não respondeu. Carregando vídeo local para o slide ${index}.`);
        if (thumb && thumb.dataset.thumbFallbackSrc) thumb.src = thumb.dataset.thumbFallbackSrc;
        const videoEl = document.createElement('video');
        Object.assign(videoEl, {
            src: videoFallbackSrc,
            loop: true,
            autoplay: true,
            muted: startMuted,
            playsInline: true
        });
        gsap.set(videoEl, { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0 });
        container.appendChild(videoEl);
        localPlayers[index] = videoEl;
        videoEl.addEventListener('playing', () => {
            gsap.to(videoEl, { opacity: 1, duration: 0.4 });
            if (thumb) gsap.to(thumb, { opacity: 0, duration: 0.4, onComplete: () => thumb.style.display = 'none' });
            if (playIcon) gsap.to(playIcon, { autoAlpha: 0, duration: 0.4 });
        });
        setupAudioToggle(item, videoEl, startMuted, 'local');
    }
};

const goToSlide = (newCenterIndex, swipeDirection) => {
    if (isAnimating || (newCenterIndex === currentIndex && items.length > 1)) return;
    isAnimating = true;
    const oldIndex = currentIndex;
    currentIndex = newCenterIndex;
    if (vimeoPlayers[oldIndex]) {
        vimeoPlayers[oldIndex].pause();
        vimeoPlayers[oldIndex].setCurrentTime(0);
        vimeoPlayers[oldIndex].setVolume(0);
    }
    if (localPlayers[oldIndex]) {
        localPlayers[oldIndex].pause();
        localPlayers[oldIndex].currentTime = 0;
        localPlayers[oldIndex].muted = true;
    }
    const oldAudioBtn = items[oldIndex]?.querySelector('.video-audio-toggle');
    if (oldAudioBtn) oldAudioBtn.classList.remove('is-unmuted');
    loadAndPlayVideo(items[currentIndex], currentIndex, false);
    const tl = gsap.timeline({ onComplete: () => isAnimating = false });
    items.forEach((item, idx) => {
        item.classList.toggle('is-active', idx === currentIndex);
        let targetPosKey;
        if (items.length === 1) targetPosKey = "center";
        else if (idx === currentIndex) targetPosKey = "center";
        else if (idx === (currentIndex - 1 + items.length) % items.length) targetPosKey = "leftPreview";
        else if (idx === (currentIndex + 1) % items.length) targetPosKey = "rightPreview";
        else targetPosKey = swipeDirection === "left" ? "hiddenSlideOutLeft" : "hiddenSlideOutRight";
        if (positions[targetPosKey]) {
            tl.to(item, { ...positions[targetPosKey], duration: 0.6, ease: "elastic.out(0.8,0.6)", width: `${slideWidth || 300}px` }, 0);
        }
    });
    if (videoTitleClientElement && items[currentIndex]?.dataset) {
        gsap.to(videoTitleClientElement, {
            opacity: 0, duration: 0.35, onComplete: () => {
                videoTitleClientElement.textContent = items[currentIndex].dataset.title || 'Título Indisponível';
                gsap.to(videoTitleClientElement, { opacity: 1, duration: 0.35 });
            }
        });
    }
};

const attachEventListeners = () => {
    if (items.length > 1) {
        Observer.create({
            target: carouselWrapper,
            type: "drag,touch,pointer",
            dragMinimum: 1,
            onPress: () => carouselWrapper.classList.add('grabbing'),
            onRelease: () => carouselWrapper.classList.remove('grabbing'),
            onDragEnd: self => {
                if (isAnimating) return;
                self.deltaX < -self.vars.dragMinimum
                    ? goToSlide((currentIndex + 1) % items.length, "left")
                    : self.deltaX > self.vars.dragMinimum && goToSlide((currentIndex - 1 + items.length) % items.length, "right");
            }
        });
    } else {
        carouselWrapper.style.cursor = 'default';
    }
    prevButton?.addEventListener('click', () =>
        !isAnimating && items.length > 1 && goToSlide((currentIndex - 1 + items.length) % items.length, "right")
    );
    nextButton?.addEventListener('click', () =>
        !isAnimating && items.length > 1 && goToSlide((currentIndex + 1) % items.length, "left")
    );
};

const initializeShowcaseModule = () => {
    items = Array.from(document.querySelectorAll('.carousel-item'));
    carouselWrapper = document.querySelector('.carousel-wrapper');
    videoTitleClientElement = document.querySelector('.video-title-client');
    prevButton = document.querySelector('#carousel-prev');
    nextButton = document.querySelector('#carousel-next');
    navVideoElement = document.querySelector('.nav-video');
    sectionTitleShowcaseElement = document.querySelector('.section-title-showcase');
    section4Element = document.querySelector('.section-4');
    section3Element = document.getElementById('section-3');
    
    if (!gsap || !carouselWrapper) {
        console.error("Showcase ERROR: Dependências não encontradas.");
        return;
    }
    
    // Inicializa as posições, estados e eventos
    updateCarouselPositions();
    applyCurrentItemStates(false);
    adjustSectionHeight();
    attachEventListeners();
    window.addEventListener('resize', handleResize);
    
    // Inicializa a reprodução do slide central ao entrar na viewport
    const triggerElement = section3Element || section4Element;
    if (!triggerElement) {
        console.error("Showcase ERROR: Nenhuma seção de gatilho encontrada.");
        return;
    }
    const observerOptions = { rootMargin: section3Element ? '0px 0px 250px 0px' : '0px 0px 150px 0px' };
    const showcaseObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                items[currentIndex].classList.add('is-active');
                loadAndPlayVideo(items[currentIndex], currentIndex, true);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    showcaseObserver.observe(triggerElement);
};

export { initializeShowcaseModule as initializeShowcase };