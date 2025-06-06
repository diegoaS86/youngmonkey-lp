// assets/js/showcase.js
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
// Não há importação do i18n.js neste arquivo, conforme o código fornecido anteriormente.

let items = [];
let carouselWrapper;
let videoTitleClientElement;
let prevButton;
let nextButton;
let section4Element; // Trigger principal para a seção do showcase
let section3Element; // Trigger para iniciar o carregamento antecipado da seção 4
let navVideoElement;
let sectionTitleShowcaseElement;

let currentIndex = 0;
let isAnimating = false;
let slideWidth; // Será calculado dinamicamente
let positions = {}; // Armazenará as posições calculadas
let showcaseInitialized = false; // Flag para controlar a inicialização

// Função para calcular a largura real do slide com base no viewport
function calculateActualSlideWidth() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const baseMinVwFactor = 0.60;
    const basePreferredPx = 1150;
    const baseMaxVwFactor = 0.70;
    const baseMaxHeightFactor = 0.70;
    const smallScreenBreakpoint = 768;
    const intermediateBreakpoint = 1024;
    const smallScreenVwFactor = 0.95;
    const intermediateVwFactor = 0.80;
    const smallScreenMaxHeightFactor = 0.75;
    let currentMinVw, currentPreferredPx, currentMaxVw, currentMaxHeightFactorUsed;

    if (viewportWidth <= 0 || viewportHeight <= 0) {
        return 300;
    }

    if (viewportWidth < smallScreenBreakpoint) {
        currentMinVw = baseMinVwFactor * viewportWidth;
        currentPreferredPx = basePreferredPx;
        currentMaxVw = smallScreenVwFactor * viewportWidth;
        currentMaxHeightFactorUsed = smallScreenMaxHeightFactor;
    } else if (viewportWidth <= intermediateBreakpoint) {
        currentMinVw = baseMinVwFactor * viewportWidth;
        currentPreferredPx = basePreferredPx;
        currentMaxVw = intermediateVwFactor * viewportWidth;
        currentMaxHeightFactorUsed = baseMaxHeightFactor;
    } else {
        currentMinVw = baseMinVwFactor * viewportWidth;
        currentPreferredPx = basePreferredPx;
        currentMaxVw = baseMaxVwFactor * viewportWidth;
        currentMaxHeightFactorUsed = baseMaxHeightFactor;
    }

    let widthFromWidthClamp = Math.max(currentMinVw, Math.min(currentPreferredPx, currentMaxVw));
    const aspectRatio = 1150 / 647;
    let correspondingHeight = widthFromWidthClamp / aspectRatio;
    const maxHeightPixels = currentMaxHeightFactorUsed * viewportHeight;

    let finalCalculatedWidth;
    if (correspondingHeight > maxHeightPixels) {
        finalCalculatedWidth = maxHeightPixels * aspectRatio;
    } else {
        finalCalculatedWidth = widthFromWidthClamp;
    }

    if (finalCalculatedWidth <= 0 || isNaN(finalCalculatedWidth)) {
        finalCalculatedWidth = Math.max(100, viewportWidth * 0.6);
    }
    return finalCalculatedWidth;
}

// Calcula a altura renderizada do item com base na largura do slide
function calculateRenderedItemHeight() {
    if (typeof slideWidth === 'undefined' || slideWidth === 0 || isNaN(slideWidth)) return 0;
    const aspectRatio = 1150 / 647;
    return slideWidth / aspectRatio;
}

