<?php

namespace App\Concerns;

trait PhoneValidationRules
{
    /**
     * @return array<int, string>
     */
    protected function phoneRules(bool $required = true): array
    {
        return array_filter([
            $required ? 'required' : 'nullable',
            'string',
            'max:20',
            'regex:/^\+?[0-9\s\-\(\)]{7,20}$/',
        ]);
    }
}
