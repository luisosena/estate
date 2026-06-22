<?php

use App\Enums\Role;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Auth;

beforeEach(function () {
    // Create demo users
    $this->demoLandlord = User::factory()->demo()->create([
        'name' => 'Demo Landlord',
        'email' => config('demo.landlord_email'),
        'role' => Role::Landlord->value,
    ]);
    $this->demoTenant = User::factory()->demo()->create([
        'name' => 'Demo Tenant',
        'email' => config('demo.tenant_email'),
        'role' => Role::Tenant->value,
    ]);

    // Create non-demo users
    $this->regularLandlord = User::factory()->create([
        'role' => Role::Landlord->value,
    ]);
    $this->regularTenant = User::factory()->create([
        'role' => Role::Tenant->value,
    ]);
});

describe('DemoController', function () {
    it('logs in as demo landlord when role=landlord', function () {
        $response = $this->get('/demo?role=landlord');

        $response->assertRedirect(route('landlord.dashboard'));
        expect(Auth::id())->toBe($this->demoLandlord->id);
        expect(session('demo_started_at'))->not->toBeNull();
    });

    it('logs in as demo tenant when role=tenant', function () {
        $response = $this->get('/demo?role=tenant');

        $response->assertRedirect(route('tenant.dashboard'));
        expect(Auth::id())->toBe($this->demoTenant->id);
        expect(session('demo_started_at'))->not->toBeNull();
    });

    it('defaults to landlord when no role provided', function () {
        $response = $this->get('/demo');

        $response->assertRedirect(route('landlord.dashboard'));
        expect(Auth::id())->toBe($this->demoLandlord->id);
    });

    it('uses intended redirect when already authenticated', function () {
        // First visit /landlord/properties without auth -> redirected to login
        // Then visit /demo?role=landlord -> should redirect back to intended
        Auth::login($this->regularTenant);

        $response = $this->get('/demo?role=landlord');

        $response->assertRedirect(route('landlord.dashboard'));
        expect(Auth::id())->toBe($this->demoLandlord->id);
    });

    it('returns 404 if no demo landlord exists', function () {
        $this->demoLandlord->delete();

        $response = $this->get('/demo?role=landlord');

        $response->assertStatus(404);
    });

    it('returns 404 if no demo tenant exists', function () {
        $this->demoTenant->delete();

        $response = $this->get('/demo?role=tenant');

        $response->assertStatus(404);
    });
});

describe('EnsureNotDemoUser middleware', function () {
    beforeEach(function () {
        // Log in as demo landlord
        Auth::login($this->demoLandlord);
    });

    it('allows GET requests to non-settings routes', function () {
        $response = $this->get('/landlord/dashboard');

        $response->assertStatus(200);
    });

    it('blocks POST requests when expecting JSON', function () {
        $response = $this->postJson('/landlord/tenants', [
            'name' => 'Test Tenant',
            'phone' => '0712345678',
        ]);

        $response->assertStatus(403);
    });

    it('blocks POST requests with redirect for non-JSON', function () {
        $response = $this->withoutMiddleware(VerifyCsrfToken::class)
            ->from('/landlord/tenants')
            ->post('/landlord/tenants', [
                'name' => 'Test Tenant',
                'phone' => '0712345678',
            ]);

        expect($response->isRedirect())->toBeTrue();
    });

    it('blocks PUT requests', function () {
        $property = Property::factory()->for($this->demoLandlord, 'owner')->create();

        $response = $this->withoutMiddleware(VerifyCsrfToken::class)
            ->put("/landlord/properties/{$property->id}", [
                'name' => 'Updated',
            ]);

        // Should be redirect (302) or 403, not 200
        expect($response->status())->not->toBe(200);
    });

    it('blocks PATCH requests', function () {
        $property = Property::factory()->for($this->demoLandlord, 'owner')->create();

        $response = $this->withoutMiddleware(VerifyCsrfToken::class)
            ->patch("/landlord/properties/{$property->id}", [
                'name' => 'Updated',
            ]);

        expect($response->status())->not->toBe(200);
    });

    it('blocks DELETE requests', function () {
        $property = Property::factory()->for($this->demoLandlord, 'owner')->create();

        $response = $this->withoutMiddleware(VerifyCsrfToken::class)
            ->delete("/landlord/properties/{$property->id}");

        expect($response->status())->not->toBe(200);
    });

    it('blocks GET to settings routes', function () {
        $response = $this->from('/landlord/dashboard')->get('/settings/profile');

        // Should redirect (302) because middleware blocks settings
        expect($response->status())->not->toBe(200);
    });

    it('allows logout for demo users', function () {
        $response = $this->withoutMiddleware(VerifyCsrfToken::class)
            ->post('/logout');

        expect($response->isRedirect())->toBeTrue();
    });

    it('allows non-demo users to do everything', function () {
        Auth::logout();
        Auth::login($this->regularLandlord);

        // Regular user can access dashboard
        $response = $this->get('/landlord/dashboard');
        $response->assertStatus(200);
    });
});

describe('DemoSessionTimeout middleware', function () {
    it('logs out expired demo users', function () {
        // Login as demo landlord with expired session
        Auth::login($this->demoLandlord);
        session(['demo_started_at' => now()->subMinutes(35)]);

        $response = $this->get('/landlord/dashboard');

        $response->assertRedirect(route('home'));
        expect(Auth::check())->toBeFalse();
    });

    it('allows demo users within time limit', function () {
        Auth::login($this->demoLandlord);
        session(['demo_started_at' => now()->subMinutes(10)]);

        $response = $this->get('/landlord/dashboard');

        $response->assertStatus(200);
    });

    it('does not affect non-demo users', function () {
        Auth::login($this->regularLandlord);
        // No demo_started_at in session

        $response = $this->get('/landlord/dashboard');

        $response->assertStatus(200);
        expect(Auth::id())->toBe($this->regularLandlord->id);
    });
});

describe('Demo user shared data via Inertia', function () {
    it('shares isDemoUser and demoExpiresAt when demo user logged in', function () {
        Auth::login($this->demoLandlord);
        session(['demo_started_at' => now()]);

        $response = $this->get('/landlord/dashboard');
        $response->assertStatus(200);

        $response->assertInertia(fn ($page) => $page
            ->where('isDemoUser', true)
            ->where('demoExpiresAt', fn ($value) => is_string($value) && ! empty($value))
        );
    });

    it('shares isDemoUser as false for regular users', function () {
        Auth::login($this->regularLandlord);

        $response = $this->get('/landlord/dashboard');
        $response->assertStatus(200);

        $response->assertInertia(fn ($page) => $page
            ->where('isDemoUser', false)
            ->where('demoExpiresAt', null)
        );
    });
});
