'use strict';

define(['app'], function (app) {

    var injectParams = ['$stateParams', '$state', 'authService', 'customersService', 'notesService'];

    var CustomerAddController = function ($stateParams, $state, authService, customersService, notesService){

        var vm = this;
        var customerId = ($stateParams.customerId) ? parseInt($stateParams.customerId) : 0;
        vm.customer = {};
        vm.notes = {};
        vm.tags = {};
        console.log(customerId);
        
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
        vm.settingSelect = {
            multiple: true,
            initSelection : function (element, callback) {
                console.log($(element).data('$ngModelController').$modelValue);
                callback($(element).data('$ngModelController').$modelValue);
            }
        };
        
        function init() {
            vm.list_of_string = ['tag1', 'tag2'];
            vm.select2Options = {
                'multiple': true,
                'simple_tags': true,
                'tags': ['tag1', 'tag2', 'tag3', 'tag4']  // Can be empty list.
            };
//            vm.tags_list_A =[{id:26,tag_name:'CBU1'},{id:27,tag_name:'CBU2'}];
            if (customerId > 0) {
                customersService.getCustomer(customerId).then(function (res) {
//                  customer.tags_list = (customer.tags_list).split(',');
                    console.log(res);
                    vm.customer = res.info;
                    vm.tags = res.tags;
                    vm.notes = res.notes;
                });
            }
        }

        init();
    };

    CustomerAddController.$inject = injectParams;

    app.register.controller('CustomerAddController', CustomerAddController);

});