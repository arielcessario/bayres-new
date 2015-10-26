'use strict';

// Declare app level module which depends on views, and components
angular.module('bayres', [
  'ngRoute',
  'ngCookies',
  //'angular-storage',
  //'angular-jwt',
  //'acUtils',
  //'acUsuarios',
  //'acProductos',
  'bayres.login',
  'bayres.usuarios'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/login'});
}])
.controller('MainController', MainController);


MainController.$inject = ['$scope', 'UserService', 'AcUtils', 'ProductService', 'CartService'];
//MainService.$inject = ['$http'];

function MainController($scope, UserService, AcUtils, ProductService, CartService) {

  var vm = this;


}