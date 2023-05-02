// 本体部分

var canvas =  new fabric.Canvas('canvas', {
    isDrawingMode: false,
    backgroundColor: 'rgb(250,250,250)',
    preserveObjectStacking: true
});

var sampleElement = document.getElementById('sample');

canvas.setDimensions({width: sampleElement.clientWidth, height: sampleElement.clientWidth /676 *510});

var ownURL = getOwnUrl().replace("js/", "");

fabric.Image.fromURL(ownURL + "img/Field.png", e => {
    e.scaleToWidth(canvas.width)
    canvas.setBackgroundImage(e, () => canvas.renderAll())
});

const magni = sampleElement.clientWidth /676;

const yard = 12.75 * magni;
const fieldWidth = 676 * magni;
const center = 338 * magni;
const manWidth = 22 * magni;
const manSize = 12 * magni;
const onScrimmage = 25.7 * yard;
const blockLineLength = 0.6 * manSize;

var wordPlayer = fabric.util.createClass(fabric.Text, {
    fontSize: manSize,
    fontFamily: "Arial Black",
    hasControls: false,
    originX: 'center',
    originY: 'center',
    backgroundColor: 'white',
    type: 'player',
    line: [],
    linePoint: [],
    isBlockLine: false
});

var C = new fabric.Rect({
    left: center,
    top: onScrimmage,
    fill: 'white',
    width: manSize,
    height: manSize,
    hasControls: false,
    originX: 'center',
    originY: 'center',
    strokeWidth: 2 * magni,
    stroke: 'rgba(0,0,0,1)',
    lockMovementY: true,
    name: "C",
    type: 'player',
    line: [],
    linePoint: [],
    isBlockLine: false
});
canvas.add(C);

var lt = makeOffenceLine("lt", -2);

var lg = makeOffenceLine("lg", -1);

var rt = makeOffenceLine("rg", 1);

var rg = makeOffenceLine("rt", 2);

var offencePlayerList = [lt, lg, C, rg, rt];
var deffencePlayerList = [];

var historyList = [];
var historyPoint = 0;

var playName = "play";

(function(){
    var playerInfo = document.getElementById('offencePlayerInfo');
    const offencePlayerNameList = ["LT", "LG", "C", "RG", "RT", "X", "Z", "S", "Y", "H", "QB"];
    const offencePlayerPlaceList = [
        [9 * yard, onScrimmage],
        [fieldWidth - 9 * yard, onScrimmage],
        [center - ( 2 * manWidth + 6 * yard), onScrimmage + yard],
        [center + 2 * manWidth + 6 * yard, onScrimmage + yard],
        [center + 2 * yard, onScrimmage + 6 * yard],
        [center, onScrimmage + 5 * yard]
    ];

    for (let i = 0; i < offencePlayerNameList.length; i++) {
        playerInfo.innerHTML += '<div class="playerArea flex"><h3 id ="offence' + (i + 1) + '"onclick="playerNameClick(this)">' + offencePlayerNameList[i] + '</h3><h3>&nbsp;:</h3><p id =""></p></div>';

        if(i >= 5){
            var player = new wordPlayer(offencePlayerNameList[i],{
                left: offencePlayerPlaceList[i - 5][0],
                top: offencePlayerPlaceList[i - 5][1],
                name: 'offence' + (i + 1)
            })
            canvas.add(player);

            offencePlayerList.push(player);
        }

    }
}());

(function(){
    var playerInfo = document.getElementById('deffencePlayerInfo');
    const deffenceplayerNameList = ["E", "N", "T", "A", "M", "S", "W", "CB", "CB", "SS", "FS"];
    const deffencePlayerPlaceList = [
        center - ( 2 * manWidth + manSize / 2),
        center - manSize / 2,
        center + manWidth + manSize / 2,
        center + 2 * manWidth + manSize / 2,
        center + manSize / 2,
        center + 2 * manWidth,
        center - 2 * manWidth + manSize / 2,
        8 * yard,
        fieldWidth - 8 * yard,
        center + 10 * yard,
        center - 10 * yard
    ];

    for (let i = 0; i < deffenceplayerNameList.length; i++) {
        playerInfo.innerHTML += '<div class="playerArea flex"><h3 id ="deffence' + (i + 1) + '"onclick="playerNameClick(this)">' + deffenceplayerNameList[i] + '</h3><h3>&nbsp;:</h3><p id =""></p></div>';
        var player = new wordPlayer(deffenceplayerNameList[i],{
            left: deffencePlayerPlaceList[i],
            name: "deffence" + (i + 1)
        })

        if(i < 4){
            player.top = 24 * yard;
        }else if(i < 9){
            player.top = 20 * yard;
        }else{
            player.top = 10 * yard;
        }

        canvas.insertAt(player, 0, false);
        deffencePlayerList.push(player);
    }
}());

