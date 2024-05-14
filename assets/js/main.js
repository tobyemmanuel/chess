// Display splash screen
$("#splashScreen").show();

// Click event for start button
$("#startButton").click(function () {
  $("#splashScreen").hide();
  $("#mainMenu").show();
});

// Click events for menu options
$("#createPlayer").click(function () {
  $("#mainMenu").hide();
  $("#createPlayerScreen").show();
  // Show player creation form
  // Send data to PHP backend via AJAX
});

// Click events for menu options
$("#continuePlayer").click(function () {
  $("#mainMenu").hide();
  $("#loggedMenu").show();
  // Show player creation form
  // Send data to PHP backend via AJAX
});

// Click event for game settings option
$('.gameSettings').click(function() {
    $(this).closest(".screen").hide();
    $('#gameSettingsScreen').show();
});

// Click event for history option
$('.history').click(function() {
    $(this).closest(".screen").hide();
    $('#historyScreen').show();
});

// Click event for highscores option
$('.highScores').click(function() {
    $(this).closest(".screen").hide();
    $('#highScoresScreen').show();
});

$(".back").click(function () {
  $(this).closest(".screen").hide();
  $("#mainMenu").show();
});

$(".back_logged").click(function () {
    $(this).closest(".screen").hide();
    $("#loggedMenu").show();
  });

$(".exit").click(function () {
  $(this).closest(".screen").hide();
  $("#splashScreen").show();
});

function createPlayer(playerName, passCode) {
    // Display loading screen
    // You can implement this part using CSS or JavaScript
    showLoadingScreen();

    // Create a new XMLHttpRequest object
    var xhr = new XMLHttpRequest();

    // Define the request parameters
    var url = "player.php";
    var params = "playerName=" + playerName + "&passCode=" + passCode;

    // Configure the request
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    // Set up a callback function to handle the response
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // Hide loading screen
            hideLoadingScreen();

            // Process the response
            var response = xhr.responseText;
            // Handle the response accordingly
            if (response == "success") {
                // Player creation successful
                console.log("Player created successfully");
            } else {
                // Player creation failed
                console.error("Failed to create player");
            }
        }
    };

    // Send the request
    xhr.send(params);
}

// Function to display loading screen
function showLoadingScreen() {
    document.getElementById("loadingScreen").style.display = "flex";
}

// Function to hide loading screen
function hideLoadingScreen() {
    document.getElementById("loadingScreen").style.display = "none";
}
