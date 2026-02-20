<?php

namespace App\Responses;

use Laravel\Fortify\Http\Responses\LoginResponse as FortifyLoginResponse;
use Illuminate\Http\Request;

class LoginResponse extends FortifyLoginResponse
{
    public function toResponse($request)
    {
        $user = $request->user();
        
        // Debug: Log the user role and redirect URL
        \Log::info('LoginResponse called for user: ' . $user->email . ' with role: ' . $user->role);
        
        $redirectUrl = match($user->role) {
            'admin' => '/admin/dashboard',
            'landlord' => '/landlord/dashboard', 
            'tenant' => '/tenant/dashboard',
            default => '/dashboard',
        };
        
        \Log::info('Redirecting to: ' . $redirectUrl);

        return redirect($redirectUrl);
    }
}
