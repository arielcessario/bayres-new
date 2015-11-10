'use strict';

angular.module('bayres.main', [
        'ngRoute',
        'ngCookies',
        'ngAnimate',
        'angular-storage',
        'angular-jwt',
        'acUtils',
        'acUsuarios',
        'acProductos'
    ])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/main', {
            templateUrl: 'main/main.html',
            controller: 'MainController',
            data: {requiresLogin: false}
        });
    }])
    .controller('MainController', MainController);


MainController.$inject = ['$interval', '$timeout', '$location', 'AcUtils', 'UserService',
    'ProductService', 'CategoryService', 'CartVars', '$scope'];

function MainController($interval, $timeout, $location, AcUtils, UserService,
                        ProductService, CategoryService, CartVars, $scope) {
    var vm = this;

    vm.productosEnOfertas = [];
    vm.productosMasVendidos = [];
    vm.productosDestacados = [];
    //vm.carritoDetalles = [];
    vm.productoList = [];
    vm.categorias = [];
    vm.subcategorias = [];

    vm.usuario = {};

    vm.productoResultado = '';
    vm.productoBuscado = '';
    vm.showInfo = false;


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
    }

    function showSubCategoria(categoria_id) {
        console.log(categoria_id);
        vm.showInfo = true;
    }

    function hideSubCategoria(categoria_id) {
        console.log(categoria_id);
        vm.showInfo = false;
    }


    // Create cross browser requestAnimationFrame method:
    window.requestAnimationFrame = window.requestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.msRequestAnimationFrame
        || function (f) {
            setTimeout(f, 1000 / 60)
        };

//var  scrollheight = document.body.scrollHeight; // altura de todo el documento
//var  WindowHeight = window.innerHeight; // altura de la ventana del navegador

    var sucursal1 = document.getElementById('sucursal1');
    var sucursal2 = document.getElementById('sucursal2');
    var sucursal3 = document.getElementById('sucursal3');
//var sucursal4 = document.getElementById('sucursal4');

    var tierra1 = document.getElementById('tierra1');
    var tierra2 = document.getElementById('tierra2');
    var tierra3 = document.getElementById('tierra3');

    var roca1 = document.getElementById('roca1');
    var roca2 = document.getElementById('roca2');
    var roca3 = document.getElementById('roca3');

    var lava1 = document.getElementById('lava1');
    var lava2 = document.getElementById('lava2');
    var lava3 = document.getElementById('lava3');

    function parallaxbubbles() {
        var scrolltop = window.pageYOffset; // get number of pixels document has scrolled vertically
        //var scrollamount = (scrollTop / (scrollheight-WindowHeight)) * 100 // Obtener cantidad desplaza (en%)
        //console.log(scrollamount);

        console.log(scrolltop);

        sucursal1.style.top = 50 - scrolltop * .2 + 'px'; // move bubble1 at 20% of scroll rate
        sucursal2.style.top = 50 - scrolltop * .7 + 'px'; // move bubble2 at 50% of scroll rate
        sucursal3.style.top = 50 - scrolltop * 1 + 'px'; // move bubble2 at 50% of scroll rate
        //sucursal4.style.top = 50 -scrolltop * .7 + 'px'; // move bubble2 at 50% of scroll rate

        tierra1.style.top = 600 - scrolltop * .2 + 'px'; // move bubble1 at 20% of scroll rate
        tierra2.style.top = 600 - scrolltop * .4 + 'px'; // move bubble2 at 50% of scroll rate
        tierra3.style.top = 600 - scrolltop * .6 + 'px'; // move bubble2 at 50% of scroll rate

        //if (scrolltop < 550) {
        if (scrolltop < 601) {
            roca1.style.opacity = 0;
            roca2.style.opacity = 0;
            roca3.style.opacity = 0;
        }
        else {
            roca1.style.opacity = 1;
            roca2.style.opacity = 1;
            roca3.style.opacity = 1;

            var aux1 = 800 - scrolltop * .25;
            var aux2 = 800 - scrolltop * .3;
            var aux3 = 800 - scrolltop * .38;

            if(scrolltop >= 1000) {
                aux1 = 600 - scrolltop * .25;
                aux2 = 600 - scrolltop * .3;
                aux3 = 600 - scrolltop * .38;
                console.log(aux1);
                console.log(aux2);
            }

            roca1.style.top = aux1 + 'px'; // move bubble1 at 20% of scroll rate
            roca2.style.top = aux2 + 'px'; // move bubble2 at 50% of scroll rate
            roca3.style.top = aux3 + 'px'; // move bubble2 at 50% of scroll rate
            console.log(roca1.style.top);
        }
        if (scrolltop < 1201) {
            lava1.style.opacity = 0;
            lava2.style.opacity = 0;
            lava2.style.opacity = 0;
        }
        else {
            lava1.style.opacity = 1;
            lava2.style.opacity = 1;
            lava3.style.opacity = 1;

            lava1.style.top = 800 - scrolltop * .21 + 'px'; // move bubble1 at 20% of scroll rate
            lava2.style.top = 800 - scrolltop * .32 + 'px'; // move bubble2 at 50% of scroll rate
            lava3.style.top = 800 - scrolltop * .4 + 'px'; // move bubble2 at 50% of scroll rate
        }

        $scope.$apply();
        //lava1.style.top = -scrolltop * .2 + 'px'; // move bubble1 at 20% of scroll rate
        //lava2.style.top = -scrolltop * .4 + 'px'; // move bubble2 at 50% of scroll rate
        //lava3.style.top = -scrolltop * .6 + 'px'; // move bubble2 at 50% of scroll rate
    }

    window.addEventListener('scroll', function () { // on page scroll
        requestAnimationFrame(parallaxbubbles); // call parallaxbubbles() on next available screen paint
    }, false);


}
