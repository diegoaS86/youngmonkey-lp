import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import imageBrianURL from 'url:../images/img/brian.png';
import imageGregorURL from 'url:../images/img/Gregor.png';

gsap.registerPlugin(Draggable, InertiaPlugin, ScrollTrigger);

// Se necessário, mantenha os logs para debug
console.log("--- DEBUG testimonial.js ---");
console.dir(imageBrianURL);
console.log("Tipo de imageBrianURL:", typeof imageBrianURL);
console.dir(imageGregorURL);
console.log("Tipo de imageGregorURL:", typeof imageGregorURL);
console.log("--- FIM DEBUG ---");

export function setupLogoMarqueeWithGSAP() {
  const container = document.querySelector('.logo-marquee-container');
  const track = document.querySelector('.logo-marquee-track');
  if (!container || !track) {
    console.error("Logo Marquee: Container ou track não encontrado.");
    return;
  }
  
  const logos = Array.from(track.children);
  if (!logos.length) {
    console.warn("Logo Marquee: Nenhum logo encontrado para animar.");
    return;
  }
  
  gsap.set(track, { x: 0 });
  
  // Função auxiliar para obter a largura de um logo (incluindo margens)
  const getItemTotalWidth = (logo) => {
    let itemWidth = logo.getBoundingClientRect().width;
    if (itemWidth === 0 && logo.hasAttribute('width')) {
      itemWidth = parseFloat(logo.getAttribute('width')) || 0;
    }
    const style = window.getComputedStyle(logo);
    const marginLeft = parseFloat(style.marginLeft) || 0;
    const marginRight = parseFloat(style.marginRight) || 0;
    return itemWidth + marginLeft + marginRight;
  };
  
  const totalWidth = logos.reduce((acc, logo) => acc + getItemTotalWidth(logo), 0);
  const segmentWidth = totalWidth / 2;
  if (!segmentWidth) {
    console.error("Logo Marquee: Largura do segmento calculada é zero. Verifique se os SVGs estão carregados e visíveis.");
    return;
  }
  
  const xWrap = gsap.utils.wrap(0, -segmentWidth);
  const progressWrap = gsap.utils.wrap(0, 1);
  const proxy = document.createElement("div");
  gsap.set(proxy, { x: 0 });
  
  let draggableInstance;
  
  const loopTimeline = gsap.timeline({
    repeat: -1,
    defaults: { duration: 40, ease: "none" },
    onUpdate() {
      if (draggableInstance && !draggableInstance.isPressed && !draggableInstance.isDragging && !draggableInstance.isThrowing) {
        gsap.set(proxy, { x: this.totalProgress() * -segmentWidth });
      }
    }
  }).to(track, {
    x: `-=${segmentWidth}`,
    modifiers: {
      x: gsap.utils.unitize(value => xWrap(parseFloat(value)))
    }
  });
  loopTimeline.play();
  
  let timelineInitialProgress = 0;
  let proxyElementInitialXAtDragStart = 0;
  let wasPlaying = true;
  
  function alignTimeline() {
    const dx = this.x - proxyElementInitialXAtDragStart;
    const newProgress = timelineInitialProgress - (dx / segmentWidth);
    loopTimeline.progress(progressWrap(newProgress));
  }
  
  draggableInstance = Draggable.create(proxy, {
    type: 'x',
    trigger: container,
    inertia: { x: { resistance: 200 } },
    allowNativeTouchScrolling: false,
    overshootTolerance: 0,
    cursor: "grab",
    activeCursor: "grabbing",
    onPressInit() {
      wasPlaying = !loopTimeline.paused();
      loopTimeline.pause();
      timelineInitialProgress = loopTimeline.totalProgress();
      proxyElementInitialXAtDragStart = timelineInitialProgress * -segmentWidth;
      gsap.set(proxy, { x: proxyElementInitialXAtDragStart });
      this.startX = proxyElementInitialXAtDragStart;
      this.update(true);
    },
    onDrag: alignTimeline,
    onThrowUpdate: alignTimeline,
    onRelease() {
      if (!this.isThrowing && wasPlaying) {
        loopTimeline.play();
      }
    },
    onThrowComplete() {
      if (wasPlaying) {
        loopTimeline.play();
      }
      gsap.to(loopTimeline, { timeScale: 1, duration: 0.01, ease: "power2.inOut" });
    }
  })[0];
}

