<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\LandlordResource;
use App\Models\User;
use App\Services\Admin\AdminLandlordService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminLandlordController extends Controller
{
    public function __construct(protected AdminLandlordService $service) {}

    /**
     * Display a listing of landlords.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $data = $this->service->getLandlordList($request);

        return Inertia::render('admin/landlords/index', [
            'landlords' => LandlordResource::collection($data['landlords']),
            'stats' => $data['stats'],
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
            ],
        ]);
    }
}
