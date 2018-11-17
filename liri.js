require("dotenv").config();
var keys = require("./keys.js");
var Spotify = require('node-spotify-api');
var request = require("request");
var moment = require('moment');
var fs = require("fs");

var spotify = new Spotify({
  id: keys.spotify.id,
  secret: keys.spotify.secret
});

var inputRequest = process.argv[2];
var keyword = process.argv.slice(3).join("+");
if (inputRequest=="do-what-it-says"){
  fs.readFile("random.txt", "utf8", function(error, data) {
    if (error) {
      return console.log(error);
    }
    var dataArr = data.split(",");
    var commandInput = dataArr[0].trim();
    var contentInput = dataArr[1].trim().split(" ").join("+");
    console.log(commandInput);
    console.log(contentInput);
    skills(commandInput,contentInput);
  });
} else {
  skills(inputRequest, keyword);
}

function skills(inputRequest, keyword){
  switch(inputRequest){
    case "concert-this":
      request("https://rest.bandsintown.com/artists/" + keyword + "/events?app_id=codingbootcamp", 
      function(error, response, body) {
        if (!error && response.statusCode === 200) {
          if(body.substring(1,6)=="error"){            
            console.log('This artists/band is not found!')
          } else {         
            var returnBody = JSON.parse(body);
            if(returnBody.length==0){
              console.log("There's no available event for this artist/band.")
            } else {
              returnBody.forEach(function(event){
                console.log("\n\n\n");            
                console.log("Venue: "+event.venue.name +"\n");
                console.log("Location: "+ event.venue.city+", "+event.venue.country+"\n");
                console.log("Date: "+ moment(event.datetime).format("MM/DD/YYYY"));

              });
            };
          };          
        };
      });
      break;
    case `spotify-this-song`:
      spotify.search({ type: 'track', query: keyword }, function(err, data) {
        if (err) {
          return console.log('Error occurred: ' + err);
        }
        returnBody = data.tracks.items[0];
        if(returnBody ==null){
          console.log("\nThere's no available information for this song. Consider this song instead: ");
          spotify.search({ type: 'track', query: "The Sign" }, function(err, data) {
            if (err) {
              return console.log('Error occurred: ' + err);
            }
            returnBody = data.tracks.items[0];        
            presentdata(returnBody);
          });
        } else {
          presentdata(returnBody);
        }
        function presentdata(returnBody){
          console.log("\n\n\n");        
          console.log("Artist(s): "+ returnBody.artists[0].name);
          console.log("Song name: "+ returnBody.name);
          console.log("Link: "+ returnBody.preview_url);
          console.log("Album: "+ returnBody.album.name);          
          console.log("\n\n\n");
        } 
        });
        break;
    case 'movie-this':
      if(keyword ==""){
        console.log("\nYou haven't mentioned any movie. Try this one instead!")
        omdbPresent('Mr. Nobody.')
      } else {
        omdbPresent(keyword);
      };
      function omdbPresent(key){
        request("http://www.omdbapi.com/?t="+key+"&y=&plot=short&apikey=trilogy", 
        function(error, response, body) {
          if (!error && response.statusCode === 200) {
            var returnBody = JSON.parse(body);
            if(returnBody.imdbRating == null){
              console.log("No available information");
            } else {
              console.log("\n\n\n")
              console.log("Title of the movie: " + returnBody.Title);
              console.log("Year the movie came out: " + returnBody.Year);
              console.log("IMDB Rating of the movie: " + returnBody.imdbRating);
              var returnRating =returnBody.Ratings;
              for(i=0;i<returnRating.length;i++){
                  if(returnRating[i].Source=="Rotten Tomatoes"){
                    console.log("Rotten Tomatoes Rating of the movie: " + returnRating[i].Value);
                    break;  
                  }
                  if(i==returnRating.length-1){
                    console.log("Rotten Tomatoes Rating of the movie: N/A");                    
                  }
              }
              console.log("Country where the movie was produced: " + returnBody.Country);
              console.log("Language of the movie: " + returnBody.Language);
              console.log("Plot of the movie: " + returnBody.Plot);
              console.log("Actors in the movie: " + returnBody.Actors);
            }

          }
        });
      };
      break;
    default:
      console.log("\n\n\n");
      console.log("Please check your syntax! This app can work with the following commands only:")
      console.log(`concert-this \nspotify-this-song \nmovie-this \ndo-what-it-says`)
  }
}