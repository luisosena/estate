<?php

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $this->withoutExceptionHandling();
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'username' => 'testuser',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    if ($response->status() === 302 && session('errors')) {
        dd(session('errors')->getBag('default')->toArray());
    }

    $this->assertAuthenticated();
    $response->assertRedirect(); // Flexible redirect assertion
});
