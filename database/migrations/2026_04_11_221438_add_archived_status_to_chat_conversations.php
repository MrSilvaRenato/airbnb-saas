<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite doesn't support ALTER COLUMN — recreate with updated check constraint
        DB::statement("CREATE TABLE chat_conversations_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guest_name VARCHAR NOT NULL,
            guest_email VARCHAR NOT NULL,
            status VARCHAR CHECK(status IN ('open','closed','archived')) NOT NULL DEFAULT 'open',
            last_message_at DATETIME,
            created_at DATETIME,
            updated_at DATETIME
        )");
        DB::statement('INSERT INTO chat_conversations_new SELECT * FROM chat_conversations');
        DB::statement('DROP TABLE chat_conversations');
        DB::statement('ALTER TABLE chat_conversations_new RENAME TO chat_conversations');
    }

    public function down(): void
    {
        DB::statement("UPDATE chat_conversations SET status = 'closed' WHERE status = 'archived'");
    }
};
