<?php

namespace App\Http\Controllers;
use App\Models\User;
use App\Notifications\LiveChatGuestMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class ChatBotController extends Controller
{
    public function toggleChat()
    {
        $setting = DB::table('settings')->first();
        if (!$setting) {
            DB::table('settings')->insert(['chat_available' => true, 'created_at' => now(), 'updated_at' => now()]);
        } else {
            DB::table('settings')->where('id', $setting->id)->update(['chat_available' => !$setting->chat_available, 'updated_at' => now()]);
        }
        return back();
    }

    public function chatStatus()
    {
        $setting = DB::table('settings')->first();
        return response()->json(['available' => $setting ? (bool) $setting->chat_available : false]);
    }

    public function startConversation(Request $request)
    {
        $request->validate(['name' => 'required|string|max:100', 'email' => 'required|email|max:200', 'message' => 'required|string|max:2000']);

        $conv = DB::table('chat_conversations')->insertGetId([
            'guest_name'      => $request->name,
            'guest_email'     => $request->email,
            'plan'            => $request->input('plan', 'guest'),
            'status'          => 'open',
            'last_message_at' => now(),
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

      DB::table('chat_messages')->insert([
        'conversation_id' => $conv,
        'sender'          => 'guest',
        'body'            => $request->message,
        'created_at'      => now(),
        'updated_at'      => now(),
    ]);

    $admins = User::where('role', 'admin')->get();

    foreach ($admins as $admin) {
        $admin->notify(new LiveChatGuestMessage(
            conversationId: $conv,
            guestName: $request->name,
            messagePreview: mb_substr($request->message, 0, 100)
        ));
    }

        return response()->json(['conversation_id' => $conv]);
    }

    public function guestMessage(Request $request, $conversation)
{
    $request->validate(['message' => 'required|string|max:2000']);

    $conv = DB::table('chat_conversations')->find($conversation);

    if (!$conv || $conv->status === 'closed') {
        return response()->json(['error' => 'Conversation closed'], 422);
    }

    DB::table('chat_messages')->insert([
        'conversation_id' => $conversation,
        'sender'          => 'guest',
        'body'            => $request->message,
        'created_at'      => now(),
        'updated_at'      => now(),
    ]);

    DB::table('chat_conversations')
        ->where('id', $conversation)
        ->update([
            'last_message_at' => now(),
            'updated_at'      => now(),
        ]);

    $admins = User::where('role', 'admin')->get();

    foreach ($admins as $admin) {
        $admin->notify(new LiveChatGuestMessage(
            conversationId: (int) $conversation,
            guestName: $conv->guest_name ?: 'Guest',
            messagePreview: mb_substr($request->message, 0, 100)
        ));
    }

    return response()->json(['ok' => true]);
}

    public function poll($conversation)
    {
        $conv = DB::table('chat_conversations')->find($conversation);
        if (!$conv) return response()->json(['error' => 'Not found'], 404);
        $messages = DB::table('chat_messages')->where('conversation_id', $conversation)->orderBy('id')->get(['id', 'sender', 'body', 'created_at']);
        return response()->json(['messages' => $messages, 'status' => $conv->status]);
    }

    public function conversations()
    {
        $convs = DB::table('chat_conversations')->orderByDesc('last_message_at')->get()->map(function ($c) {
            $unread = DB::table('chat_messages')->where('conversation_id', $c->id)->where('sender', 'guest')->whereNull('read_at')->count();
            $last   = DB::table('chat_messages')->where('conversation_id', $c->id)->orderByDesc('id')->first();
            return [
                'id'          => $c->id,
                'guest_name'  => $c->guest_name,
                'guest_email' => $c->guest_email,
                'plan'        => $c->plan ?? 'guest',
                'status'      => $c->status,
                'unread'      => $unread,
                'last_message'=> $last?->body,
                'last_at'     => $c->last_message_at,
                'messages'    => DB::table('chat_messages')->where('conversation_id', $c->id)->orderBy('id')->get(['id', 'sender', 'body', 'created_at']),
            ];
        });
        return response()->json($convs);
    }

    public function adminReply(Request $request, $conversation)
    {
        $request->validate(['message' => 'required|string|max:2000']);
        DB::table('chat_messages')->insert([
            'conversation_id' => $conversation,
            'sender'          => 'admin',
            'body'            => $request->message,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);
        DB::table('chat_conversations')->where('id', $conversation)->update(['last_message_at' => now(), 'updated_at' => now()]);
        return response()->json(['ok' => true]);
    }

    public function closeConversation($conversation)
    {
        DB::table('chat_conversations')->where('id', $conversation)->update(['status' => 'closed', 'updated_at' => now()]);
        return response()->json(['ok' => true]);
    }

    public function markRead($conversation)
    {
        DB::table('chat_messages')->where('conversation_id', $conversation)->where('sender', 'guest')->whereNull('read_at')->update(['read_at' => now()]);
        return response()->json(['ok' => true]);
    }

    public function archiveConversation($conversation)
    {
        DB::table('chat_conversations')->where('id', $conversation)->update(['status' => 'archived', 'updated_at' => now()]);
        return response()->json(['ok' => true]);
    }

    public function deleteConversation($conversation)
    {
        DB::table('chat_messages')->where('conversation_id', $conversation)->delete();
        DB::table('chat_conversations')->where('id', $conversation)->delete();
        return response()->json(['ok' => true]);
    }

    public function clearConversations(Request $request)
    {
        $filter = $request->input('filter', 'closed');
        $statuses = $filter === 'all' ? ['closed', 'archived'] : [$filter];
        $ids = DB::table('chat_conversations')->whereIn('status', $statuses)->pluck('id');
        DB::table('chat_messages')->whereIn('conversation_id', $ids)->delete();
        DB::table('chat_conversations')->whereIn('id', $ids)->delete();
        return response()->json(['ok' => true, 'deleted' => $ids->count()]);
    }

    public function bulkAction(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'action' => 'required|in:archive,delete']);
        $ids = $request->ids;
        if ($request->action === 'archive') {
            DB::table('chat_conversations')->whereIn('id', $ids)->update(['status' => 'archived', 'updated_at' => now()]);
        } else {
            DB::table('chat_messages')->whereIn('conversation_id', $ids)->delete();
            DB::table('chat_conversations')->whereIn('id', $ids)->delete();
        }
        return response()->json(['ok' => true]);
    }
}
