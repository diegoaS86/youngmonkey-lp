function setupLogoMarqueeWithGSAP() {
    const container = document.querySelector('.logo-marquee-container');
    const track = document.querySelector('.logo-marquee-track');

    if (!container || !track) {
        console.error("Logo Marquee: Container or track not found.");
        return;
    }

    const logos = Array.from(track.children);
    if (logos.length === 0) {
        console.warn("Logo Marquee: No logos found to animate.");
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
        console.error("Logo Marquee: Calculated segment width is still zero. Ensure SVGs are fully loaded and visible with dimensions before this script runs.");
        return;
    }
    console.log("Logo Marquee: Calculated segmentWidth:", segmentWidth);

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
            x: `-=${ segmentWidth }`,
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
        inertia: {
            x: {
                resistance: 200
            }
        },

        onPressInit: function () {
            wasPlaying = !loopTimeline.paused();
            loopTimeline.pause();

            timelineInitialProgress = loopTimeline.totalProgress();
            let currentUnwrappedX = timelineInitialProgress * -segmentWidth;
            gsap.set(proxy, { x: currentUnwrappedX });

            proxyElementInitialXAtDragStart = currentUnwrappedX;

            this.startX = currentUnwrappedX;
            this.update(true);

            console.log(`onPressInit: tlTotalProg=${ timelineInitialProgress.toFixed(4) }, proxy.x set to ${ gsap.getProperty(proxy, "x").toFixed(1) }, drag.startX=${ this.startX.toFixed(1) }`);
        },
        onDrag: alignTimeline,
        onThrowUpdate: alignTimeline,

        onRelease: function () {
            console.log(`onRelease: isThrowing=${ this.isThrowing }, proxy.x=${ gsap.getProperty(proxy, "x").toFixed(1) }`);
            if (!this.isThrowing && wasPlaying) {
                loopTimeline.play();
            }
        },
        onThrowComplete: function () {
            console.log("onThrowComplete - Final proxy.x:", gsap.getProperty(proxy, "x").toFixed(1));
            if (wasPlaying) {
                loopTimeline.play();
            }
            // Suaviza a volta para a velocidade normal da timeline
            gsap.to(loopTimeline, { timeScale: 1, duration: 0.01, ease: "power1.inOut" });
        }
    })[ 0 ];
}

