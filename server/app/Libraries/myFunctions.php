<?php
/**
 * Description of myFunctions
 *
 * @author QUOCTOAN
 */
namespace App\Libraries;

class myFunctions {
    function hashPasswordCustomer($password){
        return md5(md5($password."@KQT2017"));
    }
    
    function hashPasswordUser($password){
        return md5(md5($password."@KQT2017ADMIN"));
    }
    
    function test(){
        return 'OK';
    }
}
