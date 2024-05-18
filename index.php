<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3DChess Pro by Tobi</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <link rel="stylesheet" href="./assets/css/styles.css">
    <link rel="shortcut icon" href="./assets/images/favicon.png" type="image/png" />
</head>

<body>
    <div class="loading-screen" id="loading-screen">
        <div class="loading-spinner"></div>
        <div class="loading-text">Please wait</div>
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
            <li><a href="#" class="gameSettings">Game Settings</a></li>
            <li><a href="#" class="history">History</a></li>
            <li><a href="#" class="highScores">High Scores</a></li>
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
            <label for="passcode">Pass Code</label>
            <input type="password" id="passcode" name="passcode" required>
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
            <input type="password" id="passcode" name="passcode" required>
        </form>
        <button type="submit"  id="continuePlayerAction" class="primary">Continue</button>
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
        <form>
            <label for="brightness">Brightness:</label>
            <input type="range" id="brightness" name="brightness" min="40" max="90">
            <br>
            <label for="angle">Camera Angle:</label>
            <input type="range" id="angle" name="angle" min="0" max="360">
            <br>
            <label for="boardColor">Chessboard Color:</label>
            <select id="boardColor" name="boardColor">
                <option value="set1">Black & White</option>
            </select>
            <br>
            <label for="boardColor">Chess Piece:</label>
            <select id="chessPieceType" name="chessPieceType">
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
        <button class="primary">Save</button>
        <button class="logged-in secondary back_logged" id="backToLoggedMenu">Back</button>
        <button class="logged-out secondary back" id="backToMainMenu">Back</button>
    </div>


    <script src="./assets/js/main.js"></script>
    <script src="./assets/js/utils.js"></script>
</body>

</html>