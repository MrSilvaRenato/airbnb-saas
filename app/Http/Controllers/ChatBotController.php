<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChatBotController extends Controller
{
    public function toggleChat(Request $request)
    {
        $setting = DB::table('settings')->first();

        if (!$setting) {
            DB::table('settings')->insert([
                'chat_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'available' => true,
            ]);
        }

        $newStatus = !$setting->chat_available;

        DB::table('settings')
            ->where('id', $setting->id)
            ->update([
                'chat_available' => $newStatus,
                'updated_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'available' => (bool) $newStatus,
        ]);
    }

    public function chatStatus()
    {
        $setting = DB::table('settings')->first();

        return response()->json([
            'available' => $setting ? (bool) $setting->chat_available : false,
        ]);
    }
}