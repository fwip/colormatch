var colormatch = {};

colormatch.colors = ['red', 'green', 'blue', 'orange'];

colormatch.randompiece = function(){
  return { color: colormatch.colors[Math.floor(Math.random()*colormatch.colors.length)] };
}

colormatch.fillboard = function(){
  var count = 0;
  for ( var i = 0; i < this.width; i++ ){
    for ( var j = 0 ; j <  this.height; j++) {
      var piece = colormatch.randompiece();
      piece.x = i;
      piece.y = j;
      this.board[count++] = piece;
      console.log('piece');
    }
  }
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

  // Fill board
  colormatch.fillboard();

  // Bind d3 data
  this.svg
    .selectAll('circle')
    .data(this.board)
    .enter()
    .append('circle')
    .attr('cx', function(d,i){return colormatch.xScale(d.x)})
    .attr('cy', function(d,i){return colormatch.yScale(d.y)})
    .attr('fill', function(d,i){return d.color})
    .attr('r', this.piece_size);
  
}


colormatch.init();
