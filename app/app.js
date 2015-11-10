'use strict';

// Declare app level module which depends on views, and components
angular.module('bayres', [
  'ngRoute',
  'ngCookies',
  'angular-storage',
  'angular-jwt',
  'bayres.agreement',
  'bayres.main',
  'bayres.login',
  'bayres.usuarios',
  'bayres.productos',
  'bayres.carrito',
  'bayres.micuenta',
  'bayres.contacto',
  'bayres.detalle'
]).
config(['$routeProvider', function($routeProvider) {

}])
.controller('BayresController', BayresController)
.service('LinksService', LinksService);


BayresController.$inject = ['$scope', '$location', 'UserService', 'ProductService',
  'CategoryService', 'LinksService', 'CartVars'];

function BayresController($scope, $location, UserService, ProductService,
                          CategoryService, LinksService, CartVars) {

  var vm = this;
  vm.filtro = '';
  vm.isLogged = false;
  vm.selectedPage = 'INICIO';
  vm.menu_mobile_open = false;
  vm.showCategorias = false;
  vm.links = LinksService.links;

  var productosList = [];
  vm.categorias = [];
  vm.usuario = {};
  vm.carritoInfo = {
    cantidadDeProductos: 0,
    totalAPagar: 0.00,
    modified: false
  };

  vm.goTo = goTo;
  vm.logout = logout;
  vm.login = login;
  vm.createUsuario = createUsuario;
  vm.getByCategoria = getByCategoria;
  vm.buscarProducto = buscarProducto;

  $location.path('/agreement');

  CartVars.broadcast();
  vm.carritoInfo.cantidadDeProductos = CartVars.carrito_cantidad_productos();
  vm.carritoInfo.totalAPagar = CartVars.carrito_total();

  $scope.$on('links', function (event, args) {
    vm.links = LinksService.links;
  });

  if(UserService.getLogged() != false) {
    vm.usuario = UserService.getLogged();
    vm.isLogged = true;
  }

  for (var i = 0; i < vm.links.length; i++) {
    if (vm.links[i].path == $location.$$path) {
      vm.selectedPage = vm.links[i].nombre;
    }

    if ($location.$$path == '/login') {
      vm.selectedPage = 'INGRESO';
    }

    if ($location.$$path == '/main') {
      vm.selectedPage = 'INICIO';
    }

    if ($location.$$path == '/usuarios') {
      vm.selectedPage = 'INGRESO';
    }

  }

  function goTo(location) {
    $location.path(location.path);
    vm.selectedPage = location.nombre;
  }

  function login() {
    $location.path('/login');
  }

  function createUsuario() {
    $location.path('/usuarios');
  }

  function logout() {
    UserService.logout(function (data) {
      console.log('logout');
      vm.usuario = {};
      vm.isLogged = false;
      $location.path('/main');
    });
  }

  ProductService.get(function(data){
    productosList = data;
    //console.log(productosList);
  });

  CategoryService.getByParams("parent_id", "-1", "true", function(data){
    vm.categorias = data;
    var i = 0;
    vm.categorias.forEach(function(categoria){
      CategoryService.getByParams("parent_id", categoria.categoria_id.toString(), "true", function(list){
        vm.categorias[i].subcategorias = list;
        var j = 0;
        list.forEach(function(subcategoria){
          var listCount = [];
          ProductService.getByCategoria(subcategoria.categoria_id, function(data){
            listCount = data;
          });
          //var count = CategoryService.getItemsByCategory(subcategoria.categoria_id, productosList);
          vm.categorias[i].subcategorias[j].total_categoria = listCount.length;
          j = j + 1;
        });
        i++;
      });
    });
  });

  function getByCategoria(categoria_id) {
    $location.path('#/productos/'+categoria_id);
  }

  function buscarProducto(event) {
    if(event.keyCode == 13) {

    }
  }

}

/*ARMO UN SERVICIO PARA EL MENU*/
function LinksService() {
  this.links = [
    {nombre: 'INICIO', path: '/main', tieneImagen: true, nombreImagen: 'home.png'},
    {nombre: 'Categorias', path: '/main', tieneImagen: true, nombreImagen: 'categorias.png'},
    {nombre: 'Mi Carrito', path: '/carrito', tieneImagen: false},
    {nombre: 'Mi Cuenta', path: '/micuenta', tieneImagen: false},
    {nombre: 'Finalizar Compra', path: '/carrito', tieneImagen: false},
    {nombre: 'Contacto', path: '/contacto', tieneImagen: true, nombreImagen: 'contacto.png'}
  ];
}