/**
 * Module Planning Principal - VERSION STABLE MOBILE + FIX DATES
 * ✅ Suppression des codes problématiques
 * ✅ Compatible Vue Semaine / Vue Mois
 * ✅ Stable Portrait / Paysage
 * ✅ NOUVEAU : Validation robuste des dates pour éviter "undefined"
 */

// ==========================================
// 🔧 HELPERS DE VALIDATION DES DATES
// ==========================================

/**
 * ✅ NOUVEAU : Fonction helper pour obtenir une date valide
 * Empêche l'envoi de "undefined", "null" ou dates invalides
 */
function getValidDate(date) {
    // Vérification stricte des valeurs invalides
    if (!date || 
        date === 'undefined' || 
        date === 'null' || 
        date === '' ||
        date === 'Invalid Date') {
        // Retourner la date du jour au format ISO (YYYY-MM-DD)
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const validDate = `${year}-${month}-${day}`;
        
        console.warn(`⚠️ Date invalide détectée: "${date}". Utilisation de la date actuelle: ${validDate}`);
        return validDate;
    }
    
    // Vérifier si c'est une date valide
    try {
        const testDate = new Date(date);
        if (isNaN(testDate.getTime())) {
            console.warn(`⚠️ Date non parsable: "${date}". Utilisation de la date actuelle.`);
            return getValidDate(null); // Récursion avec null pour obtenir la date du jour
        }
        
        // Si la date est valide, la retourner (en s'assurant du format ISO)
        if (date.includes('/')) {
            // Format français DD/MM/YYYY -> convertir en YYYY-MM-DD
            const parts = date.split('/');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        }
        
        // Si déjà au format ISO ou autre format valide
        return date;
        
    } catch (e) {
        console.error('❌ Erreur validation date:', e);
        return getValidDate(null);
    }
}

/**
 * ✅ NOUVEAU : Construire une URL avec paramètres validés
 */
function buildSafeUrl(baseUrl, params = {}) {
    const url = new URL(baseUrl, window.location.origin);
    
    Object.entries(params).forEach(([key, value]) => {
        if (key === 'date') {
            // Validation spéciale pour les dates
            url.searchParams.set(key, getValidDate(value));
        } else if (value !== undefined && value !== null && value !== '') {
            url.searchParams.set(key, value);
        }
    });
    
    return url.toString();
}

// ==========================================
// MODULE PRINCIPAL
// ==========================================

