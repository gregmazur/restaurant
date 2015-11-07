var mapApp = angular.module('mapComponentsApp', []);

mapApp.value('NEW_R_ID', -1);

mapApp.service('mapService', function () {
    var map;
    this.setMap = function (myMap) {
        map = myMap;
    };
    this.getMap = function () {
        if (map) return map;
        throw new Error("Map not defined");
    };
    this.getLatLng = function () {
        var center = map.getCenter();
        return {
            lat: center.lat(),
            lng: center.lng()
        };
    };
});

mapApp.service('restaurantsService', function ($filter) {
    // nextId and list both have mock starting data
    this.nextId = 4;
    this.items = [
        {
            id: 1,
            title: 'На лавочке',
            desc: 'дешево и сердито',
            lat: 46.466398,
            lng: 30.728197
        }, {
            id: 2,
            title: 'На привозе',
            desc: 'реальные ребята',
            lat: 46.469878,
            lng: 30.743931
        }, {
            id: 3,
            completed: false,
            title: 'Огни Маяка',
            desc: 'богемный.',
            lat: 46.479222,
            lng: 30.751004
        }
    ];
    this.filter = {};
    this.filtered = function () {
        return $filter('filter')(this.items, this.filter);
    };

    this.getRestaurantById = function (rId) {
        var restaurant, i;
        for (i = this.items.length - 1; i >= 0; i--) {
            restaurant = this.items[i];
            if (restaurant.id === rId) {
                return restaurant;
            }
        }
        return false;
    };
    this.addRestaurant = function (title, desc, lat, lng) {
        var newTodo = {
            id: this.nextId++,
            completed: false,
            title: title,
            desc: desc,
            lat: lat,
            lng: lng
        };
        this.items.push(newRestaurant);
    };
    this.updateTodo = function (todoId, title, desc, lat, lng, comp) {
        var todo = this.getRestaurantById(todoId);
        if (todo) {
            todo.title = title;
            todo.desc = desc;
            todo.lat = lat;
            todo.lng = lng;
            todo.completed = comp;
            todo.id = this.nextId++;
        }
    };
    this.prune = function () {
        var flag = false, i;
        for (var i = this.items.length - 1; i >= 0; i--) {
            if (this.items[i].completed) {
                flag = true;
                this.items.splice(i, 1);
            }
        }
        if (flag) this.nextId++;
    };
});

mapApp.service('markersService', function () {
    this.markers = [];
    this.getMarkerByTodoId = function (todoId) {
        var marker, i;
        for (i = this.markers.length - 1; i >= 0; i--) {
            marker = this.markers[i];
            if (marker.get("id") === todoId) {
                return marker;
            }
        }
        return false;
    };
});

mapApp.service('infoWindowService', function (mapService) {
    var infoWindow;
    this.data = {};
    this.registerInfoWindow = function (myInfoWindow) {
        infowindow = myInfoWindow;
    };
    this.setData = function (todoId, todoTitle, todoDesc) {
        this.data.id = todoId;
        this.data.title = todoTitle;
        this.data.desc = todoDesc;
    };
    this.open = function (marker) {
        infowindow.open(mapService.getMap(), marker);
    };
    this.close = function () {
        if (infowindow) {
            infowindow.close();
            this.data = {};
        }
    };
});

mapApp.service('mapControlsService', function (infoWindowService, markersService, NEW_R_ID) {
    this.editTodo = false;
    this.editTodoId = NEW_R_ID;
    this.newRestaurant = function () {
        this.editTodoById();
    };
    this.editTodoById = function (todoId) {
        this.editTodoId = todoId || NEW_R_ID;
        this.editTodo = true;
    };
    this.openInfoWindowByRestId = function (todoId) {
        var marker = markersService.getMarkerByTodoId(todoId);
        if (marker) {
            infoWindowService.setData(todoId, marker.getTitle(), marker.get("desc"));
            infoWindowService.open(marker);
            return;
        }
    };
});

