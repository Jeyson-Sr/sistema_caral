<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AlmacenController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\FormulaController;
use App\Http\Controllers\AlmacenPlaneamientoController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');



Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    Route::get('matrizGeneral', function () {
        return Inertia::render('matrizGeneral');
    })->name('matrizGeneral');
    
    Route::get('almacen', function () {
        return Inertia::render('almacen');
    })->name('almacen');
    
    Route::get('createProduct', function () {
        return Inertia::render('createProduct');
    })->name('createProduct');
    
    Route::get('productos', function () {
        return Inertia::render('productos');
    })->name('productos');
    
    
    Route::post('/almacen/create/05', [AlmacenController::class, 'store05'])->name('almacen05.store');
    Route::post('/almacen/create/13', [AlmacenController::class, 'store13'])->name('almacen13.store');
    Route::post('/almacen/create/20', [AlmacenController::class, 'store20'])->name('almacen20.store');

    Route::get('/almacen/05', [AlmacenController::class, 'index05'])->name('almacen05.index');
    Route::get('/almacen/13', [AlmacenController::class, 'index13'])->name('almacen13.index');
    Route::get('/almacen/20', [AlmacenController::class, 'index20'])->name('almacen20.index');

    Route::post('/productos', [ProductController::class, 'store']);

    Route::post('/formulas/create', [FormulaController::class, 'create']);
    Route::post('/formulas', [FormulaController::class, 'store']);
    
    Route::get('/productos/list', [ProductController::class, 'index'])->name('productos.list');



    Route::post('almacen-planeamiento', [AlmacenPlaneamientoController::class, 'store']);
    Route::get('almacen-planeamiento/all', [AlmacenPlaneamientoController::class, 'index']);



    
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
