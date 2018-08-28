summerready = function () {
    var location_end = summer.pageParam.location_end;
    var userName = summer.pageParam.userName;
    getAPPMethod(function () {
        if (window.gasstation) {
            var location = {
                lng: location_end[0],
                lat: location_end[1],
                venderName: userName
            }
            var newLocation = JSON.stringify(location);
            window.gasstation.mapLocation(newLocation);
        } else {
            getLngLat(function (data) {
                GoDestination(data, location_end);
            })
        }
    }, function () {
        /* if(window.webkit){
            window.webkit.messageHandlers.mapLocation.postMessage({
                Lng: location_end[0],
                lat: location_end[1]
            });
        }else {
            getLngLat(function (data) {
                GoDestination(data, location_end);
            })
        } */
        getLngLat(function (data) {
            GoDestination(data, location_end);
        })
    }, function () {
        getLngLat(function (data) {
            GoDestination(data, location_end);
        })
    });
};
