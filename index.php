<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3DChess Pro by Tobi</title>
    <!-- <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script> -->
    <link rel="stylesheet" href="./assets/css/styles.css">
    <link rel="shortcut icon" href="./assets/images/favicon.png" type="image/png" />
    <script type="importmap">
      {
        "imports": {
          "three": "./assets/plugins/three.js-master/build/three.module.js",
          "three/addons/": "./assets/plugins/three.js-master/examples/jsm/"
        }
      }
    </script>
</head>

<body>
    <div class="loading-screen" id="loading-screen">
        <div class="loading-spinner"></div>
        <div class="loading-text">Please wait</div>
    </div>

    <div class="loading-screen" id="gameLoader">
        <div class="loading-spinner"></div>
        <div class="loading-text" id="gameLoaderDetails">Please wait</div>
    </div>

    <div id="splashScreen" class="screen">
        <!-- Splash screen content -->
        <h1>3DChess Pro</h1>
        <small>by Tobi Adelabu</small>
        <button class="primary" id="startButton">Start Playing</button>
    </div>

    <div id="mainMenu" class="screen" style="display: none;">
        <!-- Main menu content -->
        <h2>Main Menu</h2>
        <ul>
            <li><a href="#" id="continuePlayer">Continue</a></li>
            <li><a href="#" id="continueGuest">Continue as Guest</a></li>
            <li><a href="#" id="createPlayer">Create Player</a></li>
            <li><a href="#" class="gameSettings">Game Settings</a></li>
            <li><a href="#" class="highScores">High Scores</a></li>
            <li><a href="#" class="exit">Exit Game</a></li>
        </ul>
    </div>


    <div id="loggedMenu" class="screen" style="display: none;">
        <!-- Logged in menu content -->
        <h2 class="welcome-user">Welcome Back</h2>
        <ul>
            <li><a href="#" id="continueGame">Continue Game</a></li>
            <li><a href="#" id="newGame">New Game</a></li>
            <li><a href="#" class="profileSettings">Account</a></li>
            <li><a href="#" class="history">History</a></li>
            <li><a href="#" class="highScores">High Scores</a></li>
            <li><a href="#" class="gameSettings">Game Settings</a></li>
            <li><a href="#" class="back">Back</a></li>
            <li><a href="#" class="exit">Exit Game</a></li>
        </ul>
    </div>

    <div id="createPlayerScreen" class="screen" style="display: none;">
        <!-- Logged in menu content -->
        <h2>Create Player</h2>
        <form id="createPlayerForm">
            <label for="username">Player Name</label>
            <input type="text" id="username" name="username" required>
            <label for="email">Player Email</label>
            <input type="email" id="email" name="email" required>
            <label for="passcode">Pass Code</label>
            <input type="password" class="clearfix" id="passcode" name="passcode" required>
        </form>
        <button type="submit" id="createPlayerAction" class="primary">Create</button>
        <button class="secondary back">Back</button>
    </div>


    <div id="continuePlayerScreen" class="screen" style="display: none;">
        <!-- Logged in menu content -->
        <h2>Enter Account</h2>
        <form id="continuePlayerForm">
            <label for="username">Player Name</label>
            <input type="text" id="username" name="username" required>
            <label for="passcode">Pass Code</label>
            <input type="password" class="clearfix" id="passcode" name="passcode" required>
        </form>
        <button type="submit" id="continuePlayerAction" class="primary">Continue</button>
        <button class="secondary back">Back</button>
        <a id="forgotPassword" class="forgot-password">Forgot Passcode?</a>
    </div>

    <div id="forgotPasswordScreen" class="screen" style="display: none;">
        <!-- Logged in menu content -->
        <h2>Enter Account</h2>
        <form id="continuePlayerForm">
            <label for="email/username">Username/Email</label>
            <input type="text" id="username" class="clearfix" name="username" required>
            <p>A new passcode will be sent to your email</p>
        </form>
        <button type="submit" id="forgotPasswordAction" class="primary">Continue</button>
        <button class="secondary back">Back</button>
    </div>


    <div id="highScoresScreen" class="screen" style="display: none;">
        <!-- Highscores content -->
        <h2>High Scores</h2>
        <ul>
            <li>Player 1 - 500</li>
            <li>Player 2 - 400</li>
            <li>Player 3 - 300</li>
        </ul>
        <button class="logged-out secondary back" id="backToMainMenu">Back</button>
        <button class="logged-in secondary back_logged" id="backToMainMenu">Back</button>
    </div>

    <div id="historyScreen" class="screen" style="display: none;">
        <!-- History content -->
        <h2>Game History</h2>
        <ul>
            <li>Game 1 - Player 1 vs Player 2 - Winner: Player 1</li>
            <li>Game 2 - Player 3 vs Player 4 - Winner: Player 4</li>
        </ul>
        <button class="logged-out secondary back" id="backToMainMenu">Back</button>
        <button class="logged-in secondary back_logged" id="backToMainMenu">Back</button>
    </div>

    <div id="gameSettingsScreen" class="screen" style="display: none;">
        <!-- Game settings content -->
        <h2>Game Settings</h2>
        <form id="gameSettingsForm">
            <label for="brightness">Brightness:</label>
            <input type="range" id="brightness" name="brightness" min="40" max="90">
            <br>
            <label for="camera_angle">Camera Angle:</label>
            <input type="range" id="cameraAangle" name="cameraAngle" min="0" max="90">
            <br>
            <label for="boardColor">Chessboard Color:</label>
            <select id="boardColor" name="boardColor">
                <option value="set1">Black & White</option>
            </select>
            <br>
            <label for="chesspieceType">Chess Piece:</label>
            <select id="chesspieceType" name="chesspieceType">
                <option value="set1">Regular</option>
            </select>
            <br>
            <label for="difficulty">Opponent Difficulty:</label>
            <select id="difficulty" name="difficulty">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
            </select>
            <br>
        </form>
        <button class="primary" id="gameSettingsAction">Save</button>
        <button class="logged-in secondary back_logged" id="backToLoggedMenu">Back</button>
        <button class="logged-out secondary back" id="backToMainMenu">Back</button>
    </div>

    <div id="profileSettingsScreen" class="screen" style="display: none;">
        <h2>Update Profile</h2>
        <form id="profileSettingsForm" enctype="multipart/form-data">
            <div class="form-group profile-group">
                <img id="profileImagePreview" src="" alt="Profile Image Preview" style="display: none;">
                <div class="image-upload-container">
                    <input type="file" class="clearfix" id="profileImage" name="profileImage" accept="image/*"
                        style="display: none;">
                    <button id="addPhotoButton" class="primary">Add Avatar</button>
                    <button id="removePhotoButton" class="secondary" style="display: none;">Remove
                        Photo</button>
                </div>
            </div>
            <div class="form-group">
                <label for="newUsername">Change Username</label>
                <input type="text" id="profileUsername" name="profileUsername" required>
            </div>
            <div class="form-group">
                <label for="newEmail">Change Email</label>
                <input type="text" id="profileEmail" name="profileEmail" required>
            </div>
            <div class="form-group">
                <label for="currentPassword">Current Password</label>
                <input type="password" autocomplete="false" class="clearfix" id="currentPasscode" name="currentPasscode"
                    required>
            </div>
            <div class="form-group">
                <label for="newPassword">New Password</label>
                <input type="password" autocomplete="false" class="clearfix" id="newPasscode" name="newPasscode"
                    required>
            </div>
        </form>
        <button type="submit" id="profileSettingsAction" class="primary">Save Changes</button>
        <button class="logged-in secondary back_logged" id="backToLoggedMenu">Back</button>
    </div>

    <div id="playScreen" class="screen" style="display: none;">
        <h2>New Game Options</h2>
        <form id="playOptionsForm">
            <label for="playMode">Choose your play mode</label>
            <select id="playMode" name="playMode" required>
                <option value="ai">Play with AI</option>
                <option value="random">Play with Random Opponent</option>
                <option value="user">Play with User</option>
            </select>

            <div id="usernameField" style="display: none;">
                <label for="oppUsername">Enter Username:</label>
                <input type="text" id="oppUsername" class="clearfix" name="oppUsername">
            </div>
        </form>
        <button type="submit" class="primary" id="playOptionsAction">Start Game</button>
        <button class="logged-in secondary back_logged" id="backToMainMenu">Back</button>
    </div>

    <div id="endGameScreen" class="screen" style="display: none;">
        <h2>Do you want to end the game?</h2>
        <input type="hidden" name="endgameid" id="endgameid">
        <button type="submit" class="primary">Yes</button>
        <button class="logged-in secondary back_logged" id="backToMainMenu">No</button>
    </div>

    <div class="floating-menu inGameMode" style="display: none;">
        <div class="float-info">
            <div class="avatar"></div>
            <div class="playerUsername">User</div>
        </div>
        <button class="primary playerQuickButton">Pause</button>
    </div>

    <div class="floatingRightBar inGameMode" style="display: none;">
        <div class="floatRightBarInfo">
            <div class="icon tooltip tooltip-left" id="rotateBoard" title="Rotate the chessboard"><img src="assets/images/rotate_button.jpg"/></div>
            <div class="icon tooltip tooltip-left" title = "Your Turn"><img class="pulsate" src="assets/images/white_piece_button.jpg"/></div>
            <div class="icon tooltip tooltip-left" title = "White's knockouts"><img src="assets/images/white_piece_button.jpg"/><span class="badge">3</span></div>
            <div class="icon tooltip tooltip-left" title = "Black's knockouts"><img src="assets/images/black_piece_button.jpg"/><span class="badge">3</span></div>
            <div class="icon tooltip tooltip-left exit" title = "Exit game"><img src="assets/images/exit_button.jpg"/></div>
        </div>
    </div>

    <div class="opponent inGameMode" style="display: none;">
        <div class="opponentBarInfo">
            <div class="msg-text">Playing with AI</div>
            <div class="msg tooltip tooltip-bottom" title="Toggle Guidance"><img src="assets/images/guide.png"/></div>
            <div class="msg tooltip tooltip-bottom" title = "Game Rules"><img src="assets/images/rules.png"/></div>
            <div class="msg tooltip tooltip-bottom" title="Game settings"><img src="assets/images/settings.png"/></div>
        </div>
    </div>

    <div class="gameContainer" id="gameContainer" style="display: none;">
    </div>

    <div id="promotionScreen" class="inGameScreen" style="display: none;">
        <h2>Promote your pawn to?</h2>
        <ul>
            <li><a href="#" id="PromoteToQueen">Queen</a></li>
            <li><a href="#" id="PromoteToRook">Rook</a></li>
            <li><a href="#" id="PromoteToBishop">Bishop</a></li>
            <li><a href="#" id="PromoteToKnight">Knight</a></li>
        </ul>
    </div>

    <div id="rulesScreen" class="screen" style="display: none;">
        <h2>Chess Rules</h2>
        <p>Rules</p>
    </div>

    <script type="module" src="./assets/js/main.js"></script>
    <script src="./assets/js/utils.js"></script>
    <script type="module" src="./assets/js/chessGame.js"></script>
</body>

</html>