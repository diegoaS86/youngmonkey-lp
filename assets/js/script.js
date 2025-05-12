
 document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(MotionPathPlugin,Observer,ScrambleTextPlugin,ScrollTrigger,ScrollSmoother,ScrollToPlugin,TextPlugin)
  // gsap code here!
 });
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Elementos DOM com verificações de null
    const hamburger = document.getElementById('hamburger');
    const navBox = document.getElementById('navBox');
    const contactBtn = document.getElementById('contactBtn');
    const contactModal = document.getElementById('contactModal');
    const closeModal = document.getElementById('closeModal');
    const header = document.getElementById('mainHeader');
    const menu = document.getElementById('menu');

    // Verifica se os elementos essenciais existem
    if (!header) {
      console.error('Elemento header não encontrado');
      return;
    }

    const headerHeight = header.offsetHeight;

    // Inicializa ScrollSmoother apenas se os elementos necessários existirem
    if (typeof ScrollSmoother !== 'undefined') {
      const smoother = ScrollSmoother.create({
        smooth: 1.2,
        effects: true,
        smoothTouch: 0.1,
      });

      // Configura ScrollTrigger para o header
      let lastScroll = 0;
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const currentScroll = self.scroll();
          
          if (currentScroll > lastScroll && currentScroll > headerHeight) {
            header.classList.add('hide');
          } else if (currentScroll < lastScroll || currentScroll <= headerHeight) {
            header.classList.remove('hide');
          }
          
          lastScroll = currentScroll;
        }
      });
    } else {
      console.warn('GSAP ScrollSmoother não carregado');
    }

    // Hamburguer Menu (só adiciona listener se o elemento existir)
    if (hamburger && navBox && menu) {
      hamburger.addEventListener('click', () => {
        navBox.classList.toggle('expanded');
        
        gsap.to(menu, {
          opacity: navBox.classList.contains('expanded') ? 1 : 0,
          visibility: navBox.classList.contains('expanded') ? 'visible' : 'hidden',
          duration: 0.3,
          ease: "power2.inOut"
        });
      });
    }

    // Botão de Contato (só adiciona listener se o elemento existir)
    if (contactBtn && contactModal) {
      contactBtn.addEventListener('click', (e) => {
        e.preventDefault();
        contactBtn.classList.add('clicked');
        contactModal.classList.add('show');
        
        gsap.from(contactModal, {
          opacity: 0,
          y: 20,
          duration: 0.4,
          ease: "back.out(1.7)"
        });
      });
    }

    // Fechar Modal (só adiciona listener se o elemento existir)
    if (closeModal && contactModal && contactBtn) {
      closeModal.addEventListener('click', () => {
        contactModal.classList.remove('show');
        contactBtn.classList.remove('clicked');
        
        gsap.to(contactModal, {
          opacity: 0,
          y: 20,
          duration: 0.3,
          onComplete: () => contactModal.classList.remove('show')
        });
      });
    }

    // Efeito hover nos links do menu
    const menuLinks = document.querySelectorAll('.menu-nav a, .menu-social a, .menu-lang a');
    if (menuLinks.length > 0) {
      menuLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
          gsap.to(link, {
            x: 5,
            color: '#23FC94',
            duration: 0.3
          });
        });
        
        link.addEventListener('mouseleave', () => {
          gsap.to(link, {
            x: 0,
            color: '#E6FFF3',
            duration: 0.3
          });
        });
      });
    }

  } catch (error) {
    console.error('Erro no script:', error);
  }
});

// Verifica se GSAP está carregado antes de executar
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && typeof ScrollSmoother !== 'undefined') {
  // Script principal já está dentro do DOMContentLoaded
} else {
  console.error('GSAP não foi carregado corretamente');
}
