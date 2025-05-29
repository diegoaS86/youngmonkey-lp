// assets/js/hero.js

/**
 * Initializes all animations and setups for the Hero section.
 * @param {object} gsapInstance - The GSAP instance.
 * @param {object} ScrollTriggerInstance - The ScrollTrigger instance.
 * @param {object} smootherInstance - The ScrollSmoother instance.
 */
function initializeHeroSection(gsapInstance, ScrollTriggerInstance, smootherInstance) {
    // Element selectors specific to this section
    const line1 = document.getElementById('line1');
    const line2 = document.getElementById('line2');
    const line3 = document.getElementById('line3');
    const scrambleGroup = document.getElementById('scrambleGroup');
    const ctaDotsPattern = document.querySelector('.cta-dots-pattern');
    const dotsContainer = document.getElementById('dotsContainer');

    // Configuration specific to this section
    const wordSets = {
        line1: ["Design", "Videos", "Campaigns", "Content", "Reels", "Branding"],
        line2: ["solves", "sells", "speaks", "adds", "gets", "is"],
        line3: ["problem", "more", "loud", "value", "attention", "sexy"]
    };

    // --- Hero Section Animations ---
    const animateScrambleText = () => {
        if (!line1 || !line2 || !line3 || !scrambleGroup) return;
        let counter = 0;
        function animate() {
            const word1 = wordSets.line1[counter % wordSets.line1.length];
            const word2 = wordSets.line2[counter % wordSets.line2.length];
            const word3 = wordSets.line3[counter % wordSets.line3.length];
            const groupIndex = counter % wordSets.line1.length;
            scrambleGroup.className = 'scramble-title'; // Reset classes
            scrambleGroup.classList.add(`group-${groupIndex}`);

            const tl = gsapInstance.timeline({
                onComplete: () => {
                    gsapInstance.delayedCall(3, animate);
                }
            });
            tl.to(line1, {
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
        gsapInstance.set([line1, line2, line3], { opacity: 1, delay: 0.1 });
        animate();
    };

    const setupDotsCreation = () => {
        if (!dotsContainer) return;
        const rows = 4;
        const cols = 12;
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
        let lastRandomizeScroll = 0;
        const scrollThreshold = 50;

        const randomizeDotOpacity = () => {
            gsapInstance.to(allDots, {
                opacity: 0.1,
                scale: 1,
                backgroundColor: 'var(--light-color)',
                boxShadow: 'none',
                duration: 0.1,
                ease: "expo.InOut"
            });
            const numToActivate = Math.floor(totalDots * (0.1 + Math.random() * 0.4));
            const shuffledDots = gsapInstance.utils.shuffle(allDots.slice());
            const dotsToActivate = shuffledDots.slice(0, numToActivate);
            gsapInstance.to(dotsToActivate, {
                opacity: 1,
                scale: 1.4,
                backgroundColor: 'var(--accent-color)',
                boxShadow: '0 0 10px var(--accent-color)',
                duration: 0.1,
                ease: "expo.InOut",
                stagger: { each: 0.05, from: "random" }
            });
        };

        ScrollTriggerInstance.create({
            trigger: 'body',
            start: "top top",
            end: "max",
            onUpdate: (self) => {
                const currentScroll = smootherInstance ? smootherInstance.scrollTop() : self.scroll();
                if (Math.abs(currentScroll - lastRandomizeScroll) >= scrollThreshold) {
                    randomizeDotOpacity();
                    lastRandomizeScroll = currentScroll;
                }
            }
        });
        randomizeDotOpacity(); // Initial call
    };

    const setupCtaDotsAnimation = () => {
        if (!ctaDotsPattern) return;
        const patternClasses = ['pattern-1', 'pattern-2', 'pattern-3'];
        let currentPatternIndex = 0;
        gsapInstance.timeline({ repeat: -1, repeatDelay: 0.5 })
            .call(() => {
                ctaDotsPattern.className = 'cta-dots-pattern ' + patternClasses[currentPatternIndex];
                currentPatternIndex = (currentPatternIndex + 1) % patternClasses.length;
            })
            .to({}, { duration: 1 }); // Empty tween to make the timeline repeat
    };

    // Initialize Hero section specific animations
    if (line1 && line2 && line3 && scrambleGroup) {
        animateScrambleText();
    }
    if (dotsContainer) {
        setupDotsCreation();
        setupDotsScrollAnimation();
    }
    if (ctaDotsPattern) {
        setupCtaDotsAnimation();
    }
    console.log("Hero Section Initialized");
}
