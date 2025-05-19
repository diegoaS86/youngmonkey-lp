console.log("SCRIPT START: HTML DOM parsing may still be in progress or complete.");

document.addEventListener('DOMContentLoaded', function () {
    console.log("DEBUG: DOMContentLoaded event fired.");

    if (typeof gsap !== 'undefined' && typeof Observer !== 'undefined') {
        console.log("DEBUG: GSAP and Observer are defined. Registering Observer plugin.");
        gsap.registerPlugin(Observer);
    } else {
        console.error("ERROR: GSAP or Observer is NOT defined. Check CDN links in <head>.");
        if (typeof gsap === 'undefined') console.error("gsap is undefined");
        if (typeof Observer === 'undefined') console.error("Observer is undefined");
        return;
    }

    const items = Array.from(document.querySelectorAll('.carousel-item'));
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    const videoTitleClientElement = document.querySelector('.video-title-client');
    const prevButton = document.querySelector('#carousel-prev');
    const nextButton = document.querySelector('#carousel-next');

    console.log("DEBUG: Elements selected. Carousel Wrapper:", carouselWrapper);
    if (!carouselWrapper) {
        console.error("ERROR: carouselWrapper not found in the DOM. Observer cannot be attached. Check selector '.carousel-wrapper'.");
        return;
    }
    console.log("DEBUG: Carousel items count:", items.length);
    if (items.length > 0) {
        console.log("DEBUG: First carousel item:", items[ 0 ]);
    }

    if (items.length === 0) {
        console.warn('Nenhum item no carrossel.');
        if (videoTitleClientElement) {
            videoTitleClientElement.textContent = "Nenhum vídeo para exibir.";
            gsap.set(videoTitleClientElement, { opacity: 1 });
        }
        if (prevButton) prevButton.style.display = 'none';
        if (nextButton) nextButton.style.display = 'none';
        if (carouselWrapper) carouselWrapper.style.cursor = 'default';
        return;
    }

    let currentIndex = 0;
    let isAnimating = false;
    const slideWidth = 1280;
    const containerWidth = 1920;

    const positions = {
        // Itens visíveis (center, leftPreview, rightPreview) terão scale: 1 e zIndex: 1
        center: { left: (containerWidth / 2) - (slideWidth / 2), top: 162, scale: 1, opacity: 1, zIndex: 1, translateY: '-20px' },
        leftPreview: { left: (containerWidth / 2) - (slideWidth / 2) - 1200, top: 222, scale: 1, opacity: 0.9, zIndex: 1 },
        rightPreview: { left: (containerWidth / 2) - (slideWidth / 2) + 1200, top: 222, scale: 1, opacity: 0.9, zIndex: 1 },
        // Posições para onde os itens deslizam para FORA da tela, mantendo scale: 1
        hiddenSlideOutLeft: { left: (containerWidth / 2) - (slideWidth / 2) - 1330 - (slideWidth * 0.7), top: 222, scale: 1, opacity: 0, zIndex: 0 },
        hiddenSlideOutRight: { left: (containerWidth / 2) - (slideWidth / 2) + 1330 + (slideWidth * 0.7), top: 222, scale: 1, opacity: 0, zIndex: 0 },
        // Estado inicial para itens ocultos, com scale: 1 e zIndex: 0
        initialHidden: { left: (containerWidth / 2) - (slideWidth / 2), top: 222, scale: 1, opacity: 0, zIndex: 0 }
    };

    items.forEach((item, index) => {
        let initialStateKey = "initialHidden";
        if (items.length === 1) initialStateKey = "center";
        else {
            if (index === currentIndex) initialStateKey = "center";
            else if (index === (currentIndex - 1 + items.length) % items.length) initialStateKey = "leftPreview";
            else if (index === (currentIndex + 1) % items.length) initialStateKey = "rightPreview";
        }
        gsap.set(item, positions[ initialStateKey ]);
    });

    if (videoTitleClientElement && items[ currentIndex ]) {
        videoTitleClientElement.textContent = items[ currentIndex ].dataset.title || 'Título Indisponível';
        gsap.set(videoTitleClientElement, { opacity: 1 });
    }

    function goToSlide(newCenterIndex, swipeDirection) {
        console.log("goToSlide DEBUG: Called. New Index:", newCenterIndex, "Direction:", swipeDirection, "Current Index:", currentIndex, "Is Animating:", isAnimating);

        if (isAnimating) {
            console.log("goToSlide DEBUG: Animation in progress, returning.");
            return;
        }
        if (items.length <= 1 && newCenterIndex === currentIndex) {
            console.log("goToSlide DEBUG: Single item or same index for single item, returning.");
            return;
        }
        if (items.length > 1 && newCenterIndex === currentIndex) {
            console.log("goToSlide DEBUG: Multiple items but same index, returning.");
            return;
        }

        isAnimating = true;
        const oldCenterIndex = currentIndex;
        currentIndex = newCenterIndex;

        const tl = gsap.timeline({
            onComplete: () => {
                isAnimating = false;
                console.log("goToSlide DEBUG: Animation completed. New currentIndex:", currentIndex);
                // Garante o zIndex correto após a animação
                items.forEach((item, i) => {
                    let finalZIndex = positions.initialHidden.zIndex; // Padrão para itens ocultos
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
                if (isNewCenter) {
                    startX = swipeDirection === "left" ? containerWidth + slideWidth * 0.5 : -slideWidth * 1.5;
                    console.log(`Item ${ index } (new center) set to start from x: ${ startX } (swipe: ${ swipeDirection })`);
                } else if (isNewLeftPreview) {
                    startX = -slideWidth * 1.5;
                    console.log(`Item ${ index } (new left preview) set to start from x: ${ startX }`);
                } else { // isNewRightPreview
                    startX = containerWidth + slideWidth * 0.5;
                    console.log(`Item ${ index } (new right preview) set to start from x: ${ startX }`);
                }
                // Define o estado inicial com scale:1 e zIndex:0 antes de animar para a posição visível
                gsap.set(item, { ...positions.initialHidden, left: startX, opacity: 0, scale: 1, zIndex: 0 });
            }

            if (isNewCenter) {
                targetPosKey = "center";
            } else if (isNewLeftPreview) {
                targetPosKey = "leftPreview";
            } else if (isNewRightPreview) {
                targetPosKey = "rightPreview";
            } else {
                if (swipeDirection === "left") {
                    targetPosKey = "hiddenSlideOutLeft";
                } else {
                    targetPosKey = "hiddenSlideOutRight";
                }
                console.log(`Item ${ index } (not visible after swipe ${ swipeDirection }) moving to ${ targetPosKey }.`);
            }
            tl.to(item, { ...positions[ targetPosKey ], duration: 1, ease: "elastic.out(0.8,0.6)" }, 0);
        });

        if (videoTitleClientElement) {
            const activeItem = items[ currentIndex ];
            gsap.to(videoTitleClientElement, {
                opacity: 0, duration: 0.35,
                onComplete: () => {
                    videoTitleClientElement.textContent = activeItem.dataset.title || 'Título Indisponível';
                    gsap.to(videoTitleClientElement, { opacity: 1, duration: 0.35 });
                }
            });
        }
    }

    console.log("DEBUG: Attempting to create Observer for target:", carouselWrapper);
    Observer.create({
        target: carouselWrapper,
        type: "drag,touch,pointer",
        dragMinimum: 0,
        onPress: function (self) {
            console.log("OBSERVER DEBUG: Press detected. Target:", self.target);
            if (carouselWrapper) carouselWrapper.classList.add('grabbing');
        },
        onRelease: function (self) {
            console.log("OBSERVER DEBUG: Release detected. Target:", self.target);
            if (carouselWrapper) carouselWrapper.classList.remove('grabbing');
        },
        onDragStart: (self) => {
            console.log("OBSERVER DEBUG: DragStart. DeltaX:", self.deltaX, "Target:", self.target);
        },
        onDragEnd: (self) => {
            console.log("OBSERVER DEBUG: DragEnd. DeltaX:", self.deltaX, "Min Drag:", self.vars.dragMinimum, "Is Animating:", isAnimating);
            if (isAnimating) {
                console.log("OBSERVER DEBUG: DragEnd - Animation in progress, returning.");
                return;
            }
            const dragThreshold = Math.abs(self.vars.dragMinimum);
            if (self.deltaX <= -dragThreshold) {
                console.log(`OBSERVER DEBUG: DragEnd - Dragging left (DeltaX: ${ self.deltaX } <= -${ dragThreshold }), calling goToSlide.`);
                goToSlide((currentIndex + 1) % items.length, "left");
            } else if (self.deltaX >= dragThreshold) {
                console.log(`OBSERVER DEBUG: DragEnd - Dragging right (DeltaX: ${ self.deltaX } >= ${ dragThreshold }), calling goToSlide.`);
                goToSlide((currentIndex - 1 + items.length) % items.length, "right");
            } else {
                console.log(`OBSERVER DEBUG: DragEnd - Drag did not meet minimum distance (DeltaX: ${ self.deltaX }, MinDrag: ${ dragThreshold }).`);
            }
        },
        onTouchStart: (self) => { console.log("OBSERVER DEBUG: TouchStart detected. Target:", self.target); },
        onTouchEnd: (self) => { console.log("OBSERVER DEBUG: TouchEnd detected. Target:", self.target); }
    });
    console.log("DEBUG: GSAP Observer should be created successfully.");

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            console.log("DEBUG: Previous button clicked.");
            if (!isAnimating) goToSlide((currentIndex - 1 + items.length) % items.length, "right");
        });
    }
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            console.log("DEBUG: Next button clicked.");
            if (!isAnimating) goToSlide((currentIndex + 1) % items.length, "left");
        });
    }
});
console.log("SCRIPT END: Event listeners should be set up if DOMContentLoaded has fired and no errors occurred.");
