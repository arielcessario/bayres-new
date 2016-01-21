'use strict';

angular.module('bayres.main', [])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/main', {
            templateUrl: 'main/ofertas.html',
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


    LinksService.listen(function(){
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

        LinksService.broadcast();
    }

    function productoEntityToUpdate(producto) {
        var miProducto = {
            producto_id: producto.producto_id,
            cantidad: producto.cantidad,
            en_oferta: producto.en_oferta,
            precio_unitario: producto.precio_unitario,
            carrito_id: producto.carrito_id,
            nombre: producto.nombre,
            carrito_detalle_id: producto.carrito_detalle_id
        };

        return miProducto;
    }

    function productoEntityToAdd(producto, carrito_id) {
        var miProducto = {
            producto_id: producto.producto_id,
            cantidad: 1,
            en_oferta: producto.en_oferta,
            precio_unitario: producto.precios[0].precio,
            nombre: producto.nombre
        };

        if(carrito_id != -1)
            miProducto.carrito_id = carrito_id;

        return miProducto;
    }

    function addProducto(producto) {

        if (UserService.getFromToken() != false) {
            if(BayresService.tieneCarrito) {
                if(CartVars.carrito.length > 0){

                    var existe = false;
                    for(var i=0; i < CartVars.carrito.length; i++){
                        if(CartVars.carrito[i].producto_id == producto.producto_id){
                            CartVars.carrito[i].cantidad = CartVars.carrito[i].cantidad + 1;
                            CartVars.carrito[i].en_oferta = producto.en_oferta;
                            CartVars.carrito[i].nombre = producto.nombre;

                            var miProducto = productoEntityToUpdate(CartVars.carrito[i]);

                            CartService.updateProductInCart(miProducto, function(data){
                                if(data){
                                    BayresService.miCarrito.total = CartVars.carrito_total();
                                    CartService.update(BayresService.miCarrito, function(carritoActualizado){
                                        if(carritoActualizado) {
                                            BayresService.messageConfirm = 'Producto agregado al carrito';
                                            BayresService.showMessageConfirm = true;
                                            CartVars.broadcast();
                                        } else {
                                            BayresService.messageConfirm = 'Error agregando el producto';
                                            BayresService.showMessageConfirm = true;
                                        }
                                    });
                                } else {
                                    BayresService.messageConfirm = 'Error agregando el producto';
                                    BayresService.showMessageConfirm = true;
                                }
                            });
                            existe = true;
                        }
                    }
                    if(!existe) {
                        var productArray = [];
                        productArray.push(productoEntityToAdd(producto, BayresService.miCarrito.carrito_id));
                        CartService.addToCart(BayresService.miCarrito.carrito_id, productArray, function(data){
                            if(data != -1) {
                                for(var i=0; i < productArray.length; i++) {
                                    for(var j=0; j < CartVars.carrito.length; j++){
                                        if(CartVars.carrito[j].producto_id == productArray[i].producto_id){
                                            if(CartVars.carrito[j].nombre === undefined)
                                                CartVars.carrito[j].nombre = productArray[i].nombre;
                                        }
                                    }
                                }
                                BayresService.miCarrito.total = CartVars.carrito_total();
                                CartService.update(BayresService.miCarrito, function(carritoActualizado){
                                    if(carritoActualizado) {
                                        BayresService.messageConfirm = 'Producto agregado al carrito';
                                        BayresService.showMessageConfirm = true;
                                        CartVars.broadcast();
                                    } else {
                                        BayresService.messageConfirm = 'Error agregando el producto';
                                        BayresService.showMessageConfirm = true;
                                    }
                                });
                            }
                        });
                    }
                } else {
                    var productArray = [];
                    productArray.push(productoEntityToAdd(producto, BayresService.miCarrito.carrito_id));
                    CartService.addToCart(BayresService.miCarrito.carrito_id, productArray, function(data){
                        if(data != -1) {
                            for(var i=0; i < productArray.length; i++) {
                                for(var j=0; j < CartVars.carrito.length; j++){
                                    if(CartVars.carrito[j].producto_id == productArray[i].producto_id){
                                        if(CartVars.carrito[j].nombre === undefined)
                                            CartVars.carrito[j].nombre = productArray[i].nombre;
                                    }
                                }
                            }

                            BayresService.miCarrito.total = CartVars.carrito_total();
                            CartService.update(BayresService.miCarrito, function(carritoActualizado){
                                if(carritoActualizado) {
                                    BayresService.messageConfirm = 'Producto agregado al carrito';
                                    BayresService.showMessageConfirm = true;
                                    CartVars.broadcast();
                                } else {
                                    BayresService.messageConfirm = 'Error agregando el producto';
                                    BayresService.showMessageConfirm = true;
                                }
                            });
                        }
                    });
                }
            } else {
                var productArray = [];
                productArray.push(productoEntityToAdd(producto, BayresService.miCarrito.carrito_id));
                var carrito = {'usuario_id': BayresService.usuario.id, 'total': 0, 'status': 0};

                CartService.create(carrito, function(carritoCreado) {
                    if (carritoCreado != -1) {
                        BayresService.tieneCarrito = true;
                        BayresService.miCarrito = carritoCreado;

                        CartService.addToCart(carritoCreado.carrito_id, productArray, function(data){
                            if(data != -1) {
                                for(var i=0; i < productArray.length; i++) {
                                    for(var j=0; j < CartVars.carrito.length; j++){
                                        if(CartVars.carrito[j].producto_id == productArray[i].producto_id){
                                            if(CartVars.carrito[j].nombre === undefined)
                                                CartVars.carrito[j].nombre = productArray[i].nombre;
                                        }
                                    }
                                }
                                carritoCreado.total = CartVars.carrito_total();
                                CartService.update(carritoCreado, function(carritoUpdate){
                                    if(carritoUpdate) {
                                        BayresService.messageConfirm = 'Producto agregado al carrito';
                                        BayresService.showMessageConfirm = true;
                                    } else {
                                        BayresService.messageConfirm = 'Error agregando el producto';
                                        BayresService.showMessageConfirm = true;
                                    }
                                });
                            } else {
                                console.log('AddToCart Error');
                            }
                        });
                    }
                });
            }
        } else {
            var miProducto = productoEntityToAdd(producto, -1);

            actualizarMiCarrito(miProducto);
        }
    }

    function actualizarMiCarrito(producto) {
        var encontrado = false;

        if (BayresService.carrito.length > 0) {
            for(var i=0; i < BayresService.carrito.length; i++){
                if (BayresService.carrito[i].producto_id == producto.producto_id) {
                    BayresService.carrito[i].cantidad = BayresService.carrito[i].cantidad + producto.cantidad;
                    encontrado = true;
                }
            }
            if(!encontrado)
                BayresService.carrito.push(producto);
        } else {
            BayresService.carrito.push(producto);
        }

        BayresService.messageConfirm = 'Producto agregado al carrito';
        BayresService.showMessageConfirm = true;

        LinksService.broadcast();
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
        LinksService.productId = id;
        $location.path('/detalle');
        LinksService.selectedIncludeTop = 'detalle/detalle.html';

        BayresService.search = vm.search;
        CartVars.broadcast();
    }


}
