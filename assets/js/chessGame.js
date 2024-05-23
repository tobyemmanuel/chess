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
    vec3 color = mix(vec3(1.0, 1.0, 1.0), vec3(0.56, 0.93, 0.56), vUv.y);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const gradientMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
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
          currentPosition: this.getSquareId(col, row),
        };

        piece.traverse((node) => {
          if (node.isMesh) {
            node.visible = true;
            node.userData = piece.userData;
          }
        });
        piece.originalMaterial = piece.material;

        this.chessPieces[generatedName] = piece;
        this.placePieceOnSquare(piece, this.getSquareId(col, row));
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

  getSquareId(col, row) {
    return `R${row + 1}C${col + 1}`;
  }

  getSquareIdRaw(col, row) {
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
    console.log("move piece", targetSquareData);
    const targetSquare = this.getSquareById(targetSquareData.id);
    const pieceOnSquare = this.findPieceOnSquare(targetSquare.name);

    let action = false;
    const possibleMoves = this.highlightedPossibleMoves;
    const checkValidMoves = this.checkValidMoves(
      targetSquareData.id,
      possibleMoves
    );

    if (checkValidMoves) {
      if (
        action == false &&
        pieceOnSquare &&
        piece.userData.color != pieceOnSquare.userData.color
      ) {
        this.capturePiece(pieceOnSquare.userData);
        toast("Captured " + pieceOnSquare.userData.name, "success");
        action = true;
      }

      if (
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

      if (this.selectedPiece.userData.name === "Pawn" && this.enPassantTarget) {
        const [enPassantCol, enPassantRow] = this.enPassantTarget
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
        (action == false &&
          this.selectedPiece != null &&
          pieceOnSquare == false) ||
        (action == false &&
          piece.userData.color != pieceOnSquare.userData.color)
      ) {
        toast("Moved to " + targetSquareData.id, "success");
        action = true;
      }
    } else {
      toast("Invalid move", "error");
    }

    if (this.selectedPiece.userData.name === "Pawn") {
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
    }
  }

  postMoveActions(piece, targetSquareDataId = null, postPromotion = false) {
    this.revertHighlight();
    playKnockSound();
    if (!postPromotion) {
      this.placePieceOnSquare(piece, targetSquareDataId, true);
      this.revertPieceColor();
    }
    this.selectedPiece = null;
  }

  enPassantListener(targetRow) {
    const [startRow, startCol] = this.selectedPiece.userData.currentPosition
      .substring(1)
      .split("C")
      .map(Number)
      .map((n) => n - 1);
    if (Math.abs(targetRow - startRow) === 2) {
      this.enPassantTarget = this.getSquareId(
        startCol,
        (startRow + targetRow) / 2
      );
    } else {
      this.enPassantTarget = null;
    }
  }
  capturePiece(piece) {
    const pieceObject = this.chessPieces[piece.id];
    this.chessboard.remove(pieceObject);
    delete this.chessPieces[piece.id];
    this.eliminatedPieces.push(pieceObject);
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
      this.selectPiece(piece);
      this.highlightPossibleMoves();
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
      this.selectPiece(pieceOnSquare);
      this.highlightPossibleMoves();
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
    playSelectSound();
    this.selectedPiece = piece;
    this.selectedPiece.originalMaterial = this.selectedPiece.material;
    this.selectedPiece.material = new THREE.MeshStandardMaterial({
      color: 0xefe4b0,
    });
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
        return this.getRookMoves(col, row);
      case "Knight":
        return this.getKnightMoves(col, row);
      case "Bishop":
        return this.getBishopMoves(col, row);
      case "Queen":
        return this.getQueenMoves(col, row);
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
      moves.push(this.getSquareId(col, row + direction));

      if ((color === "W" && row === 1) || (color === "B" && row === 6)) {
        if (
          this.isWithinBounds(col, row + 2 * direction) &&
          !this.isOccupied(col, row + 2 * direction)
        ) {
          moves.push(this.getSquareId(col, row + 2 * direction));
          this.enPassantTarget = this.getSquareId(col, row + direction);
        }
      }
    }

    if (
      this.isWithinBounds(col - 1, row + direction) &&
      this.isEnemyOccupied(col - 1, row + direction, color)
    ) {
      moves.push(this.getSquareId(col - 1, row + direction));
    }
    if (
      this.isWithinBounds(col + 1, row + direction) &&
      this.isEnemyOccupied(col + 1, row + direction, color)
    ) {
      moves.push(this.getSquareId(col + 1, row + direction));
    }

    if (this.enPassantTarget) {
      const [enPassantRow, enPassantCol] = this.enPassantTarget
        .substring(1)
        .split("C")
        .map(Number)
        .map((n) => n - 1);

      console.log(
        "check error 6",
        enPassantCol,
        enPassantRow,
        col,
        row,
        direction
      );
      if (
        (col - 1 === enPassantCol || col + 1 === enPassantCol) &&
        row + direction === enPassantRow
      ) {
        console.log("pass moves", this.enPassantTarget);
        moves.push(this.getSquareId(enPassantCol, enPassantRow));
      }
    }

    return moves;
  }

  getRookMoves(col, row) {
    return [
      ...this.getLineMoves(col, row, 1, 0),
      ...this.getLineMoves(col, row, -1, 0),
      ...this.getLineMoves(col, row, 0, 1),
      ...this.getLineMoves(col, row, 0, -1),
    ];
  }

  getKnightMoves(col, row) {
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
        !this.isOccupiedByFriend(col + dc, row + dr)
      ) {
        moves.push(this.getSquareId(col + dc, row + dr));
      }
    });

    return moves;
  }

  getBishopMoves(col, row) {
    return [
      ...this.getLineMoves(col, row, 1, 1),
      ...this.getLineMoves(col, row, -1, 1),
      ...this.getLineMoves(col, row, 1, -1),
      ...this.getLineMoves(col, row, -1, -1),
    ];
  }

  getQueenMoves(col, row) {
    return [...this.getRookMoves(col, row), ...this.getBishopMoves(col, row)];
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
        !this.isOccupiedByFriend(col + dc, row + dr)
      ) {
        moves.push(this.getSquareId(col + dc, row + dr));
      }
    });

    if (color === "W" && !this.canNotCastle.whiteKing) {
      if (
        !this.canNotCastle.whiteRooks[0] &&
        this.checkCastlingObstruction(col, row, -1)
      ) {
        moves.push(this.getSquareId(col - 2, row));
      }
      if (
        !this.canNotCastle.whiteRooks[1] &&
        this.checkCastlingObstruction(col, row, 1)
      ) {
        moves.push(this.getSquareId(col + 2, row));
      }
    } else if (color === "B" && !this.canNotCastle.blackKing) {
      if (
        !this.canNotCastle.blackRooks[0] &&
        this.checkCastlingObstruction(col, row, -1)
      ) {
        moves.push(this.getSquareId(col - 2, row));
      }
      if (
        !this.canNotCastle.blackRooks[1] &&
        this.checkCastlingObstruction(col, row, 1)
      ) {
        moves.push(this.getSquareId(col + 2, row));
      }
    }

    return moves;
  }

  checkCastlingObstruction(col, row, direction) {
    const step = direction > 0 ? 1 : -1;
    for (let i = 1; i <= 2; i++) {
      if (this.isOccupied(col + i * step, row)) return false;
    }
    return true;
  }

  getLineMoves(col, row, dCol, dRow) {
    const moves = [];
    let c = col + dCol;
    let r = row + dRow;

    while (this.isWithinBounds(c, r) && !this.isOccupied(c, r)) {
      moves.push(this.getSquareId(c, r));
      c += dCol;
      r += dRow;
    }

    if (
      this.isWithinBounds(c, r) &&
      this.isEnemyOccupied(c, r, this.selectedPiece.userData.color)
    ) {
      moves.push(this.getSquareId(c, r));
    }

    return moves;
  }

  isWithinBounds(col, row) {
    return col >= 0 && col < 8 && row >= 0 && row < 8;
  }

  isOccupied(col, row) {
    const squareId = this.getSquareId(col, row);
    const piece = this.findPieceOnSquare(squareId);
    return piece !== false;
  }

  isOccupiedByFriend(col, row) {
    const squareId = this.getSquareId(col, row);
    const piece = this.findPieceOnSquare(squareId);
    return piece && piece.userData.color === this.selectedPiece.userData.color;
  }

  isEnemyOccupied(col, row, color) {
    const squareId = this.getSquareId(col, row);
    const piece = this.findPieceOnSquare(squareId);
    return piece && piece.userData.color !== color;
  }

  highlightPossibleMoves(moves = null) {
    moves = this.getPiecePossibleMoves(this.selectedPiece);
    moves.forEach((move) => {
      const square = this.getSquareById(move);
      if (square) {
        square.originalColor = square.material.color.getHex();
        square.material.color.setHex(0x90ee90);
        square.originalMaterial = square.material;
        square.material = gradientMaterial;
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

    const rookId = this.getSquareId(rookCol, row);
    const newRookId = this.getSquareId(newRookCol, row);
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

  handleEnPassantCapture(row, col) {
    console.log("debug", this.enPassantTarget);
    const capturedPawnId = this.getSquareId(
      row,
      col - (this.selectedPiece.userData.color === "W" ? 1 : -1)
    );
    const capturedPawn = this.findPieceOnSquare(capturedPawnId);
    if (capturedPawn) {
      this.capturePiece(capturedPawn.userData);
    }
  }

  promotePawn(pawn, targetSquareId) {
    const promotionScreen = document.getElementById("promotionScreen");
    promotionScreen.style.display = "block";
    console.log("targetSquareId: ", targetSquareId);
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
  
  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
