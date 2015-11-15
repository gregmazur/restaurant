'use strict';

/**
 * Created by greg on 15.11.15.
 */
var app = angular.module('app', ['ngTagEditor']);

app.controller('search', ['$scope', '$http', function ($scope, $http) {
    $http.get('test/first_suggestion.json').success(function (data) {
        $scope.tags = data;
    });
    $scope.quantity = 10;
}]);
