var Lsvg,Rsvg;
var ADim=[],Axp=[];
var line;
var IntData=[];
var PScale=[],AxScale,AyScale,IntScale;
var Rad=3,IcR=10,AxPad=20,TxPad,Lp=1/20;
var changeT=600;
var Bcol="black";

function PInit(){	
	TxPad=hei*0.12;
	for(var i=0;i<dim;i++){
		ADim.push(i);
		Axp.push(Rwid*i/(dim-1));
		Scale[i].range([hei-TxPad,TxPad]);
		if(i!=dim-1)
			IntData.push(new IntObj(i));
	}
	AxScale=d3.scale.linear().domain(ADim).range(Axp);
	AyScale=d3.scale.linear().domain([0,1]).range([hei-TxPad,TxPad]);
	IntScale=d3.scale.linear().domain([0,1]).range([AxPad,Rwid/(dim-1)-AxPad]);	
	line=function(d){return "M"+d[0][0]+","+d[0][1]+"C"+d[1][0]+","+d[1][1]+" "+d[2][0]+","+d[2][1]+" "+d[3][0]+","+d[3][1]};
	/*
	line = d3.svg.line()
    .x(function(d) { return d[0]; })	
    .y(function(d) { return d[1]; })
    .interpolate("basis");*/
	//选择svg自带的或是d3集成的曲线函数
}

function drawSvg(){
	//画出画布
	Rsvg=d3.select("body")
	.append("svg")
	.attr("width",Rwid)
	.attr("height",hei)
	.attr("class","Rsvg")
	.on("dblclick",spend)
	.on("mousedown",bStart)
	.on("mousemove",bMove)
	.on("mouseup",bEnd)
	.append("svg:g");
	$(".Rsvg").css("left",Rleft);
	$(".Rsvg").css("padding-left",pad+"px");
	$(".Rsvg").css("padding-right",pad+"px");
		
	Lsvg=d3.select("body")
	.append("svg")
	.attr("width",Lwid)
	.attr("height",hei)
	.attr("class","Lsvg")
	.append("svg:g");
	$(".Lsvg").css("padding-right",pad+"px");
	$(".Lsvg").css("padding-left",pad/2+"px");
}

function drawSPPC(){
		Rsvg.selectAll(".Interval")
			.data(title)
			.enter()
			.append("svg:g")
			.attr("transform",function(d,i){return "translate("+AxScale(i).toFixed(1)+",0)";})
			.attr("class",function(d,i){return "Interval "+i;})
			.on("mouseover",fade)
			.each(function(d,i){
						   var tg=d3.select(this);
						   if(i==dim-1){
							Axes(tg,i);
							return;
						   }
						   PCP(tg,i);
						   MDS(tg,i);
						   Axes(tg,i);
						   });
}

function PCP(g,i){	
	var pb,p1,p2,pe;//起终点以及两个控制点
	var db,di,de;//各个数据
	var tInt=Axp[i+1]-Axp[i],tv=[tInt*Lp,0];
	var YScale=IntData[i].YScale,XScale=IntData[i].XScale;
	if(i!=0)
	db=ObjData.row(i).elements;
	if(i!=dim-2)
	de=ObjData.row(i+3).elements;
	di=$M(IntData[i].Scdata).elements;
	
	var ln=g.selectAll(".curve")
	.data(di)
	.enter()
	.append("svg:g")
	.attr("class","curve");
	
	ln.selectAll(".curve.begin")
	.data(function(d,j){
				   var y0=AyScale(d[0]),y1=YScale(d[1]);
				   pb=[0,y0];
				   pe=[XScale(d[1]),y0];
				   tv[1]=(y1-y0)*Lp;
				   if(i==0)	
				   	p1=[tv[0],y0+tv[1]];
				   else
				   	p1=[tv[0],y0+(y1-AyScale(db[j]))*Lp];
					p2=[pe[0]-tv[0],pe[1]-tv[1]];
				   return [[pb,p1,p2,pe,j]];})
	.enter()
	.append("path")
	.attr("d",line)
	.attr("stroke","black")
	.attr("class",function(d){return "curve begin "+d[4];});
	
	ln.selectAll(".curve.end")
	.data(function(d,j){
				   var y0=YScale(d[0]),y1=AyScale(d[1]);
				   pb=[XScale(d[1]),y0];
				   pe=[tInt,y1];
				   tv[1]=(y1-y0)*Lp;
				   if(i==dim-2)	
				   	p2=[pe[0]-tv[0],pe[1]-tv[1]];
				   else
				   	p2=[pe[0]-tv[0],pe[1]-(AyScale(de[j])-y0)*Lp];
					p1=[pb[0]+tv[0],pb[1]+tv[1]];
				   return [[pb,p1,p2,pe,j]];})
	.enter()
	.append("path")
	.attr("d",line)
	.attr("stroke","black")
	.attr("class",function(d){return "curve end "+d[4];});
}

