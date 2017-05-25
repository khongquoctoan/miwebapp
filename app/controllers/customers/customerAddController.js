'use strict';

define(['app'], function (app) {

    var injectParams = ['$stateParams', '$state', 'authService', 'customersService', 'notesService'];

    var CustomerAddController = function ($stateParams, $state, authService, customersService, notesService){

        var vm = this;
        var customerId = ($stateParams.customerId) ? parseInt($stateParams.customerId) : 0;
        vm.customer = {};
        vm.notes = {};
        vm.tags = {};
//        console.log(customerId);
        
        vm.reloadPage = function(){
            $state.go($state.current, {}, {reload: true});
        };
        
        vm.updateOrAdd = function(event){
            event.preventDefault();
            console.log(vm.customer);
            if(vm.customer.id){
                customersService.updateCustomer(vm.customer).then(function (res) {
//                    console.log(res);
                    if(res.status){
//                        vm.reloadPage();
                        showMessageBottomRight('Đã cập nhật khách hàng thành công!','success');
                    }else{
                        showMessageBottomRight('Cập nhật không thành công!','error');
                    }
                });
            }else{
                customersService.insertCustomer(vm.customer).then(function (res) {
                    console.log(res);
                    if(res.status){
                        vm.customer.id = res.id;
                        showMessageBottomRight('Đã thêm khách hàng thành công!','success');
                    }else{
                        showMessageBottomRight('Không thể thêm mới thành công!','error');
                    }
                });
            }
        };
        
        vm.addNote = function(event){
            event.preventDefault();
            if(!vm.customer.id){
                showMessageBottomRight('Thao tác lỗi!','error');
                return;
            }
            notesService.insertNote(vm.customer.id, vm.note).then(function (res) {
                if(res.status){
                    vm.note = {};
                    if(vm.notes){
                        vm.notes.splice(0, 0, res.list[0]);
                    }else{
                        vm.notes = [res.list[0]];
                    }
                    showMessageBottomRight('Đã thêm mới ghi chú!','success');
                }else{
                    showMessageBottomRight('Ghi chú chưa được lưu!','error');
                }
            });
        };
        
        vm.loadTags = function ($query) {
            var tags = vm.tags;
            return tags.filter(function (country) {
                return country.tag_name.toLowerCase().indexOf($query.toLowerCase()) != -1;
            });
        };
        
        vm.cusUpdateTags = function (){
            if(vm.customer.id){
                console.log(vm.customer.tags_list);
                customersService.updateCusTags(vm.customer).then(function (res) {
                    console.log(res);
                });
            }
            
        };
        
        function init() {
            
            if (customerId > 0) {
                customersService.getCustomer(customerId).then(function (res) {
                    vm.customer = res.info;
                    vm.tags = res.tags;
                    vm.notes = res.notes;
//                    console.log(res);
//                    console.log(vm.customer);
                });
            }else{
                notesService.getTags().then(function (res) {
                    vm.tags = res;
                });
            }
            
        }

        init();
    };

    CustomerAddController.$inject = injectParams;

    app.register.controller('CustomerAddController', CustomerAddController);

});