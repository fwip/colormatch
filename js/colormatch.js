function Piece(pos, color) {
  this.id = Piece.nextid++;
  this.color = color || Piece.colors[Math.floor(Math.random()*Piece.num_colors)];
  this.pos = pos || new Position;
}

Piece.nextid = 0;
Piece.colors = ['red', 'green', 'blue', 'orange', 'yellow', 'purple',
  'black', 'grey'];
Piece.num_colors = 6;

function Position(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

var colormatch = {};

colormatch.delay = 300;
colormatch.score = 0;
colormatch.score_per_piece = 20;

// Get the pieces ordered as rows & columns
colormatch.get_2d = function(){
  var twodee = [];
  for (var i = 0; i <  this.width; i++){
    twodee[i] = [];
  }
  for (var i in this.board){
    var p = this.board[i];
    if (p.pos.x >= 0 && p.pos.x < this.width && p.pos.y >= 0 && p.pos.y < this.height){
      twodee[p.pos.x][p.pos.y] = p;
    }
  }
  return twodee;
}


colormatch.findMatches = function(){
  var twodee = colormatch.get_2d();
  var matches = [];
  for (var x = 0; x < this.width; x++){
    for (var y = 0; y < this.height; y++){
      var color = twodee[x][y].color;
      // Check for horizontal match
      var horiz_match = [];
      var vert_match = [];

      var t = x;
      while(t < this.width && twodee[t][y].color == color){
        horiz_match.push(twodee[t][y].id);
        t++;
      }
      if (horiz_match.length >= 3){
        matches = matches.concat(horiz_match);
      }

      t = y;
      while(t < this.height && twodee[x][t].color == color){
        vert_match.push(twodee[x][t].id);
        t++;
      }
      if (vert_match.length >= 3){
        matches = matches.concat(vert_match);
      }
    }
  }
  return matches;
}

colormatch.updateState = function(){
  var dropped = false;
  var matched = false;
  var twodee = colormatch.get_2d();
  // Drop pieces that need to be dropped
  for (var x = 0; x < colormatch.width; x++){
    var drop = false;
    for (var y = colormatch.height - 1; y >= 0; y--){
      if (twodee[x][y]){
        if (drop){
          twodee[x][y].pos.y ++;
        }
      } else {
        drop = true;
      }
    }
    if (drop){
      colormatch.board.push(new Piece(new Position(x, 0)));
      dropped = true;
    }
  }
  if (!dropped){
    // If we didn't drop any, check for matches
    var matches = colormatch.findMatches();
    if (matches.length > 0){
      matched = true;
      colormatch.removePiecesByIds(matches);
      colormatch.score += matches.length * colormatch.score_per_piece;
    }
  } 
  // If anything changed, redraw again
  if (matched || dropped){
    colormatch.redraw();
    colormatch.qup8();
  }
}


colormatch.removePiecesByIds = function(ids){
  for (var i = colormatch.board.length - 1; i >= 0; i--){
    var p = colormatch.board[i];
    if (ids.indexOf(p.id) != -1){
      colormatch.board.splice(i, 1);
    }
  }
}

// For testing
colormatch.deleteBottomRow = function(){ 
  // Add secret pieces above the board
  // Delete ones at bottom of row and slide all down
  for (var i = colormatch.board.length - 1; i >= 0; i--){
    var p = colormatch.board[i];
    if (p.pos.y == colormatch.height - 1){
      colormatch.board.splice(i, 1);
    } else {
      //p.pos.y ++;
    }
  }

  // Redraw board
  colormatch.redraw();
  colormatch.qup8();
}

// Helper function to update colormatch "soon"
colormatch.qup8 = function(){
  window.setTimeout(colormatch.updateState, colormatch.delay);
}

colormatch.redraw = function(){
  var selection = this.svg
    .selectAll('circle')
    .data(this.board, function(d){ return d.id });

  selection.enter()
    .append('circle')
    .attr('r', this.piece_size)
    .attr('cy', this.yScale(-1))
    .attr('fill', function(d,i){return d.color});

  selection.transition()
    .duration(colormatch.delay)
    .ease('linear')
    .attr('cx', function(d,i){return colormatch.xScale(d.pos.x)})
    .attr('cy', function(d,i){return colormatch.yScale(d.pos.y)})
    .attr('opacity', 1);

  selection.exit()
    .transition()
    .ease('linear')
    .attr('opacity', 0)
    .duration(colormatch.delay)
    .remove();

  d3.select('#score')
    .text('Score: ' + this.score);
}

colormatch.init = function( params ){
  // Set up default parameters
  params = params || {};
  this.board = [];
  this.score = 0;

  this.width = params.width || 8;
  this.height = params.height || 8;
  this.pxwidth = params.pxwidth || 400;
  this.pxheight = params.pxheight || 400;

  this.piece_size = params.piecesize || 20;

  // Setup board contents

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

  // Add score
  d3.select('#game')
    .append('div')
    .attr('class', 'score')
    
  // Bind d3 data
  colormatch.updateState();
  
}

colormatch.init();
