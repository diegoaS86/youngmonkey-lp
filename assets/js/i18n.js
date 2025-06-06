// assets/js/i18n.js
import ptBRTranslations from '/assets/json/i18n/pt-BR.json';
import enTranslations from '/assets/json/i18n/en.json';

let currentTranslations = {};
let scrambleWordSets = {};
let translationsApplied = false; // Variável de estado para rastrear se as traduções foram aplicadas

const translationsMap = {
    'pt-BR': ptBRTranslations,
    'en': enTranslations
};

// Função para obter valores aninhados de um objeto (ex: 'hero.title')
function getNestedValue(obj, key) {
    if (!obj || typeof key !== 'string') return undefined;
    return key.split('.').reduce((acc, part) => acc && acc[part], obj);
}

// Função para aplicar as traduções aos elementos da página
async function applyTranslations() {
    if (Object.keys(currentTranslations).length === 0) {
        console.warn("i18n: Nenhuma tradução carregada para aplicar.");
        return;
    }

    // Aplica o título da página
    const pageTitle = getNestedValue(currentTranslations, 'meta.title');
    if (pageTitle) document.title = pageTitle;

    // Aplica traduções a meta tags com 'data-i18n-content'
    document.querySelectorAll('[data-i18n-content]').forEach(element => {
        const key = element.getAttribute('data-i18n-content');
        const value = getNestedValue(currentTranslations, key);
        if (value) element.setAttribute('content', value);
        else console.warn(`i18n: Chave não encontrada para meta content: ${key}`);
    });

    // Aplica traduções a elementos com 'data-i18n' (textContent)
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const value = getNestedValue(currentTranslations, key);
        if (value !== undefined) element.textContent = value;
        else console.warn(`i18n: Chave não encontrada para texto: ${key}`);
    });

    // Aplica traduções a elementos com 'data-i18n-html' (innerHTML)
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
        const key = element.getAttribute('data-i18n-html');
        const value = getNestedValue(currentTranslations, key);
        if (value !== undefined) element.innerHTML = value;
        else console.warn(`i18n: Chave não encontrada para HTML: ${key}`);
    });

    // Aplica traduções a placeholders de inputs com 'data-i18n-placeholder'
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const value = getNestedValue(currentTranslations, key);
        if (value) element.setAttribute('placeholder', value);
        else console.warn(`i18n: Chave não encontrada para placeholder: ${key}`);
    });

    // Aplica traduções a aria-labels com 'data-i18n-aria-label'
    document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
        const key = element.getAttribute('data-i18n-aria-label');
        const value = getNestedValue(currentTranslations, key);
        if (value) element.setAttribute('aria-label', value);
        else console.warn(`i18n: Chave não encontrada para aria-label: ${key}`);
    });

    // Aplica traduções a atributos 'data-title'
    document.querySelectorAll('[data-i18n-data-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-data-title');
        const value = getNestedValue(currentTranslations, key);
        if (value) element.setAttribute('data-title', value);
        else console.warn(`i18n: Chave não encontrada para data-title: ${key}`);
    });
    
    // Aplica traduções a atributos 'alt' de imagens
    document.querySelectorAll('img[data-i18n-alt]').forEach(element => {
        const key = element.getAttribute('data-i18n-alt');
        const value = getNestedValue(currentTranslations, key);
        if (value) element.setAttribute('alt', value);
        else console.warn(`i18n: Chave não encontrada para alt da imagem: ${key}`);
    });

    // Carrega os conjuntos de palavras para a animação de scramble do hero
    const heroScrambleText = getNestedValue(currentTranslations, 'hero.scrambleText');
    if (heroScrambleText && typeof heroScrambleText === 'object' && heroScrambleText.line1) {
        scrambleWordSets = heroScrambleText;
    } else {
        console.warn("i18n: hero.scrambleText não encontrado ou em formato inválido. Usando fallback.");
        // Define um fallback caso as traduções para o scramble não sejam encontradas
        scrambleWordSets = { line1: ["VIDEO"], line2: ["GETS"], line3: ["ATTENTION"] };
    }
    
    translationsApplied = true; // Define que as traduções foram aplicadas

    // Dispara um evento personalizado para notificar outros scripts que as traduções estão prontas
    document.dispatchEvent(new CustomEvent('translationsReady', { detail: { translations: currentTranslations, scrambleWordSets: scrambleWordSets } }));
}

