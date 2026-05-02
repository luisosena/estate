<?php

arch('no dd or dump calls exist in application code')
    ->expect('App')
    ->not->toUse(['dd', 'dump', 'var_dump', 'ray', 'ddd']);

arch('all request classes extend FormRequest')
    ->expect('App\Http\Requests')
    ->toExtend('Illuminate\Foundation\Http\FormRequest');

arch('controllers are classes')
    ->expect('App\Http\Controllers')
    ->toBeClasses()
    ->ignoring('App\Http\Controllers\Concerns');

arch('models use HasFactory')
    ->expect('App\Models')
    ->toUse('Illuminate\Database\Eloquent\Factories\HasFactory');

arch('policies extend no unexpected base')
    ->expect('App\Policies')
    ->toBeClasses();

arch('service classes are not abstract')
    ->expect('App\Services')
    ->toBeClasses()
    ->not->toBeAbstract();
