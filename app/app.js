'use strict';

// Declare app level module which depends on views, and components
angular.module('bayres', [
  'ngRoute',
  'ngCookies',
  'bayres.main',
  'bayres.login',
  'bayres.usuarios',
  'bayres.productos',
  'bayres.carrito'
]).
config(['$routeProvider', function($routeProvider) {

}])
.controller('BayresController', BayresController);


BayresController.$inject = ['$location'];

function BayresController($location) {

  $location.path('/main');


}