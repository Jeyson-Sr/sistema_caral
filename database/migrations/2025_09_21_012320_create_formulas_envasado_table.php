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
        Schema::create('formulas_envasado', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('formulacion_id')->nullable(); // si quieres relacionar con una formulación general
            $table->unsignedBigInteger('articulo'); // id del artículo
            $table->string('descripcion'); // nombre del artículo
            $table->decimal('cantidad', 15, 7); // soporta hasta 7 decimales
            $table->timestamps();

            // $table->foreign('formulacion_id')->references('id')->on('formulaciones')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('formulas_envasado');
    }
};
