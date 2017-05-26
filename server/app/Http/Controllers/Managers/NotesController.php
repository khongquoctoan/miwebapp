<?php

namespace App\Http\Controllers\Managers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Managers\UsersController;
use DateTime;
use Excel;

class NotesController extends Controller {

    //Lấy danh sách
    public function getDataTables($withoutLimit = false) {
        $getData = DB::table('mi_case')
                ->leftJoin('users', 'users.id', '=', 'mi_case.created_by')
                ->select(DB::raw("concat_ws(' ', users.lastName, users.firstName) as agent_name"), DB::raw("(SELECT group_concat(tag_name SEPARATOR ', #') FROM tags WHERE find_in_set(tags.id, mi_case.tags)) as note_tags"), 'mi_case.*')
                ->where([['mi_case.status', '<>', 'trash']])
                ->orderBy("mi_case.id", "DESC");
        if (!$withoutLimit) {
            $getData->offset($_GET['$skip'])->limit($_GET['$top']);
        }
        return array('totalRecords' => $getData->count(), 'data' => $getData->get());
    }

    public function getTags() {
        $getData = DB::table('tags');
        if ($getData->count())
            return ['status' => true, 'list' => $getData->get()];
        return ['status' => false, 'list' => null];
    }

    public function getTagsByListID($listID = []) {
        $getData = DB::table('tags')->select('id', 'tag_name')->whereIn('id', $listID)->get();
        return $getData;
    }

    public function getNotes($customerId, $noteId = 0) {
        $getData = DB::table('mi_case')
                ->leftJoin('users', 'users.id', '=', 'mi_case.created_by')
                ->select('mi_case.content', 'mi_case.created_at', 'mi_case.status', DB::raw("concat_ws(' ', users.lastName, users.firstName) as userName"), 'users.avatar', 'users.isOnline', DB::raw("(SELECT group_concat(tag_name SEPARATOR ', #') FROM tags WHERE find_in_set(tags.id, mi_case.tags)) as note_tags")
                )
                ->where([['type_case', '=', 'customer'], ['type_id', '=', $customerId]])
                ->where([['mi_case.status', '<>', 'trash']])
                ->orderBy('mi_case.id', 'desc');
        if ($noteId > 0)
            $getData->where([['mi_case.id', '=', $noteId]]);
        if ($getData->count())
            return ['status' => true, 'list' => $getData->get()];
        return ['status' => false, 'list' => null];
    }

    public function getNotesLatest() {
        $getData = DB::table('mi_case')
                        ->leftJoin('users', 'users.id', '=', 'mi_case.created_by')
                        ->select('mi_case.content', 'mi_case.created_at', 'mi_case.status', DB::raw("concat_ws(' ', users.lastName, users.firstName) as userName"), 'users.avatar', 'users.isOnline')
                        ->where([['mi_case.status', '<>', 'trash']])
                        ->orderBy('mi_case.id', 'desc')->limit(5);
        if ($getData->count())
            return ['status' => true, 'list' => $getData->get()];
        return ['status' => false, 'list' => null];
    }

    public function insertNote($customerId, Request $request) {
        $tags = [];
        foreach ($request->tags as $tag) {
            $tags[] = $tag['id'];
        }
        $getData = [
            'type_case' => 'customer',
            'type_id' => $customerId,
            'channel' => 'note',
            'content' => $request->content,
            'tags' => implode(',', $tags),
            'case_status' => 'closed',
            'ip_address' => $request->ip(),
            'created_by' => (new UsersController)->getUserId(),
            'groupId' => (new UsersController)->getUserGroupId(),
            'created_at' => new DateTime()
        ];
        $noteId = DB::table('mi_case')->insertGetId($getData);
        if ($noteId) {
            return $this->getNotes($customerId, $noteId);
        }
        return ['status' => false, 'id' => null];
    }

    //Delete data
    public function deleteNote($rowId) {
        $status = DB::table('mi_case')->where('id', $rowId)->update(['status' => 'trash', 'trashed_at' => new DateTime()]);
        return $status;
    }

    public function deleteMultiNote(Request $request) {
        $status = DB::table('mi_case')->whereIn('id', $request->list)->update(['status' => 'trash', 'trashed_at' => new DateTime()]);
        return $status;
    }

    public function downloadFile() {
        $export = array();
        $data = $this->getDataTables(true);
//        print_r($data);exit;
        foreach ($data['data'] as $row) {
            $export[] = [
                'ID' => $row->case_number,
                'Thời điểm' => $row->created_at,
                'Nội dung' => $row->content,
                'Tags' => $row->note_tags,
                'Nhân viên xử lý' => $row->agent_name,
                'Trạng thái' => $row->case_status,
            ];
        }

        Excel::create('Lịch sử tiếp nhận', function($excel) use ($export) {
            $excel->sheet('Sheet 1', function($sheet) use ($export) {
                $sheet->fromArray($export);
            });
        })->export('xlsx');
    }

}
