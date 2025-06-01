// assets/js/header.js
// Não precisa de imports de GSAP aqui, pois recebe as instâncias como parâmetros.

export function initializeHeaderAnimation(gsapInstance, ScrollTriggerInstance, smootherInstance) {
    const header = document.getElementById('mainHeader');

    if (!header) {
        console.warn("Header element #mainHeader not found.");
        return;
    }
    // gsapInstance e ScrollTriggerInstance são verificados implicitamente pelo seu uso.

    let headerVisible = true;
    const headerHeight = header.offsetHeight;
    const smallScrollThreshold = 0; // Definido como 0 para mostrar/esconder logo no início do scroll

    gsapInstance.set(header, { y: 0 });

    ScrollTriggerInstance.create({
        trigger: 'body', // O trigger pode ser o body para monitorar o scroll da página inteira
        start: "top top",
        end: "max", // Continua monitorando até o final do scroll da página

        onUpdate: (self) => {
            const currentScrollY = smootherInstance ? smootherInstance.scrollTop() : self.scroll();
            const scrollDirection = self.direction;

            if (scrollDirection === 1 && currentScrollY > smallScrollThreshold) { // Descendo e passou do threshold
                if (headerVisible) {
                    gsapInstance.to(header, {
                        y: -headerHeight, // Esconde o header
                        duration: 0.4,
                        ease: "power2.inOut"
                    });
                    headerVisible = false;
                }
            } else if (scrollDirection === -1) { // Subindo
                if (!headerVisible) {
                    gsapInstance.to(header, {
                        y: 0, // Mostra o header
                        duration: 0.4,
                        ease: "power2.inOut"
                    });
                    headerVisible = true;
                }
            } else if (currentScrollY <= smallScrollThreshold) { // No topo da página
                 if (!headerVisible) {
                    gsapInstance.to(header, {
                        y: 0, // Garante que o header está visível no topo
                        duration: 0.4,
                        ease: "power2.inOut"
                    });
                    headerVisible = true;
                }
            }
        }
    });
    console.log("Header Animation Initialized");
}
