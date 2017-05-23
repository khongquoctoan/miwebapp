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
    
    public function getTagsByListID($listID = []) {
        $getData = DB::table('tags')->select('id', 'tag_name')->whereIn('id', $listID)->get();
        return $getData;
    }
    
    public function getNotes($customerId, $noteId = 0){
        $getData = DB::table('mi_case')
                ->leftJoin('users', 'users.id', '=', 'mi_case.created_by')
                ->select('mi_case.content','mi_case.created_at','mi_case.status', 
                        DB::raw("concat_ws(' ', users.lastName, users.firstName) as userName"), 'users.avatar', 'users.isOnline',
                        DB::raw("(SELECT group_concat(tag_name SEPARATOR ', #') FROM tags WHERE find_in_set(tags.id, mi_case.tags)) as note_tags")
                        )
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
        $tags = [];
        foreach($request->tags as $tag){
            $tags[] = $tag['id'];
        }
        $getData = [
            'type_case'     => 'customer',
            'type_id'       => $customerId,
            'channel'       => 'note',
            'content'       => $request->content,
            'tags'          => implode(',', $tags),
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
