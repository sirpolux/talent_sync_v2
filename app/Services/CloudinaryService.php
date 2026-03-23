<?php

namespace App\Services;

use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Configuration\Configuration;
use InvalidArgumentException;

class CloudinaryService
{
    public function upload($file, string $folder = 'talent_sync_document')
    {
        $cloudName = config('cloudinary.cloud_name');
        $apiKey = config('cloudinary.api_key');
        $apiSecret = config('cloudinary.api_secret');

        if (! $cloudName || ! $apiKey || ! $apiSecret) {
            throw new InvalidArgumentException('Cloudinary credentials are not configured.');
        }

        Configuration::instance([
            'cloud' => [
                'cloud_name' => $cloudName,
                'api_key' => $apiKey,
                'api_secret' => $apiSecret,
            ],
            'secure' => true,
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
