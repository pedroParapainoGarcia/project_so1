/**
 * crea un objetode tipo proceso que sea manipulable para las colas
 * @param {int} id  el id del proceso (Pid)
 * @param {int} at  en tiempo de entrada (Arraiving time)
 * @param {int} ext  el tiempo de ejecucion (Execution Time)
 * @param {int} prl  el nivel de prioridad
 * @returns {object} RR process object
 */
function RRprocess(id, at, ext,prl, color) {
  this.id = id;
  this.at = at;
  this.ext = ext;
  this.prl = prl;
  this.totalduration = ext;
  this.realtimeBuffer = ext;
  this.color = color;
}

var processesCounter = 1;
var prlis = [];
var realTimeQuewe = [];
var currentProcess;
var burstcounter;
var quantum;
var running = false;

function setup() {
  frameRate(12);
  burstcounter = 0;
  currentProcess = {};
  createCanvas(900, 300);
  addcontainer();
  addTable();
  quantum = 0 | document.getElementById("inputQ").value;
}

function draw() {
  updateTables();
  if (running) {
    drawstuff();
  } else {   
    if(realTimeQuewe.length == 0){
        background(225);
    }
  }
}

/**
 * dibuja lo eferente al canvas
 * @date 2021-03-07
 * @returns {any}
 */
function drawstuff() {
  drawPNames();
  prlis.forEach((element) => {
    if (element.at == burstcounter) {
      realTimeQuewe.push(element);
      console.log("agregado a la RTQ");
    }
  });

  if (realTimeQuewe.length > 0) {
    if (
      realTimeQuewe[0].realtimeBuffer >
        realTimeQuewe[0].totalduration - quantum &&
      realTimeQuewe[0].totalduration - quantum >= 0
    ) {
      realTimeQuewe[0].realtimeBuffer--;
    } else if (
      realTimeQuewe[0].realtimeBuffer == 0 ||
      realTimeQuewe[0].realtimeBuffer ==
        realTimeQuewe[0].totalduration - quantum
    ) {      
      headToBack();
    } else if (
      realTimeQuewe[0].realtimeBuffer > 0 &&
      realTimeQuewe[0].totalduration - quantum < 0
    ) {
      realTimeQuewe[0].realtimeBuffer--;
    }
  }
  drawlines();
  burstcounter++;
}

/**
 * dibuja las lineas de tiempo
 * @date 2021-03-07
 * @returns {any}
 */
function drawlines() {  
  strokeWeight(4);
  for (index = 1; index <= prlis.length; index++) {
    if (realTimeQuewe.length > 0) {
      try {
        if (realTimeQuewe[0].id == index) {
          drawRedLine(index,realTimeQuewe[0].color);
        } else {
          drawWhiteLine(index);
        }
      } catch (error) {
        drawWhiteLine(index);
      }
    } else {
      drawWhiteLine(index);
    }
  }
}

/**
 * dibuja unalinea eferente al proceso con su color
 * @date 2021-03-07
 * @param {any} index
 * @param {any} color
 * @returns {any}
 */
function drawRedLine(index,color) {
  htime = getHTime();
  var x = 50 + map(burstcounter, 0, htime, 20, 300);
  var y = 29 * index;
  color2 = exToRGB(color);
  stroke(color2.r,color2.g, color2.b);
  line(x, y, x, y + 16);
  stroke(255);
}

/**
 * convierte exadecimal a rgb
 * @date 2021-03-07
 * @param {any} exColor
 * @returns {any}
 */
function exToRGB(exColor){
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(exColor); 
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}


/**
 * dibuja las linear referentes a momentos en los que el proceso no
 * se esta ejecutando
 * @date 2021-03-07
 * @param {any} index
 * @returns {any}
 */
function drawWhiteLine(index) {
  htime = getHTime();
  var x = 50 + map(burstcounter, 0, htime, 20, 300);
  var y = 29 * index;
  stroke(255, 255, 255);
  line(x, y, x, y + 16);
}

/**
 * muestra la cola en tiempo real de los procesos
 * @date 2021-03-07
 * @returns {any}
 */
function headToBack() {
  // reiniciendo el buffer
  if (realTimeQuewe.length > 0) {
    realTimeQuewe[0].totalduration = realTimeQuewe[0].realtimeBuffer;
    if (realTimeQuewe[0].totalduration > 0) {
      var buffer = realTimeQuewe[0];
      realTimeQuewe.splice(0, 1);
      realTimeQuewe.push(buffer);
    } else {
      realTimeQuewe.splice(0, 1);
      //console.log("eliminado de la cabeza");
    }
  }
  // colocando el de mayor prioridad en la cola
  higestP = Math.max.apply(null,realTimeQuewe.map(o => {return parseInt(o.prl);}));  
  prbuffer = realTimeQuewe.filter(o => o.prl == higestP)[0];  
  if(prbuffer){
    realTimeQuewe.splice(realTimeQuewe.indexOf(prbuffer), 1);
    realTimeQuewe.unshift(prbuffer);
    if(prbuffer.prl>1){prbuffer.prl--;}
  }
  
}

/**
 *dibuja los nobres P1,P2... en el canvas
 * @date 2021-03-07
 * @returns {any}
 */
function drawPNames() {
  prlis.forEach((process) => {
    textSize(32);
    text("P" + process.id, 9, 15 + 29 * (prlis.indexOf(process) + 1));
  });
}

/**
 * obtiene el tiempo maximo de ejecucion
 * @date 2021-03-07
 * @returns {any}
 */
function getHTime() {
  var res = -1;
  prlis.forEach((element) => {
    var at = parseInt("" + element.at);
    var ext = parseInt("" + element.ext);   
    res += ext;
  });
  res = res/prlis.length;// tiempo medio de ejecucion  
  return res+(2.4*prlis.length)*(map(quantum, 1, 1000, 5, 1));
}

