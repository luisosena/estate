<?php

namespace Tests\Feature\Tenant;

use Tests\TestCase;
use App\Models\User;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PaymentsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->tenant = Tenant::factory()->create(['user_id' => $this->user->id]);
    }

    public function test_tenant_can_view_payments_page()
    {
        $response = $this->actingAs($this->user)
            ->get('/tenant/payments');

        $response->assertStatus(200);
    }

    public function test_guest_cannot_view_payments_page()
    {
        $response = $this->get('/tenant/payments');

        $response->assertRedirect('/login');
    }
}
