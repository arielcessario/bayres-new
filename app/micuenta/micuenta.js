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

MiCuentaController.$inject = ['$location', 'UserService', 'CartVars', 'CartService', 'AcUtils', 'CarritoService'];

function MiCuentaController($location, UserService, CartVars, CartService, AcUtils, CarritoService) {
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
        'password': ''
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


    if(UserService.getLogged() != false) {
        var user = UserService.getLogged();

        vm.userForm.usuario_id = user.usuario_id;
        vm.userForm.apellido = user.apellido;
        vm.userForm.nombre = user.nombre;
        vm.userForm.mail = user.mail;
        vm.userForm.news_letter = user.news_letter;

        vm.passwordForm.usuario_id = user.usuario_id;

        getHistoricoDePedidos(user);
    }

    function getHistoricoDePedidos(usuario) {
        CartService.getByParams("status","1","true",usuario.usuario_id, function(data){
            vm.historico_pedidos = data.sort(function(a, b){
                return b.carrito_id - a.carrito_id;
            });
            var select_one = { pedido_id:-1, fecha:'Seleccione un pedido' };
            vm.historico_pedidos.unshift(select_one);
            vm.carrito = vm.historico_pedidos[0];
        });
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

    function addProducto(producto) {
        console.log(producto);
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
                    carrito.status = 0;
                    CartService.update(carrito, function(data){
                        console.log(data);
                        if(data != -1){
                            var usuario = UserService.getLogged();

                            CarritoService.sendMailCancelarCarritoComprador(usuario.mail, carrito, function(data){
                                if(data) {
                                    setMessageResponse(true, false, false, false, 'Se envio el mail con la confirmaci�n');
                                } else {
                                    setMessageResponse(false, false, false, true, 'Error enviando el mail');
                                }
                            });
                            var usuarioNombre = usuario.apellido + ', ' + usuario.nombre;
                            CarritoService.sendMailCancelarCarritoVendedor(usuarioNombre, usuario.mail, carrito, function(data){
                                if(data) {
                                    setMessageResponse(true, false, false, false, 'Se envio el mail con la confirmaci�n');
                                } else {
                                    setMessageResponse(false, false, false, true, 'Error enviando el mail');
                                }
                            });

                            getHistoricoDePedidos(usuario);
                            getCarritoSelected(null);
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
                carrito.productos.forEach(function(producto) {
                    var miProducto = {
                        producto_id: producto.producto_id,
                        cantidad: producto.cantidad,
                        en_oferta: producto.en_oferta,
                        precio_unitario: producto.precio_unitario,
                        carrito_id: -1,
                        nombre: producto.nombre
                    };

                    var encontrado = false;
                    var indexToDelete = 0;

                    if(vm.carritoDetalles.length > 0) {
                        var index = 0;
                        vm.carritoDetalles.forEach(function(data){
                            if(data.producto_id == miProducto.producto_id) {
                                miProducto.cantidad = data.cantidad + miProducto.cantidad;
                                indexToDelete = index;
                                encontrado = true;
                            }
                            index = index + 1;
                        });

                        if(encontrado) {
                            console.log('indexToDelete: ' + indexToDelete);
                            vm.carritoDetalles.splice( indexToDelete, 1 );
                        }
                    }
                    vm.carritoDetalles.push(miProducto);
                    vm.carritoDetalles.sort(function(a, b){ return a.nombre - b.nombre; });
                    console.log(vm.carritoDetalles);

                    calcularCarritoTotal();
                });
            }
        }
    }

    function home() {
        $location.path('/main');
    }
}