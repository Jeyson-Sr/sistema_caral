<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $productos = Producto::all();
        return response()->json($productos);
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
    public function store(Request $request)
    {
        $validated = $request->validate([
            'linea'           => 'required|integer',
            'sku_envasado'    => 'required|integer',
            'sku_jarabe'      => 'nullable|integer',
            // 'jarabe'          => 'nullable|in:si,no', // lo vamos a mapear a sku_jarabe
            'formato'         => 'required|numeric|between:0,9999.999',
            'marca'           => 'required|string|max:50',
            'sabor'           => 'required|string|max:100',
            'litros_batch'    => 'nullable|numeric|min:0',
            'bebida_final'    => 'nullable|numeric|min:0',
            'factor_azucar'   => 'nullable|numeric|between:0,9999.9999999|decimal:0,7',
            'ef_velocidad'    => 'required|numeric|min:0',
            'velocidad_bot'   => 'required|numeric|min:0',
            'unidad_paquete'  => 'required|integer|min:0',
            'paquetes_nivel'  => 'required|integer|min:0',
            'carton_nivel'    => 'required|integer|min:0',
        ]);

        // Mapear jarabe a sku_jarabe
        // $validated['sku_jarabe'] = isset($validated['jarabe'])
        //     ? ($validated['jarabe'] === 'si' ? 1 : 0)
        //     : null;

        // Generar sku_descripcion en base a marca + sabor + formato + unidad
        $validated['sku_descripcion'] = strtoupper($validated['marca'] . ' ' . $validated['sabor'] . ' ' . number_format($validated['formato'], 3, '.', '') . 'ML x' . $validated['unidad_paquete']);

        // Eliminar campo extra que no existe en la tabla
        // unset($validated['jarabe']);

        try {
            $producto = Producto::create($validated);

            return response()->json([
                'message' => 'Producto creado correctamente',
                'data'    => $producto
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error al crear producto',
                'error'   => $e->getMessage()
            ], 500);
        }
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
}
