{{-- Modal Livraison - Choix du profil --}}
<div id="modal-livraison" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-auto transform transition-all">
        {{-- Header avec icône --}}
        <div class="text-center pt-8 pb-4">
            <span class="text-5xl">🚚</span>
            <h2 class="text-2xl font-bold mt-4 text-gray-900">MODULE LIVRAISON</h2>
            <p class="text-gray-600 mt-2">Choisissez votre profil d'accès</p>
        </div>

        {{-- Options de profil --}}
        <div class="px-6 pb-6 space-y-3">
            {{-- Bouton Livreur --}}
            <a href="/livraison/livreur" class="block">
                <div class="bg-green-500 hover:bg-green-600 transition-all rounded-xl p-4 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="flex items-center space-x-3">
                                <span class="text-2xl">👤</span>
                                <span class="font-bold text-lg">LIVREUR</span>
                            </div>
                            <p class="text-sm mt-1 text-green-100 ml-11">Interface terrain mobile</p>
                        </div>
                    </div>
                </div>
            </a>

            {{-- Bouton Administrateur --}}
            <a href="/livraison/admin" class="block">
                <div class="bg-blue-500 hover:bg-blue-600 transition-all rounded-xl p-4 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="flex items-center space-x-3">
                                <span class="text-2xl">👨‍💼</span>
                                <span class="font-bold text-lg">ADMINISTRATEUR</span>
                            </div>
                            <p class="text-sm mt-1 text-blue-100 ml-11">Gestion complète du module</p>
                        </div>
                    </div>
                </div>
            </a>
        </div>

        {{-- Bouton retour --}}
        <div class="px-6 pb-6">
            <button onclick="closeModalLivraison()" class="w-full text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center space-x-2 py-2">
                <span>←</span>
                <span>Retour aux modules</span>
            </button>
        </div>
    </div>
</div>

<script>
function openModalLivraison() {
    document.getElementById('modal-livraison').classList.remove('hidden');
}

function closeModalLivraison() {
    document.getElementById('modal-livraison').classList.add('hidden');
}

// Fermer le modal en cliquant à l'extérieur
document.getElementById('modal-livraison').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModalLivraison();
    }
});
</script>