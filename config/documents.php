<?php

return [
    'max_size' => (int) env('DOCUMENT_MAX_SIZE', 10485760),
    'allowed_mimes' => env('DOCUMENT_ALLOWED_TYPES', 'pdf,doc,docx'),
];
