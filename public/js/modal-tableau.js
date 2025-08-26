/**
 * Modal Tableau Excel - VERSION STABLE MOBILE AVEC FIX ENCODAGE
 * ✅ SUPPRESSION du listener orientationchange problématique
 * ✅ Compatible Vue Semaine + Vue Mois + Portrait + Paysage  
 * ✅ Même tableau partout - AUCUNE perte de données
 * ✅ NOUVEAU : Colonne RÉPARTITION avec calcul automatique
 * ✅ FIX : Nettoyage des caractères d'encodage problématiques
 */

// ==========================================
// FONCTION DE NETTOYAGE DES CARACTÈRES
// ==========================================
function cleanStringForDisplay(str) {
    if (!str) return '';
    
    // Convertir en string si nécessaire
    str = String(str);
    
    // Remplacer les emojis problématiques par des caractères ASCII
    return str
        .replace(/❌/g, '[X]')
        .replace(/✅/g, '[OK]')
        .replace(/✓/g, '[v]')
        .replace(/🔄/g, '[R]')
        .replace(/⚡/g, '[!]')
        .replace(/🔸/g, '[*]')
        .replace(/📅/g, '[Cal]')
        .replace(/📊/g, '[Chart]')
        .replace(/👁️/g, '[Eye]')
        .replace(/✏️/g, '[Edit]')
        .replace(/🗑️/g, '[Del]')
        .replace(/➕/g, '[+]')
        .replace(/✕/g, '[x]')
        .replace(/📭/g, '[Empty]')
        .replace(/👤/g, '[User]')
        .replace(/📞/g, '[Tel]')
        .replace(/📦/g, '[Box]')
        .replace(/📍/g, '[Pin]')
        .replace(/🧮/g, '[Calc]')
        .replace(/🏷️/g, '[Tag]')
        .replace(/📋/g, '[Clip]')
        // Nettoyer autres caractères non-ASCII problématiques
        .replace(/[^\x00-\x7F]/g, function(char) {
            const code = char.charCodeAt(0);
            // Garder les caractères latins étendus (é, è, à, etc.)
            if (code >= 192 && code <= 255) return char;
            // Remplacer les autres
            return '';
        });
}

