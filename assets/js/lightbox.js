// assets/js/lightbox.js
import { gsap } from "gsap"; // GSAP é usado para a animação do FAQ

/**
 * Initializes the contact lightbox functionality, including opening, closing,
 * the FAQ accordion, and the backdrop.
 * @param {object} gsapInstanceFromScript - A instância GSAP passada de script.js (pode ser redundante se importado aqui)
 * @param {object} smootherInstance - The ScrollSmoother instance (optional).
 */
export function initializeLightbox(gsapInstanceFromScript, smootherInstance) {
    // Usa o gsap importado neste módulo, ou o passado como parâmetro se preferir consistência.
    // Para este exemplo, usaremos o 'gsap' importado no topo deste arquivo.
    // const gsapInstance = gsapInstanceFromScript || gsap; // Opção

    console.log("Lightbox: Initializing...");

    const contactBtnDesktop = document.getElementById('contactBtn');
    const contactBtnMobile = document.getElementById('contactBtnMobile');
    const lightbox = document.getElementById('contactLightbox');
    const closeBtn = document.getElementById('closeLightboxBtn');
    const body = document.body;
    const smoother = smootherInstance; // smootherInstance é específico e precisa ser passado
    const backdrop = document.getElementById('lightboxBackdrop');

    if (!lightbox || !closeBtn || !backdrop || !body) {
        console.error("Lightbox: Elementos essenciais (lightbox, closeBtn, backdrop ou body) não encontrados. Lightbox não funcionará.");
        return;
    }

    if (!contactBtnDesktop) {
        console.warn("Lightbox: Botão de contato desktop (contactBtn) não encontrado.");
    }
    if (!contactBtnMobile) {
        console.warn("Lightbox: Botão de contato mobile (contactBtnMobile) não encontrado.");
    }

    const openLightbox = (event) => {
        if (event && typeof event.preventDefault === 'function') {
            const sourceId = event.currentTarget ? event.currentTarget.id : "unknown source";
            // console.log(`Lightbox: openLightbox chamada por evento de: ${sourceId}`);
            event.preventDefault();
        } else {
            // console.log("Lightbox: openLightbox chamada diretamente.");
        }

        if (smoother && typeof smoother.paused === 'function') {
            smoother.paused(true);
        }

        body.classList.add('lightbox-open');
        backdrop.classList.add('visible');
        lightbox.classList.add('open');
        closeBtn.classList.add('visible');
        // console.log("Lightbox: Aberto.");
    };

    const closeLightbox = () => {
        // console.log("Lightbox: closeLightbox chamada.");
        lightbox.classList.remove('open');
        closeBtn.classList.remove('visible');
        backdrop.classList.remove('visible');

        setTimeout(() => {
            if (smoother && typeof smoother.paused === 'function') {
                smoother.paused(false);
            }
            body.classList.remove('lightbox-open');
            // console.log("Lightbox: Fechado.");
        }, 600); // Duração da transição CSS
    };

    if (contactBtnDesktop) {
        contactBtnDesktop.addEventListener('click', openLightbox);
    }

    if (contactBtnMobile) {
        contactBtnMobile.addEventListener('click', (event) => {
            // console.log("Lightbox: Botão de contato mobile CLICADO!");
            openLightbox(event);
        });
    }

    closeBtn.addEventListener('click', closeLightbox);
    backdrop.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && lightbox.classList.contains('open')) {
            closeLightbox();
        }
    });

    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        // Usa o 'gsap' importado no topo deste arquivo.
        if (typeof gsap !== 'undefined' && typeof gsap.set === 'function' && typeof gsap.to === 'function') {
            // console.log("Lightbox: Configurando FAQ com GSAP.");
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                const answer = item.querySelector('.faq-answer');

                if (!question || !answer) {
                    console.warn("Lightbox FAQ: Item de FAQ sem questão ou resposta.", item);
                    return;
                }

                gsap.set(answer, { height: 0, autoAlpha: 0 }); // Usa o gsap importado

                question.addEventListener('click', () => {
                    const wasActive = item.classList.contains('active');

                    faqItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('active')) {
                            otherItem.classList.remove('active');
                            gsap.to(otherItem.querySelector('.faq-answer'), { // Usa o gsap importado
                                height: 0,
                                autoAlpha: 0,
                                duration: 0.4,
                                ease: "power1.inOut",
                                overwrite: true
                            });
                        }
                    });

                    if (wasActive) {
                        item.classList.remove('active');
                        gsap.to(answer, { // Usa o gsap importado
                            height: 0,
                            autoAlpha: 0,
                            duration: 0.4,
                            ease: "power1.inOut",
                            overwrite: true
                        });
                    } else {
                        item.classList.add('active');
                        gsap.set(answer, { autoAlpha: 1, height: 'auto', display: 'block' }); // Usa o gsap importado
                        const height = answer.scrollHeight;
                        gsap.set(answer, { height: 0, autoAlpha: 0 }); // Usa o gsap importado
                        gsap.to(answer, { // Usa o gsap importado
                            height: height,
                            autoAlpha: 1,
                            duration: 0.5,
                            ease: "expo.out",
                            overwrite: true,
                            onComplete: () => {
                                if (item.classList.contains('active')) {
                                    gsap.set(answer, { height: 'auto' }); // Usa o gsap importado
                                }
                            }
                        });
                    }
                });
            });
        } else {
            console.warn("Lightbox: GSAP não está configurado corretamente para o FAQ (importação falhou?). Usando fallback CSS.");
            // Fallback CSS (como estava antes)
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                const answer = item.querySelector('.faq-answer');
                if (question && answer) {
                    answer.style.overflow = 'hidden';
                    answer.style.maxHeight = '0';
                    answer.style.transition = 'max-height 0.35s ease-out';

                    question.addEventListener('click', () => {
                        const isActive = item.classList.toggle('active');
                        faqItems.forEach(otherItem => {
                            if (otherItem !== item && otherItem.classList.contains('active')) {
                                otherItem.classList.remove('active');
                                otherItem.querySelector('.faq-answer').style.maxHeight = '0';
                            }
                        });
                        if (isActive) {
                            answer.style.maxHeight = answer.scrollHeight + "px";
                        } else {
                            answer.style.maxHeight = '0';
                        }
                    });
                }
            });
        }
    }
    console.log("Lightbox: Inicialização concluída.");
}
