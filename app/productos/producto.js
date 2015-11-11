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

ProductoController.$inject = ['$scope', '$routeParams', '$location', 'AcUtils', 'ProductService'];

function ProductoController($scope, $routeParams, $location, AcUtils, ProductService) {
    var vm = this;

    vm.producto = {};
    vm.id = $routeParams.id;
    vm.hola = 'Hola';

    console.log(vm.id);

    if(vm.id > 0) {
        console.log(vm.id);
        ProductService.getByParams("producto_id", vm.id.toString(), "true", function(data){
            vm.producto = data;
            console.log(vm.producto);
        });
    }

    vm.goToView = goToView;

    function goToView(view) {
        $location.path('/' + view);
    }

}