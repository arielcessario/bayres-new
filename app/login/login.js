'use strict';

window.appName = 'bayres';

angular.module('bayres.login', [])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'login/login.html',
            controller: 'LoginController',
            data: {requiresLogin: false}
        });
    }])
    .controller('LoginController', LoginController);

LoginController.$inject = ['$location', 'UserService', 'LinksService', 'BayresService', 'CartVars', 'CartService'];

function LoginController($location, UserService, LinksService, BayresService, CartVars, CartService) {
    var vm = this;

    vm.message = '';
    vm.screenWidth = screen.width;

    //METODOS
    vm.login = login;
    vm.passwordEnter = passwordEnter;
    vm.createUsuario = createUsuario;

    vm.loginForm = {
        mail:'',
        password:''
    };

    function login() {
        if(vm.loginForm.mail.trim().length > 0 && vm.loginForm.password.trim().length > 0) {
            UserService.login(vm.loginForm.mail.trim(), vm.loginForm.password.trim(), 1, function(data){
                if(data != -1) {
                    vm.message = '';
                    BayresService.usuario = {id:data.user.usuario_id, nombre: data.user.nombre, apellido: data.user.apellido, mail:data.user.mail, rol:data.user.rol_id};
                    BayresService.isLogged = true;

                    console.log(data);

                    CartVars.clearCache = true;
                    CartService.reloadLastCart(BayresService.usuario.id, function(carrito) {
                        console.log(carrito);
                        if (carrito.length > 0) {
                            BayresService.tieneCarrito = true;
                            //BayresService.carrito = carrito[0].productos;
                            //CartVars.carrito = carrito[0].productos;
                            BayresService.miCarrito = carritoEntity(BayresService.usuario.id, carrito[0].carrito_id);

                            if(BayresService.carrito.length > 0) {
                                var carritoToDelete = [];
                                for(var i=0; i < carrito[0].productos.length; i++){
                                    carritoToDelete.push(carrito[0].productos[i].carrito_detalle_id);
                                }

                                for(var i=0; i < BayresService.carrito.length; i++) {
                                    for(var j=0; j < carrito[0].productos.length; j++) {
                                        if(BayresService.carrito[i].producto_id == carrito[0].productos[j].producto_id) {
                                            BayresService.carrito[i].cantidad = BayresService.carrito[i].cantidad + carrito[0].productos[j].cantidad;
                                            //carritoToDelete.push(carrito[0].productos[j].carrito_detalle_id);
                                            carrito[0].productos.splice(j, 1);
                                        }
                                    }
                                }
                                //CartVars.carrito = carrito[0].productos;
                                for(var i=0; i < carrito[0].productos.length; i++) {
                                    BayresService.carrito.push(carrito[0].productos[i]);
                                }
                                console.log(carritoToDelete);
                                console.log(BayresService.carrito);
                                CartService.removeFromCart(carritoToDelete, function(data){
                                    console.log(data);
                                    if(data) {
                                        CartService.addToCart(BayresService.miCarrito.carrito_id, BayresService.carrito, function(data){
                                            if(data != -1) {
                                                BayresService.miCarrito = {carrito_id: carrito[0].carrito_id, status: 0, usuario_id: BayresService.usuario.id, total:CartVars.carrito_total()};
                                                CartService.update(BayresService.miCarrito, function(miCarrito){
                                                    console.log(miCarrito);
                                                    //LinksService.broadcast();
                                                });
                                            }
                                        });
                                    } else {
                                        console.log('Error borrando carritos');
                                    }
                                });
                            } else {
                                CartVars.carrito = carrito[0].productos;
                                console.log(CartVars.carrito);
                                if(CartVars.carrito.length > 0 && BayresService.carrito.length == 0)
                                    CartVars.broadcast();
                            }
                        }

                        console.log(BayresService.carrito);
                        if(!BayresService.tieneCarrito && BayresService.carrito.length > 0) {
                            var carrito = {'usuario_id': BayresService.usuario.id, 'total': BayresService.carrito_total(), 'status': 0};
                            console.log(carrito);
                            CartService.create(carrito, function(carrito_id) {
                                if (carrito_id > 0) {
                                    BayresService.tieneCarrito = true;
                                    BayresService.miCarrito = carrito;
                                    BayresService.miCarrito.carrito_id = carrito_id;

                                    console.log(BayresService.miCarrito);

                                    CartService.addToCart(carrito_id, BayresService.carrito, function(data){
                                        console.log(data);
                                        if(data != -1) {
                                            BayresService.carrito = [];
                                            //CartVars.carrito = BayresService.carrito = [];
                                            //BayresService.carrito = data;
                                            //CartVars.broadcast();
                                        }
                                    });
                                }
                            });
                        }

                    });
                    /*
                    console.log(BayresService.carrito);
                    if(!BayresService.tieneCarrito && BayresService.carrito.length > 0) {
                        var carrito = {'usuario_id': BayresService.usuario.id, 'total': BayresService.carrito_total(), 'status': 0};
                        console.log(carrito);
                        CartService.create(carrito, function(carrito_id) {
                            if (carrito_id > 0) {
                                BayresService.tieneCarrito = true;
                                BayresService.miCarrito = carrito;
                                BayresService.miCarrito.carrito_id = carrito_id;

                                console.log(BayresService.miCarrito);

                                CartService.addToCart(carrito_id, BayresService.carrito, function(data){
                                    console.log(data);
                                    if(data != -1) {
                                        BayresService.carrito = [];
                                        //CartVars.carrito = BayresService.carrito = [];
                                        //BayresService.carrito = data;
                                        //CartVars.broadcast();
                                        $location.path('/main');
                                        LinksService.selectedIncludeTop = 'main/ofertas.html';
                                    }
                                });
                            }
                        });
                    }
                    */
                    $location.path('/main');
                    LinksService.selectedIncludeTop = 'main/ofertas.html';
                } else {
                    vm.message = 'Usuario o contraseña erroneo';
                }
            });
        } else {
            vm.message = 'Ingrese una mail y contraseña';
        }
    }

    function carritoEntity(usuario_id, carrito_id) {
        var carrito = {
            'usuario_id': usuario_id,
            'total': CartVars.carrito_total(),
            'status': 0
        };

        if(carrito_id != -1)
            carrito.carrito_id = carrito_id;

        return carrito;
    }

    function passwordEnter(event) {
        if(event.keyCode == 13) {
            vm.login();
        }
    }

    function createUsuario() {
        $location.path('/usuarios');
        LinksService.selectedIncludeTop = 'usuarios/usuario.html';
    }
}