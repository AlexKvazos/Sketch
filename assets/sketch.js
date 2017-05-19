'use strict';

(function() {

  var socket = io();
  var canvas = document.querySelector('canvas');
  var context = canvas.getContext('2d');

  var current = {
    color: 0,
    hue: 0
  };
  var drawing = false;

  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', onMouseMove, false);

  canvas.addEventListener('touchstart', onMouseDown, false);
  canvas.addEventListener('touchend', onMouseUp, false);
  canvas.addEventListener('touchcancel', onMouseUp, false);
  canvas.addEventListener('touchmove', onMouseMove, false);

  socket.on('drawing', onDrawingEvent);
  socket.on('clear', ()  => {
  	context.clearRect(0, 0, canvas.width, canvas.height);
  })

  document.querySelector('button').addEventListener('click', () => {
    socket.emit('clear');
  });

  window.addEventListener('resize', onResize, false);
  onResize();


  function drawLine(x0, y0, x1, y1, color, emit){
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineCap = 'round';
    context.lineWidth = 5;
    context.stroke();
    context.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color
    });
  }

  function onMouseDown(e){
  	e.preventDefault();
    drawing = true;
    current.x = e.clientX || e.changedTouches[0].clientX;
    current.y = e.clientY || e.changedTouches[0].clientY;
  }

  function onMouseUp(e){
  	e.preventDefault();
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, e.clientX || e.changedTouches[0].clientX, e.clientY || e.changedTouches[0].clientY, current.color, true);
  }

  function onMouseMove(e){
  	e.preventDefault();
    if (!drawing) { return; }
		current.color = `hsl(${current.hue}, 100%, 50%)`;

    drawLine(current.x, current.y, e.clientX || e.changedTouches[0].clientX, e.clientY || e.changedTouches[0].clientY, current.color, true);
    current.x = e.clientX || e.changedTouches[0].clientX;
    current.y = e.clientY || e.changedTouches[0].clientY;

    current.hue += 2;
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  // make the canvas fill its parent
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

})();