document.addEventListener('keyup', ({ keyCode, ctrlKey } = event) => {
    // Check Ctrl key is pressed.
    if (!ctrlKey) {
      return
    }

    // Check pressed button is Z - Ctrl+Z.
    if (keyCode === 90) {
        undo();
    }

    // Check pressed button is Y - Ctrl+Y.
    if (keyCode === 89) {
        redo();
    }
})

canvas.on({
    'object:selected': onObjectSelected,
    'selection:created': onObjectCreated,
    'selection:updated': onObjectupdated,
    'object:moving': onObjectMoving,
    'object:modified': onObjectModified,
    'before:selection:cleared': beforeSelectionCleared,
    'selection:cleared': onSelectionCleared
});
canvas.addline = function(line){
    canvas.insertAt(line);
    deffencePlayerList.forEach(player => {
        canvas.remove(player);
        canvas.insertAt(player, 0, false);
    });
};

var activePlayer;
var isStraightMode = false;
var isBlockMode = false;
var copyedRoot = [];


//右クリック部分

var sampleElement = document.getElementById('sample');
var createDeleteButton = document.querySelector('ul.menu-items li:first-child button');

var contextMenuObj = new ContextMenu({
	element  : sampleElement,
	menuList : [
		{
			text    : 'ルートを新規作成',
			action  : function() {
                if(activePlayer.line.length == 0) {
                    makeRoot(activePlayer, 0, 2 * yard );
                    createDeleteButton.textContent = "ルートを削除";
                    createDeleteButton.style.color = 'red';
                    addRootButton.removeAttribute("disabled");
                }else{
                    removeRoot(activePlayer);
                    createDeleteButton.textContent = "ルートを新規作成";
                    createDeleteButton.style.color = 'black';
                }
			}
		},
        {
			text    : 'ルートを追加',
			action  : function() {
                addRoot(activePlayer.line[activePlayer.line.length - 1]);
			}
		},
		{
			text    : '直線モードへ',
			action  : function() {
                if(isStraightMode){
                    isStraightMode = false;
                    lineModeButton.textContent = "直線モードへ";
                }else{
                    isStraightMode = true;
                    lineModeButton.textContent = "曲線モードへ";
                }
			}
		},
        {
			text    : '先端をブロックへ',
            action  : function() {
                if(isBlockMode){
                    isBlockMode = false;
                    canvas.remove(activePlayer.arrow.r, activePlayer.arrow);
                    var arrow = makeArrow(activePlayer.line[activePlayer.line.length - 1]);
                    canvas.add(arrow);
                    tipModeButton.textContent = "先端をブロックへ"
                }else{
                    isBlockMode = true;
                    makeBlockLine(activePlayer.line[activePlayer.line.length - 1]);
                    tipModeButton.textContent = "先端を矢印へ"
                }
            }
		},
        {
			text    : 'コピー',
            action  : function() {
                copyRoot(activePlayer);
            }
		},
        {
			text    : '貼り付け',
            action  : function() {
                pastRoot(activePlayer);
            }
		},
	]
});

var createDeleteButton = document.querySelector('ul.menu-items li:first-child button');
var addRootButton = document.querySelector('ul.menu-items li:nth-child(2) button');
addRootButton.setAttribute("disabled", true);
var lineModeButton = document.querySelector('ul.menu-items li:nth-child(3) button');
var tipModeButton = document.querySelector('ul.menu-items li:nth-child(4) button');

var activePlayerNameSpace = document.querySelector('p#activeplayerName');

makeHistory();


/*

関数

*/