const PlanningMain = {
    initialized: false,
    
    /**
     * Initialisation du module - SIMPLIFIÉE
     */
    init: function() {
        // Éviter double initialisation
        if (this.initialized) {
            console.log('Planning déjà initialisé');
            return;
        }
        
        console.log('🚀 Initialisation Planning Stable avec validation dates');
        this.initialized = true;
        
        // Fonctions essentielles uniquement
        this.initDayColumnListeners();
        this.initMainButtons();
        this.stylerGoutsExclus();
        this.initCarouselMobile();
        this.initNavigationButtons(); // ✅ NOUVEAU
    },
    
    /**
     * ✅ NOUVEAU : Initialiser les boutons de navigation avec validation
     */
    initNavigationButtons: function() {
        // Bouton précédent
        const btnPrecedent = document.getElementById('btn-precedent');
        if (btnPrecedent) {
            btnPrecedent.addEventListener('click', function(e) {
                e.preventDefault();
                const href = this.getAttribute('href');
                if (href) {
                    // Parser l'URL et valider la date
                    const url = new URL(href, window.location.origin);
                    const date = url.searchParams.get('date');
                    url.searchParams.set('date', getValidDate(date));
                    window.location.href = url.toString();
                }
            });
        }
        
        // Bouton suivant
        const btnSuivant = document.getElementById('btn-suivant');
        if (btnSuivant) {
            btnSuivant.addEventListener('click', function(e) {
                e.preventDefault();
                const href = this.getAttribute('href');
                if (href) {
                    // Parser l'URL et valider la date
                    const url = new URL(href, window.location.origin);
                    const date = url.searchParams.get('date');
                    url.searchParams.set('date', getValidDate(date));
                    window.location.href = url.toString();
                }
            });
        }
        
        // Bouton aujourd'hui
        const btnAujourdhui = document.getElementById('btn-aujourd-hui');
        if (btnAujourdhui) {
            btnAujourdhui.addEventListener('click', function(e) {
                e.preventDefault();
                const mode = window.modeActuel || 'semaine';
                const todayDate = getValidDate(null); // Obtenir la date du jour
                const url = buildSafeUrl(window.location.pathname, {
                    mode: mode,
                    date: todayDate
                });
                window.location.href = url;
            });
        }
    },
    
    /**
     * Toggle "Voir plus" - FONCTION CONSERVÉE
     */
    toggleVoirPlus: function(jour) {
        const container = document.getElementById(`commandes-${jour}`);
        if (!container) return;
        
        const hiddenItems = container.querySelectorAll('[data-hidden="true"]');
        const button = container.querySelector('.voir-plus-btn');
        if (!button) return;
        
        const voirPlusText = button.querySelector('.voir-plus-text');
        const voirMoinsText = button.querySelector('.voir-moins-text');
        
        if (voirPlusText && voirMoinsText) {
            if (voirPlusText.style.display !== 'none') {
                // Afficher les éléments cachés
                hiddenItems.forEach(item => item.classList.remove('hidden'));
                voirPlusText.style.display = 'none';
                voirMoinsText.style.display = 'inline';
            } else {
                // Cacher les éléments
                hiddenItems.forEach(item => item.classList.add('hidden'));
                voirPlusText.style.display = 'inline';
                voirMoinsText.style.display = 'none';
            }
        }
    },
    
    /**
     * Styliser automatiquement les goûts exclus - CONSERVÉ
     */
    stylerGoutsExclus: function() {
        document.querySelectorAll('.commande-item .text-xs').forEach(detailElement => {
            const text = detailElement.textContent;
            if (text.includes('❌')) {
                detailElement.innerHTML = text.replace(/(❌\s*[A-Z]+)/g, '<span class="gout-exclu">$1</span>');
            }
        });
    },
    
    /**
     * ✅ CORRIGÉ : Carousel mobile SIMPLE sans bugs d'orientation
     */
    initCarouselMobile: function() {
        const calendrierGrid = document.querySelector('.calendrier-grid');
        if (!calendrierGrid) return;
        
        // Détection mobile paysage SIMPLE
        const isMobileLandscape = window.innerWidth <= 1023 && window.innerHeight < window.innerWidth;
        
        if (isMobileLandscape) {
            const scrollDots = document.querySelectorAll('.scroll-dot');
            let currentPage = 0;
            
            // Scroll avec indicateurs - SANS BUGS
            calendrierGrid.addEventListener('scroll', function() {
                const scrollLeft = this.scrollLeft;
                const containerWidth = this.offsetWidth;
                const newPage = Math.round(scrollLeft / (containerWidth * 0.7));
                
                if (newPage !== currentPage && newPage >= 0 && newPage < 2) {
                    currentPage = newPage;
                    scrollDots.forEach((dot, index) => {
                        dot.classList.toggle('active', index === currentPage);
                    });
                }
            });
            
            // Clic sur indicateurs
            scrollDots.forEach((dot, index) => {
                dot.addEventListener('click', function() {
                    const targetScroll = calendrierGrid.offsetWidth * 0.7 * index;
                    calendrierGrid.scrollTo({
                        left: targetScroll,
                        behavior: 'smooth'
                    });
                });
            });
        }
    },
    
    /**
     * ✅ CORRIGÉ : Event listeners colonnes - COMPATIBLE TOUTES VUES
     */
    initDayColumnListeners: function() {
        // Supprimer anciens listeners pour éviter duplication
        document.querySelectorAll('.day-column').forEach(dayColumn => {
            const newDayColumn = dayColumn.cloneNode(true);
            dayColumn.parentNode.replaceChild(newDayColumn, dayColumn);
        });
        
        // Ajouter nouveaux listeners
        document.querySelectorAll('.day-column').forEach(dayColumn => {
            const jour = dayColumn.getAttribute('data-jour');
            const date = dayColumn.getAttribute('data-date');
            const jourNom = dayColumn.getAttribute('data-jour-nom');
            
            dayColumn.addEventListener('click', function(e) {
                // Éviter conflit avec boutons "Voir plus"
                if (e.target.closest('.voir-plus-btn')) return;
                
                // ✅ COMPATIBLE : Vue Semaine ET Vue Mois
                if (typeof ouvrirModalTableauExcel === 'function') {
                    console.log('🎯 Ouverture modal depuis:', { 
                        jour, 
                        date: getValidDate(date), // ✅ Validation de la date
                        jourNom 
                    });
                    ouvrirModalTableauExcel(this);
                } else {
                    console.error('❌ Fonction ouvrirModalTableauExcel non disponible');
                }
            });
            
            // Style cliquable
            dayColumn.style.cursor = 'pointer';
            dayColumn.title = `Voir le tableau détaillé du ${jourNom || jour} (${date || 'Date non définie'})`;
        });
    },
    
    /**
     * Initialiser boutons principaux - CONSERVÉ AVEC VALIDATION
     */
    initMainButtons: function() {
        // 1. Commande pour le lendemain
        const btnLendemain = document.getElementById('btn-lendemain');
        if (btnLendemain) {
            btnLendemain.addEventListener('click', function() {
                window.location.href = window.routeLivraisonCommandeLendemain || '/admin/livraison/commande-lendemain';
            });
        }
        
        // 2. Commande planning
        const btnPlanning = document.getElementById('btn-planning');
        if (btnPlanning) {
            btnPlanning.addEventListener('click', function() {
                window.location.href = window.routeLivraisonPlanningDetaille || '/admin/livraison/planning-detaille';
            });
        }
        
        // 3. Commande ponctuelle - AVEC VALIDATION DATE
        const btnPonctuelle = document.getElementById('btn-ponctuelle');
        if (btnPonctuelle) {
            btnPonctuelle.addEventListener('click', function() {
                if (typeof ouvrirModalCalendrierPonctuelle === 'function') {
                    ouvrirModalCalendrierPonctuelle();
                } else {
                    console.error('❌ Fonction ouvrirModalCalendrierPonctuelle non disponible');
                }
            });
        }
        
        // 4. Gestion du planning
        const btnGestion = document.getElementById('btn-gestion');
        if (btnGestion) {
            btnGestion.addEventListener('click', function() {
                alert('🚧 Fonctionnalité "GESTION DU PLANNING" en développement\n\n' +
                      'Cette fonction permettra de gérer globalement le planning des livraisons.');
            });
        }
    },
    
    /**
     * ✅ SIMPLIFIÉ : Event listeners généraux SANS BUGS
     */
    initEventListeners: function() {
        // Animation commandes - CONSERVÉE
        document.querySelectorAll('.commande-item').forEach(item => {
            item.addEventListener('click', function(e) {
                if (e.target.closest('.day-column')) return;
                
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
                
                const clientName = this.querySelector('.font-bold')?.textContent || 'Client inconnu';
                console.log('Commande cliquée:', clientName);
            });
        });
        
        // ✅ SUPPRIMÉ : Listeners d'orientation problématiques
        // Seul resize simple conservé
        window.addEventListener('resize', () => {
            // Délai pour éviter spam
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.initCarouselMobile();
            }, 300);
        });
    }
};

