<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('assignments', function () {
    return view('assignments.index');
});

Route::get('create', function () {
    return view('assignments.create');
});

Route::post('saveAssignment', 'App\Http\Controllers\AssignmentController@saveAssignmet')->name('assignment.saveAssinment');
