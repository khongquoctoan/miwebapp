'use strict';

define(['app'], function (app) {

    var injectParams = ['$http', '$rootScope', '$localStorage', 'urls'];

    var authFactory = function ($http, $rootScope, $localStorage, urls) {
        var serviceBase = urls.BASE_API, 
                factory = {};
        if (typeof $localStorage.user == 'undefined') {
            $localStorage.user = {
                isAuthenticated: false,
                infos: null,
                roles: null
            };
        }

        factory.login = function (email, password) {
//            console.log(email+'-'+password);
            var data = $.param({email: email, password: password});

            var config = {
                headers: {
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
                            }, function (error) {      //error
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

        factory.redirectToLogin = function () {
            console.log('Login');
//            window.location = 'login.html';
            $rootScope.$broadcast('redirectToLogin', null);
        };

        function changeAuth(loginStatus, loginInfo, loginRole) {
//            console.log(loginStatus);
//            console.log(loginInfo);
//            console.log(loginRole);
            if (typeof $localStorage.user == 'undefined') {
                $localStorage.user = {
                    isAuthenticated: loginStatus,
                    infos: loginInfo,
                    roles: loginRole
                };
            } else {
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

        //----- Get user list ------------
        factory.getUsersSummary = function (pageIndex, pageSize) {
            return getPagedResource('users', pageIndex, pageSize);
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
        
        factory.updateUserProfile = function (userInfo) {
            return $http.put(serviceBase + 'putUserProfile/' + userInfo.id, userInfo)
                    .then(function (status) {return status.data;}, function (error) {});
        };
        
        factory.updateUser = function (userInfo) {
            return $http.put(serviceBase + 'putUser/' + userInfo.id, userInfo)
                    .then(function (status) {return status.data;}, function (error) {});
        };
        
        factory.deleteUser = function (id) {
            return $http.get(serviceBase + 'deleteUser/' + id).then(function (status) {
                return status.data;
            });
        };
        
        factory.insertUser = function (userInfo) {
            return $http.post(serviceBase + 'postUser', userInfo)
            .then(function (results) {return results.data;});
        };
        
        factory.duplicateUser = function (id) {
            return $http.get(serviceBase + 'duplicateUser/' + id).then(function (status) {
                return status.data;
            });
        };
        
        factory.deleteMultiUser = function (cusSelected) {
            return $http.post(serviceBase + 'deleteMultiUser', {list:cusSelected}).then(function (status) {
                return status.data;
            });
        };

        factory.getUser = function (id) {
            return $http.get(serviceBase + 'user/' + id).then(function (results) {
//                console.log(results.data[0]);
                return results.data;
            });
        };
        
        factory.getUserTypeGroup = function (id) {
            return $http.get(serviceBase + 'userTypeGroup').then(function (results) {
                return results.data;
            });
        };

        return factory;
    };

    authFactory.$inject = injectParams;

    app.factory('authService', authFactory);

});
