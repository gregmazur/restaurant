'use strict';

/**
 * Created by greg on 15.11.15.
 */
var controllers = angular.module('controllers', ['ngResource','ngMaterial', 'ngAnimate', 'ngAria']);

controllers.factory('location', function ($resource) {
    return $resource("test/locations.json")
});

controllers.directive('map', function ($compile, locationService, $timeout) {
    return function (scope, elem, attrs) {
        var mapOptions,
            latitude,
            longitude,
            locations,
            map;

        navigator.geolocation.getCurrentPosition(
            function (position) {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
            },
            function () {
                alert('Position could not be determined.')
            },
            {
                enableHighAccuracy: true
            }
        );


        $timeout(function () {
            locations = locationService.locationsList;
            latitude = latitude && parseFloat(latitude) || 46.4781688;
            longitude = longitude && parseFloat(longitude) || 30.7138338;
            locationService.currentLocation.latitude = latitude;
            locationService.currentLocation.longitude = longitude;

            mapOptions = {
                zoom: 8,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    position: google.maps.ControlPosition.BOTTOM_CENTER
                },
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                },
                center: new google.maps.LatLng(latitude, longitude)
            };
            map = new google.maps.Map(elem[0], mapOptions);

            function createMarker(location) {
                var marker = new google.maps.Marker({
                    position: {
                        lat: location.latitude,
                        lng: location.longitude
                    },
                    map: map,
                    title: location.name
                });
                return marker;
            }

            function createAllMarkers() {
                for (var i = 0; i < locations.length; i++) {
                    var marker = createMarker(locations[i]);
                    marker.setMap(map);
                }
            }
            locationService.map = map;
            createAllMarkers();
        }, 250);


    };

});

controllers.controller("searchLstCtrl", function ($scope, locationService) {

    console.log(locationService.locationsList);
    $scope.search = "";
    $scope.locations = locationService;
    $scope.currentLocation = locationService.currentLocation;

    //searches for location with similar name,tag, description
    $scope.searcher = function (location) {
        if ($scope.search) {
            return location.name.indexOf($scope.search.toLowerCase()) == 0 ||
                location.tag.indexOf($scope.search.toLowerCase()) == 0 ||
                location.desc.indexOf($scope.search.toLowerCase()) == 0;
        }
        return true;
    };

    $scope.chooseLocation = function (location) {
        locationService.selectedLocation = location;
        locationService.map.setCenter({
            lat: location.latitude,
            lng: location.longitude
        });
    };

    $scope.calculateDistance = function (destination) {
        return geolib.getDistance(locationService.currentLocation, destination)
    };
});


controllers.service('locationService', function (location) {

    var result = {
        'map': null,
        'selectedLocation': null,
        'currentLocation': {'longitude': null, 'latitude': null},
        'locationsList': [],
        'getLocations': function () {
            location.get(function (response) {
                console.log(response);
                angular.forEach(response.data, function (loc) {
                    result.locationsList.push(new location(loc));
                })
            });
        }
    };
    result.getLocations();
    return result;
});
