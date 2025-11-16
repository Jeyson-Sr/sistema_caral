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
        Schema::create('almacen_planeamiento', function (Blueprint $table) {
            $table->id();


            // Categoría: jarabe / envasado / otro
            $table->string('categoria', 50);

            // Artículo y cantidad
            $table->unsignedBigInteger('articulo_id');
            $table->string('descripcion'); // nombre del artículo
            $table->bigInteger('cantidad')->default(0);

            // Valor único de stack (identificador del lote o carga)
            $table->string('stack', 255)->nullable();

            $table->timestamps();

            // Evita duplicados de stack por formulario
            // $table->unique(['formulario_id', 'stack'], 'uniq_form_stack');

            // Si existe tabla formularios, activa esta línea:
            // $table->foreign('formulario_id')->references('id')->on('formularios')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alamacen_planeamiento');
    }
};
