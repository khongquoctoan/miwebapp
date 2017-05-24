<?php

namespace App\Http\Controllers\Managers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use DateTime;
use JWTAuth;

class UsersController extends Controller {

    //Lấy danh sách 
    public function getDataTables() {
        $getData = DB::table('users')
                ->leftJoin('user_types', 'user_types.id', '=', 'users.typeId')
                ->select(DB::raw("users.*, user_types.name as userTypeName"))
                ->where([['status', '<>', 'trash']])
                ->orderBy("users.id", "DESC");
        return array('totalRecords' => $getData->count(), 'data' => $getData->offset($_GET['$skip'])->limit($_GET['$top'])->get());
    }

    public function postLogin(Request $request) {
        $credentials = $request->only('email', 'password');
        $credentials['status'] = 'active';
        $customClaims = $request->remember_token ? ['exp' => date('Y-m-d', strtotime('+2 week'))] : [];

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
    public function getInfoByID($rowId) {
        $getData = User::where([['status', '<>', 'trash'], ['users.id', '=', $rowId]])
                ->with(['userType', 'userGroup']);
        if ($getData->count()) {
            $getData = $getData->get();
            $getUserType = DB::table('user_types')->select('id', 'name')->get();
            $getGroup = DB::table('groups')->select('id', 'groupName')->get();
            return ['status' => true, 'info' => $getData[0], 'userType' => $getUserType, 'groups' => $getGroup];
        }
        return ['status' => false];
    }
    
    public function getInfoUserTypeGroup() {
        $getUserType = DB::table('user_types')->select('id', 'name')->get();
        $getGroup = DB::table('groups')->select('id', 'groupName')->get();
        return ['userType' => $getUserType, 'groups' => $getGroup];
    }

    public function updateUserProfile($userId, Request $request) {
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

    function checkUserExist($userCode, $email, $extension, $currentUserId = false) {
        if (empty($userCode) && empty($email) && empty($extension)) {
            return 'Các thông tin bắt buộc: Mã người dùng, email, Máy nhánh';
        }
        if (!empty($userCode)) {
            $checkUser = User::where('userCode', $userCode);
            if ($currentUserId) {
                $checkUser->where('id', '<>', $currentUserId);
            }
            if ($checkUser->count()) {
                return 'UserCode đã được đăng ký';
            }
        }

        if (!empty($email)) {
            $checkUser = User::where('email', $email);
            if ($currentUserId) {
                $checkUser->where('id', '<>', $currentUserId);
            }
            if ($checkUser->count()) {
                return 'Email đã được đăng ký';
            }
        }

        if (!empty($extension)) {
            $checkUser = User::where('extension', $extension);
            if ($currentUserId) {
                $checkUser->where('id', '<>', $currentUserId);
            }
            if ($checkUser->count()) {
                return 'Extension đã được đăng ký';
            }
        }
        return false;
    }

    public function updateUser($userId, Request $request) {
        $messageError = $this->checkUserExist($request->userCode, $request->email, $request->extension, $userId);
        if ($messageError) {
            return ['status' => false, 'message' => $messageError];
        }

        $getData = [
            'firstName' => $request->firstName,
            'lastName' => $request->lastName,
            'userCode' => $request->userCode,
            'status' => $request->status,
            'mobile' => $request->mobile,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            'extension' => $request->extension,
            'queues' => $request->queues,
            'role' => $request->role,
            'note' => $request->note,
            'typeId' => $request->user_type['id'],
            'groupId' => $request->user_group['id'],
            'updated_at' => new DateTime(),
            'updated_by' => (new UsersController)->getUserId()
        ];
        if ($request->changepassword) {
            $getData['password'] = Hash::make($request->passwordnew);
        }
        $status = DB::table('users')->where('id', $userId)->update($getData);
        if ($status) {
            return ['status' => true];
        }
        return ['status' => false];
    }

    public function insertUser(Request $request) {
        $messageError = $this->checkUserExist($request->userCode, $request->email, $request->extension);
        if ($messageError) {
            return ['status' => false, 'message' => $messageError];
        }
        $getData = [
            'firstName' => $request->firstName, 
            'lastName' => $request->lastName,
            'userCode' => $request->userCode,
            'status' => $request->status,
            'mobile' => $request->mobile,
            'phone' => $request->phone,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'address' => $request->address,
            'extension' => $request->extension,
            'queues' => $request->queues,
            'role' => $request->role,
            'note' => $request->note,
            'typeId' => $request->user_type['id'],
            'groupId' => $request->user_group['id'],
            'created_at' => new DateTime(),
            'created_by' => (new UsersController)->getUserId()
        ];

        $status = DB::table('users')->insertGetId($getData);
        if ($status) {
            return ['status' => true];
        }
        return ['status' => false];
    }

    //Xóa khách hàng
    public function deleteUser($customerId) {
        $status = DB::table('users')->where('id', $customerId)->update(['status' => 'trash', 'trashed_at' => new DateTime()]);
        return $status;
    }

    public function deleteMultiUser(Request $request) {
        $status = DB::table('users')->whereIn('id', $request->list)->update(['status' => 'trash', 'trashed_at' => new DateTime()]);
        return $status;
    }

    public function duplicateUser($customerId) {
        $customer = User::find($customerId);
        $newUser = $customer->replicate();
        $newUser->userCode = "NV" . time();
        $newUser->firstName = $newUser->firstName . ' Copy';
        $newUser->mobile = '';
        $newUser->phone = '';
        $newUser->email = $newUser->userCode . '@company.com';
        $newUser->password = Hash::make($newUser->userCode);
        $newUser->status = 'pending';
        $newUser->save();
        if ($newUser->id) {
            return $newUser->id;
        }
        return false;
    }

    //----------------------------------------------------------------
}
