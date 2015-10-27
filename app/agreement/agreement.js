'use strict';

angular.module('bayres.agreement', [
    'ngRoute'
])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/agreement', {
            templateUrl: 'agreement/agreement.html',
            controller: 'AgreementController'
        });
    }])
    .controller('AgreementController', AgreementController);

AgreementController.$inject = ['$location', '$window'];

function AgreementController($location, $window) {
    var vm = this;

    vm.acepto = acepto;
    vm.noAcepto = noAcepto;

    function acepto() {
        $location.path('/main');
    }

    function noAcepto() {
        $window.location.href = 'http://www.google.com';
    }
}
