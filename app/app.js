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
  'bayres.contacto'
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
  vm.isLogged = false;
  vm.selectedPage = 'INICIO';
  vm.menu_mobile_open = false;
  vm.links = LinksService.links;

  var productosList = [];
  vm.categorias = [];
  vm.usuario = {};
  vm.carritoInfo = {
    cantidadDeProductos: CartVars.carrito_cantidad_productos(),
    totalAPagar: CartVars.carrito_total(),
    modified: false
  };

  vm.goTo = goTo;
  vm.logout = logout;
  vm.login = login;
  vm.createUsuario = createUsuario;

  $location.path('/agreement');


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
    console.log(productosList);
  });

  CategoryService.getByParams("parent_id", "-1", "true", function(data){
    vm.categorias = data;
    var i = 0;
    vm.categorias.forEach(function(categoria){
      CategoryService.getByParams("parent_id", categoria.categoria_id.toString(), "true", function(list){
        vm.categorias[i].subcategorias = list;
        var j = 0;
        list.forEach(function(subcategoria){
          var count = CategoryService.getItemsByCategory(subcategoria.categoria_id, productosList);
          vm.categorias[i].subcategorias[j].total_categoria = count;
          j = j + 1;
        });
        i++;
      });
    });
  });

}

/*ARMO UN SERVICIO PARA EL MENU*/
function LinksService() {
  this.links = [
    {nombre: 'INICIO', path: '/main'},
    {nombre: 'Categorias', path: '/main'},
    {nombre: 'Mi Carrito', path: '/carrito'},
    {nombre: 'Mi Cuenta', path: '/micuenta'},
    {nombre: 'Finalizar Compra', path: '/carrito'},
    {nombre: 'Compras', path: '/revistas'},
    {nombre: 'Contacto', path: '/contacto'}
  ];
}