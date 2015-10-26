'use strict';

angular.module('bayres.main', [
    'ngRoute',
    'ngCookies',
    'angular-storage',
    'angular-jwt',
    'acUtils',
    'acUsuarios',
    'acProductos'
])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/main', {
            templateUrl: 'main/main.html',
            controller: 'MainController',
            data: {requiresLogin: false}
        });
    }])
    .controller('MainController', MainController);

MainController.$inject = ['$scope', 'AcUtils', 'UserService', 'ProductService'];

function MainController($scope, AcUtils, UserService, ProductService) {
    var vm = this;

    vm.productosEnOfertas = [];
    vm.productosMasVendidos = [];
    vm.productosDestacados = [];

    vm.addProducto = addProducto;

    ProductService.getByParams("en_oferta", "1", "true", function(data){
        vm.productosEnOfertas = data;
    });

    ProductService.getByParams("destacado", "1", "true", function(data){
        vm.productosDestacados = data;
    });

    ProductService.getMasVendidos(function (data) {
        vm.productosMasVendidos = data;
    });

    function addProducto(producto) {
        console.log(producto);
    }
}
