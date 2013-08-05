function Piece(pos, color) {
  this.id = Piece.nextid++;
  this.color = color || Piece.colors[Math.floor(Math.random()*colormatch.current_level.colors)];
  this.pos = pos || new Position;
}

Piece.nextid = 0;
Piece.colors = ['red', 'green', 'blue', 'orange', 'purple', 'gold',
  'brown', 'grey', 'pink', 'lightgreen', 'teal', 'magenta', 'maroon', 'olive', 'lightblue', 'lightorange', 'black'];
Piece.num_colors = 4;

function Position(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

var colormatch = {};

colormatch.delay = 200;
colormatch.score = 0;
colormatch.levels = [
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
colormatch.current_level = colormatch.levels[0];

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

colormatch.possibleMoves = function(){
  var moves = [];

  var testswap = function(twodee, x1, y1, x2, y2){
    
    // If there's a swappable target
    var possible = false;
    
    if (twodee[x1] && twodee[x1][y1] && twodee[x2] && twodee[x2][y2]){
      var test = twodee[x1][y1];
      twodee[x1][y1] = twodee[x2][y2];
      twodee[x2][y2] = test;
      var possible = (colormatch.findMatches(twodee).length > 0);
      twodee[x2][y2] = twodee[x1][y1];
      twodee[x1][y1] = test;
    }
    
    return possible;
  }

  var twodee = colormatch.get_2d();
  for (var x = 0; x < this.width ; x++){
    for (var y = 0; y < this.height ; y++){
      // Check down
      var downOkay = testswap(twodee, x, y, x, y+1);   
      var rightOkay = testswap(twodee, x, y, x+1, y);   
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

colormatch.findMatches = function(twodee){
  twodee = twodee || colormatch.get_2d();
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

colormatch.checkColorCount = function(){
  
  var new_colors = colormatch.levels.filter(
    function(t) {return t.score <= colormatch.score}).length;

  console.log(new_colors);
  if (colormatch.current_level.id < new_colors){
    colormatch.current_level = colormatch.levels[new_colors-1];
  }
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
      colormatch.score += matches.length * colormatch.current_level.mult;
      colormatch.checkColorCount();
    }
  } 
  // If anything changed, redraw again
  if (matched || dropped){
    colormatch.redraw();
    colormatch.qup8();
    colormatch.interactable = false;

  } else {
    if (! colormatch.possibleMoves().length){
      alert("No more possible moves. :/");
    }
    colormatch.interactable = true;
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

// Helper function to update colormatch "soon"
colormatch.qup8 = function(){
  window.setTimeout(colormatch.updateState, colormatch.delay);
}

// Select a piece for swapping
colormatch.select = function(p){
  if (colormatch.interactable){
    var s = colormatch.board.filter(function(d){return d.selected})[0];

    p.selected = true;
    if (s){
      // If adjacent and would make a match, swap
      if (Math.abs(s.pos.x - p.pos.x) + Math.abs(s.pos.y - p.pos.y) == 1){
        colormatch.swap(s, p);
        s.selected = false;
        p.selected = false;

        if (colormatch.findMatches().length){
          colormatch.qup8();
          colormatch.moves ++;
        } else {
          colormatch.swap(s, p);
        }
      } else {
        s.selected = false;
      }
    }
    colormatch.redraw();
  }

}

colormatch.swap = function(p1, p2){
  var t = p1.pos;
  p1.pos = p2.pos;
  p2.pos = t;
}

colormatch.redraw = function(){
  var selection = this.svg
    .selectAll('circle')
    .data(this.board, function(d){ return d.id });

  selection.enter()
    .append('circle')
    .attr('r', this.piece_size)
    .attr('cy', this.yScale(-1))
    .attr('fill', function(d,i){return d.color})
    .attr('iid', function(d){return d.id})
    .on('click', function(d){ colormatch.select(d) } )
    .on('mouseover', function(d){
      d3.select(this)
      .attr('r', colormatch.selected_size); } )
    .on('mouseout', function(d){
      d3.select(this)
      .attr('r', function(d) {
        return d.selected ? colormatch.selected_size : colormatch.piece_size });
      } )
    ;


  selection.transition()
    .duration(colormatch.delay)
    .ease('linear')
    .attr('cx', function(d,i){return colormatch.xScale(d.pos.x)})
    .attr('cy', function(d,i){return colormatch.yScale(d.pos.y)})
    .attr('r', function(d){
      return d.selected ? colormatch.selected_size : colormatch.piece_size })
    .attr('opacity', 1);

  selection.exit()
    .transition()
    .ease('linear')
    .attr('opacity', 0)
    .attr('r', colormatch.fade_size)
    .duration(colormatch.delay)
    .remove();

  // Set score display
  d3.select('#score')
    .html('Score: ' + this.score + '<br>'
          + 'Moves: ' + this.moves + '<br>'
          + 'Level: ' + this.current_level.id + '<br>'
          + ((this.moves > 0)
            ? ('Score/Moves: ' + Math.floor(this.score / this.moves))
            : '') );
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

  this.selected_size = params.selectedsize || Math.floor(this.pxwidth / (this.width) / 2);
  this.piece_size = params.piecesize || Math.floor(this.selected_size * 0.8);
  this.fade_size = this.piece_size * 1.4;

  this.moves = 0;

  // Setup board contents

  // Create SVG gameboard
  this.svg = d3.select('#game')
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
  d3.select('#game')
    .append('div')
    .attr('class', 'score')
    
  // Bind d3 data
  colormatch.updateState();
  
}

colormatch.init();
