document.addEventListener("DOMContentLoaded", (event) => {
  try {
    // 1. Registrar plugins GSAP primeiro
    if (typeof gsap !== 'undefined') {
      gsap.registerPlugin(
        MotionPathPlugin, 
        Observer, 
        ScrambleTextPlugin, 
        ScrollTrigger, 
        ScrollSmoother, 
        ScrollToPlugin, 
        TextPlugin
      );
    } else {
      console.error('GSAP não foi carregado corretamente');
      return;
    }

    // 2. Elementos DOM
    const hamburger = document.getElementById('hamburger');
    const navBox = document.getElementById('navBox');
    const contactBtn = document.getElementById('contactBtn');
    const contactModal = document.getElementById('contactModal');
    const closeModal = document.getElementById('closeModal');
    const header = document.getElementById('mainHeader');
    const menu = document.getElementById('menu');

    // 3. Verificar elementos essenciais
    if (!header) {
      console.error('Elemento header não encontrado');
      return;
    }

    const headerHeight = header.offsetHeight;

    // 4. Inicializar ScrollSmoother
    let smoother;
    if (typeof ScrollSmoother !== 'undefined') {
      smoother = ScrollSmoother.create({
        smooth: 1.2,
        effects: true,
        smoothTouch: 0.1,
      });

      // 5. Configurar ScrollTrigger
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
    }

    // 6. Hamburguer Menu
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

    // 7. Botão de Contato
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

    // 8. Fechar Modal
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

    // 9. Efeitos hover
    const menuLinks = document.querySelectorAll('.menu-nav a, .menu-social a, .menu-lang a');
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

  } catch (error) {
    console.error('Erro no script:', error);
  }
});