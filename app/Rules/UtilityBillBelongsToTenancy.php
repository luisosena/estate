<?php

namespace App\Rules;

use App\Models\UtilityBill;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class UtilityBillBelongsToTenancy implements ValidationRule
{
    public function __construct(
        private readonly int $tenancyId
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $bill = UtilityBill::find($value);

        if (!$bill || !$bill->tenancyUtility || $bill->tenancyUtility->tenancy_id !== $this->tenancyId) {
            $fail('The selected utility bill does not belong to this tenancy.');
        }
    }
}
