/**
 * Fonctions utilitaires pour le module Livraison
 */
const PlanningUtils = {
    
    /**
     * Afficher un loader
     */
    afficherLoader: function(message) {
        console.log('⏳ ' + message);
        // TODO: Implémenter un vrai loader visuel
    },
    
    /**
     * Afficher une erreur
     */
    afficherErreur: function(message) {
        alert('❌ ' + message);
        // TODO: Remplacer par une notification plus élégante
    },
    
    /**
     * Afficher un succès
     */
    afficherSucces: function(message) {
        alert('✅ ' + message);
        // TODO: Remplacer par une notification plus élégante
    },
    
    /**
     * Obtenir le token CSRF
     */
    getCsrfToken: function() {
        return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    },
    
    /**
     * Headers par défaut pour les requêtes AJAX
     */
    getAjaxHeaders: function() {
        return {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': this.getCsrfToken()
        };
    }
};

// Export global
window.PlanningUtils = PlanningUtils;

// Alias pour compatibilité avec le code existant
window.afficherLoader = PlanningUtils.afficherLoader;
window.afficherErreur = PlanningUtils.afficherErreur;
window.afficherSucces = PlanningUtils.afficherSucces;