// Atualiza as posições dos slides do carrossel (centro, prévias, ocultos)
function updateCarouselPositions() {
    if (!carouselWrapper) return;
    slideWidth = calculateActualSlideWidth();
    const renderedItemHeight = calculateRenderedItemHeight();
    if (document.documentElement) {
        document.documentElement.style.setProperty('--dynamic-slide-height', renderedItemHeight + 'px');
        document.documentElement.style.setProperty('--dynamic-slide-width', slideWidth + 'px');
    }

    const actualContainerWidth = carouselWrapper.offsetWidth;
    const viewportWidth = window.innerWidth;
    const smallScreenBreakpoint = 768;
    const intermediateBreakpoint = 1024;
    let calculatedGap;

    if (viewportWidth > intermediateBreakpoint) {
        calculatedGap = viewportWidth * 0.03;
    } else if (viewportWidth > smallScreenBreakpoint) {
        calculatedGap = viewportWidth * 0.04;
    } else {
        calculatedGap = viewportWidth * 0.01;
    }
    const minGap = 10;
    const maxGap = 50;
    const gapBetweenSlides = Math.max(minGap, Math.min(calculatedGap, maxGap));
    const dynamicPreviewOffset = slideWidth + gapBetweenSlides;
    const hiddenExtraOffsetFactor = 0.5;
    const centerLeftPos = (actualContainerWidth / 2) - (slideWidth / 2);
    let leftPreviewPos, rightPreviewPos;

    if (viewportWidth < smallScreenBreakpoint) {
        leftPreviewPos = -slideWidth - gapBetweenSlides;
        rightPreviewPos = actualContainerWidth + gapBetweenSlides;
    } else {
        leftPreviewPos = centerLeftPos - dynamicPreviewOffset;
        rightPreviewPos = centerLeftPos + dynamicPreviewOffset;
    }
    const hiddenLeft = leftPreviewPos - (slideWidth * hiddenExtraOffsetFactor);
    const hiddenRight = rightPreviewPos + (slideWidth * hiddenExtraOffsetFactor);

    const minTranslateYWidth = 360;
    const maxTranslateYWidth = 1200;
    const minTranslateY = 20;
    const maxTranslateY = -20;
    let currentTranslateY;
    if (viewportWidth <= minTranslateYWidth) {
        currentTranslateY = minTranslateY;
    } else if (viewportWidth >= maxTranslateYWidth) {
        currentTranslateY = maxTranslateY;
    } else {
        const widthRatio = (viewportWidth - minTranslateYWidth) / (maxTranslateYWidth - minTranslateYWidth);
        currentTranslateY = minTranslateY + (maxTranslateY - minTranslateY) * widthRatio;
    }
    const dynamicTranslateYString = `${currentTranslateY.toFixed(2)}px`;

    positions = {
        center: { left: centerLeftPos, top: 162, scale: 1, opacity: 1, zIndex: 1, translateY: dynamicTranslateYString },
        leftPreview: { left: leftPreviewPos, top: 222, scale: 1, opacity: 0.9, zIndex: 1 },
        rightPreview: { left: rightPreviewPos, top: 222, scale: 1, opacity: 0.9, zIndex: 1 },
        hiddenSlideOutLeft: { left: hiddenLeft, top: 222, scale: 1, opacity: 0, zIndex: 0 },
        hiddenSlideOutRight: { left: hiddenRight, top: 222, scale: 1, opacity: 0, zIndex: 0 },
        initialHidden: { left: centerLeftPos, top: 222, scale: 1, opacity: 0, zIndex: 0 }
    };
}

// Aplica os estados (posições, opacidade, etc.) aos itens do carrossel
function applyCurrentItemStates(useAnimation = false) {
    if (items.length === 0 || Object.keys(positions).length === 0) return;
    items.forEach((item, index) => {
        let targetPosKey = "initialHidden";
        if (items.length === 1) {
            targetPosKey = "center";
        } else {
            if (index === currentIndex) targetPosKey = "center";
            else if (index === (currentIndex - 1 + items.length) % items.length) targetPosKey = "leftPreview";
            else if (index === (currentIndex + 1) % items.length) targetPosKey = "rightPreview";
        }

        if (positions[targetPosKey]) {
            const finalWidth = (typeof slideWidth === 'number' && slideWidth > 0) ? slideWidth + 'px' : '80%';
            const finalPosition = { ...positions[targetPosKey], width: finalWidth };

            if (useAnimation) {
                // A lógica de animação está na função goToSlide
            } else {
                gsap.set(item, finalPosition);
            }
        } else {
            gsap.set(item, { opacity: 0, scale: 0.8, width: '80%' });
        }
    });
    if (videoTitleClientElement && items.length > 0 && items[currentIndex] && items[currentIndex].dataset) {
        videoTitleClientElement.textContent = items[currentIndex].dataset.title || 'Título Indisponível';
        if (!useAnimation) {
            gsap.set(videoTitleClientElement, { opacity: 1 });
        }
    }
}

