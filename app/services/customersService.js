'use strict';

define(['app'], function (app) {

    var injectParams = ['$http', '$q', 'urls'];

    var customersFactory = function ($http, $q, urls) {
        var serviceBase = urls.BASE_API,//'http://api.mitek-popup.dev/api/v1/',//'/api/dataservice/',
            factory = {};

        factory.getCustomers = function (pageIndex, pageSize) {
            return getPagedResource('customers', pageIndex, pageSize);
        };

        factory.getCustomersSummary = function (pageIndex, pageSize) {
            return getPagedResource('customers', pageIndex, pageSize);
        };

        factory.getStates = function () {
            return $http.get(serviceBase + 'states').then(
                function (results) {
                    return results.data;
                });
        };

        factory.checkUniqueValue = function (id, property, value) {
            if (!id) id = 0;
            return $http.get(serviceBase + 'checkUnique/' + id + '?property=' + property + '&value=' + escape(value)).then(
                function (results) {
                    return results.data.status;
                });
        };

        factory.insertCustomer = function (customer) {
            return $http.post(
                serviceBase + 'postCustomer', 
                $.param(customer),
                {headers : {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'}}
            )
            .then(function (results) {
//                console.log(results);
//                customer.id = results.data.id;
                return results.data;
            });
        };

        factory.newCustomer = function () {
            return $q.when({ id: 0 });
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
                return results.data;
            });
        };
        
        factory.getCustomerLatest = function () {
            return $http.get(serviceBase + 'customers/latest').then(function (results) {
                console.log(results);
                return results.data;
            });
        };

        function extendCustomers(customers) {
            var custsLen = customers.length;
            //Iterate through customers
            for (var i = 0; i < custsLen; i++) {
                var cust = customers[i];
                if (!cust.orders) continue;

                var ordersLen = cust.orders.length;
                for (var j = 0; j < ordersLen; j++) {
                    var order = cust.orders[j];
                    order.orderTotal = order.quantity * order.price;
                }
                cust.ordersTotal = ordersTotal(cust);
            }
        }

        function getPagedResource(baseResource, pageIndex, pageSize) {
            var resource = baseResource;
            resource += (arguments.length == 3) ? buildPagingUri(pageIndex, pageSize) : '';
            return $http.get(serviceBase + resource).then(function (response) {
//                console.log(response);
                var custs = response.data.data, totalRecords = response.data.totalRecords;
                extendCustomers(custs);
                return {
                    totalRecords: totalRecords,//parseInt(response.headers('X-InlineCount')),
                    results: custs
                };
            });
        }

        function buildPagingUri(pageIndex, pageSize) {
            var uri = '?$top=' + pageSize + '&$skip=' + (pageIndex * pageSize);
            return uri;
        }

        // is this still used???
        function orderTotal(order) {
            return order.quantity * order.price;
        };

        function ordersTotal(customer) {
            var total = 0;
            var orders = customer.orders;
            var count = orders.length;

            for (var i = 0; i < count; i++) {
                total += orders[i].orderTotal;
            }
            return total;
        };

        return factory;
    };

    customersFactory.$inject = injectParams;

    app.factory('customersService', customersFactory);

});