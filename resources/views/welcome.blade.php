<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sweetiz</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="antialiased bg-gray-100">
    <div class="min-h-screen flex flex-col">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <h1 class="text-2xl font-bold text-sweetiz-green">SWEETIZ</h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        @if (Route::has('login'))
                            @auth
                                <a href="{{ url('/dashboard') }}" class="text-gray-700 hover:text-sweetiz-green">
                                    Dashboard
                                </a>
                            @else
                                <a href="{{ route('login') }}" class="text-gray-700 hover:text-sweetiz-green">
                                    Connexion
                                </a>
                                @if (Route::has('register'))
                                    <a href="{{ route('register') }}" class="bg-sweetiz-green text-white px-4 py-2 rounded-lg hover:bg-green-600">
                                        S'inscrire
                                    </a>
                                @endif
                            @endauth
                        @endif
                    </div>
                </div>
            </div>
        </nav>

        <!-- Content -->
        <div class="flex-1 flex items-center justify-center">
            <div class="text-center">
                <h1 class="text-5xl font-bold text-gray-800 mb-4">
                    Bienvenue sur Sweetiz
                </h1>
                <p class="text-xl text-gray-600 mb-8">
                    Système de gestion pour votre entreprise de tiramisu
                </p>
                <div class="space-x-4">
                    @guest
                        <a href="{{ route('login') }}" class="inline-block bg-sweetiz-green text-white px-6 py-3 rounded-lg text-lg hover:bg-green-600">
                            Se connecter
                        </a>
                    @else
                        <a href="{{ url('/dashboard') }}" class="inline-block bg-sweetiz-green text-white px-6 py-3 rounded-lg text-lg hover:bg-green-600">
                            Accéder au Dashboard
                        </a>
                    @endguest
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="bg-white border-t">
            <div class="max-w-7xl mx-auto py-4 px-4 text-center text-gray-500">
                © 2025 Sweetiz - Version 2.0
            </div>
        </footer>
    </div>
</body>
</html>
