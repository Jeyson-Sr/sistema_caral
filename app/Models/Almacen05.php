<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Almacen05 extends Model
{
    use HasFactory;

    protected $table = 'almacen05'; // nombre real de la tabla

    protected $fillable = [
        'articulo',
        'descripcion',
        'u_m',
        'contenido',
        'saldo_inicial',
        'ingresos',
        'salidas',
        'saldo_final',
        'lin_art',
        'nombre_linea',
    ];
}