// Ajusta a altura da seção do carrossel com base no conteúdo
function adjustSectionHeight() {
    if (!section4Element || !carouselWrapper || !navVideoElement || !sectionTitleShowcaseElement ||
        Object.keys(positions).length === 0 || typeof slideWidth === 'undefined' || slideWidth <= 0 || isNaN(slideWidth)) {
        return;
    }
    const renderedItemHeight = calculateRenderedItemHeight();
    if (renderedItemHeight <= 0 || isNaN(renderedItemHeight)) {
        return;
    }

    const titleHeight = sectionTitleShowcaseElement.offsetHeight;
    const titleComputedStyle = window.getComputedStyle(sectionTitleShowcaseElement);
    const titleMarginTop = parseFloat(titleComputedStyle.marginTop) || 0;
    const titleMarginBottom = parseFloat(titleComputedStyle.marginBottom) || 0;
    const totalTitleSpace = titleHeight + titleMarginTop + titleMarginBottom;

    let centerTranslateY = 0;
    if (positions.center && typeof positions.center.translateY === 'string') {
        centerTranslateY = parseFloat(positions.center.translateY);
    }
    const centerItemEffectiveTop = (positions.center && positions.center.top !== undefined ? positions.center.top : 0) + centerTranslateY;
    const centerItemBottomEdge = centerItemEffectiveTop + renderedItemHeight;

    const previewItemTop = (positions.leftPreview && positions.leftPreview.top !== undefined) ? positions.leftPreview.top : 0;
    const previewItemScale = (positions.leftPreview && positions.leftPreview.scale !== undefined) ? positions.leftPreview.scale : 1;
    const previewItemBottomEdge = previewItemTop + renderedItemHeight * previewItemScale;

    const carouselItemsLowestPoint = Math.max(centerItemBottomEdge, previewItemBottomEdge);
    const navVideoHeight = navVideoElement.offsetHeight;
    const viewportHeight = window.innerHeight;
    const gapBetweenItemsAndNav = Math.max(20, viewportHeight * 0.02);

    const requiredCarouselWrapperHeight = carouselItemsLowestPoint + gapBetweenItemsAndNav + navVideoHeight;
    if (carouselWrapper) {
        carouselWrapper.style.height = `${requiredCarouselWrapperHeight}px`;
    }

    const gapAfterTitle = Math.max(30, viewportHeight * 0.03);
    const totalRequiredContentHeight = totalTitleSpace + gapAfterTitle + requiredCarouselWrapperHeight;
    const minOverallHeightVh = 50;
    const minOverallHeightPx = viewportHeight * (minOverallHeightVh / 100);

    const finalSectionContentHeight = Math.max(minOverallHeightPx, totalRequiredContentHeight);
    if (section4Element) section4Element.style.height = `${finalSectionContentHeight}px`;
}

// Lida com o redimensionamento da janela
function handleResize() {
    if (!showcaseInitialized) return;
    updateCarouselPositions();
    applyCurrentItemStates(false);
    adjustSectionHeight();
    if (typeof ScrollTrigger !== 'undefined' && typeof ScrollTrigger.refresh === 'function') {
        ScrollTrigger.refresh();
    }
}

