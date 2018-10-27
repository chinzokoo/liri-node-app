require("dotenv").config();
var keys = require("./keys");
var Spotify = require("node-spotify-api");
var request = require("request");
var lineReader = require('line-reader');
var logger = require('tracer').dailyfile({root:'.', maxLogFiles: 10, allLogsFileName: 'LIRI'});

var spotify = new Spotify(keys.spotify);

var command = process.argv[2];
var parameter = process.argv.slice(3).join(" "); //the slice and join methods allow us to take in parameters without single/double quotes around them

executeLIRI(command, parameter);

function executeLIRI(command, parameter) {
	switch(command) {
	    case "concert-this":
			getAndDisplayBandInfo(parameter)
	        break;
	    case "spotify-this-song":
			//if the user doesn't type a song name, the program will output data for "The Sign" by Ace of Base
			if (parameter) {
				getAndDisplaySongInfo(parameter);
			} else {
				getAndDisplaySongInfo("The Sign by Ace of Base");
			}
	        break;
	    case "movie-this":
		    if (parameter && parameter.trim()) {
			    getAndDisplayMovieInfo(parameter);
			} else {
				//if the user doesn't type a movie name, the program will output data for the movie 'Mr. Nobody.'
				getAndDisplayMovieInfo("Mr. Nobody.");
			}
	    	break;
	    case "do-what-it-says":
			lineReader.eachLine('random.txt', function(line) {
				if (line) {
					var commandParameterArray = line.split(",");
					// console.log(commandParameterArray);
					var currentCommand = commandParameterArray[0];
					var currentParameter = "";
					if (commandParameterArray[1]) {
						currentParameter = commandParameterArray[1].replace(/\"/g, "");
					}
					console.log("Command to execute: " + currentCommand + " " + currentParameter);
					logger.log("Command to execute: " + currentCommand + " " + currentParameter);
					executeLIRI(currentCommand, currentParameter);
				}
			});	
	    	break;
	    default:
	        // console.log("ERROR: Please enter a valid command line argument (and parameter)\n"
	        // 	+ "Valid command line arguments and parameters:\n"
	        // 	+ "\tconcert-this\n"
	        // 	+ "\tspotify-this-song '<song name here>'\n"
	        // 	+ "\tmovie-this '<movie name here>'\n"
	        // 	+ "\tdo-what-it-says");
	        // logger.error("ERROR: Please enter a valid command line argument (and parameter)\n"
	        // 	+ "Valid command line arguments and parameters:\n"
	        // 	+ "\tconcert-this\n"
	        // 	+ "\tspotify-this-song '<song name here>'\n"
	        // 	+ "\tmovie-this '<movie name here>'\n"
			// 	+ "\tdo-what-it-says");
			console.log('please decide')
	}
}

function getAndDisplayMovieInfo(movieName) {
	var apiKey = "trilogy";
	// run a request to the OMDB API with the movie specified
	request("http://www.omdbapi.com/?t=" + movieName + "&apikey=" + apiKey , function(error, response, body) {

	  // If the request is successful (i.e. if the response status code is 200)
	  if (!error && response.statusCode === 200) {

	    // Parse the body of the site and recover just the imdbRating
	    // (Note: The syntax below for parsing isn't obvious. Just spend a few moments dissecting it).
	    var movie = JSON.parse(body);
	    if (movie.Error) {
	    	console.log("Movie searched for:" + movieName + "\n" + movie.Error);
	    	logger.error("Movie searched for:" + movieName + "\n" + movie.Error);
	    } else {
		    displayMovieInfo(movie);
		}
	  } else {
	  		console.log("Sorry, invalid request.\n" + "ERROR: " + error);
	  		logger.error("Sorry, invalid request.\n" + "ERROR: " + error);
	  }
	});
}

function displayMovieInfo(movie) {
	var title = movie.Title  || "Information Unavailable";
	var year = movie.Year  || "Information Unavailable";
	var imdbRating = movie.imdbRating  || "Information Unavailable";
	var rottenPotatoesRating = "Information Unavailable";
	for (var i=0; i<movie.Ratings.length; i++) {
		if (movie.Ratings[i].Source === "Rotten Tomatoes") {
			rottenPotatoesRating = movie.Ratings[i].Value;
			break;
		}
	}
	var country = movie.Country  || "Information Unavailable";
	var language = movie.Language  || "Information Unavailable";
	var plot = movie.Plot  || "Information Unavailable";
	var actors = movie.Actors  || "Information Unavailable";
	console.log("Movie: " + title + "\n"
		+ "Year: " + year + "\n"
		+ "IMDB Rating:" + imdbRating + "\n"
		+ "Rotten Tomatoes Rating: " + rottenPotatoesRating + "\n"
		+ "Country: " + country + "\n"
		+ "Language: " + language + "\n"
		+ "Plot: " + plot + "\n"
		+ "Actors: " + actors);

	logger.log("Movie: " + title + "\n"
		+ "Year: " + year + "\n"
		+ "IMDB Rating: " + imdbRating + "\n"
		+ "Rotten Tomatoes Rating: " + rottenPotatoesRating + "\n"
		+ "Country: " + country + "\n"
		+ "Language: " + language + "\n"
		+ "Plot: " + plot + "\n"
		+ "Actors: " + actors);
}

function getAndDisplaySongInfo(songName) {
	spotify.search({ type: "track", query: songName, limit: 1}, function(error, data) {
	  if (error) {
	  	console.log("Song searched for: " + songName);
	  	logger.log("Song searched for: " + songName);
	  	console.log("Sorry, invalid request.\n" + "ERROR: " + error);
	  	logger.error("Sorry, invalid request.\n" + "ERROR: " + error);
	  } else {
			displaySongInfo(data);
		}
	});
}

function displaySongInfo(songInfo) {
	var artists = [];
	for (var i=0; i <songInfo.tracks.items[0].artists.length; i++) {
		artists.push(songInfo.tracks.items[0].artists[i].name);
	}
	var song = songInfo.tracks.items[0].name  || "Information Unavailable";
	var preview_url = songInfo.tracks.items[0].preview_url || "Information Unavailable";
	var album = songInfo.tracks.items[0].album.name || "Information Unavailable";

	console.log("Artist: " + artists.join(" ") + "\n"
		+ "Song: " + song + "\n"
		+ "Preview Url: " + preview_url + "\n"
		+ "Album: " + album);

	logger.log("Artist: " + artists.join(" ") + "\n"
		+ "Song: " + song + "\n"
		+ "Preview Url: " + preview_url + "\n"
		+ "Album: " + album);
}





function getAndDisplayBandInfo(artist){
	var url = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";
	request(url ,function (error, response, body) {
		var band = JSON.parse(body); 
		console.log(band[0])
	});
}
function displayBandInfo(artistinfo) {
	var artists = [];
	for (var i=0; i <songInfo.tracks.items[0].artists.length; i++) {
		artists.push(songInfo.tracks.items[0].artists[i].name);
	}
	var song = songInfo.tracks.items[0].name  || "Information Unavailable";
	var preview_url = songInfo.tracks.items[0].preview_url || "Information Unavailable";
	var album = songInfo.tracks.items[0].album.name || "Information Unavailable";

	console.log("Artist: " + artists.join(" ") + "\n"
		+ "Song: " + song + "\n"
		+ "Preview Url: " + preview_url + "\n"
		+ "Album: " + album);

	logger.log("Artist: " + artists.join(" ") + "\n"
		+ "Song: " + song + "\n"
		+ "Preview Url: " + preview_url + "\n"
		+ "Album: " + album);
}
