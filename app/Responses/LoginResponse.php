<?php

namespace App\Responses;

use Laravel\Fortify\Http\Responses\LoginResponse as FortifyLoginResponse;
use Illuminate\Http\Request;

class LoginResponse extends FortifyLoginResponse
{
    public function toResponse($request)
    {
        $user = $request->user();
        
        $redirectUrl = match($user->role) {
            'admin' => '/admin/dashboard',
            'landlord' => '/landlord/dashboard', 
            'tenant' => '/tenant/dashboard',
            default => '/dashboard',
        };

        return redirect()->intended($redirectUrl);
    }
}