// ==========================================
// ✅ FONCTIONS GLOBALES POUR COMPATIBILITÉ
// ==========================================

// Fonction globale pour toggleVoirPlus
window.toggleVoirPlus = function(jour) {
    PlanningMain.toggleVoirPlus(jour);
};

// ✅ NOUVEAU : Exposer les helpers globalement
window.getValidDate = getValidDate;
window.buildSafeUrl = buildSafeUrl;

// Export du module
window.PlanningMain = PlanningMain;

// ==========================================
// ✅ FONCTION CHANGEMENT DE MODE AVEC VALIDATION
// ==========================================

window.changerMode = function(nouveauMode) {
    const currentUrl = new URL(window.location.href);
    const currentDate = currentUrl.searchParams.get('date');
    
    // Construire l'URL avec validation de la date
    const url = buildSafeUrl(window.location.pathname, {
        mode: nouveauMode,
        date: currentDate // buildSafeUrl va valider automatiquement
    });
    
    console.log(`🔄 Changement mode: ${nouveauMode}, Date validée: ${getValidDate(currentDate)}`);
    window.location.href = url;
};

// ==========================================
// ✅ INITIALISATION SIMPLIFIÉE ET STABLE
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Initialisation Planning - Mode Stable avec validation dates');
    
    // Initialisation directe SANS fix mobile complexe
    PlanningMain.init();
    
    // ✅ BONUS : Configuration spéciale bouton ponctuelle depuis planning.blade.php
    setTimeout(function() {
        const btnPonctuelle = document.getElementById('btn-commande-ponctuelle');
        
        if (btnPonctuelle) {
            console.log('🔧 Configuration bouton ponctuelle avec validation dates');
            
            // Nettoyer anciens listeners
            const newBtn = btnPonctuelle.cloneNode(true);
            btnPonctuelle.parentNode.replaceChild(newBtn, btnPonctuelle);
            
            // Nouveau listener propre avec validation
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('📅 Clic commande ponctuelle');
                
                if (typeof ModalCalendrierPonctuelle !== 'undefined' && 
                    typeof ModalCalendrierPonctuelle.ouvrir === 'function') {
                    
                    ModalCalendrierPonctuelle.ouvrir(function(dateSelectionnee) {
                        if (dateSelectionnee) {
                            // ✅ Valider la date avant redirection
                            const dateValidee = getValidDate(dateSelectionnee);
                            const routeAjout = window.routeLivraisonAjouterCommande || '/admin/livraison/ajouter-commande';
                            const url = buildSafeUrl(routeAjout, { date: dateValidee });
                            window.location.href = url;
                        }
                    });
                } else {
                    // Fallback simple avec validation
                    const dateChoisie = prompt('Date (DD/MM/YYYY):', new Date().toLocaleDateString('fr-FR'));
                    if (dateChoisie) {
                        const dateValidee = getValidDate(dateChoisie);
                        const routeAjout = window.routeLivraisonAjouterCommande || '/admin/livraison/ajouter-commande';
                        const url = buildSafeUrl(routeAjout, { date: dateValidee });
                        window.location.href = url;
                    }
                }
            });
        }
    }, 500);
});

