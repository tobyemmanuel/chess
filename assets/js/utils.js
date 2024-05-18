function handleAjaxRequest(method, url, data, onSuccess, onError) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  xhr.onload = function () {
    document.getElementById("loading-screen").style.display = "none";
    if (xhr.status >= 200 && xhr.status < 300) {
      var response = JSON.parse(xhr.responseText);
      if (response.success) {
        onSuccess(response);
      } else {
        onError(response);
      }
    } else {
      onError({ message: "An error occurred while processing the request." });
    }
  };
  xhr.onerror = function () {
    onError({ message: "An error occurred while processing the request." });
  };
  if (data) {
    xhr.send(data);
  } else {
    xhr.send();
  }
}

function setupClickListener(selector, callback) {
  document.querySelectorAll(selector).forEach(function (element) {
    element.addEventListener("click", callback);
  });
}

function showScreen(screenId) {
  document.getElementById(screenId).style.display = "block";
}

function hideScreen(screenId) {
  document.getElementById(screenId).style.display = "none";
}

function toast(message, type) {
  var toastElement = document.createElement("div");
  toastElement.className = "toast " + type;
  toastElement.textContent = message;

  var existingToasts = document.querySelectorAll(".toast");
  var topOffset = existingToasts.length > 0 ? existingToasts.length * 70 : 20; // Minimum top offset of 20px
  toastElement.style.top = topOffset + "px";

  document.body.appendChild(toastElement);

  setTimeout(function () {
    document.body.removeChild(toastElement);
  }, 3000);
}

function handleBackButtonClick() {
    var parentScreen = this.closest(".screen");
    hideScreen(parentScreen.id);
    if (this.classList.contains("back_logged")) {
      showScreen("loggedMenu");
    } else if (this.classList.contains("back")) {
      showScreen("mainMenu");
    }else if (this.classList.contains("exit")) {
      showScreen("splashScreen");
    }
  }
