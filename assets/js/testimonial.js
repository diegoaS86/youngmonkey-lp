// assets/js/testimonial.js
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin"; // Draggable com inertia precisa deste plugin
import { ScrollTrigger } from "gsap/ScrollTrigger"; // Para setupSVGAnimation

export function setupLogoMarqueeWithGSAP() {
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

    const segmentWidth = totalWidth / 2; // Assumindo que o track tem o dobro do conteúdo visível
    if (segmentWidth === 0) {
        console.error("Logo Marquee: Calculated segment width is still zero. Ensure SVGs are fully loaded and visible with dimensions before this script runs, or that logos array is not empty.");
        return;
    }
    // console.log("Logo Marquee: Calculated segmentWidth:", segmentWidth);

    const progressWrap = gsap.utils.wrap(0, 1);
    const xWrap = gsap.utils.wrap(0, -segmentWidth); // Garante que o wrap seja para a esquerda
    let draggableInstance; // Para armazenar a instância do Draggable

    // Cria um elemento proxy para o Draggable controlar
    const proxy = document.createElement("div");
    gsap.set(proxy, { x: 0 }); // Inicializa a posição x do proxy

    const loopTimeline = gsap.timeline({
        repeat: -1,
        paused: true, // Começa pausada para ser controlada pelo Draggable
        defaults: { duration: 40, ease: "none" }, // Duração longa para um movimento lento e constante
        onUpdate: function () {
            // Se o Draggable não estiver ativo, sincroniza a posição do proxy com o progresso da timeline
            if (draggableInstance && !draggableInstance.isPressed && !draggableInstance.isDragging && !draggableInstance.isThrowing) {
                let totalProgress = this.totalProgress();
                gsap.set(proxy, { x: totalProgress * -segmentWidth });
            }
        }
    })
    .to(track, {
        x: `-=${segmentWidth}`, // Move o track para a esquerda pelo tamanho de um segmento
        modifiers: { // Usa modifiers para o efeito de loop infinito
            x: gsap.utils.unitize(value => xWrap(parseFloat(value)))
        }
    });

    gsap.set(proxy, { x: 0 }); // Garante que o proxy comece em 0
    loopTimeline.play(); // Inicia a animação da timeline

    let timelineInitialProgress = 0;
    let proxyElementInitialXAtDragStart = 0;
    let wasPlaying = true; // Para lembrar se a timeline estava tocando antes do arrasto

    function alignTimeline() {
        let currentProxyElementX = this.x; // 'this' é a instância do Draggable
        let dx = currentProxyElementX - proxyElementInitialXAtDragStart;
        let newProgress = timelineInitialProgress - (dx / segmentWidth);
        loopTimeline.progress(progressWrap(newProgress));
    }

    draggableInstance = Draggable.create(proxy, {
        type: 'x',
        trigger: container, // O container do marquee é o gatilho para o arrasto
        inertia: true, // Habilita a inércia
        allowNativeTouchScrolling: false, // Previne o scroll nativo durante o arrasto
        overshootTolerance: 0, // Sem overshoot
        cursor: "grab",
        activeCursor: "grabbing",
        inertia: { // Configurações de inércia
            x: {
                resistance: 200 // Quão rápido a inércia para
            }
        },

        onPressInit: function() {
            wasPlaying = !loopTimeline.paused(); // Verifica se a timeline estava tocando
            loopTimeline.pause(); // Pausa a timeline durante o arrasto

            timelineInitialProgress = loopTimeline.totalProgress(); // Pega o progresso total atual
            let currentUnwrappedX = timelineInitialProgress * -segmentWidth; // Calcula a posição x "desenrolada"
            gsap.set(proxy, {x: currentUnwrappedX}); // Define a posição do proxy para corresponder

            proxyElementInitialXAtDragStart = currentUnwrappedX; // Armazena a posição inicial do proxy

            this.startX = currentUnwrappedX; // Define o startX do Draggable
            this.update(true); // Força a atualização do Draggable

            // console.log(`onPressInit: tlTotalProg=${timelineInitialProgress.toFixed(4)}, proxy.x set to ${gsap.getProperty(proxy, "x").toFixed(1)}, drag.startX=${this.startX.toFixed(1)}`);
        },
        onDrag: alignTimeline,
        onThrowUpdate: alignTimeline, // Sincroniza a timeline durante a inércia

        onRelease: function() {
            // console.log(`onRelease: isThrowing=${this.isThrowing}, proxy.x=${gsap.getProperty(proxy, "x").toFixed(1)}`);
            if (!this.isThrowing && wasPlaying) { // Se não estiver em inércia e estava tocando antes
                loopTimeline.play(); // Retoma a timeline
            }
        },
        onThrowComplete: function() {
            // console.log("onThrowComplete - Final proxy.x:", gsap.getProperty(proxy, "x").toFixed(1));
            if (wasPlaying) { // Se estava tocando antes
                loopTimeline.play(); // Retoma a timeline
            }
            // Suaviza a volta para a velocidade normal da timeline
            gsap.to(loopTimeline, { timeScale: 1, duration: 0.01, ease: "power2.inOut" });
        }
    })[0]; // Draggable.create retorna um array, pegamos o primeiro elemento
}

