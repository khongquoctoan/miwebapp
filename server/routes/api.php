<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

//Route::group(['domain' => 'api.mitek-popup.dev', 'middleware' => ['cors'], 'prefix' => 'v1', 'namespace' => 'managers'], function () {
Route::group(['prefix' => 'v1', 'namespace' => 'Managers'], function () {
    Route::post('/login', ['as' => 'login-api', 'uses' => 'UsersController@postLogin']);
    Route::post('/logout', ['as' => 'logout-api', 'uses' => 'UsersController@postLogout']);
//    Route::get('/login', ['as' => 'login-api', 'uses' => 'UsersController@postLogin']);
//    Route::options('/login', ['as' => 'login-api', 'uses' => 'UsersController@postLogin']);
    Route::group(['middleware' => ['jwt.auth']], function () {
    
        Route::get('/customers', ['as' => 'customers-api', 'uses' => 'CustomersController@getDataTables']);
        Route::get('/customers/latest', ['as' => 'customers-latest', 'uses' => 'CustomersController@getCustomerLatest']);
        Route::get('/customer/{id}', ['as' => 'customer-info', 'uses' => 'CustomersController@getInfoByID']);
        Route::post('/postCustomer', ['as' => 'customer-insert', 'uses' => 'CustomersController@insertCustomer']);
        Route::post('/putCustomer/{id}', ['as' => 'customer-update', 'uses' => 'CustomersController@updateCustomer']);
        Route::get('/deleteCustomer/{id}', ['as' => 'customer-delete', 'uses' => 'CustomersController@deleteCustomer']);
        Route::get('/duplicateCustomer/{id}', ['as' => 'customer-duplicate', 'uses' => 'CustomersController@duplicateCustomer']);
        Route::post('/deleteMultiCustomer', ['as' => 'customer-deletes', 'uses' => 'CustomersController@deleteMultiCustomer']);
        
        Route::get('/userTypeGroup', ['as' => 'users-type-group', 'uses' => 'UsersController@getInfoUserTypeGroup']);
        Route::get('/users', ['as' => 'users-api', 'uses' => 'UsersController@getDataTables']);
        Route::get('/user/{id}', ['as' => 'user-info', 'uses' => 'UsersController@getInfoByID']);
        Route::put('/putUserProfile/{id}', ['as' => 'user-update', 'uses' => 'UsersController@updateUserProfile']);
        Route::put('/putUser/{id}', ['as' => 'user-update', 'uses' => 'UsersController@updateUser']);
        Route::post('/postUser', ['as' => 'user-insert', 'uses' => 'UsersController@insertUser']);
        Route::get('/deleteUser/{id}', ['as' => 'user-delete', 'uses' => 'UsersController@deleteUser']);
        Route::get('/duplicateUser/{id}', ['as' => 'user-duplicate', 'uses' => 'UsersController@duplicateUser']);
        Route::post('/deleteMultiUser', ['as' => 'user-deletes', 'uses' => 'UsersController@deleteMultiUser']);
        
        Route::get('/getTags', ['as' => 'tags-get', 'uses' => 'NotesController@getTags']);
        
        Route::get('/getNotes/{customerId}', ['as' => 'notes-get', 'uses' => 'NotesController@getNotes']);
        Route::get('/notes/latest', ['as' => 'notes-latest', 'uses' => 'NotesController@getNotesLatest']);
        Route::post('/postNote/{customerId}', ['as' => 'note-post', 'uses' => 'NotesController@insertNote']);
    });
    
});