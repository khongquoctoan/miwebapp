'use strict';

define(['app'], function (app) {

    var injectParams = ['$location', 'authService'];

    var LoginController = function ($location, authService) {
        var vm = this,
            path = '/';

        vm.email = 'khongquoctoan.it@gmail.com';
        vm.password = 'quoctoan123';
        vm.errorMessage = null;
        vm.isDisabledSubmit = false;
        
        vm.login = function (event) {
            vm.isDisabledSubmit = true;
            $('form[name="loginForm"] .fa-refresh').show();
            //console.log(vm);
//            event.stopPropagation();
            event.preventDefault();
            authService.login(vm.email, vm.password).then(function (status) {
                //$routeParams.redirect will have the route
                //they were trying to go to initially
//                console.log('status login-----');
//                console.log(status);
                vm.isDisabledSubmit = false;
                $('form[name="loginForm"] .fa-refresh').hide();
                if (!status) {
                    vm.errorMessage = 'Thông tin không đúng, vui lòng kiểm tra lại!';
                    return;
                }
                
                $location.path(path);
            });
        };
    };

    LoginController.$inject = injectParams;

    app.register.controller('LoginController', LoginController);

});