export function setupTestimonialSlider() {
  const testimonials = [
    {
      image: imageBrianURL,
      name: "Brian Arnott",
      title: "Director, Dolby Australia",
      quoteTitle: "Resultados Incríveis!",
      text: "Trabalhar com o Diego foi ótimo. Ele criou um vídeo muito profissional em um curto espaço de tempo e com pouquíssimas instruções. As atualizações foram integradas rapidamente. Com certeza, trabalharia com ele novamente."
    },
    {
      image: imageGregorURL,
      name: "Gregor Amon",
      title: "Communication Director and Head of Production",
      quoteTitle: "Parceria de Sucesso!",
      text: "Ele foi além para fazer este projeto funcionar! Meu cliente teve muitas revisões, mas o Diego se destacou pela comunicação, foco em resultados e entregas antes do prazo."
    }
  ];
  
  let currentTestimonialIndex = 0;
  
  const imageEl = document.getElementById('testimonialImage');
  const nameEl = document.getElementById('testimonialName');
  const titleEl = document.getElementById('testimonialTitle');
  const quoteTitleEl = document.getElementById('testimonialQuoteTitle');
  const textEl = document.getElementById('testimonialText');
  const prevButton = document.getElementById('prevTestimonial');
  const nextButton = document.getElementById('nextTestimonial');
  
  if (!imageEl || !nameEl || !titleEl || !quoteTitleEl || !textEl || !prevButton || !nextButton) {
    console.error("Um ou mais elementos do slider de depoimentos não foram encontrados.");
    return;
  }
  
  // Verifica se a URL da imagem é válida.
  function getImageUrlFromTestimonial(testimonialImage) {
    if (typeof testimonialImage === 'string' && testimonialImage.trim().length > 0) {
      return testimonialImage;
    }
    console.error("ERRO: testimonial.image não é uma string válida.", testimonialImage);
    return 'https://placehold.co/90x90/FF0000/FFFFFF?text=ErroURL';
  }
  
  // Exibe o depoimento com animações GSAP
  function displayTestimonial(index, direction = 'next') {
    const t = testimonials[index];
    console.log("Exibindo depoimento:", t);
    
    gsap.to([nameEl, titleEl], { opacity: 0, duration: 0.3, ease: "expo.in" });
    gsap.to(imageEl, { opacity: 0, scale: 0, duration: 0.3, ease: "expo.in" });
    gsap.to([quoteTitleEl, textEl], {
      x: direction === 'next' ? -30 : 30,
      opacity: 0,
      duration: 0.4,
      ease: "expo.in",
      onComplete: () => {
        imageEl.src = getImageUrlFromTestimonial(t.image);
        imageEl.alt = `Foto de ${t.name}`;
  
        nameEl.textContent = t.name;
        titleEl.textContent = t.title;
        quoteTitleEl.textContent = t.quoteTitle;
        textEl.textContent = t.text;
  
        gsap.set([quoteTitleEl, textEl], { x: direction === 'next' ? 30 : -30, opacity: 0 });
        gsap.to([nameEl, titleEl], { opacity: 1, duration: 0.7, ease: "expo.out" });
        gsap.to(imageEl, { opacity: 1, scale: 1, duration: 0.7, ease: "expo.out" });
        gsap.to(quoteTitleEl, { x: 0, opacity: 1, duration: 0.7, ease: "expo.out", delay: 0.1 });
        gsap.to(textEl, { x: 0, opacity: 1, duration: 0.7, ease: "expo.out", delay: 0.25 });
      }
    });
  }
  
  prevButton.addEventListener('click', () => {
    currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
    console.log("Prev clique, índice atual:", currentTestimonialIndex);
    displayTestimonial(currentTestimonialIndex, 'prev');
  });
  
  nextButton.addEventListener('click', () => {
    currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
    console.log("Next clique, índice atual:", currentTestimonialIndex);
    displayTestimonial(currentTestimonialIndex, 'next');
  });
  
  // Exibe o primeiro depoimento
  if (testimonials.length) {
    displayTestimonial(currentTestimonialIndex);
  }
}

// Chame a função somente após o DOM estar carregado.
// Exemplo: 
document.addEventListener("DOMContentLoaded", () => {
  setupTestimonialSlider();
});

export function setupSVGAnimation() {
  const section3 = document.getElementById('section-3');
  const svgContainer = document.querySelector('.svg-container');
  
  if (!section3 || !svgContainer) {
    console.error("Elementos para setupSVGAnimation não encontrados!");
    return;
  }
  
  gsap.set(svgContainer, {
    position: 'absolute',
    right: '-2%',
    xPercent: 100,
    yPercent: -18,
    width: '300px',
    zIndex: 3
  });
  
  const svgs = gsap.utils.toArray('.icon-halo:not(.svg6)');
  const spacing = 75;
  
  gsap.set(svgs, {
    y: i => -(spacing * (svgs.length - i)),
    xPercent: -50
  });
  gsap.set('.svg6', { y: 0, xPercent: -50 });
  
  ScrollTrigger.create({
    trigger: section3,
    start: "top top",
    end: "bottom bottom",
    pin: svgContainer,
    pinSpacing: false
  });
  
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section3,
      start: "top 30%",
      end: "bottom 80%",
      scrub: 1,
      markers: false
    }
  });
  
  if (svgs.length >= 5) {
    tl.to(svgs[4], { y: 0, duration: 0.8, ease: "power2.inOut" })
      .to(svgs[3], { y: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.45")
      .to(svgs[2], { y: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.45")
      .to(svgs[1], { y: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.45")
      .to(svgs[0], { y: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.45");
  } else {
    svgs.reverse().forEach((svg, i) => {
      tl.to(svg, { y: 0, duration: 0.8, ease: "power2.inOut" }, i ? "-=0.45" : undefined);
    });
  }
  
  gsap.delayedCall(0.5, () => ScrollTrigger.refresh());
}