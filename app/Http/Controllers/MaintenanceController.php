<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceTask;
use App\Models\Property;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->plan, ['pro', 'agency'])) {
            return redirect()->route('checkout.show');
        }

        $propertyIds = Property::where('user_id', $user->id)->pluck('id');

        $tasks = MaintenanceTask::whereIn('property_id', $propertyIds)
            ->with('property:id,title')
            ->orderByRaw("CASE status WHEN 'open' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END")
            ->orderByRaw("CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END")
            ->orderBy('due_date')
            ->get()
            ->map(fn($t) => [
                'id'           => $t->id,
                'title'        => $t->title,
                'description'  => $t->description,
                'priority'     => $t->priority,
                'status'       => $t->status,
                'due_date'     => $t->due_date?->toDateString(),
                'resolved_at'  => $t->resolved_at?->toDateTimeString(),
                'notes'        => $t->notes,
                'property_id'  => $t->property_id,
                'property'     => $t->property->title,
                'is_overdue'   => $t->status !== 'resolved' && $t->due_date && $t->due_date->isPast(),
            ]);

        $properties = Property::where('user_id', $user->id)
            ->get(['id', 'title']);

        return Inertia::render('Host/Maintenance/Index', [
            'tasks'      => $tasks,
            'properties' => $properties,
            'counts'     => [
                'open'        => $tasks->where('status', 'open')->count(),
                'in_progress' => $tasks->where('status', 'in_progress')->count(),
                'resolved'    => $tasks->where('status', 'resolved')->count(),
                'overdue'     => $tasks->where('is_overdue', true)->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->plan, ['pro', 'agency'])) abort(403);

        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority'    => 'required|in:low,medium,high,urgent',
            'status'      => 'required|in:open,in_progress,resolved',
            'due_date'    => 'nullable|date',
            'notes'       => 'nullable|string',
        ]);

        // Ensure property belongs to user
        $property = Property::where('id', $validated['property_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        $task = MaintenanceTask::create([
            ...$validated,
            'resolved_at' => $validated['status'] === 'resolved' ? now() : null,
        ]);

        return back()->with('success', 'Task created.');
    }

    public function update(Request $request, MaintenanceTask $task)
    {
        $user = $request->user();
        if (!in_array($user->plan, ['pro', 'agency'])) abort(403);

        // Ensure task belongs to this user
        abort_unless(
            Property::where('id', $task->property_id)->where('user_id', $user->id)->exists(),
            403
        );

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority'    => 'required|in:low,medium,high,urgent',
            'status'      => 'required|in:open,in_progress,resolved',
            'due_date'    => 'nullable|date',
            'notes'       => 'nullable|string',
        ]);

        // Set resolved_at when moving to resolved
        if ($validated['status'] === 'resolved' && $task->status !== 'resolved') {
            $validated['resolved_at'] = now();
        } elseif ($validated['status'] !== 'resolved') {
            $validated['resolved_at'] = null;
        }

        $task->update($validated);

        return back()->with('success', 'Task updated.');
    }

    public function destroy(Request $request, MaintenanceTask $task)
    {
        $user = $request->user();
        if (!in_array($user->plan, ['pro', 'agency'])) abort(403);

        abort_unless(
            Property::where('id', $task->property_id)->where('user_id', $user->id)->exists(),
            403
        );

        $task->delete();

        return back()->with('success', 'Task deleted.');
    }
}
