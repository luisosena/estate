<?php

namespace App\Http\Controllers\Api\Auth;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // TODO: Implement mobile API login
        return response()->json(['message' => 'API login endpoint']);
    }

    public function logout(Request $request)
    {
        // TODO: Implement mobile API logout
        return response()->json(['message' => 'API logout endpoint']);
    }

    public function me(Request $request)
    {
        // TODO: Return current authenticated user for API
        return response()->json(['message' => 'Get current user endpoint']);
    }
}
