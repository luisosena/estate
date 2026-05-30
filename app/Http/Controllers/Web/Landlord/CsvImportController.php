<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Landlord\CsvImportConfirmRequest;
use App\Http\Requests\Landlord\CsvImportUploadRequest;
use App\Models\CsvImportBatch;
use App\Models\User;
use App\Notifications\CsvImportCompleted;
use App\Services\Landlord\CsvImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CsvImportController extends Controller
{
    public function __construct(protected CsvImportService $service) {}

    /**
     * GET /landlord/import
     * Show upload form and batch history.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', CsvImportBatch::class);

        $batches = $this->service->getBatchHistory($request->user());

        return Inertia::render('landlord/import/index', [
            'batches' => $batches,
        ]);
    }

    /**
     * GET /landlord/import/template
     * Stream the CSV template for download (generated in-memory).
     */
    public function template(Request $request): StreamedResponse
    {
        $this->authorize('downloadTemplate', CsvImportBatch::class);

        $headers = [
            'property_name', 'property_address', 'property_city', 'property_state',
            'property_type', 'unit_code', 'unit_name', 'tenant_full_name', 'tenant_email',
            'tenant_phone', 'emergency_contact_name', 'emergency_contact_phone',
            'emergency_contact_relation', 'move_in_date', 'monthly_rent',
            'security_deposit', 'rent_due_day',
        ];

        $example = [
            'Sunset Apartments', '123 Main Street', 'Nairobi', 'Nairobi County',
            'apartment', 'A101', 'Unit A101', 'Jane Doe', 'jane.doe@example.com',
            '+254712345678', 'John Doe', '+254798765432',
            'Spouse', '2025-01-01', '25000',
            '50000', '5',
        ];

        return response()->streamDownload(function () use ($headers, $example) {
            $out = fopen('php://output', 'w');
            fputcsv($out, $headers);
            fputcsv($out, $example);
            fclose($out);
        }, 'tenant-import-template.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * POST /landlord/import/preview
     * Validate the CSV and return a dry-run preview.
     */
    public function preview(CsvImportUploadRequest $request): Response
    {
        $this->authorize('create', CsvImportBatch::class);

        $preview = $this->service->preview(
            $request->user(),
            $request->file('csv_file')
        );

        return Inertia::render('landlord/import/preview', [
            'preview' => $preview,
        ]);
    }

    /**
     * POST /landlord/import
     * Execute the import using the stored preview file — no file re-upload.
     */
    public function store(CsvImportConfirmRequest $request): RedirectResponse
    {
        $this->authorize('create', CsvImportBatch::class);

        $landlord = $request->user();

        if (! $request->previewFileExists()) {
            return redirect()
                ->route('landlord.import.index')
                ->with('error', 'Your preview session has expired. Please re-upload your file.');
        }

        $token = $request->input('preview_token');
        $tempPath = 'csv-imports/preview/'.$token.'.csv';
        $permanentPath = 'csv-imports/'.$token.'/'.$request->input('original_filename');

        Storage::move($tempPath, $permanentPath);

        $batch = CsvImportBatch::create([
            'user_id' => $landlord->id,
            'original_filename' => $request->input('original_filename'),
            'stored_path' => $permanentPath,
            'status' => 'processing',
            'total_rows' => 0,
        ]);

        $batch = $this->service->import($landlord, $batch);

        $landlord->notify(new CsvImportCompleted($batch, $landlord));

        User::where('role', Role::Admin)->each(function (User $admin) use ($batch, $landlord) {
            $admin->notify(new CsvImportCompleted($batch, $landlord));
        });

        $message = $batch->failed_rows > 0
            ? "{$batch->created_rows} records imported. {$batch->failed_rows} rows had errors — review the report."
            : "Import complete. {$batch->created_rows} records created.";

        return redirect()
            ->route('landlord.import.show', $batch)
            ->with('success', $message);
    }

    /**
     * GET /landlord/import/{batch}
     * Show batch result detail.
     */
    public function show(Request $request, CsvImportBatch $batch): Response
    {
        $this->authorize('view', $batch);

        return Inertia::render('landlord/import/show', [
            'batch' => $batch,
        ]);
    }
}