// Função para carregar o arquivo de tradução do idioma selecionado
async function loadTranslations(lang) {
    console.log(`i18n: Tentando carregar traduções para: ${lang}`);
    try {
        const selectedTranslations = translationsMap[lang];

        if (!selectedTranslations) {
            throw new Error(`i18n: Traduções para o idioma '${lang}' não foram encontradas no translationsMap.`);
        }
        
        currentTranslations = selectedTranslations; // Define as traduções atuais
        await applyTranslations(); // Aplica as traduções
        document.documentElement.lang = lang.split('-')[0]; // Define o atributo 'lang' do HTML
        console.log(`i18n: Traduções para ${lang} carregadas e aplicadas com sucesso a partir de objeto importado.`);

    } catch (error) {
        console.error(`i18n: Erro ao carregar ou processar traduções para ${lang}:`, error);
        // Tenta carregar idiomas de fallback em caso de erro
        if (lang !== 'pt-BR' && translationsMap['pt-BR']) {
            console.warn(`i18n: Falha ao carregar '${lang}'. Tentando carregar 'pt-BR'.`);
            await setLanguageInternal('pt-BR', true); 
        } else if (lang !== 'en' && translationsMap['en']) { 
            console.warn(`i18n: Falha ao carregar '${lang}' (ou pt-BR). Tentando carregar 'en'.`);
            await setLanguageInternal('en', true);
        } else {
            console.error("i18n: Todos os idiomas de fallback falharam ou não estão disponíveis.");
        }
    }
}

// Função interna para definir o idioma (usada por setLanguage e para fallbacks)
async function setLanguageInternal(lang, isFallback = false) {
    if (!translationsMap[lang]) {
        console.error(`i18n: Idioma de fallback ou solicitado '${lang}' não definido no translationsMap. Abortando setLanguageInternal.`);
        return;
    }
    if (!isFallback) { // Salva o idioma no localStorage apenas se não for um fallback
        localStorage.setItem('preferredLanguage', lang);
    }
    await loadTranslations(lang); 
    // Atualiza a classe 'active' nos botões de idioma do menu
    document.querySelectorAll('.menu-lang a').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
}

// Função pública para definir o idioma
async function setLanguage(lang) {
    if (!translationsMap[lang]) {
        console.error(`i18n: Tentativa de definir idioma inválido '${lang}'. Usando 'pt-BR' como padrão de fallback.`);
        await setLanguageInternal('pt-BR', false); // Define pt-BR como fallback se o idioma solicitado for inválido
        return;
    }
    await setLanguageInternal(lang, false);
}

// Inicializa o sistema de internacionalização
async function initializeI18n() {
    // Adiciona listeners de clique aos botões de idioma no menu
    document.querySelectorAll('.menu-lang a').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const lang = button.getAttribute('data-lang');
            const currentSavedLang = localStorage.getItem('preferredLanguage');
            // Muda o idioma apenas se for diferente do idioma salvo ou se não houver idioma salvo
            if (lang && lang !== currentSavedLang) { 
                setLanguage(lang);
            }
        });
    });

    // Determina o idioma inicial a ser carregado
    const savedLang = localStorage.getItem('preferredLanguage');
    let initialLang;

    console.log('i18n: Verificando idioma inicial...');
    console.log('i18n: Idioma salvo no localStorage:', savedLang);
    console.log('i18n: navigator.language:', navigator.language);
    console.log('i18n: navigator.languages:', JSON.stringify(navigator.languages));

    if (savedLang && translationsMap[savedLang]) {
        initialLang = savedLang; // Usa o idioma salvo se existir e for válido
        console.log(`i18n: Usando idioma salvo do localStorage: ${initialLang}`);
    } else {
        // Caso contrário, tenta detectar o idioma do navegador
        const browserLanguages = navigator.languages || [navigator.language || navigator.userLanguage];
        const mostPreferredBrowserLang = browserLanguages[0] ? browserLanguages[0].split('-')[0].toLowerCase() : 'en'; 
        
        console.log(`i18n: Idioma mais prioritário do navegador detectado: ${mostPreferredBrowserLang}`);

        if (mostPreferredBrowserLang === 'pt') {
            initialLang = 'pt-BR';
            console.log("i18n: Navegador indica preferência por Português. Definindo para 'pt-BR'.");
        } else {
            initialLang = 'en'; // Define 'en' como padrão se o navegador não preferir português
            console.log("i18n: Navegador não indica preferência por Português. Definindo para 'en'.");
        }
    }
    
    console.log(`i18n: Idioma inicial final determinado: ${initialLang}`);
    await setLanguage(initialLang); // Define o idioma inicial
}

// Exporta a função para obter os conjuntos de palavras para o scramble
export function getScrambleWordSets() {
    return scrambleWordSets;
}

// Exporta a função para verificar se as traduções estão prontas
export function areTranslationsReady() {
    return translationsApplied;
}

// Inicializa o i18n quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeI18n);
