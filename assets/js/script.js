// assets/js/script.js (Orquestrador Principal) - VERSÃO CORRIGIDA COM LÓGICA DE EVENTOS

import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Observer } from "gsap/Observer";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { TextPlugin } from "gsap/TextPlugin";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

import { initializeI18n } from './i18n.js';
import { initializeSvgLoader } from './svgLoader.js';
import { initializeLightbox } from './lightbox.js';
import { initializeHeaderAnimation } from './header.js';
import { initializeHeroSection } from './hero.js';
import { initializeSection1 } from './section-1.js';
import { initializeServicesSection } from './services.js';
import { setupLogoMarqueeWithGSAP, setupTestimonialSlider, setupSVGAnimation } from './testimonial.js';
import { initializeShowcase } from './showcase.js';
import { initializeFooterSection } from './footer.js';

let smoother;

document.addEventListener('DOMContentLoaded', () => {

  setViewportHeight();
  window.addEventListener('resize', setViewportHeight);
  setupAllContactForms();
  initializeQualificationFlow();

  document.addEventListener('translationsReady', () => {
    initializeVisualComponents();
    document.dispatchEvent(new Event('mainContentLoaded')); // Avisa ao preloader que tudo está pronto
  }, { once: true }); // O listener só executa uma vez

  // 1. Inicia o preloader e a lógica de tradução
  initializePreloader();
  initializeI18n(); // Esta função agora é síncrona e vai disparar o evento acima
});

// Esta nova função agrupa todos os scripts que precisam que o DOM tenha textos
function initializeVisualComponents() {
  gsap.registerPlugin(
    MotionPathPlugin, Observer, ScrambleTextPlugin, ScrollTrigger, DrawSVGPlugin,
    ScrollSmoother, ScrollToPlugin, TextPlugin, Draggable, InertiaPlugin
  );
  ScrollTrigger.config({ ignoreMobileResize: true });

  const smoothWrapper = document.getElementById('smooth-wrapper');
  if (smoothWrapper) {
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.2,
      effects: true,
      smoothTouch: 0.1,
      invalidateOnRefresh: true
    });
  }

  initializeSvgLoader();
  initializeLightbox(gsap, smoother);
  initializeHeaderAnimation(gsap, ScrollTrigger, smoother);
  initializeHeroSection(gsap, ScrollTrigger, smoother);
  initializeSection1(gsap, ScrollTrigger);
  initializeServicesSection(gsap, ScrollTrigger);

  if (document.getElementById('section-3')) {
    setupLogoMarqueeWithGSAP();
    setupTestimonialSlider();
    setupSVGAnimation();
  }

  initializeShowcase(gsap, Observer, smoother);

  initializeFooterSection(gsap, ScrollTrigger);

  setupMenu(smoother);
  setupMenuHoverEffects();
  setupPerformanceControls();
  setupMobileContactButton();
}

function initializePreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) {
    gsap.set("#smooth-content", { autoAlpha: 1 });
    return;
  }
  const minTime = 4000;
  const fadeTime = 900;
  let contentReady = false;
  let minTimePassed = false;

  const tryHide = () => {
    if (contentReady && minTimePassed) {
      gsap.to("#smooth-content", { autoAlpha: 1, duration: 0.8, delay: 0.2 });
      preloader.classList.add('loaded');
      setTimeout(() => preloader.style.display = 'none', fadeTime);
    }
  };

  document.addEventListener('mainContentLoaded', () => {
    contentReady = true;
    tryHide();
  }, { once: true });

  setTimeout(() => {
    minTimePassed = true;
    tryHide();
  }, minTime);
}


// --- Funções Utilitárias (permanecem iguais) ---

function setViewportHeight() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}

function setupMenu(smoother) {
  const hamburger = document.getElementById('hamburger'),
    navBox = document.getElementById('navBox'),
    menuLinks = document.querySelectorAll('.menu .menu-nav a');
  if (!hamburger || !navBox) return;
  hamburger.addEventListener('click', () => navBox.classList.toggle('expanded'));
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('href');
      if (target?.startsWith('#')) {
        e.preventDefault();
        smoother?.scrollTo
          ? smoother.scrollTo(target, true, "top top")
          : document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
        navBox.classList.remove('expanded');
      }
    });
  });
}

