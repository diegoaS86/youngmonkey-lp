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
let slideWidth;
let positions = {};

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
    return finalCalculatedWidth;
}

function calculateRenderedItemHeight() {
    if (typeof slideWidth === 'undefined' || slideWidth === 0) return 0;
    const aspectRatio = 1150 / 647;
    return slideWidth / aspectRatio;
}

function updateCarouselPositions() {
    if (!carouselWrapper) return;

    slideWidth = calculateActualSlideWidth();
    const renderedItemHeight = calculateRenderedItemHeight();

    document.documentElement.style.setProperty('--dynamic-slide-height', renderedItemHeight + 'px');
    document.documentElement.style.setProperty('--dynamic-slide-width', slideWidth + 'px');

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
    const dynamicTranslateYString = `${ currentTranslateY.toFixed(2) }px`;

    positions = {
        center: {
            left: centerLeftPos, top: 162, scale: 1, opacity: 1, zIndex: 1,
            translateY: dynamicTranslateYString
        },
        leftPreview: {
            left: leftPreviewPos, top: 222, scale: 1, opacity: 0.9, zIndex: 1
        },
        rightPreview: {
            left: rightPreviewPos, top: 222, scale: 1, opacity: 0.9, zIndex: 1
        },
        hiddenSlideOutLeft: {
            left: hiddenLeft, top: 222, scale: 1, opacity: 0, zIndex: 0
        },
        hiddenSlideOutRight: {
            left: hiddenRight, top: 222, scale: 1, opacity: 0, zIndex: 0
        },
        initialHidden: {
            left: centerLeftPos, top: 222, scale: 1, opacity: 0, zIndex: 0
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
        }

        if (useAnimation) {
        } else {
            gsap.set(item, { ...positions[ targetPosKey ], width: slideWidth + 'px' });
        }
    });

    if (videoTitleClientElement && items[ currentIndex ]) {
        videoTitleClientElement.textContent = items[ currentIndex ].dataset.title || 'Título Indisponível';
        if (!useAnimation) {
            gsap.set(videoTitleClientElement, { opacity: 1 });
        }
    }
}

function adjustSectionHeight() {
    if (!section4Element || !carouselWrapper || !navVideoElement || !sectionTitleShowcaseElement ||
        Object.keys(positions).length === 0 || typeof slideWidth === 'undefined' || slideWidth === 0) {
        return;
    }

    const renderedItemHeight = calculateRenderedItemHeight();
    if (renderedItemHeight === 0) return;

    const titleHeight = sectionTitleShowcaseElement.offsetHeight;
    const titleComputedStyle = window.getComputedStyle(sectionTitleShowcaseElement);
    const titleMarginTop = parseFloat(titleComputedStyle.marginTop) || 0;
    const titleMarginBottom = parseFloat(titleComputedStyle.marginBottom) || 0;
    const totalTitleSpace = titleHeight + titleMarginTop + titleMarginBottom;

    let centerTranslateY = 0;
    if (positions.center && typeof positions.center.translateY === 'string') {
        centerTranslateY = parseFloat(positions.center.translateY);
    }
    const centerItemEffectiveTop = positions.center.top + centerTranslateY;
    const centerItemBottomEdge = centerItemEffectiveTop + renderedItemHeight;
    const previewItemTop = positions.leftPreview.top;
    const previewItemBottomEdge = previewItemTop + renderedItemHeight;
    const carouselItemsLowestPoint = Math.max(centerItemBottomEdge, previewItemBottomEdge);
    const navVideoHeight = navVideoElement.offsetHeight;
    const gapBetweenItemsAndNav = 20;

    const requiredCarouselWrapperHeight = carouselItemsLowestPoint + gapBetweenItemsAndNav + navVideoHeight;
    if (carouselWrapper) {
        carouselWrapper.style.height = `${ requiredCarouselWrapperHeight }px`;
    }


    const gapAfterTitle = 30;
    const totalRequiredContentHeight = totalTitleSpace + gapAfterTitle + requiredCarouselWrapperHeight;

    const viewportHeight = window.innerHeight;
    const minOverallHeightVh = 50;
    const minOverallHeightPx = viewportHeight * (minOverallHeightVh / 100);

    const finalSectionContentHeight = Math.max(minOverallHeightPx, totalRequiredContentHeight);
    section4Element.style.height = `${ finalSectionContentHeight }px`;
}

function handleResize() {
    updateCarouselPositions();
    applyCurrentItemStates(false);
    adjustSectionHeight();
}

