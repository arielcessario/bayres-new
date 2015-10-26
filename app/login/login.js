'use strict';

window.appName = 'bayres';

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

LoginController.$inject = ['$location', 'UserService', 'AcUtils'];

function LoginController($location, UserService, AcUtils) {
  var vm = this;

  vm.login = login;

  vm.loginForm = {
    mail:'',
    password:''
  };

  function login() {
    console.log(vm.loginForm);

    UserService.login(vm.loginForm.mail, vm.loginForm.password, 1, function(data){
      console.log(data);
      $location.path('/main');
    });
  }
}