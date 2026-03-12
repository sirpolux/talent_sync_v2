<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class GeoController extends Controller
{
    /**
     * Returns countries for dropdowns.
     * Response: [{ "name": "Nigeria", "iso2": "NG" }, ...]
     */
    public function countries()
    {
        return Cache::remember('geo:countries:v1', now()->addDays(7), function () {
            $res = Http::timeout(15)->acceptJson()->get('https://countriesnow.space/api/v0.1/countries/iso');

            if (!$res->successful()) {
                return response()->json([
                    'message' => 'Failed to fetch countries',
                ], 502);
            }

            $json = $res->json();

            $countries = collect($json['data'] ?? [])
                ->map(fn ($c) => [
                    'name' => $c['name'] ?? null,
                    'iso2' => $c['Iso2'] ?? ($c['iso2'] ?? null),
                ])
                ->filter(fn ($c) => !empty($c['name']))
                ->values();

            return response()->json($countries);
        });
    }

    /**
     * Returns states/regions for a given country.
     * Request: ?country=Nigeria
     * Response: ["Lagos", "Abuja", ...]
     */
    public function states(Request $request)
    {
        $country = trim((string) $request->query('country'));

        if ($country === '') {
            return response()->json([
                'message' => 'country is required',
            ], 422);
        }

        $cacheKey = 'geo:states:v1:' . mb_strtolower($country);

        return Cache::remember($cacheKey, now()->addDays(7), function () use ($country) {
            $res = Http::timeout(15)
                ->acceptJson()
                ->asJson()
                ->post('https://countriesnow.space/api/v0.1/countries/states', [
                    'country' => $country,
                ]);

            if (!$res->successful()) {
                return response()->json([
                    'message' => 'Failed to fetch states',
                ], 502);
            }

            $json = $res->json();

            $states = collect($json['data']['states'] ?? [])
                ->pluck('name')
                ->filter()
                ->values();

            return response()->json($states);
        });
    }
}
