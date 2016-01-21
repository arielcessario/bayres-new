(function () {
    'use strict';

    angular.module('bayres.mailer', [])
        .controller('BayresMailerController', BayresMailerController)
        .service('BayresMailerService', BayresMailerService);


    BayresMailerController.$inject = [];
    function BayresMailerController() {}


    BayresMailerService.$inject = ['$http'];
    function BayresMailerService($http) {

        //Variables
        var service = {};

        service.sendMailConsulta = sendMailConsulta;
        service.sendMailCancelarCarritoComprador = sendMailCancelarCarritoComprador;
        service.sendMailCancelarCarritoVendedor = sendMailCancelarCarritoVendedor;
        service.sendMailCarritoComprador = sendMailCarritoComprador;
        service.sendMailCarritoVendedor = sendMailCarritoVendedor;

        service.sendMailConfirmarCarrito = sendMailConfirmarCarrito;
        service.sendMailCancelarCarrito = sendMailCancelarCarrito;

        return service;

        /**
         *
         * @param contactoForm
         * @param callback
         * @returns {*}
         */
        function sendMailConsulta(contactoForm, callback) {
            return $http.post('mailer/mailer.php',
                {
                    function: 'sendConsulta',
                    'contactoForm': JSON.stringify(contactoForm)
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(data);
                })
        }

        /**
         *
         * @param usuario
         * @param carrito
         * @param callback
         * @returns {*}
         */
        function sendMailCancelarCarritoComprador(usuario, carrito, callback) {
            return $http.post('mailer/mailer.php',
                {
                    function: 'sendCancelarCarritoComprador',
                    'usuario': usuario,
                    'carrito': JSON.stringify(carrito)
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(data);
                });
        }

        /**
         *
         * @param usuario
         * @param email
         * @param carrito
         * @param callback
         * @returns {*}
         */
        function sendMailCancelarCarritoVendedor(usuario, email, carrito, callback) {
            return $http.post('mailer/mailer.php',
                {
                    function: 'sendCancelarCarritoVendedor',
                    'usuario': usuario,
                    'email': email,
                    'carrito': JSON.stringify(carrito)
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(data);
                });
        }

        /**
         *
         * @param mail
         * @param nombre
         * @param carrito
         * @param sucursal
         * @param direccion
         * @param callback
         */
        function sendMailCarritoComprador(mail, nombre, carrito, sucursal, direccion, tipoEnvio, lugarDeEnvio, callback) {
            return $http.post('mailer/mailer.php',
                {
                    function: 'sendCarritoComprador',
                    'email': mail,
                    'nombre': nombre,
                    'carrito': JSON.stringify(carrito),
                    'sucursal': sucursal,
                    'direccion': direccion,
                    'tipoEnvio': tipoEnvio,
                    'lugarDeEnvio': lugarDeEnvio
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(data);
                });
        }

        /**
         *
         * @param mail
         * @param nombre
         * @param carrito
         * @param sucursal
         * @param direccion
         * @param callback
         * @returns {*}
         */
        function sendMailCarritoVendedor(mail, nombre, carrito, sucursal, direccion, tipoEnvio, lugarDeEnvio, callback) {
            return $http.post('mailer/mailer.php',
                {
                    function: 'sendCarritoVendedor',
                    'email': mail,
                    'nombre': nombre,
                    'carrito': JSON.stringify(carrito),
                    'sucursal': sucursal,
                    'direccion': direccion,
                    'tipoEnvio': tipoEnvio,
                    'lugarDeEnvio': lugarDeEnvio
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(data);
                });
        }

        /**
         *
         * @param carritoMail
         * @param callback
         */
        function sendMailConfirmarCarrito(carritoMail, callback) {
            sendMailCarritoComprador(carritoMail.mail, carritoMail.cliente, carritoMail.carrito, carritoMail.sucursal,
                carritoMail.direccion, carritoMail.tipoEnvio, carritoMail.lugarDeEnvio, function(mailComprador){
                    if(mailComprador) {
                        sendMailCarritoVendedor(carritoMail.mail, carritoMail.cliente, carritoMail.carrito, carritoMail.sucursal,
                            carritoMail.direccion, carritoMail.tipoEnvio, carritoMail.lugarDeEnvio, function(mailVendedor){
                                callback(mailVendedor);
                            });
                    } else {
                        callback(false);
                    }
                });
        }

        /**
         *
         * @param usuario
         * @param email
         * @param carrito
         * @param callback
         */
        function sendMailCancelarCarrito(usuario, email, carrito, callback) {
            sendMailCancelarCarritoComprador(usuario, carrito, function(mailComprador){
                if(mailComprador) {
                    sendMailCancelarCarritoVendedor(usuario, email, carrito, function(mailVendedor){
                        callback(mailVendedor);
                    })
                } else {
                    callback(mailComprador);
                }
            });
        }

    }

})();