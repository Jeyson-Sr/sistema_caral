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
        Schema::create('formulas_jarabe', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('formulacion_id')->nullable();
            $table->unsignedBigInteger('articulo');
            $table->unsignedBigInteger('sku_jarabe');
            $table->string('descripcion');
            $table->decimal('cantidad', 15, 7);
            $table->timestamps();

            // $table->foreign('formulacion_id')->references('id')->on('formulaciones')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('formulas_jarabe');
    }
};
