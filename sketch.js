/**
 * crea un objetode tipo proceso que sea manipulable para las colas
 * @param {int} id  el id del proceso (Pid)
 * @param {int} tiempoLlegada  en tiempo de entrada (Arraiving time)
 * @param {int} ext  el tiempo de ejecucion (Execution Time)
 * @param {int} prl  el nivel de prioridad
 * @returns {object} RR process object
 */
function ProcesoRR(id, tiempoLlegada, ext,prl, color) {
  this.id = id;
  this.tiempoLlegada = tiempoLlegada;
  this.ext = ext;
  this.prl = prl;
  this.totalduration = ext;
  this.realtimeBuffer = ext;
  this.color = color;
}

var contadorDeProcesos = 1;
var listaDeProcesos = [];
var colaDeProcesos = [];
var procesoActual;
var contadorDeRafagas;
var quantum;
var running = false;

function setup() {
  frameRate(12);
  contadorDeRafagas = 0;
  procesoActual = {};
  createCanvas(900, 300);
  addcontainer();
  addTable();
  quantum = 0 | document.getElementById("inputQ").value;
}

function draw() {//dibujar
  actualizarTablasDeProcesos();
  if (running) {
    dibujarCeldas();
  } else {   
    if(colaDeProcesos.length == 0){
        background(225);
    }
  }
}

/**
 * dibuja lo eferente al canvas
 * @date 2021-03-07
 * @returns {any}
 */
function dibujarCeldas() {
  dibujarNombres();
  for (let i = 0; i < listaDeProcesos.length; i++) {
    // Reducir la duración restante de la ráfaga si el proceso está en ejecución
    if (listaDeProcesos[i].tiempoLlegada <= contadorDeRafagas && listaDeProcesos[i].ext > 0) {
      if (!listaDeProcesos[i].startExecution) {
        listaDeProcesos[i].startExecution = contadorDeRafagas;
      }
      listaDeProcesos[i].ext--; // Reducir la duración restante de la ráfaga
    }

    // Si el proceso ha terminado de ejecutarse, calcular tiempos de espera y ráfaga
    if (listaDeProcesos[i].ext <= 0 && listaDeProcesos[i].finishExecution === undefined) {
      listaDeProcesos[i].finishExecution = contadorDeRafagas;
      listaDeProcesos[i].waitingTime = listaDeProcesos[i].startExecution - listaDeProcesos[i].tiempoLlegada;
      listaDeProcesos[i].burstTime = listaDeProcesos[i].finishExecution - listaDeProcesos[i].startExecution;
    }
  }

  listaDeProcesos.forEach((element) => {
    if (element.tiempoLlegada == contadorDeRafagas) {
      colaDeProcesos.push(element);
      console.log("agregado a la RTQ");
    }
  });

  if (colaDeProcesos.length > 0) {
    if (colaDeProcesos[0].realtimeBuffer > colaDeProcesos[0].totalduration - quantum &&
                                         colaDeProcesos[0].totalduration - quantum >= 0) {
      colaDeProcesos[0].realtimeBuffer--;
    } else if (
      colaDeProcesos[0].realtimeBuffer == 0 ||
      colaDeProcesos[0].realtimeBuffer ==
        colaDeProcesos[0].totalduration - quantum
    ) {      
      headToBack();
    } else if (
      colaDeProcesos[0].realtimeBuffer > 0 &&
      colaDeProcesos[0].totalduration - quantum < 0
    ) {
      colaDeProcesos[0].realtimeBuffer--;
    }
  }
  drawlines();
  contadorDeRafagas++;
}

/**
 * dibuja las lineas de tiempo
 * @date 2021-03-07
 * @returns {any}
 */
