/*
The player is only for repeating songs, saving them in localStorage or navigating
through playlists and history and starred.
For playing and pausing songs, use the default youtube buttons for play and pause.
There are 2 player states:
1.(not saved state) This state is for videos that are not in local storage. If the
	video currently in webpage is not in localStorage, this player is loaded. It
	gives you two buttons: repeat the video with default time or setTime and repeat.
	Only the video thumbnail and its title is shown. When any one of the buttons is
	clicked, player state 2 is loaded.
	CONTAINS buttons repeat and setTime.
2. (saved state) This state is for videos that already present in localStorage. 
*/

console.log("musicPlayer.js has loaded!!");

var video_detail = {
	url: "",
	repeats: 0,
	title: "",
	playlist: "",
	playIcon: "",
	starred: false,
	startTime: 0,
	endTime: 0
};

var player1 = document.getElementById("playerState1"),
	player2 = document.getElementById("playerState2");

/*
Listener to load a particular state of the music player(state1 or state2).
The message will contain 
message = {
	task: "setPlayerState",
	data: {//information about the video},
	state: 1 or 2
}
*/
//chrome.runtime.onMessage.addEventListener(function())----------



/*--------------LISTENERS for buttons in playerState1----------------------------*/
// sets listener to openModal button for click action
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("openTimeModal").addEventListener("click", popupModal);
  document.getElementById("openTimeModal2").addEventListener("click", popupModal);
  document.getElementById("repeat").addEventListener("click", repeatVideo);
  document.getElementById("addToPlaylist").addEventListener("click", addToPlaylist);
  document.getElementById("starred").addEventListener("click", starred);
});

/************message listeners for videoData and videoDataSave**********/
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
	if(message.task == 'videoData'){
		//console.log(message);
		console.log("Video data init received from <content.js>");
		//initializes player for both state 1 and 2
		initializePlayer(message.video_detail, message.playerState);
	}
	else if(message.task == 'videoDataSave'){
		console.log("Video data save LS received from <content.js>");
		console.log(message.video_detail);
		chrome.runtime.sendMessage({
			task: "setLocalStorageRecents", 
			video_detail: message.video_detail
		});
		initializePlayer(message.video_detail, 2);
	}
});

//load the music player with initial data(a roundabout process (**given below)
chrome.runtime.sendMessage({task:"getPlayerTabId"}, function(response) {
	chrome.tabs.sendMessage(response.playerTabId, {task:"initializeMusicPlayer"});
});

/*-----------------function definitions------------------*/
function popupModal() {
	/*Opens setTimeForm.html*/
	//console.log("openTimeModal button clicked!");
	//get the player.tab_id and send 'setTimeModal' message to content.js
	chrome.runtime.sendMessage({task:"getPlayerTabId"}, function(response) {
		chrome.tabs.sendMessage(response.playerTabId, {task: "setTimeModal"})
	});
}

function repeatVideo() {
	chrome.runtime.sendMessage({task:"getPlayerTabId"}, function(response) {
		chrome.tabs.sendMessage(response.playerTabId, {task: "repeatVideo"})
	});
}

function initializePlayer(videoData, playerState) {
	if(playerState == 1) {
		player1.style.display = "";
		player2.style.display = "none";
		console.log(videoData);
		/*Check whether state of player is 1 or 2. if 2 convert to 1*/
		console.log("You are in player state 1");
		let title = document.getElementById("vid_title");	
		let image = document.getElementById("vid_img");
		let repeat = document.getElementById("repeat");
		let openTimeModal = document.getElementById("openTimeModal");
		repeat.style.marginLeft = "50px";
		openTimeModal.style.marginLeft = "50px"
		image.src = videoData.playIcon;
		title.innerHTML = videoData.title;
	}
	else if(playerState == 2) {
		console.log("You are in player state 2");
		player1.style.display = "none";
		player2.style.display = "";
		let title2 = document.getElementById("vid_title2");	
		let image2 = document.getElementById("vid_img2");
		let fav = document.getElementById("starred");
		let openTimeModal2 = document.getElementById("openTimeModal2");
		fav.style.marginLeft = "20px";
		openTimeModal2.style.marginLeft = "20px"
		image2.src = videoData.playIcon;
		title2.innerHTML = videoData.title;	
	}
}


/*
**roundabout process in the sense that message is sent to content.js which
sends a message back with the videoData to musicPlayer.js and then the player is
initialized
*/