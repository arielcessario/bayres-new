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
    .controller('CarritoController', CarritoController)
    .service('CarritoService', CarritoService);

CarritoController.$inject = ['$routeParams', 'AcUtils', 'UserService', 'ProductService', 'CarritoService'];
CarritoService.$inject = ['$http'];

function CarritoController($routeParams, AcUtils, UserService, ProductService, CarritoService) {
    var vm = this;

    vm.productos = [];
    vm.carritoDetalles = [];
    vm.carritoInfo = {
        cantidadDeProductos: 0,
        totalAPagar: 0.00,
        modified: false
    };

    //vm.carrito = $routeParams.carrito;

    vm.removeProducto = removeProducto;

    console.log(carrito);

    ProductService.get(function(data){
        console.log(data);
        vm.productos = data;
    });

    function removeProducto(producto) {
        if(vm.carritoDetalles.length > 0) {
            var producto = vm.carritoDetalles[index];
            var detalle = producto.nombre + ' $' + producto.precio_unitario + '(x' + producto.cantidad + ')';
            var borrarOk = confirm('¿Desea borrar el producto '+ detalle +'?');
            if(borrarOk){
                vm.carritoDetalles.splice( index, 1 );
                vm.carritoDetalles.sort(function(a, b){ return a.nombre - b.nombre; });
                CarritoService.calcularCarritoTotal(vm.carritoDetalles, function(data){
                    vm.carritoInfo = data;
                });
            } else {
                return;
            }
        }
    }


}

function CarritoService($http) {

    //Variables
    var service = {};

    service.calcularCarritoTotal = calcularCarritoTotal;

    return service;

    function calcularCarritoTotal(carritoDetalles, callback) {
        var carritoInfo = {
            cantidadDeProductos: 0,
            totalAPagar: 0.00,
            modified: false
        };
        var cantidadDeProductos = 0;
        var totalAPagar = 0.00;

        carritoDetalles.forEach(function(data){
            cantidadDeProductos = data.cantidad + cantidadDeProductos;
            totalAPagar = (data.precio_unitario * data.cantidad)+ totalAPagar;
        });

        carritoInfo.cantidadDeProductos = cantidadDeProductos;
        carritoInfo.totalAPagar = totalAPagar;
        carritoInfo.modified = true;

        callback(carritoInfo);
    }

}