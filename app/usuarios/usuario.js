'use strict';

angular.module('bayres.usuarios', [
  'ngRoute',
  'ngCookies',
  'angular-storage',
  'angular-jwt',
  'acUtils',
  'acUsuarios'
])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/usuarios', {
    templateUrl: 'usuarios/usuario.html',
    controller: 'UsuarioController',
    data: {requiresLogin: true}
  });
}])
.controller('UsuarioController', UsuarioController);

UsuarioController.$inject = ['$scope', 'UserService', 'AcUtils'];

function UsuarioController($scope, UserService, AcUtils) {
  var vm = this;

  vm.userForm = {
    nombre:''
  };

  vm.logout = function() {
    UserService.logout(function (data) {
      console.log(data);
      $route.current.templateUrl = 'login/login.html';
    });
  }

  vm.create = function() {
    UserService.create(vm.userForm, function(data){
      console.log(data);
    });
  }
}