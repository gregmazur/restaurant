'use strict';

var editor = angular.module('ngTagEditor', ['uiGmapgoogle-maps']);
var filter = editor.filter('getCol', function () {
    return function (items, row) {
        return items && items.map(function (item) {
                return item[row];
            }).join(',');
    }
});
filter.directive('focusMe', ['$timeout', '$parse', function ($timeout, $parse) {
    return {
        link: function (scope, element, attrs) {
            var model = $parse(attrs.focusMe);
            scope.$watch(model, function (value) {
                if (value === true) {
                    $timeout(function () {
                        element[0].focus();
                    }, 0);
                }
            });
            element.bind('blur', function () {
                scope.$apply(model.assign(scope, false));
            });
        }
    };
}]);
filter.directive('tagEditor', function () {
    return {
        restrict: 'AE',
        /* require: 'ngModel',*/
        scope: {
            tags: '=ngModel'
        },
        replace: true,
        templateUrl: 'views/autocomplete.html',
        controller: ['$scope', '$attrs', '$element', '$http', '$filter', function ($scope, $attrs, $element, $http, $filter) {

            $scope.options = [];
            $scope.options.output = $attrs.output || 'name';
            $scope.options.fetch = $attrs.fetch;
            $scope.options.placeholder = $attrs.placeholder || 'Enter kind of restaurant you need';
            $scope.options.apiOnly = $attrs.apiOnly || false;
            $scope.search = '';

            $scope.$watch('search', function () {
                $http.get($scope.options.fetch + $scope.search).success(function (data) {
                    $scope.suggestions = data.data;
                    console.log(data);
                });
            });
            $scope.add = function (id, name) {
                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.tags.push({'name': name});
                        $scope.search = '';
                    });
                }, 200)

            };
            $scope.remove = function (index) {
                $scope.tags.splice(index, 1);
            };

            $element.find('input').on('keydown', function (e) {
                var keys = [8, 13, 32];
                if (keys.indexOf(e.which) !== -1) {
                    if (e.which == 8) { /* backspace */
                        if ($scope.search.length === 0 && $scope.tags.length) {
                            $scope.tags.pop();
                            e.preventDefault();
                        }
                    }
                    else if (e.which == 32 || e.which == 13) { /* space & enter */
                        if ($scope.search.length && !$scope.apiOnly) {
                            if (!$scope.apiOnly) {
                                $scope.add(0, $scope.search);
                                e.preventDefault();
                            }
                        }
                    }
                    $scope.$apply();
                }
            });
        }],
        link: function (scope, elem, attrs) {
            elem.bind('mousedown', function (e) {
                e.stopPropagation();
                scope.shutWelcome = true;
                scope.showMap = true;
                console.log(scope.tags);
                //add get request with scope.tags.join()

            });
        }
    }
});
filter.controller('MapsController', function($scope, $http) {
    $scope.map = {
        center: {
            latitude: 46.4781688,
            longitude: 30.7138338
        },
        zoom: 13
    };
    $scope.locations = [];
    // add test locations for example, wiil need to change to our url
    $http.get('test/locations.json').success(function (data) {
        $scope.locations = data;
    });

    // add markers for each location on the loaded tour
    $scope.markers = [];
    // function to create an individual marker
    $scope.createMarker = function(location) {
        var marker = {
            idKey: location.number,
            coords: {
                latitude: location.latitude,
                longitude: location.longitude
            }
        };
        return marker;
    };
    // function to fill array of markers
    $scope.createMarkers = function() {
        for (var i = 0; i < $scope.locations.length; i++) {
            var marker = $scope.createMarker($scope.locations[i]);
            $scope.markers.push(marker);
        }
    };
    // call upon controller initialization
    $scope.createMarkers();
});
