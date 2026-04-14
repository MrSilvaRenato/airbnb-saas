<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\WelcomePackage;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    /**
     * Export all stays for the user's properties as CSV.
     * Available to Host + Pro plans.
     */
    public function stays(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->plan ?? 'free', ['host', 'growth', 'pro', 'agency'])) {
            abort(403, 'Export is available on Growth and above plans.');
        }

        $propertyIds = Property::where('user_id', $user->id)->pluck('id');

        $stays = WelcomePackage::whereIn('property_id', $propertyIds)
            ->with('property:id,title')
            ->with('visits')
            ->orderBy('check_in_date', 'desc')
            ->get();

        $filename = 'stays-' . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control'       => 'no-cache, no-store, must-revalidate',
        ];

        $callback = function () use ($stays) {
            $out = fopen('php://output', 'w');

            // Header row
            fputcsv($out, [
                'Property',
                'Guest Name',
                'Guest Email',
                'Guest Phone',
                'Check-In',
                'Check-Out',
                'Nights',
                'Guests',
                'Price Total',
                'Status',
                'Page Views',
                'Email Sent',
                'Created At',
            ]);

            foreach ($stays as $stay) {
                $checkIn  = $stay->check_in_date  ? new \DateTime($stay->check_in_date)  : null;
                $checkOut = $stay->check_out_date ? new \DateTime($stay->check_out_date) : null;
                $nights   = ($checkIn && $checkOut) ? $checkIn->diff($checkOut)->days : '';

                $today  = now()->toDateString();
                $status = 'Upcoming';
                if ($stay->check_out_date && $stay->check_out_date < $today) {
                    $status = 'Ended';
                } elseif ($stay->check_in_date && $stay->check_in_date <= $today && $stay->check_out_date >= $today) {
                    $status = 'Ongoing';
                }

                fputcsv($out, [
                    $stay->property?->title ?? '',
                    $stay->guest_first_name ?? '',
                    $stay->guest_email ?? '',
                    $stay->guest_phone ?? '',
                    $stay->check_in_date ?? '',
                    $stay->check_out_date ?? '',
                    $nights,
                    $stay->guest_count ?? '',
                    $stay->price_total ?? '',
                    $status,
                    $stay->visits->count(),
                    $stay->sent_at ? $stay->sent_at->format('Y-m-d H:i') : '',
                    $stay->created_at?->format('Y-m-d'),
                ]);
            }

            fclose($out);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export analytics summary as CSV.
     * Available to Pro plan only.
     */
    public function analytics(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->plan ?? 'free', ['pro', 'agency'])) {
            abort(403, 'Analytics export is available on Pro and Agency plans.');
        }

        $properties = Property::where('user_id', $user->id)
            ->with(['welcomePackages.visits'])
            ->get();

        $filename = 'analytics-' . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control'       => 'no-cache, no-store, must-revalidate',
        ];

        $callback = function () use ($properties) {
            $out = fopen('php://output', 'w');

            fputcsv($out, [
                'Property',
                'Total Stays',
                'Total Revenue',
                'Total Page Views',
                'Avg Views Per Stay',
                'Active Stays',
            ]);

            foreach ($properties as $property) {
                $stays        = $property->welcomePackages;
                $totalStays   = $stays->count();
                $totalRevenue = $stays->sum('price_total');
                $totalViews   = $stays->sum(fn($s) => $s->visits->count());
                $avgViews     = $totalStays > 0 ? round($totalViews / $totalStays, 1) : 0;
                $today        = now()->toDateString();
                $activeStays  = $stays->filter(fn($s) =>
                    $s->check_in_date  <= $today &&
                    $s->check_out_date >= $today
                )->count();

                fputcsv($out, [
                    $property->title,
                    $totalStays,
                    number_format((float)$totalRevenue, 2),
                    $totalViews,
                    $avgViews,
                    $activeStays,
                ]);
            }

            fclose($out);
        };

        return response()->stream($callback, 200, $headers);
    }
}
