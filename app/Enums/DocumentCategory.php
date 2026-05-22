<?php

namespace App\Enums;

enum DocumentCategory: string
{
    case Agreement = 'agreement';
    case TenancyAgreement = 'tenancy_agreement';
    case Receipt = 'receipt';
    case InspectionPhoto = 'inspection_photo';
    case IdDocument = 'id_document';
    case Notice = 'notice';
    case Other = 'other';
}
