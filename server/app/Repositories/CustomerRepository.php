<?php
namespace App\Repositories;

use Bosnadev\Repositories\Contracts\RepositoryInterface;
use Bosnadev\Repositories\Eloquent\Repository;

class CustomerRepository extends Repository {
    /*
    public function all($columns = array('*'))
    public function lists($value, $key = null)
    public function paginate($perPage = 1, $columns = array('*'));
    public function create(array $data)
    public function update(array $data, $id, $attribute = "id")
    public function delete($id)
    public function find($id, $columns = array('*'))
    public function findBy($field, $value, $columns = array('*'))
    public function findAllBy($field, $value, $columns = array('*'))
    public function findWhere($where, $columns = array('*'))
    */
            
    public function model() {
        return 'App\Models\Customer';
    }
}