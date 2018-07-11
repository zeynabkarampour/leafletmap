var map;
// var map = new L.map('map', {
//   center: [20.0, 5.0],
//   minZoom: 2,
//   zoom: 2
// })

// L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
//   subdomains: ['a', 'b', 'c']
// }).addTo(map);


var myURL = jQuery('script[src$="main.js"]').attr('src').replace('main.js', '');

var myIcon = L.icon({
    iconUrl: myURL + 'images/pin24.png',
    iconRetinaUrl: myURL + 'images/pin48.png',
    iconSize: [29, 24],
    iconAnchor: [9, 21],
    popupAnchor: [0, -14]
});

// for (var i = 0; i < markers.length; ++i) {
//     L.marker([markers[i].lat, markers[i].lng], {
//             icon: myIcon
//         })
//         .bindPopup('<a href="' + markers[i].url + '" target="_blank">' + markers[i].name + '</a>')
//         .addTo(map);

// }

$(document).ready(function () {
    if (map != undefined) { map.remove(); }
    var map = L.map('map').setView([0, 0], 3);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.Control.geocoder().addTo(map);

    // Basic URL with application-key for search
    var URL = "http://api.eventful.com/json/events/search?app_key=5gPscV7SZB2jTK6n"
    var URL2 = "http://api.musixmatch.com/ws/1.1/track.search?apikey=502a6b05dfefae386639fa1c47212aa3"
    var URL3 = "http://api.musixmatch.com/ws/1.1/track.lyrics.get?apikey=502a6b05dfefae386639fa1c47212aa3"

    // List of some global variables!!

    var queryURL = ""; // place holder for Actual Query


    var artist = ""; // place holder for artist name
    var location = ""; // place holder for event locaton
    var date = ""; // place holder for date


    // When user enters the information and clicks the button
    $("#picture").empty();
    $("#submit").on("click", function () {
        event.preventDefault(); // prevent the default action


        // a fucntion which will detect which information has been entered ,
        // which will be used to build the URL
        var parameter = getParameter();

        //once we have parameter, we can create Query URL
        // Page sze is to limit only one event at a time
        queryURL = URL + parameter + "&page_size=10";
        queryURL2 = URL2 + "&q_track=" + $("#lyric").val() + "&q_artist=" + artist;
        console.log(queryURL);
        $.ajax({
            url: queryURL,
            method: 'GET',
            crossDomain: true,
            dataType: 'jsonp',
        }).then(function (response) {
            $("#picture").empty();
            console.log('response', response);

            for (var i = 0; i < response.events.event.length; i++) {

                var information = $("<div>");
                information.addClass("text-center");
                var result = response.events.event[i];
                if (result.image != null) {
                    var imgResponse = result.image.medium.url;
                    console.log(imgResponse);
                    var image = $("<img>");
                    image.attr("src", imgResponse);
                    image.addClass("icon");
                    information.append(image);
                }
                //   $("#picture").append(image);}
                //   $("#picture").append("Venue :" + result.venue_name);
                var thelatitude = result.latitude;
                console.log("the latitude is :", thelatitude);
                var thelongitude = result.longitude;
                console.log("the longitude is :", thelongitude);


                var thecity = result.city_name;
                var thecountry = result.country_name;
                var thevenu = result.venue_name;
                var thevenueadress = result.venue_address;

                information.append("<br>");
                information.append("Title : <strong>" + result.title + "</strong><br>");
                information.append("venue : <strong>" + thevenu + "</strong><br>");
                information.append("<span class='venue-address' data-lat='" + thelatitude + "' data-lon='" + thelongitude + "' data-venue='" + thevenu + "' data-url='" + result.url + "'>Address: " + thevenueadress + "</span><br>");
                information.append("City  : <strong>" + thecity + "</strong><br>");
                information.append("Country : <strong>" + thecountry + "</strong><br>");
                information.append("Date & Time : " + result.start_time + "<br>");
                information.append("<hr class=\"bg-warning\">");
                $("#picture").prepend(information);
            }
        });
        console.log('second api call');
        $.ajax({
            url: 'https://cors-anywhere.herokuapp.com/' + queryURL2,
            method: 'GET',

        }).then(function (result) {
            console.log('query2 result', JSON.parse(result));
            // var information = $("<div>");
            // information.addClass("text-center");
            // var trackresult = result.track.track_name;
            var possibleTracks = JSON.parse(result).message.body.track_list;
            console.log('possibleTracks', possibleTracks);
            var firstPossible = possibleTracks.find(function (track) {
                console.log('track.track.has_lyrics', track.track.has_lyrics);
                if (track.track.has_lyrics !== 0) {
                    return true;
                }
                return false;
            })

            console.log('firstPossible', firstPossible);
            console.log('calling...', 'https://cors-anywhere.herokuapp.com/' + URL3 + "&track_id=" + firstPossible.track.track_id);
            $.ajax({
                url: 'https://cors-anywhere.herokuapp.com/' + URL3 + "&track_id=" + firstPossible.track.track_id,
                method: 'GET'
            }).then(function (result) {
                //console.log('result from lyrics search', result);
                var resultToDisplay = JSON.parse(result);
                console.log('resultToDisplay', resultToDisplay);
                console.log('lyrics', resultToDisplay.message.body.lyrics.lyrics_body);
                lyricResponse = resultToDisplay.message.body.lyrics.lyrics_body.toString();
                //lyricDisplay = $("<strong></strong>").html(lyricResponse);
                information.append(lyricResponse);

            })

            // track.track_name
        });
    });

    function getParameter() {
        //reading value from the form
        // these variables are already decalred on top *** GLOBAL Variable****
        artist = $("#artist-name").val().trim();
        location = $("#location").val().trim();
        date = $("#date").val();

        // a local variable Parameter
        var parameter = "";

        //clearing all three fields
        $("#artist-name").val("");
        $("#location").val("");
        $("#date").val("");
        // lets detect which information has been entered
        // and return the search parameter
        if (artist != "") {
            // artist value is not null , user entered the artist name
            // search should be by artist
            parameter = "&keywords=" + artist;
        } else if (location != "") {
            // if artist value is null and location value is not null
            parameter = "&keywords=" + location;

        } else if (date != "") {
            parameter = "&keywords=" + date;
        } else {
            //ignore
        }
        return parameter;
    }
    $("body").on('click', '.venue-address', function() {
        console.log('address was clicked', $(this));
        var long = $(this).data('lon');
        var lat = $(this).data('lat');
        var venue = $(this).data('venue');
        var url = $(this).data('url');
        $("#map").get(0).scrollIntoView();

        L.marker([lat, long], {
            icon: myIcon
        })
        .bindPopup('<a href="' + url + '" target="_blank">' + artist + " @ " + venue + '</a>')
        .addTo(map);
        map.setView([lat, long], 16);
    })
});