<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UpdatePasswordRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class PasswordController extends Controller
{
    /**
     * PUT /api/{role}/password - Update authenticated user password
     */
    public function update(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        
        $validated = $request->validated();
        
        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'The current password is incorrect.'
            ], 422);
        }
        
        $user->forceFill([
            'password' => Hash::make($validated['password'])
        ])->save();
        
        return response()->json(['message' => 'Password updated successfully']);
    }
}
