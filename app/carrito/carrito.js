'use strict';

angular.module('bayres.carrito', [
    'ngRoute',
    'ngCookies',
    'angular-storage',
    'angular-jwt',
    'acUtils',
    'acUsuarios',
    'acProductos'
])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/carrito', {
            templateUrl: 'carrito/carrito.html',
            controller: 'CarritoController',
            data: {requiresLogin: true}
        });
    }])
    .controller('CarritoController', CarritoController);

CarritoController.$inject = ['$scope', 'AcUtils', 'UserService', 'ProductService'];

function CarritoController($scope, AcUtils, UserService, ProductService) {
    var vm = this;

    vm.productos = [];

    ProductService.get(function(data){
        console.log(data);
        vm.productos = data;
    });
}