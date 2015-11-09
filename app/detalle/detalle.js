'use strict';

angular.module('bayres.detalle', [
    'ngRoute',
    'ngCookies',
    'ngAnimate',
    'angular-storage',
    'angular-jwt',
    'acUtils',
    'acUsuarios',
    'acProductos'
])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/detalle/:id', {
            templateUrl: 'detalle/detalle.html',
            controller: 'DetalleController',
            data: {requiresLogin: false}
        });
    }])
    .controller('DetalleController', DetalleController);


DetalleController.$inject = ['$routeParams', '$location', 'AcUtils', 'ProductService', 'CartVars', '$timeout'];

function DetalleController($routeParams, $location, AcUtils, ProductService, CartVars, $timeout) {
    var vm = this;
    vm.id = $routeParams.id;
    /*
    vm.producto = {
        //descripcion: 'Dise�ado especialmente para balcones, patios, macetas jardineras, peque�as y grandes macetas, etc. Sistema de riego por goteo. Li�nea principal de 7,2 metros de largo con 24 goteros estaca auto compensados de 1,3 litros/hora cada uno en 6 sets de 4 goteros cada set (li�nea del set de 60 cms.) Riega hasta 24 macetas individuales. Kit expandible, puede agregar otros kits al final de la li�nea Trabaja con mi�nima presion (0,5 bar), solo conectelo a la canilla y funciona perfectamente. Sumamente versatil, puede utilizarse en peque�as o grandes macetas. Impresionante ahorro de agua y tiempo. Manual de instrucciones en espa�ol. Incorporando un timer (no incluido), automatiza el riego. Impresionante ahorro de agua. Este kit puede extenderse.',
        descripcion: 'bandeja de siembra de 25 plugs, ideal para la clonacion de plantas. reutilizable.',
        destacado: 0,
        en_oferta: 0,
        en_slider: 0,
        nombre: 'Bandeja de siembra 25 plugs',
        precios: [{precio: "22.00", precio_id: 1900, precio_tipo_id: 0}],
        producto_id: 0,
        producto_tipo: 0,
        pto_repo: 0,
        sku: null,
        status: 0,
        fotos:[{main: 1, nombre: "big_up_powder.png", producto_foto_id: 1}]
    };
    */



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
        fotos:[]
    };

    vm.carritoInfo = {
        cantidadDeProductos: 0,
        totalAPagar: 0.00,
        modified: false
    };

    vm.close = close;
    vm.addProducto = addProducto;


    console.log(vm.id);
    /*
    $timeout(function () {
        console.log('esperando');
    }, 5000);
    */
    ProductService.getByParams("producto_id", vm.id.toString(), "true", function(data){
        //console.log(data);
        vm.producto = data;
        console.log(vm.producto);
    });


    function close() {
        $location.path('/main');
    }

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

        if(CartVars.carrito.length > 0) {
            var index = 0;
            CartVars.carrito.forEach(function(data){
                if(data.producto_id == producto.producto_id) {
                    producto.cantidad = data.cantidad + producto.cantidad;
                    indexToDelete = index;
                    encontrado = true;
                }
                index = index + 1;
            });

            if(encontrado) {
                CartVars.carrito.splice( indexToDelete, 1 );
            }
        }
        CartVars.carrito.push(producto);
        CartVars.carrito.sort(function(a, b){
            return a.nombre - b.nombre;
        });
        console.log(CartVars.carrito);

        calcularCarritoTotal();
    }

    function calcularCarritoTotal() {
        vm.carritoInfo.cantidadDeProductos = CartVars.carrito_cantidad_productos();
        vm.carritoInfo.totalAPagar = CartVars.carrito_total();

        console.log(vm.carritoInfo);
    }


}