function drawlines() {  
  strokeWeight(4);
  for (index = 1; index <= listaDeProcesos.length; index++) {
    if (colaDeProcesos.length > 0) {
      try {
        if (colaDeProcesos[0].id == index) {
          drawRedLine(index,colaDeProcesos[0].color);
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
  var x = 50 + map(contadorDeRafagas, 0, htime, 20, 300);
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
  var x = 50 + map(contadorDeRafagas, 0, htime, 20, 300);
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
  if (colaDeProcesos.length > 0) {
    colaDeProcesos[0].totalduration = colaDeProcesos[0].realtimeBuffer;
    if (colaDeProcesos[0].totalduration > 0) {
      var buffer = colaDeProcesos[0];
      colaDeProcesos.splice(0, 1);
      colaDeProcesos.push(buffer);
    } else {
      colaDeProcesos.splice(0, 1);
      //console.log("eliminado de la cabeza");
    }
  }
  // colocando el de mayor prioridad en la cola
  higestP = Math.max.apply(null,colaDeProcesos.map(o => {return parseInt(o.prl);}));  
  prbuffer = colaDeProcesos.filter(o => o.prl == higestP)[0];  
  if(prbuffer){
    colaDeProcesos.splice(colaDeProcesos.indexOf(prbuffer), 1);
    colaDeProcesos.unshift(prbuffer);
    if(prbuffer.prl>1){prbuffer.prl--;}
  }
  
}

/**
 *dibuja los nobres P1,P2... en el canvas
 * @date 2021-03-07
 * @returns {any}
 */
function dibujarNombres() {
  listaDeProcesos.forEach((process) => {
    textSize(32);
    text("P" + process.id, 9, 15 + 29 * (listaDeProcesos.indexOf(process) + 1));
  });
}

/**
 * obtiene el tiempo maximo de ejecucion
 * @date 2021-03-07
 * @returns {any}
 */
function getHTime() {
  var res = -1;
  listaDeProcesos.forEach((element) => {
    var tiempoLlegada = parseInt("" + element.tiempoLlegada);
    var ext = parseInt("" + element.ext);   
    res += ext;
  });
  res = res/listaDeProcesos.length;// tiempo medio de ejecucion  
  return res+(2.4*listaDeProcesos.length)*(map(quantum, 1, 1000, 5, 1));
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
  tableContainer.position(10, 320);
  tableContainer.size(600, 300);
  tableContainer.addClass("tables-container");
      RRproclist = createDiv(`
        <table class="processT">
        <thead>
            <tr>
                <th>Proceso</th>
                <th>Tiempo de llegada</th>
                <th>Rafaga de CPU</th>
                <th>Tiempo de Espera</th>
                <th>Tiempo de Rafaga</th>
                <th> </th>              
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
              <th>Cola de Espera</th>
              
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
  title = createP("<h1>ALGORITMOS DE PLANIFICACIÓN</h1>");
  container.child(title);
  labelAT = createP("<p>Tiempo de llegada</p>");
  container.child(labelAT);
  inputAT = createInput(null, "number");
  inputAT.id("inputAT");
  container.child(inputAT);
  LabelET = createP("<p>Rafaga de CPU</p>");
  container.child(LabelET);
  inputET = createInput(null, "number");
  inputET.id("inputET");
  container.child(inputET);
  LabelPr = createP("<p> </p>");
  container.child(LabelPr);
  inputPr = createInput(null, "number");
  inputPr.id("inputPr");
  container.child(inputPr);
  btnSend = createButton("Insertar Proceso", "").size(200, 60);
  btnSend.mousePressed(addProcess);
  btnSend.addClass("btn-send");
  container.child(btnSend);
  labelQ = createP("<p>quantum</p>");
  container.child(labelQ);
  inputQ = createInput(0, "number");
  inputQ.id("inputQ");
  container.child(inputQ);
  btnPlay = createButton("Ejecutar", "").size(200, 35);
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
    newprocess = new ProcesoRR(
      contadorDeProcesos,
      inputAT,
      inputET,
      inputPr,
      getRandomColor()
    );
    contadorDeProcesos++;
    listaDeProcesos.push(newprocess);

   // Vaciar los campos de entrada
   document.getElementById("inputAT").value = "";
   document.getElementById("inputET").value = "";
    document.getElementById("inputPr").value = "";

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
  contadorDeProcesos = 1;
  listaDeProcesos = [];
  colaDeProcesos = [];
  procesoActual = {};
  contadorDeRafagas = 0;
  quantum = 0 | document.getElementById("inputET").value;
  running = false;
}

/**
 * metodo para actualizar las tablas
 * @date 2021-03-07
 * @returns {any}
 */
function actualizarTablasDeProcesos() {
  document.getElementById("processT").innerHTML = "";
  document.getElementById("processQ").innerHTML = "";
   document.getElementById("processQ").innerHTML = "";
  for (i = 0; i < listaDeProcesos.length; i++) {
    row = document.getElementById("processT").insertRow(i);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);
    var cell6 = row.insertCell(5);

    cell1.innerHTML = listaDeProcesos[i].id;
    cell2.innerHTML = listaDeProcesos[i].tiempoLlegada;
    cell3.innerHTML = listaDeProcesos[i].ext;
    cell4.innerHTML = listaDeProcesos[i].prl;
    cell5.innerHTML = listaDeProcesos[i].waitingTime || "-";
    cell6.innerHTML = listaDeProcesos[i].burstTime || "-";

  }
  for (j = 0; j < colaDeProcesos.length; j++) {
    row = document.getElementById("processQ").insertRow(j);
    var cellP = row.insertCell(0);
    try {
      cellP.innerHTML = "P" + colaDeProcesos[j].id+ '-' + colaDeProcesos[j].realtimeBuffer + '-'+colaDeProcesos[j].prl;
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
