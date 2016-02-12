// angular header

var headerApp = angular.module('header', [])
  .controller('HeaderController', ['$scope', function($scope) {

  }]);

$(document).ready(function () {  

  // lyrics

  $(".altText").hover(function() {
    if ($(this).children(".hidden").css("display") === "none") {
      $(this).children(".hidden").css("display","inline").addClass("orange");
      $(this).children(".shown").css("display","none");
    } else {
      $(this).children(".hidden").css("display","none").removeClass("orange");
      $(this).children(".shown").css("display","inline");
    }
  });
  $(".altText").click(function() {
    if ($(this).children(".hidden").css("display") === "none") {
      $(this).children(".hidden").css("display","inline").addClass("orange");
      $(this).children(".shown").css("display","none");
    } else {
      $(this).children(".hidden").css("display","none").removeClass("orange");
      $(this).children(".shown").css("display","inline");
    }
  });

  // gifs

  var s3bucket = "https://s3.amazonaws.com/signlanguage/";
  //var s3bucket = "./gifs/";
  // sets up a play button image for a jquery element
  var setUpPlay = function(thisContainer) {
    var playBox = $("<img>").attr({
      src: "./pictures/play.png",
      width: "180px",
      class: "play-box"
    });
    var signName = $(thisContainer)[0].id;
    if (signName == ""){
      signName = "nogif";
    }
    // replace , with - for use in html tags
    var newTag = signName.replace(/\,/g, "-");
    var gifBox = $("<div>").attr("class","gif-box").attr("id",newTag);
    gifBox.append(playBox)
    $(thisContainer).append(gifBox);
  };
  // put play button below each word
  $("#vocabList p").each(function(){
    setUpPlay($(this));
  });
  // takes a jquery element of class "gif-box" to put a gif into
  var loadGif = function(gifBox) {
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
    var gifBoxTag = gifBox[0].id;
    var gifTitle = gifBoxTag.replace(/\-/g, ",");
    $("<img>")
    .attr("src", s3bucket+gifTitle+".gif")
    .attr("class", "sign-gif")
    .load(function(){
      loaderGif.hide();
      var thisGifBox = $(".gif-box#"+gifBoxTag);
      // special case of no gif for this picture, can't select id
      if (gifBoxTag === "nogif") {
        gifBox.append(this);
        gifBox.css("background-color","#3ac");
      }
      // typical case
      else {
        thisGifBox.append(this);
        // to hide gray from pictures of different proportions
        thisGifBox.css("background-color","#3ac");
      }
    });
  }
  // clicking on any play button loads that gif
  $("#vocabList p .gif-box").click(function(){
    loadGif($(this));
  });
  // show all button loads all gifs
  $("#show-all").click(function(){
    $("#vocabList p .gif-box").each(function(){
      if (this.id === "nogif") return;
      else loadGif($(this));
    });
  });

});