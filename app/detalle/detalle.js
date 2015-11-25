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


DetalleController.$inject = ['$routeParams', '$location', 'AcUtils', 'ProductService', 'CartVars',
    'LinksService', 'BayresService', 'UserService', 'CartService'];

function DetalleController($routeParams, $location, AcUtils, ProductService, CartVars,
                           LinksService, BayresService, UserService, CartService) {
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

    //METODOS
    vm.close = close;
    vm.addProducto = addProducto;

    vm.search = BayresService.search;

    CartVars.listen(function(){
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

        CartVars.broadcast();
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
            //categoria_id: categoria_id
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
            nombre: producto.nombre
        };

        if(carrito_id != -1)
            miProducto.carrito_id = carrito_id;
        //if(producto.categorias.length > 0)
        //    categoria_id: producto.categorias[0].categoria_id

        console.log(miProducto);

        return miProducto;
    }

    function addProducto(producto) {
        if (UserService.getFromToken() != false) {
            console.log('Estoy logueado');
            //var miProducto = productoEntity(producto, BayresService.carrito_id);
            if(BayresService.tieneCarrito) {

                console.log(BayresService.miCarrito);

                if(CartVars.carrito.length > 0){
                    console.log(CartVars.carrito);
                    //console.log(BayresService.carrito);

                    var existe = false;
                    for(var i=0; i < CartVars.carrito.length; i++){
                        if(CartVars.carrito[i].producto_id == producto.producto_id){
                            //CartVars.carrito[i].cantidad = BayresService.carrito[i].cantidad + 1;
                            CartVars.carrito[i].cantidad = CartVars.carrito[i].cantidad + 1;
                            CartVars.carrito[i].en_oferta = producto.en_oferta;
                            CartVars.carrito[i].nombre = producto.nombre;
                            //var categoria_id = (producto.categorias.length > 0) ? producto.categorias[0].categoria_id : -1;
                            //var miProducto = productoEntityToUpdate(CartVars.carrito[i], categoria_id);
                            var miProducto = productoEntityToUpdate(CartVars.carrito[i]);

                            CartService.updateProductInCart(miProducto, function(data){
                                console.log(data);
                                if(data){
                                    BayresService.miCarrito.total = CartVars.carrito_total();
                                    CartService.update(BayresService.miCarrito, function(carritoActualizado){
                                        console.log(carritoActualizado);
                                        if(carritoActualizado) {
                                            console.log('Carrito update ok');
                                            CartVars.broadcast();
                                        } else {
                                            console.log('Carrito update error');
                                        }
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
                                for(var i=0; i < productArray.length; i++) {
                                    for(var j=0; j < CartVars.carrito.length; j++){
                                        if(CartVars.carrito[j].producto_id == productArray[i].producto_id){
                                            if(CartVars.carrito[j].nombre === undefined)
                                                CartVars.carrito[j].nombre = productArray[i].nombre;
                                        }
                                    }
                                }
                                //BayresService.carrito.push(data[0]);
                                BayresService.miCarrito.total = CartVars.carrito_total();
                                console.log(CartVars.carrito);
                                console.log(BayresService.miCarrito);
                                CartService.update(BayresService.miCarrito, function(carritoActualizado){
                                    console.log(carritoActualizado);
                                    if(carritoActualizado) {
                                        console.log('Carrito update ok');
                                        CartVars.broadcast();
                                    } else {
                                        console.log('Carrito update error');
                                    }
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
                            for(var i=0; i < productArray.length; i++) {
                                for(var j=0; j < CartVars.carrito.length; j++){
                                    if(CartVars.carrito[j].producto_id == productArray[i].producto_id){
                                        if(CartVars.carrito[j].nombre === undefined)
                                            CartVars.carrito[j].nombre = productArray[i].nombre;
                                    }
                                }
                            }
                            CartVars.carrito.push(data[0]);
                            BayresService.miCarrito.total = CartVars.carrito_total();
                            CartService.update(BayresService.miCarrito, function(carritoActualizado){
                                if(carritoActualizado) {
                                    console.log('Carrito update ok');
                                    CartVars.broadcast();
                                } else {
                                    console.log('Carrito update error');
                                }
                            });
                        }
                    });
                }
            } else {
                var productArray = [];
                productArray.push(productoEntityToAdd(producto, BayresService.miCarrito.carrito_id));
                var carrito = {'usuario_id': BayresService.usuario.id, 'total': 0, 'status': 0};
                console.log(carrito);
                CartService.create(carrito, function(carrito_id) {
                    if (carrito_id > 0) {
                        BayresService.tieneCarrito = true;
                        BayresService.miCarrito = carrito;
                        BayresService.miCarrito.carrito_id = carrito_id;

                        console.log(BayresService.miCarrito);

                        CartService.addToCart(carrito_id, productArray, function(data){
                            console.log(data);
                            if(data != -1) {
                                console.log('AddToCart Ok');
                                for(var i=0; i < productArray.length; i++) {
                                    for(var j=0; j < CartVars.carrito.length; j++){
                                        if(CartVars.carrito[j].producto_id == productArray[i].producto_id){
                                            if(CartVars.carrito[j].nombre === undefined)
                                                CartVars.carrito[j].nombre = productArray[i].nombre;
                                        }
                                    }
                                }
                                carrito.total = CartVars.carrito_total();
                                CartService.update(carrito, function(carritoUpdate){
                                    if(carritoUpdate) {
                                        console.log('Ok');
                                    } else {
                                        console.log('Error');
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
            console.log('No Estoy logueado');
            var miProducto = productoEntityToAdd(producto, -1);

            actualizarMiCarrito(miProducto);
        }
        /*
        var miProducto = {
            producto_id: producto.producto_id,
            cantidad: 1,
            en_oferta: 1,
            precio_unitario: producto.precios[0].precio,
            carrito_id: -1,
            nombre: producto.nombre
        };

        actualizarMiCarrito(miProducto);
        */
    }

    function actualizarMiCarrito(producto) {
        var encontrado = false;
        var indexToDelete = 0;

        //console.log(CartVars.carrito.length);
        console.log(BayresService.carrito.length);

        if (BayresService.carrito.length > 0) {
            for(var i=0; i < BayresService.carrito.length; i++){
                if (BayresService.carrito[i].producto_id == producto.producto_id) {
                    BayresService.carrito[i].cantidad = BayresService.carrito[i].cantidad + BayresService.cantidad;
                    encontrado = true;
                }
            }
            if(!encontrado)
                BayresService.carrito.push(producto);
        } else {
            BayresService.carrito.push(producto);
        }

        console.log(BayresService.carrito);
        console.log('actualizarMiCarrito');

        LinksService.broadcast();
    }

    /*
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

        CartVars.broadcast();
    }
    */

}
