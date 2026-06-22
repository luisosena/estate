<?php

namespace App\Http\Controllers\Web;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DemoController extends Controller
{
    public function login(Request $request): RedirectResponse
    {
        $roleInput = $request->query('role', Role::Landlord->value);

        $role = $roleInput === Role::Tenant->value
            ? Role::Tenant
            : Role::Landlord;

        $demoUser = User::query()
            ->where('is_demo', true)
            ->where('role', $role->value)
            ->firstOrFail();

        Auth::login($demoUser);
        $request->session()->regenerate();
        $request->session()->put('demo_started_at', now());

        return redirect()->intended(
            $role === Role::Tenant
                ? route('tenant.dashboard')
                : route('landlord.dashboard')
        );
    }
}
