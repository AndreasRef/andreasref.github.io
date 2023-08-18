/* global describe cv skeletonization Okb*/
//This is the skeletonization + the animation of the skeleton
var doodleMeta = new function(){
  var that = this;
  
  that.randomId = function(){
    return btoa(Math.random().toString());
  }

  that.inferTreeFromMat = function(src,win){
    let M = cv.Mat.ones(3, 3, cv.CV_8U);
    ([
      0,1,0,
      1,1,1,
      0,1,0,
    ]).map((x,i)=>(M.data[i]=x));
    let anchor = new cv.Point(-1, -1);
    cv.dilate(src, src, M, anchor, 2, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

    var width = src.cols;
    var height = src.rows;

    var rows = (height/win)
    var cols = (width/win)

    var visited = [];
    for (var i = 0; i < rows; i++){
      visited.push([])
      for (var j = 0; j < cols; j++){
        visited[visited.length-1].push(0)
      }
    }

    function class_chunk(I,J){
      var i = I * win;
      var j = J * win;
      var chunk = [0,0,0,0,0,0,0,0];
      var c0 = win/4;
      var c1 = win*3/4

      for (var x = 0; x < win; x++){
        var v = src.data[i*width+j+x]
        if (v){
          if (x < c0){
            chunk[0] = 1;
          }else if (x < c1){
            chunk[1] = 1;
          }else{
            chunk[2] = 1;
          }
        }
      }
      for (var x = 0; x < win; x++){
        var v = src.data[(i+x)*width+(j+win)]
         if (v){
          if (x < c0){
            chunk[2] = 1;
          }else if (x < c1){
            chunk[3] = 1;
          }else{
            chunk[4] = 1;
          }
        }
      }
      for (var x = 0; x < win; x++){
        var v = src.data[(i+win)*width+(j+win-x)]
        if (v){
          if (x < c0){
            chunk[4] = 1;
          }else if (x < c1){
            chunk[5] = 1;
          }else{
            chunk[6] = 1;
          }
        }
      }
      for (var x = 0; x < win; x++){
        var v = src.data[(i+win-x)*width+(j)]
        if (v){
          if (x < c0){
            chunk[6] = 1;
          }else if (x < c1){
            chunk[7] = 1;
          }else{
            chunk[0] = 1;
          }
        }
      }
      return chunk; 
    }


    function legal(i,j){

      if (i < 0 || i >= rows || j < 0 || j >= cols){
        return false;
      }
      if (visited[i][j]){
        return false;
      }
      return true;
    }

    function search(i,j){
      var sub = {x:j*win+win/2,y:i*win+win/2,children:[]}
      visited[i][j] = 1;
      var chunk = class_chunk(i,j);
      var dir = [[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1]]
      for (var n = 0; n < chunk.length; n++){
        if (chunk[n]){
          var ni = i+dir[n][0];
          var nj = j+dir[n][1];
          if (legal(ni,nj)){
            visited[ni][nj] = 1;
            sub.children.push(search(ni, nj));
          }
        }
      }
      return sub;
    }

    var result;
    for (var i = 0; i < rows; i++){
      for (var j = 0; j < cols; j++){
        var v = cv.countNonZero(src.roi({x:j*win,y:i*win,width:win,height:win}))
        if (v){
          result = search(i,j);
          break
        }
        visited[i][j] = 1;
      }
      if (result != undefined){
        break;
      } 
    }

    if (result == undefined){
      return undefined;
    }


    function clean(tree){
      function _clean(tree,branch){
        if (tree.children.length != 1){
          branch = 0;
        }
        if (branch < 2){
          for (var i = tree.children.length-1; i >= 0; i--){
            if (tree.children[i].children.length == 0){
              tree.children.splice(i,1);
              continue;
            }
          }
        }
        for (var i = 0; i < tree.children.length; i++){
          _clean(tree.children[i],branch+1);
        }
      }
      _clean(tree,0)
    }  
    function add_parent(tree){
      for (var i = 0; i < tree.children.length; i++){
        tree.children[i].parent = tree;
        add_parent(tree.children[i]);
      }
    }

    clean(result);
    clean(result);  

    that.typeTree(result);
    add_parent(result);
    return result;
  }

  that.typeTree = function(tree){
    function _add_type(tree){
      if (tree.children.length == 0){          
        tree.type = "leaf"

      }else if (tree.children.length == 1){
        tree.type = "edge"
      }else{
        tree.type = "node"
      } 
      for (var i = 0; i < tree.children.length; i++){
        _add_type(tree.children[i]);
      }
    }
    _add_type(tree); tree.type = "root";
  }

  that.filterTree = function(tree,t){
    if (tree == undefined){
      return;
    }
    function f(tree){
      if (tree.type == "edge"){
        if (tree.parent != undefined && tree.children[0] != undefined){
          var p0 = tree.parent;
          var p1 = tree.children[0];
          var mx = (p0.x + p1.x)/2;
          var my = (p0.y + p1.y)/2;
          tree.nx = tree.x * (1-t) + mx * t;
          tree.ny = tree.y * (1-t) + my * t;
        }
      }
      for (var i = 0; i < tree.children.length; i++){
        f(tree.children[i]);
      }
    }

    function g(tree){

      if (tree.nx != undefined && tree.ny != undefined){
        tree.x = tree.nx;
        tree.y = tree.ny;
        delete tree.nx;
        delete tree.ny;
      }

      for (var i = 0; i < tree.children.length; i++){
        g(tree.children[i]);
      }
    }
    f(tree);
    g(tree);

  }

  that.flushTree = function(tree){
    if (tree == undefined){
      return;
    }
    function f(tree){
      if (tree.type == "edge"){
        if (tree.parent != undefined && tree.children[0] != undefined){
          var idx = tree.parent.children.indexOf(tree)
          tree.children[0].parent = tree.parent;
          tree.parent.children[idx] = tree.children[0];
        }
      }
      for (var i = 0; i < tree.children.length; i++){
        f(tree.children[i]);
      }
    }
    f(tree);
  }

  that.simplifyTree = function(tree){
    if (tree == undefined){
      return;
    }
    function f(tree,t){
      if (tree.type == "edge"){
        if (t && tree.parent != undefined && tree.children[0] != undefined){
          var idx = tree.parent.children.indexOf(tree)
          tree.children[0].parent = tree.parent;
          tree.parent.children[idx] = tree.children[0];
        }
        t = !t;
      }else{
        t = 1;
      }
      for (var i = 0; i < tree.children.length; i++){
        f(tree.children[i],t);
      }
    }
    f(tree,1);
  }

  that.centerTree = function(tree,args){
    var cx = args.x
    var cy = args.y
    if (tree == undefined){
      return;
    }
    var cn = tree;
    var cd = Infinity;
    function f(tree){
      if (args.types.includes(tree.type)){
        var d = Okb.vector.distance({x:cx,y:cy},tree)
        if (d < cd){
          cd = d;
          cn = tree;
        }
      }
      for (var i = 0; i < tree.children.length; i++){
        f(tree.children[i]);
      }
    }
    f(tree);  

    function g(tree,parent){
      if (parent == undefined){
        return;
      }
      var idx = parent.children.indexOf(tree);
      parent.children.splice(idx,1);
      tree.children.push(parent);
      var pp = parent.parent;
      parent.parent = tree;

      g(parent,pp);

    }
    g(cn,cn.parent);
    that.typeTree(cn);
    cn.parent = undefined;
    return cn;
  }

  that.parameterizeTreeToNodes = function(tree){
    var nodes = []
    function f(tree){
      if (tree == undefined){
        return;
      }
      nodes.push(tree);
      if (tree.parent != undefined){
        var th = Math.atan2(tree.y-tree.parent.y, tree.x-tree.parent.x);
        var r = Okb.vector.distance(tree.parent,tree);
        tree.th = th - tree.parent.thabs;
        tree.r = r;
        tree.thabs = th;
        tree.th0 = tree.th;
      }else{
        tree.th = 0;
        tree.r = 0;
        tree.thabs = 0;
        tree.th0 = 0;
      }
      tree.id = that.randomId();
      for (var i = 0; i < tree.children.length; i++){
        f(tree.children[i]);
      }
    }
    f(tree);
    return nodes;
  }
  
  that.deepCopyNodes = function(nodes){

    var nnodes = []
    for (var i = 0; i < nodes.length; i++){
      var n = nodes[i]
      nnodes.push({
        th: n.th,
        th0:n.th0,
        thabs:n.thabs,
        r : n.r,
        id: n.id,
        type: n.type,
        x: n.x,
        y: n.y,
      })
    }
    for (var i = 0; i < nodes.length; i++){
      var n = nodes[i];
      var pidx = nodes.indexOf(n.parent);
      nnodes[i].parent = nnodes[pidx];
      nnodes[i].children = [];
      for (var j = 0; j < n.children.length; j++){
        var cidx = nodes.indexOf(n.children[j]);
        nnodes[i].children.push(nnodes[cidx]);
      }
    }
    return nnodes;
  }

  that.forwardKinematicsNodes = function(nodes){
    function f(tree,a){
      tree.thabs = tree.th + a;
      for (var i = 0; i < tree.children.length; i++){
        f(tree.children[i],tree.thabs);
      }
    }

    function g(tree,x,y){
      if (tree.type != "root"){
        tree.x = x + Math.cos(tree.thabs) * tree.r;
        tree.y = y + Math.sin(tree.thabs) * tree.r;
      }else{
        tree.x = x;
        tree.y = y;
      }
      for (var i = 0; i < tree.children.length; i++){
        g(tree.children[i],tree.x,tree.y);
      }
    }
    if (nodes[0]){
      f(nodes[0],0);
      g(nodes[0],nodes[0].x || 0,nodes[0].y || 0);
    }
  }

  function dist2weight(d){
    if (d.length == 1){
      return [1];
    }
    function minmax(d){
      var bd = Okb.geometry.bound(d.map((x)=>({x:x,y:0})));
      return [bd[0].x,bd[1].x]
    }
    var [dm,dM] = minmax(d);
    var f = []
    var s = 0
    for (var i = 0; i < d.length; i++){
      var x = Okb.math.map(d[i],dm,dM,1,0.1);
      s += x;
      f.push(x);
    }
    f = f.map((x)=>(x/s));
    return f;
  }


  that.buildSkin = function(strokes,nodes){
    if (strokes == undefined || nodes == undefined || !strokes.length || !nodes.length){
      return [];
    }
    var skin = []
    for (var i = 0; i < strokes.length; i++){
      for (var j = 0; j < strokes[i].length; j++){
        skin.push({x:strokes[i][j][0], y:strokes[i][j][1], connect:(j!=0)});
      }
    }

    for (var i = 0; i < skin.length; i++){
      var md = [Infinity, Infinity, Infinity, Infinity];
      var mn = md.map((x)=>(undefined));
      for (var j = 0; j < nodes.length; j++){
        var d = Okb.vector.distance(skin[i],nodes[j]);
        for (var k = 0; k < md.length; k++){
          if (d < md[k]){
            md.splice(k,0,d); md.pop();
            mn.splice(k,0,nodes[j]); mn.pop();
            break;
          }
        }
      }
      skin[i].anchors = [];
      md = md.filter((x)=>(x!=Infinity));
      mn = mn.slice(0,md.length);
      var ws = dist2weight(md);

      for (var j = 0; j < mn.length; j++){
        var th = Math.atan2(skin[i].y-mn[j].y, skin[i].x-mn[j].x);
        var r = Okb.vector.distance(skin[i],mn[j]);
        var w = ws[j]//([0.4,0.25,0.2,0.1,0.05])[j];
        skin[i].anchors.push({node: mn[j], th:th-mn[j].thabs, r:r, w:w});
      }
    }
    return skin;
  }

  that.calculateSkin = function(skin){
    for (var i = 0; i < skin.length; i++){
      var xw = 0;
      var yw = 0;
      for (var j = 0; j < skin[i].anchors.length; j++){
        var a = skin[i].anchors[j];
        var x = a.node.x + Math.cos(a.th+a.node.thabs) * a.r;
        var y = a.node.y + Math.sin(a.th+a.node.thabs) * a.r;
        xw += x * a.w;
        yw += y * a.w;
      }
      skin[i].x = xw;
      skin[i].y = yw;
    }
  }

  that.drawTree = function(canv, tree){
    if (tree == undefined){
      return;
    }
    var ctx = canv.getContext("2d");
    if (tree.type == "root"){
      ctx.strokeRect(tree.x-7,tree.y-7,14,14);
    }else if (tree.type != "edge"){
      ctx.strokeRect(tree.x-4,tree.y-4,8,8);
    }else{
      ctx.strokeRect(tree.x-1,tree.y-1,2,2);
    }

    for (var i = 0; i < tree.children.length; i++){
      ctx.beginPath();
      ctx.moveTo(tree.x,tree.y);
      ctx.lineTo(tree.children[i].x,tree.children[i].y);
      ctx.stroke();
      that.drawTree(canv, tree.children[i]);
    }
  }
  
  this.drawSkin = function(canv,skin){
    var ctx = canv.getContext("2d");
    for (var i = 0; i < skin.length; i++){
      if (!skin[i].connect){
        if (i != 0){
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(skin[i].x, skin[i].y);
      }else{
        ctx.lineTo(skin[i].x, skin[i].y);
      }
    }
    ctx.stroke();
  }
}


//This is where the rigging happens I guess?
var doodleRig = new function(){
  var that = this;
  
  var WIDTH;
  var HEIGHT;
  var FAT;
  var BLEED;
  var canvases = [];
  var contexts = [];
  
  that.setup = function(args){
    console.log(args);
    WIDTH = args.width;
    HEIGHT = args.height;
    FAT = args.fat;
    BLEED = args.bleed;
    skeletonization.setup(WIDTH,HEIGHT);
    var canvasIds = [undefined];
    
    for (var i = 0; i < canvasIds.length; i++){
      if (canvasIds[i] != undefined){
        canvases[i] = document.getElementById(canvasIds[i])
      }else{
        canvases[i] = document.createElement("canvas");
        canvases[i].id = "doodle-rig-internal-canvas-"+i;
        canvases[i].style.display = "none";
        document.body.appendChild(canvases[i]);
      }
      canvases[i].width = WIDTH;
      canvases[i].height = HEIGHT;
      contexts[i] = canvases[i].getContext("2d");
    }
  }
  
  that.process = function(strokes,args){
    if (args == undefined){args = {}}
    contexts[0].fillStyle="black";
    contexts[0].fillRect(0,0,WIDTH,HEIGHT);
    contexts[0].strokeStyle="white";
    contexts[0].lineWidth = FAT;
    contexts[0].lineCap = "round";
    contexts[0].lineJoin = "round";
    draw_strokes(contexts[0],strokes);
    var nodes = cv_nodes(strokes,args);
    var skin = doodleMeta.buildSkin(strokes,nodes);
    return {nodes:nodes, skin:skin};
  }
  
  that.checkOpenCVReady = function(callback){
    var dummy = document.createElement("canvas");
    dummy.width = 32;
    dummy.height = 32;
    dummy.style.display = "none";
    dummy.id = "test-cvimread-canvas"
    document.body.appendChild(dummy);
    function cv_ready(){
      console.log("ready?")
      var success = false;
      try{
        var src = cv.imread(dummy.id);
        src.delete();
        dummy.parentElement.removeChild(dummy);
        success = true;
      }catch(e){
        // console.log(e);
        setTimeout(cv_ready,500);
      }
      if (success){callback();}
    }
    cv_ready();
  }
  
  function draw_strokes(ctx,strokes){
    for (var i = 0; i < strokes.length; i++){
      ctx.beginPath();
      for (var j = 0; j < strokes[i].length; j++){
        if (j == 0){
          ctx.moveTo(strokes[i][j][0], strokes[i][j][1]);
        }else{
          ctx.lineTo(strokes[i][j][0], strokes[i][j][1]);
        }
      }
      ctx.stroke(); 
    }
  }
  
  function find_contours(src){
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    for (let i = 0; i < contours.size(); ++i) {
      cv.drawContours(src, contours, i, [255,255,255,0], -1, 8, hierarchy, 0);
    }
    contours.delete();
    hierarchy.delete();
  }

  function cv_nodes(strokes,args){
    if (args == undefined){args = {}}
    try{
      var src = cv.imread(canvases[0].id);
    }catch(e){
      console.log(e);
      return [];
    }
    cv.cvtColor(src, src, cv.COLOR_RGB2GRAY);
    let ksize = new cv.Size(BLEED*2+1, BLEED*2+1);
    let anchor = new cv.Point(-BLEED, -BLEED);
    cv.blur(src, src, ksize, anchor, cv.BORDER_DEFAULT);
    cv.threshold(src, src, 128, 255, cv.THRESH_BINARY);

    find_contours(src);

    var bd = Okb.geometry.bound(strokes.reduce((acc, val) => acc.concat(val), []));
    var bbox = []
    bbox[0] = Math.max(Math.round(bd[0][0]-FAT),0);
    bbox[1] = Math.max(Math.round(bd[0][1]-FAT),0);
    bbox[2] = Math.min(Math.round(bd[1][0]+FAT),WIDTH);
    bbox[3] = Math.min(Math.round(bd[1][1]+FAT),HEIGHT);

    skeletonization.skeletonize(src,{
      preprocess: false,
      bbox: bbox
    });

    var tree = doodleMeta.inferTreeFromMat(src,8);
    doodleMeta.filterTree(tree,0.5);
    doodleMeta.simplifyTree(tree);
    doodleMeta.filterTree(tree,0.5);
    doodleMeta.simplifyTree(tree);
    doodleMeta.filterTree(tree,0.5);
    tree = doodleMeta.centerTree(tree,args.center || {x:WIDTH/2,y:HEIGHT/2,types:["node"]})
    src.delete();
    var nodes = doodleMeta.parameterizeTreeToNodes(tree);
    //console.log(nodes); //This is where the actual nodes are at!
    return nodes;
  }
}
