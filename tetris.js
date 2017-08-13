"use strict";

setTimeout(() => {
    startGame();
    //benchmark();
}, 500);

const PIECE_SCHEMAS = {
    "L": [  [1, 0],
            [1, 0],
            [1, 1]],
    "T": [  [0, 1, 0],
            [1, 1, 1]],
}

class Block {
    constructor(color, position) {
        this.color = color;
        this.position = position;
    }
}

class Piece {
    constructor(shape, color) {
        this.color = color;
        this.shape = {
            "name": shape,
            "schema": PIECE_SCHEMAS[shape]
        }
    }

    rotate(direction) {
        let baseSchema = this.shape.schema,
            newSchema = [],
            rotation;

        if(direction == 1) {
            rotation = (i, j, baseSchema, newSchema) => {
                newSchema[j][baseSchema.length - i - 1] = baseSchema[i][j]; 
            };                  
        } else {
            rotation = (i, j, baseSchema, newSchema) => {
                newSchema[baseSchema[0].length - j - 1][i] = baseSchema[i][j];  
            };             
        }

        for(let j = 0; j < baseSchema[0].length; j++) {
            newSchema.push([]);
        }
        
        for(let j = 0; j < baseSchema[0].length; j++) {
            for(let i = baseSchema.length - 1; i >= 0; i--) {      
                rotation(i, j, baseSchema, newSchema); 
            }
        }

        this.shape.schema = newSchema;
    }
}

class Board {
    constructor(backgroundColor, boardSize) {
        this.backgroundColor = backgroundColor;
        this.state = [];
        this.boardSize = boardSize;
        this.activePiece = null;
        this.defaultAnchor = [1, Math.floor(boardSize[1] / 2)];
        this.blocks = [];
        this.resetBoard();
    }

    resetBoard() {
        this.resetState();
        this.blocks = [];
        this.activePiece = null;
        this.activeAnchor = JSON.parse(JSON.stringify(this.defaultAnchor));
    }

    outputState() {
        let stateRow = "";
        this.generateState();
        console.info("Current board state:");
        for(let i = 0, l = this.boardSize[0] * this.boardSize[1]; i < l; i++) {
            stateRow += this.state[i];
            if(i % this.boardSize[1] == 0 && i > 0) {
                console.log(stateRow);
                stateRow = "";
            }
        }
    }

    resetState() {
        for(let i = 0, l = this.boardSize[0] * this.boardSize[1]; i < l; i++) {
            this.state[i] = "-";
        }
    }

    generateState() {
        this.resetState();
        this.blocks.forEach(function(block) {
            let position = block.position[0] * this.boardSize[1] + block.position[1];
            this.state[position] = block.color;
        }, this);

        if(this.activePiece != null) {            
            let pieceShape = this.activePiece.shape.schema,
                pieceColor = this.activePiece.color;

            for(let i = 0; i < pieceShape.length; i++) {
                for(let j = 0; j < pieceShape[i].length; j++) {
                    if(pieceShape[i][j]) {                   
                        let position = (this.activeAnchor[0] + i) * this.boardSize[1] + 
                            this.activeAnchor[1] + j;    
                        this.state[position] = pieceColor;
                    }
                }
            }
        }
    }

    addPiece(piece) {
        this.activePiece = piece;
        this.activeAnchor = JSON.parse(JSON.stringify(this.defaultAnchor));
    }

    movePiece(direction) {
        if(this.activePiece != null) {
            let newPosition = this.activeAnchor[1] + direction;
            if(!(newPosition < 0 ||  newPosition + this.activePiece.shape.schema[0].length > this.boardSize[1])) {
                this.activeAnchor[1] = newPosition;
            }
        }
    }

    executeGravityStep() {
        if(this.activePiece != null) {
            let shouldBreakPiece = this.activeAnchor[0] + this.activePiece.shape.schema.length >= this.boardSize[0]
                || false;
            
            if(shouldBreakPiece) {
                this.breakActivePiece();
            } else {
                this.activeAnchor[0]++;
            }       
        } 
    }

    breakActivePiece() {
        let pieceShape = this.activePiece.shape.schema,
            pieceColor = this.activePiece.color;

        for(let i = 0; i < pieceShape.length; i++) {
            for(let j = 0; j < pieceShape[i].length; j++) {
                if(pieceShape[i][j]) {  
                    this.blocks.push(
                        new Block(pieceColor, [this.activeAnchor[0] + i, this.activeAnchor[1] + j]));
                }
            }
        }

        this.activePiece = null;

        this.addPiece(new Piece("T", "" + (Math.floor(Math.random() * 9) + 1))) // TODO: Remove
    }    