function makeOffenceLine(name, x){
    var l = new fabric.Circle({
        top: onScrimmage,
        left: center + x * manWidth,
        fill: 'white',
        radius: manSize / 2,
        hasControls: false,
        strokeWidth: 2 * magni,
        stroke: 'rgba(0,0,0,1)',
        originX: 'center',
        originY: 'center',
        lockMovementY: true,
        type: 'player',
        line: [],
        linePoint: [],
        isBlockLine: false
    });

    l.name = name;
    canvas.add(l);

    return l;
}

function makeOffenceSkill(name, x, y) {
    var player = new offenceSKill(name,{
        left: x,
        top: y,
        name: name
    })

    canvas.add(player);
}

function makeRoot(player, dx, dy, controlPoint) {
    var line = makeLineFromPlayer(player, dx, dy, controlPoint);

    var arrow = makeArrow(line);
    arrow.name = player.name;

    canvas.add(arrow)
}

function makeLineFromPlayer(player, dx, dy, controlPoint) {
    var line = new fabric.Path('M 100 0 Q 100, 100, 200, 0', { fill: '', stroke: 'black', strokeWidth: 2 * magni, objectCaching: false, originX: 'center', originY: 'center'});
    line.path[0][1] = player.left;
    line.path[0][2] = player.top;

    line.path[1][3] = line.path[0][1] + dx;
    line.path[1][4] = line.path[0][2] - dy;

    if(controlPoint == undefined){
        line.path[1][1] = ( line.path[0][1] + line.path[1][3]) / 2;
        line.path[1][2] = ( line.path[0][2] + line.path[1][4]) / 2;
        console.log("underfined");
    }else{
        line.path[1][1] = controlPoint[0] + player.left;
        line.path[1][2] = controlPoint[1] + player.top;
    }

    line.num = 0;
    line.selectable = true;
    canvas.addline(line);

    line.player = player;
    //player.line = line;
    player.line = [line];
    player.linePoint = [[0, 0, line.path[1][1] - player.left, line.path[1][2] - player.top, dx, -dy]];

    makePoints(line);

    return line;
}

function makeArrow(line){

    var arrow = new fabric.Triangle({
        left: line.path[1][3],         //左上角相当部分（赤点）の左
        top: line.path[1][4],          //左上角相当部分（赤点）の上
        width: 10 * magni,        //幅
        height: 10 * magni,       //高さ
        fill: 'black',//塗潰しの色
        stroke: 'black',
        originX: 'center',
        originY: 'center',
        isBlockLine: false,

        angle: Math.atan2(line.path[1][4] - line.path[1][2], line.path[1][3] - line.path[1][1]) * (180 / Math.PI) + 90          //角度
    });
    arrow.selectable = false;
    line.player.arrow = arrow;
    line.player.isBlockLine = false;
    return arrow
}

function makeBlockLine(line){
    canvas.remove(line.player.arrow);

    var blockLine = new fabric.Path('M 100 0 L 200 0', { fill: '', stroke: 'black', strokeWidth: 2 * magni, objectCaching: false, originX: 'center', originY: 'center'});

    blockLine.path[0][1] = line.path[1][3] - ( blockLineLength);
    blockLine.path[0][2] = line.path[1][4];

    blockLine.path[1][1] = line.path[1][3] + ( blockLineLength);
    blockLine.path[1][2] = line.path[1][4];

    line.player.arrow = blockLine;
    blockLine.isBlockLine = true;
    line.player.isBlockLine = true;

    canvas.addline(blockLine);

    makeBlockLineRotater(blockLine);
}

function makeBlockLineRotater(blockline){
    var centerPoint = [(blockline.path[0][1] + blockline.path[1][1]) / 2 , (blockline.path[0][2] + blockline.path[1][2]) / 2];
    var slope = ( blockline.path[1][2] - centerPoint[1] ) / ( blockline.path[1][1] - centerPoint[0] );
    var intercept = centerPoint[1] - slope * centerPoint[0];

    var a = slope ** 2 + 1;
    var b = 2 * (slope * (intercept - centerPoint[1]) - centerPoint[0]);
    var c = (centerPoint[0] ** 2) + ((intercept - centerPoint[1]) ** 2) - ((1.5 * manSize) ** 2);

    var r = new fabric.Circle({
        left: (Math.sqrt((b ** 2) - (4 * a * c)) - b) / (2 * a),
        strokeWidth: 2 * magni,
        radius: 3 * magni,
        fill: 'rgba(102, 102, 102, 0.5)',
        stroke: 'rgba(102, 102, 102, 0.5)',
        originX: 'center',
        originY: 'center'
    });


    r.top = (r.left * slope) + intercept;
    r.hasBorders = r.hasControls = false;

    r.name = "r";
    blockline.r = r;
    r.line = blockline;
    canvas.add(r);
}

