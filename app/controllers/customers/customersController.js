'use strict';

define(['app'], function (app) {

    var injectParams = ['$location', '$filter', '$window',
                        '$timeout', 'authService', 'customersService', '$state'];//, 'modalService'];

    var CustomersController = function ($location, $filter, $window,
        $timeout, authService, customersService, $state){//, modalService) {

        var vm = this;

        vm.customers = [];
        vm.filteredCustomers = [];
        vm.filteredCount = 0;
        vm.orderby = 'lastName';
        vm.reverse = false;
        vm.searchText = null;

        //paging
        vm.totalRecords = 0;
        vm.pageSize = 20;
        vm.currentPage = 1;
        vm.pager = {};
        
        vm.reloadPage = function(){
            console.log('Call reload');
            $state.go($state.current, {}, {reload: true});
        };
        vm.pageChanged = function (page) {
            vm.pageSize = page;
            getCustomersSummary(1, true);
        };
        
        vm.checkAllCus = function($event){
            var checkbox = $event.target;
            if(checkbox.checked){
                vm.checkCus = vm.customers.map(function(item) { return item.id; });
            }else{
                vm.checkCus = [];
            }
            
        };
        vm.duplicateCustomer = function(){
            if(!vm.checkCus.length){
                return showMessageBottomRight('Chưa chọn khách hàng cần xóa!', 'error');
            }
//            console.log(vm.checkCus);
            var id = vm.checkCus[0];
            var cust = getCustomerById(id);
            var custName = cust.lastName + ' ' + cust.firstName;
            showMessageComfirm('Bạn muốn sao chép khách khách hàng "'+custName+'" ???', 
                function(){
                    customersService.duplicateCustomer(id).then(function (newId) {
                        showMessageBottomRight('Đã sao chép thành công!', 'success');    
                        $state.go('customerDetail',{customerId:newId});
//                        vm.reloadPage();
                        
                    }, function (error) {
//                        $window.alert('Error deleting customer: ' + error.message);
                        showMessageBottomRight('Không thể thực thi!', 'error');    
                    });
                },
                function(){
                }
            );
        };
        
        vm.deleteMultiCustomer = function(){
            if(!vm.checkCus.length){
                return showMessageBottomRight('Chưa chọn khách hàng cần xóa!', 'error');
            }
//            console.log(vm.checkCus);
            showMessageComfirm('Bạn có chắc muốn xóa '+(vm.checkCus.length)+' khách hàng đã chọn khỏi hệ thống???', 
                function(){
                    customersService.deleteMultiCustomer(vm.checkCus).then(function () {
                        showMessageBottomRight('Khách hàng được chọn đã xóa khỏi hệ thống!', 'success');    
                        vm.reloadPage();
                    }, function (error) {
                        showMessageBottomRight('Không thể thực thi!', 'error');    
                    });
                },
                function(){
//                    showMessageBottomRight('Bạn đã nhấn Cancel!', 'error');
                }
            );
        };
        
        vm.deleteCustomer = function (id) {
            var cust = getCustomerById(id);
            var custName = cust.firstName + ' ' + cust.lastName;
            showMessageComfirm('Bạn có chắc muốn xóa khách hàng "'+custName+'" ???', 
                function(){
                    customersService.deleteCustomer(id).then(function () {
                        showMessageBottomRight('Bạn đã xóa khách hàng khỏi hệ thống!', 'success');    
                        vm.reloadPage();
                    }, function (error) {
//                        $window.alert('Error deleting customer: ' + error.message);
                        showMessageBottomRight('Không thể thực thi!', 'error');    
                    });
                },
                function(){
                    showMessageBottomRight('Bạn đã nhấn Cancel!', 'error');
                }
            );
        };
        
        vm.navigate = function (url) {
            $location.path(url);
        };

        vm.setOrder = function (orderby) {
            if (orderby === vm.orderby) {
                vm.reverse = !vm.reverse;
            }
            vm.orderby = orderby;
        };

        vm.searchTextChanged = function () {
            filterCustomers(vm.searchText);
        };

        function init() {
            getCustomersSummary(1, true);
        }

        function getCustomersSummary(page, firstCall) {
            firstCall = firstCall || false;
            customersService.getCustomersSummary(page-1, vm.pageSize)
            .then(function (data) {
                vm.totalRecords = data.totalRecords;
                vm.customers = data.results;
                if(firstCall) {
                    vm.setPage = setPage;
                    setPage(page, firstCall);
                }
            }, function (error) {
//                $window.alert('Sorry, an error occurred: ' + error.data.message);
                    showMessageBottomRight('Sorry, an error occurred :((', 'error');
            });
        }

        function filterCustomers(filterText) {
//            console.log('calll ---- filterCustomers ');
            vm.filteredCustomers = $filter("nameCityStateFilter")(vm.customers, filterText);
            vm.filteredCount = vm.filteredCustomers.length;
        }

        function getCustomerById(id) {
            for (var i = 0; i < vm.customers.length; i++) {
                var cust = vm.customers[i];
                if (cust.id === id) {
                    return cust;
                }
            }
            return null;
        }
        
        //-----
        function setPage(page, firstCall) {
            firstCall = firstCall || false;
            if (page < 1 || page > vm.pager.totalPages) {
                return;
            }
            // get pager object from service
            vm.pager = GetPager(vm.totalRecords, page);
            if(!firstCall){
                getCustomersSummary(page);
            }
        }

        // service implementation
        function GetPager(totalItems, currentPage, pageSize) {
            // default to first page
            currentPage = currentPage || 1;
            // default page size is 10
            pageSize = pageSize || vm.pageSize;
            // calculate total pages
            var totalPages = Math.ceil(totalItems / pageSize);
            // calculate start and end item indexes
            var startIndex = (currentPage - 1) * pageSize;
            var endIndex = Math.min(startIndex + pageSize, totalItems);

            // return object with all pager properties required by the view
            return {
                totalItems: totalItems,
                currentPage: currentPage,
                pageSize: pageSize,
                totalPages: totalPages,
                startIndex: startIndex,
                endIndex: endIndex,
            };
        }

        init();
    };

    CustomersController.$inject = injectParams;

    app.register.controller('CustomersController', CustomersController);

});