// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =  `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  } `

//Fragment shader program
var FSHADER_SOURCE =  `
  precision mediump float; 
  uniform vec4 u_FragColor; 
  void main() {
    gl_FragColor = u_FragColor;
  }  `

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl",{ preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  //Get the storge location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix){
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix){
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  //Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

//Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//Globals related UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_globalAngle=0;
let g_lf1Angle=0;
let g_rf1Angle=0;
let g_lb1Angle=0;
let g_rb1Angle=0;
let g_lb2Angle=0;
let g_rb2Angle=0;
let g_lb3Angle=0;
let g_rb3Angle=0;
let g_lf1Animation=false;
let g_rf1Animation=false;
let g_lb1Animation=false;
let g_rb1Animation=false;
let g_lb3Animation=false;
let g_rb3Animation=false;
let x1 = 0;
let y1 = 0;

//Set up actions for the HTML UI elements
function addActionsForHtmlUI(){
  document.getElementById('animationlf1OffButton').onclick = function() {g_lf1Animation=false;};
  document.getElementById('animationlf1OnButton').onclick = function() {g_lf1Animation=true;};
  
  document.getElementById('animationrf1OffButton').onclick = function() {g_rf1Animation=false;};
  document.getElementById('animationrf1OnButton').onclick = function() {g_rf1Animation=true;};

  document.getElementById('animationlb1OffButton').onclick = function() {g_lb1Animation=false;};
  document.getElementById('animationlb1OnButton').onclick = function() {g_lb1Animation=true;};
  
  document.getElementById('animationrb1OffButton').onclick = function() {g_rb1Animation=false;};
  document.getElementById('animationrb1OnButton').onclick = function() {g_rb1Animation=true;};

  document.getElementById('animationlb3OffButton').onclick = function() {g_lb3Animation=false;};
  document.getElementById('animationlb3OnButton').onclick = function() {g_lb3Animation=true;};
  
  document.getElementById('animationrb3OffButton').onclick = function() {g_rb3Animation=false;};
  document.getElementById('animationrb3OnButton').onclick = function() {g_rb3Animation=true;};
 
  document.getElementById('lf1Slide').addEventListener('mousemove', function() { g_lf1Angle = this.value; renderAllShapes();});
  document.getElementById('rf1Slide').addEventListener('mousemove', function() { g_rf1Angle = this.value; renderAllShapes();});
  document.getElementById('lb1Slide').addEventListener('mousemove', function() { g_lb1Angle = this.value; renderAllShapes();});
  document.getElementById('rb1Slide').addEventListener('mousemove', function() { g_rb1Angle = this.value; renderAllShapes();});
  document.getElementById('lb3Slide').addEventListener('mousemove', function() { g_lb3Angle = this.value; renderAllShapes();});
  document.getElementById('rb3Slide').addEventListener('mousemove', function() { g_rb3Angle = this.value; renderAllShapes();});
  //Size Slider Events
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes();});
  //Segment Slider Events
  //document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedSegments = this.value;});

} 

function main() {
  //Set up Canvas and gl variables
  setupWebGL();
  //Set up GLSL shader programs and connect GLSL variavles
  connectVariablesToGLSL();

  addActionsForHtmlUI();
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev){
    let [x,y] = converCoordinatesEventsToGL(ev);
    x1 = x;
    y1 = y;
    click(ev);
  }
  //canvas.onmousemove = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) }};
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //renderAllShapes();
  requestAnimationFrame(tick);
}

var g_shapesList = [];

//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = []; //The array to store the size of a point


function click(ev) {
  
}

function converCoordinatesEventsToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return([x,y]);
}


var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;

//Called by brower repeatedly whenever its time
function tick(){
  //save the current time
  g_seconds=performance.now()/1000.0-g_startTime;

  //print some debug information so we know we are running
  //console.log(g_seconds);
  updateAnimationangles();
  //Draw everything
  renderAllShapes();

  //Tell the browswer to update again when it has time
  requestAnimationFrame(tick);
}

function updateAnimationangles(){
  if(g_lf1Animation){
    g_lf1Angle = 6*Math.sin(g_seconds);
  }
  if(g_rf1Animation){
    g_rf1Angle= 6*Math.sin(g_seconds);
  }
  if(g_lb1Animation){
    g_lb1Angle = 3*Math.sin(g_seconds);
  }
  if(g_rb1Animation){
    g_rb1Angle= 3*Math.sin(g_seconds);
  }
  if(g_lb3Animation){
    g_lb3Angle = 1.3*Math.sin(g_seconds);
  }
  if(g_rb3Animation){
    g_rb3Angle= 1.3*Math.sin(g_seconds);
  }

}

var grey = [215/255,215/255,215/255,1];
var white = [1,1,1,1];