function makePoints(line) {
    if(!isStraightMode){
        var p1 = makeP1(line.path[1][1], line.path[1][2], line);
    }

    var p2 = makeP2(line.path[1][3], line.path[1][4], p1, line);

    line.p1 = p1;
    line.p2 = p2;

    if (line.num){
        var p0 = makeP0(line.path[0][1],line.path[0][2], line);
        line.p0 = p0;
    }else{
        line.p0 = line.player;
    }
}

function makeP2(left, top, p1, line) {
    var p2 = new fabric.Circle({
        left: left,
        top: top,
        strokeWidth: 3 * magni,
        radius: 8 * magni,
        fill: 'transparent',
        stroke: 'rgba(102, 102, 102, 0.5)',
        originX: 'center',
        originY: 'center'

    });

    p2.hasBorders = p2.hasControls = false;

    p2.p1 = p1;
    p2.line = line;

    p2.name = "p2";
    p2.player = line.player;
    canvas.add(p2);

    return p2;
}

function makeP1(left, top, line) {
    var p1 = new fabric.Circle({
        left: left,
        top: top,
        strokeWidth: 2 * magni,
        radius: 3 * magni,
        fill: '#fff',
        stroke: 'rgba(102, 102, 102, 0.5)',
        originX: 'center',
        originY: 'center'
    });

    p1.hasBorders = p1.hasControls = false;

    p1.line = line;

    p1.name = "p1";
    p1.player = line.player;
    canvas.add(p1);

    return p1;
}

function makeP0(left, top, line) {
    var p0 = new fabric.Circle({
        left: left,
        top: top,
        strokeWidth: 3 * magni,
        radius: 8 * magni,
        fill: 'transparent',
        stroke: 'rgba(102, 102, 102, 0.5)',
        originX: 'center',
        originY: 'center'
    });

    p0.hasBorders = p0.hasControls = false;

    p0.line = line;

    p0.name = "p0";
    p0.player = line.player;
    canvas.add(p0);

    return p0;
}

function addRoot(line1, lineArray) {
    var line2 = new fabric.Path('M 100 0 Q 100, 100, 200, 0', { fill: '', stroke: 'black', strokeWidth: 2 * magni, objectCaching: false, originX: 'center', originY: 'center'});
    line2.path[0][1] = line1.path[1][3];
    line2.path[0][2] = line1.path[1][4];
    if (lineArray == undefined){
        line2.path[1][3] = line2.path[0][1];
        line2.path[1][4] = line2.path[0][2] - 2 * yard;

        line2.path[1][1] = ( line2.path[0][1] + line2.path[1][3]) / 2;
        line2.path[1][2] = ( line2.path[0][2] + line2.path[1][4]) / 2;
    }else{
        line2.path[1][1] = lineArray[2] + line1.player.left;
        line2.path[1][2] = lineArray[3] + line1.player.top;
        line2.path[1][3] = lineArray[4] + line1.player.left;
        line2.path[1][4] = lineArray[5] + line1.player.top;
    }

    line2.num = line1.num + 1;
    canvas.insertAt(line2, 0, false);

    line2.player = line1.player;
    line1.player.line.push(line2);
    line1.player.linePoint.push([line2.path[0][1] - line1.player.left, line2.path[0][2] - line1.player.top, line2.path[1][1] - line1.player.left, line2.path[1][2] - line1.player.top, line2.path[1][3] - line1.player.left, line2.path[1][4] - line1.player.top]);

    canvas.remove(line1.player.arrow);
    makePoints(line2);
    removePointAll();
    makePointAll(line2.player);

    var arrow = makeArrow(line2);
    arrow.name = line1.player.name;

    canvas.addline(arrow);

    console.log("addRoot");
}

function removeRoot(player){
    player.line.forEach(line => {
        canvas.remove(line, line.p1, line.p2, line.p0);
    });
    canvas.remove(player.arrow);
    player.line = [];
    player.linePoint = [];
    player.isBlockLine = false;
}

