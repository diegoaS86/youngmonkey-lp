// assets/js/services.js

/**
 * Initializes all animations and setups for the Services section (Section 2).
 * @param {object} gsapInstance - The GSAP instance.
 * @param {object} ScrollTriggerInstance - The ScrollTrigger instance.
 */
function initializeServicesSection(gsapInstance, ScrollTriggerInstance) {
    // Element selectors specific to this section
    const servicesSection = document.getElementById('section-2');
    if (!servicesSection) {
        console.warn("Services Section (section-2) not found.");
        return;
    }

    const servicesContainerForPin = servicesSection.querySelector('.services-container');
    const serviceCards = gsapInstance.utils.toArray(servicesSection.querySelectorAll('.service-card'));
    const servicesCounterElement = document.getElementById('servicesCounter');

    // Desktop Arrow Elements
    const serviceArrow = servicesSection.querySelector('.service-arrow');
    const servicePath = document.getElementById('service-path');
    const serviceDraw = servicesSection.querySelector('.service-draw'); // Corrected selector
    const serviceArrowPoint = document.getElementById('service-arrow-point');

    // Mobile Arrow Elements
    const serviceArrowMobile = servicesSection.querySelector('.service-arrow-mobile');
    const servicePathMobile = document.getElementById('service-path-mobile');
    const serviceDrawMobile = servicesSection.querySelector('.service-draw-mobile'); // Corrected selector
    const serviceArrowPointMobile = document.getElementById('service-arrow-point-mobile');


    // Utility function (can be kept here if only used by services)
    const formatCounterNumber = (num) => {
        return num.toString().padStart(2, '0');
    };

    // --- Services Section Animations ---
    const setupStackingCardsAnimation = () => {
        if (!servicesContainerForPin || !serviceCards.length) {
            console.warn("Services StackingCards: Essential elements not found.");
            return;
        }

        serviceCards.forEach((card, index) => {
            if (index === 0) {
                gsapInstance.set(card, {
                    xPercent: -50, yPercent: -50, opacity: 1, scale: 1, padding: "0px", zIndex: serviceCards.length
                });
            } else {
                gsapInstance.set(card, {
                    x: "110%", yPercent: -50, opacity: 1, scale: 1.1, padding: "200px", zIndex: serviceCards.length - index
                });
            }
        });

        const cardStackTimeline = gsapInstance.timeline({
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
                    x: "0%", xPercent: -50, scale: 1, padding: "0px", opacity: 1, duration: 0.8, ease: "expo.inOut",
                    onStart: () => { gsapInstance.set(card, { zIndex: serviceCards.length + 10 + index }); },
                }, `-=${0.35}`);
            }
        });
    };

    const setupServicesCounter = () => { // Desktop version
        if (!servicesCounterElement || !serviceCards.length || !servicePath || !serviceArrowPoint || !serviceDraw || !serviceArrow ) {
            console.warn("ServicesCounter (Desktop): Elements not found.");
            return;
        }
        const total = serviceCards.length;
        servicesCounterElement.textContent = `01 / ${formatCounterNumber(total)}`;
        gsapInstance.set(serviceArrowPoint, { opacity: 0, scale: 0.8, rotation: 0, transformOrigin: "center center" });

        const servicesTl = gsapInstance.timeline({
            scrollTrigger: {
                trigger: servicesSection,
                start: "top top",
                end: () => "+=" + (window.innerHeight * (total - 1) * 0.5), // Use total here
                scrub: true,
                onUpdate: self => {
                    const progress = self.progress;
                    const currentIndex = Math.min(Math.floor(progress * total), total - 1);
                    servicesCounterElement.textContent = `${formatCounterNumber(currentIndex + 1)} / ${formatCounterNumber(total)}`;
                }
            }
        });
        servicesTl.to(serviceArrowPoint, { opacity: 1, duration: 0.01 }, 0)
            .fromTo(serviceDraw, { drawSVG: "0%" }, { drawSVG: "100%", ease: "none" }, 0)
            .to(serviceArrowPoint, {
                motionPath: {
                    path: servicePath, align: servicePath, alignOrigin: [0.5, 0.5], autoRotate: -90, start: 0, end: 1
                },
                ease: "none",
            }, 0);
    };

    const setupServicesCounterMobile = () => {
        if (!servicePathMobile || !serviceArrowPointMobile || !serviceDrawMobile || !serviceArrowMobile) {
            console.warn("ServicesCounter (Mobile): Arrow elements not found.");
            // return; // Don't return if counter element might still be used
        }
         const total = serviceCards.length; // Define total here for mobile as well

        if (servicesCounterElement && serviceCards.length > 0) {
            servicesCounterElement.textContent = `01 / ${formatCounterNumber(total)}`;
        } else {
            console.warn("ServicesCounter (Mobile): Counter or cards not found for text update.");
        }

        if (!servicePathMobile || !serviceArrowPointMobile || !serviceDrawMobile || !serviceArrowMobile) return; // Now return if essential arrow parts are missing

        gsapInstance.set(serviceArrowPointMobile, { opacity: 0, scale: 0.8, rotation: 0, transformOrigin: "center center" });

        const servicesTlMobile = gsapInstance.timeline({
            scrollTrigger: {
                trigger: servicesSection,
                start: "top top",
                end: () => "+=" + (window.innerHeight * (total - 1) * 0.5), // Use total here
                scrub: true,
                invalidateOnRefresh: true,
                onUpdate: self => {
                    if (servicesCounterElement && serviceCards.length > 0) {
                        const progress = self.progress;
                        const currentIndex = Math.min(Math.floor(progress * total), total - 1);
                        servicesCounterElement.textContent = `${formatCounterNumber(currentIndex + 1)} / ${formatCounterNumber(total)}`;
                    }
                }
            }
        });
        servicesTlMobile.to(serviceArrowPointMobile, { opacity: 1, duration: 0.01 }, 0)
            .fromTo(serviceDrawMobile, { drawSVG: "0%" }, { drawSVG: "100%", ease: "none" }, 0)
            .to(serviceArrowPointMobile, {
                motionPath: {
                    path: servicePathMobile, align: servicePathMobile, alignOrigin: [0.5, 0.5], autoRotate: -90, start: 0, end: 1
                },
                ease: "none",
            }, 0);
    };


    // Initialize Services section specific animations
    setupStackingCardsAnimation();

    // Use ScrollTrigger.matchMedia to call the correct counter setup
    ScrollTriggerInstance.matchMedia({
        "(min-width: 1025px)": function() {
            if (serviceArrow && getComputedStyle(serviceArrow).display !== 'none') {
                setupServicesCounter();
            } else if (serviceArrowMobile && getComputedStyle(serviceArrowMobile).display !== 'none') {
                 // Fallback for cases where desktop arrow might be hidden by CSS override
                setupServicesCounterMobile();
            }
        },
        "(max-width: 1024px)": function() {
            if (serviceArrowMobile && getComputedStyle(serviceArrowMobile).display !== 'none') {
                setupServicesCounterMobile();
            } else if (serviceArrow && getComputedStyle(serviceArrow).display !== 'none') {
                // Fallback for cases where mobile arrow might be hidden by CSS override
                setupServicesCounter();
            }
        }
    });
    console.log("Services Section (Section 2) Initialized");
}
