'use strict';

angular.module('bayres.main', [])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/main', {
            templateUrl: 'main/main.html',
            controller: 'MainController',
            data: {requiresLogin: false}
        });

        /*
        $routeProvider.when('/main/:id', {
            templateUrl: 'main/productos.html',
            controller: 'MainController',
            data: {requiresLogin: false}
        });
        */
    }])
    .controller('MainController', MainController);


MainController.$inject = ['$interval', '$timeout', '$location', 'AcUtils', 'UserService',
    'ProductService', 'CategoryService', 'CartVars', '$scope', 'LinksService',
    '$routeParams'];

function MainController($interval, $timeout, $location, AcUtils, UserService,
                        ProductService, CategoryService, CartVars, $scope, LinksService,
                        $routeParams) {
    var vm = this;

    vm.productosEnOfertas = [];
    vm.productosMasVendidos = [];
    vm.productosDestacados = [];
    //vm.carritoDetalles = [];
    vm.productoList = [];
    vm.productos = [];
    vm.categorias = [];
    vm.subcategorias = [];

    vm.usuario = {};

    vm.productoResultado = '';
    vm.existenProductos = false;
    vm.showInfo = false;
    vm.intervalo;
    vm.slider_nro = 1;

    vm.carritoInfo = {
        cantidadDeProductos: 0,
        totalAPagar: 0.00,
        modified: false
    };


    vm.addProducto = addProducto;
    vm.showDetalle = showDetalle;
    vm.findProducto = findProducto;
    vm.showSubCategoria = showSubCategoria;
    vm.hideSubCategoria = hideSubCategoria;

    vm.intervalo = $interval(cambiarSlide, 7000);

    function cambiarSlide(){
        vm.slider_nro = (vm.slider_nro == 4) ? vm.slider_nro = 1 : vm.slider_nro += 1;
    }

    ProductService.getByParams("en_oferta", "1", "true", function (data) {
        vm.productosEnOfertas = data;
    });

    ProductService.getByParams("destacado", "1", "true", function (data) {
        if (data != null || data != undefined) {
            for (var i = 0; i < 8; i++) {
                vm.productosDestacados.push(data[i]);
            }
        }
    });

    ProductService.getMasVendidos(function (data) {
        if (data != null || data != undefined) {
            for (var i = 0; i < 8; i++) {
                vm.productosMasVendidos.push(data[i]);
            }
        }
    });

    var filtro = LinksService.searchName+','+LinksService.searchName;
    console.log(filtro);

    ProductService.getByParams("nombre,descripcion", filtro , "false", function(data){
        if(data === null || data === undefined || data.length == 0) {
            vm.productoResultado = 'No hay resultados';
            vm.existenProductos = false;
        } else {
            vm.productoResultado = 'Resultados';
            vm.existenProductos = true;
            vm.productos = data;
        }
        LinksService.searchName = '';
        LinksService.broadcast();
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

    function findProducto() {
        if (vm.productoBuscado.length > 2) {
            ProductService.getByParams('nombre', vm.productoBuscado, 'true', function (data) {
                vm.productoResultado = (data.length > 0) ? 'RESULTADOS' : 'No se encontro resultado';
                vm.productoList = data;
            });
        } else {
            $location.path('/main');
        }
    }

    function showDetalle(id) {
        $location.path('/detalle/' + id);
        LinksService.selectedIncludeTop = 'detalle/detalle.html';
        LinksService.productId = id;
        LinksService.broadcast();
    }

    function showSubCategoria(categoria_id) {
        console.log(categoria_id);
        vm.showInfo = true;
    }

    function hideSubCategoria(categoria_id) {
        console.log(categoria_id);
        vm.showInfo = false;
    }




}
