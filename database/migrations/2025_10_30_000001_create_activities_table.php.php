<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('action', 32);                // created|updated|deleted
            $t->nullableMorphs('subject');           // subject_type, subject_id
            $t->string('title')->nullable();         // "New Stay", "Property Updated", etc.
            $t->json('meta')->nullable();            // {'property_title': 'Brisbane', 'guest':'Renato'}
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
