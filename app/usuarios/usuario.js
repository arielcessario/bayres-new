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
        nombre: ''
    };

    vm.logout = logout;
    vm.create = create;

    function logout() {
        UserService.logout(function (data) {
            console.log('lslsls');
            console.log(data);
            $location.path('/main');
        });
    }

    function create() {
        UserService.create(vm.userForm, function (data) {
            console.log(data);
        });
    }
}