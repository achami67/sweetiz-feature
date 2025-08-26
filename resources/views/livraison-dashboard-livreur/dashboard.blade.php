<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Espace Livreur - Sweetiz</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex flex-col px-4 py-8">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">ESPACE LIVREUR</h1>
            <p class="text-gray-600">Livraisons du jour</p>
        </div>

        <div class="max-w-2xl mx-auto w-full space-y-4 flex-1">
            <div class="bg-white rounded-xl p-6 shadow">
                <h2 class="font-bold text-lg mb-4">Mes livraisons</h2>
                <p class="text-gray-500">Aucune livraison programmée aujourd'hui</p>
            </div>
        </div>

        <div class="max-w-2xl mx-auto w-full mt-8">
            <form action="/livraison/logout" method="POST">
                @csrf
                <button type="submit" class="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                    Déconnexion
                </button>
            </form>
            
            <p class="text-center text-sm text-gray-500 mt-4">
                {{ Auth::user()->name ?? 'Livreur' }}
            </p>
        </div>
    </div>
</body>
</html>