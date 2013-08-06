function Board(params){

  // Set up default parameters
  params = params || {};
  this.pieces = [];
  this.score = 0;
	this.delay = 200;

  this.attachpoint = params.attachpoint || '#game';

  this.width = params.width || 8;
  this.height = params.height || 8;
  this.pxwidth = params.pxwidth || 400;
  this.pxheight = params.pxheight || 400;

  this.selected_size = params.selectedsize || Math.floor(this.pxwidth / (this.width) / 2);
  this.piece_size = params.piecesize || Math.floor(this.selected_size * 0.8);
  this.fade_size = this.piece_size * 1.4;

  this.level = Board.levels[0];
  this.moves = 0;

  // Setup board contents

	this.display = {};

	this.display.scoreboard = d3.select('#game')
		.append('div')
		.attr('id', 'scoreboard')
		.attr('class', 'info')
		.html('<div class="disp">Score<br><span class="score"></span></div>'
				 +'<div class="disp">Level<br><span class="level"></span></div>'
				 +'<div class="disp">Moves<br><span class="moves"></span></div>'
				 +'<div class="disp">Score/Moves<br><span class="scorepermoves"><span></div>');


  // Create SVG gameboard
  this.display.svg = d3.select('#game')
    .append('svg')
    .attr('width', "100%")
    .attr('height', "100%");

  // Create scale
  this.xScale = d3.scale.linear()
    .range([this.piece_size, this.pxwidth - this.piece_size])
    .domain([0, this.width - 1]);
  this.yScale = d3.scale.linear()
    .range([this.piece_size, this.pxheight - this.piece_size])
    .domain([0, this.height - 1]);

  // Add score
  //d3.select('#game')
    //.append('div')
    //.attr('class', 'score')
    
  // Bind d3 data
  
  this.updateState();
};



function Piece(pos, color) {
  this.id = Piece.nextid++;
  this.color = color || 'black';
  this.pos = pos || new Position;
};

Piece.nextid = 0;
Piece.colors = ['red', 'green', 'blue', 'orange', 'purple', 'gold',
  'brown', 'grey', 'pink', 'lightgreen', 'teal', 'magenta', 'maroon', 'olive', 'lightblue', 'lightorange', 'black'];

function Position(x, y) {
  this.x = x || 0;
  this.y = y || 0;
};

Board.levels = [
  {id:  0, score:        0, colors:  4, mult:     20},
  {id:  1, score:     1000, colors:  5, mult:     40},
  {id:  2, score:     2000, colors:  6, mult:     80},
  {id:  3, score:     5000, colors:  7, mult:    120},
  {id:  4, score:    10000, colors:  8, mult:    200},
  {id:  5, score:    20000, colors:  9, mult:    320},
  {id:  6, score:    50000, colors: 10, mult:    400},
  {id:  7, score:   100000, colors: 11, mult:   1200},
  {id:  8, score:   200000, colors: 12, mult:   2400},
  {id:  9, score:   500000, colors: 13, mult:   4000},
  {id: 10, score:  1000000, colors: 14, mult:   8000},
  {id: 11, score:  2000000, colors: 15, mult:  40000},
  {id: 12, score:  5000000, colors: 16, mult:  80000},
  {id: 13, score: 10000000, colors: 17, mult: 999999}
];

// Get the pieces ordered as rows & columns
Board.prototype.get_2d = function(){
  var twodee = [];
  for (var i = 0; i <  this.width; i++){
    twodee[i] = [];
  }
  for (var i in this.pieces){
    var p = this.pieces[i];
    if (p.pos.x >= 0 && p.pos.x < this.width && p.pos.y >= 0 && p.pos.y < this.height){
      twodee[p.pos.x][p.pos.y] = p;
    }
  }
  return twodee;
}

Board.prototype.testSwap = function(twodee, x1, y1, x2, y2){
	// If there's a swappable target
	var possible = false;

	if (twodee[x1] && twodee[x1][y1] && twodee[x2] && twodee[x2][y2]){
		var test = twodee[x1][y1];
		twodee[x1][y1] = twodee[x2][y2];
		twodee[x2][y2] = test;
		var possible = this.findMatches(twodee).length > 0;
		twodee[x2][y2] = twodee[x1][y1];
		twodee[x1][y1] = test;
	}

	return possible;
};


Board.prototype.possibleMoves = function(){
  var moves = [];

  var twodee = this.get_2d();
  for (var x = 0; x < this.width ; x++){
    for (var y = 0; y < this.height ; y++){
      // Check down
      var downOkay = this.testSwap(twodee, x, y, x, y+1);   
      var rightOkay = this.testSwap(twodee, x, y, x+1, y);   
      if (downOkay){
        moves.push([twodee[x][y], twodee[x][y+1]]);
      }
      if (rightOkay){
        moves.push([twodee[x][y], twodee[x+1][y]]);
      }
    }
  }

  return moves;
}

