/* -------- setup -------- */

// canvas done in the html file

$.get(
    "fractalData.xml",
    function(data) {
	getInitialStateFromXML(data);
    },
    "xml"
);

/* -------- objects -------- */

var turtle = new Object;
turtle.x;
turtle.y;
turtle.direction;

/* -------- variables -------- */

var $xml;
var stateStack = [];

// to global
var lineIteration;
var shrinkage;
var rightTurn;
var leftTurn;
var moveAndDrawLineDistance;
var moveNoDrawLineDistance;
var moveAgeDrawLineDistance;
var moveAgeNoDrawLineDistance;

/* -------- functions -------- */

function getInitialStateFromXML(xml) {
    $xml = $(xml);
    turtle.x = Number($xml.find("axiom").attr("x"));
    turtle.y = Number($xml.find("axiom").attr("y"));
    turtle.direction = Number($xml.find("axiom").attr("direction"));
    stateStack = stateStack.push($.extend(turtle));
    
    // pointer variables requiring $xml // hopefully temporary
    lineIteration = Number($xml.find("line").attr("iteration"));
    shrinkage = 2; // TODO: get a way for user to set this
    rightTurn = Number($xml.find("constant:contains('+')").attr("value")) * (Math.PI / 180); // converts to radians
    leftTurn = Number($xml.find("constant:contains('-')").attr("value")) * (Math.PI / 180); // converts to radians
    moveAndDrawLineDistance = Number($xml.find("variable[action='moveAndDraw();']").first().attr("value"));
    moveNoDrawLineDistance = Number($xml.find("variable[action='moveNoDraw();']").first().attr("value"));
    moveAgeDrawLineDistance = Number($xml.find("variable[action='moveAgeDraw();']").first().attr("value"));
    moveAgeNoDrawLineDistance = Number($xml.find("variable[action='moveAgeNoDraw();']").first().attr("value"));
}

function turtleGo() {
    clearCanvas();
    resetTurtle();
    eval(parseLine($xml.find("line").text()));
}

function parseLine(line) {
    var parsedLine = "";
    
    for (c = 0; c < line.length; c++) {
	ch = line.charAt(c);
	element = $xml.find("tokens").find("variable:contains(" + ch + ")");
	if (element.attr("action") == undefined) {
	    element = $xml.find("tokens").find("constant:contains(" + ch + ")");
	}
	parsedLine = parsedLine + element.attr("action");
    }
    
    return parsedLine;
}

function ageLine(originalLine) {
    var line = "";
    var replacements = $xml.find("replacement")
    var reps = {};
    
    for (r = 0; r < replacements.length; r++) {
	rep = replacements[r];
	reps[$(rep).attr("string")] = $(rep).text();
    }
    
    for (c = 0; c < originalLine.length; c++) {
	ch = originalLine.charAt(c);
	if (reps.hasOwnProperty(ch)) {
	    ch = reps[ch];
	}
	line = line + ch;
    }
    
    $xml.find("line").text(line); // change xml data
    $xml.find("line").attr("iteration", String(Number($xml.find("line").attr("iteration")) + 1));
    saveXML($xml);
    return line
}

function clearCanvas() {
    context.clearRect(0, 0, $(canvas).attr("width"), $(canvas).attr("height"));
}

function resetTurtle() {
    turtle.x = Number($xml.find("axiom").attr("x"));
    turtle.y = Number($xml.find("axiom").attr("y"));
    turtle.direction = Number($xml.find("axiom").attr("direction"));
}

function resetFractal() {
    clearCanvas();
    $xml.find("line").text($xml.find("axiom").attr("line"));
    $xml.find("line").attr("iteration", "1");
    resetTurtle();
    saveXML($xml);
}

function saveXML(xml) {
    var xmlDoc = $xml[0]; // unwrap from jQuery
    var xmlStr;
    xmlStr = (new XMLSerializer()).serializeToString(xmlDoc);
    $.post(
	"saveXML.php",
	{xml: xmlStr},
	function(response) {
	    //console.log(response);
	},
	"text"
    )
}

