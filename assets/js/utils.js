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

function formDataToObject(formData) {
  const obj = {};
  formData.forEach((value, key) => {
    if (obj[key]) {
      if (!Array.isArray(obj[key])) {
        obj[key] = [obj[key]];
      }
      obj[key].push(value);
    } else {
      obj[key] = value;
    }
  });
  return obj;
}

function loadFormDataFromLocalStorage() {
  const storedData = localStorage.getItem("gameSettingsStored");
  if (storedData) {
    const gameSettings = JSON.parse(storedData);

    for (const key in gameSettings) {
      if (gameSettings.hasOwnProperty(key)) {
        const field = document.querySelector(`[name=${key}]`);
        if (field) {
          if (field.type === "checkbox" || field.type === "radio") {
            field.checked = gameSettings[key];
          } else {
            field.value = gameSettings[key];
          }
        }
      }
    }
  }
}

function unloadFormDataToFields(data) {
  const gameSettings = data.data;

  for (const key in gameSettings) {
    if (gameSettings.hasOwnProperty(key)) {
      const field = document.querySelector(`[name=${key}]`);
      if (field) {
        if (field.type === "checkbox" || field.type === "radio") {
          field.checked = gameSettings[key] === "true" ? true : false;
        } else {
          field.value = gameSettings[key];
        }
      }
    }
  }
}

function playSelectSound() {
  let select = new Audio("assets/sounds/button-press.ogg");
  select.play();
}

function playDeselectSound() {
  let deselect = new Audio("assets/sounds/button-release.ogg");
  deselect.play();
}

function playKnockSound() {
  let knockout = new Audio("assets/sounds/ping_pong.mp3");
  knockout.play();
}
