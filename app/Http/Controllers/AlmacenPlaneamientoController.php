<?php

namespace App\Http\Controllers;

use App\Models\AlmacenPlaneamiento;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Validator;

class AlmacenPlaneamientoController extends Controller
{
    public function index()
    {
        $data = AlmacenPlaneamiento::orderBy('stack')
            ->orderBy('categoria')
            ->orderBy('articulo_id')
            ->get();

        return response()->json(['data' => $data], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'stack' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Validación', 'messages' => $validator->errors()], 422);
        }

        $payload = $request->all();
        $stack = $payload['stack'] ?? Str::uuid()->toString();

        $now = now();
        $rows = [];

        foreach ($payload as $categoria => $items) {
            if (!is_array($items)) continue;
            foreach ($items as $item) {
                if (empty($item['articulo']) || !isset($item['cantidad'])) continue;
                $rows[] = [
                    'categoria'     => (string) $categoria,
                    'articulo_id'   => (int) $item['articulo'],
                    'descripcion'   => $item['descripcion'] ?? null,
                    'cantidad'      => (int) $item['cantidad'],
                    'stack'         => $stack,
                    'created_at'    => $now,
                    'updated_at'    => $now,
                ];
            }
        }

        if (empty($rows)) {
            return response()->json(['error' => 'No se encontraron ítems válidos'], 422);
        }

        // mergear por stack+articulo_id para evitar duplicados dentro del mismo batch
        $rows = $this->mergeRows($rows);

        try {
            DB::table('almacen_planeamiento')->insert($rows);

            return response()->json([
                'ok' => true,
                'stack' => $stack,
                'inserted' => count($rows),
                'message' => 'Items guardados correctamente'
            ], 201);

        } catch (QueryException $e) {
            // 1062 = duplicate entry (índice único)
            if (isset($e->errorInfo[1]) && $e->errorInfo[1] == 1062) {
                return response()->json(['error' => 'Stack duplicado'], 409);
            }

            return response()->json(['error' => 'Error de BD', 'msg' => $e->getMessage()], 500);
        } catch (\Throwable $t) {
            return response()->json(['error' => 'Error interno', 'msg' => $t->getMessage()], 500);
        }
    }

    /**
     * Agrupa filas por stack+articulo_id sumando cantidades.
     */
    private function mergeRows(array $rows): array
    {
        $map = [];
        foreach ($rows as $r) {
            $key = $r['stack'].'||'.$r['articulo_id'].'||'.$r['categoria'];
            if (!isset($map[$key])) {
                $map[$key] = $r;
            } else {
                $map[$key]['cantidad'] += (int)$r['cantidad'];
            }
        }
        return array_values($map);
    }
}
