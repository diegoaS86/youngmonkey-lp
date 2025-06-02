// assets/js/testimonial.js
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import imageBrianURL from 'url:../images/brian.png';
import imageGregorURL from 'url:../images/Gregor.png';

console.log("--- DEBUG testimonial.js (com 'url:') ---");
console.log("Conteúdo DETALHADO de imageBrianURL (após import 'url:'):");
console.dir(imageBrianURL);
console.log("Tipo de imageBrianURL:", typeof imageBrianURL);

console.log("Conteúdo DETALHADO de imageGregorURL (após import 'url:'):");
console.dir(imageGregorURL);
console.log("Tipo de imageGregorURL:", typeof imageGregorURL);

console.log("--- FIM DEBUG testimonial.js ---");


export function setupLogoMarqueeWithGSAP() {
    const container = document.querySelector('.logo-marquee-container');
    const track = document.querySelector('.logo-marquee-track');

    if (!container || !track) {
        console.error("Logo Marquee: Container ou track não encontrado.");
        return;
    }

    const logos = Array.from(track.children);
    if (logos.length === 0) {
        console.warn("Logo Marquee: Nenhum logo encontrado para animar.");
        return;
    }

    gsap.set(track, { x: 0 });

    let totalWidth = 0;
    logos.forEach(svg => {
        let itemWidth = svg.getBoundingClientRect().width;
        if (itemWidth === 0 && svg.hasAttribute('width')) {
            itemWidth = parseFloat(svg.getAttribute('width')) || 0;
        }

        const style = window.getComputedStyle(svg);
        const marginLeft = parseFloat(style.marginLeft) || 0;
        const marginRight = parseFloat(style.marginRight) || 0;
        totalWidth += itemWidth + marginLeft + marginRight;
    });

    const segmentWidth = totalWidth / 2;
    if (segmentWidth === 0) {
        console.error("Logo Marquee: Largura do segmento calculada é zero. Verifique se os SVGs estão carregados e visíveis.");
        return;
    }

    const progressWrap = gsap.utils.wrap(0, 1);
    const xWrap = gsap.utils.wrap(0, -segmentWidth);
    let draggableInstance;

    const proxy = document.createElement("div");
    gsap.set(proxy, { x: 0 });

    const loopTimeline = gsap.timeline({
        repeat: -1,
        paused: true,
        defaults: { duration: 40, ease: "none" },
        onUpdate: function () {
            if (draggableInstance && !draggableInstance.isPressed && !draggableInstance.isDragging && !draggableInstance.isThrowing) {
                let totalProgress = this.totalProgress();
                gsap.set(proxy, { x: totalProgress * -segmentWidth });
            }
        }
    })
    .to(track, {
        x: `-=${segmentWidth}`,
        modifiers: {
            x: gsap.utils.unitize(value => xWrap(parseFloat(value)))
        }
    });

    gsap.set(proxy, { x: 0 });
    loopTimeline.play();

    let timelineInitialProgress = 0;
    let proxyElementInitialXAtDragStart = 0;
    let wasPlaying = true;

    function alignTimeline() {
        let currentProxyElementX = this.x;
        let dx = currentProxyElementX - proxyElementInitialXAtDragStart;
        let newProgress = timelineInitialProgress - (dx / segmentWidth);
        loopTimeline.progress(progressWrap(newProgress));
    }

    draggableInstance = Draggable.create(proxy, {
        type: 'x',
        trigger: container,
        inertia: true,
        allowNativeTouchScrolling: false,
        overshootTolerance: 0,
        cursor: "grab",
        activeCursor: "grabbing",
        inertia: { x: { resistance: 200 } },
        onPressInit: function() {
            wasPlaying = !loopTimeline.paused();
            loopTimeline.pause();
            timelineInitialProgress = loopTimeline.totalProgress();
            let currentUnwrappedX = timelineInitialProgress * -segmentWidth;
            gsap.set(proxy, {x: currentUnwrappedX});
            proxyElementInitialXAtDragStart = currentUnwrappedX;
            this.startX = currentUnwrappedX;
            this.update(true);
        },
        onDrag: alignTimeline,
        onThrowUpdate: alignTimeline,
        onRelease: function() {
            if (!this.isThrowing && wasPlaying) {
                loopTimeline.play();
            }
        },
        onThrowComplete: function() {
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
            // Com 'url:', imageBrianURL deve ser a string da URL diretamente.
            image: imageBrianURL,
            name: "Brian Arnott",
            title: "Director, Dolby Australia",
            quoteTitle: "Resultados Incríveis!",
            text: "Trabalhar com o Diego foi ótimo. Ele criou um vídeo muito profissional em um curto espaço de tempo e com pouquíssimas instruções da minha parte. As atualizações e melhorias foram integradas muito rapidamente. Com certeza, trabalharia com ele novamente."
        },
        {
            image: imageGregorURL,
            name: "Gregor Amon",
            title: "Communication Director and Head of Production",
            quoteTitle: "Parceria de Sucesso!",
            text: "Eles foi além para fazer este projeto funcionar! Meu cliente teve muitas revisões, mas o Diego foi um excelente comunicador, focado em resultados e literalmente salvou este projeto. Um dos melhores fornecedores com quem já trabalhei. Além de ser super paciente e entregar antes do prazo todas as vezes."
        },
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

    // Função simplificada, já que esperamos que testimonial.image seja uma string.
    function getImageUrlFromTestimonial(testimonialImageValue) {
        if (typeof testimonialImageValue === 'string' && testimonialImageValue) {
            return testimonialImageValue;
        }
        // Se, mesmo com 'url:', não for uma string, loga o erro e usa placeholder.
        console.error("ERRO: testimonial.image não é uma string válida mesmo após import com 'url:'. Valor:", testimonialImageValue);
        return 'https://placehold.co/90x90/FF0000/FFFFFF?text=ErroURL';
    }


    function displayTestimonial(index, direction = 'next') {
        const testimonial = testimonials[index];

        gsap.to([nameEl, titleEl], {
            opacity: 0,
            duration: 0.3,
            ease: "expo.in"
        });

        gsap.to([imageEl], {
            opacity: 0,
            scale: 0,
            duration: 0.3,
            ease: "expo.in"
        });

        gsap.to([quoteTitleEl, textEl], {
            x: direction === 'next' ? -30 : 30,
            opacity: 0,
            duration: 0.4,
            ease: "expo.in",

            onComplete: () => {
                const imageUrlToSet = getImageUrlFromTestimonial(testimonial.image);

                imageEl.src = imageUrlToSet;
                imageEl.alt = `Foto de ${testimonial.name}`;

                nameEl.textContent = testimonial.name;
                titleEl.textContent = testimonial.title;
                quoteTitleEl.textContent = testimonial.quoteTitle;
                textEl.textContent = testimonial.text;

                gsap.set([quoteTitleEl, textEl], {
                    x: direction === 'next' ? 30 : -30,
                    opacity: 0
                });

                gsap.to([nameEl, titleEl], {
                    opacity: 1,
                    duration: 0.7,
                    ease: "expo.out",
                });

                gsap.to([imageEl], {
                    opacity: 1,
                    scale: 1,
                    duration: 0.7,
                    ease: "expo.out",
                });

                gsap.to([quoteTitleEl], {
                    x: 0,
                    opacity: 1,
                    duration: 0.7,
                    ease: "expo.out",
                    delay: 0.1
                });
                gsap.to([textEl], {
                    x: 0,
                    opacity: 1,
                    duration: 0.7,
                    ease: "expo.out",
                    delay: 0.25
                });
            }
        });
    }

    prevButton.addEventListener('click', () => {
        currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
        displayTestimonial(currentTestimonialIndex, 'prev');
    });

    nextButton.addEventListener('click', () => {
        currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
        displayTestimonial(currentTestimonialIndex, 'next');
    });

    if (testimonials.length > 0) {
        displayTestimonial(currentTestimonialIndex);
    }
}

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
        yPercent: -48,
        width: '300px',
        zIndex: 3
    });

    const svgs = gsap.utils.toArray('.icon-halo:not(.svg6)');
    const spacing = 75;

    gsap.set(svgs, {
        y: (i) => -(spacing * (svgs.length - i)),
        xPercent: -50
    });

    gsap.set('.svg6', {
        y: 0,
        xPercent: -50
    });

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
            markers: false // Defina como true para depurar o ScrollTrigger
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
            tl.to(svg, { y: 0, duration: 0.8, ease: "power2.inOut" }, i === 0 ? undefined : "-=0.45");
        });
    }

    gsap.delayedCall(0.5, () => ScrollTrigger.refresh());
}
