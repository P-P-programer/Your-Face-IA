<?php

namespace App\Http\Controllers;

use App\Models\DeviceRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\ConnectionException;
use Throwable;

class CameraProxyController extends Controller
{
    public function stream(Request $request, DeviceRegistration $device)
    {
        $target = $this->validatedCameraUrl(
            $device->stream_url,
            $device->device_ip,
            ['/stream'],
            [81, 80]
        );

        if (!$target) {
            return response()->json(['message' => 'Stream no disponible'], 404);
        }

        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 10,
                'ignore_errors' => true,
                'header' => "User-Agent: YourFaceIA-Proxy\r\n",
            ],
        ]);

        $in = @fopen($target, 'rb', false, $context);
        if ($in === false) {
            return response()->json(['message' => 'No se pudo abrir el stream'], 502);
        }

        $contentType = $this->extractContentType($http_response_header ?? [])
            ?? 'multipart/x-mixed-replace; boundary=frame';

        return response()->stream(function () use ($in) {
            while (!feof($in)) {
                echo fread($in, 8192);
                @ob_flush();
                flush();

                if (connection_aborted()) {
                    break;
                }
            }

            fclose($in);
        }, 200, [
            'Content-Type' => $contentType,
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    public function snapshot(Request $request, DeviceRegistration $device)
    {
        $target = $this->validatedCameraUrl(
            $device->snapshot_url,
            $device->device_ip,
            ['/capture'],
            [80, 81]
        );

        if (!$target) {
            return response()->json(['message' => 'Snapshot no disponible'], 404);
        }

        try {
            $resp = Http::timeout(8)
                ->connectTimeout(4)
                ->withHeaders(['User-Agent' => 'YourFaceIA-Proxy'])
                ->get($target);

            if (!$resp->successful()) {
                return response()->json([
                    'message' => 'No se pudo obtener snapshot',
                    'status' => $resp->status(),
                ], 502);
            }

            return response($resp->body(), 200, [
                'Content-Type' => $resp->header('Content-Type') ?: 'image/jpeg',
                'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma' => 'no-cache',
            ]);
        } catch (ConnectionException $e) {
            return response()->json([
                'message' => 'No se pudo conectar al dispositivo (snapshot)',
            ], 502);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Error inesperado al obtener snapshot',
            ], 502);
        }
    }

    private function validatedCameraUrl(?string $url, string $deviceIp, array $allowedPaths, array $allowedPorts): ?string
    {
        if (!$url) {
            return null;
        }

        $parts = parse_url($url);
        if (!$parts) {
            return null;
        }

        $scheme = strtolower($parts['scheme'] ?? '');
        $host = $parts['host'] ?? '';
        $path = $parts['path'] ?? '';
        $port = (int) ($parts['port'] ?? ($scheme === 'https' ? 443 : 80));

        // Caso 1: IP local (http)
        if (
            $scheme === 'http' &&
            $host === $deviceIp &&
            in_array($port, $allowedPorts, true) &&
            in_array($path, $allowedPaths, true)
        ) {
            return $url;
        }

        // Caso 2: Dominio público (https)
        if (
            $scheme === 'https' &&
            $host === 'cam.your-face-ia.site' &&
            $port === 443 &&
            in_array($path, $allowedPaths, true)
        ) {
            return $url;
        }

        return null;
    }

    private function extractContentType(array $headers): ?string
    {
        foreach ($headers as $line) {
            if (stripos($line, 'Content-Type:') === 0) {
                return trim(substr($line, strlen('Content-Type:')));
            }
        }

        return null;
    }
}