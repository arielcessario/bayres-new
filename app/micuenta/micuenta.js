'use strict';

angular.module('bayres.micuenta', [
    'ngRoute',
    'ngCookies',
    'angular-storage',
    'angular-jwt',
    'acUtils',
    'acUsuarios',
    'acProductos'
])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/micuenta', {
            templateUrl: 'micuenta/micuenta.html',
            controller: 'MiCuentaController',
            data: {requiresLogin: true}
        });
    }])
    .controller('MiCuentaController', MiCuentaController);

MiCuentaController.$inject = ['$location', 'UserService', 'CartVars', 'CartService', 'AcUtils'];

function MiCuentaController($location, UserService, CartVars, CartService, AcUtils) {
    var vm = this;

    vm.userForm = {
        'nombre': '',
        'apellido': '',
        'mail': '',
        'nacionalidad_id': 0,
        'tipo_doc': 0,
        'nro_doc': '',
        'comentarios': '',
        'marcado': '',
        'telefono': '',
        'fecha_nacimiento': '',
        'profesion_id': 0,
        'saldo': '',
        'rol_id': 0,
        'news_letter': 0,
        'password': ''
    };
    vm.dirForm = {
        'usuario_id': 0,
        'calle': '',
        'nro': 0,
        'piso': 0,
        'puerta': '',
        'ciudad_id': 0
    };
    vm.historico_pedidos = [];
    vm.pedido = {};
    vm.repeatMail = '';
    vm.message = '';

    vm.home = home;
    vm.update = update;
    vm.getPedidoSelected = getPedidoSelected;


    if(UserService.getLogged() != false) {
        var user = UserService.getLogged();

        vm.userForm.apellido = user.apellido;
        vm.userForm.nombre = user.nombre;
        vm.userForm.mail = user.mail;
        vm.userForm.news_letter = user.news_letter;

        getHistoricoDePedidos(user);
    }

    function getHistoricoDePedidos(usuario) {
        console.log(usuario);
        CartService.getByParams("status","1","true",usuario.usuario_id, function(data){
            vm.historico_pedidos = data.sort(function(a, b){
                return b.carrito_id - a.carrito_id;
            });
            var select_one = { pedido_id:-1, fecha:'Seleccione un pedido' };
            vm.historico_pedidos.unshift(select_one);
            vm.pedido = vm.historico_pedidos[0];
        });
    }

    function getPedidoSelected(pedido) {
        console.log(pedido);
        if(pedido != null) {
            vm.carrito_mensaje = '0';
            vm.message_error = '';
            vm.pedido = pedido;
        }
    }

    function validateForm() {
        if(vm.userForm.nombre.trim().length > 0 && vm.userForm.apellido.trim().length > 0
            && vm.userForm.fecha_nacimiento.trim().length > 0 && vm.userForm.telefono.trim().length > 0
            && vm.userForm.mail.trim().length > 0 && vm.userForm.password.trim().length > 0
            && vm.repeatMail.trim().length > 0)
            return true;

        return false;
    }

    function update() {
        if(validateForm()) {
            UserService.update(vm.userForm, function (data) {
                console.log(data);
            });
        } else {
            vm.message = 'Complete todos los campos';
        }
    }

    function home() {
        $location.path('/main');
    }
}