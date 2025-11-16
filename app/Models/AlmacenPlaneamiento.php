<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AlmacenPlaneamiento extends Model
{
    use HasFactory;

    protected $table = 'almacen_planeamiento';

    protected $fillable = [
        'categoria',
        'articulo_id',
        'descripcion',
        'cantidad',
        'stack',
    ];
}