// ==========================================
// ✅ GESTION TOUCHES CLAVIER - CONSERVÉE
// ==========================================

document.addEventListener('keydown', function(e) {
    // Raccourcis navigation avec Ctrl
    if (e.ctrlKey) {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                document.getElementById('btn-precedent')?.click();
                break;
            case 'ArrowRight':
                e.preventDefault();
                document.getElementById('btn-suivant')?.click();
                break;
            case 't':
                e.preventDefault();
                document.getElementById('btn-aujourd-hui')?.click();
                break;
            case 'm':
                e.preventDefault();
                const modeActuel = window.modeActuel || 'semaine';
                const nouveauMode = modeActuel === 'semaine' ? 'mois' : 'semaine';
                if (typeof changerMode === 'function') {
                    changerMode(nouveauMode);
                }
                break;
        }
    }
});

// ==========================================
// ✅ INTERCEPTEUR AJAX POUR VALIDATION (BONUS)
// ==========================================

// Si vous utilisez jQuery pour les requêtes AJAX
if (typeof $ !== 'undefined' && $.ajaxPrefilter) {
    $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
        // Vérifier si l'URL contient un paramètre date
        if (options.url && options.url.includes('date=')) {
            const url = new URL(options.url, window.location.origin);
            const date = url.searchParams.get('date');
            if (date) {
                url.searchParams.set('date', getValidDate(date));
                options.url = url.toString();
                console.log('🔧 AJAX URL corrigée:', options.url);
            }
        }
        
        // Vérifier les données POST/GET
        if (options.data && typeof options.data === 'string' && options.data.includes('date=')) {
            const params = new URLSearchParams(options.data);
            if (params.has('date')) {
                const date = params.get('date');
                params.set('date', getValidDate(date));
                options.data = params.toString();
                console.log('🔧 AJAX data corrigée:', options.data);
            }
        }
    });
}

// ==========================================
// ✅ LOG FINAL - CONFIRMATION
// ==========================================

console.log('✅ Planning.js chargé - Version Stable Mobile + Validation Dates');
console.log('📱 Compatible: Vue Semaine + Vue Mois + Portrait + Paysage');
console.log('🛡️ Protection: Aucune date "undefined" ne sera envoyée au serveur');
console.log('🚀 Prêt pour navigation sécurisée !');