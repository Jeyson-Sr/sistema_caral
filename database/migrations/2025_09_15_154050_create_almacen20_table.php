<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('almacen20', function (Blueprint $table) {
            $table->id(); // ID autoincremental
            $table->integer('articulo')->unique(); // 6797
            $table->string('descripcion', 255);
            $table->string('u_m', 10);
            $table->decimal('contenido', 10, 2)->default(0);
            $table->decimal('saldo_inicial', 12, 2)->default(0);
            $table->decimal('ingresos', 12, 2)->default(0);
            $table->decimal('salidas', 12, 2)->default(0);
            $table->decimal('saldo_final', 12, 2)->default(0);
            $table->integer('lin_art');
            $table->string('nombre_linea', 150);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('almacen20');
    }
};
