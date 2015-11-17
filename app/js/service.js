/**
 * Created by greg on 16.11.15.
 */
'use strict';

/* Services */

var mapServices = angular.module('mapServices', ['ngResource']);

mapServices.factory('Coordinate', ['$resource',
    function($resource){
        return $resource('test/:locations.json', {}, {
            query: {method:'GET', params:{locationId:'location'}, isArray:true}
        });
    }]);
