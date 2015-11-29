'use strict';

//window.appName = 'uiglp';

angular.module('bayres.login', [])

    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/login', {
        templateUrl: 'login/login.html',
        controller: 'LoginController',
        data: {requiresLogin: false}
      });
    }])
    .controller('LoginController', LoginController);

LoginController.$inject = ['$location', 'UserService', 'LinksService', 'BayresService', 'CartVars',
  'CartService', 'AcUtils'];

function LoginController($location, UserService, LinksService, BayresService, CartVars,
                         CartService, AcUtils) {
  var vm = this;

  vm.message = '';
  vm.recoveryPassword = false;
  vm.screenWidth = screen.width;

  //METODOS
  vm.login = login;
  vm.passwordEnter = passwordEnter;
  vm.createUsuario = createUsuario;
  vm.recoveryPwd = recoveryPwd;

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

          CartVars.clearCache = true;
          CartService.reloadLastCart(BayresService.usuario.id, function(carrito) {
            //console.log(carrito);
            if (carrito.length > 0) {
              BayresService.tieneCarrito = true;
              BayresService.miCarrito = carritoEntity(BayresService.usuario.id, carrito[0].carrito_id, carrito[0].fecha);

              if(BayresService.carrito.length > 0) {
                var carritoToDelete = [];
                for(var i=0; i < carrito[0].productos.length; i++){
                  carritoToDelete.push(carrito[0].productos[i].carrito_detalle_id);
                }

                for(var i=0; i < BayresService.carrito.length; i++) {
                  for(var j=0; j < carrito[0].productos.length; j++) {
                    if(BayresService.carrito[i].producto_id == carrito[0].productos[j].producto_id) {
                      BayresService.carrito[i].cantidad = BayresService.carrito[i].cantidad + carrito[0].productos[j].cantidad;
                      carrito[0].productos.splice(j, 1);
                    }
                  }
                }
                for(var i=0; i < carrito[0].productos.length; i++) {
                  BayresService.carrito.push(carrito[0].productos[i]);
                }
                //console.log(carritoToDelete);
                //console.log(BayresService.carrito);
                CartService.removeFromCart(carritoToDelete, function(data){
                  //console.log(data);
                  if(data) {
                    CartService.addToCart(BayresService.miCarrito.carrito_id, BayresService.carrito, function(data){
                      if(data != -1) {
                        for(var i=0; i < BayresService.carrito.length; i++) {
                          for(var j=0; j < CartVars.carrito.length; j++){
                            if(CartVars.carrito[j].producto_id == BayresService.carrito[i].producto_id){
                              if(CartVars.carrito[j].nombre === undefined)
                                CartVars.carrito[j].nombre = BayresService.carrito[i].nombre;
                            }
                          }
                        }
                        BayresService.miCarrito = {carrito_id: carrito[0].carrito_id, status: 0, usuario_id: BayresService.usuario.id, total:CartVars.carrito_total()};
                        CartService.update(BayresService.miCarrito, function(miCarrito){
                          //console.log(miCarrito);
                          if(miCarrito) {
                            console.log('Update Ok');
                          } else {
                            console.log('Update Error');
                          }
                        });
                      }
                    });
                  } else {
                    console.log('Error borrando carritos');
                  }
                });
              } else {
                CartVars.carrito = carrito[0].productos;
                //console.log(CartVars.carrito);
                if(CartVars.carrito.length > 0 && BayresService.carrito.length == 0)
                  CartVars.broadcast();
              }
            }
          });
          //console.log(BayresService.carrito);
          if(!BayresService.tieneCarrito && BayresService.carrito.length > 0) {
            var carrito = {'usuario_id': BayresService.usuario.id, 'total': BayresService.carrito_total(), 'status': 0};
            //console.log(carrito);
            CartService.create(carrito, function(carritoCreado) {
              if (carritoCreado != -1) {
                BayresService.tieneCarrito = true;
                BayresService.miCarrito = carritoCreado;

                //console.log(BayresService.miCarrito);

                CartService.addToCart(carritoCreado.carrito_id, BayresService.carrito, function(data){
                  //console.log(data);
                  if(data != -1) {
                    for(var i=0; i < BayresService.carrito.length; i++) {
                      for(var j=0; j < CartVars.carrito.length; j++){
                        if(CartVars.carrito[j].producto_id == BayresService.carrito[i].producto_id){
                          if(CartVars.carrito[j].nombre === undefined)
                            CartVars.carrito[j].nombre = BayresService.carrito[i].nombre;
                        }
                      }
                    }
                    BayresService.carrito = [];
                  }
                });
              }
            });
          }
          vm.recoveryPassword = false;
          $location.path('/main');
          LinksService.selectedIncludeTop = 'main/ofertas.html';
        } else {
          vm.message = 'Usuario o contraseña erroneo';
          vm.recoveryPassword = true;
        }
      });
    } else {
      vm.message = 'Ingrese una mail y contraseña';
    }
  }

  function carritoEntity(usuario_id, carrito_id, fecha) {
    var carrito = {
      'usuario_id': usuario_id,
      'total': CartVars.carrito_total(),
      'status': 0
    };

    if(carrito_id != -1)
      carrito.carrito_id = carrito_id;

    if(fecha !== null && fecha !== undefined)
      carrito.fecha = fecha;

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

  function recoveryPwd() {
    if(vm.loginForm.mail != undefined) {
      if (vm.loginForm.mail.trim().length > 0) {
        if (AcUtils.validateEmail(vm.loginForm.mail.trim())) {
          UserService.userExist(vm.loginForm.mail.trim(), function (data) {
            //console.log(data);
            if (data != -1) {
              UserService.forgotPassword(vm.loginForm.mail.trim(), function (data) {
                //console.log(data);
                vm.recoveryPassword = false;
                $location.path('/main');
                LinksService.selectedIncludeTop = 'main/ofertas.html';
              });
            }
            else {
              vm.message = 'El mail ingresado no existe';
            }
          });
        }
        else {
          vm.message = 'El mail no tiene un formato valido';
        }
      }
      else {
        vm.message = 'Ingrese un mail';
      }
    }
    else {
      vm.message = 'Ingrese un mail';
    }
  }

}