// --- OTIMIZAÇÃO: Lógica de Reprodução do Vídeo ---
// Função para garantir que um vídeo seja carregado e reproduzido
function playVideo(item) {
    const video = item.querySelector('video.carousel-video');
    if (video) {
        // O `preload="none"` no HTML impede o carregamento inicial.
        // `.load()` inicia o carregamento se ainda não tiver começado.
        video.load();
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Erro comum: o utilizador não interagiu com a página. O navegador bloqueia o autoplay.
                // O vídeo ficará pausado, o que é um comportamento aceitável.
                console.warn("Falha ao reproduzir o vídeo automaticamente:", error);
            });
        }
    }
}


// Configura os botões de áudio para os vídeos
function setupAudioToggles() {
    const audioButtons = document.querySelectorAll('.video-audio-toggle');
    audioButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            const parentItem = this.closest('.carousel-item');
            if (!parentItem) return;
            const video = parentItem.querySelector('video.carousel-video');
            if (!video) return;

            const isCurrentlyMuted = video.muted;

            items.forEach(itemEl => {
                if (itemEl !== parentItem) {
                    const otherVideo = itemEl.querySelector('video.carousel-video');
                    const otherButton = itemEl.querySelector('.video-audio-toggle');
                    if (otherVideo) otherVideo.muted = true;
                    if (otherButton) otherButton.classList.remove('is-unmuted');
                }
            });

            video.muted = !isCurrentlyMuted;
            this.classList.toggle('is-unmuted', !video.muted);
        });
    });
}

