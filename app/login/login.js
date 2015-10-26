'use strict';

angular.module('bayres.login', [
  'ngRoute',
  'ngCookies',
  'angular-storage',
  'angular-jwt',
  'acUtils',
  'acUsuarios'
])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'login/login.html',
    controller: 'LoginController'
  });
}])
.controller('LoginController', LoginController);

LoginController.$inject = ['$scope', 'UserService', 'AcUtils'];

function LoginController($scope, UserService, AcUtils) {
  var vm = this;

  vm.loginForm = {
    mail:'',
    password:''
  };

  vm.login = function() {
    console.log(vm.loginForm);

    UserService.login(vm.loginForm.mail, vm.loginForm.password, 1, function(data){
      console.log(data);
    });
  }
}