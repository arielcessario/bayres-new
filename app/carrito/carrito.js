'use strict';

angular.module('bayres.carrito', [])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/carrito', {
            templateUrl: 'carrito/carrito.html',
            controller: 'CarritoController',
            data: {requiresLogin: true}
        });
    }])
    .controller('CarritoController', CarritoController)
    .service('CarritoService', CarritoService);


CarritoController.$inject = ['AcUtils', 'UserService', 'CartVars', 'CartService',
    '$timeout', '$location', 'CarritoService', 'LinksService', 'BayresService',
    'UserVars', 'SucursalService'];

function CarritoController(AcUtils, UserService, CartVars, CartService, $timeout,
                           $location, CarritoService, LinksService, BayresService,
                           UserVars, SucursalService) {

    //  VARIABLES
    var vm = this;
    vm.message = '';
    vm.carritoDetalles = [];
    vm.sucursales = [];
    vm.tipoEnvios = [
        {'id':1, 'name': 'Envio a'},
        {'id':2, 'name': 'Retira por'}
    ];
    vm.lugarDeEnvios = [
        {'id':1, 'name': 'Gran Buenos Aires'},
        {'id':2, 'name': 'Capital Federal'},
        {'id':3, 'name': 'Interior del Pais'}
    ];
    vm.carritoInfo = {
        cantidadDeProductos: 0,
        totalAPagar: 0.00,
        modified: false
    };

    vm.tipoEnvioDefecto = vm.tipoEnvios[0];
    vm.lugarDeEnvioDefecto = vm.lugarDeEnvios[0];

    //*******************************************************************
    //  FUNCIONES
    vm.removeProducto = removeProducto;
    vm.refreshProducto = refreshProducto;
    vm.confirmCarrito = confirmCarrito;

    //*******************************************************************
    //  PROGRAMA
    vm.carritoDetalles = (CartVars.carrito.length > 0) ? CartVars.carrito : BayresService.carrito;

    vm.carritoInfo.cantidadDeProductos = (CartVars.carrito.length > 0) ? CartVars.carrito_cantidad_productos() : BayresService.carrito_cantidad_productos();
    vm.carritoInfo.totalAPagar = (CartVars.carrito.length > 0) ? CartVars.carrito_total() : BayresService.carrito_total();

    SucursalService.get(function (data) {
        vm.sucursales = data;
        vm.sucursal = data[0];
    });

    CartVars.listen(function () {
        console.log('Carrito-CartVars.listen');
        vm.carritoInfo.cantidadDeProductos = (CartVars.carrito.length > 0) ? CartVars.carrito_cantidad_productos() : BayresService.carrito_cantidad_productos();
        vm.carritoInfo.totalAPagar = (CartVars.carrito.length > 0) ? CartVars.carrito_total() : BayresService.carrito_total();
    });

    function removeProducto(index) {
        var producto = (CartVars.carrito.length > 0) ? CartVars.carrito[index] : BayresService.carrito[index];
        var detalle = producto.nombre + ' $' + producto.precio_unitario + '(x' + producto.cantidad + ')';
        var borrarOk = confirm('¿Desea borrar el producto '+ detalle +'?');
        if(borrarOk){
            console.log(CartVars.carrito);
            var carrito_detalle_ids = [];
            carrito_detalle_ids.push(producto.carrito_detalle_id);
            //console.log(carrito_detalle_ids);
            CartService.removeFromCart(carrito_detalle_ids, function(data){
                if(data != -1) {
                    BayresService.miCarrito.total = CartVars.carrito_total();
                    CartService.update(BayresService.miCarrito, function(miCarrito){
                        if(miCarrito) {
                            console.log('Update Ok');
                            BayresService.messageConfirm = 'Se quito el producto';
                        } else {
                            console.log('Update Error');
                            BayresService.messageConfirm = 'Error borrando el producto';
                        }
                        BayresService.showMessageConfirm = true;
                    });
                    calcularCarritoTotal();
                } else {
                    console.log('Error borrando el producto');
                    BayresService.messageConfirm = 'Error borrando el producto';
                    BayresService.showMessageConfirm = true;
                }
            });
        } else {
            return;
        }
    }

    function calcularCarritoTotal() {
        vm.carritoInfo.cantidadDeProductos = (CartVars.carrito.length > 0) ? CartVars.carrito_cantidad_productos() : BayresService.carrito_cantidad_productos();
        vm.carritoInfo.totalAPagar = (CartVars.carrito.length > 0) ? CartVars.carrito_total() : BayresService.carrito_total();

        CartVars.broadcast();
    }

    function refreshProducto(producto) {
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

        CartService.updateProductInCart(miProducto, function(data){
            if(data) {
                BayresService.miCarrito.total = CartVars.carrito_total();
                CartService.update(BayresService.miCarrito, function(miCarrito){
                    if(miCarrito) {
                        console.log('Update Ok');
                    } else {
                        console.log('Update Error');
                    }
                });

                calcularCarritoTotal();
            }
        });
    }


    function confirmCarrito() {
        if(CartVars.carrito.length > 0) {
            BayresService.miCarrito.total = CartVars.carrito_total();
            BayresService.miCarrito.status = 1;
            BayresService.miCarrito.origen = vm.tipoEnvioDefecto.id;
            BayresService.miCarrito.destino = (vm.tipoEnvioDefecto.id == 1) ? vm.lugarDeEnvioDefecto.id : vm.sucursal.sucursal_id;

            CartService.update(BayresService.miCarrito, function(carrito){
                if(carrito) {
                    BayresService.miCarrito.productos = CartVars.carrito;
                    var carritoMail = {carrito: BayresService.miCarrito, sucursal:'Sucursal Once'};

                    UserVars.clearCache = true;
                    UserService.getById(UserService.getFromToken().data.id, function(data) {
                        if (data != -1) {
                            carritoMail.direccion = data.direcciones[0].calle + ' ' + data.direcciones[0].nro;
                            carritoMail.cliente = BayresService.usuario.nombre + ' ' + BayresService.usuario.apellido;
                            carritoMail.mail = data.mail;
                            carritoMail.tipoEnvio = vm.tipoEnvioDefecto.name;
                            carritoMail.lugarDeEnvio = (vm.tipoEnvioDefecto.id == 1) ? vm.lugarDeEnvioDefecto.name : vm.sucursal.nombre;

                            console.log(carritoMail);

                            CarritoService.sendMailConfirmarCarrito(carritoMail, function(data){
                                console.log(data);
                                if(data) {
                                    BayresService.messageConfirm = 'Su pedido fue enviado';
                                } else {
                                    BayresService.messageConfirm = 'Error confirmando el carrito';
                                }
                                BayresService.showMessageConfirm = true;
                            });

                        }
                    });

                    BayresService.tieneCarrito = false;
                    BayresService.miCarrito = {};
                    CartVars.carrito = [];
                    $location.path('/main');
                    LinksService.selectedIncludeTop = 'main/ofertas.html';
                } else {
                    BayresService.messageConfirm = 'Error confirmando el carrito';
                    BayresService.showMessageConfirm = true;
                }
            });

        } else {
            BayresService.messageConfirm = 'El Carrito esta vacio. Por favor agregue productos';
            BayresService.showMessageConfirm = true;
        }

    }

}

