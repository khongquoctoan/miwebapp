<?php

namespace App\Http\Controllers\Managers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
//use Yajra\Datatables\Facades\Datatables;
use App\Http\Controllers\Managers\UsersController;
use App\Http\Controllers\Managers\NotesController;
use DateTime;
use App\Models\Customer;

//use App\Repositories\CustomerRepository as Customers;

class CustomersController extends Controller {

//    private $customers;
//
//    public function __construct(Customers $customer) {
//        $this->customers = $customer;
//    }
//
//    public function test() {
//        echo '<pre>';
//        return $this->customers->paginate(10, ['id', 'firstName']);//response()->json($this->customers->paginate(10, ['id', 'firstName']));
////        return response()->json($this->customers->all());
//    }
    //Lấy danh sách khách hàng
    public function getDataTables() {
        $getData = DB::table('customers')->select(DB::raw("customers.*"))->where('status', 'publish')->orderBy("customers.id", "DESC");
        return array('totalRecords' => $getData->count(), 'data' => $getData->offset($_GET['$skip'])->limit($_GET['$top'])->get());
    }

    public function getCustomerLatest($limitDay = 15) {
        $getData = DB::table('customers')
                ->leftJoin('users', 'users.id', '=', 'customers.created_by')
                ->select(DB::raw("concat_ws(' ', users.lastName, users.firstName) as userName, users.avatar as userAvatar"), 'users.isOnline', DB::raw("concat_ws(' ', customers.lastName, customers.firstName) as customerName"), 'customers.*')
                ->where('customers.status', 'publish')
                ->whereRaw("customers.created_at >= DATE_ADD(CURDATE(), INTERVAL -{$limitDay} DAY)")
                ->orderBy('customers.created_at', 'desc')
                ->limit(5); //->toSql();
//        echo $getData;exit;
        if ($getData->count()) {
            return ['status' => true, 'list' => $getData->get()];
        }
        return ['status' => false, 'list' => null];
    }

    //Thông tin chi tiết khách hàng: tags, ghi chú
    public function getInfoByID($rowId) {
        $getData = DB::table('customers')->where([['status', '=', 'publish'], ['id', '=', $rowId]]);
        if ($getData->count()) {
            $getData = $getData->get();
            $getData = $getData[0];

            //Get current tags customer
            $getData->tags_list = (new NotesController())->getTagsByListID(explode(',', $getData->tags_list));

            $getNotes = (new NotesController())->getNotes($rowId, 0);
            $getTags = (new NotesController())->getTags();

            return ['status' => true, 'info' => $getData, 'notes' => $getNotes['list'], 'tags' => $getTags['list']];
        }
        return ['status' => false];
    }

    //Thêm mới khách hàng
    public function insertCustomer(Request $request) {
        $tags = [];
        foreach ($request->tags_list as $tag) {
            $tags[] = $tag['id'];
        }
        $getData = [
            'firstName' => $request->firstName,
            'lastName' => $request->lastName,
            'customerCode' => $request->customerCode,
            'lastName' => $request->lastName,
            'mobile' => $request->mobile,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            'note' => $request->note,
            'tags_list' => implode(',', $tags),
            'created_at' => new DateTime()
        ];
        $status = DB::table('customers')->insertGetId($getData);
        if ($status) {
            return ['status' => true, 'id' => $status];
        }
        return ['status' => false, 'id' => null];
    }

    //Cập nhật khách hàng
    public function updateCustomer($customerId, Request $request) {
        $tags = [];
        foreach ($request->tags_list as $tag) {
            $tags[] = $tag['id'];
        }
        $getData = [
            'firstName' => $request->firstName,
            'lastName' => $request->lastName,
            'customerCode' => $request->customerCode,
            'lastName' => $request->lastName,
            'mobile' => $request->mobile,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            'note' => $request->note,
            'tags_list' => implode(',', $tags),
            'updated_at' => new DateTime(),
            'updated_by' => (new UsersController)->getUserId()
        ];
        $status = DB::table('customers')->where('id', $customerId)->update($getData);
        if ($status) {
            return ['status' => true];
        }
        return ['status' => false];
    }

    //Xóa khách hàng
    public function deleteCustomer($customerId) {
        $status = DB::table('customers')->where('id', $customerId)->update(['status' => 'trash', 'trashed_at' => new DateTime()]);
        return $status;
    }

    public function deleteMultiCustomer(Request $request) {
        $status = DB::table('customers')->whereIn('id', $request->list)->update(['status' => 'trash', 'trashed_at' => new DateTime()]);
        return $status;
    }

    public function duplicateCustomer($customerId) {
        $customer = Customer::find($customerId);
        $newCustomer                = $customer->replicate();
        $newCustomer->customerCode  = "KH" . time();
        $newCustomer->firstName     = $newCustomer->firstName . ' Copy';
        $newCustomer->mobile        = '';
        $newCustomer->phone         = '';
        $newCustomer->email         = '';
        $newCustomer->save();
        if ($newCustomer->id) {
            return $newCustomer->id;
        }
        return false;
    }

}
