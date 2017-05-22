'use strict';

define(['app'], function (app) {

    var injectParams = ['$http', '$rootScope', '$localStorage', 'urls'];

    var authFactory = function ($http, $rootScope, $localStorage, urls) {
        var serviceBase = urls.BASE_API,// 'http://api.mitek-popup.dev/api/v1/',//'/api/dataservice/',
            factory={};
            if (typeof $localStorage.user == 'undefined'){
                $localStorage.user = {
                    isAuthenticated: false,
                    infos:null,
                    roles: null
                };
            }
//            factory = {
//                loginPath: '/login.html',
//                user: {
//                    isAuthenticated: false,
//                    roles: null
//                }
//            };

        factory.login = function (email, password) {
//            console.log(email+'-'+password);
            var data = $.param({email: email,password: password});
        
            var config = {
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                }
            };

            return $http.post(serviceBase + 'login', data, config)
            .then(
                function (results) { //success
                    console.log(results);
                    var loginStatus = results.data.status;
                    changeAuth(loginStatus.token, results.data.info, results.data.role);
                    return loginStatus;
                },function (error){      //error
                    var loginStatus = false;
                    changeAuth(loginStatus, null, null);
                    return loginStatus;
                }); 
        };

        factory.logout = function () {
            return $http.post(serviceBase + 'logout').then(
                function (results) {
                    var loggedIn = !results.data.status;
                    changeAuth(loggedIn, null, null);
                    return loggedIn;
                });
        };
        
        factory.updateUser = function (userInfo) {
            return $http.put(
                serviceBase + 'putUser/' + userInfo.id, 
                userInfo
            )
            .then(function (status) {
                console.log(status);
                return status.data;
            },function(error){
                
            });
        };

        factory.redirectToLogin = function () {
            console.log('Login');
//            window.location = 'login.html';
            $rootScope.$broadcast('redirectToLogin', null);
        };

        function changeAuth(loginStatus, loginInfo, loginRole) {
//            console.log(loginStatus);
//            console.log(loginInfo);
//            console.log(loginRole);
            if (typeof $localStorage.user == 'undefined'){
                $localStorage.user = {
                    isAuthenticated: loginStatus,
                    infos: loginInfo,
                    roles: loginRole
                };
            }else{
                $localStorage.user.isAuthenticated = loginStatus;
                $localStorage.user.infos = loginInfo;
                $localStorage.user.roles = loginRole;
            }
            $rootScope.$broadcast('loginStatusChanged', loginStatus);
        }
        
        factory.getTokenClaims = function () {
            return getClaimsFromToken();
        };
        
        function urlBase64Decode(str) {
           var output = str.replace('-', '+').replace('_', '/');
           switch (output.length % 4) {
               case 0:
                   break;
               case 2:
                   output += '==';
                   break;
               case 3:
                   output += '=';
                   break;
               default:
                   throw 'Illegal base64url string!';
           }
           return window.atob(output);
       }

       function getClaimsFromToken() {
           var user = {};
           if (typeof $localStorage.user.isAuthenticated !== 'undefined' && $localStorage.user.isAuthenticated) {
               var token = $localStorage.user.isAuthenticated;
               var encoded = token.split('.')[1];
               user = JSON.parse(urlBase64Decode(encoded));
           }
           return user;
       }
        
        
        return factory;
    };

    authFactory.$inject = injectParams;

    app.factory('authService', authFactory);

});