// クリック操作

function onObjectSelected(e) {
    var activeObject = e.target;
    if (activeObject.name == "p0" || activeObject.name == "p2") {
      activeObject.line2.animate('opacity', '1', {
        duration: 200,
        onChange: canvas.renderAll.bind(canvas),
      });
      activeObject.line2.selectable = true;
    }
}

function onObjectCreated(e) {
    if(e.target.type == 'player'){
        activePlayer = e.target;
        activePlayerNameSpace.textContent = activePlayer;

        if(activePlayer.line.length != 0){
            makePointAll(activePlayer);
            createDeleteButton.textContent = "ルートを削除";
            createDeleteButton.style.color = 'red';
            addRootButton.removeAttribute("disabled");
            if(!(activePlayer.isBlockLine)){
                isBlockMode = false;
                tipModeButton.textContent = "先端をブロックへ"
            }else{
                isBlockMode = true;
                tipModeButton.textContent = "先端を矢印へ"
            }

            if(activePlayer.p[1].length == 0){

            }
        }else{
            createDeleteButton.textContent = "ルートを新規作成";
            createDeleteButton.style.color = 'black';
            addRootButton.setAttribute("disabled", true);
            isBlockMode = false;
            tipModeButton.textContent = "先端をブロックへ"
        }


    }
    console.log("onObjectCreated");
}

function onObjectupdated(e) {
    if(e.target.type == 'player' && activePlayer != e.target){
        if(activePlayer.line.length != 0){
            removePointAll();
        }
        activePlayer = e.target;
        activePlayerNameSpace.textContent = activePlayer;
        if(activePlayer.line.length != 0){
            makePointAll(activePlayer);
            createDeleteButton.textContent = "ルートを削除";
            createDeleteButton.style.color = 'red';
            addRootButton.removeAttribute("disabled");
            if(!(activePlayer.isBlockLine)){
                isBlockMode = false;
                tipModeButton.textContent = "先端をブロックへ"
            }else{
                isBlockMode = true;
                tipModeButton.textContent = "先端を矢印へ"
            }
        }else{
            createDeleteButton.textContent = "ルートを新規作成";
            createDeleteButton.style.color = 'black';
            addRootButton.setAttribute("disabled", true);
            isBlockMode = false;
            tipModeButton.textContent = "先端をブロックへ"
        }


    }
}

function beforeSelectionCleared(e) {
    if(activePlayer.line.length != 0){
        removePointAll();
    }
}


function onSelectionCleared(e) {
    var activeObject = e.target;

    /* if (activeObject.name == "p2") {
        activeObject.line2.animate('opacity', '0', {
        duration: 200,
        onChange: canvas.renderAll.bind(canvas),
        });
        activeObject.line2.selectable = true;
    }
    else if (activeObject.name == "p1") {
        activeObject.animate('opacity', '0', {
        duration: 200,
        onChange: canvas.renderAll.bind(canvas),
        });
        //activeObject.selectable = false;
    }else
    if(activeObject.type == 'player'){
        canvas.remove(activePlayer.line.p1, activePlayer.line.p2);
    }
    */
}

