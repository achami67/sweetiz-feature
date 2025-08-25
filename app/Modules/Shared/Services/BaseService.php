<?php

namespace App\Modules\Shared\Services;

abstract class BaseService
{
    /**
     * Service de base pour tous les autres services
     */
    protected function success($data = null, $message = 'Opération réussie')
    {
        return [
            'success' => true,
            'message' => $message,
            'data' => $data
        ];
    }

    protected function error($message = 'Une erreur est survenue', $code = 400)
    {
        return [
            'success' => false,
            'message' => $message,
            'code' => $code
        ];
    }
}
