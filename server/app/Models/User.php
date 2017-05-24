<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'users';
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'firstName', 'lastName', 'mobile', 'email', 'password',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];
    
    public function userType()
    {
        return $this->hasOne('App\Models\UserType', 'id', 'typeId')->select('id', 'name');
    }
    
    public function userGroup()
    {
        return $this->hasOne('App\Models\Group', 'id', 'groupId')->select('id', 'groupName');
    }
}
