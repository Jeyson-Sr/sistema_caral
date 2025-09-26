<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormulaJarabe extends Model
{
    protected $table = 'formulas_jarabe';
    protected $fillable = ['formulacion_id','articulo','sku_jarabe','descripcion','cantidad'];
}
