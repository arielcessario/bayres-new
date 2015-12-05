(function () {
    'use strict';

    angular.module('bayres.detalle', [])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/detalle', {
                templateUrl: 'detalle/detalle.html',
                controller: 'DetalleController',
                data: {requiresLogin: false}
            });
        }])
        .controller('DetalleController', DetalleController);


    DetalleController.$inject = ['$scope','$location', 'AcUtils', 'ProductService', 'CartVars',
        'LinksService', 'BayresService', 'UserService', 'CartService'];

    function DetalleController($scope, $location, AcUtils, ProductService, CartVars,
                               LinksService, BayresService, UserService, CartService) {
        var vm = this;
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
        var id = LinksService.productId;

        CartVars.listen(function(){
            vm.search = BayresService.search;
            id = LinksService.productId;
            console.log(id);

            ProductService.getByParams("producto_id", '' + id, "true", function (data) {
                vm.producto = data[0];
            });
        });

        ProductService.getByParams("producto_id", '' + id, "true", function (data) {
            vm.producto = data[0];
        });

        function close() {
            $location.path('/main');
            LinksService.selectedIncludeTop = (vm.search) ? 'main/productos.html' : 'main/ofertas.html';
            LinksService.selectedIncludeMiddle = (vm.search) ? '' : 'main/destacados.html';
            LinksService.selectedIncludeBottom = (vm.search) ? '' : 'main/masvendidos.html';
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
            console.log(miProducto);
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
                console.log('Estoy logueado');
                if(BayresService.tieneCarrito) {

                    console.log(BayresService.miCarrito);

                    if(CartVars.carrito.length > 0){
                        console.log(CartVars.carrito);

                        var existe = false;
                        for(var i=0; i < CartVars.carrito.length; i++){
                            if(CartVars.carrito[i].producto_id == producto.producto_id){
                                CartVars.carrito[i].cantidad = CartVars.carrito[i].cantidad + 1;
                                CartVars.carrito[i].en_oferta = producto.en_oferta;
                                CartVars.carrito[i].nombre = producto.nombre;

                                var miProducto = productoEntityToUpdate(CartVars.carrito[i]);

                                CartService.updateProductInCart(miProducto, function(data){
                                    console.log(data);
                                    if(data){
                                        BayresService.miCarrito.total = CartVars.carrito_total();
                                        CartService.update(BayresService.miCarrito, function(carritoActualizado){
                                            console.log(carritoActualizado);
                                            if(carritoActualizado) {
                                                console.log('Carrito update ok');
                                                BayresService.messageConfirm = 'Se agrego el producto';
                                                BayresService.showMessageConfirm = true;
                                                CartVars.broadcast();
                                            } else {
                                                BayresService.messageConfirm = 'Error agregando el producto';
                                                BayresService.showMessageConfirm = true;
                                                console.log('Carrito update error');
                                            }
                                        });
                                    } else {
                                        BayresService.messageConfirm = 'Error agregando el producto';
                                        BayresService.showMessageConfirm = true;
                                        console.log('Update Error');
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
                                    BayresService.miCarrito.total = CartVars.carrito_total();
                                    console.log(CartVars.carrito);
                                    console.log(BayresService.miCarrito);
                                    CartService.update(BayresService.miCarrito, function(carritoActualizado){
                                        console.log(carritoActualizado);
                                        if(carritoActualizado) {
                                            console.log('Carrito update ok');
                                            BayresService.messageConfirm = 'Se agrego el producto';
                                            BayresService.showMessageConfirm = true;
                                            CartVars.broadcast();
                                        } else {
                                            BayresService.messageConfirm = 'Error agregando el producto';
                                            BayresService.showMessageConfirm = true;
                                            console.log('Carrito update error');
                                        }
                                    });
                                }
                            });
                        }
                    } else {
                        console.log('no tiene carrito');
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

                                BayresService.miCarrito.total = CartVars.carrito_total();
                                CartService.update(BayresService.miCarrito, function(carritoActualizado){
                                    if(carritoActualizado) {
                                        console.log('Carrito update ok');
                                        BayresService.messageConfirm = 'Se agrego el producto';
                                        BayresService.showMessageConfirm = true;
                                        CartVars.broadcast();
                                    } else {
                                        BayresService.messageConfirm = 'Error agregando el producto';
                                        BayresService.showMessageConfirm = true;
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

                    CartService.create(carrito, function(carritoCreado) {
                        if (carritoCreado != -1) {
                            BayresService.tieneCarrito = true;
                            BayresService.miCarrito = carritoCreado;

                            console.log(BayresService.miCarrito);

                            CartService.addToCart(carritoCreado.carrito_id, productArray, function(data){
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
                                    carritoCreado.total = CartVars.carrito_total();
                                    CartService.update(carritoCreado, function(carritoUpdate){
                                        if(carritoUpdate) {
                                            console.log('Ok');
                                            BayresService.messageConfirm = 'Se agrego el producto';
                                            BayresService.showMessageConfirm = true;
                                        } else {
                                            BayresService.messageConfirm = 'Error agregando el producto';
                                            BayresService.showMessageConfirm = true;
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
        }

        function actualizarMiCarrito(producto) {
            var encontrado = false;
            console.log(BayresService.carrito.length);

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

            console.log(BayresService.carrito);
            console.log('actualizarMiCarrito');

            LinksService.broadcast();
        }
    }

})();

