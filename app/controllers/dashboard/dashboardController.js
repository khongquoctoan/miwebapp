'use strict';

define(['app'], function (app) {

    var injectParams = ['$location', '$filter', '$window',
                        '$timeout', 'authService', 'customersService', 'notesService'];

    var DashboardController = function ($location, $filter, $window,
        $timeout, authService, customersService, notesService){

        var vm = this;
        
        function init() {
            customersService.getCustomerLatest().then(function (res) {
                vm.customersLatest = res.list;
                console.log(vm.customersLatest);
            }, function (error) {});
            
            notesService.getNotesLatest().then(function (res) {
                vm.notesLatest = res;
            }, function (error) {});
        }

        init();
    };

    DashboardController.$inject = injectParams;

    app.register.controller('DashboardController', DashboardController);

});