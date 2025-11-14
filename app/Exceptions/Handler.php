<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Illuminate\Session\TokenMismatchException;

class Handler extends ExceptionHandler
{
    // ... keep your $dontReport / $dontFlash

    public function render($request, Throwable $e)
    {
        // API/JSON: keep default JSON behavior
        if ($request->expectsJson()) {
            return parent::render($request, $e);
        }

        // 419 CSRF / session expired
        if ($e instanceof TokenMismatchException) {
            return Inertia::render('Errors/419', [
                'status'  => 419,
                'message' => 'Your session expired. Please sign in again.',
            ])->toResponse($request)->setStatusCode(419);
        }

        // HTTP exceptions (403/404/429/500/etc.)
        if ($e instanceof HttpExceptionInterface) {
            $status = $e->getStatusCode();

            // Map to our Inertia pages
            if ($status === 403) {
                return Inertia::render('Errors/403', [
                    'status'  => 403,
                    'message' => 'You don’t have permission to access this page.',
                ])->toResponse($request)->setStatusCode(403);
            }

            if ($status === 404) {
                return Inertia::render('Errors/404', [
                    'status'  => 404,
                    'message' => 'We couldn’t find what you were looking for.',
                ])->toResponse($request)->setStatusCode(404);
            }
        }

        // Fallback: friendly 500
        return Inertia::render('Errors/500', [
            'status'  => 500,
            'message' => 'Something went wrong on our side.',
        ])->toResponse($request)->setStatusCode(500);
    }
}