function setupMenuHoverEffects() {
  const links = document.querySelectorAll('.menu-nav a, .menu-social a, .menu-lang a');
  links.forEach(link => {
    link.addEventListener('mouseenter', () => gsap.to(link, { x: 5, color: 'var(--accent-color)', duration: 0.3 }));
    link.addEventListener('mouseleave', () => gsap.to(link, { x: 0, color: 'var(--light-color)', duration: 0.3 }));
  });
}

function setupPerformanceControls() {
  document.addEventListener('visibilitychange', () => {
    gsap.globalTimeline[document.hidden ? 'pause' : 'resume']();
  });
}

function setupMobileContactButton() {
  const btnMobile = document.getElementById('contactBtnMobile');
  const triggerSection = document.getElementById('section-1');
  if (btnMobile && triggerSection) {
    ScrollTrigger.create({
      trigger: triggerSection,
      start: "top 80%",
      end: "max",
      toggleClass: { targets: btnMobile, className: "is-visible" }
    });
  }
}

function initializeQualificationFlow() {
  // Elementos do DOM
  const backdrop = document.getElementById('qualificationBackdrop');
  const qualifyPopup = document.getElementById('qualifyPopup');
  const multiStepPopup = document.getElementById('multiStepFormPopup');
  const qualifyYesBtn = document.getElementById('qualifyYes');
  const qualifyNoBtn = document.getElementById('qualifyNo');

  const multiStepForm = document.getElementById('qualificationForm');
  const steps = [...multiStepForm.querySelectorAll('.form-step')];
  const nextBtn = document.getElementById('multiStepNextBtn');
  const prevBtn = document.getElementById('multiStepPrevBtn');
  const submitBtn = document.getElementById('multiStepSubmitBtn');
  const progressBar = document.getElementById('multiStepProgressBar');

  // Formulários originais
  const contactForm = document.getElementById('contactForm');
  const lightboxForm = document.getElementById('lightboxContactForm');

  let currentStep = 0;
  let originalFormData = null; // Armazena os dados do formulário original

  // Função para mostrar/esconder os pop-ups
  const showPopup = (popup, show = true) => {
    if (show) {
      backdrop.classList.add('show');
      popup.classList.add('show');
    } else {
      popup.classList.remove('show');
      // Esconde o backdrop apenas se nenhum outro popup estiver ativo
      if (!qualifyPopup.classList.contains('show') && !multiStepPopup.classList.contains('show')) {
        backdrop.classList.remove('show');
      }
    }
  };

  // Intercepta o envio dos formulários originais
  const handleOriginalFormSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    // Validação simples
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    originalFormData = new FormData(form);
    showPopup(qualifyPopup);
  };

  contactForm?.addEventListener('submit', handleOriginalFormSubmit);
  lightboxForm?.addEventListener('submit', handleOriginalFormSubmit);

  // Lógica dos botões Sim/Não
  qualifyNoBtn?.addEventListener('click', () => {
    showPopup(qualifyPopup, false);
    sendCombinedData(originalFormData); // Envia apenas os dados originais
  });

  qualifyYesBtn?.addEventListener('click', () => {
    showPopup(qualifyPopup, false);
    showPopup(multiStepPopup);
    updateStepDisplay();
  });

  // Lógica do formulário multi-etapas
  const updateStepDisplay = () => {
    steps.forEach((step, index) => {
      step.classList.toggle('active', index === currentStep);
    });

    const progress = ((currentStep + 1) / steps.length) * 100;
    progressBar.style.width = `${progress}%`;

    prevBtn.style.display = currentStep > 0 ? 'inline-block' : 'none';
    nextBtn.style.display = currentStep < steps.length - 1 ? 'inline-block' : 'none';
    submitBtn.style.display = currentStep === steps.length - 1 ? 'inline-block' : 'none';
  };

  nextBtn?.addEventListener('click', () => {
    const currentStepInputs = steps[currentStep].querySelectorAll('input[type="radio"]');
    const isChecked = [...currentStepInputs].some(input => input.checked);

    if (!isChecked) {
      const feedbackDiv = document.getElementById('qualificationFeedbackMessage');
      feedbackDiv.textContent = "Por favor, selecione uma opção.";
      feedbackDiv.className = 'form-message error show';
      setTimeout(() => feedbackDiv.classList.remove('show'), 3000);
      return;
    }

    if (currentStep < steps.length - 1) {
      currentStep++;
      updateStepDisplay();
    }
  });

  prevBtn?.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      updateStepDisplay();
    }
  });

  submitBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const currentStepInputs = steps[currentStep].querySelectorAll('input[type="radio"]');
    const isChecked = [...currentStepInputs].some(input => input.checked);

    if (!isChecked) {
      const feedbackDiv = document.getElementById('qualificationFeedbackMessage');
      feedbackDiv.textContent = "Por favor, selecione uma opção.";
      feedbackDiv.className = 'form-message error show';
      setTimeout(() => feedbackDiv.classList.remove('show'), 3000);
      return;
    }

    const qualificationData = new FormData(multiStepForm);

    // Combina os dados
    for (const [key, value] of qualificationData.entries()) {
      originalFormData.append(key, value);
    }

    sendCombinedData(originalFormData);
  });

  // Função centralizada para enviar os dados
  const sendCombinedData = (formData) => {
    // Usa o feedback do formulário de qualificação se estiver aberto, senão, o do rodapé
    const feedbackDiv = multiStepPopup.classList.contains('show')
      ? document.getElementById('qualificationFeedbackMessage')
      : document.getElementById('footerFeedbackMessage') || document.getElementById('lightboxFeedbackMessage');

    const submitButton = multiStepPopup.classList.contains('show') ? submitBtn : document.querySelector('#contactForm button[type="submit"]');

    feedbackDiv.textContent = 'Enviando...';
    feedbackDiv.className = 'form-message sending show';
    if (submitButton) submitButton.disabled = true;

    fetch('php/processForm.php', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        feedbackDiv.textContent = data.message;
        feedbackDiv.className = `form-message ${data.status} show`;

        if (data.status === 'success') {
          setTimeout(() => {
            showPopup(multiStepPopup, false);
            // Resetar formulários se necessário
            contactForm?.reset();
            lightboxForm?.reset();
            multiStepForm?.reset();
            currentStep = 0;
            updateStepDisplay();
          }, 2000);
        }
      })
      .catch(error => {
        console.error('Erro no envio:', error);
        feedbackDiv.textContent = 'Ocorreu um erro. Tente novamente.';
        feedbackDiv.className = 'form-message error show';
      })
      .finally(() => {
        if (submitButton) submitButton.disabled = false;
        // Não esconde a mensagem imediatamente para o usuário ler.
      });
  };
}

function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  const formAction = form.getAttribute('action');
  const messageDiv = form.id === 'contactForm'
    ? document.getElementById('footerFeedbackMessage')
    : document.getElementById('lightboxFeedbackMessage');
  if (!messageDiv || !submitBtn) return;

  submitBtn.disabled = true;
  messageDiv.textContent = 'Enviando...';
  messageDiv.className = 'form-message sending show';

  fetch(formAction, { method: 'POST', body: formData })
    .then(resp => resp.json())
    .then(data => {
      messageDiv.textContent = data.message;
      messageDiv.className = `form-message ${data.status} show`;
      if (data.status === 'success') form.reset();
    })
    .catch(err => {
      console.error('Form error:', err);
      messageDiv.textContent = 'Ocorreu um erro inesperado. Tente novamente.';
      messageDiv.className = 'form-message error show';
    })
    .finally(() => {
      submitBtn.disabled = false;
      setTimeout(() => messageDiv.classList.remove('show'), 5000);
    });
}

function setupAllContactForms() {
  document.getElementById('contactForm')?.addEventListener('submit', handleFormSubmit);
  document.getElementById('lightboxContactForm')?.addEventListener('submit', handleFormSubmit);
}
