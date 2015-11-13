window.appName = 'bayres';
(function () {

    'use strict';

// Declare app level module which depends on views, and components
    angular.module('bayres', [
        'ngRoute',
        'ngCookies',
        'ngAnimate',
        'duScroll',
        'angular-storage',
        'angular-jwt',
        'acUtils',
        'acUsuarios',
        'acProductos',
        'bayres.agreement',
        'bayres.main',
        'bayres.login',
        'bayres.usuarios',
        'bayres.productos',
        'bayres.carrito',
        'bayres.micuenta',
        'bayres.contacto',
        'bayres.detalle',
        'bayres.legales'
    ]).
        config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .otherwise({redirectTo: '/agreement'})
        }])
        .controller('BayresController', BayresController)
        .service('LinksService', LinksService)
        .service('BayresService', BayresService);


    BayresController.$inject = ['$scope', '$location', 'UserService', 'ProductService',
        'CategoryService', 'LinksService', 'CartVars', 'AcUtils', '$rootScope',
        'BayresService', 'LoginService', '$timeout', '$document'];

    function BayresController($scope, $location, UserService, ProductService,
                              CategoryService, LinksService, CartVars, AcUtils,
                              $rootScope, BayresService, LoginService, $timeout, $document) {

        var vm = this;
        vm.filtro = '';
        vm.isLogged = false;
        vm.selectedPage = 'INICIO';
        vm.selectedIncludeTop = 'main/ofertas.html';
        vm.selectedIncludeMiddle = 'main/destacados.html';
        vm.selectedIncludeBottom = 'main/masvendidos.html';
        vm.menu_mobile_open = false;
        vm.showCategorias = false;
        vm.links = LinksService.links;
        vm.id_origen = 'seccion-2';

        var productosList = [];
        vm.categorias = [];
        ///vm.productos = [];

        vm.usuario = {};
        vm.producto = {};
        vm.filtro = '';
        //vm.productoResultado = '';
        //vm.existenProductos = false;
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
        vm.clearFiltro = clearFiltro;
        vm.goToAnchor = goToAnchor;


        if(UserService.getFromToken() != false){

            LoginService.isLogged = true;
            LoginService.usuario = UserService.getFromToken().data;
            LoginService.broadcast();
        }else {
            LoginService.isLogged = false;
            LoginService.usuario = {};
            LoginService.broadcast();
        }


        $rootScope.$on('$locationChangeStart', function (e, to) {
            goTo({path: $location.$$path});
            //goTo(location);
        });


        function goToAnchor(id, id_origen) {
            vm.id_origen = id_origen != undefined ? id_origen : 'seccion-2';
            $timeout(function () {
                var duration = 1000;
                var offset = 30; //pixels; adjust for floating menu, context etc
                //Scroll to #some-id with 30 px "padding"
                //Note: Use this in a directive, not with document.getElementById
                if (document.getElementById(id) != undefined) {
                    var someElement = angular.element(document.getElementById(id));
                    $document.scrollToElement(someElement, offset, duration);
                }
            }, 10);


        }

        LoginService.listen(function () {
            vm.usuario = LoginService.usuario;
            vm.isLogged = LoginService.isLogged;
        });

        LinksService.listen(function () {
            vm.selectedIncludeTop = LinksService.selectedIncludeTop;
            vm.selectedIncludeMiddle = LinksService.selectedIncludeMiddle;
            vm.selectedIncludeBottom = LinksService.selectedIncludeBottom;
        });

        CartVars.listen(function () {
            vm.carritoInfo.cantidadDeProductos = CartVars.carrito_cantidad_productos();
            vm.carritoInfo.totalAPagar = CartVars.carrito_total();
        });

        $scope.$on('links', function (event, args) {
            vm.links = LinksService.links;
        });

        //if (UserService.getLogged() != false) {
        //    vm.usuario = UserService.getLogged();
        //    vm.isLogged = true;
        //}

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
            if (location.path === '/main') {
                LinksService.selectedIncludeTop = 'main/ofertas.html';
                LinksService.selectedIncludeMiddle = 'main/destacados.html';
                LinksService.selectedIncludeBottom = 'main/masvendidos.html';

                vm.filtro = '';
                BayresService.productos = [];
                BayresService.search = false;
                BayresService.broadcast();
                LinksService.broadcast();

            } else if (location.path === '/categoria') {
                LinksService.selectedIncludeTop = 'login/login.html';
            } else if (location.path === '/carrito') {
                LinksService.selectedIncludeTop = 'carrito/carrito.html';
            } else if (location.path === '/micuenta') {
                LinksService.selectedIncludeTop = 'micuenta/micuenta.html';
            } else if (location.path === '/contacto') {
                LinksService.selectedIncludeTop = 'contacto/contacto.html';
            } else if (location.path === '/legales') {
                $location.path('/legales/1');
                LinksService.productId = 1;
                LinksService.selectedIncludeTop = 'legales/legales.html';
            } else if (location.path === '/login') {
                $location.path('/login');
                LinksService.selectedIncludeTop = 'login/login.html';
                //LinksService.selectedIncludeMiddle = 'main/destacados.html';
                //LinksService.selectedIncludeBottom = 'main/masvendidos.html';
            }
            LinksService.broadcast();
            $location.path(location.path);
            vm.selectedPage = location.nombre;
        }

        function login() {
            $location.path('/login');
            LinksService.selectedIncludeTop = 'login/login.html';
            LinksService.broadcast();
        }

        function createUsuario() {
            $location.path('/usuarios');
            LinksService.selectedIncludeTop = 'usuarios/usuario.html';
            LinksService.broadcast();
        }

        function logout() {
            UserService.logout(function (data) {
                console.log('logout');
                vm.usuario = {};
                vm.isLogged = false;
                $location.path('/main');

                LoginService.usuario = vm.usuario;
                LoginService.broadcast();
            });
        }

        ProductService.get(function (data) {
            productosList = data;
            //console.log(productosList);
        });

        CategoryService.getByParams("parent_id", "-1", "true", function (data) {
            vm.categorias = data;
            var i = 0;
            vm.categorias.forEach(function (categoria) {
                CategoryService.getByParams("parent_id", categoria.categoria_id.toString(), "true", function (list) {
                    vm.categorias[i].subcategorias = list;
                    var j = 0;
                    list.forEach(function (subcategoria) {
                        var listCount = [];
                        ProductService.getByCategoria(subcategoria.categoria_id, function (data) {
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
            ProductService.getByCategoria(categoria_id, function(data){
                BayresService.productos = data;
                BayresService.search = true;
                BayresService.broadcast();

                LinksService.selectedIncludeTop = 'main/productos.html';
                LinksService.selectedIncludeMiddle = '';
                LinksService.selectedIncludeBottom = '';
                LinksService.broadcast();
            });
        }

        function buscarProducto(filtro) {
            if (filtro.length > 2) {
                ProductService.getByParams("nombre,descripcion", filtro, "false", function (data) {

                    BayresService.productos = data;
                    BayresService.search = true;
                    BayresService.broadcast();

                    LinksService.selectedIncludeTop = 'main/productos.html';
                    LinksService.selectedIncludeMiddle = '';
                    LinksService.selectedIncludeBottom = '';
                    LinksService.broadcast();
                });
            } else {
                BayresService.productos = [];
                BayresService.search = false;
                BayresService.broadcast();

                LinksService.selectedIncludeTop = 'main/ofertas.html';
                LinksService.selectedIncludeMiddle = 'main/destacados.html';
                LinksService.selectedIncludeBottom = 'main/masvendidos.html';
                LinksService.broadcast();
            }
        }

        function clearFiltro() {
            vm.filtro = '';
            BayresService.productos = [];
            BayresService.search = false;
            BayresService.broadcast();

            LinksService.selectedIncludeTop = 'main/ofertas.html';
            LinksService.selectedIncludeMiddle = 'main/destacados.html';
            LinksService.selectedIncludeBottom = 'main/masvendidos.html';
            LinksService.broadcast();
        }

// Create cross browser requestAnimationFrame method:
        window.requestAnimationFrame = window.requestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.msRequestAnimationFrame
            || function (f) {
                setTimeout(f, 1000 / 60)
            };

//var  scrollheight = document.body.scrollHeight; // altura de todo el documento
//var  WindowHeight = window.innerHeight; // altura de la ventana del navegador

        var sucursal1 = document.getElementById('sucursal1');
        var sucursal2 = document.getElementById('sucursal2');
        var sucursal3 = document.getElementById('sucursal3');
//var sucursal4 = document.getElementById('sucursal4');

        var tierra1 = document.getElementById('tierra1');
        var tierra2 = document.getElementById('tierra2');
        var tierra3 = document.getElementById('tierra3');

        var roca1 = document.getElementById('roca1');
        var roca2 = document.getElementById('roca2');
        var roca3 = document.getElementById('roca3');

        var lava0 = document.getElementById('lava0');
        var lava1 = document.getElementById('lava1');
        var lava2 = document.getElementById('lava2');
        var lava3 = document.getElementById('lava3');
        //var lava4 = document.getElementById('lava4');

        function parallaxbubbles() {

            var scrolltop = window.pageYOffset; // get number of pixels document has scrolled vertically
            //var scrollamount = (scrollTop / (scrollheight-WindowHeight)) * 100 // Obtener cantidad desplaza (en%)
            //console.log(scrollamount);


            sucursal1.style.transform = 'translateY(' + (scrolltop * .8) + 'px)'; // move bubble1 at 20% of scroll rate
            sucursal2.style.webkitTransform = 'translateY(' + (scrolltop * .6) + 'px)'; // move bubble2 at 50% of scroll rate
            //sucursal3.style.webkitTransform = 'translateY(' + (200 - scrolltop * 1) + 'px)'; // move bubble2 at 50% of scroll rate
            //sucursal4.style.top = 50 -scrolltop * .7 + 'px'; // move bubble2 at 50% of scroll rate

            tierra1.style.transform = 'translateY(' + scrolltop * .2 + 'px)';
            tierra2.style.transform = 'translateY(' + scrolltop * .3 + 'px)';
            tierra3.style.transform = 'translateY(' + scrolltop * .1 + 'px)';

            //roca1.style.transform = 'translateY(' + ((scrolltop * .4)-160) + 'px)';
            roca1.style.transform = 'translateY(' + ((scrolltop * .4) - 150) + 'px)';
            roca2.style.transform = 'translateY(' + ((scrolltop * .6) - 450) + 'px)';
            //roca3.style.transform = 'translateY(' + scrolltop * .09 + 'px)';

            //lava1.style.transform = 'translateY(' + ((scrolltop * .3)-300) + 'px)';
            //lava2.style.transform = 'translateY(' + ((scrolltop * .3)-400) + 'px)';
            //lava3.style.transform = 'translateY(' + ((scrolltop * .3)-350) + 'px)';
            //lava4.style.transform = 'translateY(' + (450 - (scrolltop * .2)) + 'px)';

            if (scrolltop > 1700) {
                lava2.style.transform = 'translateY(' + ((scrolltop * .2 - 360) + 400) + 'px)';
                lava1.style.transform = 'translateY(' + ((scrolltop * .3 - 540) + 350) + 'px)';
                lava0.style.transform = 'translateY(' + ((scrolltop * .4 - 720) + 300) + 'px)';
            } else {
                lava2.style.transform = 'translateY(400px)';
                lava1.style.transform = 'translateY(350px)';
                lava0.style.transform = 'translateY(300px)';

            }

            $scope.$apply();

        }

        //window.addEventListener('scroll', function () { // on page scroll
        //    requestAnimationFrame(parallaxbubbles); // call parallaxbubbles() on next available screen paint
        //}, false);


        var latestKnownScrollY = 0,
            ticking = false;

        function onScroll() {
            latestKnownScrollY = window.scrollY;
            requestTick();
        }

        function requestTick() {
            if (!ticking) {
                window.requestAnimationFrame(update);
            }
            ticking = true;
        }

        function update() {
            ticking = false;

            var currentScrollY = latestKnownScrollY;
            parallaxbubbles();

        }

        var isMobile = mobileAndTabletcheck();

        //if(isMobile == false){
        window.addEventListener('scroll', onScroll, false);
        //}


        /**
         * TODO: Agregar a UTILS
         * @returns {boolean}
         */
        function mobileAndTabletcheck() {
            var check = false;
            (function (a) {
                if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))check = true
            })(navigator.userAgent || navigator.vendor || window.opera);
            return check;
        }


    }

    /*ARMO UN SERVICIO PARA EL MENU*/
    LinksService.$inject = ['$rootScope'];
    function LinksService($rootScope) {

        this.links = [
            {nombre: 'INICIO', path: '/main', tieneImagen: true, nombreImagen: 'home.png'},
            {nombre: 'Categorias', path: '/categoria', tieneImagen: true, nombreImagen: 'categorias.png'},
            {nombre: 'Mi Carrito', path: '/carrito', tieneImagen: false},
            {nombre: 'Mi Cuenta', path: '/micuenta', tieneImagen: false},
            {nombre: 'Finalizar Compra', path: '/carrito', tieneImagen: false},
            {nombre: 'Contacto', path: '/contacto', tieneImagen: true, nombreImagen: 'contacto.png'}
        ];

        this.productId = 0;

        this.selectedIncludeTop = 'main/ofertas.html';
        this.selectedIncludeMiddle = 'main/destacados.html';
        this.selectedIncludeBottom = 'main/masvendidos.html';

        this.broadcast = function () {
            $rootScope.$broadcast("refreshSelectedPage")
        };

        this.listen = function (callback) {
            $rootScope.$on("refreshSelectedPage", callback)
        };
    }

    BayresService.$inject = ['$rootScope'];
    function BayresService($rootScope) {

        this.productos = [];
        this.search = false;

        this.broadcast = function () {
            $rootScope.$broadcast("refreshSelectedPage")
        };

        this.listen = function (callback) {
            $rootScope.$on("refreshSelectedPage", callback)
        };
    }

})();

