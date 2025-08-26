<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sweetiz - Sélection Module</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2 sm:mb-4 text-center">SWEETIZ</h1>
        
        <p class="text-sm sm:text-base md:text-lg text-gray-600 mb-8 sm:mb-10 md:mb-12 text-center px-4">Choisissez votre module de gestion</p>
        

        <div class="w-full max-w-sm sm:max-w-md md:max-w-lg space-y-3 sm:space-y-4 px-2 sm:px-0">
            {{-- Bouton Livraison --}}
            @include('bouton-livraison-accueil.button')
            
            {{-- Bouton Production --}}
            @include('bouton-production-accueil.button')
        </div>
        
        <div class="mt-auto py-3 sm:py-4">
            <p class="text-xs sm:text-sm text-gray-500 text-center">Système de gestion Sweetiz - Version 1.0</p>
        </div>
    </div>
</body>
</html>