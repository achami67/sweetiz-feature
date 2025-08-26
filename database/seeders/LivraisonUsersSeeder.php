<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class LivraisonUsersSeeder extends Seeder
{
    public function run()
    {
        // Créer un livreur
        User::create([
            'name' => 'Jean Livreur',
            'email' => 'livreur@sweetiz.com',
            'password' => Hash::make('password123'),
            'role' => 'livreur',
            'module' => 'livraison'
        ]);

        // Créer un admin livraison
        User::create([
            'name' => 'Admin Livraison',
            'email' => 'admin.livraison@sweetiz.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'module' => 'livraison'
        ]);

        // Créer plusieurs livreurs
        User::create([
            'name' => 'Marie Livreuse',
            'email' => 'marie@sweetiz.com',
            'password' => Hash::make('marie123'),
            'role' => 'livreur',
            'module' => 'livraison'
        ]);
    }
}