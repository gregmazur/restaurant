'use strict';

/* App Module */

var app =angular.module('app', [
    'ngRoute',
    'tagCtrl'
])

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'views/welcome.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }]);