<?php

namespace Tests\Feature\Tenant;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->create([
            'role' => 'tenant',
            'tenant_id' => $this->tenant->id,
        ]);
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
