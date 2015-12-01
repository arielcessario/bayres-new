'use strict';

angular.module('bayres.agreement', [])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/agreement', {
            templateUrl: 'agreement/agreement.html',
            controller: 'AgreementController'
        });
    }])
    .controller('AgreementController', AgreementController);

AgreementController.$inject = ['$location', '$window', 'LinksService'];

function AgreementController($location, $window, LinksService) {
    var vm = this;

    vm.acepto = acepto;
    vm.noAcepto = noAcepto;

    function acepto() {
        $location.path('/main');
        LinksService.agreement = false;
        LinksService.showPage = true;

        LinksService.broadcast();
    }

    function noAcepto() {
        $window.location.href = 'http://www.google.com';
    }
}
