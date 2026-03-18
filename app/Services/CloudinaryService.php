<?php

namespace App\Services;

use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Configuration\Configuration;


class CloudinaryService
{
    public function upload($file, string $folder = 'talent_sync_document')
    {
        Configuration::instance([
            'cloud' => [
                'cloud_name' => config('cloudinary.cloud_name'),
                'api_key' => config('cloudinary.api_key'),
                'api_secret' => config('cloudinary.api_secret'),
            ],
            'secure' => true
        ]);


        $uploadApi = new UploadApi();

        return $uploadApi->upload(
            $file->getRealPath(),
            [
                'folder' => $folder,
            ]
        );
    }
}
