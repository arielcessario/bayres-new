'use strict';

angular.module('bayres.usuarios', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/usuarios', {
            templateUrl: 'usuarios/usuario.html',
            controller: 'UsuarioController',
            data: {requiresLogin: false}
        });
    }])
    .controller('UsuarioController', UsuarioController);

UsuarioController.$inject = ['$location', 'UserService', 'AcUtils', 'LinksService', 'CartVars', 'BayresService'];

function UsuarioController($location, UserService, AcUtils, LinksService, CartVars, BayresService) {
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
        'rol_id': 3,    //Revisar si es 1:usuario o 3:Cliente
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

    vm.repeatMail = '';
    vm.message = '';

    //METODOS
    vm.login = login;
    vm.create = create;

    function validateForm() {
        if(vm.userForm.nombre.trim().length > 0 && vm.userForm.apellido.trim().length > 0
            && vm.userForm.fecha_nacimiento.trim().length > 0 && vm.userForm.telefono.trim().length > 0
            && vm.userForm.mail.trim().length > 0 && vm.userForm.password.trim().length > 0
            && vm.repeatMail.trim().length > 0)
            return true;

        return false;
    }

    function login() {
        $location.path('/login');
        LinksService.selectedIncludeTop = 'login/login.html';

        CartVars.broadcast();
    }

    function create() {
        if(validateForm()) {
            if(AcUtils.validateEmail(vm.userForm.mail.trim()) && AcUtils.validateEmail(vm.repeatMail.trim())) {
                if(vm.userForm.mail.trim() === vm.repeatMail.trim()) {
                    UserService.userExist(vm.userForm.mail, function(exist){
                        if(exist == -1) {
                            UserService.create(vm.userForm, function (data) {
                                console.log(data);
                                if(data != -1) {
                                    UserService.login(vm.userForm.mail.trim(), vm.userForm.password.trim(), 1, function(data) {
                                        if (data != -1) {
                                            BayresService.usuario = {id:data.user.usuario_id, nombre: data.user.nombre, apellido: data.user.apellido, mail:data.user.mail, rol:data.user.rol_id};
                                            BayresService.isLogged = true;

                                            $location.path('/main');
                                            LinksService.selectedIncludeTop = 'main/ofertas.html';
                                        }
                                    });
                                } else {
                                    vm.message = 'Error creando el usuario';
                                }
                                //CartVars.broadcast();
                            });
                        } else {
                            vm.message = 'El mail ingresado ya existe. Por favor ingrese otro mail';
                        }
                    });
                } else {
                    vm.message = 'Los mails deben ser iguales';
                }
            } else {
                vm.message = 'El mail ingresado no tiene un formato valido';
            }
        } else {
            vm.message = 'Complete todos los campos';
        }
    }

}