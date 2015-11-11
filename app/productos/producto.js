'use strict';

angular.module('bayres.productos', [])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/productos/:id', {
            templateUrl: 'productos/producto.html',
            controller: 'ProductoController',
            data: {requiresLogin: false}
        });
    }])
    .controller('ProductoController', ProductoController);

ProductoController.$inject = ['$routeParams', '$location', 'AcUtils', 'ProductService', 'LinksService'];

function ProductoController($routeParams, $location, AcUtils, ProductService, LinksService) {
    var vm = this;

    vm.productos = [];
    vm.id = $routeParams.id;

    var id = vm.id == undefined ? LinksService.productId : vm.id;
    console.log(id);

    ProductService.getByParams("nombre,descripcion", id+','+id , "false", function(data){
            vm.productos = data;
            console.log(vm.producto);
    });


}