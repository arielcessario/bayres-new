'use strict';

angular.module('bayres.productos', [
    'ngRoute',
    'ngCookies',
    'angular-storage',
    'angular-jwt',
    'acUtils',
    //'acUsuarios',
    'acProductos'
])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/productos', {
            templateUrl: 'productos/producto.html',
            controller: 'ProductoController',
            data: {requiresLogin: false}
        });
    }])
    .controller('ProductoController', ProductoController);

ProductoController.$inject = ['$scope', 'AcUtils', 'ProductService'];

function ProductoController($scope, AcUtils, ProductService) {
    var vm = this;

    vm.productos = [];

    ProductService.get(function(data){
        console.log(data);
        vm.productos = data;
    });
}