export function setupTestimonialSlider() {
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
        const testimonial = testimonials[index];

        // Animação de saída
        gsap.to([nameEl, titleEl], {
            opacity: 0,
            duration: 0.3,
            ease: "expo.in"
        });

        gsap.to([imageEl], {
            opacity: 0,
            scale: 0, // Animação de escala para a imagem
            duration: 0.3,
            ease: "expo.in"
        });

        // Animação específica para quoteTitleEl e textEl (movimento)
        gsap.to([quoteTitleEl, textEl], {
            x: direction === 'next' ? -30 : 30, // Move para a esquerda ou direita
            opacity: 0,
            duration: 0.4, // Duração um pouco maior para o texto
            ease: "expo.in",

            onComplete: () => {
                // Atualiza o conteúdo
                imageEl.src = testimonial.image;
                imageEl.alt = `Foto de ${testimonial.name}`;
                nameEl.textContent = testimonial.name;
                titleEl.textContent = testimonial.title;
                quoteTitleEl.textContent = testimonial.quoteTitle;
                textEl.textContent = testimonial.text;

                // Prepara para animação de entrada (posiciona os elementos à direita/esquerda)
                gsap.set([quoteTitleEl, textEl], {
                    x: direction === 'next' ? 30 : -30, // Posição inicial oposta para entrada
                    opacity: 0
                });

                // Anima os elementos estáticos (imagem, nome, título)
                gsap.to([nameEl, titleEl], {
                    opacity: 1,
                    duration: 0.7, // Duração da entrada
                    ease: "expo.out",
                });

                gsap.to([imageEl], {
                    opacity: 1,
                    scale: 1, // Retorna ao tamanho normal
                    duration: 0.7, // Duração da entrada
                    ease: "expo.out",
                });


                // Anima os elementos com movimento (título da citação e texto)
                gsap.to([quoteTitleEl], {
                    x: 0, // Retorna à posição original
                    opacity: 1,
                    duration: 0.7,
                    ease: "expo.out",
                    delay: 0.1 // Pequeno atraso para efeito escalonado
                });
                gsap.to([textEl], {
                    x: 0, // Retorna à posição original
                    opacity: 1,
                    duration: 0.7,
                    ease: "expo.out",
                    delay: 0.25 // Atraso um pouco maior para o texto
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

    // Exibe o primeiro depoimento
    if (testimonials.length > 0) {
        displayTestimonial(currentTestimonialIndex);
    }
}

export function setupSVGAnimation() {
    // Seleciona os elementos
    const section3 = document.getElementById('section-3');
    const svgContainer = document.querySelector('.svg-container');

    if (!section3 || !svgContainer) {
        console.error("Elementos para setupSVGAnimation não encontrados!");
        return;
    }

    // Remove position: fixed do CSS e aplica via JS para controle pelo ScrollTrigger
    gsap.set(svgContainer, {
        position: 'absolute', // Mudado de fixed para absolute para ser pinado corretamente
        right: '-2%', // Ajuste conforme necessário
        xPercent: 100, // Ajuste para alinhar corretamente
        yPercent: -48, // Ajuste vertical
        width: '300px', // Largura do container
        zIndex: 3 // Para sobrepor outros elementos se necessário
    });

    // Configuração inicial dos SVGs
    const svgs = gsap.utils.toArray('.icon-halo:not(.svg6)'); // Todos exceto o último
    const spacing = 75; // Espaçamento vertical entre SVGs

    gsap.set(svgs, {
        y: (i) => -(spacing * (svgs.length - i)), // Empilhados para cima, o último (índice 0) mais acima
        xPercent: -50 // Centraliza horizontalmente
    });

    gsap.set('.svg6', { // O último SVG (svg6) começa na posição final
        y: 0,
        xPercent: -50
    });

    // Cria um pin para o container dos SVGs
    // O pin fará com que o svgContainer fique fixo enquanto a section3 rola
    ScrollTrigger.create({
        trigger: section3,
        start: "top top", // Começa a pinar quando o topo da section3 atinge o topo da viewport
        end: "bottom bottom", // Termina de pinar quando o final da section3 atinge o final da viewport
        pin: svgContainer,
        pinSpacing: false // Não adiciona padding extra ao elemento pai
    });

    // Animação com ScrollTrigger para mover os SVGs
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section3,
            start: "top 30%", // Começa a animação quando o topo da section3 está a 30% da viewport
            end: "bottom 80%", // Termina a animação quando o final da section3 está a 80% da viewport
            scrub: 1, // Animação suave vinculada ao scroll
            // markers: true // Ativar para debug se necessário
        }
    });

    // Animação em cascata para cada SVG descer para a posição y: 0
    // O último SVG (svgs[4] se houver 5 além do svg6) é o primeiro a se mover
    tl.to(svgs[4], { y: 0, duration: 0.8, ease: "power2.inOut" })
      .to(svgs[3], { y: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.45") // Sobreposição para efeito mais suave
      .to(svgs[2], { y: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.45")
      .to(svgs[1], { y: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.45")
      .to(svgs[0], { y: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.45");

    // Atualiza o ScrollTrigger após um pequeno atraso para garantir que tudo esteja carregado
    gsap.delayedCall(0.5, () => ScrollTrigger.refresh());
}
