'use strict';

define(['services/routeResolver'], function () {
    var app = angular.module('MIApp', 
                    [   'ui.router', 'ui.bootstrap', 
                        'routeResolverServices', 'ngStorage', 'breeze.angular',
                        'angular-loading-bar', 'angularMoment',
                        'ngTagsInput' , 'checklist-model'
                    ]
                );
    app.constant('urls', {
       BASE: 'http://jwt.dev:8000',
       BASE_API: 'http://api.mitek-popup.dev/api/v1/'
    });
    
    app.filter('split_custom', function() {
        return function(input, splitChar, splitIndex) {
            // do some bounds checking here to ensure it has that index
            return input.split(splitChar)[splitIndex];
        };
        //{{vm.customer.tags_list | split_custom:',':0}}
    });
    app.filter('split', function() {
        return function(input, delimiter) {
            if (typeof input === "undefined" || input == null || input == '') return new Array();
            delimiter = delimiter || ',';
//            console.log(input.split(delimiter));
            return input.split(delimiter);
        };
    });
    
    app.config(function ($stateProvider, $urlRouterProvider,routeResolverProvider,
            $controllerProvider, $compileProvider, $filterProvider, $provide, cfpLoadingBarProvider, $httpProvider) {
        
        cfpLoadingBarProvider.includeBar = false;
        cfpLoadingBarProvider.includeSpinner = true;
   
        app.register =
                {
                    controller: $controllerProvider.register,
                    directive: $compileProvider.directive,
                    filter: $filterProvider.register,
                    factory: $provide.factory,
                    service: $provide.service
                };

        var helloState = {
            name: 'hello',
            url: '/hello',
            template: '<h3>hello world!</h3>'
        }

        var aboutState = {
            name: 'about',
            url: '/about',
            template: '<h3>Its the UI-Router hello world app!</h3>'
        }
        $stateProvider.state(helloState);
        $stateProvider.state(aboutState);
        
        //Define routes - controllers will be loaded dynamically
        var route = routeResolverProvider.route;
        var viewsDirectory = '/app/views/', controllersDirectory = '/app/controllers/';
        
        //Login
        $stateProvider.state(
                routeResolverProvider.routeBasic.resolve('/login','Login', '', 'vm', false)
                /*{
                    name: 'login',
                    url: '/login',
                    templateUrl: viewsDirectory+"login.html",
                    controller  : controllersDirectory+"loginController",
                    controllerAs: 'vm',
                }*/
        );
        
        //Parent all modules
        $stateProvider.state('module', { 
            url         : '/module',
            views       : {
                '@' : {
                    templateUrl: viewsDirectory+'index.html',
                    controller: '',
                    controllerAs: 'vm',
                },
                'header@module'    : { templateUrl: 'app/partials/header.html'},
                'sidebar@module'   : { templateUrl: 'app/partials/sidebar.html'},
                'footer@module'    : { templateUrl: 'app/partials/footer.html'}
            },
            data        : {requireLogin : true },
        });
        //Dashboard
        $stateProvider.state(
                route.resolve('module','dashboard','/dashboard','Dashboard', 'dashboard/', 'vm', true)
                /*{
                    name: 'dashboard',
                    url: '/dashboard',
                    templateUrl: viewsDirectory+"dashboard/dashboard.html",
                    controller  : controllersDirectory+"dashboard/dashboardController",
                    controllerAs: 'vm',
                    data        : {secure : true },
                }*/
        );
        
        //Customer
        $stateProvider.state(
            route.resolve('module','customers','/customers','Customers', 'customers/', 'vm', true)
        );
        
        //User info
        $stateProvider.state(
            route.resolve('module','userInfo','/userinfo','UserInfo', 'users/', 'vm', true)
        );

        //Customer edit/detail
        $stateProvider.state(
            route.resolve('module','customerDetail','/customer/:customerId','CustomerAdd', 'customers/', 'vm', true)
        );
        $stateProvider.state(
            route.resolve('module','customerAdd','/customer','CustomerAdd', 'customers/', 'vm', true)
        );

        $urlRouterProvider.otherwise("/module/dashboard");
        
        
        
        //-------------------------------------------------------
        $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function ($q, $location, $localStorage) {
            return {
                'request': function (config) {
                    config.headers = config.headers || {};
                    if (typeof $localStorage.user != 'undefined' && $localStorage.user.isAuthenticated) {
                        config.headers.Authorization = 'Bearer ' + $localStorage.user.isAuthenticated;
                    }
                    return config;
                },
                'responseError': function (response) {
                    if (response.status === 401 || response.status === 403) {
                        $location.path('/login');
                    }
                    return $q.reject(response);
                }
            };
         }]);
        //-------------------------------------------------------
    });
    
    app.run(['$rootScope', '$location', 'authService', '$state', '$localStorage',
        function ($rootScope, $location, authService, $state, $localStorage) {
            //Client-side security. Server-side framework MUST add it's 
            //own security as well since client-based security is easily hacked
            
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {
//                console.log(authService.getTokenClaims());
//                
//                console.log($localStorage.user);
                if (toState && toState.secure) {
//                    if (!authService.user.isAuthenticated) {
                    if (typeof $localStorage.user == 'undefined' || !$localStorage.user.isAuthenticated) {
                        console.log('Ban phai dang nhap--');
                        console.log($localStorage.user.isAuthenticated);
                        $rootScope.$evalAsync(function () {
                            authService.redirectToLogin();
                        });
                    }
                }
            });
            
            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
                $rootScope.stateIsLoading = true;
//                cfpLoadingBar.start();
            });

            $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
                $rootScope.stateIsLoading = false;
            });
            
            $rootScope.$on('redirectToLogin', function () {
//                console.log('$rootScope redirectToLogin');
                $state.go('Login'); //Redirect to "Name" of State providers
            });
            
    }]);
    return app;
});