Board.prototype.findMatches = function(twodee){
  twodee = twodee || this.get_2d();
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

Board.prototype.checkColorCount = function(){
  
	var thisBoard = this;
  var new_colors = Board.levels.filter(
    function(t) {return t.score <= thisBoard.score}).length;

  if (this.level.id < new_colors){
    this.level = Board.levels[new_colors-1];
  }
}

Board.prototype.newRandomPiece = function(pos){
	var color = color || Piece.colors[Math.floor(Math.random() * this.level.colors)];
	var piece = new Piece(pos, color);
	return piece;
};

Board.prototype.updateState = function(){
  var dropped = false;
  var matched = false;

  var twodee = this.get_2d();
  // Drop pieces that need to be dropped
  for (var x = 0; x < this.width; x++){
    var drop = false;
    for (var y = this.height - 1; y >= 0; y--){
      if (twodee[x][y]){
        if (drop){
          twodee[x][y].pos.y ++;
        }
      } else {
        drop = true;
      }
    }
    if (drop){
      this.pieces.push(this.newRandomPiece(new Position(x, 0)));
      dropped = true;
    }
  }
  if (!dropped){
    // If we didn't drop any, check for matches
    var matches = this.findMatches();
    if (matches.length > 0){
      matched = true;
      this.removePiecesByIds(matches);
      this.score += matches.length * this.level.mult;
      this.checkColorCount();
    }
  } 
  // If anything changed, redraw again
  if (matched || dropped){
    this.redraw();
    this.qup8();
    this.interactable = false;

  } else {
    if (! this.possibleMoves().length){
      alert("No more possible moves. :/");
    }
    this.interactable = true;
  }
}


Board.prototype.removePiecesByIds = function(ids){
  for (var i = this.pieces.length - 1; i >= 0; i--){
    var p = this.pieces[i];
    if (ids.indexOf(p.id) != -1){
      this.pieces.splice(i, 1);
    }
  }
}

// Helper function to update Board "soon"
Board.prototype.qup8 = function(){
	var thisBoard = this;
  window.setTimeout( function(){ thisBoard.updateState()}, thisBoard.delay);
}

// Select a piece for swapping
Board.prototype.select = function(p){
  if (this.interactable){
    var s = this.pieces.filter(function(d){return d.selected})[0];

    p.selected = true;
    if (s){
      // If adjacent and would make a match, swap
      if (Math.abs(s.pos.x - p.pos.x) + Math.abs(s.pos.y - p.pos.y) == 1){
        this.swap(s, p);
        s.selected = false;
        p.selected = false;

        if (this.findMatches().length){
          this.qup8();
          this.moves ++;
        } else {
          this.swap(s, p);
        }
      } else {
        s.selected = false;
      }
    }
    this.redraw();
  }

}

Board.prototype.swap = function(p1, p2){
  var t = p1.pos;
  p1.pos = p2.pos;
  p2.pos = t;
}

Board.prototype.redraw = function(){

	var thisBoard = this;

  var selection = this.display.svg
    .selectAll('circle')
    .data(this.pieces, function(d){ return d.id });

  selection.enter()
    .append('circle')
    .attr('r', this.piece_size)
    .attr('cy', this.yScale(-1))
    .attr('fill', function(d,i){return d.color})
    .attr('iid', function(d){return d.id})
    .on('click', function(d){ thisBoard.select(d) } )
    .on('mouseover', function(d){
      d3.select(this)
      .attr('r', thisBoard.selected_size); } )
    .on('mouseout', function(d){
      d3.select(this)
      .attr('r', function(d) {
        return d.selected ? thisBoard.selected_size : thisBoard.piece_size });
      } )
    ;


  selection.transition()
    .duration(this.delay)
    .ease('linear')
    .attr('cx', function(d,i){return thisBoard.xScale(d.pos.x)})
    .attr('cy', function(d,i){return thisBoard.yScale(d.pos.y)})
    .attr('r', function(d){
      return d.selected ? thisBoard.selected_size : thisBoard.piece_size })
    .attr('opacity', 1);

  selection.exit()
    .transition()
    .ease('linear')
    .attr('opacity', 0)
    .attr('r', this.fade_size)
    .duration(this.delay)
    .remove();

  // Set score display
  this.display.scoreboard
		.select('.score')
		.text(this.score);

  this.display.scoreboard
		.select('.level')
		.text(this.level.id);

  this.display.scoreboard
		.select('.moves')
		.text(this.moves);

  this.display.scoreboard
		.select('.scorepermoves')
		.text( this.moves ? Math.floor(this.score / this.moves) : '');
}


var mainBoard = new Board();
