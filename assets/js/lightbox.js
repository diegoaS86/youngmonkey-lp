// assets/js/lightbox.js

/**
 * Initializes the contact lightbox functionality, including opening, closing,
 * the FAQ accordion, and the backdrop.
 * @param {object} gsapInstance - The GSAP instance.
 * @param {object} smootherInstance - The ScrollSmoother instance (optional).
 */
function initializeLightbox(gsapInstance, smootherInstance) {
    console.log("Lightbox: Initializing...");

    const contactBtnDesktop = document.getElementById('contactBtn');
    const contactBtnMobile = document.getElementById('contactBtnMobile');
    const lightbox = document.getElementById('contactLightbox');
    const closeBtn = document.getElementById('closeLightboxBtn');
    const body = document.body;
    const smoother = smootherInstance;
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
            console.log(`Lightbox: openLightbox chamada por evento de: ${sourceId}`);
            event.preventDefault();
        } else {
            console.log("Lightbox: openLightbox chamada diretamente.");
        }

        if (smoother && typeof smoother.paused === 'function') {
            smoother.paused(true);
        }

        body.classList.add('lightbox-open');
        backdrop.classList.add('visible');
        lightbox.classList.add('open');
        closeBtn.classList.add('visible');
        console.log("Lightbox: Aberto.");
    };

    const closeLightbox = () => {
        console.log("Lightbox: closeLightbox chamada.");
        lightbox.classList.remove('open');
        closeBtn.classList.remove('visible');
        backdrop.classList.remove('visible');

        setTimeout(() => {
            if (smoother && typeof smoother.paused === 'function') {
                smoother.paused(false);
            }
            body.classList.remove('lightbox-open');
            console.log("Lightbox: Fechado.");
        }, 600);
    };

    if (contactBtnDesktop) {
        contactBtnDesktop.addEventListener('click', openLightbox);
    }

    if (contactBtnMobile) {
        contactBtnMobile.addEventListener('click', (event) => {
            console.log("Lightbox: Botão de contato mobile CLICADO!");
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
        // Verifica se gsapInstance é o objeto GSAP e se os métodos necessários existem
        if (gsapInstance && typeof gsapInstance.set === 'function' && typeof gsapInstance.to === 'function') {
            console.log("Lightbox: Configurando FAQ com GSAP.");
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                const answer = item.querySelector('.faq-answer');

                if (!question || !answer) {
                    console.warn("Lightbox FAQ: Item de FAQ sem questão ou resposta.", item);
                    return;
                }

                gsapInstance.set(answer, { height: 0, autoAlpha: 0 });

                question.addEventListener('click', () => {
                    const wasActive = item.classList.contains('active');

                    faqItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('active')) {
                            otherItem.classList.remove('active');
                            gsapInstance.to(otherItem.querySelector('.faq-answer'), {
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
                        gsapInstance.to(answer, {
                            height: 0,
                            autoAlpha: 0,
                            duration: 0.4,
                            ease: "power1.inOut",
                            overwrite: true
                        });
                    } else {
                        item.classList.add('active');
                        gsapInstance.set(answer, { autoAlpha: 1, height: 'auto', display: 'block' });
                        const height = answer.scrollHeight;
                        gsapInstance.set(answer, { height: 0, autoAlpha: 0 });
                        gsapInstance.to(answer, {
                            height: height,
                            autoAlpha: 1,
                            duration: 0.5,
                            ease: "expo.out",
                            overwrite: true,
                            onComplete: () => {
                                if (item.classList.contains('active')) {
                                    gsapInstance.set(answer, { height: 'auto' });
                                }
                            }
                        });
                    }
                });
            });
        } else {
            console.warn("Lightbox: GSAP não está configurado corretamente para o FAQ. Usando fallback CSS.");
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
