/*Visual Objects*/
function createAxis(ord, pos, aname){
	var o={};

	o.pos=pos;
	o.ord=ord;//screen order
	o.aname=aname;
	o.aaxis;
	o.dist;

	o.init=initAxis;
	o.show=showAxis;

	return o;
}

function createHandler(hname, pos, hdl){
	var o={};

	o.hname=hname;
	o.pos=pos;
	o.hdl=hdl;

	o.copy=copyHdl;
	return o;
}

function createPlane(ord, pos, div, width, dims){
	var o={};

	o.ord=ord;//screen order
	o.dims=dims;
	o.sign=false;
	o.points=[];
	o.pos=pos;
	o.div=div;
	o.width=width;
	o.scales=[];
	o.dscales=[];//0 for vertical and 1 for horizontal
	o.MDS;

	o.init=initPlane;
	o.show=showPlane;
	o.toggle=togglePlane;
	o.update=updatePlane;
	o.renew=newPlane;
	o.existDim=existDim;
	o.delDim=delDim;
	return o;
}

function createMDS(){
	var o={};

	o.disMat=[];
	o.scrMat=[];
	o.relMat=[];
	o.timer;

	return o;
}

function createLine(id){
	var o={};

	o.id=id;
	o.points=[];
	o.slopes=[];
	o.path;
	o.line;

	o.init=initLine;
	o.show=showLine;
	o.change=changeLine;
	return o;
}

function createPalette(Cont){
	var o={};

	o.container=Cont;
	o.color;

	return o;
}

function createCanvas(size, scale, svg){
	var o={};

	o.csize=size;
	o.ords;
	o.scale=scale;
	o.svg=svg;
	o.axes=[];
	o.handlers=[];
	o.planes=[];
	o.lines=[];
	o.palette;
	o.selData=[];
	o.minWidth;
	o.intStep;

	o.initAxes=initAxes;
	o.initHdls=initHdls;
	o.initPlanes=initPlanes;
	o.initLines=initLines;

	o.changeLines=changeLines;
	o.changePlane=changePlane;
	o.changeAxes=changeAxes;

	o.findAxis=findAxis;
	o.findHdl=findHandler;
	o.delHdl=delHdl;

	o.axisBrushing=axisBrushing;
	o.angularBrushing=angularBrushing;
	o.pointBrushing=pointBrushing;

	return o;
}

/*Data Objects*/
function createDim(name, range, scale, dist){
	var o={};

	o.dname=name;
	o.range=range;
	o.dist=dist;
	o.disMat=[];
	o.scale=scale;

	o.init=initMatrix;
	return o;
}

function createDataSet(Canvas){
	var o={};

	o.dims=[];
	o.infos=[];
	o.dimNum=0;
	o.canvas=Canvas;
	o.ready=false;
	o.readAll=false;
	o.illegal=false;
	o.contents;

	o.readData=readData;
	o.initCanvas=initCanvas;
	o.findDim=findDim;

	return o;
}

function createDragObj(Dim, Orig, From, Pos, Name){
	var o={};

	o.dim=Dim;
	o.orig=Orig;
	o.pos=Pos;
	o.from=From;
	o.dname=Name;
	o.moved=false;

	o.plane;
	o.axis;
	o.color;
	o.path_txt;
	o.path=[];
	o.range=[];
	o.vscale=[];
	o.hscale=[];

	o.dir;//0 for left, 1 for middle, 2 for right, 
	//-1 for failed, only up to down drawing works here
	o.dirCount=0;
	o.dirUp=8;
	o.dirSum=0;
	o.dirThrs=2;

	return o;
}