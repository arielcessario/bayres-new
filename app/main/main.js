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

    vm.productos = [];
    vm.productosMasVendidos = [];
    vm.productosDestacados = [];

    ProductService.get(function(data){
        console.log(data);
        vm.productos = data;
    });
}
