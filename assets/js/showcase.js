// assets/js/showcase.js
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";

let items = [];
let carouselWrapper;
let videoTitleClientElement;
let prevButton;
let nextButton;
let section4Element;
let navVideoElement;
let sectionTitleShowcaseElement;

let currentIndex = 0;
let isAnimating = false;
let slideWidth; // Será calculado dinamicamente
let positions = {}; // Armazenará as posições calculadas

// Função para calcular a largura real do slide com base nas regras fornecidas
function calculateActualSlideWidth() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Fatores e valores base
    const baseMinVwFactor = 0.60; // Mínimo 60vw
    const basePreferredPx = 1150; // Largura preferida em pixels
    const baseMaxVwFactor = 0.70; // Máximo 70vw
    const baseMaxHeightFactor = 0.70; // Máximo 70vh para a altura correspondente

    // Breakpoints e fatores para telas menores
    const smallScreenBreakpoint = 768;
    const intermediateBreakpoint = 1024;
    const smallScreenVwFactor = 0.95; // Mais largo em telas pequenas
    const intermediateVwFactor = 0.80; // Intermediário
    const smallScreenMaxHeightFactor = 0.75; // Um pouco mais de altura em telas pequenas

    let currentMinVw, currentPreferredPx, currentMaxVw, currentMaxHeightFactorUsed;

    // Adapta os fatores com base no tamanho da viewport
    if (viewportWidth < smallScreenBreakpoint) {
        currentMinVw = baseMinVwFactor * viewportWidth;
        currentPreferredPx = basePreferredPx; // Pode ser ajustado se necessário para telas pequenas
        currentMaxVw = smallScreenVwFactor * viewportWidth;
        currentMaxHeightFactorUsed = smallScreenMaxHeightFactor;
    } else if (viewportWidth <= intermediateBreakpoint) {
        currentMinVw = baseMinVwFactor * viewportWidth;
        currentPreferredPx = basePreferredPx;
        currentMaxVw = intermediateVwFactor * viewportWidth;
        currentMaxHeightFactorUsed = baseMaxHeightFactor;
    } else { // Telas maiores
        currentMinVw = baseMinVwFactor * viewportWidth;
        currentPreferredPx = basePreferredPx;
        currentMaxVw = baseMaxVwFactor * viewportWidth;
        currentMaxHeightFactorUsed = baseMaxHeightFactor;
    }

    // Clamping da largura: min <= preferred <= max
    let widthFromWidthClamp = Math.max(currentMinVw, Math.min(currentPreferredPx, currentMaxVw));

    // Verifica se a altura correspondente excede o máximo permitido
    const aspectRatio = 1150 / 647; // Proporção original do design
    let correspondingHeight = widthFromWidthClamp / aspectRatio;
    const maxHeightPixels = currentMaxHeightFactorUsed * viewportHeight;

    let finalCalculatedWidth;
    if (correspondingHeight > maxHeightPixels) {
        // Se a altura calculada for muito grande, recalcula a largura com base na altura máxima
        finalCalculatedWidth = maxHeightPixels * aspectRatio;
    } else {
        finalCalculatedWidth = widthFromWidthClamp;
    }
    return finalCalculatedWidth;
}


function calculateRenderedItemHeight() {
    if (typeof slideWidth === 'undefined' || slideWidth === 0) return 0;
    const aspectRatio = 1150 / 647; // Use a proporção correta do seu design
    return slideWidth / aspectRatio;
}