/**
 * metodo que se ejecuta cuando el proceso se pausa
 * @date 2021-03-07
 * @returns {any}
 */
function drawPause() {
  clear();
  background(225);
  textFont("Georgia");
  textSize(32);
  text("Add processes to the list and then", 50, 130);
  text("Press start to see the Execution timeline", 50, 170);
  fill(0, 102, 153);
}

/**
 *metodo que coloca la tabla de procesos
 * @date 2021-03-07
 * @returns {any}
 */
function addTable() {
  tableContainer = createDiv();
  tableContainer.position(200, 320);
  tableContainer.size(600, 300);
  tableContainer.addClass("tables-container");
  RRproclist = createDiv(`
    <table class="processT">
    <thead>
        <tr>
            <th>Pid</th>
            <th>Arraiving time</th>
            <th>Execution time</th>
            <th>Priority level</th>
        </tr> 
    </thead> 
    <tbody id="processT">    
    </tbody>
    </table>`);
  RRproclist.addClass("processes-table");
  tableContainer.child(RRproclist);
  quewe = createDiv(`
    <table class="processT"">
    <thead>
        <tr>
            <th>Real time quewe</th>
        </tr> 
    </thead> 
    <tbody id="processQ">    
    </tbody> 
    </table>`);
  quewe.addClass("quewe-table");
  tableContainer.child(quewe);
}

/**
 * metodo que agrega el contenedor conde se coloca la mayoria de items
 * @date 2021-03-07
 * @returns {any}
 */
function addcontainer() {
  container = createDiv();
  container.position(920, 0);
  title = createP("<h1>Round Robin Scheduling</h1>");
  container.child(title);
  labelAT = createP("<p>Arraiving Time (aT)</p>");
  container.child(labelAT);
  inputAT = createInput(null, "number");
  inputAT.id("inputAT");
  container.child(inputAT);
  LabelET = createP("<p>Execution time (xT)</p>");
  container.child(LabelET);
  inputET = createInput(null, "number");
  inputET.id("inputET");
  container.child(inputET);
  LabelPr = createP("<p>Priority level</p>");
  container.child(LabelPr);
  inputPr = createInput(null, "number");
  inputPr.id("inputPr");
  container.child(inputPr);
  btnSend = createButton("Add Process", "").size(200, 60);
  btnSend.mousePressed(addProcess);
  btnSend.addClass("btn-send");
  container.child(btnSend);
  labelQ = createP("<p>OS quantum</p>");
  container.child(labelQ);
  inputQ = createInput(10, "number");
  inputQ.id("inputQ");
  container.child(inputQ);
  btnPlay = createButton("start", "").size(200, 35);
  btnPlay.mousePressed(playRR);
  btnPlay.addClass("btn-send");
  container.child(btnPlay);
  btnPause = createButton("pause", "").size(200, 35);
  btnPause.mousePressed(pauseRR);
  btnPause.addClass("btn-send");
  container.child(btnPause);
  btnRestart = createButton("reset", "").size(200, 35);
  btnRestart.mousePressed(function () {
    resetThis();
  });
  btnRestart.addClass("btn-send");
  container.child(btnRestart);
  // btnNQ = createButton("jump quantum", "").size(200, 35);
  // btnNQ.mousePressed(jumpQuantum);
  // btnNQ.addClass("btn-send");
  // container.child(btnNQ);
  container.size(300, 850);
  container.addClass("form-Container");
}


/**
 * metodo para arancar
 * @date 2021-03-07
 * @returns {any}
 */
function playRR() {
  quantum = document.getElementById("inputQ").value;
  running = true;
}

/**
 * metodo para pausar
 * @date 2021-03-07
 * @returns {any}
 */
function pauseRR() {
  running = false;
}

/**
 * metodo para agregar un proceso
 * @date 2021-03-07
 * @returns {any}
 */
function addProcess() {
  inputAT = document.getElementById("inputAT").value;
  inputET = document.getElementById("inputET").value;
  inputPr = document.getElementById("inputPr").value;
  if (inputAT && inputET) {
    newprocess = new RRprocess(
      processesCounter,
      inputAT,
      inputET,
      inputPr,
      getRandomColor()
    );
    processesCounter++;
    prlis.push(newprocess);
  } else {
    alert("Los campos no deben estar vacios");
  }
}

/**
 * metodo para resetear el sistema
 * @date 2021-03-07
 * @returns {any}
 */
function resetThis() {
  processesCounter = 1;
  prlis = [];
  realTimeQuewe = [];
  currentProcess = {};
  burstcounter = 0;
  quantum = 0 | document.getElementById("inputET").value;
  running = false;
}

/**
 * metodo para actualizar las tablas
 * @date 2021-03-07
 * @returns {any}
 */
function updateTables() {
  document.getElementById("processT").innerHTML = "";
  document.getElementById("processQ").innerHTML = "";
  for (i = 0; i < prlis.length; i++) {
    row = document.getElementById("processT").insertRow(i);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    cell1.innerHTML = prlis[i].id;
    cell2.innerHTML = prlis[i].at;
    cell3.innerHTML = prlis[i].ext;
    cell4.innerHTML = prlis[i].prl;
  }
  for (j = 0; j < realTimeQuewe.length; j++) {
    row = document.getElementById("processQ").insertRow(j);
    var cellP = row.insertCell(0);
    try {
      cellP.innerHTML = "P" + realTimeQuewe[j].id+ '-' + realTimeQuewe[j].realtimeBuffer + '-'+realTimeQuewe[j].prl;
    } catch (error) {      
    }
    
  }
}

/**
 * metodo para obtener un color aleatorio
 * @date 2021-03-07
 * @returns {any}
 */
function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
