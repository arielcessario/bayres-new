'use strict';

angular.module('bayres.legales', [])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/legales/:id', {
            templateUrl: 'legales/legales.html',
            controller: 'LegalesController'
        });
    }])
    .controller('LegalesController', LegalesController);


LegalesController.$inject = ['$routeParams', '$location', 'LinksService'];

function LegalesController($routeParams, $location, LinksService) {
    var vm = this;
    vm.id = $routeParams.id;
    vm.legal = {
        titulo: '',
        contenido: ''
    };

    vm.close = close;

    var id = vm.id == undefined ? LinksService.productId : vm.id;

    if(id === 1){
        vm.legal.titulo = '�Quienes Somos?';
        vm.legal.contenido = 'Somos una empresa joven dedicada a la distribucion mayorista y minorista de articulos de cultivo.Como principal objetivo buscamos la satisfaccion de nuestros clientes, para conseguirlo brindamos el mejor asesoramiento personalizado, respondiendo a todas tus consultas pre y post venta. Contamos con un showroom con mas de 400 articulos para el cultivo, en el podras encontrar los productos que buscas para hacer rendir al maximo tus cosechas. Trabajamos con las marcas lideres del mercado, tanto nacional como importadas. En pocas palabras, brindamos soluciones. Porque para eso estamos. Te damos las gracias por dedicarle un minuto a leer nuestra muy resumida historia y te invitamos a registrarte en nuestro sitio';
    }

    function close() {
        $location.path('/main');
        LinksService.selectedIncludeTop = 'main/ofertas.html';
        LinksService.broadcast();
    }


}
