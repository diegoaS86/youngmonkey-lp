// assets/js/header.js
function initializeHeaderAnimation(gsapInstance, ScrollTriggerInstance, smootherInstance) {
    const header = document.getElementById('mainHeader');

    if (!header) {
        return;
    }
    if (!gsapInstance || !ScrollTriggerInstance) {
        return;
    }

    let headerVisible = true;
    const headerHeight = header.offsetHeight;
    const smallScrollThreshold = -100;

    gsapInstance.set(header, { y: 0 });

    ScrollTriggerInstance.create({
        trigger: 'body',
        start: "top top",
        end: "max",

        onUpdate: (self) => {
            const currentScrollY = smootherInstance ? smootherInstance.scrollTop() : self.scroll();
            const scrollDirection = self.direction;

            if (scrollDirection === 1 && currentScrollY > smallScrollThreshold) {
                if (headerVisible) {
                    gsapInstance.to(header, {
                        y: -headerHeight,
                        duration: 0.4,
                        ease: "power2.inOut"
                    });
                    headerVisible = false;
                }
            } else if (scrollDirection === -1) {
                if (!headerVisible) {
                    gsapInstance.to(header, {
                        y: 0,
                        duration: 0.4,
                        ease: "power2.inOut"
                    });
                    headerVisible = true;
                }
            } else if (currentScrollY <= smallScrollThreshold) {
                if (!headerVisible) {
                    gsapInstance.to(header, {
                        y: 0,
                        duration: 0.4,
                        ease: "power2.inOut"
                    });
                    headerVisible = true;
                }
            }
        }
    });
}
