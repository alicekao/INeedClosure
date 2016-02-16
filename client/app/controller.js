var app = angular.module('myApp', ['map.services'])

//dependencies injected include DBActions factory and Map factory
.controller('FormController', function($scope, $http, DBActions, Map){
  $scope.user = {};

  $scope.sendPost = function(){
    //convert inputted address
    Map.geocodeAddress(geocoder, Map.map, $scope.user.location, function(converted) {
      //after address converted, save user input item and location to db
      DBActions.saveToDB({item: $scope.user.item, LatLng: converted});
    });
  };

  //this function filters map based on what user enters into filter field
  $scope.filterMap = function() {
    var searchInput = $scope.search.input;
    DBActions.filterDB(searchInput);
  };

  //this function retrieves everything from the database and renders a map on page
  //this would happen when user first visits page, when user submits an item, or when user deletes an item
  $scope.initMap = function(){
    Map.loadAllItems();
  };
})

.factory('DBActions', function($http, Map){

  //the 'toSave' parameter is an object that will be entered into database,
  //'toSave' has item prop and LatLng properties
  var saveToDB = function(toSave){
  return $http.post('/', toSave)

    //after item has been saved to db, returned data has a data property
    //so we need to access data.data, see below
    .then(function(data){

      //data.data has itemName prop, itemLocation prop, and _id prop, which are all expected since this is how
      //our mongoDB is formatted. Anything returned from db should have these props
      Map.addMarker(map, data.data);
      //the 'map' argument here is referencing the global map declared in app.js
      //this could be manipulated in chrome console by user. Future refactor could be to store
      //map within Map factory instead of global space.

    }, function(err){
      console.log(err);
    });
  };

  //this function creates a new map based on filtering by whatever user enters in filter field
  //it is invoked within $scope.filterMap, see the above controller
  var filterDB = function(toFilterBy) {

    //the below line gets everything from the db
    return $http.get('/api/items')
      .then(function(data) {

        //filter our returned db by the desired itemName
        var filtered = data.data.filter(function(item) {
          return item.itemName.indexOf(toFilterBy) > -1;
        });

        //re-initialize map with only these markers
        Map.initMap(filtered);
      }, function(err) {
        console.log("error in filtering", err);
      });
  };

  //the DBActions factory returns the below object with methods of the functions
  //defined above
  return {
    saveToDB: saveToDB,
    filterDB: filterDB
  };
});
