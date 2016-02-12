// sign language review game
// first time experimenting with Angular!
// Erik Pintar, Christmas 2014

var gifDir = "https://s3.amazonaws.com/signlanguage/";
//var gifDir = "./gifs/";

var gifNames = Object.keys(gifObj)

/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 * from http://stackoverflow.com/questions/2450954/
 *      how-to-randomize-shuffle-a-javascript-array
 */
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
  return array;
};

/* from http://stackoverflow.com/questions/979975/
 *         how-to-get-the-value-from-url-parameter
 * modified to always make arrays
 */
var queryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    	// If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = [pair[1]];
    	// If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
    	// If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  } 
    return query_string;
} ();


var midtermWords = [
"yes",
"brave",
"sad",
"yourNameWhat2",
"test",
"dontWant",
"week",
"wasOrPast",
"go",
"wonderOrThink",
"we2",
"word",
"fine",
"copyMe",
"noneOrNothing",
"songOrMusic",
"tomorrow",
"teacher",
"from",
"whatsUp",
"notOrDont",
"hard",
"why",
"spell",
"honestlyOrReallyOrTrueOrSure"];


var app = angular.module('game', []);


// just for the header
app.controller('HeaderController', ['$scope', function($scope) { }]);

app.controller("GameController", function($scope) {

	// update state based on url parameters
	this.useParams = function() {
		if (typeof(queryString.weeks) === "undefined") {
			this.selectAll();
		}
		else {
			queryString.weeks.map(function(weekStr){
				// check the box
				this.checked[parseInt(weekStr)] = true;
			}.bind(this));
		}
	};

	this.wordFilter = function(word) {
		var row = gifObj[word];
		return this.checked[row.week];
	};

	// set up a queue of words for the game
	this.initQueue = function() {
		if (this.isMidterm) {
			this.wordQueue = midtermWords;
			return
		}
		// missed word mode - use missedWord list
		else if (this.missedWordMode) {
			this.wordQueue = this.missedWordQueue;
			this.missedWordQueue = [];
		}
		else {
			// copy big gif list
			this.wordQueue = gifNames.slice(0);
			this.wordQueue = this.wordQueue.filter(this.wordFilter.bind(this));
		}
    console.log("this.wordQueue",this.wordQueue);
		// shuffle list before going into it
		shuffleArray(this.wordQueue);
	};

	this.fixPicDim = function() {
		if ($("#sign-gif").height() < 288)
			$(".review-gif-box").css("height","264px");
		else
			$(".review-gif-box").css("height","288px");
	};

	this.initDOM = function() {
		// when picture finishes loading, do this stuff
		$("#sign-gif").bind("load", function(){
			this.blockGuess = false;
			this.fixPicDim();
			$("#sign-gif").show();
			$('#guess-input').focus()
		}.bind(this));
		// "enter" goes to next screen when continue button is up
	  $(document).keypress(function(e) {
	    if(e.which == 13) {
	      if ($("#guess-buttons").css('display') == 'none') {
	      	this.nextWord(true);
	      	return false;
	      }
	    }
		}.bind(this));
	};

	this.win = function(update) {
		// if in missed words mode and still missed words,
		// restart automatically on the words they missed again
		if (this.missedWordMode & this.wordQueue.length !== 0) {
			this.doMissedWords();
			return;
		}
		if (!this.endedEarly) {
			console.log("not ending early");
			this.info.words_left = 0;
		}
		// give tailored feedback
		if (this.isMidterm) {
			var words_missed_readable = 
				this.missedWordQueue.map(this.canonicalAnswer).join(", ");
			if (words_missed_readable === "") words_missed_readable = "No words!";
			var words_left_readable = 
				this.wordQueue.map(this.canonicalAnswer).join(", ");
			if (words_left_readable === "") words_left_readable = "No words!";
			this.report = "All done! " + 
										" MISSED: " + words_missed_readable +
										" WORDS LEFT: " + words_left_readable;
		}
		else if (this.info.words_missed === 0 & this.score > 0) {
			this.report = "Wow!!! Perfect Score!!!";
		}
		else if (this.info.words_missed > this.score) {
			this.report = "You may want to review before playing again..."
		}
		else {
			this.report = "All Done!  Nice work.";
		}
		var wordsDone = this.score + this.info.words_missed;
		var percentScore = Math.round(this.score*100*100 / wordsDone) / 100;
		if (wordsDone == 0) percentScore = 0;
		this.score = this.score + " / " + wordsDone + "   (" + percentScore + "%)";
		// make win screen - no gif, new buttons
		$(".review-gif-box").hide();
		$("#guess-buttons").hide();
		$("#guess-input-container").hide();
		$("#continue-button").hide();
		$("#end-game-button").hide();
		$("#restart-button").show();
		if (this.info.words_missed !== 0 & !this.missedWordMode) {
			$("#missed-word-button").show();
		}
		if (typeof(update) === undefined) update = true;
		if (update) $scope.$apply();
	};

	this.endEarly = function() {
		this.endedEarly = true;
		this.win();
	}

	this.restart = function() {
		location.reload();
	};

	this.doMissedWords = function() {
		this.missedWordMode = true;
		// update DOM accordingly
		$("#restart-button").hide();
		$("#missed-word-button").hide();
		$(".review-gif-box").show();
		$("#sign-gif").show();
		$("#end-game-button").show()
		// re-initialize everything
		this.init();
	};

	this.dequeueWord = function() {
		if (this.wordQueue.length > 0) {
			this.info.words_left = this.wordQueue.length - 1;
			return this.wordQueue.shift();
		}
		else {
			this.win();
		}
	};

	// pick a new word to display (update DOM true by default)
	this.newGif = function(update) {
		// grab new word
		this.word = this.dequeueWord();
		// update variables
		this.alt = gifObj[this.word]["alt"];
		this.report = "";
		this.guess = "";
		// show guess buttons
		$("#guess-buttons").show();
		$("#guess-input-container").show();
		$("#continue-button").hide();
		$('#guess-input').focus()
		// if gif hasn't been loaded, hide it
		if (!this.missedWordMode) {
			$("#sign-gif").hide();
		} else {
			this.blockGuess = false;
		}
		// display gif
		var gifPath = gifDir + this.word + ".gif";
		$("#sign-gif").attr('src', gifPath);
		// update DOM if told to
		if (typeof(update) === undefined) update = true;
		if (update) $scope.$apply();
	};

	this.nextWord = function(update) {
		if (typeof(update) === undefined) update = true;
		if (this.wordQueue.length === 0) this.win(update);
		else this.newGif(update);
	};

	this.canonicalAnswer = function(word) {
		var alt = gifObj[word]["alt"];
		// case 0.1: key's last letter is 2 (version 2 of a word)
		if (word[word.length-1] === "2") {
			return word.substr(0,word.length-1);
		}
		// case 0.2: key is comma separated list
		else if (word.indexOf(",") !== -1) {
			return word.replace(/\,/g, ", ");
		}
		// case 1: key is one word (all lowercase)
		else if (word.toLowerCase() === word) {
			return word;
		}
		// case 2: use the first alternate word (if there is one)
		else if (alt.length > 0 & typeof(alt[0]) === "string") {
			return alt[0];
		}
		// case 3: fall back on the key with camel case to space-separated string
		else {
			return word.replace(/([A-Z])/g, ' $1').toLowerCase();
		}
	};

	this.showAnswer = function() {
		this.report = this.canonicalAnswer(this.word);
    this.blockGuess = true;
		this.info.words_missed++;
		if (this.missedWordMode) {
			this.wordQueue.push(this.word);
		}
		else {
			this.missedWordQueue.push(this.word);
		}
		this.info.cur_run = 0;
		$("#guess-buttons").hide();
		$("#guess-input-container").hide();
		$("#continue-button").show();
	};

	// checks gifObj stored correct answers for correct guess
	this.guessMatch = function() {
		var guess = this.guess.toLowerCase();
		// check the key itself
		if (guess.search(this.word.toLowerCase()) !== -1) {
			return true;
		}
		else {
			// check the alternate correct answers
			var alt = this.alt;
			for (var i = alt.length - 1; i >= 0; i--) {
				var ans = alt[i];
				if (typeof(ans) === "string") {
					if (guess.search(ans.toLowerCase()) !== -1) {
						return true;
					}
				} else { // list of required words in phrase
					guessTemp = guess;
					metRequirement = true;
					for (var j = ans.length - 1; j >= 0; j--) {
						var reqWord = ans[j];
						if (guessTemp.search(reqWord.toLowerCase()) === -1) {
							metRequirement = false;
						}
						guessTemp = guessTemp.replace(reqWord, "");
					};
					if (metRequirement) {
						return true;
					}
				};
			};
		};
		return false;
	};

  // push review onto current product's review array
  this.submitGuess = function() {
  	// don't do anything if waiting to go to next screen
  	if (this.blockGuess) {
  		return;
  	}
  	// CORRECT
    else if (this.guessMatch()) {
    	this.report = "Right!";
    	this.blockGuess = true;
    	this.score++;
    	this.info.cur_run++;
    	if (this.info.cur_run > this.info.max_run)
    		this.info.max_run = this.info.cur_run;
    	setTimeout(function() {
    		this.nextWord(true);
    	}.bind(this), 1000);
    } 
    // WRONG
    else {
    	this.info.cur_run = 0;
    	if (this.report === "Wrong. Try Again!") {
    		this.showAnswer();
    	}
    	else {
    		this.report = "Wrong. Try Again!";
    		this.guess = "";
    	}
    }
  };

  this.selectWeeks = function() {
  	var isSelected = function(week) {
  		return this.checked[week];
  	}.bind(this);
  	var selectedWeeks = this.weeks.filter(isSelected);
  	var makeUrlStr = function(week) {
  		return "weeks=" + week.toString();
  	};
  	var strWeeks = selectedWeeks.map(makeUrlStr);
  	var urlParamsStr = strWeeks.join("&");
  	var newUrl = location.pathname + "?" + urlParamsStr;
  	window.location.href = newUrl;
  };

  this.selectNone = function() {
  	this.checked = this.checked.map(function(){
  		return false;
  	});
  };

  this.selectAll = function() {
  	this.checked = this.checked.map(function(){
  		return true;
  	});
  };

  this.init = function() {
	  // initialization
	  this.report = "";
		// will hold key to gifObj object
		this.word = "";
		this.score = 0;
		this.blockGuess = false;
		this.endedEarly = false;
		this.info = {words_left: 0, words_missed: 0, cur_run: 0, max_run: 0};
		this.alt = [];
		// only set certain things when we are not in missed word mode
		if (typeof(this.missedWordMode) === "undefined") {
			this.missedWordQueue = [];
			this.missedWordMode = false;
		}
		this.weeks = [1,2,3,4,5,6,7,8];
		this.checked = this.weeks.map(function(){return false});
		this.checked.push(false); // for 0 index
		//this.checked.push(false); // for 8 index
		this.weekNames = ["","ABCs & 123s", "Greetings",
			"Conversation", "Time", "School", "Places", "Family",
			"Clothes & Colors", "Food", "Animals & Nature"];
		// check if it's the midterm page!
		var path = window.location.pathname;
		var page = path.split("/").pop();
		this.isMidterm = (page === "midterm.html");
		// call initializing functions
		this.useParams();
		this.initQueue();
		this.initDOM();
		this.info.words_left = this.wordQueue.length - 1;
		this.newGif(false);
	};

	this.init();
});

$(document).ready(function() {
	// cursor starts in textbox
  $('#guess-input').focus()
});

