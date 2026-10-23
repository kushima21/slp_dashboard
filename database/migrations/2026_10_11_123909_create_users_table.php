
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Personal Information
            $table->string('firstname', 100);
            $table->string('middlename', 100)->nullable();
            $table->string('lastname', 100);
            $table->string('contact_number', 30);
            $table->string('gender', 20);
            $table->text('address');

            // Login Credentials
            $table->string('email')->unique();
            $table->string('password');
            $table->rememberToken();

            // LGU Assignment
            $table->string('lgu', 150);
            $table->string('municipality', 150);
            $table->string('district', 100)->default('1st District');

            // Multiple System Roles
            // Example: ["admin", "lgu"]
            $table->json('roles')->nullable();

            // Account Status
            $table->string('status', 20)->default('Active');

            // Timestamps
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
