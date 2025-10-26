<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

use App\Models\FormulaEnvasado;
use App\Models\FormulaJarabe;

class FormulaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
public function create(Request $request)
{
    try {
        // Validate input parameters
        $validator = Validator::make($request->all(), [
            'skuJarabe' => 'sometimes|nullable|numeric',
            'skuEnvasado' => 'required|numeric'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid input parameters',
                'errors' => $validator->errors()
            ], 422);
        }

        $skuJarabe = $request->input('skuJarabe');
        $skuEnvasado = $request->input('skuEnvasado');

        // Initialize empty collections
        $jarabe = collect();
        $envasado = collect();

        // Get envasado data
        $envasado = FormulaEnvasado::where('formulacion_id', $skuEnvasado)->get();
        
        if ($envasado->isEmpty()) {
            return response()->json([
                'message' => 'No envasado formula found for the given SKU',
                'jarabe' => [],
                'envasado' => [],
                'matchingRows' => []
            ], 404);
        }

        // Se obtine el jarabe en base del campo de formulacion_id
        if (!empty($skuJarabe)) {
            $jarabe = FormulaJarabe::where('formulacion_id', $skuEnvasado)->get();
        }

        // Busca filas coincidentes solo si se solicitó y encontró datos de jarabe
        $matchingRows = ($jarabe->isNotEmpty() && $envasado->isNotEmpty())
            ? $jarabe->filter(fn($item) => $envasado->contains('articulo', $item->articulo))
            : collect();

        return response()->json([
            'success' => true,
            'jarabe' => $jarabe,
            'envasado' => $envasado,
            'matchingRows' => $matchingRows,
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Server error',
            'error' => $e->getMessage()
        ], 500);
    }
}





    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
{
    // Get formulacion_id from request and validate it's required
    $rules = [
        'formulacion_id' => 'required|integer',
        'envasado' => 'sometimes|array',
        'envasado.*.articulo' => 'required_with:envasado|integer',
        'envasado.*.descripcion' => 'required_with:envasado|string',
        'envasado.*.cantidad' => 'required_with:envasado|numeric',

        'jarabe' => 'sometimes|array',
        'jarabe.*.articulo' => 'required_with:jarabe|integer',
        'jarabe.*.sku_jarabe' => 'nullable|integer',
        'jarabe.*.descripcion' => 'required_with:jarabe|string',
        'jarabe.*.cantidad' => 'required_with:jarabe|numeric',
    ];

    $validator = Validator::make($request->all(), $rules);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

    $formulacion_id = $request->input('formulacion_id');
    $envasado = Arr::wrap($request->input('envasado'));
    $jarabe = Arr::wrap($request->input('jarabe'));

    if (empty($envasado) && empty($jarabe)) {
        return response()->json(['message' => 'No se enviaron filas de envasado ni jarabe.'], 422);
    }

    $result = DB::transaction(function () use ($formulacion_id, $envasado, $jarabe) {
        $created = ['envasado' => [], 'jarabe' => []];

        foreach ($envasado as $fila) {
            $created['envasado'][] = FormulaEnvasado::create([
                'formulacion_id' => $formulacion_id,
                'articulo' => (int)$fila['articulo'],
                'descripcion' => $fila['descripcion'],
                'cantidad' => $fila['cantidad'],
            ]);
        }

        foreach ($jarabe as $fila) {
            $created['jarabe'][] = FormulaJarabe::create([
                'formulacion_id' => $formulacion_id,
                'articulo' => (int)$fila['articulo'],
                'sku_jarabe' => array_key_exists('sku_jarabe', $fila) ? $fila['sku_jarabe'] : null,
                'descripcion' => $fila['descripcion'],
                'cantidad' => $fila['cantidad'],
            ]);
        }

        return $created;
    });

    return response()->json([
        'ok' => true,
        'created' => [
            'envasado' => count($result['envasado']),
            'jarabe' => count($result['jarabe'])
        ]
    ], 201);
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
