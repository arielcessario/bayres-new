'use strict';

// Declare app level module which depends on views, and components
angular.module('bayres', [
  'ngRoute',
  'ngCookies',
  'bayres.agreement',
  'bayres.main',
  'bayres.login',
  'bayres.usuarios',
  'bayres.productos',
  'bayres.carrito',
  'bayres.micuenta'
]).
config(['$routeProvider', function($routeProvider) {

}])
.controller('BayresController', BayresController);


BayresController.$inject = ['$location', 'UserService'];

function BayresController($location, UserService) {

  var vm = this;

  //var productosList = [];
  //vm.categorias = [];
  vm.logout = logout;

  $location.path('/agreement');

  function logout() {
    UserService.logout(function (data) {
      console.log('logout');
      console.log(data);
      $location.path('/main');
    });
  }

/*
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
*/
}