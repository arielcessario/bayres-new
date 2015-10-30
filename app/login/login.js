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
    controller: 'LoginController',
    data: {requiresLogin: false}
  });
}])
.controller('LoginController', LoginController);

LoginController.$inject = ['$location', 'UserService', '$timeout'];

function LoginController($location, UserService, $timeout) {
  var vm = this;

  vm.message = '';

  vm.login = login;
  vm.passwordEnter = passwordEnter;
  vm.createUsuario = createUsuario;

  vm.loginForm = {
    mail:'',
    password:''
  };

  function login() {
    if(vm.loginForm.mail.trim().length > 0 && vm.loginForm.password.trim().length > 0) {
      UserService.login(vm.loginForm.mail.trim(), vm.loginForm.password.trim(), 1, function(data){
        console.log(data);
        if(data != -1) {
          $timeout(function () {
            vm.message = 'Usuario logueado';
            $location.path('/main');
          }, 2000);

          vm.message = '';
        } else {
          vm.message = 'Usuario o contraseña erroneo';
        }
      });
    } else {
      vm.message = 'Ingrese una mail y contraseña';
    }
  }

  function passwordEnter(event) {
    if(event.keyCode == 13) {
      vm.login();
    }
  }

  function createUsuario() {
    $location.path('/usuarios');
  }
}