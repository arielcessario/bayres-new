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
    '$timeout', '$location', 'CarritoService', 'LinksService'];

function CarritoController(AcUtils, UserService, CartVars, CartService,
                           $timeout, $location, CarritoService, LinksService) {

    //  VARIABLES
    var vm = this;
    vm.message = '';
    vm.carritoDetalles = [];
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

    vm.tipoEnvioDefecto = {'id':1, 'name': 'Envio a'};
    vm.lugarDeEnvioDefecto = {'id':1, 'name': 'Gran Buenos Aires'};

    //*******************************************************************
    //  FUNCIONES
    vm.removeProducto = removeProducto;
    vm.refreshProducto = refreshProducto;
    vm.confirmCarrito = confirmCarrito;

    //*******************************************************************
    //  PROGRAMA
    vm.carritoDetalles = CartVars.carrito;
    console.log(vm.carritoDetalles);

    
    function removeProducto(index) {
        if(CartVars.carrito.length > 0) {
            var producto = vm.carritoDetalles[index];
            var detalle = producto.nombre + ' $' + producto.precio_unitario + '(x' + producto.cantidad + ')';
            var borrarOk = confirm('�Desea borrar el producto '+ detalle +'?');
            if(borrarOk){
                CartVars.carrito.splice( index, 1 );
                CartVars.carrito.sort(function(a, b){
                    return a.nombre - b.nombre;
                });

                calcularCarritoTotal();
            } else {
                return;
            }
        }
    }

    function calcularCarritoTotal() {
        vm.carritoInfo.cantidadDeProductos = CartVars.carrito_cantidad_productos();
        vm.carritoInfo.totalAPagar = CartVars.carrito_total();
        CartVars.broadcast();

        console.log(vm.carritoInfo);
    }

    function refreshProducto(producto) {
        console.log(producto);
        var miProducto = {
            producto_id: producto.producto_id,
            cantidad: 0,
            en_oferta: 1,
            precio_unitario: producto.precio_unitario,
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

    function confirmCarrito() {

        if(CartVars.carrito.length > 0) {
            var usuario = UserService.getFromToken().data;
            var carrito = {
                'usuario_id': usuario.id,
                'total': CartVars.carrito_total(),
                'status': 1,
                'productos': []
            };

            var error = false;
            CartService.create(carrito, function(carrito_id) {
                if (carrito_id > 0) {
                    carrito.carrito_id = carrito_id;

                    CartService.addToCart(carrito_id, CartVars.carrito, function (carrito_detalle) {
                        console.log(carrito_detalle);
                        if (carrito_detalle != -1) {
                            console.log('Carrito Pedido');
                            console.log('Envio los mails');

                            CarritoService.sendMailCarritoComprador(usuario.mail, usuario.nombre, carrito_detalle, 1, 'Falta la direccion', function(data){
                                console.log(data);
                            });

                            CarritoService.sendMailCarritoVendedor(usuario.mail, usuario.nombre, carrito_detalle, 1, 'Falta la direccion', function(data){
                                console.log(data);
                            });

                            vm.carritoDetalles = [];
                            CartVars.carrito = [];

                            $location.path('/main');
                            LinksService.selectedIncludeTop = 'main/ofertas.html';

                            CartVars.broadcast();
                        } else {
                            console.log('Error creando el carrito');
                            error = true;
                        }
                    });

                } else {
                    console.log('Error creando el carrito');
                    error = true;
                }
            });
        }
        else {
            vm.message = 'El Carrito esta vacio. Por favor agregue productos';
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
    function sendMailCarritoComprador(mail, nombre, carrito, sucursal, direccion, callback) {
        return $http.post('mailer/mailer.php',
            {
                function: 'sendCarritoComprador',
                'email': mail,
                'nombre': nombre,
                'carrito': JSON.stringify(carrito),
                'sucursal': sucursal,
                'direccion': direccion
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
    function sendMailCarritoVendedor(mail, nombre, carrito, sucursal, direccion, callback) {
        return $http.post('mailer/mailer.php',
            {
                function: 'sendCarritoVendedor',
                'email': mail,
                'nombre': nombre,
                'carrito': JSON.stringify(carrito),
                'sucursal': sucursal,
                'direccion': direccion
            })
            .success(function (data) {
                callback(data);
            })
            .error(function (data) {
                callback(data);
            });
    }
}

