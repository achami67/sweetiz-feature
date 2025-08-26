<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion Module Livraison - Sweetiz</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex flex-col items-center justify-center px-4">
        {{-- Header --}}
        <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gray-900 mb-2">SWEETIZ</h1>
            <h2 class="text-xl text-gray-600">Connexion Module Livraison</h2>
            <p class="text-gray-500 mt-2 flex items-center justify-center space-x-2">
                <span>🚚</span>
                <span>Système de gestion des livraisons</span>
            </p>
        </div>

        {{-- Formulaire de connexion unique --}}
        <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
            <form action="/livraison/login" method="POST">
                @csrf
                
                {{-- Champ Email --}}
                <div class="mb-6">
                    <label for="email" class="block text-gray-700 text-sm font-bold mb-2">
                        Email
                    </label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email"
                        placeholder="votre@email.com"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                        required
                    >
                </div>

                {{-- Champ Mot de passe --}}
                <div class="mb-6">
                    <label for="password" class="block text-gray-700 text-sm font-bold mb-2">
                        Mot de passe
                    </label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password"
                        placeholder="••••••••"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                        required
                    >
                </div>

                {{-- Messages d'erreur --}}
                @if(session('error'))
                    <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {{ session('error') }}
                    </div>
                @endif

                {{-- Bouton connexion --}}
                <button 
                    type="submit" 
                    class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    Se connecter
                </button>
            </form>

            {{-- Comptes de test --}}
            <div class="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p class="font-semibold mb-2">Comptes de test :</p>
                <div class="space-y-1">
                    <p class="text-xs"><strong>Livreur:</strong> livreur@sweetiz.com / password123</p>
                    <p class="text-xs"><strong>Admin:</strong> admin.livraison@sweetiz.com / admin123</p>
                </div>
            </div>
        </div>

        {{-- Bouton retour --}}
        <a href="/" class="mt-6 text-gray-500 hover:text-gray-700 flex items-center space-x-2">
            <span>←</span>
            <span>Retour aux modules</span>
        </a>
    </div>
</body>
</html>