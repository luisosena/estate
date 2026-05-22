<?php

namespace App\Concerns;

trait PhoneValidationRules
{
    /**
     * @return array<string, string|array<int, mixed>>
     */
    protected function phoneRules(bool $required = true): array
    {
        return [
            ($required ? 'required' : 'nullable').'|string|max:20|regex:/^\+?[0-9\s\-\(\)]{7,20}$/',
        ];
    }
}