function changePCP(g,i,sig){//sig=[begin,end]是决定前后两段是否要变化的数组
	var pb,p1,p2,pe;//起终点以及两个控制点
	var db,di,de;//各个数据
	var tInt=Axp[i+1]-Axp[i],tv=[tInt*Lp,0];
	var YScale=IntData[i].YScale,XScale=IntData[i].XScale;
	if(i!=0)
	db=IntData[i-1].Scdata;
	if(i!=dim-2)
	de=IntData[i+1].Scdata;
	di=IntData[i].Scdata;
	
	var ln=g.selectAll("g.curve");
	if(sig[0])
	ln.selectAll(".curve.begin")
	.data(function(d,j){
				   var y0=AyScale(d[0]),y1=AyScale(d[1]);
				   pb=[0,y0];
				   pe=[XScale(di[j][1]),YScale(di[j][0])];
				   tv[1]=(y1-y0)*Lp;
				   if(i==0)	
				   	p1=[tv[0],y0+tv[1]];
				   else
				   	p1=[tv[0],y0+(y1-IntData[i-1].YScale(db[j][0]))*Lp];
					p2=[pe[0]-tv[0],pe[1]-tv[1]];
				   return [[pb,p1,p2,pe]];})
	.transition()
	.duration(changeT)
	.attr("d",line);
	
	if(sig[1])
	ln.selectAll(".curve.end")
	.data(function(d,j){
				   var y0=AyScale(d[0]),y1=AyScale(d[1]);
				   pb=[XScale(di[j][1]),YScale(di[j][0])];
				   pe=[tInt,y1];
				   tv[1]=(y1-y0)*Lp;
				   if(i==dim-2)	
				   	p2=[pe[0]-tv[0],pe[1]-tv[1]];
				   else
				   	p2=[pe[0]-tv[0],pe[1]-(IntData[i+1].YScale(de[j][0])-y0)*Lp];
					p1=[pb[0]+tv[0],pb[1]+tv[1]];
				   return [[pb,p1,p2,pe]];})
	.transition()
	.duration(changeT)
	.attr("d",line);
}

function MDS(g,i){
	var YScale=IntData[i].YScale,XScale=IntData[i].XScale;
	g.selectAll("circle")
	.data(IntData[i].Scdata)
	.enter()
	.append("circle")
	.attr("cx",function(d){return XScale(d[1]);})
	.attr("cy",function(d){return YScale(d[0]);})
	.attr("r",Rad)
	.attr("fill","#000")
	.attr("class",function(d,j){return "point "+j;});
}

function changeMDS(g,i,sig){
	var sc=$M(IntData[i].Scdata);
	var YScale=IntData[i].YScale,XScale=IntData[i].XScale;
	g.selectAll("circle.point")
	.classed("Invisible",sig)
	.data(sc.elements)
	.transition()
	.duration(changeT)
	.attr("cx",function(d){return XScale(d[1]);})
	.attr("cy",function(d){return YScale(d[0]);});
}