window.addEventListener('load', function () {
    items = Array.from(document.querySelectorAll('.carousel-item'));
    carouselWrapper = document.querySelector('.carousel-wrapper');
    videoTitleClientElement = document.querySelector('.video-title-client');
    prevButton = document.querySelector('#carousel-prev');
    nextButton = document.querySelector('#carousel-next');
    section4Element = document.querySelector('.section-4');
    navVideoElement = document.querySelector('.nav-video');
    sectionTitleShowcaseElement = document.querySelector('.section-title-showcase');

    if (typeof gsap !== 'undefined' && typeof Observer !== 'undefined') {
        gsap.registerPlugin(Observer);
    } else {
        console.error("ERROR: GSAP or Observer is NOT defined.");
        return;
    }

    if (!carouselWrapper || !section4Element || !navVideoElement || !sectionTitleShowcaseElement) {
        console.error("ERROR: Elementos essenciais não encontrados.");
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
        if (section4Element) section4Element.style.height = 'auto';
        return;
    }

    updateCarouselPositions();
    applyCurrentItemStates(false);
    adjustSectionHeight();

    function goToSlide(newCenterIndex, swipeDirection) {
        if (isAnimating || (items.length > 1 && newCenterIndex === currentIndex) || (items.length <= 1 && newCenterIndex === currentIndex)) { return; }
        isAnimating = true; const oldCenterIndex = currentIndex; currentIndex = newCenterIndex;
        const tl = gsap.timeline({ onComplete: () => { isAnimating = false; items.forEach((item, i) => { let finalZIndex = positions.initialHidden.zIndex; if (i === currentIndex) finalZIndex = positions.center.zIndex; else if (items.length > 1 && i === (currentIndex - 1 + items.length) % items.length) finalZIndex = positions.leftPreview.zIndex; else if (items.length > 1 && i === (currentIndex + 1) % items.length) finalZIndex = positions.rightPreview.zIndex; gsap.set(item, { zIndex: finalZIndex }); }); } });
        items.forEach((item, index) => {
            let targetPosKey; const itemWasOldCenter = (index === oldCenterIndex); const itemWasOldLeftPreview = items.length > 1 && (index === (oldCenterIndex - 1 + items.length) % items.length); const itemWasOldRightPreview = items.length > 1 && (index === (oldCenterIndex + 1) % items.length);
            const isNewCenter = (index === currentIndex); const isNewLeftPreview = items.length > 1 && (index === (currentIndex - 1 + items.length) % items.length); const isNewRightPreview = items.length > 1 && (index === (currentIndex + 1) % items.length); const itemIsBecomingVisibleStage = isNewCenter || isNewLeftPreview || isNewRightPreview;
            if (itemIsBecomingVisibleStage && !(itemWasOldCenter || itemWasOldLeftPreview || itemWasOldRightPreview)) {
                let startX; const actualContainerWidth = carouselWrapper.offsetWidth; const centerPosLeft = positions.center.left;
                if (swipeDirection === "left") { startX = centerPosLeft + slideWidth + (positions.rightPreview.left - (centerPosLeft + slideWidth)); if (isNewLeftPreview) startX = centerPosLeft; else if (isNewCenter) startX = positions.rightPreview.left; else if (isNewRightPreview) startX = actualContainerWidth + slideWidth * 0.2; }
                else { startX = centerPosLeft - slideWidth - ((centerPosLeft - slideWidth) - positions.leftPreview.left); if (isNewRightPreview) startX = centerPosLeft; else if (isNewCenter) startX = positions.leftPreview.left; else if (isNewLeftPreview) startX = -slideWidth * 1.2; }
                gsap.set(item, { ...positions.initialHidden, left: startX, opacity: 0, scale: 1, zIndex: 0, width: slideWidth + 'px' });
            }
            if (isNewCenter) { targetPosKey = "center"; } else if (isNewLeftPreview) { targetPosKey = "leftPreview"; } else if (isNewRightPreview) { targetPosKey = "rightPreview"; }
            else { if (swipeDirection === "left") { targetPosKey = "hiddenSlideOutLeft"; } else { targetPosKey = "hiddenSlideOutRight"; } }
            tl.to(item, { ...positions[ targetPosKey ], duration: 1, ease: "elastic.out(0.8,0.6)", width: slideWidth + 'px' }, 0);
        });
        if (videoTitleClientElement) { const activeItem = items[ currentIndex ]; gsap.to(videoTitleClientElement, { opacity: 0, duration: 0.35, onComplete: () => { videoTitleClientElement.textContent = activeItem.dataset.title || 'Título Indisponível'; gsap.to(videoTitleClientElement, { opacity: 1, duration: 0.35 }); } }); }
    }

    Observer.create({
        target: carouselWrapper, type: "drag,touch,pointer", dragMinimum: 0,
        onPress: function () { if (carouselWrapper) carouselWrapper.classList.add('grabbing'); },
        onRelease: function () { if (carouselWrapper) carouselWrapper.classList.remove('grabbing'); },
        onDragEnd: function (self) {
            if (isAnimating) return; const dragThreshold = self.vars.dragMinimum;
            if (self.deltaX <= -dragThreshold) { goToSlide((currentIndex + 1) % items.length, "left"); }
            else if (self.deltaX >= dragThreshold) { goToSlide((currentIndex - 1 + items.length) % items.length, "right"); }
        }
    });

    if (prevButton) { prevButton.addEventListener('click', () => { if (!isAnimating) goToSlide((currentIndex - 1 + items.length) % items.length, "right"); }); }
    if (nextButton) { nextButton.addEventListener('click', () => { if (!isAnimating) goToSlide((currentIndex + 1) % items.length, "left"); }); }

    window.addEventListener('resize', handleResize);
});