<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormulaEnvasado extends Model
{
    protected $table = 'formulas_envasado';
    protected $fillable = ['formulacion_id','articulo','descripcion','cantidad'];
}
