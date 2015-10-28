'use strict';

angular.module('bayres.usuarios', [
    'ngRoute',
    'ngCookies',
    'angular-storage',
    'angular-jwt',
    'acUtils',
    'acUsuarios'
])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/usuarios', {
            templateUrl: 'usuarios/usuario.html',
            controller: 'UsuarioController',
            data: {requiresLogin: true}
        });
    }])
    .controller('UsuarioController', UsuarioController);

UsuarioController.$inject = ['$location', 'UserService', 'AcUtils'];

function UsuarioController($location, UserService, AcUtils) {
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

    vm.login = login;
    vm.create = create;
    vm.update = update;

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
    }

    function create() {
        if(validateForm()) {
            UserService.create(vm.userForm, function (data) {
                console.log(data);
            });
        } else {
            vm.message = 'Complete todos los campos';
        }
    }

    function update() {
        if(validateForm()) {
            UserService.update(vm.userForm, function (data) {
                console.log(data);
            });
        } else {
            vm.message = 'Complete todos los campos';
        }
    }
}