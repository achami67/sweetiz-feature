<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LivraisonAuthController extends Controller
{
    // Afficher le formulaire de connexion
    public function showLoginForm()
    {
        return view('livraison-login.login');
    }

    // Traiter la connexion
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            
            // Vérifier que l'utilisateur appartient au module livraison
            if ($user->module !== 'livraison') {
                Auth::logout();
                return back()->with('error', 'Accès non autorisé à ce module.');
            }

            // Rediriger selon le rôle
            if ($user->role === 'admin') {
                return redirect('/livraison/admin/dashboard');
            } else {
                return redirect('/livraison/livreur/dashboard');
            }
        }

        return back()->with('error', 'Email ou mot de passe incorrect.');
    }

    // Dashboard livreur (accès restreint)
    public function livreurDashboard()
    {
        $user = Auth::user();
        
        // Vérifier que c'est bien un livreur
        if ($user->role !== 'livreur') {
            return redirect('/livraison/admin/dashboard');
        }

        return view('livraison-dashboard-livreur.dashboard', compact('user'));
    }

    // Dashboard admin
    public function adminDashboard()
    {
        $user = Auth::user();
        
        // Vérifier que c'est bien un admin
        if ($user->role !== 'admin') {
            return redirect('/livraison/livreur/dashboard');
        }

        return view('livraison-dashboard-admin.dashboard', compact('user'));
    }

    // Déconnexion
    public function logout()
    {
        Auth::logout();
        return redirect('/');
    }
}