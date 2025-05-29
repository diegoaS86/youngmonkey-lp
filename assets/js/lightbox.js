// assets/js/lightbox.js

/**
 * Initializes the contact lightbox functionality, including opening, closing,
 * the FAQ accordion, and the backdrop.
 * @param {object} gsapInstance - The GSAP instance.
 * @param {object} smootherInstance - The ScrollSmoother instance (optional).
 */
function initializeLightbox(gsapInstance, smootherInstance) {
    const contactBtnDesktop = document.getElementById('contactBtn');
    const lightbox = document.getElementById('contactLightbox');
    const closeBtn = document.getElementById('closeLightboxBtn');
    const body = document.body;
    const smoother = smootherInstance;
    const backdrop = document.getElementById('lightboxBackdrop'); // Novo elemento

    if (!lightbox || !closeBtn || !backdrop) { // Adicionado backdrop à verificação
        console.warn("Lightbox: Elementos essenciais (contactLightbox, closeLightboxBtn ou lightboxBackdrop) não encontrados.");
        return;
    }
    if (!contactBtnDesktop) {
        console.warn("Lightbox: Botão de contato principal (contactBtn) não encontrado.");
    }

    // --- Lightbox Open/Close Logic ---
    const openLightbox = (e) => {
        if (e) e.preventDefault();
        console.log("Abrindo Lightbox (CSS method)...");

        if (smoother) smoother.paused(true);
        body.classList.add('lightbox-open');

        backdrop.classList.add('visible'); // Mostra o backdrop
        lightbox.classList.add('open');
        closeBtn.classList.add('visible');
    };

    const closeLightbox = () => {
        console.log("Fechando Lightbox (CSS method)...");
        lightbox.classList.remove('open');
        closeBtn.classList.remove('visible');
        backdrop.classList.remove('visible'); // Esconde o backdrop

        setTimeout(() => {
            if (smoother) smoother.paused(false);
            body.classList.remove('lightbox-open');
        }, 600); // Sync with CSS transition duration (0.6s para lightbox, 0.5s para backdrop)
    };

    if (contactBtnDesktop) {
        contactBtnDesktop.addEventListener('click', openLightbox);
    }
    closeBtn.addEventListener('click', closeLightbox);

    // Fechar ao clicar no backdrop (opcional, mas comum)
    backdrop.addEventListener('click', closeLightbox);


    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && lightbox.classList.contains('open')) {
            closeLightbox();
        }
    });

    // --- FAQ Accordion Logic ---
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0 && typeof gsapInstance !== 'undefined') {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');

            gsapInstance.set(answer, { height: 0, autoAlpha: 0 });

 question.addEventListener('click', () => {
            const wasActive = item.classList.contains('active'); // Renomeado para clareza
            console.log(`Item "${question.textContent.trim()}" clicado. Estava ativo? ${wasActive}`);

            // Fecha todos os outros itens abertos
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    console.log(`Fechando outro item: "${otherItem.querySelector('.faq-question').textContent.trim()}"`);
                    otherItem.classList.remove('active');
                    gsapInstance.to(otherItem.querySelector('.faq-answer'), {
                        height: 0,
                        autoAlpha: 0,
                        duration: 0.4,
                        ease: "power1.inOut",
                        overwrite: true // Adiciona overwrite para garantir que esta animação tenha prioridade
                    });
                }
            });

            // Abre ou fecha o item clicado
            if (wasActive) { // Se estava ativo, fecha
                console.log(`Fechando item atual: "${question.textContent.trim()}"`);
                item.classList.remove('active');
                gsapInstance.to(answer, {
                    height: 0,
                    autoAlpha: 0,
                    duration: 0.4,
                    ease: "power1.inOut",
                    overwrite: true
                });
            } else { // Se não estava ativo, abre
                console.log(`Abrindo item atual: "${question.textContent.trim()}"`);
                item.classList.add('active');

                gsapInstance.set(answer, { autoAlpha: 1, height: 'auto', display: 'block' });
                const height = answer.scrollHeight;
                console.log(`Altura calculada para abrir: ${height}px`);
                gsapInstance.set(answer, { height: 0, autoAlpha: 0 }); // Reset antes de animar

                gsapInstance.to(answer, {
                    height: height,
                    autoAlpha: 1,
                    duration: 0.5,
                    ease: "expo.out",
                    overwrite: true, // Importante
                    onComplete: () => {
                        console.log(`Animação de abertura completa para: "${question.textContent.trim()}". Está ativo? ${item.classList.contains('active')}`);
                        if (item.classList.contains('active')) {
                            gsapInstance.set(answer, { height: 'auto' });
                            console.log(`Altura definida para "auto" para: "${question.textContent.trim()}"`);
                        }
                    }
                });
            }
        });
        });
    } else if (faqItems.length > 0 && typeof gsapInstance === 'undefined') {
        console.warn("GSAP não está definido. FAQ Acordeão não terá animações GSAP e usará fallback CSS.");
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            if(question && answer){
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
    console.log("Lightbox Initialized (with FAQ and Backdrop if present)");
}