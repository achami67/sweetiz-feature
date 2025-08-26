<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sweetiz - Sélection Module</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex flex-col items-center justify-center py-12 px-4">
        <div class="mb-8">
            <h1 class="text-4xl font-bold text-center text-gray-800">SWEETIZ</h1>
            <p class="text-center text-gray-600 mt-2">Choisissez votre module de gestion</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
            <!-- Module Livraison -->
            <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div class="bg-green-500 p-6 text-center">
                    <svg class="w-16 h-16 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
                    </svg>
                    <h2 class="text-2xl font-bold text-white mt-4">🚚 LIVRAISON</h2>
                </div>
                <div class="p-6">
                    <p class="text-gray-600 mb-4">Gérez les commandes, le planning de livraison et les tournées</p>
                    <a href="{{ route('livraison.index') }}" class="block w-full bg-green-500 text-white text-center py-3 rounded-lg hover:bg-green-600 transition-colors">
                        Accéder aux Livraisons
                    </a>
                </div>
            </div>

            <!-- Module Production -->
            <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div class="bg-blue-500 p-6 text-center">
                    <svg class="w-16 h-16 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                    </svg>
                    <h2 class="text-2xl font-bold text-white mt-4">🏭 PRODUCTION</h2>
                </div>
                <div class="p-6">
                    <p class="text-gray-600 mb-4">Gérez la production, les stocks d'ingrédients et le workflow</p>
                    <a href="{{ route('production.index') }}" class="block w-full bg-blue-500 text-white text-center py-3 rounded-lg hover:bg-blue-600 transition-colors">
                        Accéder à la Production
                    </a>
                </div>
            </div>

            <!-- Module Comptabilité -->
            <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow opacity-50">
                <div class="bg-orange-500 p-6 text-center">
                    <svg class="w-16 h-16 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                    <h2 class="text-2xl font-bold text-white mt-4">💰 COMPTABILITÉ</h2>
                </div>
                <div class="p-6">
                    <p class="text-gray-600 mb-4">Gérez la facturation, les rapports financiers et la comptabilité</p>
                    <button disabled class="block w-full bg-gray-400 text-white text-center py-3 rounded-lg cursor-not-allowed">
                        Bientôt disponible
                    </button>
                </div>
            </div>
        </div>

        <div class="mt-8">
            <p class="text-sm text-gray-500">Système de gestion Sweetiz - Version 2.0</p>
        </div>
    </div>
</body>
</html>