/* -------- input -------- */

function addToken() {
    // get data
    var token = $(document).find("input[name='token']").val();
    var action = $(document).find("input[name='action']").val();
    var value = $(document).find("input[name=='value']").val();
    
    // save data
    $xml.find("tokens").append("<variable action=\"" + action + "\" value=\"" + value + "\">" + token + "</variable>");
    saveXML($xml);
    
    // show data
    $(document).find("#tokens").append("<tr>\n<td>" + token + "</td>\n<td>" + action + "</td>\n<td>" + value + "</td>\n<td><button onclick=\"removeToken()\">REMOVE</button></td>\n</tr>"); // TODO: insert tab characters
}

function removeToken() {
    // find data (in xml)
    
    // save deletion
    
    // unshow data
    
}

function addReplacement() {
    // get data
    var string = $(document).find("input[name='string']").val();
    var replacement = $(document).find("input[name='replacement']").val();
    
    // save data
    $xml.find("procedures").append("<replacement string=\"" + string + "\">" + replacement + "</replacement>");
    saveXML($xml);
    
    // show data
    $(document).find("#replacements").append("<tr>\n<td>" + string + "</td>\n<td>" + replacement + "</td>\n<td><button onclick=\"removeReplacement()\">REMOVE</button></td>\n</tr>"); // TODO: insert tab characters
}

function removeReplacement() {
    // find data (in xml)
    
    // save deletion
    
    // unshow data
    
}

function submitAxioms() {
    // get data
    var startX = $(document).find("input[name='start x']").val();
    var startY = $(document).find("input[name='start y']").val();
    var startDir = $(docuent).find("input[name='start dir']").val();
    var startLine = $(document).find("input[name='start line']").val();
    
    // save data
    $xml.find("axiom").first().attr("x", startX);
    $xml.find("axiom").first().attr("y", startY);
    $xml.find("axiom").first().attr("direction", startDir);
    $xml.find("axiom").first().attr("line", startLine);
    saveXML($xml);
    
    // show data
    $(document).find("#startX").text(startX);
    $(document).find("#startY").text(startY);
    $(docuemnt).find("#startDir").text(startDir);
    $(document).find("#startLine").text(startLine);
}

/* -------- actions -------- */

function moveAndDraw() {
    context.beginPath();
    context.moveTo(turtle.x, turtle.y);
    
    turtle.x = turtle.x + moveAndDrawLineDistance * Math.cos(turtle.direction);
    turtle.y = turtle.y + moveAndDrawLineDistance * Math.sin(turtle.direction);
    
    context.lineTo(turtle.x, turtle.y);
    context.closePath();
    context.stroke();
}

function moveNoDraw() {
    turtle.x = turtle.x + moveNoDrawLineDistance * Math.cos(turtle.direction);
    turtle.y = turtle.y + moveNoDrawLineDistance * Math.sin(turtle.direction);
}

function moveAgeDraw() {
    context.beginPath();
    context.moveTo(turtle.x, turtle.y);
    
    turtle.x = turtle.x + moveAgeDrawLineDistance / Math.pow(shrinkage, lineIteration) * Math.cos(turtle.direction);
    turtle.y = turtle.y + moveAgeDrawLineDistance / Math.pow(shrinkage, lineIteration) * Math.sin(turtle.direction);
    
    context.lineTo(turtle.x, turtle.y);
    context.closePath();
    context.stroke()
}

function moveAgeNoDraw() {
    turtle.x = turtle.x + moveAgeNoDrawLineDistance / Math.pow(shrinkage, lineIteration) * Math.cos(turtle.direction);
    turtle.y = turtle.y + moveAgeNoDrawLineDistance / Math.pow(shrinkage, lineIteration) * Math.sin(turtle.direction);
}

function turnRight() {
    turtle.direction = turtle.direction + rightTurn;
}

function turnLeft() {
    turtle.direction = turtle.direction - leftTurn;
}

function pushStateToStack() {
    stateStack.push([$(turtle).clone]);
}

function popStateFromStack() {
    turtle = stateStack.pop();
}