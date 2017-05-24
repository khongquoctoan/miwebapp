'use strict';

define(['app'], function (app) {

    var injectParams = ['$stateParams', '$state', 'authService'];

    var UserAddController = function ($stateParams, $state, authService){

        var vm = this;
        var userId = ($stateParams.userId) ? parseInt($stateParams.userId) : 0;
        vm.user = {};
        vm.groups = {};
        vm.userType = {};
        
        vm.reloadPage = function(){
            $state.go($state.current, {}, {reload: true});
        };
        
        vm.updateOrAdd = function(event){
            event.preventDefault();
//            console.log(vm.user);
            if(vm.user.id){
                authService.updateUser(vm.user).then(function (res) {
                    if(res.status){
                        showMessageBottomRight('Đã cập nhật người dùng thành công!','success');
                    }else{
                        res.message = res.message || 'Cập nhật không thành công!';
                        showMessageBottomRight(res.message,'error');
                    }
                });
            }else{
                authService.insertUser(vm.user).then(function (res) {
                    console.log(res);
                    if(res.status){
                        vm.user.id = res.id;
                        showMessageBottomRight('Đã thêm người dùng thành công!','success');
                    }else{
                        res.message = res.message || 'Không thể thêm mới thành công!';
                        showMessageBottomRight(res.message,'error');
                    }
                });
            }
        };
        
        function init() {
            if (userId > 0) {
                authService.getUser(userId).then(function (res) {
                    vm.user = res.info;
                    vm.groups = res.groups;
                    vm.userType = res.userType;
                });
            }else{
                authService.getUserTypeGroup().then(function (res) {
                    vm.groups = res.groups;
                    vm.userType = res.userType;
                });

            }
        }

        init();
    };

    UserAddController.$inject = injectParams;

    app.register.controller('UserAddController', UserAddController);

});