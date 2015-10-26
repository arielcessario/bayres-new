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
    vm.carritoDetalles = [];

    vm.carritoInfo = {
        cantidadDeProductos: 0,
        totalAPagar: 0.00,
        modified: false
    };

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
        var miProducto = {
            producto_id: producto.producto_id,
            cantidad: 1,
            en_oferta: 1,
            precio_unitario: producto.precios[0].precio,
            carrito_id: -1,
            nombre: producto.nombre
        };

        actualizarMiCarrito(miProducto);
    }

    function actualizarMiCarrito(producto) {
        var encontrado = false;
        var indexToDelete = 0;

        if(vm.carritoDetalles.length > 0) {
            var index = 0;
            vm.carritoDetalles.forEach(function(data){
                if(data.producto_id == producto.producto_id) {
                    producto.cantidad = data.cantidad + producto.cantidad;
                    indexToDelete = index;
                    encontrado = true;
                }
                index = index + 1;
            });

            if(encontrado) {
                vm.carritoDetalles.splice( indexToDelete, 1 );
            }
        }
        vm.carritoDetalles.push(producto);
        //Ordeno carrito detalles por nombre del producto
        vm.carritoDetalles.sort(function(a, b){ return a.nombre - b.nombre; });
        console.log(vm.carritoDetalles);

        calcularCarritoTotal();
    }

    function calcularCarritoTotal() {
        var cantidadDeProductos = 0;
        var totalAPagar = 0.00;

        vm.carritoDetalles.forEach(function(data){
            cantidadDeProductos = data.cantidad + cantidadDeProductos;
            totalAPagar = (data.precio_unitario * data.cantidad)+ totalAPagar;
        });

        vm.carritoInfo.cantidadDeProductos = cantidadDeProductos;
        vm.carritoInfo.totalAPagar = totalAPagar;
        vm.carritoInfo.modified = true;

        console.log(vm.carritoInfo);
    }
}
