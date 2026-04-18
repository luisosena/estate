<?php

namespace App\Responses;

use App\Helpers\RoleRedirects;
use Laravel\Fortify\Http\Responses\LoginResponse as FortifyLoginResponse;

class LoginResponse extends FortifyLoginResponse
{
    public function toResponse($request)
    {
        $user = $request->user();

        // Debug: Log the user role and redirect URL
        \Log::info('LoginResponse called for user: '.$user->email.' with role: '.$user->role);

        $redirectUrl = RoleRedirects::urlByRole($user->role);

        \Log::info('Redirecting to: '.$redirectUrl);

        return redirect($redirectUrl);
    }
}
