// assets/js/header.js
// Não precisa de imports de GSAP aqui, pois recebe as instâncias como parâmetros.

export function initializeHeaderAnimation(gsapInstance, ScrollTriggerInstance, smootherInstance) {
    const header = document.getElementById('mainHeader');
    if (!header) {
        console.warn("Header element #mainHeader not found.");
        return;
    }

    let headerVisible = true;
    const headerHeight = header.offsetHeight;
    const smallScrollThreshold = 0; // Usado para definir quando mostrar/esconder o header
    // Parâmetros padrão para animação
    const animationOptions = { duration: 0.4, ease: "power2.inOut" };

    gsapInstance.set(header, { y: 0 });

    // Função helper para atualizar a visibilidade do header
    const animateHeaderVisibility = (visible) => {
        const targetY = visible ? 0 : -headerHeight;
        gsapInstance.to(header, { y: targetY, ...animationOptions });
        headerVisible = visible;
    };

    // Função helper para atualizar o header com base no scroll atual e direção
    const updateHeaderVisibility = (currentScrollY, scrollDirection) => {
        if (scrollDirection === 1 && currentScrollY > smallScrollThreshold && headerVisible) {
            animateHeaderVisibility(false);
        } else if ((scrollDirection === -1 || currentScrollY <= smallScrollThreshold) && !headerVisible) {
            animateHeaderVisibility(true);
        }
    };

    ScrollTriggerInstance.create({
        trigger: 'body',
        start: "top top",
        end: "max",
        onUpdate: (self) => {
            const currentScrollY = smootherInstance?.scrollTop() ?? self.scroll();
            updateHeaderVisibility(currentScrollY, self.direction);
        }
    });

    console.log("Header Animation Initialized");
}