function initializeShowcase() {
    if (showcaseInitialized) return;
    showcaseInitialized = true;

    // Pega as referências dos elementos primeiro
    items = Array.from(document.querySelectorAll('.carousel-item'));
    carouselWrapper = document.querySelector('.carousel-wrapper');
    videoTitleClientElement = document.querySelector('.video-title-client');
    prevButton = document.querySelector('#carousel-prev');
    nextButton = document.querySelector('#carousel-next');
    navVideoElement = document.querySelector('.nav-video');
    sectionTitleShowcaseElement = document.querySelector('.section-title-showcase');

    if (typeof gsap === 'undefined' || typeof Observer === 'undefined') {
        console.error("Showcase ERROR: GSAP or Observer is NOT defined.");
        return;
    }

    if (!carouselWrapper || !navVideoElement || !sectionTitleShowcaseElement) {
        console.error("Showcase ERROR: Elementos essenciais internos do carrossel não encontrados na inicialização.");
        return;
    }

    gsap.delayedCall(0.01, () => {
        if (items.length === 0) {
            if (videoTitleClientElement) videoTitleClientElement.textContent = "Nenhum vídeo para exibir.";
            if (prevButton) prevButton.style.display = 'none';
            if (nextButton) nextButton.style.display = 'none';
            if (carouselWrapper) carouselWrapper.style.cursor = 'default';
            if (section4Element) section4Element.style.height = 'auto';
            return;
        }

        updateCarouselPositions();
        applyCurrentItemStates(false);
        adjustSectionHeight();
        setupAudioToggles();

        function goToSlide(newCenterIndex, swipeDirection) {
            if (isAnimating || (items.length > 1 && newCenterIndex === currentIndex) || (items.length <= 1 && newCenterIndex === currentIndex && items.length > 0)) {
                return;
            }
            isAnimating = true;
            const oldCenterIndex = currentIndex;
            currentIndex = newCenterIndex;

            const tl = gsap.timeline({
                onComplete: () => {
                    isAnimating = false;
                    items.forEach((item, i) => {
                        let finalZIndex = (positions.initialHidden && positions.initialHidden.zIndex !== undefined) ? positions.initialHidden.zIndex : 0;
                        if (i === currentIndex && positions.center && positions.center.zIndex !== undefined) finalZIndex = positions.center.zIndex;
                        else if (items.length > 1 && i === (currentIndex - 1 + items.length) % items.length && positions.leftPreview && positions.leftPreview.zIndex !== undefined) finalZIndex = positions.leftPreview.zIndex;
                        else if (items.length > 1 && i === (currentIndex + 1) % items.length && positions.rightPreview && positions.rightPreview.zIndex !== undefined) finalZIndex = positions.rightPreview.zIndex;
                        gsap.set(item, { zIndex: finalZIndex });
                    });
                }
            });

            items.forEach((item, index) => {
                const audioButton = item.querySelector('.video-audio-toggle');
                item.classList.toggle('is-active', index === currentIndex);

                if (index === currentIndex) {
                    // Simplesmente chama a função para tocar o vídeo
                    playVideo(item);
                } else {
                    const video = item.querySelector('video.carousel-video');
                    if (video) { // Pausa qualquer vídeo que não seja o ativo
                        video.pause();
                        if (video.currentTime > 0) video.currentTime = 0;
                        video.muted = true;
                        if (audioButton) audioButton.classList.remove('is-unmuted');
                    }
                }

                let targetPosKey;
                const itemWasOldCenter = (index === oldCenterIndex);
                const itemWasOldLeftPreview = items.length > 1 && (index === (oldCenterIndex - 1 + items.length) % items.length);
                const itemWasOldRightPreview = items.length > 1 && (index === (oldCenterIndex + 1) % items.length);
                const isNewCenter = (index === currentIndex);
                const isNewLeftPreview = items.length > 1 && (index === (currentIndex - 1 + items.length) % items.length);
                const isNewRightPreview = items.length > 1 && (index === (currentIndex + 1) % items.length);
                const itemIsBecomingVisibleStage = isNewCenter || isNewLeftPreview || isNewRightPreview;

                if (itemIsBecomingVisibleStage && !(itemWasOldCenter || itemWasOldLeftPreview || itemWasOldRightPreview)) {
                    let startX;
                    const actualContainerWidth = carouselWrapper.offsetWidth;
                    const centerPosLeft = (positions.center && positions.center.left !== undefined) ? positions.center.left : 0;
                    const itemSlideWidth = (typeof slideWidth === 'number' && slideWidth > 0) ? slideWidth : 300;

                    if (swipeDirection === "left") {
                        startX = (positions.rightPreview && positions.rightPreview.left !== undefined) ? positions.rightPreview.left : (centerPosLeft + itemSlideWidth + 20);
                        startX += itemSlideWidth * 0.2;

                        if (isNewLeftPreview) startX = centerPosLeft;
                        else if (isNewCenter) startX = (positions.rightPreview && positions.rightPreview.left !== undefined) ? positions.rightPreview.left : (centerPosLeft + itemSlideWidth + 20);
                        else if (isNewRightPreview) startX = actualContainerWidth + itemSlideWidth * 0.2;

                    } else {
                        startX = (positions.leftPreview && positions.leftPreview.left !== undefined) ? positions.leftPreview.left : (centerPosLeft - itemSlideWidth - 20);
                        startX -= itemSlideWidth * 0.2;

                        if (isNewRightPreview) startX = centerPosLeft;
                        else if (isNewCenter) startX = (positions.leftPreview && positions.leftPreview.left !== undefined) ? positions.leftPreview.left : (centerPosLeft - itemSlideWidth - 20);
                        else if (isNewLeftPreview) startX = -itemSlideWidth * 1.2;
                    }
                    const initialScale = (positions.initialHidden && positions.initialHidden.scale !== undefined) ? positions.initialHidden.scale : 0.8;
                    const initialPos = {
                        ...(positions.initialHidden || {}),
                        left: startX,
                        opacity: 0,
                        scale: initialScale,
                        zIndex: 0,
                        width: itemSlideWidth + 'px'
                    };
                    gsap.set(item, initialPos);
                }

                if (isNewCenter) targetPosKey = "center";
                else if (isNewLeftPreview) targetPosKey = "leftPreview";
                else if (isNewRightPreview) targetPosKey = "rightPreview";
                else {
                    if (swipeDirection === "left") targetPosKey = "hiddenSlideOutLeft";
                    else targetPosKey = "hiddenSlideOutRight";
                }

                if (positions[targetPosKey]) {
                    const itemSlideWidth = (typeof slideWidth === 'number' && slideWidth > 0) ? slideWidth : 300;
                    tl.to(item, { ...positions[targetPosKey], duration: 0.6, ease: "elastic.out(0.8,0.6)", width: itemSlideWidth + 'px' }, 0);
                }
            });

            if (videoTitleClientElement && items.length > 0 && items[currentIndex] && items[currentIndex].dataset) {
                const activeItem = items[currentIndex];
                gsap.to(videoTitleClientElement, {
                    opacity: 0,
                    duration: 0.35,
                    onComplete: () => {
                        if (activeItem && activeItem.dataset) {
                            videoTitleClientElement.textContent = activeItem.dataset.title || 'Título Indisponível';
                        }
                        gsap.to(videoTitleClientElement, { opacity: 1, duration: 0.35 });
                    }
                });
            }
        }

        if (items.length > 1) {
            Observer.create({
                target: carouselWrapper,
                type: "drag,touch,pointer",
                dragMinimum: 0,
                onPress: function () { if (carouselWrapper) carouselWrapper.classList.add('grabbing'); },
                onRelease: function () { if (carouselWrapper) carouselWrapper.classList.remove('grabbing'); },
                onDragEnd: function (self) {
                    if (isAnimating) return;
                    const dragThreshold = self.vars.dragMinimum;
                    if (self.deltaX <= -dragThreshold) goToSlide((currentIndex + 1) % items.length, "left");
                    else if (self.deltaX >= dragThreshold) goToSlide((currentIndex - 1 + items.length) % items.length, "right");
                }
            });
        } else if (carouselWrapper) {
            carouselWrapper.style.cursor = 'default';
        }

        if (prevButton) prevButton.addEventListener('click', () => { if (!isAnimating && items.length > 1) goToSlide((currentIndex - 1 + items.length) % items.length, "right"); });
        if (nextButton) nextButton.addEventListener('click', () => { if (!isAnimating && items.length > 1) goToSlide((currentIndex + 1) % items.length, "left"); });

        if (items.length > 0 && items[currentIndex]) {
            const initialSlide = items[currentIndex];
            if (initialSlide) initialSlide.classList.add('is-active');

            if (section4Element && typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.create({
                    trigger: section4Element,
                    start: "top 65%",
                    once: true,
                    onEnter: () => playVideo(initialSlide) // Toca o vídeo inicial quando a seção entra na tela
                });
            } else {
                playVideo(initialSlide); // Fallback caso o ScrollTrigger não esteja disponível
            }
        }
        if (!window.showcaseResizeListenerAttached) {
            window.addEventListener('resize', handleResize);
            window.showcaseResizeListenerAttached = true;
        }

        if (typeof ScrollTrigger !== 'undefined' && typeof ScrollTrigger.refresh === 'function') {
            ScrollTrigger.refresh();
        }
    });
}

// Evento principal executado quando a página é carregada
window.addEventListener('load', function () {
    section4Element = document.querySelector('.section-4');
    section3Element = document.getElementById('section-3');

    let targetToObserve;
    let observerOptions;

    if (section3Element) {
        targetToObserve = section3Element;
        observerOptions = {
            rootMargin: '0px 0px 250px 0px'
        };
    } else if (section4Element) {
        targetToObserve = section4Element;
        observerOptions = {
            rootMargin: '0px 0px 150px 0px'
        };
    } else {
        console.error("Showcase ERROR: Nem section-3 nem section-4 foram encontradas. O carrossel não será inicializado.");
        return;
    }

    const showcaseObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initializeShowcase();
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    showcaseObserver.observe(targetToObserve);
});
