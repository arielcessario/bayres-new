'use strict';

angular.module('bayres.detalle', [])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/detalle/:id', {
            templateUrl: 'detalle/detalle.html',
            controller: 'DetalleController',
            data: {requiresLogin: false}
        });
    }])
    .controller('DetalleController', DetalleController);


DetalleController.$inject = ['$routeParams', '$location', 'AcUtils', 'ProductService', 'CartVars', '$timeout',
    'LinksService', 'BayresService'];

function DetalleController($routeParams, $location, AcUtils, ProductService, CartVars, $timeout,
                           LinksService, BayresService) {
    var vm = this;
    vm.id = $routeParams.id;
    vm.search = false;
    vm.producto = {
        descripcion: '',
        destacado: 0,
        en_oferta: 0,
        en_slider: 0,
        nombre: '',
        precios: [],
        producto_id: 0,
        producto_tipo: 0,
        pto_repo: 0,
        sku: null,
        status: 0,
        fotos: []
    };
    vm.carritoInfo = {
        cantidadDeProductos: 0,
        totalAPagar: 0.00,
        modified: false
    };

    vm.close = close;
    vm.addProducto = addProducto;

    vm.search = BayresService.search;
    BayresService.listen(function(){
        vm.search = BayresService.search;
    });

    var id = vm.id == undefined ? LinksService.productId : vm.id;

    ProductService.getByParams("producto_id", '' + id, "true", function (data) {
        vm.producto = data[0];
    });

    function close() {
        $location.path('/main');
        LinksService.selectedIncludeTop = (vm.search) ? 'main/productos.html' : 'main/ofertas.html';
        LinksService.selectedIncludeMiddle = (vm.search) ? '' : 'main/destacados.html';
        LinksService.selectedIncludeBottom = (vm.search) ? '' : 'main/masvendidos.html';
        LinksService.broadcast();
    }

    function addProducto(producto) {
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

        if (CartVars.carrito.length > 0) {
            var index = 0;
            CartVars.carrito.forEach(function (data) {
                if (data.producto_id == producto.producto_id) {
                    producto.cantidad = data.cantidad + producto.cantidad;
                    indexToDelete = index;
                    encontrado = true;
                }
                index = index + 1;
            });

            if (encontrado) {
                CartVars.carrito.splice(indexToDelete, 1);
            }
        }
        CartVars.carrito.push(producto);
        CartVars.carrito.sort(function (a, b) {
            return a.nombre - b.nombre;
        });
        console.log(CartVars.carrito);

        calcularCarritoTotal();
    }

    function calcularCarritoTotal() {
        vm.carritoInfo.cantidadDeProductos = CartVars.carrito_cantidad_productos();
        vm.carritoInfo.totalAPagar = CartVars.carrito_total();
        CartVars.broadcast();

        console.log(vm.carritoInfo);
    }


}