    rotatePiece(direction) {
        if(this.activePiece != null) {
            let shouldBreakPiece = false;
            if(this.activeAnchor[1] + this.activePiece.shape.schema.length >= this.boardSize[1]) {
                this.activeAnchor[1]--;
            }
            if(this.activeAnchor[0] + this.activePiece.shape.schema[0].length > this.boardSize[0]) {
                this.activeAnchor[0]--;
                shouldBreakPiece = true;
            }
            // Todo: prevent collision with other blocks when rotating
            this.activePiece.rotate(direction);

            if(shouldBreakPiece) this.breakActivePiece();
        }
    }
}

class Player {
    constructor(board) {
        this.activeBoard = board;
        document.addEventListener('keydown', (e) => {
            if(typeof(this.activeBoard) !== "undefined" && this.activeBoard != null)
                this.handleEvent(e);
        });       
    }

    handleEvent(event) {
        let keyName = event.code;

        switch(keyName) {
            case "ArrowLeft": this.activeBoard.movePiece(-1); break;
            case "ArrowRight": this.activeBoard.movePiece(1); break;
            case "Space": // Fall-through
            case "ArrowDown": this.activeBoard.executeGravityStep();  break;
            case "KeyZ": this.activeBoard.rotatePiece(-1); break;
            case "KeyX": this.activeBoard.rotatePiece(1); break;
        }
    }
}

class Drawer {
    constructor(backgroundColor, canvasSize, canvasId) {
        this.backgroundColor = backgroundColor;
        this.ctx = document.getElementById(canvasId).getContext('2d');
        this.canvasSize = canvasSize;
    }

    prepareCanvas() {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvasSize[0], this.canvasSize[1]);
    }

    drawBoard(board) {
        let blockSize = this.canvasSize[1] / board.boardSize[0],
            leftBound = this.canvasSize[0] / 2 - blockSize * board.boardSize[1] / 2;

        this.prepareCanvas();
        board.generateState();

        for(let i = 0, l = board.boardSize[0] * board.boardSize[1]; i < l; i++) {
            let x = leftBound + (i % board.boardSize[1]) * blockSize,
                y = Math.floor(i / board.boardSize[1]) * blockSize;
            switch (board.state[i]) {
                case "-": this.ctx.fillStyle = board.backgroundColor; break;
                case "1": this.ctx.fillStyle = "rgb(200, 0, 0)"; break;
                case "2": this.ctx.fillStyle = "rgb(0, 200, 0)"; break;
                case "3": this.ctx.fillStyle = "rgb(0, 0, 200)"; break;
                case "4": this.ctx.fillStyle = "rgb(200, 80, 80)"; break;
                case "5": this.ctx.fillStyle = "rgb(80, 200, 80)"; break;
                case "6": this.ctx.fillStyle = "rgb(80, 80, 200)"; break;
                case "7": this.ctx.fillStyle = "rgb(200, 200, 0)"; break;
                case "8": this.ctx.fillStyle = "rgb(200, 0, 200)"; break;
                case "9": this.ctx.fillStyle = "rgb(0, 200, 200)"; break;
                default: this.ctx.fillStyle = "rgb(255, 45, 220)";
            }

            this.ctx.fillRect(x, y, blockSize, blockSize);
        }
    }
}

var b; // TODO: REMOVE

function startGame() {
    let board = new Board("rgb(90,90,90)", [20, 10]),
        drawer = new Drawer("rgb(30,30,30)", [800, 600], 'mainCanvas'),
        player = new Player(board);
    drawer.prepareCanvas();
    drawer.drawBoard(board);
    setTimeout(() => {
        board.addPiece(new Piece("L", "1"));
        setInterval(() => {
            drawer.drawBoard(board);
        }, 50);
        setInterval(() => {
            board.executeGravityStep();
        }, 1000);
    }, 15);
    b = board; // TODO: REMOVE
}

function benchmark() {
    console.info("======= Comparisons vs functions =======");
    let three = 3,
        func;
    
    let startCompare = new Date();
    for(var i = 0; i < 1000000000; i++) {
        if(three == 3) {
            var x = 5 + 2;
            x * 2;
        }
    }
    console.log("Time for a billion comparisons: ", new Date() - startCompare);

    let startFunc = new Date();

    if(three == 3) {
        func = (a, b, c, d) => {
            return 5 + 2;
        }
    } 
    
    for(var i = 0; i < 1000000000; i++) {
        var x = func(true, "color", 2, "f");
        x * 2
    }
    console.log("Time for a billion function calls: ", new Date() - startFunc);
    
}