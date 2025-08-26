/**
 * LIVRAISON DU JOUR - Module JavaScript
 * Gestion des interactions AJAX et logique métier
 */

const LivraisonDuJour = {
    // Configuration
    config: {
        role: null,
        csrfToken: null,
        routes: {},
        debug: true
    },

    // Compteurs
    stats: {
        totalCommandes: 0,
        commandesLivrees: 0,
        commandesEnCours: 0
    },

    /**
     * Initialisation du module
     */
    init(options) {
        this.config = { ...this.config, ...options };
        this.log('🚀 Initialisation LivraisonDuJour', this.config);

        // Initialiser selon le rôle
        if (this.config.role === 'admin') {
            this.initAdmin();
        } else if (this.config.role === 'livreur') {
            this.initLivreur();
        }

        // Événements communs
        this.bindCommonEvents();
        this.calculerStats();
        this.detecterConnexion();
    },

    /**
     * Initialisation spécifique ADMIN
     */
    initAdmin() {
        this.log('👨‍💼 Mode Admin activé');
        
        // Événements admin
        this.bindToggleAdresseEvents();
        this.bindToggleTelephoneEvents(); // 🆕 NOUVEAU
        this.bindAnnulerLivraisonEvents();
        this.initRefreshTimer();
        this.bindPrintEvents();
        
        // Dashboard temps réel
        this.updateDashboard();
    },

    /**
     * Initialisation spécifique LIVREUR
     */
    initLivreur() {
        this.log('🚚 Mode Livreur activé');
        
        // Événements livreur
        this.bindMarquerLivreeEvents();
        this.initMobileOptimizations();
        this.enableOfflineMode();
        
        // Interface mobile
        this.optimizeMobileInterface();
    },

    /**
     * Événements communs
     */
    bindCommonEvents() {
        // Gestion des erreurs AJAX globales
        document.addEventListener('ajaxError', (e) => {
            this.showToast('Erreur de connexion', 'error');
        });

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.rafraichirPage();
            }
        });
    },

    /**
     * Gestion toggle adresse (ADMIN)
     */
    bindToggleAdresseEvents() {
        const toggles = document.querySelectorAll('.toggle-adresse');
        
        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const commandeId = e.target.dataset.commandeId;
                const isVisible = e.target.checked;
                
                this.toggleAdresseVisible(commandeId, isVisible, e.target);
            });
        });
    },

    /**
     * 🆕 NOUVELLE MÉTHODE : Gestion toggle téléphone (ADMIN)
     */
    bindToggleTelephoneEvents() {
        const toggles = document.querySelectorAll('.toggle-telephone');
        
        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const commandeId = e.target.dataset.commandeId;
                const isVisible = e.target.checked;
                
                this.toggleTelephoneVisible(commandeId, isVisible, e.target);
            });
        });
    },

    /**
     * Gestion annulation livraison (ADMIN uniquement)
     */
    bindAnnulerLivraisonEvents() {
        const btnsAnnuler = document.querySelectorAll('.btn-annuler-livraison');
        
        btnsAnnuler.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const commandeId = e.target.dataset.commandeId;
                const clientNom = e.target.dataset.clientNom || 'Client';
                
                // Confirmation avant annulation
                if (confirm(`Êtes-vous sûr de vouloir annuler la livraison de ${clientNom} ?\n\nLe statut passera de "Livrée" à "Validée".`)) {
                    this.annulerLivraison(commandeId, e.target);
                }
            });
        });
    },

    /**
     * Gestion marquer livré (LIVREUR)
     */
    bindMarquerLivreeEvents() {
        const btnsLivre = document.querySelectorAll('.btn-livre');
        
        btnsLivre.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const commandeId = e.target.dataset.commandeId;
                
                this.marquerCommeLivree(commandeId, e.target);
            });
        });
    },

    /**
     * AJAX - Toggle visibilité adresse
     */
    async toggleAdresseVisible(commandeId, isVisible, toggleElement) {
        const url = this.config.routes.toggleAdresse.replace(':id', commandeId);
        
        try {
            this.setLoading(toggleElement, true);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.config.csrfToken,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    adresse_visible: isVisible
                })
            });

            const data = await response.json();

            if (data.success) {
                this.updateAdresseDisplay(commandeId, isVisible);
                this.showToast(`📍 Adresse ${isVisible ? 'visible' : 'masquée'} pour le livreur`, 'success');
            } else {
                throw new Error(data.message || 'Erreur inconnue');
            }

        } catch (error) {
            this.log('❌ Erreur toggle adresse:', error);
            toggleElement.checked = !isVisible; // Revenir à l'état précédent
            this.showToast('Erreur lors de la modification de l\'adresse', 'error');
        } finally {
            this.setLoading(toggleElement, false);
        }
    },

    /**
     * 🆕 NOUVELLE MÉTHODE : AJAX - Toggle visibilité téléphone
     */
    async toggleTelephoneVisible(commandeId, isVisible, toggleElement) {
        const url = this.config.routes.toggleTelephone.replace(':id', commandeId);
        
        try {
            this.setLoading(toggleElement, true);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.config.csrfToken,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    telephone_visible: isVisible
                })
            });

            const data = await response.json();

            if (data.success) {
                this.updateTelephoneDisplay(commandeId, isVisible);
                this.showToast(`📞 Téléphone ${isVisible ? 'visible' : 'masqué'} pour le livreur`, 'success');
            } else {
                throw new Error(data.message || 'Erreur inconnue');
            }

        } catch (error) {
            this.log('❌ Erreur toggle téléphone:', error);
            toggleElement.checked = !isVisible; // Revenir à l'état précédent
            this.showToast('Erreur lors de la modification du téléphone', 'error');
        } finally {
            this.setLoading(toggleElement, false);
        }
    },

    /**
     * AJAX - Marquer commande comme livrée
     */
    async marquerCommeLivree(commandeId, btnElement) {
        const url = this.config.routes.marquerLivree.replace(':id', commandeId);
        
        try {
            this.setLoading(btnElement, true);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.config.csrfToken,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                this.updateCommandeStatus(commandeId, 'livree', btnElement);
                this.stats.commandesLivrees++;
                this.stats.commandesEnCours--;
                this.updateCounters();
                this.showToast('✅ Livraison validée !', 'success');
                
                // Animation de succès
                this.animateSuccess(btnElement);
                
            } else {
                throw new Error(data.message || 'Erreur inconnue');
            }

        } catch (error) {
            this.log('❌ Erreur marquer livré:', error);
            this.showToast('Erreur lors de la validation', 'error');
        } finally {
            this.setLoading(btnElement, false);
        }
    },

    /**
     * AJAX - Annuler une livraison (Admin uniquement)
     */
    async annulerLivraison(commandeId, btnElement) {
        const url = this.config.routes.annulerLivraison.replace(':id', commandeId);
        
        try {
            this.setLoading(btnElement, true);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.config.csrfToken,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                // Mettre à jour le statut de la commande
                this.updateCommandeStatus(commandeId, 'validee', btnElement);
                
                // Mettre à jour les compteurs
                this.stats.commandesLivrees--;
                this.stats.commandesEnCours++;
                this.updateCounters();
                
                // Changer le bouton d'annulation en bouton normal
                this.resetBoutonAnnulation(commandeId, btnElement);
                
                this.showToast('❌ Livraison annulée. Statut remis à "Validée"', 'success');
                
                // Animation de changement d'état
                this.animateStateChange(btnElement);
                
            } else {
                throw new Error(data.message || 'Erreur inconnue');
            }

        } catch (error) {
            this.log('❌ Erreur annulation livraison:', error);
            
            // Gestion des erreurs spécifiques
            if (error.message.includes('non autorisée')) {
                this.showToast('⛔ Seuls les admins peuvent annuler une livraison', 'error');
            } else if (error.message.includes('pas marquée comme livrée')) {
                this.showToast('⚠️ Cette commande n\'est pas livrée', 'warning');
            } else {
                this.showToast('Erreur lors de l\'annulation', 'error');
            }
        } finally {
            this.setLoading(btnElement, false);
        }
    },

    /**
     * Réinitialiser le bouton d'annulation
     */
    resetBoutonAnnulation(commandeId, btnElement) {
        const commandeCard = document.querySelector(`[data-commande-id="${commandeId}"]`);
        if (!commandeCard) return;

        // Changer le bouton "Annuler" en statut "En attente"
        btnElement.innerHTML = '⏳ En attente';
        btnElement.className = 'px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium';
        btnElement.disabled = true;
        
        // Optionnel: Cacher le bouton complètement
        btnElement.style.display = 'none';
        
        // Ajouter un nouveau statut badge
        const statusContainer = commandeCard.querySelector('.status-container');
        if (statusContainer) {
            statusContainer.innerHTML = '<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">✅ Validée</span>';
        }
    },

    /**
     * Mise à jour affichage adresse
     */
    updateAdresseDisplay(commandeId, isVisible) {
        const commandeItem = document.querySelector(`[data-commande-id="${commandeId}"]`);
        if (!commandeItem) return;

        // Mettre à jour l'indicateur de visibilité adresse
        const adresseIndicator = commandeItem.querySelector('.adresse-visibility-indicator');
        if (adresseIndicator) {
            adresseIndicator.textContent = isVisible ? '👁️ Visible livreur' : '🚫 Masquée livreur';
            adresseIndicator.className = `text-xs ${isVisible ? 'text-green-600' : 'text-red-600'}`;
        }

        this.log(`📍 Adresse ${isVisible ? 'visible' : 'masquée'} pour commande ${commandeId}`);
    },

    /**
     * 🆕 NOUVELLE MÉTHODE : Mise à jour affichage téléphone
     */
    updateTelephoneDisplay(commandeId, isVisible) {
        const commandeItem = document.querySelector(`[data-commande-id="${commandeId}"]`);
        if (!commandeItem) return;

        // Mettre à jour l'indicateur de visibilité téléphone
        const telephoneIndicator = commandeItem.querySelector('.telephone-visibility-indicator');
        if (telephoneIndicator) {
            telephoneIndicator.textContent = isVisible ? '👁️ Visible livreur' : '🚫 Masqué livreur';
            telephoneIndicator.className = `text-xs ${isVisible ? 'text-green-600' : 'text-red-600'}`;
        }

        this.log(`📞 Téléphone ${isVisible ? 'visible' : 'masqué'} pour commande ${commandeId}`);
    },

    /**
     * Mise à jour statut commande
     */
    updateCommandeStatus(commandeId, nouveauStatut, btnElement) {
        const commandeCard = document.querySelector(`[data-commande-id="${commandeId}"]`);
        if (!commandeCard) return;

        // Mettre à jour l'attribut data-statut
        commandeCard.setAttribute('data-statut', nouveauStatut);
        
        // Mettre à jour le badge de statut (admin)
        const statutBadge = commandeCard.querySelector('.statut-badge');
        if (statutBadge) {
            if (nouveauStatut === 'livree') {
                statutBadge.textContent = '✅ Livrée';
                statutBadge.className = 'statut-badge px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800';
            } else if (nouveauStatut === 'validee') {
                statutBadge.textContent = '✅ Validée';
                statutBadge.className = 'statut-badge px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800';
            } else {
                statutBadge.textContent = '⏳ En cours';
                statutBadge.className = 'statut-badge px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800';
            }
        }

        // Transformer le bouton (livreur)
        if (btnElement && nouveauStatut === 'livree') {
            btnElement.innerHTML = '✅ LIVRAISON VALIDÉE';
            btnElement.className = 'w-full bg-gray-100 text-gray-600 font-bold py-3 px-4 rounded-lg text-center';
            btnElement.disabled = true;
        }
    },

    /**
     * Animation de succès
     */
    animateSuccess(element) {
        element.style.transform = 'scale(1.1)';
        element.style.backgroundColor = '#10b981';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.transition = 'all 0.3s ease';
        }, 200);
    },

    /**
     * Animation changement d'état
     */
    animateStateChange(element) {
        element.style.transform = 'scale(0.95)';
        element.style.backgroundColor = '#f59e0b';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.transition = 'all 0.3s ease';
        }, 200);
    },

    /**
     * Calcul des statistiques
     */
    calculerStats() {
        const commandes = document.querySelectorAll('[data-commande-id]');
        this.stats.totalCommandes = commandes.length;
        this.stats.commandesLivrees = document.querySelectorAll('[data-statut="livree"]').length;
        this.stats.commandesEnCours = this.stats.totalCommandes - this.stats.commandesLivrees;
        
        this.updateCounters();
    },

    /**
     * Mise à jour des compteurs
     */
    updateCounters() {
        // Compteur admin
        const livreesCount = document.getElementById('livrees-count');
        const enCoursCount = document.getElementById('en-cours-count');
        
        if (livreesCount) livreesCount.textContent = this.stats.commandesLivrees;
        if (enCoursCount) enCoursCount.textContent = this.stats.commandesEnCours;
        
        // Compteur mobile livreur
        const livreesMobile = document.getElementById('livrees-mobile');
        if (livreesMobile) livreesMobile.textContent = this.stats.commandesLivrees;
        
        // Mettre à jour la barre de progression (admin)
        this.updateProgressBar();
    },

    /**
     * Mise à jour barre de progression
     */
    updateProgressBar() {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        
        if (progressBar && this.stats.totalCommandes > 0) {
            const pourcentage = Math.round((this.stats.commandesLivrees / this.stats.totalCommandes) * 100);
            
            progressBar.style.width = `${pourcentage}%`;
            
            if (progressText) {
                progressText.textContent = `${pourcentage}%`;
            }
            
            // Changer la couleur selon le pourcentage
            if (pourcentage === 100) {
                progressBar.className = 'h-full bg-green-500 rounded-full transition-all duration-300';
            } else if (pourcentage >= 75) {
                progressBar.className = 'h-full bg-blue-500 rounded-full transition-all duration-300';
            } else if (pourcentage >= 50) {
                progressBar.className = 'h-full bg-yellow-500 rounded-full transition-all duration-300';
            } else {
                progressBar.className = 'h-full bg-orange-500 rounded-full transition-all duration-300';
            }
        }
    },

    /**
     * Dashboard temps réel (Admin)
     */
    updateDashboard() {
        // Calcul pourcentage progression
        const progression = this.stats.totalCommandes > 0 
            ? Math.round((this.stats.commandesLivrees / this.stats.totalCommandes) * 100)
            : 0;
            
        this.log(`📊 Progression: ${progression}% (${this.stats.commandesLivrees}/${this.stats.totalCommandes})`);
        
        // Mettre à jour la barre de progression
        this.updateProgressBar();
    },

    /**
     * Timer de rafraîchissement automatique (Admin)
     */
    initRefreshTimer() {
        if (this.config.role !== 'admin') return;
        
        setInterval(() => {
            this.rafraichirStats();
        }, 30000); // Toutes les 30 secondes
    },

    /**
     * Optimisations mobile
     */
    initMobileOptimizations() {
        // Désactiver le zoom sur les inputs
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                document.querySelector('meta[name=viewport]').setAttribute(
                    'content', 'width=device-width, initial-scale=1, maximum-scale=1'
                );
            });
        });

        // Gestion orientation
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.optimizeMobileInterface();
            }, 500);
        });
    },

    /**
     * Interface mobile adaptative
     */
    optimizeMobileInterface() {
        const isMobile = window.innerWidth < 768;
        const isLandscape = window.innerWidth > window.innerHeight;
        
        if (isMobile && isLandscape) {
            document.body.classList.add('mobile-landscape');
        } else {
            document.body.classList.remove('mobile-landscape');
        }
    },

    /**
     * Mode hors ligne
     */
    enableOfflineMode() {
        if ('serviceWorker' in navigator) {
            // TODO: Implémenter service worker pour cache offline
            this.log('🔄 Mode offline disponible');
        }
        
        // Détecter perte de connexion
        window.addEventListener('offline', () => {
            this.showOfflineIndicator(true);
        });
        
        window.addEventListener('online', () => {
            this.showOfflineIndicator(false);
            this.rafraichirStats();
        });
    },

    /**
     * Indicateur hors ligne
     */
    showOfflineIndicator(show) {
        let indicator = document.getElementById('offline-indicator');
        
        if (!indicator && show) {
            indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.className = 'offline-indicator';
            indicator.innerHTML = '📵 Mode hors ligne - Certaines fonctionnalités sont limitées';
            document.body.appendChild(indicator);
        }
        
        if (indicator) {
            indicator.classList.toggle('show', show);
        }
    },

    /**
     * Événements d'impression
     */
    bindPrintEvents() {
        const printBtn = document.getElementById('print-planning');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }
    },

    /**
     * Détection de connexion
     */
    detecterConnexion() {
        const isOnline = navigator.onLine;
        if (!isOnline) {
            this.showOfflineIndicator(true);
        }
    },

    /**
     * Rafraîchir les stats via AJAX
     */
    async rafraichirStats() {
        try {
            // TODO: Implémenter endpoint pour rafraîchir les stats
            this.log('🔄 Rafraîchissement des stats...');
        } catch (error) {
            this.log('❌ Erreur rafraîchissement:', error);
        }
    },

    /**
     * Rafraîchir la page
     */
    rafraichirPage() {
        this.showToast('🔄 Rafraîchissement...', 'info');
        setTimeout(() => {
            window.location.reload();
        }, 500);
    },

    /**
     * État de chargement
     */
    setLoading(element, loading) {
        if (loading) {
            element.classList.add('loading');
            element.disabled = true;
            
            // Ajouter spinner
            const originalText = element.innerHTML;
            element.dataset.originalText = originalText;
            element.innerHTML = '⏳ Chargement...';
        } else {
            element.classList.remove('loading');
            element.disabled = false;
            
            // Restaurer le texte original
            if (element.dataset.originalText) {
                element.innerHTML = element.dataset.originalText;
                delete element.dataset.originalText;
            }
        }
    },

    /**
     * Notifications toast
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="flex items-center p-4 rounded-lg shadow-lg">
                <span class="mr-3 text-xl">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <span class="font-medium">${message}</span>
            </div>
        `;
        
        // Styles dynamiques selon le type
        const styles = {
            success: 'bg-green-100 border-green-200 text-green-800',
            error: 'bg-red-100 border-red-200 text-red-800',
            warning: 'bg-yellow-100 border-yellow-200 text-yellow-800',
            info: 'bg-blue-100 border-blue-200 text-blue-800'
        };
        
        toast.firstElementChild.className += ` ${styles[type] || styles.info}`;
        
        // Positionnement
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(toast);
        
        // Animation d'entrée
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Suppression automatique
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    },

    /**
     * Logging avec couleurs
     */
    log(message, data = null) {
        if (!this.config.debug) return;
        
        const style = 'color: #10b981; font-weight: bold;';
        console.log(`%c[LivraisonDuJour] ${message}`, style, data || '');
    }
};

// Export global
window.LivraisonDuJour = LivraisonDuJour;