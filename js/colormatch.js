function Piece(pos, color) {
  this.id = Piece.nextid++;
  this.color = color || Piece.colors[Math.floor(Math.random()*Piece.colors.length)];
  this.pos = pos || new Position;
}

Piece.nextid = 0;
Piece.colors = ['red', 'green', 'blue', 'orange'];

function Position(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

var colormatch = {};

colormatch.fillboard = function(){
  var count = 0;
  var p;
  while (p = this.empty_positions.pop()){
    this.board.push( new Piece(p) );
  }
}

// For testing
colormatch.deleteBottomRow = function(){ 

  // Add secret pieces above the board
  for (var i = 0; i < colormatch.width; i++){
    colormatch.board.push( new Piece( new Position(i, -1) ));
  }
  // Redraw (let d3 know about them)
  colormatch.redraw();

  // Delete ones at bottom of row and slide all down
  for (var i = colormatch.board.length - 1; i >= 0; i--){
    var p = colormatch.board[i];
    if (p.pos.y == colormatch.height - 1){
      colormatch.board.splice(i, 1);
    } else {
      p.pos.y ++;
    }
  }

  // Redraw board
  colormatch.redraw();
}

colormatch.redraw = function(){
  var selection = this.svg
    .selectAll('circle')
    .data(this.board, function(d){ return d.id });

  selection.enter()
    .append('circle')
    .attr('cx', function(d,i){return colormatch.xScale(d.pos.x)})
    .attr('cy', function(d,i){return colormatch.yScale(d.pos.y)})
    .attr('fill', function(d,i){return d.color})
    .attr('r', this.piece_size);

  selection.transition()
    .duration(500)
    .attr('cx', function(d,i){return colormatch.xScale(d.pos.x)})
    .attr('cy', function(d,i){return colormatch.yScale(d.pos.y)})
    .attr('fill', function(d,i){return d.color})
    .attr('r', this.piece_size);

  selection.exit()
    .remove();
}

colormatch.init = function( params ){
  // Set up default parameters
  params = params || {};
  this.board = [];

  this.width = params.width || 5;
  this.height = params.height || 5;
  this.pxwidth = params.pxwidth || 400;
  this.pxheight = params.pxheight || 400;

  this.piece_size = params.piecesize || 30;

  this.empty_positions = [];
  // Setup board contents
  
  for (var x = 0; x < this.width; x++){
    for (var y = 0; y < this.height; y++){
      this.empty_positions.push( new Position(x, y) );
    }
  }

  // Create SVG gameboard
  this.svg = d3.select('#game')
    .append('svg:svg')
    .attr('width', params.pxwidth)
    .attr('height', params.pxheight);

  // Create scale
  this.xScale = d3.scale.linear()
    .range([this.piece_size, this.pxwidth - this.piece_size])
    .domain([0, this.width - 1]);
  this.yScale = d3.scale.linear()
    .range([this.piece_size, this.pxheight - this.piece_size])
    .domain([0, this.height - 1]);

  // Fill board
  colormatch.fillboard();

  // Bind d3 data
  colormatch.redraw();
  
}


colormatch.init();