function updateCarouselPositions() {
    if (!carouselWrapper) return;

    slideWidth = calculateActualSlideWidth(); // Usa a nova função de cálculo
    const renderedItemHeight = calculateRenderedItemHeight(); // Calcula a altura renderizada

    // Atualiza as variáveis CSS para altura e largura dinâmicas
    document.documentElement.style.setProperty('--dynamic-slide-height', renderedItemHeight + 'px');
    document.documentElement.style.setProperty('--dynamic-slide-width', slideWidth + 'px');


    const actualContainerWidth = carouselWrapper.offsetWidth; // Largura real do container
    const viewportWidth = window.innerWidth;
    const smallScreenBreakpoint = 768;
    const intermediateBreakpoint = 1024;

    // Gap dinâmico entre os slides
    let calculatedGap;
    if (viewportWidth > intermediateBreakpoint) { // Desktop
        calculatedGap = viewportWidth * 0.03; // 3% da largura da viewport
    } else if (viewportWidth > smallScreenBreakpoint) { // Tablet
        calculatedGap = viewportWidth * 0.04; // 4% da largura da viewport
    } else { // Mobile
        calculatedGap = viewportWidth * 0.01; // 1% da largura da viewport
    }
    const minGap = 10; // Mínimo de 10px
    const maxGap = 50; // Máximo de 50px
    const gapBetweenSlides = Math.max(minGap, Math.min(calculatedGap, maxGap));


    const dynamicPreviewOffset = slideWidth + gapBetweenSlides; // Distância do centro para os previews
    const hiddenExtraOffsetFactor = 0.5; // Quão mais para fora os slides escondidos devem ir
    const centerLeftPos = (actualContainerWidth / 2) - (slideWidth / 2); // Posição 'left' para o item central

    let leftPreviewPos, rightPreviewPos;

    if (viewportWidth < smallScreenBreakpoint) { // Mobile
        // Em telas pequenas, os previews podem ficar mais para fora ou serem tratados de forma diferente
        leftPreviewPos = -slideWidth - gapBetweenSlides; // Exemplo: completamente fora à esquerda
        rightPreviewPos = actualContainerWidth + gapBetweenSlides; // Exemplo: completamente fora à direita
    } else { // Desktop e Tablet
        leftPreviewPos = centerLeftPos - dynamicPreviewOffset;
        rightPreviewPos = centerLeftPos + dynamicPreviewOffset;
    }


    const hiddenLeft = leftPreviewPos - (slideWidth * hiddenExtraOffsetFactor);
    const hiddenRight = rightPreviewPos + (slideWidth * hiddenExtraOffsetFactor);

    // Ajuste dinâmico de translateY para o item central
    const minTranslateYWidth = 360; // Largura mínima da viewport para aplicar translateY
    const maxTranslateYWidth = 1200; // Largura máxima da viewport para o translateY máximo
    const minTranslateY = 20; // translateY para viewports <= minTranslateYWidth
    const maxTranslateY = -20; // translateY para viewports >= maxTranslateYWidth
    let currentTranslateY;

    if (viewportWidth <= minTranslateYWidth) {
        currentTranslateY = minTranslateY;
    } else if (viewportWidth >= maxTranslateYWidth) {
        currentTranslateY = maxTranslateY;
    } else {
        // Interpolação linear
        const widthRatio = (viewportWidth - minTranslateYWidth) / (maxTranslateYWidth - minTranslateYWidth);
        currentTranslateY = minTranslateY + (maxTranslateY - minTranslateY) * widthRatio;
    }
    const dynamicTranslateYString = `${currentTranslateY.toFixed(2)}px`;


    positions = {
        center: {
            left: centerLeftPos, top: 162, scale: 1, opacity: 1, zIndex: 1, // zIndex mais alto para o item central
            translateY: dynamicTranslateYString // Adiciona o translateY dinâmico
        },
        leftPreview: {
            left: leftPreviewPos, top: 222, scale: 1, opacity: 0.9, zIndex: 1 // zIndex para previews
        },
        rightPreview: {
            left: rightPreviewPos, top: 222, scale: 1, opacity: 0.9, zIndex: 1 // zIndex para previews
        },
        hiddenSlideOutLeft: { // Para slides que saem para a esquerda
            left: hiddenLeft, top: 222, scale: 1, opacity: 0, zIndex: 0
        },
        hiddenSlideOutRight: { // Para slides que saem para a direita
            left: hiddenRight, top: 222, scale: 1, opacity: 0, zIndex: 0
        },
        initialHidden: { // Posição inicial para slides que entram
            left: centerLeftPos, top: 222, scale: 1, opacity: 0, zIndex: 0
        }
    };
}