function setupTestimonialSlider() {
    const testimonials = [
        {
            image: "https://placehold.co/90x90/E6FFF3/0A2E3A?text=Foto+1",
            name: "Ana Silva",
            title: "Diretora de Marketing, Alpha Co.",
            quoteTitle: "Resultados Incríveis!",
            text: "Estou impressionada com a qualidade e o impacto dos vídeos produzidos. Nossa taxa de conversão aumentou significativamente desde que implementamos a nova estratégia de conteúdo visual."
        },
        {
            image: "https://placehold.co/90x90/E6FFF3/0A2E3A?text=Foto+2",
            name: "Carlos Pereira",
            title: "Fundador, Tech Solutions",
            quoteTitle: "Parceria de Sucesso!",
            text: "A equipe não apenas entregou um design incrível para nosso site, mas também nos ajudou a criar uma narrativa poderosa que realmente conecta com nossos clientes. Recomendo!"
        },
        {
            image: "https://placehold.co/90x90/E6FFF3/0A2E3A?text=Foto+3",
            name: "Juliana Costa",
            title: "Gerente de Produto, Inova Ltda.",
            quoteTitle: "Qualidade Excepcional!",
            text: "O profissionalismo e a criatividade superaram todas as nossas expectativas. Os vídeos e textos são de altíssima qualidade e trouxeram resultados expressivos para nossas campanhas."
        },
        {
            image: "https://placehold.co/90x90/E6FFF3/0A2E3A?text=Foto+4",
            name: "Rafael Lima",
            title: "Empreendedor Digital",
            quoteTitle: "Transformação Digital!",
            text: "Trabalhar com esta equipe foi um divisor de águas para minha marca pessoal. As locuções e o conteúdo visual me ajudaram a construir uma presença online muito mais forte e engajada."
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

    function displayTestimonial(index, direction = 'next') {
        const testimonial = testimonials[ index ];

        // Animação de saída
        gsap.to([ nameEl, titleEl ], {
            opacity: 0,
            duration: 0.3,
            ease: "expo.in"
        });

        gsap.to([ imageEl ], {
            opacity: 0,
            scale: 0,
            duration: 0.3,
            ease: "expo.in"
        });

        // Animação específica para quoteTitleEl e textEl (movimento)
        gsap.to([ quoteTitleEl, textEl ], {
            x: direction === 'next' ? -30 : 30,
            opacity: 0,
            duration: 0.4,
            ease: "expo.in",

            onComplete: () => {
                // Atualiza o conteúdo
                imageEl.src = testimonial.image;
                imageEl.alt = `Foto de ${ testimonial.name }`;
                nameEl.textContent = testimonial.name;
                titleEl.textContent = testimonial.title;
                quoteTitleEl.textContent = testimonial.quoteTitle;
                textEl.textContent = testimonial.text;

                // Prepara para animação de entrada (posiciona os elementos à direita/left)
                gsap.set([ quoteTitleEl, textEl ], {
                    x: direction === 'next' ? -30 : 30,
                    opacity: 0
                });

                // Anima os elementos estáticos (imagem, nome, título)
                gsap.to([ nameEl, titleEl ], {
                    opacity: 1,
                    duration: 0.7,
                    ease: "expo.out",
                });

                gsap.to([ imageEl ], {
                    opacity: 1,
                    scale: 1,
                    duration: 0.7,
                    ease: "expo.out",
                });


                // Anima os elementos com movimento (título da citação e texto)
                gsap.to([ quoteTitleEl ], {
                    x: 0,
                    opacity: 1,
                    duration: 0.7,
                    ease: "expo.out",
                    delay: 0.1
                });
                gsap.to([ textEl ], {
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
function setupSVGAnimation() {
    // Seleciona os elementos
    const section3 = document.getElementById('section-3');
    const svgContainer = document.querySelector('.svg-container');

    if (!section3 || !svgContainer) {
        console.error("Elementos não encontrados!");
        return;
    }

    // Remove position: fixed do CSS e aplica via JS
    gsap.set(svgContainer, {
        position: 'absolute',
        right: '-2%',
        xPercent: 100,
        yPercent: -48,
        width: '300px',
        zIndex: 3
    });

    // Configuração inicial dos SVGs
    const svgs = gsap.utils.toArray('.icon-halo:not(.svg6)');
    const spacing = 75; // Espaçamento entre SVGs

    gsap.set(svgs, {
        y: (i) => -(spacing * (svgs.length - i)), // Empilhados para cima
        xPercent: -50
    });

    gsap.set('.svg6', {
        y: 0,
        xPercent: -50
    });

    // Cria um pin para o container
    ScrollTrigger.create({
        trigger: section3,
        start: "top top",
        end: "bottom bottom",
        pin: svgContainer,
        pinSpacing: false
    });

    // Animação com ScrollTrigger
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section3,
            start: "top 30%",
            end: "bottom 80%",
            scrub: 1,
            markers: false // Ativar para debug se necessário
        }
    });

    // Animação em cascata
    tl.to(svgs[ 4 ], { y: 0, duration: 0.8, ease: "power2.inOut" })
        .to(svgs[ 3 ], { y: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.45")
        .to(svgs[ 2 ], { y: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.45")
        .to(svgs[ 1 ], { y: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.45")
        .to(svgs[ 0 ], { y: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.45");

    // Atualiza após carregamento
    gsap.delayedCall(0.5, () => ScrollTrigger.refresh());
}