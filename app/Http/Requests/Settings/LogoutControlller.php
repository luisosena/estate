<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

function logout(Request $request)
{
    Auth::logout();

    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect('/login');
}
