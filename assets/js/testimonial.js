function setupLogoMarqueeWithGSAP() {
    const container = document.querySelector('.logo-marquee-container');
    const track = document.querySelector('.logo-marquee-track');
    const logos = Array.from(track.children);

    // Calcula a largura total do track
    let totalWidth = 0;
    logos.forEach(svg => {
        const style = window.getComputedStyle(svg);
        const marginLeft = parseFloat(style.marginLeft) || 0;
        const marginRight = parseFloat(style.marginRight) || 0;
        const width = svg.getBoundingClientRect().width;
        totalWidth += width + marginLeft + marginRight;
    });

    // Divide por 2 pois duplicamos os logos
    const segmentWidth = totalWidth / 2;

    // Animação principal
    let animation = gsap.to(track, {
        x: -segmentWidth,
        duration: 40,
        ease: "none",
        repeat: -1,
        modifiers: {
            x: gsap.utils.unitize(x => parseFloat(x) % segmentWidth)
        }
    });

    // Draggable (opcional)
    let draggable = Draggable.create(track, {
        type: "x",
        inertia: true,
        onDragStart: () => animation.pause(),
        onDragEnd: function () {
            const velocity = this.getVelocity().x;
            const direction = velocity > 0 ? 1 : -1;

            animation.kill();
            animation = gsap.to(track, {
                x: `+=${ direction * segmentWidth * 2 }`,
                duration: 40,
                ease: "none",
                repeat: -1,
                modifiers: {
                    x: gsap.utils.unitize(x => parseFloat(x) % segmentWidth)
                }
            });
        },
        onThrowUpdate: function () {
            if (this.x < -segmentWidth) this.x += segmentWidth;
            else if (this.x > 0) this.x -= segmentWidth;
        }
    })[ 0 ];

    // Pausa/play no hover
    container.addEventListener('mouseenter', () => !draggable.isDragging && animation.pause());
    container.addEventListener('mouseleave', () => !draggable.isDragging && animation.play());
};
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

    function displayTestimonial(index) {
        const testimonial = testimonials[ index ];

        gsap.to([ imageEl, nameEl, titleEl, quoteTitleEl, textEl ], {
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                imageEl.src = testimonial.image;
                imageEl.alt = `Foto de ${ testimonial.name }`;
                nameEl.textContent = testimonial.name;
                titleEl.textContent = testimonial.title;
                quoteTitleEl.textContent = testimonial.quoteTitle;
                textEl.textContent = testimonial.text;

                gsap.to([ imageEl, nameEl, titleEl, quoteTitleEl, textEl ], {
                    opacity: 1,
                    duration: 0.4,
                    ease: "power2.out",
                    delay: 0.1
                });
            }
        });
    }


    prevButton.addEventListener('click', () => {
        currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
        displayTestimonial(currentTestimonialIndex);
    });

    nextButton.addEventListener('click', () => {
        currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
        displayTestimonial(currentTestimonialIndex);
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
            end: "bottom 90%",
            scrub: 1,
            markers: false // Ativar para debug se necessário
        }
    });

    // Animação em cascata
    tl.to(svgs[4], { y: 0, duration: 0.8, ease: "power4InOut" })
      .to(svgs[3], { y: 0, duration: 0.8, ease: "power4InOut" }, "-=0.45")
      .to(svgs[2], { y: 0, duration: 0.8, ease: "power4InOut" }, "-=0.45")
      .to(svgs[1], { y: 0, duration: 0.8, ease: "power4InOut" }, "-=0.45")
      .to(svgs[0], { y: 0, duration: 0.8, ease: "power4InOut" }, "-=0.45");

    // Atualiza após carregamento
    gsap.delayedCall(0.5, () => ScrollTrigger.refresh());
}