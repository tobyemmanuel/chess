import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  void main() {
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vUv, center);

    vec3 innerColor = vec3(0.56, 0.93, 0.56); // Light green color
    vec3 outerColor = vec3(1.0, 1.0, 1.0); // White color

    vec3 color = mix(innerColor, outerColor, dist);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const fragmentShaderAlt = `
  varying vec2 vUv;
  void main() {
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vUv, center);

    vec3 innerColor = vec3(0.50, 0.0, 0.0); // Red color
    vec3 outerColor = vec3(1.0, 1.0, 1.0); // White color

    vec3 color = mix(innerColor, outerColor, dist);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const gradientMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
});

const gradientMaterialAlt = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShaderAlt,
});

export class chessGame {
  // gameId, players, settings, gameData = null
  constructor(gameData) {
    // console.log("gameData: " + JSON.stringify(gameData));
    this.container = document.getElementById("gameContainer");
    this.gameLoader = document.getElementById("gameLoader");
    this.gameLoaderDetails = document.getElementById("gameLoaderDetails");
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.chessboard = null;
    this.chessPieces = {};
    this.selectedPiece = null;
    this.state = { playerOne: "white", cameraAngle: 30 };
    this.eliminatedPieces = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.boardSize = 8;
    this.squareSize = 10;
    this.boardHeight = 10;
    this.isRotating = false;
    this.targetRotation = 0;
    this.rotationSpeed = (Math.PI / 180) * 2;
    this.chessPieceType = "set1";
    this.loadingProgress = 0;
    this.canNotCastle = {
      whiteKing: false,
      blackKing: false,
      whiteRooks: [false, false],
      blackRooks: [false, false],
    };
    this.enPassantTarget = null;
    this.pawnToPromote = null;
    this.promotionTargetSquareId = null;
    this.promotedPieces = [];
    this.extraPieces = {
      Rook: [0, 0],
      Knight: [0, 0],
      Bishop: [0, 0],
      Queen: [0, 0],
    };
    this.highlightedPossibleMoves = [];
    this.whiteKingInCheck = false;
    this.blackKingInCheck = false;
    this.gameOver = false;
    this.playerTurn = 'playerTwo';
    this.playerOne = 'W';
    this.playerTwo = 'B';

    //get started
    this.init();
    this.render();
    this.animate();
  }

  init() {
    this.gameLoader.style.display = "flex";
    this.initCamera();
    this.initScene();
    this.initRenderer();
    this.createChessboard();
    this.loadPieces();
    this.addEventListeners();
    this.playerTurns(this.playerTurn, "initialize")
  }

  initCamera() {
    this.gameLoaderDetails.innerHTML = "Arranging cameras";
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 60, 55);
    this.camera.lookAt(0, -5, 0);
  }

  initScene() {
    this.gameLoaderDetails.innerHTML = "Setting the Scene";
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xd4af37, 2);
    directionalLight.position.set(0, 1, 5).normalize();
    this.scene.add(directionalLight);
  }

  initRenderer() {
    this.gameLoaderDetails.innerHTML = "Preparing the renderer";
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);
    this.container.style.display = "flex";
    this.scene.background = null;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    this.gameLoader.style.display = "none";
    this.gameLoaderDetails.innerHTML = "Loading complete";
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    if (this.isRotating) {
      const currentRotation = this.chessboard.rotation.y;
      if (
        Math.abs(currentRotation - this.targetRotation) < this.rotationSpeed
      ) {
        this.chessboard.rotation.y = this.targetRotation; // Snap to target if close enough
        this.isRotating = false; // Stop rotation
      } else {
        this.chessboard.rotation.y +=
          Math.sign(this.targetRotation - currentRotation) * this.rotationSpeed;
      }
    }

    this.render();
  }

  rotateBoard() {
    if (!this.isRotating) {
      this.targetRotation += Math.PI / 2;
      this.isRotating = true;
    }
  }

  createChessboard() {
    this.gameLoaderDetails.innerHTML = "Generating the chessboard";
    this.chessboard = new THREE.Group();

    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const color = (row + col) % 2 === 0 ? 0xffffff : 0x707070;
        const squareGeometry = new THREE.PlaneGeometry(
          this.squareSize,
          this.squareSize
        );
        const squareMaterial = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.1,
          metalness: 0.5,
        });
        const square = new THREE.Mesh(squareGeometry, squareMaterial);

        square.position.set(
          col * this.squareSize -
            (this.boardSize * this.squareSize) / 2 +
            this.squareSize / 2,
          this.boardHeight,
          row * this.squareSize -
            (this.boardSize * this.squareSize) / 2 +
            this.squareSize / 2
        );
        square.rotation.x = -Math.PI / 2;

        const middlePoint = new THREE.Vector3(
          square.position.x,
          this.boardHeight,
          square.position.z
        );
        const squareId = `R${row + 1}C${col + 1}`;
        square.name = squareId;
        square.userData = {
          id: squareId,
          type: "square",
          middlePoint: middlePoint,
          occupant: null,
          color: (row + col) % 2 === 0 ? "white" : "black",
        };

        this.chessboard.add(square);
      }
    }

    this.scene.add(this.chessboard);
    this.createBezels();
  }

  createBezels() {
    this.gameLoaderDetails.innerHTML = "Still generating the chessboard";
    const bezelHeight = 2;
    const bezelThickness = 2;
    const bezelMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });

    const topBezel = new THREE.Mesh(
      new THREE.BoxGeometry(
        this.boardSize * this.squareSize + bezelThickness * 2,
        bezelHeight,
        bezelThickness
      ),
      bezelMaterial
    );
    topBezel.position.set(
      0,
      this.boardHeight + bezelHeight / 2,
      (-this.boardSize * this.squareSize) / 2 - bezelThickness / 2
    );
    this.chessboard.add(topBezel);

    const bottomBezel = new THREE.Mesh(
      new THREE.BoxGeometry(
        this.boardSize * this.squareSize + bezelThickness * 2,
        bezelHeight,
        bezelThickness
      ),
      bezelMaterial
    );
    bottomBezel.position.set(
      0,
      this.boardHeight + bezelHeight / 2,
      (this.boardSize * this.squareSize) / 2 + bezelThickness / 2
    );
    this.chessboard.add(bottomBezel);

    const leftBezel = new THREE.Mesh(
      new THREE.BoxGeometry(
        bezelThickness,
        bezelHeight,
        this.boardSize * this.squareSize + bezelThickness * 2
      ),
      bezelMaterial
    );
    leftBezel.position.set(
      (-this.boardSize * this.squareSize) / 2 - bezelThickness / 2,
      this.boardHeight + bezelHeight / 2,
      0
    );
    this.chessboard.add(leftBezel);

    const rightBezel = new THREE.Mesh(
      new THREE.BoxGeometry(
        bezelThickness,
        bezelHeight,
        this.boardSize * this.squareSize + bezelThickness * 2
      ),
      bezelMaterial
    );
    rightBezel.position.set(
      (this.boardSize * this.squareSize) / 2 + bezelThickness / 2,
      this.boardHeight + bezelHeight / 2,
      0
    );
    this.chessboard.add(rightBezel);
  }

  loadPieces() {
    const totalPieces = 32;
    let loadedPieces = 0;
    this.gameLoaderDetails.innerHTML = "Positioning the chess pieces";
    const loader = new GLTFLoader().setPath(
      `assets/models/${this.chessPieceType}/`
    );
    const pieceConfigs = [
      {
        filePath: "pawn white.glb",
        positions: [
          [0, 1],
          [1, 1],
          [2, 1],
          [3, 1],
          [4, 1],
          [5, 1],
          [6, 1],
          [7, 1],
        ],
        name: "Pawn",
        color: "W",
      },
      {
        filePath: "pawn black.glb",
        positions: [
          [0, 6],
          [1, 6],
          [2, 6],
          [3, 6],
          [4, 6],
          [5, 6],
          [6, 6],
          [7, 6],
        ],
        name: "Pawn",
        color: "B",
      },
      {
        filePath: "rook white.glb",
        positions: [
          [0, 0],
          [7, 0],
        ],
        name: "Rook",
        color: "W",
      },
      {
        filePath: "rook black.glb",
        positions: [
          [0, 7],
          [7, 7],
        ],
        name: "Rook",
        color: "B",
      },
      {
        filePath: "knight white.glb",
        positions: [
          [1, 0],
          [6, 0],
        ],
        name: "Knight",
        color: "W",
      },
      {
        filePath: "knight black.glb",
        positions: [
          [1, 7],
          [6, 7],
        ],
        name: "Knight",
        color: "B",
      },
      {
        filePath: "bishop white.glb",
        positions: [
          [2, 0],
          [5, 0],
        ],
        name: "Bishop",
        color: "W",
      },
      {
        filePath: "bishop black.glb",
        positions: [
          [2, 7],
          [5, 7],
        ],
        name: "Bishop",
        color: "B",
      },
      {
        filePath: "queen white.glb",
        positions: [[3, 0]],
        name: "Queen",
        color: "W",
      },
      {
        filePath: "queen black.glb",
        positions: [[3, 7]],
        name: "Queen",
        color: "B",
      },
      {
        filePath: "king white.glb",
        positions: [[4, 0]],
        name: "King",
        color: "W",
      },
      {
        filePath: "king black.glb",
        positions: [[4, 7]],
        name: "King",
        color: "B",
      },
    ];

    pieceConfigs.forEach((config) => {
      config.positions.forEach((pos, index) => {
        let pieceName = config.name == "Knight" ? "NKnight" : config.name;
        this.loadChessPiece(
          loader,
          config.filePath,
          pos[0],
          pos[1],
          `${config.color}${pieceName[0]}${index + 1}`,
          config.name,
          () => {
            loadedPieces++;
            this.updateLoaderDetails(loadedPieces, totalPieces);
          }
        );
      });
    });
  }

  updateLoaderDetails(loadedPieces, totalPieces) {
    this.gameLoaderDetails.innerHTML = `Loaded ${loadedPieces} of ${totalPieces} pieces`;
    if (loadedPieces === totalPieces) {
      this.gameLoaderDetails.innerHTML = "All pieces loaded!";
    }
  }

  loadChessPiece(
    loader,
    filePath,
    col,
    row,
    generatedName,
    name,
    onLoadCallback
  ) {
    loader.load(
      filePath,
      (gltf) => {
        const piece = gltf.scene.children[0];
        piece.scale.set(200.0, 200.0, 200.0);

        const position = this.getSquarePosition(col, row);
        piece.position.set(position.x, this.boardHeight, position.z);
        piece.name = generatedName;
        piece.userData = {
          id: generatedName,
          name: name,
          type: "piece",
          color: generatedName[0],
          currentPosition: this.getSquareId(row, col),
        };

        piece.traverse((node) => {
          if (node.isMesh) {
            node.visible = true;
            node.userData = piece.userData;
          }
        });
        piece.originalMaterial = piece.material;

        this.chessPieces[generatedName] = piece;
        this.placePieceOnSquare(piece, this.getSquareId(row, col));
        this.chessboard.add(piece);
        if (onLoadCallback) onLoadCallback();
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error);
      }
    );
  }

  getSquarePosition(col, row) {
    return {
      x:
        col * this.squareSize -
        (this.boardSize * this.squareSize) / 2 +
        this.squareSize / 2,
      z:
        row * this.squareSize -
        (this.boardSize * this.squareSize) / 2 +
        this.squareSize / 2,
    };
  }

  getSquareById(squareId) {
    return this.chessboard.children.find((square) => square.name === squareId);
  }

  placePieceOnSquare(piece, squareId, update = false) {
    const targetSquare = this.getSquareById(squareId);
    targetSquare.userData.occupant = piece.userData;
    if (update) {
      this.chessPieces[piece.name].userData.currentPosition = targetSquare.name;
    }
  }

  getSquareId(row, col) {
    return `R${row + 1}C${col + 1}`;
  }

  getSquareIdRaw(row, col) {
    return `${col},${row}`;
  }

  findPieceOnSquare(square) {
    const piecesArray = Object.values(this.chessPieces);
    for (const onePiece of piecesArray) {
      if (onePiece.userData.currentPosition == square) {
        return onePiece;
      }
    }
    return false;
  }

  findPieceSquare(piece) {
    return piece.userData.currentPosition;
  }

  checkValidMoves(targetSquareId, possibleMoves) {
    return possibleMoves.includes(targetSquareId);
  }

  movePiece(piece, targetSquareData) {
    console.log("moved piece to", targetSquareData);
    const targetSquare = this.getSquareById(targetSquareData.id);
    const pieceOnSquare = this.findPieceOnSquare(targetSquare.name);
    const getPieceKingPosition = this.getKingPosition(this.selectedPiece.userData.color)

    let action = false;
    let isKingChecked = false;
    const possibleMoves = this.highlightedPossibleMoves;
    const checkValidMoves = this.checkValidMoves(
      targetSquareData.id,
      possibleMoves
    );
    const willKingBeSafe = this.willKingBeSafe(this.selectedPiece.userData.color, getPieceKingPosition)
    console.log('kingstafe', willKingBeSafe, this.selectedPiece.userData.color, getPieceKingPosition)
    if (checkValidMoves) {
      // check if player's king is under threat if a move happens
      // check if player's king is already under threat
      // check if for checkmate after move
      console.log(
        "King is checked?",
        this.isKingInCheck(this.selectedPiece.userData.color)
      );
      // if (this.isKingInCheck(this.selectedPiece.userData.color)) {
      //   console.log("res", this.selectedPiece);
      //   const originalPosition = this.selectedPiece.userData.currentPosition;
      //   // Revert the move
      //   piece.userData.currentPosition = originalPosition;
      //   isKingChecked = true;
      //   // if (capturedPiece) this.restoreCapturedPiece(capturedPiece);
      //   toast("Invalid move: King is in check", "error");
      //   // return;
      // }

      // if (
      //   this.isKingInCheck(
      //     this.selectedPiece.userData.color,
      //     targetSquare.name
      //   )
      // ) {

      //   const originalPosition = this.selectedPiece.userData.currentPosition;
      //   // Revert the move
      //   piece.userData.currentPosition = originalPosition;
      //   isKingChecked = true;
      //   // if (capturedPiece) this.restoreCapturedPiece(capturedPiece);
      //   toast("Invalid move: King will be in check", "error");
      //   // return;
      // }

      //capturing a piece
      if (
        isKingChecked == false &&
        action == false &&
        pieceOnSquare &&
        piece.userData.color != pieceOnSquare.userData.color
      ) {
        if (this.capturePiece(pieceOnSquare.userData)) {
          toast("Captured " + pieceOnSquare.userData.name, "success");
          action = true;
        }else{
          action = false;
        }
      }

      //castling
      if (
        isKingChecked == false &&
        action == false &&
        this.selectedPiece.userData.name === "King" &&
        Math.abs(
          parseInt(this.selectedPiece.userData.currentPosition.charAt(3)) -
            parseInt(targetSquareData.id.charAt(3))
        ) === 2
      ) {
        this.handleCastlingMove(this.selectedPiece, targetSquareData);
        action = true;
      }

      //enpassant capture
      if (isKingChecked == false && this.selectedPiece.userData.name === "Pawn" && this.enPassantTarget) {
        const [enPassantRow, enPassantCol] = this.enPassantTarget
          .substring(1)
          .split("C")
          .map(Number)
          .map((n) => n - 1);
        if (
          targetSquareData.id === this.getSquareId(enPassantRow, enPassantCol)
        ) {
          this.handleEnPassantCapture(enPassantRow, enPassantCol);
          action = true;
        }
      }

      if (
        isKingChecked == false && action == false &&
        this.selectedPiece != null &&
        pieceOnSquare == false &&
        (!pieceOnSquare || (piece.userData.color != pieceOnSquare.userData.color || piece.userData.name !== "King"))
      ) {
        toast("Moved to " + targetSquareData.id, "success");
        action = true;
      }
    } else {
      toast("Invalid move main", "error");
    }

    //enpassant handling
    if (isKingChecked == false && this.selectedPiece.userData.name === "Pawn") {
      let targetRow = parseInt(targetSquareData.id.charAt(1)) - 1;
      this.enPassantListener(targetRow);

      if (
        (piece.userData.color === "W" && targetRow === 7) ||
        (piece.userData.color === "B" && targetRow === 0)
      ) {
        this.promotePawn(piece, targetSquareData.id);
        return; // Exit the function to wait for promotion choice
      }
    }

    if (action == true) {
      piece.position.set(
        targetSquareData.middlePoint.x,
        this.boardHeight,
        targetSquareData.middlePoint.z
      );

      this.postMoveActions(piece, targetSquareData.id);
    }else{
      toast('Invalid Move sub', 'error')
    }
  }

  postMoveActions(piece, targetSquareDataId = null, postPromotion = false) {
    
    this.revertHighlight();
    playKnockSound();
    this.antiCastlingListener(piece);
    //check if opponent king is in check
    if (!postPromotion) {
      this.revertHighlightedSquareColor(this.selectedPiece.userData.currentPosition);
      this.placePieceOnSquare(piece, targetSquareDataId, true);
    }

    let opponentColor = this.selectedPiece.userData.color == "W" ? "B" : "W";

    //check both kings
    this.isKingInCheckAlt(opponentColor);
    this.isKingInCheckAlt(this.selectedPiece.userData.color);

    if (!postPromotion) {
      this.revertPieceColor();
    }

    this.checkGameState(piece.userData.color);

    //check possinility of checkmate or stalemate
    this.playerTurns(opponentColor)
    this.selectedPiece = null;

    //save the game data around here
  }

  enPassantListener(targetRow) {
    const [startRow, startCol] = this.selectedPiece.userData.currentPosition
      .substring(1)
      .split("C")
      .map(Number)
      .map((n) => n - 1);
    if (Math.abs(targetRow - startRow) === 2) {
      this.enPassantTarget = this.getSquareId(
        (startRow + targetRow) / 2,
        startCol
      );
    } else {
      this.enPassantTarget = null;
    }
  }

  capturePiece(piece) {
    if (piece.name !== "King") {
      const pieceObject = this.chessPieces[piece.id];
      this.chessboard.remove(pieceObject);
      delete this.chessPieces[piece.id];
      this.eliminatedPieces.push(pieceObject);
      this.eliminatedPieceCounter()
      return true;
    }
    return false;
  }

  eliminatedPieceCounter() {
    const blackPieces = this.eliminatedPieces.filter(piece => piece.userData.color === 'B');
    const whitePieces = this.eliminatedPieces.filter(piece => piece.userData.color === 'W');

    const blackPieceCount = blackPieces.length;
    const whitePieceCount = whitePieces.length;

    document.querySelector(".whitePieceCount").innerHTML = whitePieceCount;
    document.querySelector(".blackPieceCount").innerHTML = blackPieceCount;
}

  addEventListeners() {
    this.gameLoaderDetails.innerHTML = "Almost there...";
    document.addEventListener("click", this.onMouseClick.bind(this), false);
    window.addEventListener("resize", this.onWindowResize.bind(this), false);
    document
      .getElementById("rotateBoard")
      .addEventListener("click", this.rotateBoard.bind(this), false);
  }

  onMouseClick(event) {
    event.preventDefault();
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(
      this.chessboard.children,
      true
    );

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      const userData = intersectedObject.userData;
      if (userData.type === "piece") {
        this.handlePieceClick(intersectedObject);
      } else if (userData.type === "square") {
        this.handleSquareClick(userData);
      }
    }
  }

  handlePieceClick(piece) {
    if (this.selectedPiece == null) {
      const selectAPiece = this.selectPiece(piece);
      if(selectAPiece){
        this.highlightPossibleMoves();
      }
    } else if (this.selectedPiece == piece) {
      this.revertHighlight();
      this.deselectPiece();
    } else if (this.selectedPiece.userData.color == piece.userData.color) {
      this.revertHighlight();
      this.changeSelectedPiece(piece);
      this.highlightPossibleMoves();
    } else {
      let squarePiece = this.findPieceSquare(piece);
      let squareData = this.getSquareById(squarePiece);
      this.movePiece(this.selectedPiece, squareData.userData);
    }
  }

  handleSquareClick(squareData) {
    const pieceOnSquare = this.findPieceOnSquare(squareData.id);

    if (pieceOnSquare && this.selectedPiece == null) {
      const selectAPiece = this.selectPiece(pieceOnSquare);
      if(selectAPiece){
        this.highlightPossibleMoves();
      }
    } else if (pieceOnSquare && this.selectedPiece == pieceOnSquare) {
      this.revertHighlight();
      this.deselectPiece();
    } else if (
      pieceOnSquare &&
      this.selectedPiece.userData.color == pieceOnSquare.userData.color
    ) {
      this.revertHighlight();
      this.changeSelectedPiece(pieceOnSquare);
      this.highlightPossibleMoves();
    } else if (this.selectedPiece) {
      this.movePiece(this.selectedPiece, squareData);
    }
  }

  selectPiece(piece) {
    const expectedSelectColor = this.playerTurn === "playerOne" ? this.playerOne : this.playerTwo;
    if(piece.userData.color === expectedSelectColor){
      playSelectSound();
      this.selectedPiece = piece;
      this.selectedPiece.originalMaterial = this.selectedPiece.material;
      this.selectedPiece.material = new THREE.MeshStandardMaterial({
        color: 0xefe4b0,
      });
      return true;
    }
    return false;
  }

  deselectPiece() {
    playDeselectSound();
    this.revertPieceColor();
    this.selectedPiece = null;
  }

  changeSelectedPiece(piece) {
    playSelectSound();
    piece.material = new THREE.MeshStandardMaterial({ color: 0xefe4b0 });
    this.revertPieceColor();
    this.selectedPiece = piece;
  }

  revertPieceColor() {
    this.selectedPiece.material = this.selectedPiece.originalMaterial;
    this.selectedPiece = null;
  }

  getPiecePossibleMoves(piece) {
    const { name, color, currentPosition } = piece.userData;
    const [row, col] = currentPosition
      .substring(1)
      .split("C")
      .map(Number)
      .map((n) => n - 1);

    switch (name) {
      case "Pawn":
        return this.getPawnMoves(col, row, color);
      case "Rook":
        return this.getRookMoves(col, row, color);
      case "Knight":
        return this.getKnightMoves(col, row, color);
      case "Bishop":
        return this.getBishopMoves(col, row, color);
      case "Queen":
        return this.getQueenMoves(col, row, color);
      case "King":
        return this.getKingMoves(col, row, color);
      default:
        return [];
    }
  }

  getPawnMoves(col, row, color) {
    const moves = [];
    const direction = color === "W" ? 1 : -1;

    if (
      this.isWithinBounds(col, row + direction) &&
      !this.isOccupied(col, row + direction)
    ) {
      moves.push(this.getSquareId(row + direction, col));

      if ((color === "W" && row === 1) || (color === "B" && row === 6)) {
        if (
          this.isWithinBounds(col, row + 2 * direction) &&
          !this.isOccupied(col, row + 2 * direction)
        ) {
          moves.push(this.getSquareId(row + 2 * direction, col));
        }
      }
    }

    if (
      this.isWithinBounds(col - 1, row + direction) &&
      this.isEnemyOccupied(col - 1, row + direction, color)
    ) {
      moves.push(this.getSquareId(row + direction, col - 1));
    }
    if (
      this.isWithinBounds(col + 1, row + direction) &&
      this.isEnemyOccupied(col + 1, row + direction, color)
    ) {
      moves.push(this.getSquareId(row + direction, col + 1));
    }

    if (this.enPassantTarget) {
      const [enPassantRow, enPassantCol] = this.enPassantTarget
        .substring(1)
        .split("C")
        .map(Number)
        .map((n) => n - 1);

      if (
        (col - 1 === enPassantCol || col + 1 === enPassantCol) &&
        row + direction === enPassantRow
      ) {
        moves.push(this.getSquareId(enPassantRow, enPassantCol));
      }
    }

    return moves;
  }

  getRookMoves(col, row, color) {
    return [
      ...this.getLineMoves(col, row, 1, 0, color),
      ...this.getLineMoves(col, row, -1, 0, color),
      ...this.getLineMoves(col, row, 0, 1, color),
      ...this.getLineMoves(col, row, 0, -1, color),
    ];
  }

  getKnightMoves(col, row, color) {
    const moves = [];
    const offsets = [
      [2, 1],
      [2, -1],
      [-2, 1],
      [-2, -1],
      [1, 2],
      [1, -2],
      [-1, 2],
      [-1, -2],
    ];

    offsets.forEach(([dc, dr]) => {
      if (
        this.isWithinBounds(col + dc, row + dr) &&
        !this.isOccupiedByFriend(col + dc, row + dr, color)
      ) {
        moves.push(this.getSquareId(row + dr, col + dc));
      }
    });

    return moves;
  }

  getBishopMoves(col, row, color) {
    return [
      ...this.getLineMoves(col, row, 1, 1, color),
      ...this.getLineMoves(col, row, -1, 1, color),
      ...this.getLineMoves(col, row, 1, -1, color),
      ...this.getLineMoves(col, row, -1, -1, color),
    ];
  }

  getQueenMoves(col, row, color) {
    return [...this.getRookMoves(col, row, color), ...this.getBishopMoves(col, row, color)];
  }

  getKingMoves(col, row, color) {
    const moves = [];
    const offsets = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];

    offsets.forEach(([dc, dr]) => {
      if (
        this.isWithinBounds(col + dc, row + dr) &&
        !this.isOccupiedByFriend(col + dc, row + dr, color)
      ) {
        moves.push(this.getSquareId(row + dr, col + dc));
      }
    });

    if (color === "W" && !this.canNotCastle.whiteKing) {
      if (
        !this.canNotCastle.whiteRooks[0] &&
        this.checkCastlingObstruction(col, row, -1)
      ) {
        moves.push(this.getSquareId(row, col - 2));
      }
      if (
        !this.canNotCastle.whiteRooks[1] &&
        this.checkCastlingObstruction(col, row, 1)
      ) {
        moves.push(this.getSquareId(row, col + 2));
      }
    } else if (color === "B" && !this.canNotCastle.blackKing) {
      if (
        !this.canNotCastle.blackRooks[0] &&
        this.checkCastlingObstruction(col, row, -1)
      ) {
        moves.push(this.getSquareId(row, col - 2));
      }
      if (
        !this.canNotCastle.blackRooks[1] &&
        this.checkCastlingObstruction(col, row, 1)
      ) {
        moves.push(this.getSquareId(row, col + 2));
      }
    }

    return moves;
  }

  checkCastlingObstruction(col, row, direction) {
    const step = direction > 0 ? 1 : -1;
    for (let i = 1; i <= Math.abs(direction); i++) {
      if (this.isOccupied(col + i * step, row)) return false;
    }
    return true;
  }

  getLineMoves(col, row, dCol, dRow, color) {
    const moves = [];
    let c = col + dCol;
    let r = row + dRow;

    while (this.isWithinBounds(c, r) && !this.isOccupied(c, r)) {
      moves.push(this.getSquareId(r, c));
      c += dCol;
      r += dRow;
    }

    if (
      this.isWithinBounds(c, r) &&
      this.isEnemyOccupied(c, r, color)
    ) {
      moves.push(this.getSquareId(r, c));
    }

    return moves;
  }

  isWithinBounds(col, row) {
    return col >= 0 && col < 8 && row >= 0 && row < 8;
  }

  isOccupied(col, row) {
    const squareId = this.getSquareId(row, col);
    const piece = this.findPieceOnSquare(squareId);
    return piece !== false;
  }

  isOccupiedByFriend(col, row, color) {
    const squareId = this.getSquareId(row, col);
    const piece = this.findPieceOnSquare(squareId);
    return piece && piece.userData.color === color;
  }

  isEnemyOccupied(col, row, color) {
    const squareId = this.getSquareId(row, col);
    const piece = this.findPieceOnSquare(squareId);
    return piece && piece.userData.color !== color;
  }

  highlightPossibleMoves(moves = null) {
    moves = this.getPiecePossibleMoves(this.selectedPiece);
    const selectedPieceName = this.selectedPiece.userData.name;
    const selectedPieceColor = this.selectedPiece.userData.color;
    moves.forEach((move) => {
      const square = this.getSquareById(move);
      if (square) {
        let checkKing = this.findPieceOnSquare(square.userData.id);
        let checkKingPicking = checkKing ? checkKing.userData.name : null;
        let highlighter = checkKingPicking !== 'King';

        if(selectedPieceName == 'King'){
          highlighter = this.willKingBeSafe(selectedPieceColor, square)
        }

        if (highlighter) {
          square.originalColor = square.material.color.getHex();
          square.material.color.setHex(0x90ee90);
          square.originalMaterial = square.material;
          square.material = gradientMaterial;
        }
      }
    });
    this.highlightedPossibleMoves = moves;
  }

  revertHighlight(moves) {
    moves = this.highlightedPossibleMoves;
    moves.forEach((move) => {
      const square = this.getSquareById(move);
      if (square && square.originalColor) {
        square.material = square.originalMaterial;
        square.material.color.setHex(square.originalColor);
      }
    });
    this.highlightedPossibleMoves = [];
  }

  handleCastlingMove(king, targetSquareData) {
    const targetCol = parseInt(targetSquareData.id.charAt(3)) - 1;
    const row = parseInt(king.userData.currentPosition.charAt(1)) - 1;
    const rookCol = targetCol === 6 ? 7 : 0;
    const newRookCol = targetCol === 6 ? 5 : 3;

    const intermediateCol =
      (king.userData.currentPosition.charAt(3) - targetCol) / 2 +
      king.userData.currentPosition.charAt(3);
    const intermediateSquareId = this.getSquareId(row, intermediateCol);

    if (
      this.isKingInCheck(
        king.userData.color,
        intermediateSquareId
      ) ||
      this.isKingInCheck(
        king.userData.color,
        targetSquareData.id
      )
    ) {
      return;
    }

    const rookId = this.getSquareId(row, rookCol);
    const newRookId = this.getSquareId(row, newRookCol);
    const rook = this.findPieceOnSquare(rookId);
    const targetSquareDataForRook = this.getSquareById(newRookId);

    if (rook) {
      rook.position.set(
        targetSquareDataForRook.userData.middlePoint.x,
        this.boardHeight,
        targetSquareDataForRook.userData.middlePoint.z
      );
      this.placePieceOnSquare(rook, newRookId, true);
    }

    if (king.userData.color === "W") {
      this.canNotCastle.whiteKing = true;
      this.canNotCastle.whiteRooks[targetCol === 6 ? 1 : 0] = true;
    } else {
      this.canNotCastle.blackKing = true;
      this.canNotCastle.blackRooks[targetCol === 6 ? 1 : 0] = true;
    }
  }

  handleEnPassantCapture(targetRow, targetCol) {
    const direction = this.selectedPiece.userData.color === "W" ? -1 : 1;
    const capturedPawnId = this.getSquareId(targetRow + direction, targetCol);
    const capturedPawn = this.findPieceOnSquare(capturedPawnId);
    if (capturedPawn) {
      this.capturePiece(capturedPawn.userData);
    }
  }

  promotePawn(pawn, targetSquareId) {
    const promotionScreen = document.getElementById("promotionScreen");
    promotionScreen.style.display = "block";

    this.pawnToPromote = pawn;
    this.promotionTargetSquareId = targetSquareId;

    document.getElementById("PromoteToQueen").onclick = () =>
      this.completePromotion("Queen");
    document.getElementById("PromoteToRook").onclick = () =>
      this.completePromotion("Rook");
    document.getElementById("PromoteToBishop").onclick = () =>
      this.completePromotion("Bishop");
    document.getElementById("PromoteToKnight").onclick = () =>
      this.completePromotion("Knight");
  }

  completePromotion(pieceType) {
    const pawn = this.pawnToPromote;
    const targetSquareId = this.promotionTargetSquareId;
    const color = pawn.userData.color;

    // Remove the promotion screen and pawn
    document.getElementById("promotionScreen").style.display = "none";

    this.addPiece(color, pieceType, targetSquareId);

    this.removePiece(pawn.userData);
    this.postMoveActions(pawn, null, true);

    // Clear the stored pawn promotion
    this.pawnToPromote = null;
    this.promotionTargetSquareId = null;
  }

  removePiece(piece) {
    const pieceObject = this.chessPieces[piece.id];
    this.chessboard.remove(pieceObject);
    delete this.chessPieces[piece.id];
    this.promotedPieces.push(pieceObject);
  }

  addPiece(color, pieceType, position) {
    const loader = new GLTFLoader().setPath(
      `assets/models/${this.chessPieceType}/`
    );
    let filePath;
    let fileNameAppend = color === "W" ? "white" : "black";

    switch (pieceType) {
      case "Queen":
        filePath = `queen ${fileNameAppend}.glb`;
        break;
      case "Rook":
        filePath = `rook ${fileNameAppend}.glb`;
        break;
      case "Bishop":
        filePath = `bishop ${fileNameAppend}.glb`;
        break;
      case "Knight":
        filePath = `knight ${fileNameAppend}.glb`;
        break;
      default:
        console.error("Unknown piece type:", pieceType);
        return;
    }

    loader.load(
      filePath,
      (gltf) => {
        const piece = gltf.scene.children[0];
        piece.scale.set(200.0, 200.0, 200.0);

        let pieceName = pieceType == "Knight" ? "NKnight" : pieceType;
        let initialPieceCount = pieceType == "Queen" ? 1 : 0;
        let pieceIndexForExtraPieces = color == "W" ? 0 : 1;
        this.extraPieces[pieceType][pieceIndexForExtraPieces] += 1;
        let pieceNumberAppend =
          initialPieceCount +
          this.extraPieces[pieceType][pieceIndexForExtraPieces];
        const generatedName = `${color}${pieceName.charAt(
          0
        )}${pieceNumberAppend}`;

        piece.name = generatedName;
        piece.userData = {
          id: generatedName,
          name: pieceType,
          type: "piece",
          color: color,
          currentPosition: position,
        };

        const targetSquare = this.getSquareById(position);
        piece.position.set(
          targetSquare.userData.middlePoint.x,
          this.boardHeight,
          targetSquare.userData.middlePoint.z
        );

        piece.traverse((node) => {
          if (node.isMesh) {
            node.visible = true;
            node.userData = piece.userData;
          }
        });
        piece.originalMaterial = piece.material;

        this.chessPieces[generatedName] = piece;
        this.placePieceOnSquare(piece, targetSquare.name);
        this.chessboard.add(piece);
      },
      undefined,
      (error) => {
        toast(
          "An error occurred while loading the piece, Please refresh your browser",
          "error"
        );
        console.error(
          "An error occurred while loading the piece, Please refresh your browser:",
          error
        );
      }
    );
  }

  isKingInCheck(kingColor, targetSquare = null, chessPieces = null) {
    let kingPosition = chessPieces === null ? this.getKingPosition(kingColor) : this.getKingPosition(kingColor, chessPieces);
    if (targetSquare !== null) {
      kingPosition = targetSquare;
    }
    const enemyColor = kingColor === "W" ? "B" : "W";
    const enemyPieces = chessPieces === null ? this.getAllPiecesOfColor(enemyColor) : this.getAllPiecesOfColor(enemyColor, chessPieces);
    for (const piece of enemyPieces) {
      const possibleMoves = this.getPiecePossibleMoves(piece);
      if (possibleMoves.includes(kingPosition)) {
        return true;
      }
    }

    return false;
  }

  isKingInCheckAlt(mainColor) {
    const secColor = mainColor === "W" ? "B" : "W";
    let secKingPosition = this.getKingPosition(mainColor);
    const myPieces = this.getAllPiecesOfColor(secColor);

    for (const piece of myPieces) {
      const possibleMoves = this.getPiecePossibleMoves(piece);

      if (possibleMoves.includes(secKingPosition)) {
        this.highlightCheckedKing(mainColor, secKingPosition);
        return true;
      }
    }
    this.removeHighlightCheckedKing(mainColor, secKingPosition);
    return false;
  }

  highlightCheckedKing(color, position) {
    if (color == "W") {
      this.whiteKingInCheck = true;
    } else {
      this.blackKingInCheck = true;
    }
    const square = this.getSquareById(position);
    if(typeof square.material.color !== "undefined"){
      square.originalColor = square.material.color.getHex();
          // square.material.color.setHex(0x90ee90);
      square.originalMaterial = square.material;
      square.material = gradientMaterialAlt;
    }

    let fullColorName = color == "W" ? "White" : "Black";
    toast(`${fullColorName} king is in check`, "error");
  }

  removeHighlightCheckedKing(color, position) {
    let previousState = false;
    if (color == "W") {
      previousState = this.whiteKingInCheck;
      this.whiteKingInCheck = false;
    } else {
      previousState = this.blackKingInCheck;
      this.blackKingInCheck = false;
    }
    if (previousState) {
      const square = this.getSquareById(position);
      if (square && square.originalColor) {
        square.material = square.originalMaterial;
        square.material.color.setHex(square.originalColor);
        square.originalMaterial = null;
      }
      let fullColorName = color == "W" ? "White" : "Black";
      toast(`${fullColorName} king is given a breather`, "success");
    }
  }

  revertHighlightedSquareColor(position = null, mainColor = null) {
    let square = position !== null ? this.getSquareById(position) : this.getKingPosition(mainColor);
    if (square && square.originalColor) {
      square.material = square.originalMaterial;
      square.material.color.setHex(square.originalColor);
    }
  }

  willKingBeSafe(color, targetSquare) {
    const status = !this.isKingInCheck(color, targetSquare);
    return status;
  }

  isMoveLegal(piece, move, color) {
    const chessPiecesCopy = this.cloneGameState(this.chessPieces);
    const pieceId = piece.userData.id;
    const pieceCopy = chessPiecesCopy[pieceId];
    this.simulateMove(pieceCopy, move, chessPiecesCopy);
    return !this.isKingInCheck(color, chessPiecesCopy);
  }

  simulateMove(piece, newPosition, chessPieces) {
    const originalPosition = piece.object.userData.currentPosition;
    piece.object.userData.currentPosition = newPosition;

    for (const id in chessPieces) {
      if (chessPieces[id].object.userData.currentPosition === newPosition && chessPieces[id].object.userData !== piece.userData) {
        delete chessPieces[id]; 
      }
    }
  }

  cloneGameState(chessPieces) {
    return JSON.parse(JSON.stringify(chessPieces));
  } 

  checkGameState(color) {
    const opponentColor = color === 'W' ? 'B' : 'W';

    if (this.checkmate(opponentColor)) {
      console.log('Checkmate!');
    } else if (this.stalemate(opponentColor)) {
      console.log('Stalemate!');
    }
  }

  checkmate(color) {
    if (!this.isKingInCheck(color)) {
      return false;
    }

    const playerPieces = this.getAllPiecesOfColor(color);

    for (const piece of playerPieces) {
      const possibleMoves = this.getPiecePossibleMoves(piece);
      for (const move of possibleMoves) {
        console.log('Moved', piece);
        if (this.isMoveLegal(piece, move, color)) {
          return false;
        }
      }
    }
    return true;
  }

  stalemate(color) {
    if (this.isKingInCheck(color)) {
      return false;
    }

    const playerPieces = this.getAllPiecesOfColor(color);

    for (const piece of playerPieces) {
      const possibleMoves = this.getPiecePossibleMoves(piece);
      for (const move of possibleMoves) {
        console.log('Morved', piece);

        if (this.isMoveLegal(piece, move, color)) {
          return false;
        }
      }
    }
    return true;
  }

  antiCastlingListener(piece) {
    if (piece.userData.name === "King") {
      if (piece.userData.color === "W") {
        this.canNotCastle.whiteKing = true;
      } else if (piece.userData.color === "B") {
        this.canNotCastle.blackKing = true;
      }
    } else if (piece.userData.name === "Rook") {
      if (piece.userData.color === "W") {
        // Queen-side rook
        if (piece.position.col === 0 && piece.position.row === 7) {
          this.canNotCastle.whiteRooks[0] = true;
        }
        // King-side rook
        else if (piece.position.col === 7 && piece.position.row === 7) {
          this.canNotCastle.whiteRooks[1] = true;
        }
      } else if (piece.userData.color === "B") {
        // Queen-side rook
        if (piece.position.col === 0 && piece.position.row === 0) {
          this.canNotCastle.blackRooks[0] = true;
        }
        // King-side rook
        else if (piece.position.col === 7 && piece.position.row === 0) {
          this.canNotCastle.blackRooks[1] = true;
        }
      }
    }
  }
  
  getKingPosition(color, chessPieces = this.chessPieces) {
    
    for (const pieceId in chessPieces) {
      const piece = chessPieces[pieceId];
      if (piece.userData.name === "King" && piece.userData.color === color) {
        return piece.userData.currentPosition;
      }
    }
    return null;
  }

  getAllPiecesOfColor(color, chessPieces = this.chessPieces) {
    return Object.values(chessPieces).filter(
      (piece) => piece.userData.color === color
    );
  }

  playerTurns(color, status = null){
    if(status === "initialize"){
      if(this.playerOne === 'W'){
        document.querySelector(".whitePieceTurn").id = "playerOne";
        document.querySelector(".blackPieceTurn").id = "playerTwo";
      }else{
        document.querySelector(".blackPieceTurn").id = "playerOne";
        document.querySelector(".whitePieceTurn").id = "playerTwo";
      }
      document.getElementById(this.playerTurn).style.display = "flex";
    }else{
      if(color === this.playerOne && this.playerTurn !== "playerOne"){
        document.getElementById("playerOne").style.display = "flex";
        document.getElementById("playerTwo").style.display = "none";
        this.playerTurn = "playerOne";
      }else if(color === this.playerTwo && this.playerTurn !== "playerTwo"){
        document.getElementById("playerOne").style.display = "none";
        document.getElementById("playerTwo").style.display = "flex";
        this.playerTurn = "playerTwo";
      }else{
         toast("Something went wrong. Please refresh your browser", "error");
      }
    }
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
