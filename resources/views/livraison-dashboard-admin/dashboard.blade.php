<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administration Livraison - Sweetiz</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex flex-col px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gray-900 mb-2">LIVRAISON</h1>
            <p class="text-gray-600">Gestion des livraisons Sweetiz</p>
        </div>

        <div class="max-w-2xl mx-auto w-full space-y-4">
            <div class="bg-gray-300 text-center py-8 rounded-xl">
                <p class="text-gray-600">Modules à venir</p>
            </div>
        </div>

        <div class="mt-auto pt-8">
            <div class="max-w-2xl mx-auto w-full">
                <form action="/livraison/logout" method="POST">
                    @csrf
                    <button type="submit" class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-3">
                        <span>🚪</span>
                        <span>DÉCONNEXION</span>
                    </button>
                </form>
                
                <p class="text-center text-sm text-gray-500 mt-4">
                    Connecté en tant que {{ Auth::user()->name ?? 'Admin' }}
                </p>
            </div>
        </div>
    </div>
</body>
</html>