function applyCurrentItemStates(useAnimation = false) {
    if (items.length === 0 || Object.keys(positions).length === 0) return;

    items.forEach((item, index) => {
        let targetPosKey = "initialHidden"; // Padrão para itens não visíveis
        if (items.length === 1) { // Se houver apenas um item, ele sempre estará no centro
            targetPosKey = "center";
        } else {
            if (index === currentIndex) targetPosKey = "center";
            else if (index === (currentIndex - 1 + items.length) % items.length) targetPosKey = "leftPreview";
            else if (index === (currentIndex + 1) % items.length) targetPosKey = "rightPreview";
            // Itens além dos previews imediatos permanecem em 'initialHidden' ou uma posição de saída
        }

        if (useAnimation) {
            // A lógica de animação está em goToSlide
        } else {
            // Define diretamente o estado sem animação
            gsap.set(item, { ...positions[targetPosKey], width: slideWidth + 'px' });
        }
    });

    // Atualiza o título do vídeo
    if (videoTitleClientElement && items[currentIndex]) {
        videoTitleClientElement.textContent = items[currentIndex].dataset.title || 'Título Indisponível';
        if (!useAnimation) { // Garante que o título esteja visível se não estiver animando
            gsap.set(videoTitleClientElement, { opacity: 1 });
        }
    }
}

function adjustSectionHeight() {
    if (!section4Element || !carouselWrapper || !navVideoElement || !sectionTitleShowcaseElement ||
        Object.keys(positions).length === 0 || typeof slideWidth === 'undefined' || slideWidth === 0) {
        // console.warn("adjustSectionHeight: Elementos essenciais ou posições não definidos.");
        return;
    }

    const renderedItemHeight = calculateRenderedItemHeight();
    if (renderedItemHeight === 0) {
        // console.warn("adjustSectionHeight: Altura renderizada do item é zero.");
        return;
    }

    // Espaço ocupado pelo título
    const titleHeight = sectionTitleShowcaseElement.offsetHeight;
    const titleComputedStyle = window.getComputedStyle(sectionTitleShowcaseElement);
    const titleMarginTop = parseFloat(titleComputedStyle.marginTop) || 0;
    const titleMarginBottom = parseFloat(titleComputedStyle.marginBottom) || 0;
    const totalTitleSpace = titleHeight + titleMarginTop + titleMarginBottom;

    // Determina o ponto mais baixo dos itens do carrossel
    let centerTranslateY = 0;
    if (positions.center && typeof positions.center.translateY === 'string') {
        centerTranslateY = parseFloat(positions.center.translateY);
    }
    const centerItemEffectiveTop = positions.center.top + centerTranslateY;
    const centerItemBottomEdge = centerItemEffectiveTop + renderedItemHeight;

    const previewItemTop = positions.leftPreview.top; // Assumindo que left e right previews têm o mesmo top
    const previewItemBottomEdge = previewItemTop + renderedItemHeight;

    const carouselItemsLowestPoint = Math.max(centerItemBottomEdge, previewItemBottomEdge);

    // Altura da navegação do vídeo
    const navVideoHeight = navVideoElement.offsetHeight;
    const gapBetweenItemsAndNav = 20; // Espaço entre o item mais baixo do carrossel e a navegação

    // Altura necessária para o wrapper do carrossel (incluindo a navegação)
    const requiredCarouselWrapperHeight = carouselItemsLowestPoint + gapBetweenItemsAndNav + navVideoHeight;

    if (carouselWrapper) {
        carouselWrapper.style.height = `${requiredCarouselWrapperHeight}px`;
    }

    // Altura total necessária para o conteúdo da seção (título + carrossel)
    const gapAfterTitle = 30; // Espaço entre o título e o topo do carrossel
    const totalRequiredContentHeight = totalTitleSpace + gapAfterTitle + requiredCarouselWrapperHeight;

    // Garante uma altura mínima para a seção geral
    const viewportHeight = window.innerHeight;
    const minOverallHeightVh = 50; // Mínimo de 50vh
    const minOverallHeightPx = viewportHeight * (minOverallHeightVh / 100);

    const finalSectionContentHeight = Math.max(minOverallHeightPx, totalRequiredContentHeight);
    section4Element.style.height = `${finalSectionContentHeight}px`;
}


