'use strict';

define(['app'], function (app) {

    var injectParams = ['$location', '$filter', '$window',
                        '$timeout', 'authService', '$state'];//, 'modalService'];

    var UsersController = function ($location, $filter, $window,
        $timeout, authService, $state){//, modalService) {

        var vm = this;

        vm.users = [];
        vm.filteredUsers = [];
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
            getUsersSummary(1, true);
        };
        
        vm.checkAllCus = function($event){
            var checkbox = $event.target;
            if(checkbox.checked){
                vm.checkCus = vm.users.map(function(item) { return item.id; });
            }else{
                vm.checkCus = [];
            }
        };
        vm.duplicateUser = function(){
            if(!vm.checkCus.length){
                return showMessageBottomRight('Chưa chọn người dùng cần xóa!', 'error');
            }
//            console.log(vm.checkCus);
            var id = vm.checkCus[0];
            var cust = getUserById(id);
            var custName = cust.lastName + ' ' + cust.firstName;
            showMessageComfirm('Bạn muốn sao chép khách người dùng "'+custName+'" ???', 
                function(){
                    authService.duplicateUser(id).then(function (newId) {
                        showMessageBottomRight('Đã sao chép thành công!', 'success');    
                        $state.go('userDetail',{userId:newId});
//                        vm.reloadPage();
                        
                    }, function (error) {
                        showMessageBottomRight('Không thể thực thi!', 'error');    
                    });
                },
                function(){
                }
            );
        };
        
        vm.deleteMultiUser = function(){
            if(!vm.checkCus.length){
                return showMessageBottomRight('Chưa chọn người dùng cần xóa!', 'error');
            }
//            console.log(vm.checkCus);
            showMessageComfirm('Bạn có chắc muốn xóa '+(vm.checkCus.length)+' người dùng đã chọn khỏi hệ thống???', 
                function(){
                    authService.deleteMultiUser(vm.checkCus).then(function () {
                        showMessageBottomRight('Người dùng được chọn đã xóa khỏi hệ thống!', 'success');    
                        vm.reloadPage();
                    }, function (error) {
                        showMessageBottomRight('Không thể thực thi!', 'error');    
                    });
                },
                function(){
                }
            );
        };
        
        vm.deleteUser = function (id) {
            var cust = getUserById(id);
            var custName = cust.firstName + ' ' + cust.lastName;
            showMessageComfirm('Bạn có chắc muốn xóa người dùng "'+custName+'" ???', 
                function(){
                    authService.deleteUser(id).then(function () {
                        showMessageBottomRight('Bạn đã xóa người dùng khỏi hệ thống!', 'success');    
                        vm.reloadPage();
                    }, function (error) {
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
            filterUsers(vm.searchText);
        };

        function init() {
            getUsersSummary(1, true);
        }

        function getUsersSummary(page, firstCall) {
            firstCall = firstCall || false;
            authService.getUsersSummary(page-1, vm.pageSize)
            .then(function (data) {
                vm.totalRecords = data.totalRecords;
                vm.users = data.results;
                if(firstCall) {
                    vm.setPage = setPage;
                    setPage(page, firstCall);
                }
            }, function (error) {
                showMessageBottomRight('Sorry, an error occurred :((', 'error');
            });
        }

        function filterUsers(filterText) {
//            console.log('calll ---- filterUsers ');
            vm.filteredUsers = $filter("nameCityStateFilter")(vm.users, filterText);
            vm.filteredCount = vm.filteredUsers.length;
        }

        function getUserById(id) {
            for (var i = 0; i < vm.users.length; i++) {
                var cust = vm.users[i];
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
                getUsersSummary(page);
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

    UsersController.$inject = injectParams;

    app.register.controller('UsersController', UsersController);

});