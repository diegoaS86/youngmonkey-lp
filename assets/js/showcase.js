let items = [];
let carouselWrapper;
let videoTitleClientElement;
let prevButton;
let nextButton;

let currentIndex = 0;
let isAnimating = false;
let slideWidth;
let positions = {};

function calculateActualSlideWidth() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Valores do seu CSS: clamp(60vw, 1150px, 70vw) e max-height: 70vh
    const minVwFactor = 0.60;
    const preferredPx = 1150; // O valor central do seu clamp
    const maxVwFactor = 0.70;
    const maxHeightFactor = 0.70; // Corresponde a 70vh

    let widthFromWidthClamp = Math.max(
        minVwFactor * viewportWidth,
        Math.min(preferredPx, maxVwFactor * viewportWidth)
    );

    const aspectRatio = 1150 / 647;
    let correspondingHeight = widthFromWidthClamp / aspectRatio;
    const maxHeightPixels = maxHeightFactor * viewportHeight;

    let finalCalculatedWidth;
    if (correspondingHeight > maxHeightPixels) {
        finalCalculatedWidth = maxHeightPixels * aspectRatio;
    } else {
        finalCalculatedWidth = widthFromWidthClamp;
    }
    return finalCalculatedWidth;
}

function updateCarouselPositions() {
    if (!carouselWrapper) return;

    slideWidth = calculateActualSlideWidth();
    const actualContainerWidth = carouselWrapper.offsetWidth;
    const viewportWidth = window.innerWidth;

    let calculatedGap;

    if (viewportWidth > 1024) {
        calculatedGap = viewportWidth * 0.03;
    } else if (viewportWidth > 768) {
        calculatedGap = viewportWidth * 0.02;
    } else {
        calculatedGap = viewportWidth * 0.01;
    }

    const minGap = 10;
    const maxGap = 50;

    const gapBetweenSlides = Math.max(minGap, Math.min(calculatedGap, maxGap));

    const dynamicPreviewOffset = slideWidth + gapBetweenSlides;
    const hiddenExtraOffsetFactor = 0.5;

    positions = {
        center: {
            left: (actualContainerWidth / 2) - (slideWidth / 2),
            top: 162, scale: 1, opacity: 1, zIndex: 1, translateY: '-20px'
        },
        leftPreview: {
            left: (actualContainerWidth / 2) - (slideWidth / 2) - dynamicPreviewOffset,
            top: 222, scale: 1, opacity: 0.9, zIndex: 1
        },
        rightPreview: {
            left: (actualContainerWidth / 2) - (slideWidth / 2) + dynamicPreviewOffset,
            top: 222, scale: 1, opacity: 0.9, zIndex: 1
        },
        hiddenSlideOutLeft: {
            left: (actualContainerWidth / 2) - (slideWidth / 2) - dynamicPreviewOffset - (slideWidth * hiddenExtraOffsetFactor),
            top: 222, scale: 1, opacity: 0, zIndex: 0
        },
        hiddenSlideOutRight: {
            left: (actualContainerWidth / 2) - (slideWidth / 2) + dynamicPreviewOffset + (slideWidth * hiddenExtraOffsetFactor),
            top: 222, scale: 1, opacity: 0, zIndex: 0
        },
        initialHidden: {
            left: (actualContainerWidth / 2) - (slideWidth / 2),
            top: 222, scale: 1, opacity: 0, zIndex: 0
        }
    };
}

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
            // Outros itens (não visíveis e não entrando/saindo na animação de goToSlide)
            // podem permanecer em initialHidden ou serem movidos para posições mais distantes
            // se necessário, mas a lógica de goToSlide já os trata.
            // Para o resize, apenas as posições visíveis e adjacentes importam mais.
        }
        
        if (useAnimation) { // Normalmente não usado para init/resize, mas para goToSlide
             // A lógica de animação de goToSlide é mais complexa
        } else {
            gsap.set(item, positions[targetPosKey]);
        }
    });

    if (videoTitleClientElement && items[currentIndex]) {
        videoTitleClientElement.textContent = items[currentIndex].dataset.title || 'Título Indisponível';
        if (!useAnimation) {
             gsap.set(videoTitleClientElement, { opacity: 1 });
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    items = Array.from(document.querySelectorAll('.carousel-item'));
    carouselWrapper = document.querySelector('.carousel-wrapper');
    videoTitleClientElement = document.querySelector('.video-title-client');
    prevButton = document.querySelector('#carousel-prev');
    nextButton = document.querySelector('#carousel-next');

    if (typeof gsap !== 'undefined' && typeof Observer !== 'undefined') {
        gsap.registerPlugin(Observer);
    } else {
        console.error("ERROR: GSAP or Observer is NOT defined.");
        return;
    }

    if (!carouselWrapper) {
        console.error("ERROR: carouselWrapper not found. Cannot proceed.");
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
        return;
    }

    updateCarouselPositions();
    applyCurrentItemStates(false);

    function goToSlide(newCenterIndex, swipeDirection) {
        if (isAnimating || (items.length > 1 && newCenterIndex === currentIndex) || (items.length <=1 && newCenterIndex === currentIndex) ) {
            return;
        }

        isAnimating = true;
        const oldCenterIndex = currentIndex;
        currentIndex = newCenterIndex;

        const tl = gsap.timeline({
            onComplete: () => {
                isAnimating = false;
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
            const itemWasOldCenter = (index === oldCenterIndex);
            const itemWasOldLeftPreview = items.length > 1 && (index === (oldCenterIndex - 1 + items.length) % items.length);
            const itemWasOldRightPreview = items.length > 1 && (index === (oldCenterIndex + 1 + items.length) % items.length);

            const isNewCenter = (index === currentIndex);
            const isNewLeftPreview = items.length > 1 && (index === (currentIndex - 1 + items.length) % items.length);
            const isNewRightPreview = items.length > 1 && (index === (currentIndex + 1) % items.length);
            const itemIsBecomingVisibleStage = isNewCenter || isNewLeftPreview || isNewRightPreview;

            if (itemIsBecomingVisibleStage && !(itemWasOldCenter || itemWasOldLeftPreview || itemWasOldRightPreview)) {
                let startX;
                const actualContainerWidth = carouselWrapper.offsetWidth;
                const centerPosLeft = positions.center.left; // Posição X do slide central

                if (swipeDirection === "left") { // Item vem da direita
                    startX = centerPosLeft + slideWidth + (positions.rightPreview.left - (centerPosLeft + slideWidth)); // Posição inicial à direita do rightPreview
                    if (isNewLeftPreview) startX = centerPosLeft; // Se é o novo leftPreview vindo do centro (raro neste fluxo, mas para consistência)
                    else if (isNewCenter) startX = positions.rightPreview.left; // Novo centro vem da posição do rightPreview
                    else if (isNewRightPreview) startX = actualContainerWidth + slideWidth * 0.2; // Novo rightPreview vem de fora da tela à direita
                } else { // swipeDirection === "right", Item vem da esquerda
                    startX = centerPosLeft - slideWidth - ((centerPosLeft - slideWidth) - positions.leftPreview.left); // Posição inicial à esquerda do leftPreview
                    if (isNewRightPreview) startX = centerPosLeft;
                    else if (isNewCenter) startX = positions.leftPreview.left; // Novo centro vem da posição do leftPreview
                    else if (isNewLeftPreview) startX = -slideWidth * 1.2; // Novo leftPreview vem de fora da tela à esquerda
                }
                gsap.set(item, { ...positions.initialHidden, left: startX, opacity: 0, scale: 1, zIndex: 0 });
            }

            if (isNewCenter) {
                targetPosKey = "center";
            } else if (isNewLeftPreview) {
                targetPosKey = "leftPreview";
            } else if (isNewRightPreview) {
                targetPosKey = "rightPreview";
            } else {
                if (swipeDirection === "left") { // O item que era central ou leftPreview está saindo para a esquerda
                    targetPosKey = "hiddenSlideOutLeft";
                } else { // O item que era central ou rightPreview está saindo para a direita
                    targetPosKey = "hiddenSlideOutRight";
                }
            }
            tl.to(item, { ...positions[targetPosKey], duration: 1, ease: "elastic.out(0.8,0.6)" }, 0);
        });

        if (videoTitleClientElement) {
            const activeItem = items[currentIndex];
            gsap.to(videoTitleClientElement, {
                opacity: 0, duration: 0.35,
                onComplete: () => {
                    videoTitleClientElement.textContent = activeItem.dataset.title || 'Título Indisponível';
                    gsap.to(videoTitleClientElement, { opacity: 1, duration: 0.35 });
                }
            });
        }
    }

    Observer.create({
        target: carouselWrapper,
        type: "drag,touch,pointer",
        dragMinimum: 0,
        onPress: function () {
            if (carouselWrapper) carouselWrapper.classList.add('grabbing');
        },
        onRelease: function () {
            if (carouselWrapper) carouselWrapper.classList.remove('grabbing');
        },
        onDragEnd: function (self) {
            if (isAnimating) return;
            const dragThreshold = self.vars.dragMinimum;
            if (self.deltaX <= -dragThreshold) {
                goToSlide((currentIndex + 1) % items.length, "left");
            } else if (self.deltaX >= dragThreshold) {
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

    function handleResize() {
        updateCarouselPositions();
        applyCurrentItemStates(false); // Re-aplica posições sem animar
    }

    window.addEventListener('resize', handleResize);
});