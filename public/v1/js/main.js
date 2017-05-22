require.config({
    baseUrl: 'app',
    urlArgs: 'v=1.0'
});

require(
    [
        //'customersApp/animations/listAnimations',
        'app',
        /*'customersApp/directives/wcUnique',*/
        'services/routeResolver',
        'services/config',
        //'customersApp/services/customersBreezeService',
        'services/authService',
        'services/customersService',
        'services/notesService',
//        'services/dataService',
        /*'customersApp/services/modalService',*/
        'services/httpInterceptors',
        'filters/nameCityStateFilter',
        /*'customersApp/filters/nameProductFilter',*/
        'controllers/navbarController',
                /*'customersApp/controllers/orders/orderChildController',*/
    ],
    function () {
        angular.bootstrap(document, ['MIApp']);
    });
