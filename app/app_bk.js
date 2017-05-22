'use strict';

define(['services/routeResolver'], function () {

    var app = angular.module('MIApp', ['ngRoute', 'ngAnimate', 'routeResolverServices',
                                              /*'wc.directives', 'wc.animations',*/ 'ui.bootstrap', 'breeze.angular']);

    app.config(['$routeProvider', 'routeResolverProvider', '$controllerProvider',
                '$compileProvider', '$filterProvider', '$provide', '$httpProvider',

        function ($routeProvider, routeResolverProvider, $controllerProvider,
                  $compileProvider, $filterProvider, $provide, $httpProvider) {

            //Change default views and controllers directory using the following:
            //routeResolverProvider.routeConfig.setBaseDirectories('/app/views', '/app/controllers');

            app.register =
            {
                controller: $controllerProvider.register,
                directive: $compileProvider.directive,
                filter: $filterProvider.register,
                factory: $provide.factory,
                service: $provide.service
            };

            //Define routes - controllers will be loaded dynamically
            var route = routeResolverProvider.route;

            $routeProvider
                //route.resolve() now accepts the convention to use (name of controller & view) as well as the 
                //path where the controller or view lives in the controllers or views folder if it's in a sub folder. 
                //For example, the controllers for customers live in controllers/customers and the views are in views/customers.
                //The controllers for orders live in controllers/orders and the views are in views/orders
                //The second parameter allows for putting related controllers/views into subfolders to better organize large projects
                //Thanks to Ton Yeung for the idea and contribution
                .when('/dashboard', route.resolve('Dashboard', 'dashboard/', 'vm', false))
                .when('/customers', route.resolve('Customers', 'customers/', 'vm', true))
                .when('/customer', route.resolve('CustomerAdd', 'customers/', 'vm', false))
                .when('/customer/:customerId', route.resolve('CustomerAdd', 'customers/', 'vm', false))
                .when('/monitor', route.resolve('Monitor', 'monitor/', 'vm'))
                .when('/reports', route.resolve('Reports', 'reports/', 'vm'))
                .when('/users', route.resolve('Users', 'users/', 'vm'))
                .when('/callhistory', route.resolve('Call history', 'callhistory/', 'vm'))
                .when('/callrecording', route.resolve('Call recoring', 'callrecording/', 'vm'))
                .when('/notes', route.resolve('Notes', 'notes/', 'vm'))
//                .when('/customerorders/:customerId', route.resolve('CustomerOrders', 'customers/', 'vm'))
//                .when('/customeredit/:customerId', route.resolve('CustomerEdit', 'customers/', 'vm', true))
//                .when('/orders', route.resolve('Orders', 'orders/', 'vm'))
//                .when('/about', route.resolve('About', '', 'vm'))
                .when('/login/:redirect*?', route.resolve('Login', '', 'vm'))
                .otherwise({ redirectTo: '/dashboard' });
    }]);

    app.run(['$rootScope', '$location', 'authService',
        function ($rootScope, $location, authService) {
            //Client-side security. Server-side framework MUST add it's 
            //own security as well since client-based security is easily hacked
            $rootScope.$on("$routeChangeStart", function (event, next, current) {
                
                if (next && next.$$route && next.$$route.secure) {
                    if (!authService.user.isAuthenticated) {
                        console.log('current--  ');
                        $rootScope.$evalAsync(function () {
                            authService.redirectToLogin();
                        });
                        console.log('call login');
                        $('body').removeClass();
                        $('body').addClass('page-login-v3 layout-full');
                    }else{
                       console.log($('body').hasClass('site-menubar-unfold'));
                        if(!$('body').hasClass('site-menubar-unfold')){
                            $('body').addClass('site-menubar-unfold site-menubar-keep');
                        } 
                    }
                }
            });
            
    }]);

    return app;
});





