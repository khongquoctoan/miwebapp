'use strict';

define(['app'], function (app) {

    var injectParams = ['$stateParams', 'authService', '$state', '$localStorage'];

    var CustomersController = function ($stateParams, authService, $state, $localStorage){

        var vm = this;
        vm.userinfo = $localStorage.user.infos;
        
        vm.updateOrAdd = function(event){
            event.preventDefault();
            console.log(vm.userinfo);
            if(!vm.userinfo.id){
                showMessageBottomRight('Thông tin tài khoản không tồn tại!','error');
                return ;
            }
            authService.updateUser(vm.userinfo).then(function (res) {
                if(res.status){
                    showMessageBottomRight('Đã cập nhật tài khoản thành công!','success');
                }else{
                    showMessageBottomRight('Cập nhật không thành công!','error');
                }
            });
            
        };
        
        function init() {
        }

        init();
    };

    CustomersController.$inject = injectParams;

    app.register.controller('UserInfoController', CustomersController);

});