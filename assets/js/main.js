document.addEventListener("DOMContentLoaded", function () {
  showScreen("splashScreen");
  let isLoggedIn = false;

  function handleStartButtonClick() {
    document.getElementById("loading-screen").style.display = "flex";
    handleAjaxRequest(
      "POST",
      "api.php?path=main&action=home",
      null,
      function (response) {
        isLoggedIn = true;
        updateVisibilityBasedOnLoginStatus();
        toast(response.message, "success");
        hideScreen("splashScreen");
        showScreen("mainMenu");
      },
      function (error) {
        toast(error.message, "error");
        hideScreen("splashScreen");
        showScreen("mainMenu");
      }
    );
  }

  function handleCreatePlayerClick() {
    hideScreen("mainMenu");
    showScreen("createPlayerScreen");
  }

  function handleContinuePlayerClick() {
    hideScreen("mainMenu");
    showScreen("continuePlayerScreen");
  }


  function handleCreatePlayerActionClick(event) {
    event.preventDefault();
    var formData = new FormData(document.getElementById("createPlayerForm"));
    document.getElementById("loading-screen").style.display = "flex";
    handleAjaxRequest(
      "POST",
      "api.php?path=main&action=register",
      formData,
      function (response) {
        document.getElementById("loading-screen").style.display = "none";
        toast(response.message, "success");
      },
      function (error) {
        toast(error.message, "error");
        document.getElementById("loading-screen").style.display = "none";
      }
    );
  }

  function handleContinuePlayerActionClick(event) {
    event.preventDefault();
    var formData = new FormData(document.getElementById("continuePlayerForm"));
    document.getElementById("loading-screen").style.display = "flex";
    handleAjaxRequest(
      "POST",
      "api.php?path=main&action=login",
      formData,
      function (response) {
        document.getElementById("loading-screen").style.display = "none";
        toast(response.message, "success");
        hideScreen("continuePlayerScreen");
        document.querySelector(".welcome-user").innerHTML="Welcome "+response.data.username;
        showScreen("loggedMenu");
      },
      function (error) {
        toast(error.message, "error");
        document.getElementById("loading-screen").style.display = "none";
      }
    );
  }

  document.getElementById("startButton").addEventListener("click", handleStartButtonClick);
  document.getElementById("createPlayer").addEventListener("click", handleCreatePlayerClick);
  document.getElementById("continuePlayer").addEventListener("click", handleContinuePlayerClick);

  setupClickListener(".back, .back_logged, .exit", handleBackButtonClick);
  setupClickListener(".gameSettings", function () {
    hideScreen(this.closest(".screen").id);
    showScreen("gameSettingsScreen");
  });
  setupClickListener(".history", function () {
    hideScreen(this.closest(".screen").id);
    showScreen("historyScreen");
  });
  setupClickListener(".highScores", function () {
    hideScreen(this.closest(".screen").id);
    showScreen("highScoresScreen");
  });

  document.getElementById("createPlayerAction").addEventListener("click", handleCreatePlayerActionClick);
  document.getElementById("continuePlayerAction").addEventListener("click", handleContinuePlayerActionClick);

  function updateVisibilityBasedOnLoginStatus() {
    if (isLoggedIn) {
      document.querySelectorAll(".logged-in").forEach(function(element) {
        element.style.display = "inline-block";
      });
      document.querySelectorAll(".logged-out").forEach(function(element) {
        element.style.display = "none";
      });
    } else {
      document.querySelectorAll(".logged-in").forEach(function(element) {
        element.style.display = "none";
      });
      document.querySelectorAll(".logged-out").forEach(function(element) {
        element.style.display = "inline-block";
      });
    }
  }

  updateVisibilityBasedOnLoginStatus();


});
