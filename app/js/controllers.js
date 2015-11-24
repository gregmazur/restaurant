'use strict';

/**
 * Created by greg on 15.11.15.
 */
var controllers = angular.module('tagCtrl', ['ngTagEditor'])

controllers.controller('search', ['$scope', '$http', function ($scope, $http) {
    $scope.tags = [];
    $scope.locations = [];

}]);