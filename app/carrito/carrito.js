'use strict';

angular.module('bayres.carrito', [
    'ngRoute',
    'ngCookies',
    'angular-storage',
    'angular-jwt',
    'acUtils',
    'acUsuarios',
    'acProductos'
])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/carrito', {
            templateUrl: 'carrito/carrito.html',
            controller: 'CarritoController',
            data: {requiresLogin: true}
        });
    }])
    .controller('CarritoController', CarritoController)
    .service('CarritoService', CarritoService);


CarritoController.$inject = ['$routeParams', 'AcUtils', 'UserService', 'CartVars', 'CartService',
    '$timeout', '$location', 'CarritoService'];
CarritoService.$inject = ['$http'];

function CarritoController($routeParams, AcUtils, UserService, CartVars, CartService,
                           $timeout, $location, CarritoService) {

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
    //vm.carrito = $routeParams.carrito;
    vm.removeProducto = removeProducto;
    vm.refreshProducto = refreshProducto;
    vm.confirmCarrito = confirmCarrito;
    vm.home = home;

    //*******************************************************************
    //  PROGRAMA
    vm.carritoDetalles = CartVars.carrito;
    console.log(vm.carritoDetalles);

    if(vm.carritoDetalles.length > 0) {
        vm.carritoInfo.cantidadDeProductos = CartVars.carrito_cantidad_productos();
        vm.carritoInfo.totalAPagar = CartVars.carrito_total();

        console.log(vm.carritoInfo);
    }

    function removeProducto(index) {
        if(CartVars.carrito.length > 0) {
            var producto = vm.carritoDetalles[index];
            var detalle = producto.nombre + ' $' + producto.precio_unitario + '(x' + producto.cantidad + ')';
            var borrarOk = confirm('¿Desea borrar el producto '+ detalle +'?');
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
            var usuario = UserService.getLogged();
            var carrito = {
                'usuario_id': usuario.usuario_id,
                'total': vm.carritoInfo.totalAPagar,
                'status': 1,
                'fecha': getCurrentDate(),
                'productos': []
            }

            var error = false;
            CartService.create(carrito, function(carrito_id) {
                if (carrito_id > 0) {
                    carrito.carrito_id = carrito_id;
                    console.log(carrito);
                    var i = 0;
                    CartVars.carrito.forEach(function (producto) {
                        CartService.addToCart(carrito_id, producto, function (data) {
                            if (data > 0) {
                                console.log(data);
                                carrito.productos[i] = producto;
                                i = i + 1;
                            }
                            else {
                                console.log('Error detalle carrito');
                                error = true;
                            }
                        });
                    });
                } else {
                    console.log('Error creando el carrito');
                    error = true;
                }
            });

            if(!error) {
                console.log('Carrito Pedido');
                console.log('Envio los mails');

                CarritoService.sendMailCarritoComprador(usuario.mail, usuario.nombre, CartVars.carrito, 1, 'Falta la direccion', function(data){
                    console.log(data);
                });

                CarritoService.sendMailCarritoVendedor(usuario.mail, usuario.nombre, CartVars.carrito, 1, 'Falta la direccion', function(data){
                    console.log(data);
                });

                $timeout(function () {

                    $location.path('/main');

                    CartVars.carrito = [];
                    vm.carritoDetalles = [];

                }, 2000);

            }
        }
        else {
            vm.message = 'El Carrito esta vacio. Por favor agregue productos';
        }
    }

    function home() {
        $location.path('/main');
    }

    function getCurrentDate() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!

        var yyyy = today.getFullYear();
        if(dd<10){
            dd='0'+dd
        }
        if(mm<10){
            mm='0'+mm
        }
        var today = dd + '/' + mm + '/' + yyyy;
        return today;
    }

}

//*******************************************************************
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

