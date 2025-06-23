export function initializeSection1(gsap, ScrollTrigger) {
  const transformeText = document.getElementById('transformeText'),
        odometerContainer = document.getElementById('dynamicOdometer'),
        section1Trigger = document.getElementById('section-1');

  // Odometer Animation
  const setupOdometer = () => {
    if (!odometerContainer || !section1Trigger) return;
    const hundreds = document.getElementById('odometer-hundreds'),
          tens = document.getElementById('odometer-tens'),
          units = document.getElementById('odometer-units');
    if (!hundreds || !tens || !units) return;
    const digitHeight = parseFloat(getComputedStyle(units.children[0]).height) || 100;
    let currentVal = -1, MAX = 555, counter = { value: 0 };
    const setReels = (val) => {
      gsap.set(hundreds, { y: -((Math.floor(val / 100) % 10) * digitHeight) });
      gsap.set(tens, { y: -((Math.floor(val / 10) % 10) * digitHeight) });
      gsap.set(units, { y: -((val % 10) * digitHeight) });
    };
    setReels(0);
    ScrollTrigger.create({
      trigger: section1Trigger,
      start: "top 90%",
      end: "+=4550",
      scrub: true,
      animation: gsap.fromTo(counter, { value: 0 }, {
        value: MAX,
        ease: "none",
        onUpdate: () => {
          const newVal = Math.round(counter.value);
          if (newVal !== currentVal) {
            currentVal = newVal;
            setReels(newVal);
          }
        }
      })
    });
  };

  // Long Shadow & Text Appear
  const applyLongShadow = (id, color = '#00151B', len = 100, space = 0.1) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.textShadow = Array.from({ length: len }, (_, i) => `${(i+1)*space}px ${(i+1)*space}px ${color}`).join(', ');
  };

  const setupTextAppear = (id) => {
    const container = document.getElementById(id);
    if (!container) return;
    const words = gsap.utils.toArray(container.querySelectorAll("span"));
    if (!words.length) return;
    const anim = gsap.fromTo(words, { autoAlpha: 0, y: 30 }, {
      autoAlpha: 1, y: 0, duration: 1, stagger: 0.2, ease: "power4.out"
    });
    ScrollTrigger.create({ trigger: container, start: "top 90%", end: "bottom 50%", scrub: 1, animation: anim });
  };

  // Arrow Animation
  const setupArrow = () => {
    const containerDesktop = document.querySelector('.new-arrow-path-container'),
          containerMobile = document.querySelector('.new-arrow-path-container-mobile'),
          activeContainer = window.innerWidth < 1200 && containerMobile?.offsetParent ? containerMobile : containerDesktop;
    if (!activeContainer) return;
    const mainPath = activeContainer.querySelector('#main-path') || activeContainer.querySelector('#main-path-mobile'),
          visiblePath = activeContainer.querySelector('.draw') || activeContainer.querySelector('.draw-mobile'),
          arrowHead = activeContainer.querySelector('#arrow') || activeContainer.querySelector('#arrow-mobile');
    if (!mainPath || !visiblePath || !arrowHead || !section1Trigger) return;

    gsap.set(visiblePath, { drawSVG: "0%" });
    gsap.set(arrowHead, { opacity: 1, transformOrigin: "center center" });
    const adjust = () => {
      const screenWidth = window.innerWidth;
      activeContainer.style.right = `${-500 + 0.12 * (2560 - screenWidth)}px`;
      setTimeout(() => ScrollTrigger.refresh(true), 100);
    };
    adjust();
    window.addEventListener('resize', adjust);
    gsap.set(activeContainer, { visibility: 'visible' });
    gsap.timeline({
      scrollTrigger: {
        trigger: section1Trigger,
        start: window.innerWidth < 768 ? "top bottom+=50px" : "top 80%",
        end: () => `+=${section1Trigger.offsetHeight * 1.1}`,
        scrub: 1.5,
        id: "newArrowAnimation"
      }
    })
    .to(arrowHead, {
      motionPath: {
        path: mainPath,
        align: mainPath,
        alignOrigin: [0.5, 0.5],
        autoRotate: 265
      },
      ease: "none"
    }, 0)
    .to(visiblePath, { drawSVG: "100%", ease: "none" }, 0);
  };

  // Initialization
  if (odometerContainer) setupOdometer();
  if (transformeText) {
    applyLongShadow('transformeText', '#00151B', 80, 0.1);
    setupTextAppear('transformeText');
  }
  if (document.querySelector('.new-arrow-path-container') || document.querySelector('.new-arrow-path-container-mobile')) {
    setupArrow();
  }
  console.log("Section 1 Initialized");
}