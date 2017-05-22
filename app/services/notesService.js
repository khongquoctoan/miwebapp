'use strict';

define(['app'], function (app) {

    var injectParams = ['$http', '$q', 'urls'];

    var customersFactory = function ($http, $q, urls) {
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
        /*
        factory.getCustomers = function (pageIndex, pageSize) {
            return getPagedResource('customers', pageIndex, pageSize);
        };

        factory.insertCustomer = function (customer) {
            return $http.post(
                serviceBase + 'postCustomer', 
                $.param(customer),
                {headers : {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'}}
            )
            .then(function (results) {
                return results.data;
            });
        };

        factory.updateCustomer = function (customer) {
            return $http.post(serviceBase + 'putCustomer/' + customer.id, customer)
            .then(function (status) {return status.data;},function(error){});
        };

        factory.deleteCustomer = function (id) {
            return $http.get(serviceBase + 'deleteCustomer/' + id).then(function (status) {
                return status.data;
            });
        };

        factory.getCustomer = function (id) {
            //then does not unwrap data so must go through .data property
            //success unwraps data automatically (no need to call .data property)
            return $http.get(serviceBase + 'customer/' + id).then(function (results) {
//                extendCustomers([results.data]);
//                console.log(results.data[0]);
                return results.data[0];
            });
        };*/

        return factory;
    };

    customersFactory.$inject = injectParams;

    app.factory('notesService', customersFactory);

});