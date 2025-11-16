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
        Schema::create('productos', function (Blueprint $table) {
            $table->id();
            $table->string('compania', 100)->nullable(); //✅
            $table->integer('linea');//✅
            $table->string('sku_descripcion', 100); // Se genera en base de las columnas de Marca / Sabor / Formato / unidad x paquete
            $table->integer('sku_envasado');
            $table->integer('sku_jarabe')->nullable();
            $table->decimal('formato', 6, 3); // Ej: 0.625, 3.000 ✅
            $table->string('marca', 50);//✅
            $table->string('sabor', 100);//✅
            $table->string('mercado', 100)->nullable();//✅
            $table->string('pais', 100)->nullable();//✅
            $table->decimal('litros_batch', 10, 2)->nullable();
            $table->decimal('bebida_final', 10, 2)->nullable();
            $table->decimal('factor_azucar', 20, 6)->nullable();
            $table->integer('ef_velocidad');
            $table->integer('velocidad_bot');
            $table->integer('unidad_paquete');
            $table->integer('paquetes_nivel');
            $table->integer('carton_nivel');
            $table->timestamps();
        });
    }

    

    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
