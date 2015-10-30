'use strict';

angular.module('bayres.main', [
    'ngRoute',
    'ngCookies',
    'ngAnimate',
    'angular-storage',
    'angular-jwt',
    'acUtils',
    'acUsuarios',
    'acProductos'
])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/main', {
            templateUrl: 'main/main.html',
            controller: 'MainController',
            data: {requiresLogin: false}
        });
    }])
    .controller('MainController', MainController);






MainController.$inject = ['$scope', '$location', 'AcUtils', 'UserService', 'ProductService',
    'CategoryService', 'CartVars'];

function MainController($scope, $location, AcUtils, UserService, ProductService,
                        CategoryService, CartVars) {
    var vm = this;

    var productosList = [];

    vm.productosEnOfertas = [];
    vm.productosMasVendidos = [];
    vm.productosDestacados = [];
    //vm.carritoDetalles = [];
    vm.productoList = [];
    vm.categorias = [];
    vm.subcategorias = [];

    vm.usuario = {};

    vm.productoResultado = '';
    vm.productoBuscado = '';
    vm.showInfo = false;
    vm.isLogged = false;
    vm.selectedPage = 'INICIO';
    vm.menu_mobile_open = false;
    vm.links = LinksService.links;

    vm.carritoInfo = {
        cantidadDeProductos: 0,
        totalAPagar: 0.00,
        modified: false
    };

    vm.addProducto = addProducto;
    vm.showDetalle = showDetalle;
    vm.findProducto = findProducto;
    vm.showSubCategoria = showSubCategoria;
    vm.hideSubCategoria = hideSubCategoria;
    vm.goTo = goTo;
    vm.logout = logout;


    function LinksService() {
        this.links = [
            {nombre: 'INICIO', path: '/main'},
            {nombre: 'Categorias', path: '/main'},
            {nombre: 'Mi Carrito', path: '/carrito'},
            {nombre: 'Mi Cuenta', path: '/micuenta'},
            {nombre: 'Finalizar Compra', path: '/carrito'},
            {nombre: 'Compras', path: '/revistas'},
            {nombre: 'Contacto', path: '/contact'}
        ];
    }



    $scope.$on('links', function (event, args) {
        vm.links = LinksService.links;
    });

    vm.links = this.links = [
        {nombre: 'INICIO', path: '/main'},
        {nombre: 'Categorias', path: '/main'},
        {nombre: 'Mi Carrito', path: '/carrito'},
        {nombre: 'Mi Cuenta', path: '/micuenta'},
        {nombre: 'Finalizar Compra', path: '/carrito'},
        {nombre: 'Compras', path: '/revistas'},
        {nombre: 'Contacto', path: '/contact'}
    ];

    /*
    for (var i = 0; i < vm.links.length; i++) {
        if (vm.links[i].path == $location.$$path) {
            vm.selectedPage = vm.links[i].nombre;
        }

        if ($location.$$path == '/administracion') {
            vm.selectedPage = 'INGRESO';
        }

        if ($location.$$path == '/servicios') {
            vm.selectedPage = 'INICIO';
        }

        if ($location.$$path == '/nuevo_usuario') {
            vm.selectedPage = 'INGRESO';
        }

        if ($location.$$path.indexOf('/noticias') > -1) {
            //response = '/' + $location.$$path.split('/')[1];
            vm.selectedPage = 'NOTICIAS';
        }
    }
*/
    function goTo(location) {
        $location.path(location.path);
        vm.selectedPage = location.nombre;
    }

    ProductService.get(function(data){
        productosList = data;
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

    if(UserService.getLogged() != false) {
        vm.usuario = UserService.getLogged();
        vm.isLogged = true;
    }

    ProductService.getByParams("en_oferta", "1", "true", function(data){
        vm.productosEnOfertas = data;
    });

    ProductService.getByParams("destacado", "1", "true", function(data){
        vm.productosDestacados = data;
    });

    ProductService.getMasVendidos(function (data) {
        vm.productosMasVendidos = data;
    });

    function logout() {
        UserService.logout(function (data) {
            console.log('logout');
            vm.usuario = {};
            vm.isLogged = false;
            $location.path('/main');
        });
    }

    function addProducto(producto) {
        console.log(producto);
        var miProducto = {
            producto_id: producto.producto_id,
            cantidad: 1,
            en_oferta: 1,
            precio_unitario: producto.precios[0].precio,
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

    function calcularCarritoTotal() {
        vm.carritoInfo.cantidadDeProductos = CartVars.carrito_cantidad_productos();
        vm.carritoInfo.totalAPagar = CartVars.carrito_total();

        console.log(vm.carritoInfo);
    }

    function findProducto() {
        if (vm.productoBuscado.length > 2) {
            ProductService.getByParams('nombre', vm.productoBuscado, 'true', function(data){
                vm.productoResultado = (data.length > 0) ? 'RESULTADOS' : 'No se encontro resultado';
                vm.productoList = data;
            });
        } else {
            $location.path('/main');
        }
    }

    function showDetalle(id) {
        $location.path('/productos/' + id);
    }

    function showSubCategoria(categoria_id) {
        console.log(categoria_id);
        vm.showInfo = true;
    }

    function hideSubCategoria(categoria_id) {
        console.log(categoria_id);
        vm.showInfo = false;
    }

}
