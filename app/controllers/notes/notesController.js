'use strict';

define(['app'], function (app) {

    var injectParams = ['$location', '$filter', '$window',
                        '$timeout', 'authService', 'notesService', '$state'];//, 'modalService'];

    var NotesController = function ($location, $filter, $window,
        $timeout, authService, notesService, $state){//, modalService) {

        var vm = this;

        vm.notes = [];
        vm.filteredNotes = [];
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
            getNotesSummary(1, true);
        };
        
        vm.checkAllCus = function($event){
            var checkbox = $event.target;
            if(checkbox.checked){
                vm.checkCus = vm.notes.map(function(item) { return item.id; });
            }else{
                vm.checkCus = [];
            }
            
        };
        
        vm.deleteMultiNote = function(){
            if(!vm.checkCus.length){
                return showMessageBottomRight('Chưa chọn ghi chú cần xóa!', 'error');
            }
//            console.log(vm.checkCus);
            showMessageComfirm('Bạn có chắc muốn xóa '+(vm.checkCus.length)+' ghi chú đã chọn khỏi hệ thống???', 
                function(){
                    notesService.deleteMultiNote(vm.checkCus).then(function () {
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
        
        vm.deleteNote = function (id) {
            var cust = getNoteById(id);
            var custName = cust.case_number;
            showMessageComfirm('Bạn có chắc muốn xóa ghi chú có ID: "'+custName+'" ???', 
                function(){
                    notesService.deleteNote(id).then(function () {
                        showMessageBottomRight('Bạn đã xóa ghi chú khỏi hệ thống!', 'success');    
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
        
        function getNoteById(id) {
            for (var i = 0; i < vm.notes.length; i++) {
                var cust = vm.notes[i];
                if (cust.id === id) {
                    return cust;
                }
            }
            return null;
        }
        
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
            filterNotes(vm.searchText);
        };
        
        vm.seeMoreNote = function(note){
            note.isExpand = !note.isExpand;
        };

        function init() {
            getNotesSummary(1, true);
        }

        function getNotesSummary(page, firstCall) {
            firstCall = firstCall || false;
            notesService.getNotesSummary(page-1, vm.pageSize)
            .then(function (data) {
                vm.totalRecords = data.totalRecords;
                vm.notes = data.results;
                if(firstCall) {
                    vm.setPage = setPage;
                    setPage(page, firstCall);
                }
            }, function (error) {
//                $window.alert('Sorry, an error occurred: ' + error.data.message);
                    showMessageBottomRight('Sorry, an error occurred :((', 'error');
            });
        }

        function filterNotes(filterText) {
//            console.log('calll ---- filterNotes ');
            vm.filteredNotes = $filter("nameCityStateFilter")(vm.notes, filterText);
            vm.filteredCount = vm.filteredNotes.length;
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
                getNotesSummary(page);
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

    NotesController.$inject = injectParams;

    app.register.controller('NotesController', NotesController);

});