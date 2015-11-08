(function () {
    'use strict';

    window.appName = 'bayres';

    angular.module('bayres.contacto', [
        'ngRoute',
        'ngCookies',
        'angular-storage',
        'angular-jwt',
        'acUtils',
        'acUsuarios'
    ])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/contacto', {
            templateUrl: 'contacto/contacto.html',
            controller: 'ContactoController',
            data: {requiresLogin: false}
        });
    }])
    .controller('ContactoController', ContactoController)
    .service('ContactoService', ContactoService);

    ContactoController.$inject = ['$location', '$timeout', 'AcUtils', 'ContactoService', ];

    function ContactoController($location, $timeout, AcUtils, ContactoService) {
        var vm = this;

        vm.message = '';
        vm.enviado = false;

        vm.sendConsulta = sendConsulta;
        vm.home = home;

        vm.contactoForm = {
            asunto:'',
            nombre:'',
            mail:'',
            consulta:''
        };

        function hideMessage(){
            vm.enviado = false;
            $location.path('/main');
        }

        function home() {
            $location.path('/main');
        }

        function sendConsulta() {
            vm.message = '';
            var conErrores = false;
            if (vm.contactoForm.mail == undefined || vm.contactoForm.mail.trim().length == 0 || (!AcUtils.validateEmail(vm.contactoForm.mail.trim()))) {
                AcUtils.validations('contacto-mail', 'El mail no es válido');
                conErrores = true;
            }

            if (vm.contactoForm.nombre == undefined || vm.contactoForm.nombre.trim().length == 0) {
                AcUtils.validations('contacto-nombre', 'Debe ingrear su nombre');
                conErrores = true;
            }

            if (vm.contactoForm.consulta == undefined || vm.contactoForm.consulta.trim().length == 0) {
                AcUtils.validations('contacto-consulta', 'Debe ingresar un mensaje');
                conErrores = true;
            }

            if (vm.contactoForm.asunto == undefined || vm.contactoForm.asunto.trim().length == 0) {
                AcUtils.validations('contacto-asunto', 'Debe ingresar un asunto');
                conErrores = true;
            }

            if (conErrores) {
                return;
            }

            ContactoService.sendMailConsulta(vm.contactoForm, function(data){
                if(data) {
                    vm.enviado = true;
                    $timeout(hideMessage, 3000);
                    vm.contactoForm = {
                        asunto:'',
                        nombre:'',
                        mail:'',
                        consulta:''
                    };
                } else {
                    vm.message = 'Error enviando el mail';
                }
            });
        }

    }


    ContactoService.$inject = ['$http'];
    function ContactoService($http) {

        //Variables
        var service = {};

        service.sendMailConsulta = sendMailConsulta;

        return service;

        /**
         *
         * @param contactoForm
         * @param callback
         * @returns {*}
         */
        function sendMailConsulta(contactoForm, callback) {
            return $http.post('mailer/mailer.php',
                {
                    function: 'sendConsulta',
                    'contactoForm': JSON.stringify(contactoForm)
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(data);
                })
        }

    }

})();