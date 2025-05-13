document.addEventListener('DOMContentLoaded', () => {

    const header = document.getElementById('mainHeader');
    const hamburger = document.getElementById('hamburger');
    const navBox = document.getElementById('navBox');
    const menu = document.getElementById('menu');
    const contactBtn = document.getElementById('contactBtn');
    const contactModal = document.getElementById('contactModal');
    const closeModal = document.getElementById('closeModal');
    const menuLinks = document.querySelectorAll('.menu-nav a, .menu-social a, .menu-lang a');

    const line1 = document.getElementById('line1');
    const line2 = document.getElementById('line2');
    const line3 = document.getElementById('line3');
    const scrambleGroup = document.getElementById('scrambleGroup');
    const ctaDotsPattern = document.querySelector('.cta-dots-pattern');
    const dotsContainer = document.getElementById('dotsContainer');


    try {
        if (typeof gsap === 'undefined') {
            console.error('GSAP não foi carregado corretamente. Certifique-se de que os scripts estão incluídos no seu HTML.');
            return;
        }

        gsap.registerPlugin(
            MotionPathPlugin,
            Observer,
            ScrambleTextPlugin,
            ScrollTrigger,
            ScrollSmoother,
            ScrollToPlugin,
            TextPlugin
        );
        console.log("GSAP e plugins registrados com sucesso.");

    } catch (error) {
        console.error('Erro ao registrar plugins do GSAP:', error);
        return;
    }

    const wordSets = {
        line1: ["Design", "Videos", "Campaigns", "Content", "Reels", "Branding"],
        line2: ["solves", "sells", "speaks", "adds", "gets", "is"],
        line3: ["problem", "more", "loud", "value", "attention", "sexy"]
    };

    const setupScrollEffects = () => {
        if (!header) {
            console.warn("Elemento '#mainHeader' não encontrado. A função setupScrollEffects não funcionará.");
            return;
        }
        if (typeof ScrollTrigger === 'undefined') {
             console.warn("GSAP ScrollTrigger não definido. A função setupScrollEffects não funcionará.");
             return;
        }

        let smoother;
        if (typeof ScrollSmoother !== 'undefined') {
            try {
                 smoother = ScrollSmoother.create({
                    smooth: 1.2,
                    effects: true,
                    smoothTouch: 0.1,
                 });
                console.log("ScrollSmoother criado.");
            } catch (e) {
                console.error("Erro ao criar ScrollSmoother. Verifique a estrutura HTML e plugins carregados.", e);
            }
        }

        let lastSmoothedScroll = 0; // Rastreia a última posição de scroll suavizada

        ScrollTrigger.create({
            trigger: 'body',
            start: 0,
            end: "max",

            onUpdate: (self) => {
                // Use smoother.scrollTop() para a posição de scroll suavizada
                const currentSmoothedScroll = smoother ? smoother.scrollTop() : self.scroll();
                const headerHeight = header.offsetHeight;
                const velocity = self.getVelocity(); // Velocidade do scroll (pode ser útil)
                const scrollDifference = currentSmoothedScroll - lastSmoothedScroll; // Diferença de scroll suavizado
                const velocityThreshold = 5; // Limiar para considerar o scroll significativo

                // Lógica para esconder/mostrar o header
                // Esconde o header se estiver rolando para baixo (velocidade positiva OU scroll suavizado aumentando)
                // E a posição do scroll for maior que a altura do header
                if ((velocity > velocityThreshold || scrollDifference > 0) && currentSmoothedScroll > headerHeight) {
                    header.classList.add('hide');
                }
                // Mostra o header se estiver rolando para cima (velocidade negativa OU scroll suavizado diminuindo)
                // OU se a posição do scroll estiver no topo (garante que aparece no topo)
                else if ((velocity < -velocityThreshold || scrollDifference < 0) || currentSmoothedScroll <= headerHeight) {
                   header.classList.remove('hide');
                }

                // Atualiza a última posição de scroll suavizada
                lastSmoothedScroll = currentSmoothedScroll;
            }
        });
        console.log("ScrollTrigger para o header configurado.");
    };

    const setupMenu = () => {
        if (!hamburger || !navBox || !menu || typeof gsap === 'undefined') {
            console.warn("Elementos do menu hamburguer ou GSAP não encontrados/definidos. A função setupMenu não funcionará.");
            return;
        }

        hamburger.addEventListener('click', () => {
            navBox.classList.toggle('expanded');
            gsap.to(menu, {
                opacity: navBox.classList.contains('expanded') ? 1 : 0,
                visibility: navBox.classList.contains('expanded') ? 'visible' : 'hidden',
                duration: 0.3,
                ease: "power2.inOut"
            });
        });
         console.log("Menu hamburguer configurado.");
    };

    const setupContactModal = () => {
        if (!contactBtn || !contactModal || !closeModal || typeof gsap === 'undefined') {
             console.warn("Elementos do modal de contato ou GSAP não encontrados/definidos. A função setupContactModal não funcionará.");
             return;
        }

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

        closeModal.addEventListener('click', () => {
            gsap.to(contactModal, {
                opacity: 0,
                y: 20,
                duration: 0.3,
                onComplete: () => {
                   contactModal.classList.remove('show');
                   contactBtn.classList.remove('clicked');
                }
            });
        });
         console.log("Modal de contato configurado.");
    };

    const setupMenuHoverEffects = () => {
         if (!menuLinks || typeof gsap === 'undefined') {
              console.warn("Elementos dos links do menu ou GSAP não encontrados/definidos. A função setupMenuHoverEffects não funcionará.");
              return;
         }

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
         console.log("Efeitos hover do menu configurados.");
    };

    function animateScrambleText() {
        if (!line1 || !line2 || !line3 || typeof gsap === 'undefined') {
            console.warn('Elementos de texto para ScrambleText não encontrados ou GSAP não definido. A função animateScrambleText não funcionará.');
            return;
        }

        let counter = 0;

        function animate() {
            const word1 = wordSets.line1[counter % wordSets.line1.length];
            const word2 = wordSets.line2[counter % wordSets.line2.length];
            const word3 = wordSets.line3[counter % wordSets.line3.length];

            const groupIndex = counter % wordSets.line1.length;
            if (scrambleGroup) {
                for (let i = 0; i < wordSets.line1.length; i++) {
                    scrambleGroup.classList.remove(`group-${i}`);
                }
                scrambleGroup.classList.add(`group-${groupIndex}`);
            }

            const tl = gsap.timeline();

            tl.to(line1, {
                duration: 1.5,
                scrambleText: {
                    text: word1,
                    chars: "!<>-_\\/[]{}—=+*^?#____",
                    revealDelay: 0.3,
                    speed: 0.7
                },
                ease: "power3.out"
            }, 0);

            tl.to(line2, {
                duration: 1.5,
                scrambleText: {
                    text: word2,
                    chars: "!<>-_\\/[]{}—=+*^?#____",
                    revealDelay: 0.3,
                    speed: 0.7
                },
                ease: "power3.out"
            }, 0);

            tl.to(line3, {
                duration: 1.5,
                scrambleText: {
                    text: word3,
                    chars: "!<>-_\\/[]{}—=+*^?#____",
                    revealDelay: 0.3,
                    speed: 0.7
                },
                ease: "power3.out"
            }, 0);

            counter++;

            tl.call(() => {
              if (!tl.isActive()) {
                 setTimeout(animate, 3000);
              } else {
                  setTimeout(animate, 100);
              }
            }, null, tl.duration());

        }

        animate();
         console.log("Animação ScrambleText iniciada.");

         requestAnimationFrame(() => {
             if(line1) gsap.to(line1, { duration: 0.5, opacity: 1, delay: 0.1 });
             if(line2) gsap.to(line2, { duration: 0.5, opacity: 1, delay: 0.2 });
             if(line3) gsap.to(line3, { duration: 0.5, opacity: 1, delay: 0.3 });
         });
    }

    const setupPerformanceControls = () => {
        document.addEventListener('visibilitychange', () => {
            if (typeof gsap !== 'undefined' && gsap.globalTimeline) {
                gsap.globalTimeline[document.hidden ? 'pause' : 'resume']();
            }
        });

        const adjustForMobile = () => {
            if (typeof gsap !== 'undefined') {
                 gsap.defaults({ duration: window.innerWidth < 768 ? 1 : 1.5 });
            }
        };
        window.addEventListener('resize', adjustForMobile);
        adjustForMobile();
         console.log("Controles de performance configurados.");
    };

    const rows = 4;
    const cols = 12;

    if (dotsContainer) {
        for (let c = 0; c < cols; c++) {
            const col = document.createElement('div');
            col.className = 'dots-column';

            for (let r = 0; r < rows; r++) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                col.appendChild(dot);
            }

            dotsContainer.appendChild(col);
        }
         console.log(`${rows * cols} dots criados e adicionados ao container.`);

        if (typeof gsap !== 'undefined') {
            gsap.set(dotsContainer.querySelectorAll('.dot'), { opacity: 0.3, scale: 1 });
            console.log('Dots criados e estado inicial definido!');
        }

        if (typeof ScrollTrigger !== 'undefined') {
             ScrollTrigger.refresh();
             console.log('ScrollTrigger.refresh() chamado após adicionar dots.');
        }

    } else {
        console.error("Elemento '#dotsContainer' não encontrado no HTML. Os dots não serão criados.");
    }


    const setupDotsScroll = () => {
        if (typeof ScrollTrigger === 'undefined' || !dotsContainer || dotsContainer.children.length === 0) {
            console.warn("GSAP ScrollTrigger não definido ou dots não encontrados. A função setupDotsScroll não funcionará.");
            return;
        }

        const allDots = gsap.utils.toArray(dotsContainer.querySelectorAll(".dot"));
        const totalDots = allDots.length;
        let lastRandomizeScroll = 0;
        const scrollThreshold = 150;

        const randomizeDotOpacity = () => {
            gsap.to(allDots, {
                opacity: 0,
                scale: 1,
                boxShadow: 'none',
                duration: 0.1,
                ease: "power4.out"
            });

            const numToActivate = Math.floor(totalDots * (0.1 + Math.random() * 0.6));

            const shuffledDots = gsap.utils.shuffle(allDots.slice());

            const dotsToActivate = shuffledDots.slice(0, numToActivate);

            gsap.to(dotsToActivate, {
                opacity: 1,
                scale: 1.4,
                backgroundColor: '#23FC94',
                boxShadow: '0 0 10px #23FC94',
                duration: 0.1,
                ease: "power4.out",
                stagger: {
                    each: 0.1,
                    from: "random",
                    grid: "auto"
                }
            });
             console.log(`Randomizando dots: ${numToActivate} ativados.`);
        };

        ScrollTrigger.create({
            trigger: 'body',
            start: 0,
            end: "max",

            onUpdate: (self) => {
                const currentScroll = self.scroll();
                const scrolledDistance = Math.abs(currentScroll - lastRandomizeScroll);

                if (scrolledDistance >= scrollThreshold) {
                    randomizeDotOpacity();
                    lastRandomizeScroll = currentScroll;
                }
            }
        });

        randomizeDotOpacity();

        console.log("ScrollTrigger para randomização dos dots configurado.");
    };

    const setupCtaDotsAnimation = () => {
        if (!ctaDotsPattern || typeof gsap === 'undefined') {
            console.warn("Elemento '.cta-dots-pattern' ou GSAP não encontrados. A animação dos dots do CTA não funcionará.");
            return;
        }


        const patternClasses = [
            'pattern-1',
            'pattern-2',
            'pattern-3'
        ];
        let currentPatternIndex = 0;

        const tl = gsap.timeline({ repeat: -1 });

        tl.call(() => {
            ctaDotsPattern.className = 'cta-dots-pattern ' + patternClasses[currentPatternIndex];
            console.log("CTA Pattern:", patternClasses[currentPatternIndex]);
            currentPatternIndex = (currentPatternIndex + 1) % patternClasses.length;
        })
        .to({}, {
             duration: 1,
             onComplete: () => {
                 ctaDotsPattern.className = 'cta-dots-pattern ' + patternClasses[currentPatternIndex];
                 console.log("CTA Pattern:", patternClasses[currentPatternIndex]);
                 currentPatternIndex = (currentPatternIndex + 1) % patternClasses.length;
             }
        })
        .to({}, {
             duration: 1,
             onComplete: () => {
                 ctaDotsPattern.className = 'cta-dots-pattern ' + patternClasses[currentPatternIndex];
                 console.log("CTA Pattern:", patternClasses[currentPatternIndex]);
                 currentPatternIndex = (currentPatternIndex + 1) % patternClasses.length;
             }
        })
         .to({}, {
              duration: 1,
              onComplete: () => {
              }
         });


         console.log("Animação dos dots do CTA configurada.");
    };


    setupScrollEffects();
    setupMenu();
    setupContactModal();
    setupMenuHoverEffects();
    setupPerformanceControls();
    if (dotsContainer && dotsContainer.children.length > 0) {
        setupDotsScroll();
    } else {
        console.warn("setupDotsScroll não chamado pois o dotsContainer não foi encontrado ou está vazio.");
    }
    setupCtaDotsAnimation();


    if(line1 && line2 && line3) {
        animateScrambleText();
    } else {
        console.warn("Elementos para ScrambleText não encontrados. A animação não foi iniciada.");
    }

});
