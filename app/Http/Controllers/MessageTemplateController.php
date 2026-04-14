<?php

namespace App\Http\Controllers;

use App\Models\MessageTemplate;
use App\Models\Property;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MessageTemplateController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        abort_unless(in_array($user->plan, ['host', 'growth', 'pro', 'agency']), 403);

        // Seed defaults if none exist yet
        $existing = MessageTemplate::where('user_id', $user->id)->get();
        if ($existing->isEmpty()) {
            foreach (MessageTemplate::defaults($user->id) as $def) {
                MessageTemplate::create(array_merge($def, ['user_id' => $user->id]));
            }
            $existing = MessageTemplate::where('user_id', $user->id)->get();
        }

        $properties = Property::where('user_id', $user->id)->get(['id', 'title']);

        return Inertia::render('Host/Messaging/Templates', [
            'templates'  => $existing->map(fn($t) => [
                'id'               => $t->id,
                'trigger'          => $t->trigger,
                'property_id'      => $t->property_id,
                'send_offset_hours'=> $t->send_offset_hours,
                'subject'          => $t->subject,
                'body'             => $t->body,
                'enabled'          => (bool) $t->enabled,
            ])->values(),
            'properties' => $properties,
            'flash'      => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function update(Request $request, MessageTemplate $template)
    {
        abort_if($template->user_id !== $request->user()->id, 403);

        $data = $request->validate([
            'subject'           => 'required|string|max:255',
            'body'              => 'required|string',
            'send_offset_hours' => 'nullable|integer',
            'enabled'           => 'boolean',
        ]);

        $template->update($data);

        return back()->with('success', 'Template saved.');
    }

    public function edit(Request $request, MessageTemplate $template)
{
    abort_if($template->user_id !== $request->user()->id, 403);

    $properties = Property::where('user_id', $request->user()->id)->get(['id', 'title']);

    return Inertia::render('Host/Messaging/EditTemplate', [
        'template' => [
            'id' => $template->id,
            'trigger' => $template->trigger,
            'property_id' => $template->property_id,
            'send_offset_hours' => $template->send_offset_hours,
            'subject' => $template->subject,
            'body' => $template->body,
            'enabled' => (bool) $template->enabled,
        ],
        'properties' => $properties,
    ]);
}

    public function destroy(Request $request, MessageTemplate $template)
    {
        abort_if($template->user_id !== $request->user()->id, 403);

        $template->delete();

        return back()->with('success', 'Template deleted.');
    }
}
