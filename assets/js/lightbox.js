import { gsap } from "gsap";

const toggleClasses = (els, classes, action = 'add') => {
    els.forEach(el => el && el.classList[action](...classes));
};

export function initializeLightbox(gsapInstance = gsap, smootherInstance) {
    console.log("Lightbox: Initializing...");
    const contactBtnDesktop = document.getElementById('contactBtn'),
          contactBtnMobile = document.getElementById('contactBtnMobile'),
          lightbox = document.getElementById('contactLightbox'),
          closeBtn = document.getElementById('closeLightboxBtn'),
          backdrop = document.getElementById('lightboxBackdrop'),
          body = document.body;
    
    if (!lightbox || !closeBtn || !backdrop || !body) {
        console.error("Lightbox: Essential elements not found. Lightbox will not function.");
        return;
    }
    if (!contactBtnDesktop) console.warn("Lightbox: Desktop contact button not found.");
    if (!contactBtnMobile) console.warn("Lightbox: Mobile contact button not found.");

    const openLightbox = (e) => {
        e?.preventDefault();
        if (smootherInstance?.paused) smootherInstance.paused(true);
        toggleClasses([body], ['lightbox-open']);
        toggleClasses([backdrop, lightbox, closeBtn], ['visible', 'open']);
    };

    const closeLightbox = () => {
        toggleClasses([lightbox, closeBtn, backdrop], ['open', 'visible'], 'remove');
        setTimeout(() => {
            if (smootherInstance?.paused) smootherInstance.paused(false);
            body.classList.remove('lightbox-open');
        }, 600);
    };

    [contactBtnDesktop, contactBtnMobile].forEach(btn => btn?.addEventListener('click', openLightbox));
    [closeBtn, backdrop].forEach(el => el.addEventListener('click', closeLightbox));
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && lightbox.classList.contains('open')) closeLightbox();
    });

    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length) {
        if (gsapInstance && typeof gsapInstance.set === 'function' && typeof gsapInstance.to === 'function') {
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question'),
                      answer = item.querySelector('.faq-answer');
                if (!question || !answer) return console.warn("Lightbox FAQ: Missing question or answer.", item);
                gsapInstance.set(answer, { height: 0, autoAlpha: 0 });
                question.addEventListener('click', () => {
                    const wasActive = item.classList.contains('active');
                    faqItems.forEach(other => {
                        if (other !== item && other.classList.contains('active')) {
                            other.classList.remove('active');
                            gsapInstance.to(other.querySelector('.faq-answer'), {
                                height: 0, autoAlpha: 0, duration: 0.4, ease: "power1.inOut", overwrite: true
                            });
                        }
                    });
                    if (wasActive) {
                        item.classList.remove('active');
                        gsapInstance.to(answer, { height: 0, autoAlpha: 0, duration: 0.4, ease: "power1.inOut", overwrite: true });
                    } else {
                        item.classList.add('active');
                        gsapInstance.set(answer, { autoAlpha: 1, height: 'auto', display: 'block' });
                        const fullHeight = answer.scrollHeight;
                        gsapInstance.set(answer, { height: 0, autoAlpha: 0 });
                        gsapInstance.to(answer, {
                            height: fullHeight, autoAlpha: 1, duration: 0.5, ease: "expo.out", overwrite: true,
                            onComplete: () => item.classList.contains('active') && gsapInstance.set(answer, { height: 'auto' })
                        });
                    }
                });
            });
        } else {
            console.warn("Lightbox: GSAP not configured properly. Using CSS fallback for FAQ.");
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question'),
                      answer = item.querySelector('.faq-answer');
                if (question && answer) {
                    Object.assign(answer.style, {
                        overflow: 'hidden',
                        maxHeight: '0',
                        transition: 'max-height 0.35s ease-out'
                    });
                    question.addEventListener('click', () => {
                        const isActive = item.classList.toggle('active');
                        faqItems.forEach(other => {
                            if (other !== item && other.classList.contains('active')) {
                                other.classList.remove('active');
                                other.querySelector('.faq-answer').style.maxHeight = '0';
                            }
                        });
                        answer.style.maxHeight = isActive ? `${answer.scrollHeight}px` : '0';
                    });
                }
            });
        }
    }
    console.log("Lightbox: Initialization complete.");
}