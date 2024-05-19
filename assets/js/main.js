let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

document.addEventListener("DOMContentLoaded", function () {

//implement a logged in state check upon load completion

  showScreen("splashScreen");

  function handleStartButtonClick() {
    document.getElementById("loading-screen").style.display = "flex";
    handleAjaxRequest(
      "POST",
      "api.php?path=main&action=home",
      null,
      function (response) {
        if (response.success) {
        toast(response.message, "success");
        hideScreen("splashScreen");
        showScreen("mainMenu");
        } else {
          toast(error.message, "error");
        }
      },
      function (error) {
        toast(error.message, "error");
      }
    );
    hideScreen("splashScreen");
    showScreen("mainMenu");
  }

  function handleCreatePlayerClick() {
    hideScreen("mainMenu");
    showScreen("createPlayerScreen");
  }

  function handleContinuePlayerClick() {
    if(isLoggedIn == false) {
    hideScreen("mainMenu");
    showScreen("continuePlayerScreen");
    }else{
      handleIsLogged();
    }
  }

  function handleNewGameClick() {
    hideScreen("loggedMenu");
    showScreen("playScreen");
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
        isLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');
        updateVisibilityBasedOnLoginStatus();
        document.getElementById("loading-screen").style.display = "none";
        toast(response.message, "success");
        hideScreen("continuePlayerScreen");
        document.querySelector(".welcome-user").innerHTML="Welcome "+response.data.username;
        document.querySelector(".playerUsername").innerHTML=response.data.username;
        playerUsername
        showScreen("loggedMenu");
      },
      function (error) {
        toast(error.message, "error");
        document.getElementById("loading-screen").style.display = "none";
        showScreen("continuePlayerScreen");
      }
    );
  }

  function handleIsLogged() {
    document.getElementById("loading-screen").style.display = "flex";
    handleAjaxRequest(
      "POST",
      "api.php?path=main&action=isloggedin",
      [],
      function (response) {
        updateVisibilityBasedOnLoginStatus();
        hideScreen("mainMenu");
        document.querySelector(".welcome-user").innerHTML="Welcome "+response.data.username;
        document.querySelector(".playerUsername").innerHTML=response.data.username;
        showScreen("loggedMenu");
        document.getElementById("loading-screen").style.display = "none";
        toast(response.message, "success");
      },
      function (error) {
        hideScreen("mainMenu");
        showScreen("continuePlayerScreen");
        document.getElementById("loading-screen").style.display = "none";
        toast(error.message, "error");
      }
    );
  }

  document.getElementById("startButton").addEventListener("click", handleStartButtonClick);
  document.getElementById("createPlayer").addEventListener("click", handleCreatePlayerClick);
  document.getElementById("continuePlayer").addEventListener("click", handleContinuePlayerClick);
  document.getElementById("newGame").addEventListener("click", handleNewGameClick);

  setupClickListener(".back, .back_logged, .exit", handleBackButtonClick);
  setupClickListener(".gameSettings", function () {
    hideScreen(this.closest(".screen").id);
    showScreen("gameSettingsScreen");
  });
  setupClickListener(".profileSettings", function () {
    hideScreen(this.closest(".screen").id);
    showScreen("profileSettingsScreen");
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

  function handleBackButtonClick() {
    var parentScreen = this.closest(".screen");
    hideScreen(parentScreen.id);
    if (this.classList.contains("back_logged")) {
      showScreen("loggedMenu");
    } else if (this.classList.contains("back")) {
      showScreen("mainMenu");
    }else if (this.classList.contains("exit")) {
      if(isLoggedIn === true) {
        handleExitAction();
      }
      showScreen("splashScreen");
    }
  }

  function handleExitAction() {
    document.getElementById("loading-screen").style.display = "flex";
    handleAjaxRequest(
      "POST",
      "api.php?path=main&action=logout",
      null,
      function (response) {
        isLoggedIn = false;
        localStorage.setItem('isLoggedIn', 'false');
        updateVisibilityBasedOnLoginStatus();
        document.getElementById("loading-screen").style.display = "none";
        toast(response.message, "success");
      },
      function (error) {
        document.getElementById("loading-screen").style.display = "none";
        //toast(error.message, "error");
      }
    );
  }

  document.getElementById("profileSettingsAction").addEventListener("click", handleProfileSettingsAction);

  const profileImageInput = document.getElementById("profileImage");
    const profileImagePreview = document.getElementById("profileImagePreview");
    const addPhotoButton = document.getElementById("addPhotoButton");
    const removePhotoButton = document.getElementById("removePhotoButton");

    addPhotoButton.addEventListener("click", function() {
        profileImageInput.click();
    });

    profileImageInput.addEventListener("change", function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                profileImagePreview.src = event.target.result;
                profileImagePreview.style.display = "block";
                addPhotoButton.style.display = "none";
                removePhotoButton.style.display = "inline-block";
            };
            reader.readAsDataURL(file); 
        }
    });

    removePhotoButton.addEventListener("click", function() {
        profileImageInput.value = "";
        profileImagePreview.src = "";
        profileImagePreview.style.display = "none";
        removePhotoButton.style.display = "none";
        addPhotoButton.style.display = "inline-block";
    });

  function handleProfileSettingsAction(event) {
    event.preventDefault();
    const formData = new FormData(document.getElementById("profileSettingsForm"));

    handleAjaxRequest(
      "POST",
      "api.php?path=player&action=updateprofile",
      formData,
      function (response) {
        if (response.success) {
          toast(response.message, "success");
          document.querySelector("[input type=password]").value = "";
        } else {
          toast(response.message, "error");
        }
      },
      function (error) {
        toast("An error occurred while processing the request.", "error");
      }
    );
  }

  const playModeSelect = document.getElementById("playMode");
  const usernameField = document.getElementById("usernameField");

  playModeSelect.addEventListener("change", function () {
      if (this.value === "user") {
          usernameField.style.display = "block";
      } else {
          usernameField.style.display = "none";
      }
  });

  document.getElementById("playOptionsForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const playMode = playModeSelect.value;
    const username = document.getElementById("username").value;

    // Show loading screen
    document.getElementById("loading-screen").style.display = "flex";

    let postData = {
        playMode: playMode,
    };

    if (playMode === "user") {
        postData.username = username;
    }

    handleAjaxRequest(
        "POST",
        "api.php?path=game&action=start",
        postData,
        function (response) {
            // Hide loading screen
            document.getElementById("loading-screen").style.display = "none";

            if (response.success) {
                toast(response.message, "success");
                // Navigate to game screen, passing game information
                // This part may involve more detailed game logic
            } else {
                toast(response.message, "error");
            }
        },
        function (error) {
            document.getElementById("loading-screen").style.display = "none";
            toast("An error occurred while starting the game.", "error");
        }
    );
});


});
