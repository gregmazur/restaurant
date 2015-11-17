'use strict';

/**
 * Created by greg on 15.11.15.
 */
var controllers = angular.module('tagCtrl', ['ngTagEditor'])

controllers.controller('search', ['$scope', '$http', function ($scope, $http) {
    $http.get('test/first_suggestion.json').success(function (data) {
        $scope.tags = data;
    });
    $scope.quantity = 10;
}]);
controllers.controller
