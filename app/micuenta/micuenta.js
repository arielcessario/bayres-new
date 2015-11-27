'use strict';

angular.module('bayres.micuenta', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/micuenta', {
            templateUrl: 'micuenta/micuenta.html',
            controller: 'MiCuentaController',
            data: {requiresLogin: true}
        });
    }])
    .controller('MiCuentaController', MiCuentaController);

MiCuentaController.$inject = ['$location', 'UserService', 'CartVars', 'CartService', 'AcUtils',
    'CarritoService', 'BayresService', 'UserVars'];

function MiCuentaController($location, UserService, CartVars, CartService, AcUtils,
                            CarritoService, BayresService, UserVars) {
    var vm = this;

    vm.userForm = {
        'usuario_id': -1,
        'nombre': '',
        'apellido': '',
        'mail': '',
        'nacionalidad_id': 0,
        'tipo_doc': 0,
        'nro_doc': '',
        'comentarios': '',
        'marcado': '',
        'telefono': '',
        'fecha_nacimiento': '',
        'profesion_id': 0,
        'saldo': '',
        'rol_id': 0,
        'news_letter': 0,
        'password': '',
        'calle': ''
    };
    vm.passwordForm = {
        'usuario_id': -1,
        'password': '',
        'password_repeat': ''
    }
    vm.dirForm = {
        'usuario_id': 0,
        'calle': '',
        'nro': 0,
        'piso': 0,
        'puerta': '',
        'ciudad_id': 0
    };
    vm.messageResponse = {
        'message': '',
        'userError': false,
        'pwdError': false,
        'carritoError': false,
        'success': false
    }
    vm.historico_pedidos = [];
    vm.productos = [];
    vm.carrito = {};
    vm.repeatMail = '';
    vm.message = '';
    vm.showCarritoDetalle = false;

    vm.home = home;
    vm.updateUser = updateUser;
    vm.updatePwd = updatePwd;
    vm.cancelCarrito = cancelCarrito;
    vm.repeatCarrito = repeatCarrito;
    vm.addProducto = addProducto;
    vm.getCarritoSelected = getCarritoSelected;


    if (UserService.getFromToken() != false) {
        console.log(UserService.getFromToken().data);
        vm.userForm.usuario_id = UserService.getFromToken().data.id;
        vm.userForm.apellido = UserService.getFromToken().data.apellido;
        vm.userForm.nombre = UserService.getFromToken().data.nombre;
        vm.userForm.mail = UserService.getFromToken().data.mail;
        vm.userForm.news_letter = UserService.getFromToken().data.news_letter;

        UserVars.clearCache = true;
        UserService.getById(UserService.getFromToken().data.id, function(data){
            if(data != -1) {
                console.log(data);
                vm.userForm.calle = data.direcciones[0].calle;
                //vm.userForm.nro = data.direcciones[0].nro;
            } else {
                console.log('Error recuperando el usuario');
            }
        });

        vm.passwordForm.usuario_id = UserService.getFromToken().data.id;

        getHistoricoDePedidos(UserService.getFromToken().data.id);
    }

    function getHistoricoDePedidos(usuario_id) {
        console.log(usuario_id);
        CartVars.clearCache = true;
        var tieneCarrito = false;
        CartService.getByParams("status","1","true",usuario_id, function(data){
            console.log(data);
            if(data != -1) {
                tieneCarrito = true;
                vm.historico_pedidos = data;
            }
            var select_one = { pedido_id:-1, fecha:'Seleccione un pedido' };
            vm.historico_pedidos.unshift(select_one);
            vm.carrito = vm.historico_pedidos[0];
        });
        if(!tieneCarrito) {
            var select_one = { pedido_id:-1, fecha:'Seleccione un pedido' };
            vm.historico_pedidos.unshift(select_one);
            vm.carrito = vm.historico_pedidos[0];
        }
    }

    function getCarritoSelected(carrito) {
        console.log(carrito);
        if(carrito != null) {
            if(carrito.pedido_id == -1)
                vm.showCarritoDetalle = false;
            else
                vm.showCarritoDetalle = true;
            vm.carrito = carrito;
        }
        setMessageResponse(false, false, false, false, '');
    }

    function productoEntityToAdd(producto, carrito_id) {
        var miProducto = {
            producto_id: producto.producto_id,
            cantidad: producto.cantidad,
            en_oferta: producto.en_oferta,
            precio_unitario: producto.precio_unitario,
            nombre: producto.nombre
        };

        if(carrito_id != -1)
            miProducto.carrito_id = carrito_id;

        console.log(miProducto);

        return miProducto;
    }

    function addProducto(producto) {
        console.log(producto);

        if(BayresService.tieneCarrito) {
            if(CartVars.carrito.length > 0) {
                var existe = false;
                for(var i=0; i < CartVars.carrito.length; i++) {
                    if(CartVars.carrito[i].producto_id == producto.producto_id) {
                        CartVars.carrito[i].cantidad = CartVars.carrito[i].cantidad + producto.cantidad;
                        existe = true;
                        CartService.updateProductInCart(CartVars.carrito[i], function(data){
                            if(data != -1) {
                                console.log('Update Ok');
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
                            } else {
                                console.log('Update Error');
                            }
                        });
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
                                    CartVars.broadcast();
                                } else {
                                    console.log('Carrito update error');
                                }
                            });
                        }
                    });
                }

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
    }

    function validateForm() {
        if(vm.userForm.nombre.trim().length > 0 && vm.userForm.apellido.trim().length > 0
            && vm.userForm.fecha_nacimiento.trim().length > 0 && vm.userForm.telefono.trim().length > 0
            && vm.userForm.mail.trim().length > 0 && vm.userForm.password.trim().length > 0
            && vm.repeatMail.trim().length > 0)
            return true;

        return false;
    }

    function updateUser() {
        if(validateForm()) {
            UserService.update(vm.userForm, function (data) {
                console.log(data);
                if(data != -1) {
                    setMessageResponse(true, false, false, false, 'Datos actualizados');
                } else {
                    setMessageResponse(false, true, false, false, 'Error actualizando usuario');
                }
            });
        } else {
            setMessageResponse(false, true, false, false, 'Complete todos los campos');
        }
    }

    function updatePwd() {
        if(vm.passwordForm.password.trim().length > 0 && vm.passwordForm.password_repeat.trim().length > 0) {
            UserService.changePassword(vm.passwordForm.usuario_id, vm.passwordForm.password, vm.passwordForm.password_repeat, function (data) {
                console.log(data);
                if(data != -1) {
                    setMessageResponse(true, false, false, false, 'La contrase�a se actualizo');
                } else {
                    setMessageResponse(false, false, true, false, 'Error actualizando contrase�a');
                }
            });
        } else {
            setMessageResponse(false, false, true, false, 'Ingrese las contrase�as');
        }
    }

    /**
     *
     * @param success
     * @param userError
     * @param pwdError
     * @param carritoError
     * @param message
     */
    function setMessageResponse(success, userError, pwdError, carritoError, message) {
        vm.messageResponse.success = success;
        vm.messageResponse.userError = userError;
        vm.messageResponse.pwdError = pwdError;
        vm.messageResponse.carritoError = carritoError;
        vm.messageResponse.message = message;
    }

    function cancelCarrito(carrito) {
        if(carrito.pedido_id != undefined) {
            setMessageResponse(false, false, false, true, 'Seleccione un pedido');
        } else {
            if (carrito.status == 3) {
                setMessageResponse(false, false, false, true, 'El Pedido ya esta confirmado. No se puede cancelar');
            }
            else {
                var result = confirm('�Esta seguro que desea Cancelar el Pedido ' + carrito.carrito_id + '?');
                if (result) {
                    carrito.status = 4;
                    CartService.update(carrito, function(data){
                        console.log(data);
                        if(data != -1){
                            var usuario = UserService.getFromToken().data;
                            console.log(usuario);

                            var usuarioNombre = usuario.apellido + ', ' + usuario.nombre;

                            CarritoService.sendMailCancelarCarrito(usuarioNombre, usuario.mail, carrito, function(data){
                                if(data) {
                                    setMessageResponse(true, false, false, false, 'Se envio el mail');
                                } else {
                                    setMessageResponse(false, false, false, true, 'Error enviando el mail');
                                }
                            });

                            getHistoricoDePedidos(usuario.id);
                            var carritoAux = {pedido_id: -1};
                            getCarritoSelected(carritoAux);
                            //getCarritoSelected(null);
                            setMessageResponse(true, false, false, false, 'Su pedido fue cancelado satisfactoriamente');
                        } else {
                            setMessageResponse(false, false, false, true, 'Error cancelando el pedido');
                        }
                    });
                }
            }
        }
    }

    function repeatCarrito(carrito) {
        console.log(carrito);

        if(carrito === undefined) {
            setMessageResponse(false, false, false, true, 'Seleccione un pedido');
        } else {
            if(carrito.carrito_id == -1) {
                setMessageResponse(false, false, false, true, 'Seleccione un pedido');
            } else {
                if(BayresService.tieneCarrito) {
                    if(CartVars.carrito.length > 0) {
                        var carritoToDelete = [];
                        for(var i=0; i < carrito.productos.length; i++){
                            carritoToDelete.push(carrito.productos[i].carrito_detalle_id);
                        }

                        var existe = false;
                        for(var i=0; i < CartVars.carrito.length; i++) {
                            if(CartVars.carrito[i].producto_id == producto.producto_id) {
                                CartVars.carrito[i].cantidad = CartVars.carrito[i].cantidad + producto.cantidad;
                                existe = true;
                                CartService.updateProductInCart(CartVars.carrito[i], function(data){
                                    if(data != -1) {
                                        console.log('Update Ok');
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
                                    } else {
                                        console.log('Update Error');
                                    }
                                });
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
                        for(var i=0; i < carrito.productos.length; i++) {
                            productArray.push(productoEntityToAdd(carrito.productos[i], BayresService.miCarrito.carrito_id));
                        }

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
                                    } else {
                                        console.log('Error');
                                    }
                                });
                            } else {
                                console.log('AddToCart Error');
                            }
                        });
                    }
                } else {
                    var productArray = [];
                    for(var i=0; i < carrito.productos.length; i++) {
                        productArray.push(productoEntityToAdd(carrito.productos[i], BayresService.miCarrito.carrito_id));
                    }
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
            }
        }
    }

    function home() {
        $location.path('/main');
    }
}