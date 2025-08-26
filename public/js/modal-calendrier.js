/**
 * Module Modal Calendrier Ponctuelle
 * Gestion de la modal calendrier pour les commandes ponctuelles
 */
const ModalCalendrierPonctuelle = {
    
    // Variables d'état
    modalElement: null,
    moisActuel: new Date().getMonth(),
    anneeActuelle: new Date().getFullYear(),
    dateSelectionnee: null,
    
    /**
     * Ouvrir la modal calendrier
     */
    ouvrir: function() {
        // Réinitialiser les variables
        this.moisActuel = new Date().getMonth();
        this.anneeActuelle = new Date().getFullYear();
        this.dateSelectionnee = null;
        
        this.creer();
    },
    
    /**
     * Créer la modal calendrier
     */
    creer: function() {
        // Supprimer la modal existante si elle existe
        if (this.modalElement) {
            this.modalElement.remove();
        }
        
        const modalHTML = `
            <div id="modal-calendrier-ponctuelle" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style="backdrop-filter: blur(4px);">
                <div class="bg-white rounded-2xl p-6 w-11/12 max-w-2xl shadow-2xl">
                    
                    <!-- Header de la modal -->
                    <div class="flex justify-between items-center mb-6 pb-4 border-b-4 border-purple-600">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900">⚡ COMMANDE PONCTUELLE</h2>
                            <p class="text-gray-600">Sélectionnez une date pour créer une commande</p>
                        </div>
                        <button id="btn-fermer-modal-calendrier" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition-all duration-200">
                            ✕ FERMER
                        </button>
                    </div>
                    
                    <!-- Navigation mois -->
                    <div class="nav-mois">
                        <button id="btn-mois-precedent">← Précédent</button>
                        <h3 id="titre-mois-annee"></h3>
                        <button id="btn-mois-suivant">Suivant →</button>
                    </div>
                    
                    <!-- En-têtes des jours -->
                    <div class="calendrier-header">
                        <div>LUN</div>
                        <div>MAR</div>
                        <div>MER</div>
                        <div>JEU</div>
                        <div>VEN</div>
                        <div>SAM</div>
                        <div>DIM</div>
                    </div>
                    
                    <!-- Grille calendrier -->
                    <div id="grille-calendrier" class="calendrier-grid-modal">
                        <!-- Généré dynamiquement -->
                    </div>
                    
                    <!-- Footer simplifié -->
                    <div class="mt-6 pt-4 border-t-2 border-gray-200 flex justify-center">
                        <button id="btn-annuler-calendrier" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold transition-all duration-200">
                            ✕ Fermer
                        </button>
                    </div>
                    
                </div>
            </div>
        `;
        
        // Injecter la modal dans le DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modalElement = document.getElementById('modal-calendrier-ponctuelle');
        
        // Générer le calendrier initial
        this.genererCalendrier();
        
        // Ajouter les event listeners
        this.ajouterEventListeners();
    },
    
    /**
     * Générer le calendrier pour le mois/année actuel
     */
    genererCalendrier: function() {
        const nomsDesMois = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        
        // Mettre à jour le titre
        document.getElementById('titre-mois-annee').textContent = 
            `${nomsDesMois[this.moisActuel]} ${this.anneeActuelle}`;
        
        // Obtenir le premier jour du mois et le nombre de jours
        const premierJour = new Date(this.anneeActuelle, this.moisActuel, 1);
        const dernierJour = new Date(this.anneeActuelle, this.moisActuel + 1, 0);
        const nombreDeJours = dernierJour.getDate();
        
        // Calculer le décalage (lundi = 0, dimanche = 6)
        let decalage = premierJour.getDay() - 1;
        if (decalage < 0) decalage = 6; // Dimanche devient 6
        
        // Générer la grille
        const grille = document.getElementById('grille-calendrier');
        grille.innerHTML = '';
        
        // Date d'aujourd'hui pour comparaison
        const aujourdhui = new Date();
        const estAujourdhui = (jour) => {
            const dateJour = new Date(this.anneeActuelle, this.moisActuel, jour);
            return dateJour.toDateString() === aujourdhui.toDateString();
        };
        
        const estDansLePasse = (jour) => {
            const dateJour = new Date(this.anneeActuelle, this.moisActuel, jour);
            const aujourdhuiSansHeure = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate());
            const dateJourSansHeure = new Date(dateJour.getFullYear(), dateJour.getMonth(), dateJour.getDate());
            return dateJourSansHeure < aujourdhuiSansHeure;
        };
        
        // Ajouter les cellules vides pour le décalage
        for (let i = 0; i < decalage; i++) {
            const celluleVide = document.createElement('div');
            celluleVide.className = 'calendrier-jour passe';
            grille.appendChild(celluleVide);
        }
        
        // Ajouter les jours du mois
        for (let jour = 1; jour <= nombreDeJours; jour++) {
            const celluleJour = document.createElement('div');
            celluleJour.className = 'calendrier-jour';
            celluleJour.textContent = jour;
            celluleJour.setAttribute('data-jour', jour);
            
            // Ajouter les classes appropriées
            if (estAujourdhui(jour)) {
                celluleJour.classList.add('aujourd-hui');
            } else if (estDansLePasse(jour)) {
                celluleJour.classList.add('passe');
            }
            
            // Event listener pour sélection
            if (!estDansLePasse(jour)) {
                celluleJour.addEventListener('click', () => {
                    this.selectionnerDate(jour);
                });
            }
            
            grille.appendChild(celluleJour);
        }
    },
    
    /**
     * Sélectionner une date et rediriger
     */
    selectionnerDate: function(jour) {
        // Enregistrer la date sélectionnée
        this.dateSelectionnee = new Date(this.anneeActuelle, this.moisActuel, jour);
        
        // Format YYYY-MM-DD
        const dateFormatee = `${this.anneeActuelle}-${String(this.moisActuel + 1).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
        
        // Redirection immédiate vers le formulaire
        window.location.href = `${window.routeLivraisonAjouterCommande}?date=${dateFormatee}`;
    },
    
    /**
     * Ajouter les event listeners
     */
    ajouterEventListeners: function() {
        const self = this;
        
        // Fermer la modal
        document.getElementById('btn-fermer-modal-calendrier').addEventListener('click', () => this.fermer());
        document.getElementById('btn-annuler-calendrier').addEventListener('click', () => this.fermer());
        
        // Clic sur l'overlay pour fermer
        this.modalElement.addEventListener('click', function(e) {
            if (e.target === self.modalElement) {
                self.fermer();
            }
        });
        
        // Navigation mois
        document.getElementById('btn-mois-precedent').addEventListener('click', () => {
            this.moisActuel--;
            if (this.moisActuel < 0) {
                this.moisActuel = 11;
                this.anneeActuelle--;
            }
            this.genererCalendrier();
        });
        
        document.getElementById('btn-mois-suivant').addEventListener('click', () => {
            this.moisActuel++;
            if (this.moisActuel > 11) {
                this.moisActuel = 0;
                this.anneeActuelle++;
            }
            this.genererCalendrier();
        });
    },
    
    /**
     * Fermer la modal
     */
    fermer: function() {
        if (this.modalElement) {
            this.modalElement.remove();
            this.modalElement = null;
            this.moisActuel = new Date().getMonth();
            this.anneeActuelle = new Date().getFullYear();
        }
    }
};

// Export global
window.ModalCalendrierPonctuelle = ModalCalendrierPonctuelle;

// Fonction globale pour compatibilité
window.ouvrirModalCalendrierPonctuelle = function() {
    ModalCalendrierPonctuelle.ouvrir();
};