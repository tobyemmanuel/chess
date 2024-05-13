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
