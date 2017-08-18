# Classes
## Drawer
The drawer is responsible for the correct display of a board on screen.

## Player
The player class serves as an input event watcher which communicates with the active board.

## Board
A board contains arbitrary blocks and an active piece. It is responsible of expressing its state in a drawer-readable form and affect the active piece with "gravity", checking for collisions between pieces.

A board also has methods for acting upon its active piece.

The position of the active piece follows an anchor. From this anchor, the piece is created following its schema.

For checking collisions, first all blocks are placed in an array. Then, the piece's _individual blocks_ are processed from the anchor. If there is a collision in the array, the state is invalid.

When a piece collides, it is destroyed and replaced with individual blocks.

## Piece
A piece is an *abstract* collection of blocks. The blocks follow a defined *schema* to form a certain shape. In reality, a piece contains no blocks, only the way they should be organized.

An array of base schemas is stored as a constant global variable. When a piece is constructed, the appropiate schema is assigned to it.

The schema, defined as a simple 2D array, uses transposition to rotate the piece.

## Block
The block is the basic element that makes pieces. A block contains its *position* and its *color*.
- The *position* is encoded as a bidimensional array denoting its place in a 2D matrix (Board)
- The *color* is a char representing a color. It is up to the drawer to translate this into an actual color. 

## Game
The game class is the master of the game flow. It controls when pieces are added, when the game starts or ends, current score, piece speed and so on. It listens to events from the Board and Player.

### Events

## pieceplaced
Fired when a piece is placed in the board; when the user loses control of the piece and its blocks become part of the board.