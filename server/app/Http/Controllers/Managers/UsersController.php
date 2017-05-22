<?php

namespace App\Http\Controllers\Managers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use DateTime;
use JWTAuth;

class UsersController extends Controller {

    public function postLogin(Request $request) {
        $credentials            = $request->only('email', 'password');
        $credentials['status']  = 'active';
        $customClaims           = $request->remember_token ? ['exp' => date('Y-m-d', strtotime('+2 week'))] : [];
        
        if (!$token = JWTAuth::attempt($credentials, $customClaims)) {
            return response()->json(['status' => false, 'info' => null, 'role' => null], Response::HTTP_UNAUTHORIZED);
        }
        return response()->json(['status' => compact('token'), 'info' => JWTAuth::toUser(compact('token')['token']), 'role' => null]);
    }

    public function postLogout(Request $request) {
        return true;
    }

    public function getUserId() {
        try {
            $user = JWTAuth::parseToken()->toUser();
            return $user->id;
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $ex) {
            return 0;
        }
        return 0;
    }

    public function getUserGroupId() {
        try {
            $user = JWTAuth::parseToken()->toUser();
            return $user->groupId;
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $ex) {
            return 0;
        }
        return 0;
    }

    public function getUserRole() {
        try {
            $user = JWTAuth::parseToken()->toUser();
//            echo '<pre>';
//            print_r($user->getOriginal());
//            print_r($user);//->groupId;
            return $user->role; //superadmin, admin, user
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $ex) {
            return false;
        }

        return false;
    }

    public function getUserPermission($curuser = '') {
        try {
            if ($curuser) {
                $user = $curuser;
            } else {
                $user = JWTAuth::parseToken()->toUser();
            }
//            echo '<pre>';
//            var_dump($user);
            if ($user->typeId) {
                $queryPermission = "SELECT page, GROUP_CONCAT(action) AS permission FROM user_privileges WHERE user_type_id={$user->typeId} GROUP BY page";
                return DB::select($queryPermission);
                //[{"page":"customer","permisstion":"view,add,edit"},{"page":"dashboard","permisstion":"view"},{"page":"product","permisstion":"view,edit,delete"}]
                //"page": "product"
                //"permistion": "view,edit,delete"
            }
            return fasle;
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $ex) {
            return false;
        }
        return false;
    }

    //----------------------------------------------------------------
    public function updateUser($userId, Request $request) {
        $getData = [
            'firstName' => $request->firstName,
            'lastName' => $request->lastName,
            'userCode' => $request->userCode,
            'mobile' => $request->mobile,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            'note' => $request->note,
            'updated_at' => new DateTime(),
            'updated_by' => (new UsersController)->getUserId()
        ];
        if ($request->changepassword) {
            $getData['password'] = Hash::make($request->password);
        }
        $status = DB::table('users')->where('id', $userId)->update($getData);
        if ($status) {
            return ['status' => true];
        }
        return ['status' => false];
    }

    //----------------------------------------------------------------
}
