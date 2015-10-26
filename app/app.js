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
  'bayres.main',
  'bayres.login',
  'bayres.usuarios',
  'bayres.productos',
  'bayres.carrito'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/main'});
}])
.controller('BayresController', BayresController);


BayresController.$inject = ['$scope', 'UserService', 'AcUtils', 'ProductService', 'CartService'];
//MainService.$inject = ['$http'];

function BayresController($scope, UserService, AcUtils, ProductService, CartService) {

  var vm = this;


}