//p1：中間　p2：先端
function onObjectMoving(e) {
    if (e.target.name == "p2") {
        var p = e.target;

        if (p.line) {
            setLinePath(p.line, 4, p.left);
            setLinePath(p.line, 5, p.top);
            if(isStraightMode){
                setLinePath(p.line, 2, ( p.left + p.line.path[0][1] ) / 2);
                setLinePath(p.line, 3, ( p.top + p.line.path[0][2] ) / 2);
            }
        }

        moveArrow(p.player);
    }
    else if (e.target.name == "p1") {
        var p = e.target;

        if (p.line) {
            setLinePath(p.line, 2, p.left);
            setLinePath(p.line, 3, p.top);
        }

        moveArrow(p.player);
    }else if(e.target.name == "p0"){
        var p = e.target;

        if (p.line) {
            setLinePath(p.line, 0, p.left);
            setLinePath(p.line, 1, p.top);

            setLinePath(p.player.line[p.line.num - 1], 4, p.left);
            setLinePath(p.player.line[p.line.num - 1], 5, p.top);
        }
    }
    else if (e.target.type == 'player' && activePlayer.line.length != 0){
        setLinePath(activePlayer.line[0], 0, activePlayer.left);
        setLinePath(activePlayer.line[0], 1, activePlayer.top);
    }else if(e.target.name == "r"){
        var r = e.target;

        var centerPoint = [(r.line.path[0][1] + r.line.path[1][1]) / 2 , (r.line.path[0][2] + r.line.path[1][2]) / 2];
        var slope = ( r.top - centerPoint[1] ) / ( r.left - centerPoint[0] );
        var intercept = centerPoint[1] - slope * centerPoint[0];

        var a = slope ** 2 + 1;
        var b = 2 * (slope * (intercept - centerPoint[1]) - centerPoint[0]);
        var c = (centerPoint[0] ** 2) + ((intercept - centerPoint[1]) ** 2) - ((1.5 * manSize) ** 2);
        var c2 = (centerPoint[0] ** 2) + ((intercept - centerPoint[1]) ** 2) - (blockLineLength ** 2);

        r.left = (Math.sqrt((b ** 2) - (4 * a * c)) - b) / (2 * a);
        r.top = (r.left * slope) + intercept;

        r.line.path[0][1] = (Math.sqrt((b ** 2) - (4 * a * c2)) - b) / (2 * a);
        r.line.path[0][2] = (r.line.path[0][1] * slope) + intercept;
        r.line.path[1][1] = (- Math.sqrt((b ** 2) - (4 * a * c2)) - b) / (2 * a);
        r.line.path[1][2] = (r.line.path[1][1] * slope) + intercept;
    }
    else if (e.target.name == "p0" || e.target.name == "p2") {
        var p = e.target;

        p.line1 && p.line1.set({ 'x2': p.left, 'y2': p.top });
        p.line && p.line.set({ 'x1': p.left, 'y1': p.top });
        p.line && p.line.set({ 'x1': p.left, 'y1': p.top });
        p.line4 && p.line4.set({ 'x1': p.left, 'y1': p.top });
    }
}

function onObjectModified(e){
    makeHistory();
}

function removePointAll() {
    for (let i = 0; i < activePlayer.line.length; i++) {
        const line = activePlayer.line[i];
        if(i){
            canvas.remove(line.p0);
        }
        canvas.remove(line.p1, line.p2);
    }
    if(activePlayer.arrow.isBlockLine){
        canvas.remove(activePlayer.arrow.r);
    }
}

function makePointAll(player){
    for (let i = 0; i < player.line.length; i++) {
        const line = player.line[i];

        if(i){
            line.p0 = makeP0(line.path[0][1],line.path[0][2], line);
        }
        var p1= makeP1(line.path[1][1], line.path[1][2], line);
        line.p1 = p1;
        if(i == player.line.length -1){
            line.p2 = makeP2(line.path[1][3], line.path[1][4], p1, line);
        }
    }

    if(activePlayer.arrow.isBlockLine){
        makeBlockLineRotater(player.arrow);
    }
}

function moveArrow(player) {
    if(player.arrow.isBlockLine){
        var movedLength = [player.line[player.line.length - 1].path[1][3] - ((player.arrow.path[0][1] + player.arrow.path[1][1]) / 2) , player.line[player.line.length - 1].path[1][4] - (player.arrow.path[0][2] + player.arrow.path[1][2]) / 2]

        player.arrow.path.forEach(path => {
            path[1] += movedLength[0];
            path[2] += movedLength[1];
        });

        player.arrow.r.left += movedLength[0];
        player.arrow.r.top += movedLength[1];

    }else{
        player.arrow.set({
            left: player.line[player.line.length - 1].path[1][3],         //左上角相当部分（赤点）の左
            top: player.line[player.line.length - 1].path[1][4],
            angle: Math.atan2(player.line[player.line.length - 1].path[1][4] - player.line[player.line.length - 1].path[1][2], player.line[player.line.length - 1].path[1][3] - player.line[player.line.length - 1].path[1][1]) * (180 / Math.PI) + 90
        });
    }
}

function turnStraightMode(p0){

}

function setLinePath(line, num, coordinate){
    if(num < 2){
        line.path[0][num + 1] = coordinate;
    }else{
        line.path[1][num - 1] = coordinate;
    }

    if(num % 2 == 0){
        line.player.linePoint[line.num][num] = coordinate - line.player.left;
    }else{
        line.player.linePoint[line.num][num] = coordinate - line.player.top;
    }

}