const ModalTableauExcel = {
    
    // Variables d'état
    modalElement: null,
    modalFicheElement: null,
    commandesJourActuel: [],
    jourActuel: '',
    dateActuelle: '',
    jourNomActuel: '',
    
    /**
     * ✅ FONCTION PRINCIPALE : Compatible toutes vues
     */
    ouvrir: function(jourFormate, commandesData) {
        try {
            // Support des deux formats d'appel
            if (typeof jourFormate === 'string' && Array.isArray(commandesData)) {
                // Format 1 : Vue Mensuelle → données formatées
                this.ouvrirAvecDonnees(jourFormate, commandesData);
            } else {
                // Format 2 : Vue Semaine → élément DOM
                this.ouvrirAvecAjax(jourFormate);
            }
        } catch (error) {
            console.error('Erreur ModalTableauExcel.ouvrir:', error);
            PlanningUtils.afficherErreur('Erreur ouverture: ' + error.message);
        }
    },
    
    /**
     * ✅ Vue Mensuelle : Données déjà formatées
     */
    ouvrirAvecDonnees: function(jourFormate, commandesData) {
        console.log('Vue Mensuelle → Données:', { jourFormate, commandesData });
        
        this.jourNomActuel = cleanStringForDisplay(jourFormate);
        this.commandesJourActuel = commandesData;
        
        // Extraire date depuis données
        if (commandesData.length > 0 && commandesData[0].date_livraison) {
            this.dateActuelle = this.normaliserFormatDate(commandesData[0].date_livraison);
        } else {
            this.dateActuelle = new Date().toISOString().split('T')[0];
        }
        
        // Créer modal directement
        this.creer({ commandes: commandesData, success: true });
    },
    
    /**
     * ✅ Vue Semaine : Récupération AJAX
     */
    ouvrirAvecAjax: async function(elementClique) {
        let jour, dateJour, jourNom;
        
        if (typeof elementClique === 'string') {
            // Ancien format : ouvrirModalTableauExcel('jeudi')
            jour = elementClique;
            dateJour = this.calculerDateJour(jour, window.dateActuelle || new Date().toISOString().split('T')[0]);
            jourNom = jour.toUpperCase();
        } else {
            // Nouveau format : élément DOM avec data-attributes
            const dayColumn = elementClique.closest('.day-column');
            if (dayColumn) {
                jour = dayColumn.getAttribute('data-jour');
                dateJour = dayColumn.getAttribute('data-date');
                jourNom = dayColumn.getAttribute('data-jour-nom');
            } else {
                throw new Error('Données du jour introuvables');
            }
        }
        
        this.jourActuel = jour;
        this.dateActuelle = dateJour;
        this.jourNomActuel = cleanStringForDisplay(jourNom);
        
        console.log('Vue Semaine → AJAX:', { jour, dateJour, jourNom });
        
        // Loader
        PlanningUtils.afficherLoader('Chargement tableau...');
        
        // Requête AJAX
        const response = await fetch(`/admin/livraison/ajax/commandes-jour/${dateJour}`, {
            method: 'GET',
            headers: PlanningUtils.getAjaxHeaders()
        });
        
        const data = await response.json();
        
        if (data.success) {
            this.commandesJourActuel = data.commandes;
            this.creer(data);
        } else {
            PlanningUtils.afficherErreur('Erreur chargement: ' + data.error);
        }
    },
    
    /**
     * ✅ Normaliser formats de date
     */
    normaliserFormatDate: function(dateString) {
        try {
            // Format Y-m-d déjà bon
            if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                return dateString;
            }
            
            // Conversion standard
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
            
            // Fallback
            console.warn('Date invalide:', dateString);
            return new Date().toISOString().split('T')[0];
            
        } catch (error) {
            console.error('Erreur normalisation date:', error);
            return new Date().toISOString().split('T')[0];
        }
    },
    
    /**
     * ✅ Calculer date jour (fallback)
     */
    calculerDateJour: function(jour, dateBase) {
        const joursMap = {
            'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4,
            'vendredi': 5, 'samedi': 6, 'dimanche': 0
        };
        
        const date = new Date(dateBase + 'T00:00:00');
        const startOfWeek = new Date(date);
        
        // Aller au lundi
        const dayOfWeek = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        
        // Ajouter jours selon jour demandé
        const jourCible = joursMap[jour.toLowerCase()];
        if (jourCible === 0) { // Dimanche
            startOfWeek.setDate(startOfWeek.getDate() + 6);
        } else {
            startOfWeek.setDate(startOfWeek.getDate() + (jourCible - 1));
        }
        
        return startOfWeek.toISOString().split('T')[0];
    },
    
    /**
     * ✅ CORRIGÉ : Créer modal SANS optimisations paysage problématiques
     * ✅ NOUVEAU : Colonne RÉPARTITION ajoutée
     */
    creer: function(data) {
        // Supprimer modal existante
        if (this.modalElement) {
            this.modalElement.remove();
        }
        
        // Date formatée
        const dateFormatee = new Date(this.normaliserFormatDate(this.dateActuelle)).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        // ✅ SIMPLIFIÉ : Pas de détection paysage compliquée
        const modalHTML = `
            <div id="modal-tableau-excel" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" style="backdrop-filter: blur(4px);">
                <div class="bg-white rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-5xl lg:max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl border-2 sm:border-4 border-gray-800">
                    
                    <!-- Header responsive -->
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 p-3 sm:p-6 border-b-2 sm:border-b-4 border-gray-800">
                        <div class="text-center sm:text-left">
                            <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">[Chart] TABLEAU DÉTAILLÉ</h2>
                            <p class="text-sm sm:text-base text-gray-600">${this.jourNomActuel} • ${dateFormatee} • ${data.commandes.length} commande(s)</p>
                        </div>
                        <div class="flex gap-2 sm:gap-3 justify-center sm:justify-end">
                            <button id="btn-ajouter-commande-excel" class="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg font-bold transition-all text-sm sm:text-base min-h-[44px]">
                                [+] AJOUTER
                            </button>
                            <button id="btn-fermer-modal-excel" class="bg-gray-500 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-sm sm:text-base min-h-[44px]">
                                [x] FERMER
                            </button>
                        </div>
                    </div>
                    
                    <!-- Tableau avec scroll horizontal -->
                    <div class="overflow-auto" style="max-height: 70vh; scrollbar-width: thin;">
                        <table class="w-full border-2 sm:border-4 border-gray-800" style="border-collapse: collapse; min-width: 900px;">
                            
                            <!-- En-tête MODIFIÉ avec nouvelle colonne -->
                            <thead>
                                <tr class="bg-gray-800 text-white">
                                    <th class="border-2 border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm">#</th>
                                    <th class="border-2 border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm">CLIENT</th>
                                    <th class="border-2 border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-xs sm:text-sm">QTÉ</th>
                                    <th class="border-2 border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm">GOÛTS IMPOSÉS</th>
                                    <th class="border-2 border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm">GOÛT EXCLU</th>
                                    <th class="border-2 border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm bg-purple-700">RÉPARTITION</th>
                                    <th class="border-2 border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-xs sm:text-sm">TYPE</th>
                                    <th class="border-2 border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-xs sm:text-sm">STATUT</th>
                                    <th class="border-2 border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-xs sm:text-sm">FICHE</th>
                                    <th class="border-2 border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-xs sm:text-sm">ACTIONS</th>
                                </tr>
                            </thead>
                            
                            <!-- Corps du tableau -->
                            <tbody id="tbody-commandes-excel">
                                ${this.genererLignesTableau(data.commandes)}
                            </tbody>
                            
                        </table>
                    </div>
                    
                    <!-- Footer statistiques -->
                    <div class="p-3 sm:p-6 border-t-2 border-gray-200">
                        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-center">
                            <div class="bg-blue-50 p-2 sm:p-3 rounded-lg">
                                <div class="text-lg sm:text-xl font-bold text-blue-600">${data.commandes.length}</div>
                                <div class="text-xs sm:text-sm text-gray-600">Total</div>
                            </div>
                            <div class="bg-green-50 p-2 sm:p-3 rounded-lg">
                                <div class="text-lg sm:text-xl font-bold text-green-600">${data.commandes.filter(c => c.statut === 'validee').length}</div>
                                <div class="text-xs sm:text-sm text-gray-600">Validées</div>
                            </div>
                            <div class="bg-orange-50 p-2 sm:p-3 rounded-lg">
                                <div class="text-lg sm:text-xl font-bold text-orange-600">${data.commandes.filter(c => c.statut === 'en_attente').length}</div>
                                <div class="text-xs sm:text-sm text-gray-600">En attente</div>
                            </div>
                            <div class="bg-gray-50 p-2 sm:p-3 rounded-lg">
                                <div class="text-lg sm:text-xl font-bold text-gray-600">${data.commandes.reduce((sum, c) => sum + (c.total_quantite || c.quantite || 0), 0)}</div>
                                <div class="text-xs sm:text-sm text-gray-600">Quantité</div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
            
            <style>
                /* CSS simple et stable */
                #modal-tableau-excel {
                    touch-action: manipulation;
                }
                
                #modal-tableau-excel button {
                    min-height: 44px;
                    touch-action: manipulation;
                    -webkit-tap-highlight-color: transparent;
                }
                
                /* Mobile : scroll horizontal */
                @media (max-width: 768px) {
                    #modal-tableau-excel table {
                        min-width: 900px !important;
                        font-size: 0.75rem !important;
                    }
                    
                    #modal-tableau-excel th,
                    #modal-tableau-excel td {
                        padding: 4px 8px !important;
                        font-size: 0.75rem !important;
                        white-space: nowrap;
                    }
                    
                    #modal-tableau-excel .btn-voir-fiche,
                    #modal-tableau-excel .btn-modifier-excel,
                    #modal-tableau-excel .btn-supprimer-excel {
                        padding: 4px 6px !important;
                        font-size: 0.7rem !important;
                        min-height: 36px !important;
                    }
                }
                
                /* Scroll optimisé */
                #modal-tableau-excel .overflow-auto {
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: thin;
                    scrollbar-color: #6B7280 #F3F4F6;
                }
                
                #modal-tableau-excel .overflow-auto::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                
                #modal-tableau-excel .overflow-auto::-webkit-scrollbar-track {
                    background: #F3F4F6;
                }
                
                #modal-tableau-excel .overflow-auto::-webkit-scrollbar-thumb {
                    background: #6B7280;
                    border-radius: 3px;
                }
                
                /* Animation simple */
                #modal-tableau-excel > div {
                    animation: modalSlideUp 0.3s ease-out;
                }
                
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                
                /* ✅ NOUVEAU : Style colonne répartition */
                .repartition-cell {
                    background-color: #faf5ff !important;
                    border-left: 3px solid #a855f7 !important;
                    font-family: monospace;
                    font-weight: 600;
                    color: #7c3aed;
                }
            </style>
        `;
        
        // Injecter dans DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modalElement = document.getElementById('modal-tableau-excel');
        
        // Event listeners SANS optimisations problématiques
        this.ajouterEventListeners();
    },
    
    /**
     * ✅ MODIFIÉ : Générer lignes tableau AVEC colonne répartition ET nettoyage caractères
     */
    genererLignesTableau: function(commandes) {
        if (commandes.length === 0) {
            return `
                <tr>
                    <td colspan="10" class="border-2 border-gray-300 px-4 py-8 text-center text-gray-500">
                        <div class="text-base sm:text-lg">[Empty] Aucune commande pour ce jour</div>
                        <div class="text-xs sm:text-sm mt-2">Cliquez sur "[+]" pour créer une nouvelle commande</div>
                    </td>
                </tr>
            `;
        }
        
        return commandes.map((commande, index) => {
            // Nettoyer toutes les chaînes avec la fonction de nettoyage
            const clientNom = cleanStringForDisplay(commande.client_nom || commande.client || 'Client inconnu');
            const quantite = commande.total_quantite || commande.quantite || 0;
            const goutsImposes = cleanStringForDisplay(commande.gouts_imposes_text || commande.gouts_imposes || 'Aucun');
            const goutExclu = cleanStringForDisplay(commande.gout_exclu_text || commande.gout_exclu || 'Aucun');
            const commandeId = commande.id || `virtual_${index}`;
            
            // ✅ NOUVEAU : Récupérer la répartition calculée (nettoyée aussi)
            const repartitionCalculee = cleanStringForDisplay(commande.repartition_calculee || this.calculerRepartitionFallback(commande));
            
            // Détection récurrente
            const isRecurrente = commande.is_virtuelle || commande.commande_origine_id || commande.est_recurrente;
            
            // Type simple (nettoyé)
            let typeAffichage = cleanStringForDisplay(commande.type_badge || commande.type_commande || 'habituelle');
            if (isRecurrente) {
                typeAffichage += ' <span class="bg-purple-100 text-purple-800 px-1 py-0.5 rounded text-xs font-bold">RÉC</span>';
            }
            
            // Statut simple
            const statut = commande.statut || 'en_attente';
            const statutClasses = {
                'en_attente': 'bg-orange-100 text-orange-800',
                'validee': 'bg-green-100 text-green-800',
                'livree': 'bg-blue-100 text-blue-800'
            };
            const classe = statutClasses[statut] || statutClasses['en_attente'];
            const texteStatut = statut === 'en_attente' ? 'ATTENTE' : statut.toUpperCase();
            const statutAffichage = `<span class="px-2 py-1 rounded text-xs font-bold ${classe}">${texteStatut}</span>`;
            
            return `
                <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-yellow-50 transition-colors ${isRecurrente ? 'border-l-4 border-purple-400' : ''}" data-commande-index="${index}">
                    <td class="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-mono text-xs sm:text-sm">${index + 1}</td>
                    <td class="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 font-bold text-xs sm:text-sm">${clientNom}</td>
                    <td class="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-sm sm:text-lg">${quantite}</td>
                    <td class="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                        <span class="font-mono">${goutsImposes === 'Aucun' ? '<em class="text-gray-400">Aucun</em>' : goutsImposes}</span>
                    </td>
                    <td class="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                        <span class="gout-exclu font-mono">${goutExclu === 'Aucun' ? '<em class="text-gray-400">Aucun</em>' : goutExclu}</span>
                    </td>
                    <td class="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm repartition-cell">
                        <span class="font-mono">${repartitionCalculee}</span>
                    </td>
                    <td class="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center text-xs">${typeAffichage}</td>
                    <td class="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center text-xs">${statutAffichage}</td>
                    <td class="border-2 border-gray-300 px-1 sm:px-2 py-2 sm:py-3 text-center">
                        <button class="btn-voir-fiche bg-purple-500 hover:bg-purple-600 text-white px-2 sm:px-3 py-1 rounded text-xs font-bold transition-all min-h-[32px]" 
                                data-commande-id="${commandeId}"
                                title="Voir informations client">
                            [Eye] <span class="hidden sm:inline">FICHE</span>
                        </button>
                    </td>
                    <td class="border-2 border-gray-300 px-1 sm:px-2 py-2 sm:py-3 text-center">
                        <div class="flex flex-col gap-1">
                            <button class="btn-modifier-excel bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs font-bold transition-all min-h-[32px]" 
                                    data-commande-id="${commandeId}"
                                    data-is-recurrente="${isRecurrente}"
                                    title="Modifier commande">
                                [Edit] <span class="hidden sm:inline">Modifier</span>
                            </button>
                            <button class="btn-supprimer-excel bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs font-bold transition-all min-h-[32px]" 
                                    data-commande-id="${commandeId}"
                                    title="Supprimer commande">
                                [Del] <span class="hidden sm:inline">Supprimer</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },
    
    /**
     * ✅ NOUVELLE MÉTHODE : Calcul répartition fallback si pas dans les données
     */
    calculerRepartitionFallback: function(commande) {
        // Si la répartition n'est pas calculée côté serveur, retourner un message
        const quantite = commande.total_quantite || commande.quantite || 0;
        
        if (quantite === 0) {
            return '<em class="text-gray-400">Aucune quantité</em>';
        }
        
        // Fallback simple (remplacer par un vrai calcul si nécessaire)
        return '<em class="text-blue-500">Calcul en cours...</em>';
    },
    
    /**
     * ✅ CORRIGÉ : Event listeners SANS listener orientationchange
     */
    ajouterEventListeners: function() {
        const self = this;
        
        // Fermer modal
        document.getElementById('btn-fermer-modal-excel').addEventListener('click', () => this.fermer());
        
        // Clic overlay pour fermer
        this.modalElement.addEventListener('click', function(e) {
            if (e.target === self.modalElement) {
                self.fermer();
            }
        });
        
        // Bouton ajouter
        document.getElementById('btn-ajouter-commande-excel').addEventListener('click', function() {
            window.location.href = window.routeLivraisonCommandeLendemain || '/admin/livraison/commande-lendemain';
        });
        
        // Boutons voir fiche
        document.querySelectorAll('.btn-voir-fiche').forEach(btn => {
            btn.addEventListener('click', function() {
                const commandeId = this.getAttribute('data-commande-id');
                self.ouvrirFicheClient(commandeId);
            });
        });
        
        // Boutons modifier
        document.querySelectorAll('.btn-modifier-excel').forEach(btn => {
            btn.addEventListener('click', function() {
                const commandeId = this.getAttribute('data-commande-id');
                const isRecurrente = this.getAttribute('data-is-recurrente') === 'true';
                
                if (isRecurrente) {
                    self.ouvrirModalModificationPlanning(commandeId);
                } else {
                    window.location.href = `/admin/livraison/modifier-commande/${commandeId}`;
                }
            });
        });
        
        // Boutons supprimer
        document.querySelectorAll('.btn-supprimer-excel').forEach(btn => {
            btn.addEventListener('click', function() {
                const commandeId = this.getAttribute('data-commande-id');
                self.confirmerSuppression(commandeId);
            });
        });
        
        // Styliser goûts exclus
        this.stylerGoutsExclus();
        
        // Touche Échap
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape' && self.modalElement) {
                self.fermer();
                document.removeEventListener('keydown', escHandler);
            }
        });
        
        // ✅ SUPPRIMÉ : Le listener orientationchange problématique !
        // Plus de recréation de modal = Plus de bugs !
    },
    
    /**
     * ✅ Redirection directe pour commandes récurrentes
     */
    ouvrirModalModificationPlanning: function(commandeId) {
        console.log('Modification commande récurrente:', commandeId);
        
        let commandeIdAModifier;
        
        // Gestion IDs virtuels
        if (typeof commandeId === 'string' && commandeId.startsWith('virtual_')) {
            const index = parseInt(commandeId.replace('virtual_', ''));
            const commande = this.commandesJourActuel[index];
            
            if (commande && commande.commande_origine_id) {
                commandeIdAModifier = commande.commande_origine_id;
            } else {
                PlanningUtils.afficherErreur('Commande récurrente sans origine');
                return;
            }
        } else {
            // ID normal
            const commande = this.commandesJourActuel.find(c => c.id == commandeId);
            
            if (!commande) {
                PlanningUtils.afficherErreur('Commande non trouvée');
                return;
            }
            
            commandeIdAModifier = commande.commande_origine_id || commande.id;
        }
        
        console.log('Redirection vers:', commandeIdAModifier);
        window.location.href = `/admin/livraison/modifier-commande/${commandeIdAModifier}`;
    },

    /**
     * ✅ Fiche client avec AJAX systématique
     */
    ouvrirFicheClient: async function(commandeId) {
        console.log('Fiche client pour:', commandeId);
        
        try {
            let commandeIdReel = commandeId;
            
            // Gestion IDs virtuels
            if (typeof commandeId === 'string' && commandeId.startsWith('virtual_')) {
                const index = parseInt(commandeId.replace('virtual_', ''));
                const commandeLocale = this.commandesJourActuel[index];
                
                if (commandeLocale && commandeLocale.id) {
                    commandeIdReel = commandeLocale.id;
                } else if (commandeLocale && commandeLocale.commande_origine_id) {
                    commandeIdReel = commandeLocale.commande_origine_id;
                } else {
                    PlanningUtils.afficherErreur('ID virtuel sans référence');
                    return;
                }
            }
            
            PlanningUtils.afficherLoader('Chargement détails...');
            
            // AJAX pour détails complets
            const response = await fetch(`/admin/livraison/ajax/commande-details/${commandeIdReel}`, {
                method: 'GET',
                headers: PlanningUtils.getAjaxHeaders()
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.creerModalFicheClient(data.commande);
            } else {
                PlanningUtils.afficherErreur('Erreur chargement: ' + data.error);
            }
            
        } catch (error) {
            PlanningUtils.afficherErreur('Erreur connexion: ' + error.message);
        }
    },

    /**
     * ✅ Modal fiche client responsive AVEC nettoyage caractères
     */
    creerModalFicheClient: function(commande) {
        // Supprimer existante
        if (this.modalFicheElement) {
            this.modalFicheElement.remove();
        }

        // Données avec fallbacks ET nettoyage
        const clientNom = cleanStringForDisplay(commande.client_nom || commande.client || 'Client inconnu');
        const telephone = cleanStringForDisplay(commande.telephone || 'Non renseigné');
        const quantite = commande.total_quantite || commande.quantite || 0;
        const adresse = cleanStringForDisplay(commande.adresse_complete || commande.adresse || 'Non renseignée');
        const goutsImposes = cleanStringForDisplay(commande.gouts_imposes_text || commande.gouts_imposes || 'Aucun goût imposé');
        const goutExclu = cleanStringForDisplay(commande.gout_exclu_text || commande.gout_exclu || 'Aucun goût exclu');
        
        // ✅ NOUVEAU : Afficher la répartition dans la fiche client
        const repartitionCalculee = cleanStringForDisplay(commande.repartition_calculee || 'Calcul en cours...');
        
        const dateLivraison = this.dateActuelle ? 
            new Date(this.normaliserFormatDate(this.dateActuelle)).toLocaleDateString('fr-FR') : 'Non définie';

        let typeCommande = cleanStringForDisplay(commande.type_commande || 'habituelle');
        if (typeCommande === 'speciale' && commande.type_contenant) {
            typeCommande += ` (${cleanStringForDisplay(commande.type_contenant)})`;
        }

        // Statut badge
        const statut = commande.statut || 'en_attente';
        const statutClasses = {
            'en_attente': 'bg-orange-100 text-orange-800',
            'validee': 'bg-green-100 text-green-800',
            'livree': 'bg-blue-100 text-blue-800'
        };
        const classe = statutClasses[statut] || statutClasses['en_attente'];
        const statutBadge = `<span class="px-2 py-1 rounded text-xs font-bold ${classe}">${statut.replace('_', ' ').toUpperCase()}</span>`;

        const modalFicheHTML = `
            <div id="modal-fiche-client" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-2 sm:p-4" style="backdrop-filter: blur(6px);">
                <div class="bg-white rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl border-4 border-purple-500">
                    
                    <!-- Header -->
                    <div class="sticky top-0 bg-white rounded-t-2xl p-4 sm:p-6 border-b-4 border-purple-500">
                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                            <div class="text-center sm:text-left">
                                <h2 class="text-xl sm:text-2xl font-bold text-purple-800">[Clip] FICHE CLIENT</h2>
                                <p class="text-sm sm:text-base text-gray-600">Informations complètes</p>
                            </div>
                            <button id="btn-fermer-fiche" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold text-sm sm:text-base">
                                [x] FERMER
                            </button>
                        </div>
                    </div>

                    <!-- Contenu -->
                    <div class="p-4 sm:p-6 space-y-4">
                        
                        <!-- Nom client -->
                        <div class="bg-blue-50 rounded-xl p-3 sm:p-4 border-l-4 border-blue-500">
                            <div class="flex items-center mb-2">
                                <span class="text-xl sm:text-2xl mr-2 sm:mr-3">[User]</span>
                                <h3 class="text-base sm:text-lg font-bold text-blue-800">CLIENT</h3>
                            </div>
                            <div class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-words">${clientNom}</div>
                        </div>

                        <!-- Coordonnées -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            
                            <div class="bg-green-50 rounded-xl p-3 sm:p-4 border-l-4 border-green-500">
                                <div class="flex items-center mb-2">
                                    <span class="text-lg sm:text-xl mr-2">[Tel]</span>
                                    <h4 class="text-sm sm:text-base font-bold text-green-800">TÉLÉPHONE</h4>
                                </div>
                                <div class="text-sm sm:text-base text-gray-900 break-all">${telephone}</div>
                            </div>

                            <div class="bg-orange-50 rounded-xl p-3 sm:p-4 border-l-4 border-orange-500">
                                <div class="flex items-center mb-2">
                                    <span class="text-lg sm:text-xl mr-2">[Box]</span>
                                    <h4 class="text-sm sm:text-base font-bold text-orange-800">QUANTITÉ</h4>
                                </div>
                                <div class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">${quantite} tiramisus</div>
                            </div>
                        </div>

                        <!-- Adresse -->
                        <div class="bg-yellow-50 rounded-xl p-3 sm:p-4 border-l-4 border-yellow-500">
                            <div class="flex items-center mb-2">
                                <span class="text-lg sm:text-xl mr-2">[Pin]</span>
                                <h4 class="text-sm sm:text-base font-bold text-yellow-800">ADRESSE DE LIVRAISON</h4>
                            </div>
                            <div class="text-sm sm:text-base text-gray-900 break-words leading-relaxed">${adresse}</div>
                        </div>

                        <!-- ✅ NOUVELLE SECTION : Répartition automatique -->
                        <div class="bg-purple-50 rounded-xl p-3 sm:p-4 border-l-4 border-purple-500">
                            <div class="flex items-center mb-2">
                                <span class="text-lg sm:text-xl mr-2">[Calc]</span>
                                <h4 class="text-sm sm:text-base font-bold text-purple-800">RÉPARTITION AUTOMATIQUE</h4>
                            </div>
                            <div class="text-sm sm:text-base text-gray-900 font-mono bg-white p-2 rounded border">${repartitionCalculee}</div>
                        </div>

                        <!-- Infos commande -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            
                            <div class="bg-indigo-50 rounded-xl p-3 sm:p-4 border-l-4 border-indigo-500">
                                <div class="flex items-center mb-2">
                                    <span class="text-lg sm:text-xl mr-2">[Cal]</span>
                                    <h4 class="text-sm sm:text-base font-bold text-indigo-800">LIVRAISON</h4>
                                </div>
                                <div class="text-sm sm:text-base text-gray-900 font-semibold">${dateLivraison}</div>
                                <div class="text-xs sm:text-sm text-gray-600 mt-1">${this.jourNomActuel}</div>
                            </div>

                            <div class="bg-pink-50 rounded-xl p-3 sm:p-4 border-l-4 border-pink-500">
                                <div class="flex items-center mb-2">
                                    <span class="text-lg sm:text-xl mr-2">[Tag]</span>
                                    <h4 class="text-sm sm:text-base font-bold text-pink-800">TYPE</h4>
                                </div>
                                <div class="text-sm sm:text-base text-gray-900 capitalize break-words">${typeCommande}</div>
                            </div>
                        </div>

                        <!-- Goûts -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                            
                            <div class="bg-green-50 rounded-xl p-3 sm:p-4 border-l-4 border-green-500">
                                <div class="flex items-center mb-2">
                                    <span class="text-lg sm:text-xl mr-2">[OK]</span>
                                    <h4 class="text-sm sm:text-base font-bold text-green-800">GOÛTS IMPOSÉS</h4>
                                </div>
                                <div class="text-xs sm:text-sm text-gray-900 break-words leading-relaxed">${goutsImposes}</div>
                            </div>

                            <div class="bg-red-50 rounded-xl p-3 sm:p-4 border-l-4 border-red-500">
                                <div class="flex items-center mb-2">
                                    <span class="text-lg sm:text-xl mr-2">[X]</span>
                                    <h4 class="text-sm sm:text-base font-bold text-red-800">GOÛT EXCLU</h4>
                                </div>
                                <div class="text-xs sm:text-sm text-gray-900 break-words leading-relaxed">${goutExclu}</div>
                            </div>
                        </div>

                        <!-- Statut -->
                        <div class="bg-gray-50 rounded-xl p-3 sm:p-4 border-l-4 border-gray-500">
                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                <div class="flex items-center">
                                    <span class="text-lg sm:text-xl mr-2">[Chart]</span>
                                    <h4 class="text-sm sm:text-base font-bold text-gray-800">STATUT DE LA COMMANDE</h4>
                                </div>
                                <div>${statutBadge}</div>
                            </div>
                        </div>

                    </div>

                    <!-- Footer -->
                    <div class="sticky bottom-0 bg-white rounded-b-2xl mt-4 sm:mt-6 p-4 sm:p-6 border-t-2 border-gray-200">
                        <div class="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                            <button class="btn-modifier-depuis-fiche bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-3 sm:py-2 rounded-lg font-bold transition-all text-sm sm:text-base w-full sm:w-auto min-h-[44px]"
                                    data-commande-id="${commande.id || ''}"
                                    data-is-recurrente="${commande.is_virtuelle || commande.commande_origine_id || commande.est_recurrente}">
                                [Edit] MODIFIER LA COMMANDE
                            </button>
                            <button id="btn-fermer-fiche-footer" class="bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-3 sm:py-2 rounded-lg font-bold transition-all text-sm sm:text-base w-full sm:w-auto min-h-[44px]">
                                FERMER
                            </button>
                        </div>
                    </div>
                    
                </div>
            </div>
        `;

        // Injecter et configurer
        document.body.insertAdjacentHTML('beforeend', modalFicheHTML);
        this.modalFicheElement = document.getElementById('modal-fiche-client');
        this.ajouterEventListenersFiche();
    },

    /**
     * ✅ Event listeners fiche client
     */
    ajouterEventListenersFiche: function() {
        const self = this;
        
        // Boutons fermer
        document.getElementById('btn-fermer-fiche').addEventListener('click', () => this.fermerFicheClient());
        document.getElementById('btn-fermer-fiche-footer').addEventListener('click', () => this.fermerFicheClient());
        
        // Overlay
        this.modalFicheElement.addEventListener('click', function(e) {
            if (e.target === self.modalFicheElement) {
                self.fermerFicheClient();
            }
        });

        // Bouton modifier
        const btnModifier = document.querySelector('.btn-modifier-depuis-fiche');
        if (btnModifier) {
            btnModifier.addEventListener('click', function() {
                const commandeId = this.getAttribute('data-commande-id');
                const isRecurrente = this.getAttribute('data-is-recurrente') === 'true';
                
                self.fermerFicheClient();
                
                if (isRecurrente) {
                    self.ouvrirModalModificationPlanning(commandeId);
                } else {
                    window.location.href = `/admin/livraison/modifier-commande/${commandeId}`;
                }
            });
        }

        // Échap
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape' && self.modalFicheElement) {
                self.fermerFicheClient();
                document.removeEventListener('keydown', escHandler);
            }
        });
    },

    /**
     * ✅ Fermer fiche client
     */
    fermerFicheClient: function() {
        if (this.modalFicheElement) {
            this.modalFicheElement.remove();
            this.modalFicheElement = null;
        }
    },
    
    /**
     * ✅ Styliser goûts exclus (avec caractères nettoyés)
     */
    stylerGoutsExclus: function() {
        document.querySelectorAll('#tbody-commandes-excel .gout-exclu').forEach(element => {
            const text = element.textContent;
            // Chercher maintenant [X] au lieu de ❌
            if (text.includes('[X]')) {
                element.innerHTML = text.replace(/(\[X\]\s*[A-Z]+)/g, '<span style="color: #dc2626; font-weight: bold; background: rgba(220, 38, 38, 0.1); padding: 2px 4px; border-radius: 3px;">$1</span>');
            }
        });
    },
    
    /**
     * ✅ Fermer toutes modals
     */
    fermer: function() {
        this.fermerFicheClient();
        
        if (this.modalElement) {
            this.modalElement.remove();
            this.modalElement = null;
            this.commandesJourActuel = [];
            this.jourActuel = '';
            this.dateActuelle = '';
            this.jourNomActuel = '';
        }
    },
    
    /**
     * ✅ Confirmation suppression (avec texte nettoyé)
     */
    confirmerSuppression: function(commandeId) {
        console.log('Suppression:', commandeId);
        
        let commande;
        
        // Gestion IDs virtuels
        if (typeof commandeId === 'string' && commandeId.startsWith('virtual_')) {
            const index = parseInt(commandeId.replace('virtual_', ''));
            commande = this.commandesJourActuel[index];
        } else {
            commande = this.commandesJourActuel.find(c => c.id == commandeId);
        }
        
        if (!commande) {
            PlanningUtils.afficherErreur('Commande non trouvée');
            return;
        }
        
        const clientNom = cleanStringForDisplay(commande.client_nom || commande.client || 'Client inconnu');
        const quantite = commande.total_quantite || commande.quantite || 0;
        const isRecurrente = commande.is_virtuelle || commande.commande_origine_id || commande.est_recurrente;
        
        const message = isRecurrente ? 
            `[Del] SUPPRIMER COMMANDE RÉCURRENTE\n\nClient: ${clientNom}\nQuantité: ${quantite}\n\n[!] ATTENTION : Supprimera toutes les futures occurrences !\n\nConfirmer ?` :
            `[Del] SUPPRIMER COMMANDE\n\nClient: ${clientNom}\nQuantité: ${quantite}\n\n[!] Action irréversible !\n\nConfirmer ?`;
        
        if (confirm(message)) {
            let commandeIdASupprimer;
            
            if (isRecurrente && commande.commande_origine_id) {
                commandeIdASupprimer = commande.commande_origine_id;
            } else {
                commandeIdASupprimer = commande.id || commandeId;
            }
            
            this.supprimerDefinitivement(commandeIdASupprimer);
        }
    },
    
    /**
     * ✅ Suppression définitive
     */
    supprimerDefinitivement: async function(commandeId) {
        try {
            PlanningUtils.afficherLoader('Suppression...');
            
            const response = await fetch(`/admin/livraison/ajax/commande/${commandeId}`, {
                method: 'DELETE',
                headers: PlanningUtils.getAjaxHeaders()
            });
            
            const data = await response.json();
            
            if (data.success) {
                PlanningUtils.afficherSucces(data.message);
                
                // Recharger modal
                setTimeout(() => {
                    const fakeElement = {
                        closest: () => ({
                            getAttribute: (attr) => {
                                if (attr === 'data-jour') return this.jourActuel;
                                if (attr === 'data-date') return this.dateActuelle;
                                if (attr === 'data-jour-nom') return this.jourNomActuel;
                                return null;
                            }
                        })
                    };
                    this.ouvrir(fakeElement);
                }, 1000);
                
            } else {
                PlanningUtils.afficherErreur('Erreur suppression: ' + data.error);
            }
            
        } catch (error) {
            PlanningUtils.afficherErreur('Erreur connexion: ' + error.message);
        }
    }
};

// ==========================================
// ✅ EXPORTS GLOBAUX
// ==========================================

// Export principal
window.ModalTableauExcel = ModalTableauExcel;

// Fonction globale compatible
window.ouvrirModalTableauExcel = function(jourOuElement, commandesData) {
    ModalTableauExcel.ouvrir(jourOuElement, commandesData);
};

// ==========================================
// ✅ LOG FINAL CONFIRMATION
// ==========================================

console.log('✅ Modal-tableau.js chargé - Version Stable avec RÉPARTITION et FIX ENCODAGE');
console.log('🚀 Compatible: Vue Semaine + Vue Mois + Portrait + Paysage');
console.log('🆕 NOUVEAU: Colonne RÉPARTITION avec calcul automatique');
console.log('🔧 CORRIGÉ: Suppression listener orientationchange = Plus de bugs !');
console.log('✨ FIX: Nettoyage automatique des caractères problématiques');