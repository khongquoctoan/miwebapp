'use strict';

define(['app'], function (app) {

    var injectParams = ['$http', '$q', 'urls'];

    var notesFactory = function ($http, $q, urls) {
        var serviceBase = urls.BASE_API,
            factory = {};
        
        factory.getTags = function (typeTag) {
            typeTag = typeTag || '';
            return $http.get(serviceBase + 'getTags')
                .then(function (results) {
                    if(results.data.status){
                        return results.data.list;
                    }
                    return {};
                },function(){
                    return {};
                });
        };
        
        factory.getNotes = function (customerId) {
            customerId = customerId || 0;
            return $http.get(serviceBase + 'getNotes/' + customerId)
                .then(function (results) {
                    if(results.data.status){
                        return results.data.list;
                    }
                    return {};
                },function(){
                    return {};
                });
        };
        
        factory.getNotesLatest = function () {
            return $http.get(serviceBase + 'notes/latest')
                .then(function (results) {
                    if(results.data.status){
                        return results.data.list;
                    }
                    return {};
                },function(){
                    return {};
                });
        };
        
        factory.insertNote = function (customerId, note) {
            return $http.post(serviceBase + 'postNote/'+customerId, note)
                .then(function (results) {
                    return results.data;
                },function(){
                    return {status:false};
                });
        };
        
        //----- Get user list ------------
        factory.getNotesSummary = function (pageIndex, pageSize) {
            return getPagedResource('notes', pageIndex, pageSize);
        };
        
        function getPagedResource(baseResource, pageIndex, pageSize) {
            var resource = baseResource;
            resource += (arguments.length == 3) ? buildPagingUri(pageIndex, pageSize) : '';
            return $http.get(serviceBase + resource).then(function (response) {
                var custs = response.data.data, totalRecords = response.data.totalRecords;
                return {
                    totalRecords: totalRecords,
                    results: custs
                };
            });
        }
        
        function buildPagingUri(pageIndex, pageSize) {
            var uri = '?$top=' + pageSize + '&$skip=' + (pageIndex * pageSize);
            return uri;
        }
        
        factory.deleteNote = function (id) {
            return $http.get(serviceBase + 'deleteNote/' + id).then(function (status) {
                return status.data;
            });
        };
        
        factory.deleteMultiNote = function (cusSelected) {
            return $http.post(serviceBase + 'deleteMultiNote', {list:cusSelected}).then(function (status) {
                return status.data;
            });
        };
        
        return factory;
    };

    notesFactory.$inject = injectParams;

    app.factory('notesService', notesFactory);

});