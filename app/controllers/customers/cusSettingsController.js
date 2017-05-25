'use strict';

define(['app'], function (app) {

    var injectParams = ['$builder', '$validator', '$location', '$filter', '$window',
        '$timeout', 'authService', 'customersService', '$state'];//, 'modalService'];

    var CusSettingsController = function ($builder, $validator, $location, $filter, $window,
            $timeout, authService, customersService, $state) {//, modalService) {

        var vm = this;
        function init() {
            var checkbox, textbox;
//            textbox = $builder.addFormObject('default', {
//                component: 'textInput',
//                label: 'Tên',
//                description: '',//'Your name',
//                placeholder: 'Nhập tên khách hàng',//'Your name',
//                required: true,
//                editable: false
//            });
//            
//            textbox = $builder.addFormObject('default', {
//                component: 'textInput',
//                label: 'Họ',
//                description: '',//'Your name',
//                placeholder: 'Nhập họ khách hàng',//'Your name',
//                required: true,
//                editable: false
//            });
//            checkbox = $builder.addFormObject('defaulst', {
//                component: 'checkbox',
//                label: 'Pets',
//                description: 'Do you have any pets?',
//                options: ['Dog', 'Cat']
//            });
//            $builder.addFormObject('default', {
//                component: 'sampleInput'
//            });
            var acbc = [{"id":0,"component":"textInput","editable":true,"index":0,"label":"Text Input","description":"description","placeholder":"placeholder","options":[],"required":false,"validation":"/.*/"},{"id":1,"component":"textArea","editable":true,"index":1,"label":"Text Area","description":"description","placeholder":"placeholder","options":[],"required":false,"validation":"/.*/"}];
            $builder.forms = {'default':acbc};
//            $builder.addFormObjects('default', acbc);
            vm.form = $builder.forms;
            vm.input = [];
            vm.defaultValue = {};
            
//            vm.defaultValue[textbox.id] = 'default value';
//            vm.defaultValue[checkbox.id] = [true, true];
            return vm.submit = function () {
                return $validator.validate(vm, 'default').success(function () {
                    return console.log('success');
                }).error(function () {
                    return console.log('error');
                });
            };
        }

        init();
    };

    CusSettingsController.$inject = injectParams;

    app.register.controller('CusSettingsController', CusSettingsController);

});