// assets/js/footer.js

/**
 * Initializes all animations and setups for the Footer section.
 * @param {object} gsapInstance - The GSAP instance.
 * @param {object} ScrollTriggerInstance - The ScrollTrigger instance.
 */
function initializeFooterSection(gsapInstance, ScrollTriggerInstance) {
    // Element selectors specific to this section
    const footerArrow = document.querySelector('.footer-arrow');
    const footerPath = document.getElementById('footer-path');
    const footerDraw = document.querySelector('.footer-draw');
    const footerArrowPoint = document.getElementById('footer-arrow-point');
    const footerElement = document.getElementById('footer'); // Trigger element

    // --- Footer Animations ---
    const setupFooterArrow = () => {
        if (!footerArrow || !footerPath || !footerDraw || !footerArrowPoint || !footerElement) {
            console.warn("Footer Arrow: Elements or trigger not found.");
            return;
        }
        gsapInstance.set(footerArrowPoint, { opacity: 0, transformOrigin: "50% 50%" });
        gsapInstance.set(footerDraw, { drawSVG: "0%" });

        const arrowTimeline = gsapInstance.timeline();
        arrowTimeline.to(footerArrowPoint, { opacity: 1, duration: 0.01, scale: 0.8, ease: "none" }, 0)
            .to(footerArrowPoint, {
                motionPath: {
                    path: footerPath,
                    align: footerPath,
                    alignOrigin: [0.5, 0.5],
                    autoRotate: -90, // Adjusted based on visual inspection of path
                    start: 0,
                    end: 1
                },
                ease: "none"
            }, 0)
            .to(footerDraw, { drawSVG: "100%", ease: "none" }, 0);

        ScrollTriggerInstance.create({
            trigger: footerElement, // Use the footer element as trigger
            start: "top 80%",
            end: "bottom bottom", // Animate until the bottom of the footer reaches the bottom of the viewport
            scrub: 1.5,
            animation: arrowTimeline,
        });
    };

    // Initialize Footer section specific animations
    if (footerArrow) {
        setupFooterArrow();
    }
    console.log("Footer Section Initialized");
}
