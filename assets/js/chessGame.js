import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class chessGame {
  // gameId, players, settings, gameData = null
  constructor(gameData) {
    console.log("gameData: " + JSON.stringify(gameData));
    this.container = document.getElementById("gameContainer");

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

    this.init();
    this.render();
    this.animate();
  }

  init() {
    this.initCamera();
    this.initScene();
    this.initRenderer();
    this.createChessboard();
    this.loadPieces();
    this.addEventListeners();
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 50, 55);
    this.camera.lookAt(0, -5, 0);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xd4af37, 2);
    directionalLight.position.set(0, 1, 5).normalize();
    this.scene.add(directionalLight);
  }

  initRenderer() {
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
      console.log(config);
      config.positions.forEach((pos, index) => {
        this.loadChessPiece(
          loader,
          config.filePath,
          pos[0],
          pos[1],
          `${config.color}${config.name[0]}${index + 1}`,
          config.name
        );
      });
    });
  }

  loadChessPiece(loader, filePath, col, row, generatedName, name) {
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

        this.chessPieces[generatedName] = piece;
        this.placePieceOnSquare(piece, this.getSquareId(col, row));
        this.chessboard.add(piece);
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

  placePieceOnSquare(piece, squareId) {
    const targetSquare = this.getSquareById(squareId);
    targetSquare.userData.occupant = piece.userData;
  }

  getSquareId(col, row) {
    return `R${row + 1}C${col + 1}`;
  }

  addEventListeners() {
    window.addEventListener("resize", this.onWindowResize.bind(this), false);
    document
      .getElementById("rotateBoard")
      .addEventListener("click", this.rotateBoard.bind(this), false);
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
