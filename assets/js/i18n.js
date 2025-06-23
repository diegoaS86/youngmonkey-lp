// assets/js/i18n.js - VERSÃO CORRIGIDA COM IMPORT DIRETO

// 1. VOLTAMOS A IMPORTAR OS DADOS DIRETAMENTE.
// Isto é mais simples e robusto com o Parcel.
import ptBRTranslations from '../json/i18n/pt-BR.json';
import enTranslations from '../json/i18n/en.json';

let currentTranslations = {};
let scrambleWordSets = {};
let translationsApplied = false;

// O mapa agora contém os dados importados.
const translationsMap = {
    'pt-BR': ptBRTranslations,
    'en': enTranslations
};

function getNestedValue(obj, key) {
    if (!obj || typeof key !== 'string') return undefined;
    return key.split('.').reduce((acc, part) => acc && acc[part], obj);
}

async function applyTranslations() {
    if (Object.keys(currentTranslations).length === 0) return;

    const pageTitle = getNestedValue(currentTranslations, 'meta.title');
    if (pageTitle) document.title = pageTitle;

    const attributeMappings = [
        { attr: 'data-i18n-content', prop: 'content' },
        { attr: 'data-i18n', prop: 'textContent' },
        { attr: 'data-i18n-html', prop: 'innerHTML' },
        { attr: 'data-i18n-placeholder', prop: 'placeholder' },
        { attr: 'data-i18n-aria-label', prop: 'aria-label' },
        { attr: 'data-i18n-data-title', prop: 'data-title' },
        { attr: 'data-i18n-alt', prop: 'alt' }
    ];

    attributeMappings.forEach(mapping => {
        document.querySelectorAll(`[${mapping.attr}]`).forEach(element => {
            const key = element.getAttribute(mapping.attr);
            const value = getNestedValue(currentTranslations, key);
            if (value !== undefined) {
                if(mapping.prop === 'textContent') element.textContent = value;
                else if(mapping.prop === 'innerHTML') element.innerHTML = value;
                else element.setAttribute(mapping.prop, value);
            }
        });
    });

    const heroScrambleText = getNestedValue(currentTranslations, 'hero.scrambleText');
    scrambleWordSets = heroScrambleText || { line1: ["VIDEO"], line2: ["GETS"], line3: ["ATTENTION"] };
    
    translationsApplied = true;
    // Dispara o evento para avisar ao script.js que os textos estão prontos.
    document.dispatchEvent(new CustomEvent('translationsReady', { detail: { scrambleWordSets } }));
}

// A função agora é síncrona, apenas seleciona os dados já carregados.
function loadTranslations(lang) {
    currentTranslations = translationsMap[lang];
    if (currentTranslations) {
        applyTranslations();
    } else {
        console.error(`i18n: Traduções para '${lang}' não encontradas.`);
    }
}

function setLanguageInternal(lang, isFallback = false) {
    if (!translationsMap[lang]) return;
    if (!isFallback) localStorage.setItem('preferredLanguage', lang);
    
    loadTranslations(lang);
    
    document.querySelectorAll('.menu-lang a').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
}

export function setLanguage(lang) {
    setLanguageInternal(lang, false);
}

export function initializeI18n() {
    document.querySelectorAll('.menu-lang a').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const lang = button.getAttribute('data-lang');
            if (lang && lang !== localStorage.getItem('preferredLanguage')) {
                setLanguage(lang);
            }
        });
    });
    
    const savedLang = localStorage.getItem('preferredLanguage');
    const browserLang = (navigator.language || '').split('-')[0];
    let initialLang = 'en';
    if (browserLang === 'pt') initialLang = 'pt-BR';
    if (savedLang && translationsMap[savedLang]) initialLang = savedLang;
    
    setLanguage(initialLang);
}

export function getScrambleWordSets() { return scrambleWordSets; }
export function areTranslationsReady() { return translationsApplied; }
