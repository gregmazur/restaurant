'use strict';

/* App Module */

angular.module('app', [
    'ngRoute',
    'tagCtrl'
])

.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'views/welcome.html'
        }).
        when('/map', {
            templateUrl: 'views/map.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }]);