function renderAllShapes(){
  //check the time at the start of this function
  var startTime = performance.now();

  //pass the matrix to u_ModelMatrix attribute
  var globalRotMat=new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix,false,globalRotMat.elements);

  //clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //Draw a test triangle
  //drawTriangle3D([-1.0,0.0,0.0, -0.5,-1.0,0.0, 0.0,0.0,0.0]);
  
  //Draw a body cube
  var body = new Cylinder();
  body.color = white;
  body.matrix.translate(0, .25, 0);
  var bodyMat1 = new Matrix4(body.matrix);
  var bodyMat2 = new Matrix4(body.matrix);
  var bodyMat3 = new Matrix4(body.matrix);
  var bodyMat4 = new Matrix4(body.matrix);
  var bodyMat5 = new Matrix4(body.matrix);
  var bodyMat6 = new Matrix4(body.matrix);
  var bodyMat7 = new Matrix4(body.matrix);
  body.matrix.rotate(45,1,0,0);
  body.matrix.scale(0.27, .27, .3);
  body.render();

  //Draw a leftfroelimb
  var leftfroelimb1 = new Cube();
  leftfroelimb1.color = grey;
  leftfroelimb1.matrix = bodyMat1;
  leftfroelimb1.matrix.translate(-.2, -.07, 0.1);
  leftfroelimb1.matrix.rotate(-g_lf1Angle,1,0,0);
  leftfroelimb1.matrix.scale(.1,.1,.3);
  leftfroelimb1.render();

  //Draw a rightfroelimb
  var rightfroelimb1 = new Cube();
  rightfroelimb1.color = grey;
  rightfroelimb1.matrix = bodyMat2;
  rightfroelimb1.matrix.translate(.1, -.07, 0.1);
  rightfroelimb1.matrix.rotate(-g_rf1Angle,1,0,0);
  rightfroelimb1.matrix.scale(.1,.1,.3);
  rightfroelimb1.render();

  //Draw a leftbacklimb1
  var leftbacklimb1 = new Cube();
  leftbacklimb1.color = grey;
  leftbacklimb1.matrix = bodyMat3;
  leftbacklimb1.matrix.translate(-.2, -.40, .35);
  leftbacklimb1.matrix.rotate(-g_lb1Angle,1,0,0);
  var leftbacklimb1mat = new Matrix4(leftbacklimb1.matrix);
  leftbacklimb1.matrix.scale(.1,.1,.3);
  leftbacklimb1.render();

  //Draw a rightbacklim1
  var rightbacklim1 = new Cube();
  rightbacklim1.color = grey;
  rightbacklim1.matrix = bodyMat4;
  rightbacklim1.matrix.translate(.1, -.40, .35);
  rightbacklim1.matrix.rotate(-g_rb1Angle,1,0,0);
  var rightbacklim1mat = new Matrix4(rightbacklim1.matrix);
  rightbacklim1.matrix.scale(.1,.1,.3);
  rightbacklim1.render();

  //Draw a leftbacklim2
  var leftbacklimb2 = new Cube();
  leftbacklimb2.color = grey;
  leftbacklimb2.matrix = leftbacklimb1mat;
  leftbacklimb2.matrix.translate(0, -.20, -.13);
  leftbacklimb2.matrix.rotate(45, 1, 0,0);
  var leftbacklimb2mat = new Matrix4(leftbacklimb2.matrix);
  leftbacklimb2.matrix.scale(.1,.1,.3);
  leftbacklimb2.render();

  //Draw a rightbacklim2
  var rightbacklim2 = new Cube();
  rightbacklim2.color = grey;
  rightbacklim2.matrix = rightbacklim1mat;
  rightbacklim2.matrix.translate(.0, -.20, -.13);
  rightbacklim2.matrix.rotate(45, 1, 0,0);
  var rightbacklim1mat2 = new Matrix4(rightbacklim2.matrix);
  rightbacklim2.matrix.scale(.1,.1,.3);
  rightbacklim2.render();

  //Draw a leftbacklim3
  var leftbacklim3 = new Cube();
  leftbacklim3.color = grey;
  leftbacklim3.matrix = leftbacklimb2mat;
  leftbacklim3.matrix.rotate(-45,1,0,0);
  leftbacklim3.matrix.rotate(-g_lb3Angle,1,0,0);
  leftbacklim3.matrix.translate(0, -.03, .0);
  leftbacklim3.matrix.scale(.1,.1,.3);
  leftbacklim3.render();

  //Draw a rightbacklim3
  var rightbacklim3 = new Cube();
  rightbacklim3.color = grey;
  rightbacklim3.matrix = rightbacklim1mat2;
  rightbacklim3.matrix.rotate(-45,1,0,0);
  rightbacklim3.matrix.rotate(-g_rb3Angle,1,0,0);
  rightbacklim3.matrix.translate(0, -.03, .0);
  rightbacklim3.matrix.scale(.1,.1,.3);
  rightbacklim3.render();

  //Draw a head
  var head = new Cube();
  head.color = white;
  head.matrix = bodyMat5;
  head.matrix.translate(-.15,0,0);
  var headmat1 = new Matrix4(head.matrix);
  var headmat2 = new Matrix4(head.matrix);
  head.matrix.scale(.3,.3,.3);
  head.render();

  //Draw a ear
  var ear1 = new Cube();
  ear1.color = grey;
  ear1.matrix = headmat1;
  ear1.matrix.translate(0,.3,-.1);
  ear1.matrix.scale(.1,.3,.1);
  ear1.render();

  var ear2 = new Cube();
  ear2.color = grey;
  ear2.matrix = headmat2;
  ear2.matrix.translate(.2,.3,-.1);
  ear2.matrix.scale(.1,.3,.1);
  ear2.render();

  //Draw a eyes
  var eyes1 = new Cube();
  eyes1.color = [255/255, 125/255, 0/255, 1];
  eyes1.matrix = bodyMat6;
  eyes1.matrix.translate(.07,.14,-.27);
  eyes1.matrix.scale(.08,.08,.08);
  eyes1.render();

  var eyes2 = new Cube();
  eyes2.color = [255/255, 125/255, 0/255, 1];
  eyes2.matrix = bodyMat7;
  eyes2.matrix.translate(-.15,.14,-.27);
  eyes2.matrix.scale(.08,.08,.08);
  eyes2.render();

  //Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10,"numdot");
}

//Set the text of a HTML element
function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}


