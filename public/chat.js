// Make connection
var socket = io.connect("http://localhost:4000");

var play = document.getElementById("play");
var pause = document.getElementById("pause");
var search = document.getElementById("search");
var videoname = document.getElementById("search-key");
var list = document.getElementById("search-list");

var player,
  time_update_interval = 0;
var flag = false;
var videoId = "M7lc1UVf-VE";
var APIkey = "AIzaSyC2OMSz7cuDT_OzLkIrWuVuWGffPiJxKxw";

$("#search-title").hide();

function initialize() {
  console.log("initialize");

  // Clear any old interval.
  clearInterval(time_update_interval);
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING && !flag) {
    socket.emit("play", player.getCurrentTime());
    flag = true;
  } else if (event.data == YT.PlayerState.PAUSED) {
    socket.emit("pause");
    flag = false;
  }
}

play.addEventListener("click", function(event) {
  console.log("play emit");
  socket.emit("play", player.getCurrentTime());
});

pause.addEventListener("click", function(event) {
  console.log("pause emit");
  socket.emit("pause");
});

socket.on("play", function(data) {
  console.log("play listen");
  player.playVideo();
  player.seekTo(data);
});

socket.on("pause", function() {
  console.log("pause listen");
  player.pauseVideo();
});

search.addEventListener("click", function(event) {
  $("#search-title").show();

  var q = videoname.value;
  var urlReq = "https://www.googleapis.com/youtube/v3/search";

  $.ajax({
    url: urlReq,
    data: {
      part: "snippet,id",
      q: q,
      type: "video",
      key: APIkey
    },
    success: (result, status, xhr) => {
      var datas = result.items;

      document.getElementById("search-list").innerHTML = "";

      datas.forEach(data => {
        var rowdiv = document.createElement("div");
        rowdiv.setAttribute("class", "row");
        rowdiv.setAttribute("id", data.id.videoId);

        var imgdiv = document.createElement("div");
        imgdiv.setAttribute("id", data.id.videoId);
        imgdiv.setAttribute("class", "img-div");
        imgdiv.innerHTML =
          "<img src='" +
          data.snippet.thumbnails.default.url +
          "' id=" +
          data.id.videoId +
          ">";

        var titlediv = document.createElement("div");
        titlediv.setAttribute("id", data.id.videoId);
        titlediv.setAttribute("class", "title-div");
        titlediv.innerHTML = data.snippet.title;

        rowdiv.appendChild(imgdiv);
        rowdiv.appendChild(titlediv);
        document.getElementById("search-list").appendChild(rowdiv);
      });
    },
    error: (xhr, status, err) => {
      console.log(xhr);
    }
  });
});

list.addEventListener("click", function(event) {
  if (event.target.id != "search-list") {
    document.getElementById("search-list").innerHTML = "";
    $("#search-title").hide();

    socket.emit("change", event.target.id);
  }
});

socket.on("change", function(data) {
  //iframe initialize
  var tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  videoId = data;

  if (player) {
    player.destroy();

    player = new YT.Player("video-placeholder", {
      width: 600,
      height: 400,
      videoId: videoId,
      events: {
        onReady: initialize,
        onStateChange: onPlayerStateChange
      }
    });
  }

  $("#buttons").show();
});

//youtube api download
function onYouTubeIframeAPIReady() {
  player = new YT.Player("video-placeholder", {
    width: 600,
    height: 400,
    videoId: videoId,
    events: {
      onReady: initialize,
      onStateChange: onPlayerStateChange
    }
  });
}
