'use strict';

var editor = angular.module('ngTagEditor', ['uiGmapgoogle-maps']);
var filter = editor.filter('getCol', function () {
    return function (items, row) {
        return items && items.map(function (item) {
                return item[row];
            }).join(',');
    }
});
var locations = [];
var renderMap;
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
        //scope: {
        //    tags: '=ngModel',
        //},
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
            $scope.add = function (id, name, longitude, latitude) {
                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.tags.push({'name': name});
                        var names = $scope.tags.map(function(item) {
                            return item['name'];
                        });
                        //example of query
                        console.log("//q=" + names.join('|'));
                        //for test
                        locations.push({'name': name, 'longitude':longitude, 'latitude':latitude});
                        console.log(locations);
                        $scope.createMarkers();

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
            });
        }
    }
});
editor.controller('MapsController', function ($scope, $http) {

    $scope.map = {
        center: {
            latitude: 46.4781688,
            longitude: 30.7138338
        },
        zoom: 13
    };
    if (locations[0] !== null) {

        // add markers for each location on the loaded tour
        var markers = [];
        // function to create an individual marker
        $scope.createMarker = function (location) {
            var marker = new google.maps.Marker({
                coords: {'lat': location.latitude, 'lng': location.longitude},
                map: scope.map,
                title: location.name
            });
            return marker;
        };
        // function to fill array of markers
        $scope.createMarkers = function () {
            for (var i = 0; i < locations.length; i++) {
                var marker = $scope.createMarker(locations[i]);
                $scope.markers.push(marker);
            }
        };
        renderMap = $scope.createMarkers;
    }
});
