<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Almacen05;
use App\Models\Almacen20;

class AlmacenController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('almacen');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store05(Request $request)
    {
        foreach ($request->data as $row) {
            Almacen05::updateOrCreate(
                ['articulo' => $row['Articulo.']], // clave única
                [
                    'descripcion'   => $row['Descripcion'] ?? '',
                    'u_m'           => $row['U.M'] ?? '',
                    'contenido'     => $row['Contenido'] ?? 0,
                    'saldo_inicial' => $row['Saldo_Inicial'] ?? 0,
                    'ingresos'      => $row['Ingresos'] ?? 0,
                    'salidas'       => $row['Salidas'] ?? 0,
                    'saldo_final'   => $row['Saldo_Final'] ?? 0,
                    'lin_art'       => $row['Lin_art'] ?? 0,
                    'nombre_linea'  => $row['Nombre_Linea'] ?? '',
                ]
            );
        }
        return response()->json(['success' => true]);
    }

    public function store20(Request $request)
    {
        foreach ($request->data as $row) {
            Almacen20::updateOrCreate(
                ['articulo' => $row['Articulo.']], // clave única
                [
                    'descripcion'   => $row['Descripcion'] ?? '',
                    'u_m'           => $row['U.M'] ?? '',
                    'contenido'     => $row['Contenido'] ?? 0,
                    'saldo_inicial' => $row['Saldo_Inicial'] ?? 0,
                    'ingresos'      => $row['Ingresos'] ?? 0,
                    'salidas'       => $row['Salidas'] ?? 0,
                    'saldo_final'   => $row['Saldo_Final'] ?? 0,
                    'lin_art'       => $row['Lin_art'] ?? 0,
                    'nombre_linea'  => $row['Nombre_Linea'] ?? '',
                ]
            );
        }
        return response()->json(['success' => true]);
    }
    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }


        public function index20()
    {
        return Almacen20::all();
    }

    public function index05()
    {
        return Almacen05::all();
    }


}
