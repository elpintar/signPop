// sign language dictionary
// Erik Pintar, May 2015

var gifDir = "https://s3.amazonaws.com/signlanguage/";
//var gifDir = "./gifs/";

var gifNames = Object.keys(gifObj)

var app = angular.module('game', []);

// just for the header
app.controller('HeaderController', ['$scope', function($scope) { }]);

app.controller("DictController", function($scope) {

	var vm = $scope;

	vm.initDOM = function() {
		// every new letter, re-search the words
	  $("#search-input").keypress(function(event) {
	  	// SPACE -> &nbsp;
		  if (event.which == 32) {
			  vm.curSearchPhrase = vm.guess + " ";
		  }
		  else {
		  	var c = String.fromCharCode(event.which);
		  	if (vm.curSearchPhrase.length > vm.guess.length) {
		  		vm.curSearchPhrase = vm.guess + " " + c;
		  	}
		  	else {
		  		vm.curSearchPhrase = vm.guess + c;
		  	}
		  }
		  // SEARCH THE WORDS!
		  vm.search();
		});
		$("#search-input").keydown(function(event) {
		  // BACKSPACE
		  if (event.keyCode === 8) {
		  	vm.curSearchPhrase = vm.guess.substring(0, vm.guess.length-1);
		  }
		  vm.search();
		});
	}

	// search the current phrase in the search box text field
	vm.search = function() {
		var searchPhrase = vm.curSearchPhrase;
		vm.report = "";
		if (searchPhrase.length === 0) {
			$("#search-results").empty();
			return;
		}
		searchPhrase = searchPhrase.toLowerCase();
		nearResults = [];
		correctResults = [];
		exactResults = [];
		console.log("search word:", searchPhrase);
		for (var dictKey in gifObj) {
			if (vm.hasDictEntryExactMatch(searchPhrase, dictKey)) {
				exactResults.push(dictKey);
			}
			else if (vm.hasDictEntryCorrectMatch(searchPhrase, dictKey)) {
				correctResults.push(dictKey);
			}
			else if (vm.hasDictEntryRoughMatch(searchPhrase, dictKey)) {
				nearResults.push(dictKey);
			}
		}
		// display results, exact results first
		var allResults = exactResults.concat(correctResults.concat(nearResults));
		console.log(searchPhrase, allResults, exactResults, correctResults);
		//vm.report = allResults.join(", ");
		if (allResults.length === 0) {
			vm.report = "- No Results -";
		}
		vm.updateResults(allResults);
	}

	vm.hasDictEntryExactMatch = function(searchPhrase, dictKey) {
		// check the key itself
		if (searchPhrase === dictKey.toLowerCase()) {
			return true;
		}
		else {
			// check the alternate correct answers
			var altList = gifObj[dictKey]["alt"];
			for (var i = altList.length - 1; i >= 0; i--) {
				var altPhrase = altList[i];
				// if it is a list of words, join words by spaces
				if (typeof(altPhrase) !== "string") {
					altPhrase = altPhrase.join(" ");
				}
				altPhrase = altPhrase.toLowerCase();
				// see if search word is in the alt phrase
				if (searchPhrase === altPhrase) {
					return true;
				}
			}
		};
		return false;
	}

	// returns true if the search phrase would be a correct answer
	// in the review game
	vm.hasDictEntryCorrectMatch = function(searchPhrase, dictKey) {
		// check the key itself
		if (searchPhrase.search(dictKey.toLowerCase()) !== -1) {
			return true;
		}
		else {
			// check the alternate correct answers
			var alt = gifObj[dictKey]["alt"];
			for (var i = alt.length - 1; i >= 0; i--) {
				var altPhrase = alt[i];
				if (typeof(altPhrase) === "string") {
					if (searchPhrase.search(altPhrase.toLowerCase()) !== -1) {
						return true;
					}
				} else { // list of required words in phrase
					guessTemp = searchPhrase;
					metRequirement = true;
					for (var j = altPhrase.length - 1; j >= 0; j--) {
						var reqWord = altPhrase[j];
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

	// looks at one dictionary entry from the gifObj
	// returns true if the search phrase could match this entry
	vm.hasDictEntryRoughMatch = function(searchPhrase, dictKey) {
		return (vm.roughPhraseMatch(searchPhrase, dictKey) ||
						vm.hasAltPhraseRoughMatch(searchPhrase, gifObj[dictKey]["alt"]));
	}

	// takes two strings, possibly with spaces 
	// sees if searchPhrase roughly matches the dictPhrase
	vm.roughPhraseMatch = function(searchPhrase, dictPhrase) {
		var searchWords = searchPhrase.split(" ");
		var tempDictPhrase = dictPhrase.toLowerCase();
		for (var i = 0; i < searchWords.length; i++) {
			var sWord = searchWords[i];
			if (tempDictPhrase.search(sWord) !== -1) {
				tempDictPhrase.replace(sWord, "");
			}
			else {
				return false;
			}
		};
		return true;
	}

	// returns an alternate word that it matches
	// otherwise, empty string if no match found
	vm.hasAltPhraseRoughMatch = function(searchPhrase, altList) {
		for (var i = altList.length - 1; i >= 0; i--) {
			var altPhrase = altList[i];
			// if it is a list of words, join words by spaces
			if (typeof(altPhrase) !== "string") {
				altPhrase = altPhrase.join(" ");
			}
			altPhrase = altPhrase.toLowerCase();
			// see if search word is in the alt phrase
			if (vm.roughPhraseMatch(searchPhrase, altPhrase)) {
				return altPhrase;
			}
		}
		return "";
	}

	vm.updateResults = function(resultList) {
		$("#search-results").empty();
    var maxResultsNum = 10;
		for (var i = 0; i < maxResultsNum; i++) {
			var dictKey = resultList[i];
			vm.addGifBox(dictKey);
		};
	}

	// takes a jquery element of class "gif-box" to put a gif into
	// also in week.js
 	vm.loadGif = function(gifBox) {
    var gifBoxTag = gifBox[0].id;
    // put loading gif there
    gifBox.empty();
    var loaderGif = $("<img>").attr({
      src: "./pictures/loader.gif",
      width: "20px",
      height: "20px",
      class: "loader-gif"
    });
    gifBox.append(loaderGif);
    // now load real gif
    var gifTitle = gifBoxTag.replace(/\-/g, ",");
    var gifImg = $("<img>");
    gifImg.attr("src", gifDir+gifTitle+".gif")
    			.attr("class", "sign-gif")
    			.load(function(){
    loaderGif.hide();
  });
    var thisGifBox = $(".gif-box#"+gifBoxTag);
    if ($(".gif-box#"+gifBoxTag+" .sign-gif").length > 0) {
    	console.log("has img already:", gifBoxTag);
    	return;
    }
    gifBox.append(gifImg);
    // to hide gray from pictures of different proportions
    gifBox.css("background-color","#3ac");
    //});
  }

	// add a gif to the gif container
	vm.addGifBox = function(dictKey) {
		var wordDiv = $("<p>").addClass("result-word-box");
		// label with word
		var wordStr = vm.canonicalAnswer(dictKey);
		wordDiv.html(wordStr+"<br>");
		// set up gif box
		var gifBox = $("<div>").addClass("gif-box")
													 .attr("id", dictKey);
		vm.loadGif(gifBox);
		// add to DOM
		wordDiv.append(gifBox);
		$("#search-results").append(wordDiv);
	};

	// gets most "readable" form of word from gifObj entry
	vm.canonicalAnswer = function(dictKey) {
		var alt = gifObj[dictKey]["alt"];
		// case 0.1: key's last letter is 2 (version 2 of a word)
		if (dictKey[dictKey.length-1] === "2") {
			return dictKey.substr(0,dictKey.length-1);
		}
		// case 0.2: key is comma separated list
		else if (dictKey.indexOf(",") !== -1) {
			return dictKey.replace(/\,/g, ", ");
		}
		// case 1: key is one word (all lowercase)
		else if (dictKey.toLowerCase() === dictKey) {
			return dictKey;
		}
		// case 2: use the first alternate word (if there is one)
		else if (alt.length > 0 & typeof(alt[0]) === "string") {
			return alt[0];
		}
		// case 3: fall back on the key with camel case to space-separated string
		else {
			return dictKey.replace(/([A-Z])/g, ' $1').toLowerCase();
		}
	};

  vm.selectWeeks = function() {
  	var isSelected = function(week) {
  		return vm.checked[week];
  	}.bind(vm);
  	var selectedWeeks = vm.weeks.filter(isSelected);
  	var makeUrlStr = function(week) {
  		return "weeks=" + week.toString();
  	};
  	var strWeeks = selectedWeeks.map(makeUrlStr);
  	var urlParamsStr = strWeeks.join("&");
  	var newUrl = location.pathname + "?" + urlParamsStr;
  	window.location.href = newUrl;
  };

  vm.selectNone = function() {
  	vm.checked = vm.checked.map(function(){
  		return false;
  	});
  };

  vm.selectAll = function() {
  	vm.checked = vm.checked.map(function(){
  		return true;
  	});
  };

  vm.init = function() {
  	vm.report = "";
  	vm.guess = "";
  	vm.curSearchPhrase = "";
  	// init weeks
		vm.weeks = [1,2,3,4,5,6,7,8,9];
		vm.checked = vm.weeks.map(function(){return false});
		vm.checked.push(false); // for 0 index
		vm.weekNames = ["","ABCs & 123s", "Greetings",
			"Conversation", "Time", "School", "Places", "Family",
			"Clothes & Colors", "Food", "Animals & Nature"];
	};

	vm.init();
	vm.initDOM();
});

$(document).ready(function() {
	// cursor starts in textbox
  $('#search-input').focus();
});

