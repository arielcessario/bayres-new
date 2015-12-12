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
    'CarritoService', 'BayresService', 'UserVars', 'LinksService'];

function MiCuentaController($location, UserService, CartVars, CartService, AcUtils,
                            CarritoService, BayresService, UserVars, LinksService) {
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


    CartVars.listen(function(){
        vm.userForm.news_letter = (vm.userForm.news_letter == 1) ? true : false;
    });

    LinksService.listen(function(){
        vm.userForm.news_letter = true;
    });

    if (UserService.getFromToken() != false) {
        //console.log(UserService.getFromToken().data);
        vm.userForm.usuario_id = UserService.getFromToken().data.id;

        UserVars.clearCache = true;
        UserService.getById(UserService.getFromToken().data.id, function(data){
            if(data != -1) {
                vm.userForm.apellido = data.apellido;
                vm.userForm.nombre = data.nombre;
                vm.userForm.mail = data.mail;
                vm.userForm.news_letter = (data.news_letter == 1) ? true : false;
                vm.userForm.fecha_nacimiento = data.fecha_nacimiento;
                vm.userForm.rol_id = data.rol_id;
                vm.userForm.saldo = data.saldo;
                vm.userForm.telefono = data.telefono;
                vm.userForm.tipo_doc = data.tipo_doc;
                vm.userForm.nro_doc = data.nro_doc;

                vm.userForm.calle = data.direcciones[0].calle;
                vm.userForm.nro = data.direcciones[0].nro;

                console.log(vm.userForm);
            } else {
                console.log('Error recuperando el usuario');
            }
        });

        vm.passwordForm.usuario_id = UserService.getFromToken().data.id;

        getHistoricoDePedidos(UserService.getFromToken().data.id);
    }

    function getHistoricoDePedidos(usuario_id) {
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
        console.log(vm.historico_pedidos);
        console.log(vm.carrito);
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

        return miProducto;
    }

    function productoEntityToAdd(producto, carrito_id) {
        var miProducto = {
            producto_id: producto.producto_id,
            cantidad: (producto.cantidad == 0) ? 1 : producto.cantidad,
            en_oferta: producto.en_oferta,
            precio_unitario: producto.precio_unitario,
            nombre: producto.nombre
        };

        if(carrito_id != -1)
            miProducto.carrito_id = carrito_id;

        return miProducto;
    }

    function addProducto(producto) {
        console.log(producto);

        if(BayresService.tieneCarrito) {
            if(CartVars.carrito.length > 0) {
                console.log(CartVars.carrito);

                var existe = false;
                for(var i=0; i < CartVars.carrito.length; i++) {
                    if(CartVars.carrito[i].producto_id == producto.producto_id) {
                        CartVars.carrito[i].cantidad = CartVars.carrito[i].cantidad + ((producto.cantidad == 0) ? 1 : producto.cantidad);
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
                        existe = true;
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
    }

    function validateForm() {
        if(vm.userForm.nombre.trim().length > 0 && vm.userForm.apellido.trim().length > 0
            && vm.userForm.mail.trim().length > 0 && vm.userForm.calle.trim().length > 0)
            return true;

        return false;
    }

    function updateUser() {
        if(validateForm()) {
            var mailOld = UserService.getFromToken().data.mail;
            var mailNew = vm.userForm.mail.trim();
            console.log(mailOld);
            console.log(mailNew);
            if(mailOld !== mailNew) {
                console.log('verifico el mail');
                UserService.userExist(vm.userForm.mail.trim(), function(existe){
                    console.log(existe);
                    if(existe == -1) {
                        vm.userForm.news_letter = (vm.userForm.news_letter) ? 1 : 0;
                        UserService.update(vm.userForm, function (data) {
                            console.log(data);
                            if(data != -1) {
                                UserService.getById(UserService.getFromToken().data.id, function(data){
                                    BayresService.usuario.nombre = data.nombre;
                                    BayresService.usuario.apellido = data.apellido;
                                    BayresService.usuario.mail = data.mail;

                                    setMessageResponse(true, false, false, 'Datos actualizados');
                                    $location.path('/main');
                                    LinksService.selectedIncludeTop = 'main/ofertas.html';
                                    //LinksService.broadcast();
                                });
                            } else {
                                setMessageResponse(true, false, false, 'Error actualizando usuario');
                            }
                        });
                    } else {
                        setMessageResponse(true, false, false, 'El mail ingresado ya existe');
                    }
                });
            } else {
                UserService.update(vm.userForm, function (data) {
                    console.log(data);
                    if(data != -1) {
                        UserService.getById(UserService.getFromToken().data.id, function(data){
                            BayresService.usuario.nombre = data.nombre;
                            BayresService.usuario.apellido = data.apellido;
                            BayresService.usuario.mail = data.mail;

                            setMessageResponse(true, false, false, 'Datos actualizados');
                            $location.path('/main');
                            LinksService.selectedIncludeTop = 'main/ofertas.html';
                            //LinksService.broadcast();
                        });
                    } else {
                        setMessageResponse(true, false, false, 'Error actualizando usuario');
                    }
                });
            }
        } else {
            setMessageResponse(true, false, false, 'Complete todos los campos');
        }
    }

    function updatePwd() {
        if(vm.passwordForm.password.trim().length > 0 && vm.passwordForm.password_repeat.trim().length > 0) {
            UserService.changePassword(vm.passwordForm.usuario_id, vm.passwordForm.password, vm.passwordForm.password_repeat, function (data) {
                console.log(data);
                if(data != -1) {
                    vm.passwordForm.password = '';
                    vm.passwordForm.password_repeat = '';

                    UserService.logout(function (data) {
                        console.log('logout');
                        $location.path('/main');
                        LinksService.selectedIncludeTop = 'main/ofertas.html';
                        BayresService.usuario = null;
                        BayresService.isLogged = false;
                        BayresService.miCarrito = {};
                        BayresService.carrito = [];
                        CartVars.carrtio = [];

                        CartVars.broadcast();
                    });

                    setMessageResponse(false, true, false, 'La contrase�a se actualizo');
                } else {
                    setMessageResponse(false, true, false, 'Error actualizando contrase�a');
                }
            });
        } else {
            setMessageResponse(false, true, false, 'Ingrese las contrase�as');
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
    function setMessageResponse(userError, pwdError, carritoError, message) {
        vm.messageResponse.userMsg = userError;
        vm.messageResponse.pwdMsg = pwdError;
        vm.messageResponse.carritoMsg = carritoError;
        vm.messageResponse.message = message;
    }

    function cancelCarrito(carrito) {
        if(carrito.pedido_id != undefined) {
            setMessageResponse(false, false, true, 'Seleccione un pedido');
        } else {
            if (carrito.status == 3) {
                setMessageResponse(false, false, true, 'El Pedido ya esta confirmado. No se puede cancelar');
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
                                    setMessageResponse(false, false, true, 'Se envio el mail');
                                } else {
                                    setMessageResponse(false, false, true, 'Error enviando el mail');
                                }
                            });

                            getHistoricoDePedidos(usuario.id);
                            var carritoAux = {pedido_id: -1};
                            getCarritoSelected(carritoAux);
                            //getCarritoSelected(null);
                            setMessageResponse(false, false, true, 'Su pedido fue cancelado satisfactoriamente');
                        } else {
                            setMessageResponse(false, false, true, 'Error cancelando el pedido');
                        }
                    });
                }
            }
        }
    }

    function repeatCarrito(carrito) {
        console.log(carrito);

        if(carrito === undefined) {
            setMessageResponse(false, false, true, 'Seleccione un pedido');
        } else {
            if(carrito.carrito_id == -1) {
                setMessageResponse(false, false, true, 'Seleccione un pedido');
            } else {
                if(BayresService.tieneCarrito) {
                    if(CartVars.carrito.length > 0) {
                        var carritoToDelete = [];
                        var carritoToAdd = [];

                        //Armo el arreglo de Ids para borrar
                        for(var i=0; i < CartVars.carrito.length; i++) {
                            carritoToDelete.push(CartVars.carrito[i].carrito_detalle_id);
                            //carritoToAdd.push(productoEntityToAdd(CartVars.carrito[i], BayresService.miCarrito.carrito_id));
                        }

                        var agregado = false;
                        for(var i=0; i < carrito.productos.length; i++){
                            for(var j=0; j < CartVars.carrito.length; j++) {
                                if(carrito.productos[i].producto_id == CartVars.carrito[j].producto_id) {
                                    var carritoAux = {};
                                    carritoAux.cantidad = carrito.productos[i].cantidad + CartVars.carrito[j].cantidad;
                                    carritoAux.carrito_id = CartVars.carrito[j].carrito_id;
                                    carritoAux.en_oferta = CartVars.carrito[j].en_oferta;
                                    carritoAux.nombre = CartVars.carrito[j].nombre;
                                    carritoAux.precio_unitario = CartVars.carrito[j].precio_unitario;
                                    carritoAux.producto_id = CartVars.carrito[j].producto_id;
                                    carritoAux.carrito_detalle_id = CartVars.carrito[j].carrito_detalle_id;

                                    CartVars.carrito.splice(j, 1);
                                    carritoToAdd.push(carritoAux);
                                    console.log(carritoAux);
                                    agregado = true;
                                }
                            }
                            if(!agregado) {
                                //carritoToAdd.push(carrito.productos[i]);
                                carritoToAdd.push(productoEntityToAdd2(carrito.productos[i], BayresService.miCarrito.carrito_id));
                            }
                            agregado = false;
                        }
                        for(var i=0; i < CartVars.carrito.length; i++) {
                            carritoToAdd.push(productoEntityToAdd2(CartVars.carrito[i], BayresService.miCarrito.carrito_id));
                        }
                        console.log(carritoToDelete);
                        console.log(carritoToAdd);
                        if(carritoToDelete.length > 0) {
                            console.log(CartVars.carrito);
                            CartVars.carrito = [];

                            CartService.removeFromCart(carritoToDelete, function(carritoBorrado) {
                                if (carritoBorrado != -1) {
                                    CartVars.carrito = [];
                                    CartService.addToCart(BayresService.miCarrito.carrito_id, carritoToAdd, function(carritoAgregado){
                                        console.log(carritoAgregado);
                                        if(carritoAgregado != -1) {
                                            /*
                                             for (var i = 0; i < CartVars.carrito.length; i++){
                                             for(var j=0; j < carritoToDelete.length; j++){
                                             if(CartVars.carrito[i].carrito_detalle_id == carritoToDelete[j]){
                                             CartVars.carrito.splice(i, 1);
                                             }
                                             }
                                             }
                                             */
                                            for(var i=0; i < carritoToAdd.length; i++) {
                                                for(var j=0; j < CartVars.carrito.length; j++){
                                                    if(CartVars.carrito[j].producto_id == carritoToAdd[i].producto_id){
                                                        if(CartVars.carrito[j].nombre === undefined)
                                                            CartVars.carrito[j].nombre = carritoToAdd[i].nombre;
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
                                                    //CartVars.broadcast();
                                                } else {
                                                    console.log('Carrito update error');
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            var productArray = [];
                            for(var i=0; i < carritoToAdd.length; i++) {
                                productArray.push(productoEntityToAdd(carritoToAdd[i], BayresService.miCarrito.carrito_id));
                            }
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
                                            //CartVars.broadcast();
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
                        console.log(BayresService.miCarrito);

                        CartService.addToCart(BayresService.miCarrito.carrito_id, productArray, function(data){
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
                                BayresService.miCarrito.total = CartVars.carrito_total();
                                CartService.update(BayresService.miCarrito, function(carritoUpdate){
                                    if(carritoUpdate) {
                                        console.log('Ok');
                                        // CartVars.broadcast();
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
                    //console.log(carrito);
                    CartService.create(carrito, function(carritoCreado) {
                        if (carritoCreado != -1) {
                            BayresService.tieneCarrito = true;
                            BayresService.miCarrito = carritoCreado;

                            //console.log(BayresService.miCarrito);

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
                                            //CartVars.broadcast();
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

    function productoEntityToAdd2(producto, carrito_id) {
        var miProducto = {
            producto_id: producto.producto_id,
            cantidad: (producto.cantidad == 0) ? 1 : producto.cantidad,
            en_oferta: producto.en_oferta,
            precio_unitario: producto.precio_unitario,
            nombre: producto.nombre,

        };

        if(carrito_id != -1)
            miProducto.carrito_id = carrito_id;

        return miProducto;
    }

    function home() {
        $location.path('/main');
    }
}