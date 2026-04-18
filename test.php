<?php
use App\Models\User;

$user = User::factory()->create([
    'email_verified_at' => null,
]);

echo 'Has verified email: ' . ($user->hasVerifiedEmail() ? 'yes' : 'no') . PHP_EOL;
