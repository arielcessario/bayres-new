'use strict';

angular.module('bayres.usuarios', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/usuarios', {
            templateUrl: 'usuarios/usuario.html',
            controller: 'UsuarioController',
            data: {requiresLogin: false}
        });
    }])
    .controller('UsuarioController', UsuarioController);

UsuarioController.$inject = ['$location', 'UserService', 'AcUtils', 'LinksService', 'CartVars'];

function UsuarioController($location, UserService, AcUtils, LinksService, CartVars) {
    var vm = this;

    vm.userForm = {
        'nombre': '',
        'apellido': '',
        'mail': '',
        'nacionalidad_id': 0,
        'tipo_doc': 0,
        'nro_doc': '',
        'comentarios': '',
        'marcado': '',
        'telefono': '',
        'fecha_nacimiento': '',
        'profesion_id': 0,
        'saldo': '',
        'rol_id': 0,
        'news_letter': 0,
        'password': ''
    };
    vm.dirForm = {
        'usuario_id': 0,
        'calle': '',
        'nro': 0,
        'piso': 0,
        'puerta': '',
        'ciudad_id': 0
    };

    vm.repeatMail = '';
    vm.message = '';

    //METODOS
    vm.login = login;
    vm.create = create;

    function validateForm() {
        if(vm.userForm.nombre.trim().length > 0 && vm.userForm.apellido.trim().length > 0
        && vm.userForm.fecha_nacimiento.trim().length > 0 && vm.userForm.telefono.trim().length > 0
        && vm.userForm.mail.trim().length > 0 && vm.userForm.password.trim().length > 0
        && vm.repeatMail.trim().length > 0)
            return true;

        return false;
    }

    function login() {
        $location.path('/login');
        LinksService.selectedIncludeTop = 'login/login.html';

        CartVars.broadcast();
    }

    function create() {
        if(validateForm()) {
            UserService.create(vm.userForm, function (data) {
                console.log(data);
                LinksService.selectedIncludeTop = 'main/ofertas.html';

                CartVars.broadcast();
            });
        } else {
            vm.message = 'Complete todos los campos';
        }
    }

}