function copyRoot(player){
    if(player.isBlockLine){
        var r = [[player.arrow.path[0][1] - player.left, player.arrow.path[0][2] - player.top], [player.arrow.path[1][1] - player.left, player.arrow.path[1][2] - player.top]];
        copyedRoot = [player.linePoint, r]
    }else{
        copyedRoot = [player.linePoint, null];
    }
    console.log(copyedRoot);
}

function pastRoot(player){
    remakeRoot(player, copyedRoot[0], copyedRoot[1]);
}

function remakeRoot(player, linePoint, r){
    for (let i = 0; i < linePoint.length; i++) {

        if(i == 0){
            makeRoot(player, linePoint[i][4], -linePoint[i][5], [linePoint[i][2], linePoint[i][3]] );
            createDeleteButton.textContent = "ルートを削除";
            createDeleteButton.style.color = 'red';
            addRootButton.removeAttribute("disabled");
        }else{
            addRoot(player.line[i - 1], linePoint);
        }
    }

    if(r){
        makeBlockLine(player.line[player.line.length - 1]);
        var o;
        for (let i = 0; i < 2; i++) {
            for (let j = 1; j < 3; j++) {
                if(j % 2 == 1){
                    o = player.left;
                }else{
                    o = player.top;
                }
                player.arrow.path[i][j] = r[i][j - 1] + o;
                console.log("[" + i + "]" + "[" + j + "]" + ":" + player.arrow.path[i][j]);
            }
        }
    }
}

function playerNameClick(playerName){
    if(!playerName.classList.contains('on')){
        playerName.classList.add('on');
        var txt = playerName.textContent;
        playerName.innerHTML = '<input type="text" value="' + txt + '" style="width:30px;" /> ';
        playerName.children[0].focus();

        playerName.addEventListener('blur', function(){
            var newTxt = playerName.children[0].value;
            if(newTxt == ''){
                newTxt = txt;
            }
            playerName.innerHTML = newTxt;
            playerName.classList.remove('on');

            if (playerName.id.slice(0, 1) == "o"){
                var player = offencePlayerList[playerName.id.replace("offence", "") - 1]
                player.text = newTxt;
                canvas.add(player);
            } else {
                var player = deffencePlayerList[playerName.id.replace("deffence", "") - 1]
                player.text = newTxt;
                canvas.insertAt(player, 0, false);
            }
        }, true);
    }
}

function clickPlayName(playerName){
    if(!playerName.classList.contains('on')){
        playerName.classList.add('on');
        var txt = playerName.textContent;
        playerName.innerHTML = '<input type="text" value="' + txt + '" style="width:400px;" /> ';
        playerName.children[0].focus();

        playerName.addEventListener('blur', function(){
            var newTxt = playerName.children[0].value;
            if(newTxt == ''){
                newTxt = txt;
            }
            playerName.innerHTML = newTxt;
            playerName.classList.remove('on');
            playName = newTxt;
        }, true);
    }
}

function getOwnUrl() {
    var url;
    var scripts = document.getElementsByTagName("script");
    var i = scripts.length;
    while (i--) {
        var match = scripts[i].src.match(/(^|.*\/)creater\.js$/); //sampleのところは自身のjsファイル名に変更する
        if (match) {
            url = match[1];
            break;
        }
    }
    return url;
}

function makeHistory(){
    if(historyPoint){
        historyList.splice(historyList.length - historyPoint, historyPoint + 1);
        historyPoint = 0;
    }
    var l = [];
    for (let i = 0; i < offencePlayerList.length; i++) {
        var player = offencePlayerList[i];
        var linePoint = [];
        player.linePoint.forEach(element => {
            linePoint.push(element.concat());
        });
        if(player.isBlockLine){
            var r = [[player.arrow.path[0][1] - player.left, player.arrow.path[0][2] - player.top], [player.arrow.path[1][1] - player.left, player.arrow.path[1][2] - player.top]];
        }else{
            var r = null;
        }

        if(i < 5){
            l.push([null, player.left, player.top, linePoint, r]);
        }else{
            l.push([player.text, player.left, player.top, linePoint, r]);
        }
    }
    for (let i = 0; i < deffencePlayerList.length; i++) {
        var player = deffencePlayerList[i];
        var linePoint = player.linePoint.concat();
        player.linePoint.forEach(element => {
            linePoint.push(element.concat());
        });
        l.push([player.text, player.left, player.top, linePoint, player.isBlockLine]);
    }

    historyList.push(l);
}

