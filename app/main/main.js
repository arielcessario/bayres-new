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

    /****************************************************************
     * Retorna los productos que estan en oferta
     *****************************************************************/
    ProductService.getByParams("en_oferta", "1", "true", function(data){
        vm.productosEnOfertas = data;
    });

    /****************************************************************
     * Retorna los productos destacados
     *****************************************************************/
    ProductService.getByParams("destacado", "1", "true", function(data){
        vm.productosDestacados = data;
    });

    /****************************************************************
     * Retorna los 8 productos más vendidos
     *****************************************************************/
    ProductService.getMasVendidos(function (data) {
        vm.productosMasVendidos = data;
    });
}
