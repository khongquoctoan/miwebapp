'use strict';

define(['app' , 'services/customersService'], function (app) {

    var injectParams = ['config', 'customersService'];
    
    var dataService = function (config, customersService) {
        return customersService;
    };
    
    dataService.$inject = injectParams;

    app.factory('dataService',
        ['config', 'customersService', dataService]);

});