function handleResize() {
    updateCarouselPositions();
    applyCurrentItemStates(false); // Re-aplica estados sem animação
    adjustSectionHeight(); // Reajusta a altura da seção
}


window.addEventListener('load', function () {
    items = Array.from(document.querySelectorAll('.carousel-item'));
    carouselWrapper = document.querySelector('.carousel-wrapper');
    videoTitleClientElement = document.querySelector('.video-title-client');
    prevButton = document.querySelector('#carousel-prev');
    nextButton = document.querySelector('#carousel-next');
    section4Element = document.querySelector('.section-4'); // Garanta que este seletor esteja correto
    navVideoElement = document.querySelector('.nav-video');
    sectionTitleShowcaseElement = document.querySelector('.section-title-showcase');


    if (typeof gsap === 'undefined' || typeof Observer === 'undefined') {
        console.error("ERROR: GSAP or Observer is NOT defined. Make sure they are imported in showcase.js");
        return;
    }
    // gsap.registerPlugin(Observer); // Não é mais necessário aqui se já estiver registrado em script.js

    if (!carouselWrapper || !section4Element || !navVideoElement || !sectionTitleShowcaseElement) {
        console.error("ERROR: Elementos essenciais para o carrossel não encontrados (carouselWrapper, section4, navVideo, sectionTitleShowcase).");
        return;
    }


    if (items.length === 0) {
        if (videoTitleClientElement) {
            videoTitleClientElement.textContent = "Nenhum vídeo para exibir.";
            gsap.set(videoTitleClientElement, { opacity: 1 });
        }
        if (prevButton) prevButton.style.display = 'none';
        if (nextButton) nextButton.style.display = 'none';
        if (carouselWrapper) carouselWrapper.style.cursor = 'default';
        if (section4Element) section4Element.style.height = 'auto'; // Permite que a seção encolha
        return;
    }

    updateCarouselPositions();    // Calcula as posições iniciais
    applyCurrentItemStates(false); // Aplica os estados iniciais sem animação
    adjustSectionHeight();        // Ajusta a altura da seção com base nos itens


    function goToSlide(newCenterIndex, swipeDirection) {
        if (isAnimating || (items.length > 1 && newCenterIndex === currentIndex) || (items.length <= 1 && newCenterIndex === currentIndex)) {
            return; // Evita múltiplas animações ou movimento desnecessário
        }
        isAnimating = true;
        const oldCenterIndex = currentIndex;
        currentIndex = newCenterIndex;

        const tl = gsap.timeline({
            onComplete: () => {
                isAnimating = false;
                // Reajusta z-index após a animação para garantir a ordem correta para interações futuras
                items.forEach((item, i) => {
                    let finalZIndex = positions.initialHidden.zIndex;
                    if (i === currentIndex) finalZIndex = positions.center.zIndex;
                    else if (items.length > 1 && i === (currentIndex - 1 + items.length) % items.length) finalZIndex = positions.leftPreview.zIndex;
                    else if (items.length > 1 && i === (currentIndex + 1) % items.length) finalZIndex = positions.rightPreview.zIndex;
                    gsap.set(item, { zIndex: finalZIndex });
                });
            }
        });

        items.forEach((item, index) => {
            let targetPosKey;

            // Determina se o item era visível (centro ou preview) antes da transição
            const itemWasOldCenter = (index === oldCenterIndex);
            const itemWasOldLeftPreview = items.length > 1 && (index === (oldCenterIndex - 1 + items.length) % items.length);
            const itemWasOldRightPreview = items.length > 1 && (index === (oldCenterIndex + 1) % items.length);

            // Determina se o item será visível (centro ou preview) após a transição
            const isNewCenter = (index === currentIndex);
            const isNewLeftPreview = items.length > 1 && (index === (currentIndex - 1 + items.length) % items.length);
            const isNewRightPreview = items.length > 1 && (index === (currentIndex + 1) % items.length);

            // Se o item está entrando na "área visível" (centro ou preview) e não estava lá antes
            const itemIsBecomingVisibleStage = isNewCenter || isNewLeftPreview || isNewRightPreview;
            if (itemIsBecomingVisibleStage && !(itemWasOldCenter || itemWasOldLeftPreview || itemWasOldRightPreview)) {
                let startX;
                const actualContainerWidth = carouselWrapper.offsetWidth;
                const centerPosLeft = positions.center.left;

                if (swipeDirection === "left") { // Swiping para a esquerda (item vem da direita)
                    startX = centerPosLeft + slideWidth + (positions.rightPreview.left - (centerPosLeft + slideWidth)); // Posição inicial à direita do preview direito
                    if(isNewLeftPreview) startX = centerPosLeft; // Caso especial: item pulando para o preview esquerdo
                    else if(isNewCenter) startX = positions.rightPreview.left;
                    else if(isNewRightPreview) startX = actualContainerWidth + slideWidth * 0.2; // Bem para fora à direita
                } else { // Swiping para a direita (item vem da esquerda)
                    startX = centerPosLeft - slideWidth - ((centerPosLeft - slideWidth) - positions.leftPreview.left); // Posição inicial à esquerda do preview esquerdo
                    if(isNewRightPreview) startX = centerPosLeft; // Caso especial: item pulando para o preview direito
                    else if(isNewCenter) startX = positions.leftPreview.left;
                    else if(isNewLeftPreview) startX = -slideWidth * 1.2; // Bem para fora à esquerda
                }
                gsap.set(item, { ...positions.initialHidden, left: startX, opacity: 0, scale: 1, zIndex: 0, width: slideWidth + 'px' });
            }


            // Define a posição alvo
            if (isNewCenter) {
                targetPosKey = "center";
            } else if (isNewLeftPreview) {
                targetPosKey = "leftPreview";
            } else if (isNewRightPreview) {
                targetPosKey = "rightPreview";
            } else { // O item está saindo de cena
                if (swipeDirection === "left") { // Item movido para a esquerda, então ele sai para a esquerda
                    targetPosKey = "hiddenSlideOutLeft";
                } else { // Item movido para a direita, então ele sai para a direita
                    targetPosKey = "hiddenSlideOutRight";
                }
            }
            tl.to(item, { ...positions[targetPosKey], duration: 1, ease: "elastic.out(0.8,0.6)", width: slideWidth + 'px'}, 0);
        });

        // Animação do título do vídeo
        if (videoTitleClientElement) {
            const activeItem = items[currentIndex];
            gsap.to(videoTitleClientElement, {
                opacity: 0,
                duration: 0.35, // Metade da duração da animação do slide
                onComplete: () => {
                    videoTitleClientElement.textContent = activeItem.dataset.title || 'Título Indisponível';
                    gsap.to(videoTitleClientElement, { opacity: 1, duration: 0.35 });
                }
            });
        }
    }

    Observer.create({
        target: carouselWrapper,      // Elemento a ser observado
        type: "drag,touch,pointer", // Tipos de interação (drag para mouse, touch/pointer para toque)
        dragMinimum: 0,             // Distância mínima para iniciar o drag (0 para sensibilidade máxima)
        onPress: function() {
            if (carouselWrapper) carouselWrapper.classList.add('grabbing');
        },
        onRelease: function() {
            if (carouselWrapper) carouselWrapper.classList.remove('grabbing');
        },
        onDragEnd: function(self) {
            if (isAnimating) return; // Ignora se uma animação já estiver em progresso
            const dragThreshold = self.vars.dragMinimum; // Usa o dragMinimum definido

            if (self.deltaX <= -dragThreshold) { // Arrastou para a esquerda o suficiente
                goToSlide((currentIndex + 1) % items.length, "left");
            } else if (self.deltaX >= dragThreshold) { // Arrastou para a direita o suficiente
                goToSlide((currentIndex - 1 + items.length) % items.length, "right");
            }
        }
    });


    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (!isAnimating) goToSlide((currentIndex - 1 + items.length) % items.length, "right");
        });
    }
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (!isAnimating) goToSlide((currentIndex + 1) % items.length, "left");
        });
    }

    window.addEventListener('resize', handleResize);
});