function Axes(g,i){
	var axis;
	if(IsNum[i])
		axis=d3.svg.axis().ticks(0).scale(Scale[i]).orient("right");
	else	
		axis=d3.svg.axis().tickValues(Scale[i].domain()).scale(Scale[i]).orient("right");
	axis = g.append("svg:g")
				.attr("class","Axes")
				.call(axis);
	var axText=[title[i],Max[i],Min[i]];
	var axTPos=[hei+TxPad*0.25,TxPad*0.75,hei-TxPad/2];
	var t=axis.selectAll(".Icon")
	.data(axText)
	.enter()
	.append("text")
	.attr("x",0)
	.attr("y",function(d,j){return axTPos[j];})
	.text(function (d){return d;})
	.attr("text-anchor","middle");
	axis.selectAll(".Icon")
	.data([i])
	.enter()
	.append("circle")
	.attr("class","Icon")
	.attr("cx",0)
	.attr("cy",hei-TxPad*0.25)
	.attr("r",IcR)
	.call(drag);
	axis.selectAll(".AxBound")
	.data([[-AxPad+Rad*2,AxPad-Rad*2]])
	.enter()
	.append("rect")
	.attr("x",function(d){return d[0];})
	.attr("y",TxPad-2*Rad)
	.attr("width",function(d){return d[1]-d[0];})
	.attr("height",hei-2*(TxPad-2*Rad))
	.attr("class","AxBound");
}

function drawPanel(){	
	var Th=~~(hei*0.08);
	var col=40,Cs=Lwid/col,row=~~(hei/Cs),Rs=(hei-Th)/row;
	PScale[0]=d3.scale.linear().domain([0,1]).range([0,Lwid]);//x轴
	PScale[1]=d3.scale.linear().domain([0,1]).range([Th,hei]);//y轴
	PScale[2]=d3.scale.linear().domain([0,1]).range([0,360]);//色调
	PScale[3]=d3.scale.linear().domain([0,0.4,1]).range([0.3,0.6,1]);//亮度
	PScale[4]=d3.scale.linear().domain([0,0.2,1]).range([0,0.9,1]);//饱和度

	var gc=Lsvg.append("svg:g")
		.attr("class","Panel");
		gc.append("rect")
		.attr("x",0)
		.attr("y",Th/4)
		.attr("rx",8)
		.attr("ry",8)
		.attr("width","100%")
		.attr("height",Th/2)
		.attr("fill","gray")
		.attr("stroke","black")
		.attr("stroke-width",3)
		.attr("class","chosen");
		for(var i=0;i<col;i++)
			for(var j=0;j<row;j++){
				var tCol=d3.hsl(PScale[2](j/(row-1)),PScale[4](1-i/(col-1)),PScale[3](i/(col-1)));
					gc.append("rect")
					.attr("x",PScale[0](i/col))
					.attr("y",PScale[1](j/row))
					.attr("width",Cs)
					.attr("height",Rs)
					.attr("fill",tCol)
					.attr("stroke",tCol)
					.attr("onclick","pickCol(evt)");
			}
		gc.append("rect")
		.attr("x",-1)
		.attr("y",Th)
		.attr("rx",10)
		.attr("ry",10)
		.attr("width",Lwid+2)
		.attr("height",hei-Th)
		.attr("fill","none")
		.attr("stroke","black")
		.attr("stroke-width",3);
}
var test=0;

function IntObj(i){
	var sel=[];
	var weight=[];
	var Scdata;
	for(var j=0;j<dim;j++){
		sel[j]=false;
		weight[j]=1;
	}
	sel[i]=sel[i+1]=true;
	Scdata=$M([ObjData.row(i+1).elements,ObjData.row(i+2).elements]).transpose();
	this.sel=sel;
	this.weight=weight;
	this.Scdata=Scdata.elements;
	this.Stdata=Scdata.dup().elements;
	this.YScale=d3.scale.linear().domain([0,1]).range([hei-TxPad,TxPad]);
	this.XScale=d3.scale.linear().domain([0,1]).range([AxPad,Rwid/(dim-1)-AxPad]);
	this.Curve=true;
}// JavaScript Document