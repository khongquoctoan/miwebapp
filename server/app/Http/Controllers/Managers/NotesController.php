<?php

namespace App\Http\Controllers\Managers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Managers\UsersController;
use DateTime;

class NotesController extends Controller
{
    public function getTags() {
        $getData = DB::table('tags');
        if($getData->count())
            return ['status' => true, 'list' => $getData->get()];
        return ['status' => false, 'list' => null];
    }
    
    public function getNotes($customerId, $noteId = 0){
        $getData = DB::table('mi_case')
                ->leftJoin('users', 'users.id', '=', 'mi_case.created_by')
                ->select('mi_case.content','mi_case.created_at','mi_case.status', 
                        DB::raw("concat_ws(' ', users.lastName, users.firstName) as userName"), 'users.avatar', 'users.isOnline')
                ->where([['type_case', '=', 'customer'],['type_id', '=', $customerId]])
                ->orderBy('mi_case.id', 'desc');
        if($noteId > 0) $getData->where([['mi_case.id', '=', $noteId]]);
        if($getData->count())
            return ['status' => true, 'list' => $getData->get()];
        return ['status' => false, 'list' => null];
    }
    
    public function getNotesLatest(){
        $getData = DB::table('mi_case')
                ->leftJoin('users', 'users.id', '=', 'mi_case.created_by')
                ->select('mi_case.content','mi_case.created_at','mi_case.status', 
                        DB::raw("concat_ws(' ', users.lastName, users.firstName) as userName"), 'users.avatar', 'users.isOnline')
                ->orderBy('mi_case.id', 'desc')->limit(5);
        if($getData->count())
            return ['status' => true, 'list' => $getData->get()];
        return ['status' => false, 'list' => null];
    }
    
    public function insertNote($customerId, Request $request){
        $getData = [
            'type_case'     => 'customer',
            'type_id'       => $customerId,
            'channel'       => 'note',
            'content'       => $request->content,
//            'tags'          => $request->tags,
            'status'        => 'closed',
            'ip_address'    => $request->ip(),
            'created_by'    => (new UsersController)->getUserId(),
            'groupId'       => (new UsersController)->getUserGroupId(),
            'created_at'    => new DateTime()
        ];
        $noteId = DB::table('mi_case')->insertGetId($getData);
        if($noteId){
            return $this->getNotes($customerId, $noteId);
        }
        return ['status' => false, 'id' => null];
    }
}
