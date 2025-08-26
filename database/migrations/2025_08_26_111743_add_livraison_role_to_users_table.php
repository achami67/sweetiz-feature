<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('livreur');
            $table->string('module')->nullable();
        });
    }

    public function down(): void
    {
        // On vérifie que les colonnes existent avant de les supprimer
        if (Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('role');
            });
        }
        if (Schema::hasColumn('users', 'module')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('module');
            });
        }
    }
};