/**
 * SWEETIZ - Gestion des Absences JavaScript
 * Gestion des interactions pour les absences livreurs
 */

console.log('Loading gestion-absences.js');

/**
 * Fonction globale pour modifier une absence
 * Appelée directement depuis les boutons HTML onclick
 */
function modifierAbsence(absenceId) {
    console.log('Modification absence ID:', absenceId);
    
    // Récupérer les données de l'absence depuis le DOM
    const row = document.querySelector(`[data-absence-id="${absenceId}"]`);
    if (!row) {
        alert('Absence introuvable');
        return;
    }
    
    // Extraire les données depuis les éléments
    const livreurNom = row.querySelector('.livreur-nom')?.textContent?.trim() || '';
    const dateDebut = row.querySelector('.date-debut')?.textContent?.trim() || '';
    const dateFin = row.querySelector('.date-fin')?.textContent?.trim() || '';
    const motif = row.querySelector('.motif')?.textContent?.trim() || '';
    
    console.log('Données récupérées:', { livreurNom, dateDebut, dateFin, motif });
    
    // Essayer d'ouvrir la modal si elle existe
    const modal = document.getElementById('modalAbsence');
    if (modal) {
        // Pré-remplir les champs du formulaire
        const form = modal.querySelector('form');
        if (form) {
            const livreurField = form.querySelector('[name="livreur_id"]');
            const dateDebutField = form.querySelector('[name="date_debut"]');
            const dateFinField = form.querySelector('[name="date_fin"]');
            const motifField = form.querySelector('[name="motif"]');
            const idField = form.querySelector('[name="absence_id"]');
            
            if (livreurField) livreurField.value = livreurNom;
            if (dateDebutField) dateDebutField.value = dateDebut;
            if (dateFinField) dateFinField.value = dateFin;
            if (motifField) motifField.value = motif;
            if (idField) idField.value = absenceId;
        }
        
        // Afficher la modal
        modal.style.display = 'block';
        modal.classList.remove('hidden');
        
        // Focus sur le premier champ
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            firstInput.focus();
        }
    } else {
        // Fallback : redirection vers page d'édition
        const editUrl = `/admin/livraison/absences/${absenceId}/edit`;
        console.log('Redirection vers:', editUrl);
        window.location.href = editUrl;
    }
}

/**
 * Fonction globale pour supprimer une absence directement
 * Appelée directement depuis les boutons HTML onclick
 */
function supprimerAbsenceDirecte(absenceId) {
    console.log('Suppression absence ID:', absenceId);
    
    // Récupérer le nom du client pour la confirmation
    const row = document.querySelector(`[data-absence-id="${absenceId}"]`);
    const clientNom = row ? row.querySelector('.livreur-nom')?.textContent?.trim() : 'ce client';
    
    // Confirmation de suppression
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer l'absence de ${clientNom} ?`;
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Afficher un loader simple
    const button = event.target.closest('button');
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="animate-spin">⏳</span> Suppression...';
    button.disabled = true;
    
    // Requête AJAX de suppression
    fetch(`/admin/livraison/absences/${absenceId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || `Erreur HTTP ${response.status}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Message de succès
            alert('Absence supprimée avec succès !');
            
            // Supprimer la ligne du tableau avec animation
            if (row) {
                row.style.transition = 'opacity 0.3s ease-out';
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    // Mettre à jour le compteur
                    updateCount();
                    // Vérifier si il faut afficher le message "aucun résultat"
                    checkNoResults();
                }, 300);
            } else {
                // Recharger si on ne trouve pas la ligne
                location.reload();
            }
        } else {
            throw new Error(data.message || 'Erreur lors de la suppression');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression : ' + error.message);
        
        // Restaurer le bouton
        button.innerHTML = originalText;
        button.disabled = false;
    });
}

/**
 * Fonction pour ajouter une nouvelle absence
 */
function ajouterAbsence() {
    console.log('Ajout nouvelle absence');
    
    const modal = document.getElementById('modalAbsence');
    if (modal) {
        // Réinitialiser le formulaire
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            // Supprimer l'ID d'absence pour indiquer qu'on crée
            const idField = form.querySelector('[name="absence_id"]');
            if (idField) {
                idField.value = '';
            }
        }
        
        // Afficher la modal
        modal.style.display = 'block';
        modal.classList.remove('hidden');
        
        // Focus sur le premier champ
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            firstInput.focus();
        }
    } else {
        // Fallback : redirection vers page de création
        window.location.href = '/admin/livraison/absences/create';
    }
}

/**
 * Fonction pour fermer la modal
 */
function fermerModalAbsence() {
    const modal = document.getElementById('modalAbsence');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
}

/**
 * Fonction pour sauvegarder une absence (ajout/modification)
 */
function sauvegarderAbsence(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const absenceId = formData.get('absence_id');
    
    // Déterminer l'URL et la méthode
    const isEdit = absenceId && absenceId !== '';
    const url = isEdit ? `/admin/livraison/absences/${absenceId}` : '/admin/livraison/absences';
    const method = isEdit ? 'PUT' : 'POST';
    
    // Convertir FormData en objet pour JSON
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Désactiver le bouton de soumission
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.innerHTML = '<span class="animate-spin">⏳</span> Sauvegarde...';
        submitBtn.disabled = true;
    }
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || `Erreur HTTP ${response.status}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert(isEdit ? 'Absence modifiée avec succès !' : 'Absence ajoutée avec succès !');
            fermerModalAbsence();
            // Recharger la page pour afficher les changements
            location.reload();
        } else {
            throw new Error(data.message || 'Erreur lors de la sauvegarde');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Erreur lors de la sauvegarde : ' + error.message);
    })
    .finally(() => {
        // Restaurer le bouton
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

/**
 * Fonction utilitaire pour mettre à jour le compteur
 */
function updateCount() {
    const visibleRows = document.querySelectorAll('.absence-row:not([style*="display: none"])');
    const countElement = document.getElementById('total-count');
    if (countElement) {
        countElement.textContent = visibleRows.length;
    }
}

/**
 * Fonction utilitaire pour vérifier les résultats vides
 */
function checkNoResults() {
    const visibleRows = document.querySelectorAll('.absence-row:not([style*="display: none"])');
    const noResultsElement = document.getElementById('no-results');
    if (noResultsElement) {
        noResultsElement.classList.toggle('hidden', visibleRows.length > 0);
    }
}

// Initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', function() {
    console.log('Gestion Absences JS initialized');
    
    // Attacher les événements sur les formulaires
    const modalForm = document.querySelector('#modalAbsence form');
    if (modalForm) {
        modalForm.addEventListener('submit', sauvegarderAbsence);
        console.log('Form event listener attached');
    }
    
    // Fermeture modal avec Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fermerModalAbsence();
        }
    });
    
    // Fermeture modal en cliquant sur le fond
    const modal = document.getElementById('modalAbsence');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                fermerModalAbsence();
            }
        });
    }
    
    console.log('All event listeners attached');
});

// Exposer les fonctions globalement pour les appels depuis HTML
window.modifierAbsence = modifierAbsence;
window.supprimerAbsenceDirecte = supprimerAbsenceDirecte;
window.ajouterAbsence = ajouterAbsence;
window.fermerModalAbsence = fermerModalAbsence;
window.sauvegarderAbsence = sauvegarderAbsence;

console.log('gestion-absences.js loaded successfully');