mapApp.controller('EditTodoCtrl', function ($scope, mapService, restaurantsService, infoWindowService, mapControlsService, NEW_R_ID) {
    var editPinImage,
        editMarker;

    $scope.editTodo = {};

    // editMarker Setup Start

    editPinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + "55FF00",
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34));

    editMarker = new google.maps.Marker({
        title: "Drag Me",
        draggable: true,
        clickable: false,
        icon: editPinImage,
        position: new google.maps.LatLng(0, 0)
    });

    function editMarkerDragCallback(scope, myMarker) {
        return function () {
            var pos = myMarker.getPosition();
            scope.editTodo.lat = pos.lat();
            scope.editTodo.lng = pos.lng();
            if (!scope.$$phase) scope.$apply();
        };
    }

    google.maps.event.addListener(editMarker, 'drag', editMarkerDragCallback($scope, editMarker));

    function editMarkerDblClickCallback(scope) {
        return function () {
            scope.$apply(function () {
                scope.submitTodo();
            });
        };
    }

    google.maps.event.addListener(editMarker, 'dblclick', editMarkerDblClickCallback($scope));

    $scope.$watch('editTodo.lat + editTodo.lng', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            var pos = editMarker.getPosition(),
                latitude = pos.lat(),
                longitude = pos.lng();
            if ($scope.editTodo.lat !== latitude || $scope.editTodo.lng !== longitude)
                editMarker.setPosition(new google.maps.LatLng($scope.editTodo.lat || 0, $scope.editTodo.lng || 0));
        }
    });

    // editMarker Setup End

    $scope.$watch('controls.editTodo + controls.editTodoId', function () {
        var pos, todo = mapControlsService.editTodoId !== NEW_R_ID && restaurantsService.getRestaurantById(mapControlsService.editTodoId);
        infoWindowService.close();
        if (mapControlsService.editTodo) {
            if (todo) {
                $scope.editTodo = {
                    id: todo.id,
                    title: todo.title,
                    desc: todo.desc,
                    lat: todo.lat,
                    lng: todo.lng,
                    comp: todo.completed,
                    saveMsg: "Update",
                    cancelMsg: "Discard"
                };
            } else {
                pos = mapService.getLatLng();
                $scope.editTodo = {
                    id: NEW_R_ID,
                    lat: pos.lat,
                    lng: pos.lng,
                    saveMsg: "Save",
                    cancelMsg: "Discard"
                };
            }
            editMarker.setMap(mapService.getMap());
        }
    });

    $scope.submitTodo = function () {
        if ($scope.editTodoForm.$valid) {
            if ($scope.editTodo.id === NEW_R_ID)
                addRestaurant();
            else
                editTodo();
        }
    }

    $scope.resetCloseTodoForm = function () {
        editMarker.setMap(null);
        mapControlsService.editTodo = false;
        mapControlsService.editTodoId = NEW_R_ID;
        $scope.editTodo = {};
    }

    function addRestaurant() {
        restaurantsService.addRestaurant(
            $scope.editTodo.title,
            $scope.editTodo.desc,
            $scope.editTodo.lat,
            $scope.editTodo.lng);
        $scope.resetCloseTodoForm();
    }

    function editTodo() {
        restaurantsService.updateTodo(
            $scope.editTodo.id,
            $scope.editTodo.title,
            $scope.editTodo.desc,
            $scope.editTodo.lat,
            $scope.editTodo.lng,
            $scope.editTodo.comp);
        $scope.resetCloseTodoForm();
    }
});

