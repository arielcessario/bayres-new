'use strict';

angular.module('bayres.main', [])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/main', {
            templateUrl: 'main/main.html',
            controller: 'MainController',
            data: {requiresLogin: false}
        });
    }])
    .controller('MainController', MainController);


MainController.$inject = ['$scope', '$interval', '$location', 'AcUtils', 'UserService',
    'ProductService', 'CartVars', 'LinksService',
    '$routeParams', 'BayresService', 'CartService'];

function MainController($scope, $interval, $location, AcUtils, UserService,
                        ProductService, CartVars, LinksService,
                        $routeParams, BayresService, CartService) {
    var vm = this;

    vm.productosEnOfertas = [];
    vm.productosMasVendidos = [];
    vm.productosDestacados = [];
    vm.productoList = [];
    vm.categorias = [];
    vm.subcategorias = [];
    vm.productos = [];
    vm.usuario = {};

    vm.productoResultado = '';
    vm.existenProductos = false;
    vm.showInfo = false;
    vm.intervalo;
    vm.slider_nro = 1;

    //METODOS
    vm.addProducto = addProducto;
    vm.showDetalle = showDetalle;
    vm.findProducto = findProducto;

    vm.intervalo = $interval(cambiarSlide, 7000);


    vm.productos = BayresService.productos;
    vm.search = BayresService.search;
    vm.productoResultado = (BayresService.productos.length > 0) ? 'Resultados' : 'No hay resultados';
    vm.existenProductos = (BayresService.productos.length > 0) ? true : false;


    CartVars.listen(function(){
        vm.productos = BayresService.productos;
        vm.search = BayresService.search;
        vm.productoResultado = (BayresService.productos.length > 0) ? 'Resultados' : 'No hay resultados';
        vm.existenProductos = (BayresService.productos.length > 0) ? true : false;
    });

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

    if(vm.search) {
        LinksService.selectedIncludeTop = 'main/productos.html';
        LinksService.selectedIncludeMiddle = '';
        LinksService.selectedIncludeBottom = '';
        console.log('++++++');
        CartVars.broadcast();
    }


    function productoEntityToUpdate(producto, categoria_id) {
        var miProducto = {
            producto_id: producto.producto_id,
            cantidad: producto.cantidad,
            en_oferta: producto.en_oferta,
            precio_unitario: producto.precio_unitario,
            carrito_id: producto.carrito_id,
            nombre: producto.nombre,
            carrito_detalle_id: producto.carrito_detalle_id,
            categoria_id: categoria_id
        };
        console.log(miProducto);

        return miProducto;
    }

    function productoEntityToAdd(producto, carrito_id) {
        var miProducto = {
            producto_id: producto.producto_id,
            cantidad: 1,
            en_oferta: producto.en_oferta,
            precio_unitario: producto.precios[0].precio,
            //carrito_id: carrito_id,
            nombre: producto.nombre,
            categoria_id: producto.categorias[0].categoria_id
        };

        if(carrito_id != -1)
            miProducto.carrito_id = carrito_id;

        console.log(miProducto);

        return miProducto;
    }

    function addProducto(producto) {
        console.log(producto);

        if (UserService.getFromToken() != false) {
            console.log('Estoy logueado');
            //var miProducto = productoEntity(producto, BayresService.carrito_id);
            if(BayresService.tieneCarrito) {

                console.log(BayresService.miCarrito);

                if(BayresService.carrito.length > 0){
                    var existe = false;
                    for(var i=0; i < BayresService.carrito.length; i++){
                        if(BayresService.carrito[i].producto_id == producto.producto_id){
                            BayresService.carrito[i].cantidad = BayresService.carrito[i].cantidad + 1;
                            BayresService.carrito[i].en_oferta = producto.en_oferta;
                            var miProducto = productoEntityToUpdate(BayresService.carrito[i], producto.categorias[0].categoria_id);

                            CartService.updateProductInCart(miProducto, function(data){
                                console.log(data);
                                if(data){
                                    BayresService.miCarrito.total = BayresService.carrito_total();
                                    CartService.update(BayresService.miCarrito, function(carritoActualizado){
                                        console.log(carritoActualizado);
                                    });
                                }
                            });
                            existe =  true;
                        }
                    }
                    if(!existe) {
                        var productArray = [];
                        productArray.push(productoEntityToAdd(producto, BayresService.miCarrito.carrito_id));
                        CartService.addToCart(BayresService.miCarrito.carrito_id, productArray, function(data){
                            console.log(data);
                            if(data != -1) {
                                BayresService.carrito.push(data[0]);
                                BayresService.miCarrito.total = BayresService.carrito_total();
                                console.log(BayresService.carrito);
                                console.log(BayresService.miCarrito);
                                CartService.update(BayresService.miCarrito, function(carritoActualizado){
                                    console.log(carritoActualizado);
                                    CartVars.broadcast();
                                });
                            }
                        });
                    }
                } else {
                    var productArray = [];
                    productArray.push(productoEntityToAdd(producto, BayresService.miCarrito.carrito_id));
                    CartService.addToCart(BayresService.miCarrito.carrito_id, productArray, function(data){
                        console.log(data);
                        if(data != -1) {
                            BayresService.carrito.push(data[0]);
                            BayresService.miCarrito.total = BayresService.carrito_total();
                            CartService.update(BayresService.miCarrito, function(carritoActualizado){
                                console.log(carritoActualizado);
                            });
                        }
                    });
                }
            } else {

            }
        } else {
            console.log('No Estoy logueado');
            var miProducto = productoEntityToAdd(producto, -1);

            actualizarMiCarrito(miProducto);
        }
    }

    function actualizarMiCarrito(producto) {
        var encontrado = false;
        var indexToDelete = 0;

        console.log(CartVars.carrito.length);

        if (CartVars.carrito.length > 0) {
            for(var i=0; i < CartVars.carrito.length; i++){
                if (CartVars.carrito[i].producto_id == producto.producto_id) {
                    CartVars.carrito[i].cantidad = CartVars.carrito[i].cantidad + producto.cantidad;
                    encontrado = true;
                }
            }
            if(!encontrado)
                CartVars.carrito.push(producto);
        } else {
            CartVars.carrito.push(producto);
        }

        console.log(CartVars.carrito);
        console.log('actualizarMiCarrito');

        LinksService.broadcast();
    }



    function updateProductInCart(producto){
        console.log(CartVars.carrito);
        var exist = false;
        var i = 0;
        for(var i=0; i < CartVars.carrito.length; i++) {
            if(CartVars.carrito[i].producto_id == producto.producto_id) {
                var productToUpdate = createProductToUpdate(producto, CartVars.carrito[i].cantidad + 1);

                CartService.updateProductInCart(productToUpdate, function(data){
                    console.log(data);
                    if(data != -1) {
                        console.log('Update Ok');
                        exist = true;
                    }
                });
            }
        }
        if(!exist) {
            console.log('no existe');
            addToCart(producto)
        }
    }

    function addToCart(producto) {
        var productToUpdate = createProductToUpdate(producto, 1);

        CartService.addToCart(BayresService.carrito_id, productToUpdate, function(data){
            console.log(data);
            if(data != -1) {
                console.log('Insert Ok');
            }
        });
    }

    function createProductToUpdate(producto, cantidad) {
        var productToUpdate = {
            producto_id: producto.producto_id,
            cantidad: cantidad,
            en_oferta: producto.en_oferta,
            precio_unitario: producto.precios[0].precio,
            carrito_id: BayresService.carrito_id,
            nombre: producto.nombre,
            categoria_id: producto.categorias[0].categoria_id
        };

        return productToUpdate;
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

        BayresService.search = vm.search;
        console.log('------');
        CartVars.broadcast();
    }


}
