<?php

namespace Tests\Feature\Tenant;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UtilitiesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $tenant = Tenant::factory()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->tenant = $tenant;
    }

    public function test_tenant_can_view_utilities_page()
    {
        $response = $this->actingAs($this->user)
            ->get('/tenant/utilities');

        $response->assertStatus(200);
    }

    public function test_guest_cannot_view_utilities_page()
    {
        $response = $this->get('/tenant/utilities');

        $response->assertRedirect('/login');
    }
}
