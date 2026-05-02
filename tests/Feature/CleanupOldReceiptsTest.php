<?php

use App\Services\ReceiptService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('receipts:cleanup reports deleted file count', function () {
    Storage::fake('local');
    Storage::disk('local')->put('receipts/old-receipt.pdf', 'pdf-content');

    $this->mock(ReceiptService::class, function ($mock) {
        $mock->shouldReceive('cleanupOldReceipts')->with(90)->andReturn(1);
    });

    Artisan::call('receipts:cleanup');

    expect(Artisan::output())->toContain('Deleted 1 receipt file(s).');
});
