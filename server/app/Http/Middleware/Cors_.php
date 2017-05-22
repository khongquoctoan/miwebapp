<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Routing\Middleware;
use Illuminate\Http\Response;
class Cors
{

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Closure $next
     *
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        header('Access-Control-Allow-Origin: *');
//        header('Access-Control-Allow-Origin: http://mitek-popup.dev');
        
        $headers = [
            'Access-Control-Allow-Methods' => 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers' => 'Content-Type, X-Auth-Token, Origin',
//            'Access-Control-Allow-Headers' => 'Content-Type, Accept, Authorization, X-Requested-With',
//            'Access-Control-Max-Age'       => '28800'
            //, Accept, Authorization, X-Requested-With
        ];
        
        if($request->getMethod() == "OPTIONS") {
            return Response::make('OK', 200, $headers);
        }
        
        $response = $next($request);
        foreach($headers as $key => $value)
            $response->header($key, $value);
        return $response;
    }
}