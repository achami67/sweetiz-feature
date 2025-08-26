<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LivraisonAuthController;
use Illuminate\Support\Facades\Route;

// Route principale - Page des modules
Route::get('/', function () {
    return view('modules');
})->name('modules.index');

// Routes Module Livraison
Route::get('/livraison/livreur', function () {
    return view('livraison-login.login');
})->name('livraison.livreur');

Route::get('/livraison/admin', function () {
    return view('livraison-login.login');
})->name('livraison.admin');

Route::post('/livraison/login', [LivraisonAuthController::class, 'login'])->name('livraison.login');

// Routes protégées du module Livraison
Route::middleware(['auth'])->group(function () {
    Route::get('/livraison/livreur/dashboard', [LivraisonAuthController::class, 'livreurDashboard'])->name('livraison.livreur.dashboard');
    Route::get('/livraison/admin/dashboard', [LivraisonAuthController::class, 'adminDashboard'])->name('livraison.admin.dashboard');
    Route::post('/livraison/logout', [LivraisonAuthController::class, 'logout'])->name('livraison.logout');
});

// Routes dashboard général (si vous gardez Breeze)
Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Routes de profil utilisateur
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';