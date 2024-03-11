
var app = angular.module('projectsPage', [])

app.controller('HeaderController', ['$scope', function($scope) {

}])

app.controller('ProjectsController', ['$scope', function($scope) {
  $scope.s16show=false;
  $scope.f15show=false;
  $scope.s15show=false;
  $scope.f14show=false;
  $scope.s14show=false;

  $scope.title = "Projects Showcase Page";
  
  // $scope.oneDayMore = {
  //   title: "One Day More",
  //   artist: "Les Misérables",
  //   student: "Audrey, Christine, and Shannon",
  //   youtubeId: "1vftlXkn6AY",
  //   loaded: false,
  // };
}])

// app.directive('projectVideo', function() {
//   return {
//     restrict: 'E',
//     scope: {
//       vidInfo: '=videoid'
//     },
//     link: function(scope, elm) {
//       var wrapperId = "vid-wrap-" + scope.vidInfo.youtubeId;
//       var wrapper = $("#"+wrapperId);
//       var vidPicUrl = "url('https://i.ytimg.com/vi_webp/" + 
//         scope.vidInfo.youtubeId + 
//         "/hqdefault.webp')";
//       wrapper.attr("background-image", vidPicUrl);
//       wrapper.click(function() {
//         var iframeElem = $("<iframe>");
//         iframeElem.attr("width", "650");
//         iframeElem.attr("height", "365");
//         iframeElem.attr("frameborder", "0");
//         var src = ("https://www.youtube.com/embed/" +
//           scope.vidInfo.youtubeId + 
//           "?autoplay=true&color=white");
//         iframeElem.attr("src", src);
//         wrapper.append(iframeElem);
//       });
//     },
//     templateUrl: 'project-video-directive.html'
//   };
// });