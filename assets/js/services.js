export function initializeServicesSection(gsap, ScrollTrigger) {
  const section = document.getElementById('section-2');
  if (!section) return console.warn("Services Section not found.");

  const container = section.querySelector('.services-container'),
        cards = gsap.utils.toArray(section.querySelectorAll('.service-card')),
        counterEl = document.getElementById('servicesCounter'),
        // Desktop Arrow
        arrowD = section.querySelector('.service-arrow'),
        pathD = document.getElementById('service-path'),
        drawD = section.querySelector('.service-arrow .service-draw'),
        arrowPointD = document.getElementById('service-arrow-point'),
        // Mobile Arrow
        arrowM = section.querySelector('.service-arrow-mobile'),
        pathM = document.getElementById('service-path-mobile'),
        drawM = section.querySelector('.service-arrow-mobile .service-draw-mobile'),
        arrowPointM = document.getElementById('service-arrow-point-mobile'),
        formatCounter = n => n.toString().padStart(2, '0');

  const setupStacking = () => {
    if (!container || !cards.length) 
      return console.warn("StackingCards: Essential elements not found.");
    
    cards.forEach((card, i) => {
      gsap.set(card, i === 0
        ? { xPercent: -50, yPercent: -50, opacity: 1, scale: 1, zIndex: cards.length }
        : { x: "110%", yPercent: -50, opacity: 1, scale: 1.1, zIndex: cards.length - i });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        pin: container,
        pinSpacing: true,
        start: "top top",
        end: () => `+=${window.innerHeight * (cards.length - 1) * 0.5}`,
        scrub: true, invalidateOnRefresh: true
      }
    });

    cards.forEach((card, i) => {
      if (i > 0) tl.to(card, {
        x: "0%", xPercent: -50, scale: 1, opacity: 1,
        boxShadow: "0px 0px 0px 0px rgba(0,21,27,0.5)",
        duration: 0.8, ease: "expo.inOut",
        onStart: () => gsap.set(card, { zIndex: cards.length + 10 + i })
      }, `-=${0.35}`);
    });
  };

  const setupCounter = isMobile => {
    const total = cards.length;
    if (!counterEl || total === 0) 
      return console.warn(`Counter (${isMobile ? 'Mobile' : 'Desktop'}): Missing.`);
    
    counterEl.textContent = `01 / ${formatCounter(total)}`;
    const arrow = isMobile ? arrowM : arrowD,
          path = isMobile ? pathM : pathD,
          drawEl = isMobile ? drawM : drawD,
          arrowPoint = isMobile ? arrowPointM : arrowPointD;
    if (!arrow || !path || !drawEl || !arrowPoint || 
         getComputedStyle(arrow).display === 'none') return;
    
    gsap.set(arrowPoint, { opacity: 0, scale: 0.8, rotation: 0, transformOrigin: "center center" });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * (total - 1) * 0.5}`,
        scrub: true, invalidateOnRefresh: true,
        onUpdate: self => {
          const index = Math.min(Math.floor(self.progress * total), total - 1);
          counterEl.textContent = `${formatCounter(index + 1)} / ${formatCounter(total)}`;
        }
      }
    });
    tl.to(arrowPoint, { opacity: 1, duration: 0.01 }, 0)
      .fromTo(drawEl, { drawSVG: "0%" }, { drawSVG: "100%", ease: "none" }, 0)
      .to(arrowPoint, {
        motionPath: {
          path, align: path, alignOrigin: [0.5, 0.5],
          autoRotate: -90, start: 0, end: 1
        }, ease: "none"
      }, 0);
  };

  setupStacking();
  ScrollTrigger.matchMedia({
    "(min-width: 1025px)": () => setupCounter(false),
    "(max-width: 1024px)": () => setupCounter(true)
  });
  console.log("Services Section Initialized.");
}