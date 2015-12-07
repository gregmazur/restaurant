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
                zoom: 10,
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

            function createMarker(longitude, latitude, icon) {
                if(icon != null){
                    var marker = new google.maps.Marker({
                        position: {
                            lat: latitude,
                            lng: longitude
                        },
                        map: map,
                        title: location.name,
                        icon: icon
                    });
                    return marker;
                }
                var marker = new google.maps.Marker({
                    position: {
                        lat: latitude,
                        lng: longitude
                    },
                    map: map,
                    title: location.name
                });
                return marker;
            }

            function createAllMarkers() {
                for (var i = 0; i < locations.length; i++) {
                    var marker = createMarker(locations[i].longitude,locations[i].latitude);
                    marker.setMap(map);
                }
            }
            locationService.map = map;
            function addMyLocation (){
                var image = {
                    url: 'pic/location.png',
                    // This marker is 20 pixels wide by 32 pixels high.
                    size: new google.maps.Size(20, 32),
                    // The origin for this image is (0, 0).
                    origin: new google.maps.Point(0, 0),
                    // The anchor for this image is the base of the flagpole at (0, 32).
                    anchor: new google.maps.Point(0, 32)
                };
                var marker = createMarker(longitude,latitude, image);
                marker.setMap(map);
            }
            addMyLocation();
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
