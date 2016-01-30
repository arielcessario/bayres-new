(function () {
    'use strict';


    angular.module('bayres.contacto', [])
        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/contacto', {
                templateUrl: 'contacto/contacto.html',
                controller: 'ContactoController',
                data: {requiresLogin: false}
            });
        }])
        .controller('ContactoController', ContactoController);

    ContactoController.$inject = ['$scope', '$location', '$timeout', 'AcUtils', 'LinksService',
        'CartVars', 'BayresService', 'BayresMailerService'];

    function ContactoController($scope, $location, $timeout, AcUtils, LinksService,
                                CartVars, BayresService, BayresMailerService) {
        var vm = this;

        vm.message = '';
        vm.showError = false;
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
            LinksService.selectedIncludeTop = 'main/ofertas.html';
            CartVars.broadcast();
        }

        function home() {
            $location.path('/main');
            LinksService.selectedIncludeTop = 'main/ofertas.html';
            CartVars.broadcast();
        }

        function sendConsulta() {
            vm.showError = true;
            if (vm.contactoForm.nombre == undefined || vm.contactoForm.nombre.trim().length == 0) {
                vm.message = "El Nombre es Obligatorio";
                vm.error_code = 1;
                return;
            }

            if (vm.contactoForm.mail == undefined || vm.contactoForm.mail.trim().length == 0) {
                vm.message = "El Mail es Obligatorio";
                vm.error_code = 2;
                return;
            }

            if(!AcUtils.validateEmail(vm.contactoForm.mail.trim())) {
                vm.message = "El Mail no tiene un formato valido";
                vm.error_code = 2;
                return;
            }

            if (vm.contactoForm.asunto == undefined || vm.contactoForm.asunto.trim().length == 0) {
                vm.message = "El asunto es Obligatorio";
                vm.error_code = 3;
                return;
            }

            if (vm.contactoForm.consulta == undefined || vm.contactoForm.consulta.trim().length == 0) {
                vm.message = "La consulta es Obligatoria";
                vm.error_code = 4;
                return;
            }

            BayresMailerService.sendMailConsulta(vm.contactoForm, function(data){
                if(data) {
                    vm.enviado = true;
                    BayresService.messageConfirm = 'El mail fue enviado';

                    $timeout(hideMessage, 3000);
                    vm.contactoForm = {
                        asunto:'',
                        nombre:'',
                        mail:'',
                        consulta:''
                    };
                } else {
                    BayresService.messageConfirm = 'Error enviando el mail';
                }
                BayresService.showMessageConfirm = true;
            });
        }

    }

})();