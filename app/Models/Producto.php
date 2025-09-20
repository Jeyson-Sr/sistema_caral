<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
     use HasFactory;

    // Nombre de la tabla (opcional si sigue la convención plural)
    protected $table = 'productos';

    // Campos que se pueden asignar en masa (mass assignment)
    protected $fillable = [
        'linea',
        'sku_descripcion',
        'sku_envasado', 
        'sku_jarabe',
        'formato',
        'marca',
        'sabor',
        'litros_batch',
        'bebida_final',
        'factor_azucar',
        'ef_velocidad',
        'velocidad_bot',
        'unidad_paquete',
        'paquetes_nivel',
        'carton_nivel',
    ];
}