//*******************************************************************
CarritoService.$inject = ['$http'];
function CarritoService($http) {

    //Variables
    var service = {};

    service.sendMailCancelarCarritoComprador = sendMailCancelarCarritoComprador;
    service.sendMailCancelarCarritoVendedor = sendMailCancelarCarritoVendedor;
    service.sendMailCarritoComprador = sendMailCarritoComprador;
    service.sendMailCarritoVendedor = sendMailCarritoVendedor;

    service.sendMailConfirmarCarrito = sendMailConfirmarCarrito;
    service.sendMailCancelarCarrito = sendMailCancelarCarrito;

    return service;

    /**
     *
     * @param usuario
     * @param carrito
     * @param callback
     * @returns {*}
     */
    function sendMailCancelarCarritoComprador(usuario, carrito, callback) {
        return $http.post('mailer/mailer.php',
            {
                function: 'sendCancelarCarritoComprador',
                'usuario': usuario,
                'carrito': JSON.stringify(carrito)
            })
            .success(function (data) {
                callback(data);
            })
            .error(function (data) {
                callback(data);
            });
    }

    /**
     *
     * @param usuario
     * @param email
     * @param carrito
     * @param callback
     * @returns {*}
     */
    function sendMailCancelarCarritoVendedor(usuario, email, carrito, callback) {
        return $http.post('mailer/mailer.php',
            {
                function: 'sendCancelarCarritoVendedor',
                'usuario': usuario,
                'email': email,
                'carrito': JSON.stringify(carrito)
            })
            .success(function (data) {
                callback(data);
            })
            .error(function (data) {
                callback(data);
            });
    }

    /**
     *
     * @param mail
     * @param nombre
     * @param carrito
     * @param sucursal
     * @param direccion
     * @param callback
     */
    function sendMailCarritoComprador(mail, nombre, carrito, sucursal, direccion, tipoEnvio, lugarDeEnvio, callback) {
        return $http.post('mailer/mailer.php',
            {
                function: 'sendCarritoComprador',
                'email': mail,
                'nombre': nombre,
                'carrito': JSON.stringify(carrito),
                'sucursal': sucursal,
                'direccion': direccion,
                'tipoEnvio': tipoEnvio,
                'lugarDeEnvio': lugarDeEnvio
            })
            .success(function (data) {
                callback(data);
            })
            .error(function (data) {
                callback(data);
            });
    }

    /**
     *
     * @param mail
     * @param nombre
     * @param carrito
     * @param sucursal
     * @param direccion
     * @param callback
     * @returns {*}
     */
    function sendMailCarritoVendedor(mail, nombre, carrito, sucursal, direccion, tipoEnvio, lugarDeEnvio, callback) {
        return $http.post('mailer/mailer.php',
            {
                function: 'sendCarritoVendedor',
                'email': mail,
                'nombre': nombre,
                'carrito': JSON.stringify(carrito),
                'sucursal': sucursal,
                'direccion': direccion,
                'tipoEnvio': tipoEnvio,
                'lugarDeEnvio': lugarDeEnvio
            })
            .success(function (data) {
                callback(data);
            })
            .error(function (data) {
                callback(data);
            });
    }

    function sendMailConfirmarCarrito(carritoMail, callback) {
        console.log(carritoMail);
        sendMailCarritoComprador(carritoMail.mail, carritoMail.cliente, carritoMail.carrito, carritoMail.sucursal,
            carritoMail.direccion, carritoMail.tipoEnvio, carritoMail.lugarDeEnvio, function(mailComprador){
                if(mailComprador) {
                    console.log(carritoMail);
                    sendMailCarritoVendedor(carritoMail.mail, carritoMail.cliente, carritoMail.carrito, carritoMail.sucursal,
                        carritoMail.direccion, carritoMail.tipoEnvio, carritoMail.lugarDeEnvio, function(mailVendedor){
                            callback(mailVendedor);
                        });
                } else {
                    callback(false);
                }
            });
    }

    function sendMailCancelarCarrito(usuario, email, carrito, callback) {
        sendMailCancelarCarritoComprador(usuario, carrito, function(mailComprador){
            if(mailComprador) {
                sendMailCancelarCarritoVendedor(usuario, email, carrito, function(mailVendedor){
                    callback(mailVendedor);
                })
            } else {
                callback(mailComprador);
            }
        });
    }
}