mapApp.directive('restMaps', function ($compile) {
    return {
        controller: function ($scope, $location, mapService, mapControlsService, infoWindowService, restaurantsService, markersService) {
            if ($location.path() === '') {
                $location.path('/');
            }

            $scope.location = $location;
            $scope.infow = infoWindowService;
            $scope.controls = mapControlsService;

            this.registerInfoWindow = function (myInfoWindow) {
                infoWindowService.registerInfoWindow(myInfoWindow);
            };

            this.registerMap = function (myMap) {
                mapService.setMap(myMap);
                $scope.todos = restaurantsService;
            };

            $scope.$watch('location.path()', function (path) {
                restaurantsService.filter = (path === '/active') ?
                {completed: false} : (path === '/completed') ?
                {completed: true} : null;
            });

            $scope.$watch('location.path() + todos.nextId ', function () {
                var i,
                    rests = restaurantsService.filtered(),
                    map = mapService.getMap(),
                    todoId,
                    marker,
                    markers = markersService.markers,
                    markerId,
                    uniqueTodos = {};

                function addMarkerByTodoIndex(todoIndex) {
                    var marker,
                        markerOptions,
                        todo = rests[todoIndex];

                    markerOptions = {
                        map: map,
                        title: todo.title,
                        position: new google.maps.LatLng(todo.lat, todo.lng)
                    };
                    marker = new google.maps.Marker(markerOptions);
                    marker.setValues({
                        id: todo.id,
                        desc: todo.desc
                    });
                    markersService.markers.push(marker);

                    function markerClickCallback(scope, todoId) {
                        return function () {
                            scope.$apply(function () {
                                mapControlsService.openInfoWindowByRestId(todoId);
                            });
                        };
                    }

                    google.maps.event.addListener(marker, 'click', markerClickCallback($scope, todo.id));

                    function markerDblClickCallback(scope, todoId) {
                        return function () {
                            scope.$apply(function () {
                                mapControlsService.editTodoById(todoId);
                            });
                        };
                    }

                    google.maps.event.addListener(marker, 'dblclick', markerDblClickCallback($scope, todo.id));
                }

                for (i = rests.length - 1; i >= 0; i--) {
                    uniqueTodos[rests[i].id] = i;
                }

                for (i = markers.length - 1; i >= 0; i--) {
                    marker = markers[i];
                    markerId = marker.get("id");
                    if (uniqueTodos[markerId] !== undefined) {
                        delete uniqueTodos[markerId];
                    } else {
                        marker.setMap(null);
                        markers.splice(i, 1);
                    }
                }

                for (todoId in uniqueTodos) {
                    if (uniqueTodos.hasOwnProperty(todoId)) {
                        addMarkerByTodoIndex(uniqueTodos[todoId]);
                    }
                }
            });
        },
        link: function (scope, elem, attrs, ctrl) {
            var mapOptions,
                latitude ,
                longitude ,
                infoWindowTemplate,
                infoWindowElem,
                infowindow,
                restaurantsControlTemplate,
                todosControlElem,
                editRestaurantsControlTemplate,
                editTodoControlElem,
                map;

                navigator.geolocation.getCurrentPosition(applyPosition);
            latitude =  46.456140;
            longitude =  30.733569;

            function applyPosition(position) {


            }


                infoWindowTemplate = document.getElementById('infoWindowTemplate').innerHTML.trim();
                infoWindowElem = $compile(infoWindowTemplate)(scope);
                infowindow = new google.maps.InfoWindow({
                    content: infoWindowElem[0]
                });

                ctrl.registerInfoWindow(infowindow);


                mapOptions = {
                    zoom: 12,
                    disableDefaultUI: true,
                    center: new google.maps.LatLng(latitude, longitude),
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                google.maps.visualRefresh = true;

                map = new google.maps.Map(elem[0], mapOptions);

                ctrl.registerMap(map);

                restaurantsControlTemplate = document.getElementById('restaurantsControlTemplate').innerHTML.trim();
                todosControlElem = $compile(restaurantsControlTemplate)(scope);
                map.controls[google.maps.ControlPosition.TOP_LEFT].push(todosControlElem[0]);

                editRestaurantsControlTemplate = document.getElementById('editRestaurantsControlTemplate').innerHTML.trim();
                editTodoControlElem = $compile(editRestaurantsControlTemplate)(scope);
                map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(editTodoControlElem[0]);
            }
        };
});