function unredo(num){
    var historys = historyList[historyList.length - num - 1];
    offencePlayerList.forEach(player => {
        removeRoot(player);
        canvas.remove(player);
    });
    deffencePlayerList.forEach(player => {
        removeRoot(player);
        canvas.remove(player);
    });
    makePlayer(historys);

    for (let i = 0; i < offencePlayerList.length; i++) {
        const player = offencePlayerList[i];

        if(historys[i][3]){
            remakeRoot(player, historys[i][3], historys[i][4]);
        }
    }
    for (let i = 0; i < deffencePlayerList.length; i++) {
        const player = deffencePlayerList[i];

        if(historys[i + 11][3]){
            remakeRoot(player, historys[i + 11][3], null);
        }

    }
}

function undo(){
    if(historyPoint + 1 < historyList.length){
        historyPoint += 1;
        unredo(historyPoint);
    }
}

function redo(){
    if(historyPoint){
        historyPoint -= 1;
        unredo(historyPoint);
    }
}

function playerRename(player, newName){
    player.text = newName;

}

function makePlayer(historys){
    offencePlayerList = [];
    deffencePlayerList = [];
    (function(){
        var offencePlayerNameList = ["LT", "LG", "C", "RG", "RT"];
        for (let i = 5; i < 11; i++) {
            const playerName = historys[i][0];
            offencePlayerNameList.push(playerName);
        }
        offencePlayerPlaceList = [];
        for (let i = 0; i < 11; i++) {
            const player = historys[i];
            offencePlayerPlaceList.push([player[1], player[2]]);
        }

        for (let i = 0; i < offencePlayerNameList.length; i++) {
            if(i < 2 || (i >= 3 && i < 5)){
                var player = new fabric.Circle({
                    left: offencePlayerPlaceList[i][0],
                    top: offencePlayerPlaceList[i][1],
                    fill: 'white',
                    radius: manSize / 2,
                    hasControls: false,
                    strokeWidth: 2 * magni,
                    stroke: 'rgba(0,0,0,1)',
                    originX: 'center',
                    originY: 'center',
                    lockMovementY: true,
                    type: 'player',
                    line: [],
                    linePoint: [],
                    isBlockLine: false
                });
                canvas.add(player);
            }else if (i == 2){
                var player = new fabric.Rect({
                    left: offencePlayerPlaceList[i][0],
                    top: offencePlayerPlaceList[i][1],
                    fill: 'white',
                    width: manSize,
                    height: manSize,
                    hasControls: false,
                    originX: 'center',
                    originY: 'center',
                    strokeWidth: 2 * magni,
                    stroke: 'rgba(0,0,0,1)',
                    lockMovementY: true,
                    name: "C",
                    type: 'player',
                    line: [],
                    linePoint: [],
                    isBlockLine: false
                });
                canvas.add(player);
            }else if(i >= 5){
                var player = new wordPlayer(offencePlayerNameList[i],{
                    left: offencePlayerPlaceList[i][0],
                    top: offencePlayerPlaceList[i][1],
                    name: 'offence' + (i + 1)
                })
                canvas.add(player);
            }
            offencePlayerList.push(player);
        }
    }());

    (function(){
        var deffenceplayerNameList = [];
        var deffencePlayerPlaceList = [];

        for (let i = 11; i < historys.length; i++) {
            const player = historys[i];

            deffenceplayerNameList.push(player[0]);
            deffencePlayerPlaceList.push([player[1], player[2]]);
        }

        for (let i = 0; i < deffenceplayerNameList.length; i++) {
            var player = new wordPlayer(deffenceplayerNameList[i],{
                left: deffencePlayerPlaceList[i][0],
                top: deffencePlayerPlaceList[i][1],
                name: "deffence" + (i + 1)
            })

            canvas.insertAt(player, 0, false);
            deffencePlayerList.push(player);
        }
    }());
}

function saveImg(){
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png", 0.75); // PNGなら"image/png"
    a.download = playName + ".png";
    a.click();
}
