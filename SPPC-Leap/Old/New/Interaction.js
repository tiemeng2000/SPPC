var aniT=400,dsPos;
var PArr=[],Path,Pset,Pext=[],Brushed=false,Bi;
var Btype;

var drag = d3.behavior.drag()
			.on("dragstart",sDrag)
			.on("drag",Drag)
			.on("dragend",eDrag);
var Ndrag = d3.behavior.drag()
			.on("dragstart",dsDrag)
			.on("drag",Drag)
			.on("dragend",deDrag);

function pickCol(evt){
	var Cpick=evt.target.getAttribute("fill");
	$(".chosen").css("fill",Cpick);
	Bcol=Cpick;
}

function sDrag(d){
	var pos=d3.mouse(Rsvg[0][0]);
	Rsvg.append("circle")	
	.attr("class","Icon")
	.attr("cx",pos[0])
	.attr("cy",hei-0.25*TxPad)
	.attr("r",IcR)
	.classed("IcSel",true);
	Rsvg.append("text")
	.text(title[d])
	.attr("x",pos[0])
	.attr("y",hei+TxPad*0.25)
	.attr("text-anchor","middle")
	.classed("IcSel",true);
}

function Drag(){
	var pos=d3.mouse(Rsvg[0][0]);
	var x=Math.min(Math.max(pos[0],AxScale(0)),AxScale(dim-1));
	d3.select("circle.IcSel")	
	.attr("cx",x);
	d3.select("text.IcSel")
	.attr("x",x);
}

function eDrag(d){
	var tObj=d3.select("circle.IcSel"),
		tTex=d3.select("text.IcSel");
	var tObj=Rsvg.selectAll(".IcSel"),
		i=~~AxScale.invert(tObj.attr("cx"))
		,pos,Same=false;	
	if(d==i || d==i+1 || IntData[i].sel[d]){
		Same=true;
		tObj.transition()
		.duration(aniT).attr("cx",AxScale(d))
		.remove();
		tTex.transition()
		.duration(aniT).attr("x",AxScale(d))
		.remove();
	}
	else{
		tObj.call(Ndrag);
		d3.selectAll(".IcSel").classed("IcSel",false)
		.classed("Extra "+i+""+d,true).datum([i,d]);//数据定义：data[0]是当前所在的Interval，data[1]是所代表的Interval
		Redrag(i,d,true);
		IntData[i].Curve=true;
	}
}

function dsDrag(d){
	dsPos=d3.select(this).attr("cx");
	var tSel=$(".Extra."+d[0]+""+d[1]);
	d3.select(tSel[0]).classed("IcSel",true);
	d3.select(tSel[1]).classed("IcSel",true);
}

function deDrag(d){
	var tObj=d3.select("circle.IcSel"),
		tTex=d3.select("text.IcSel");
	if(d[0]!=~~AxScale.invert(tObj.attr("cx"))){
		Redrag(d[0],d[1],false);
		tObj.transition()
		//.duration(aniT)
		.attr("cx",AxScale(d[1]))
		.remove();
		tTex.transition()
		//.duration(aniT)
		.attr("x",AxScale(d[1]))
		.remove();
	}
	else{
		tObj.classed("IcSel",false)
		.transition()
		.duration(aniT)
		.attr("cx",dsPos);
		tTex.classed("IcSel",false)
		.transition()
		.duration(aniT)
		.attr("x",dsPos);
	}
}

function Redrag(i,d,tSel){
		IntData[i].sel[d]=tSel;
		var tNum=IntData[i].sel.filter(function(t){return t;}).length-1,k=1;
		if(tNum==1){
			IntData[i].XScale.domain([0,1]).range([AxPad,AxScale(i+1)-AxScale(i)-AxPad]);
			IntData[i].YScale.domain([0,1]).range([hei-TxPad,TxPad]);
			for(var j=0;j<num;j++) IntData[i].Scdata[j]=IntData[i].Stdata[j].slice(0,2);
		}
		else{
		IntData[i].sel.forEach(function(t,j){
										if(j==i || j==i+1)
											return;
										if(t){
											var x=AxScale(i)+IntScale(k/tNum);
										d3.select($("circle.Extra."+i+""+j)[0]).transition()
										.duration(aniT)
										.attr("cx",x);
										d3.select($("text.Extra."+i+""+j)[0]).transition()
										.duration(aniT)
										.attr("x",x);
										k++;
										}
										});
		getMDS(i);
		}
		var g=d3.select($(".Interval:nth-child("+(i+1)+")")[0]);
		changeMDS(g,i,false);
		
		changePCP(g,i,[true,true]);
		if(i!=0) {
			g=d3.select($(".Interval:nth-child("+(i)+")")[0]);
			changePCP(g,i-1,[false,true]);
		}
		if(i!=dim-2){
			g=d3.select($(".Interval:nth-child("+(i+2)+")")[0]);
			changePCP(g,i+1,[true,false]);
		}
}

function fade(){
	if(d3.select(this).classed("Faded")) return;
	d3.selectAll(".Faded").classed("Faded",false);
	d3.select(this).classed("Faded",true);/**/
}

function spend(){
	var i=~~AxScale.invert(d3.mouse(Rsvg[0][0])[0]);
	if(i<0 || i>=dim-1)
		return;
	var tCur=IntData[i].Curve;
	var st=IntData[i].Stdata,sel=IntData[i].sel;
	if(tCur){
		IntData[i].XScale.domain([0,1]);
		IntData[i].YScale.domain([0,1]);
		IntData[i].Scdata.forEach(function(t,j){var k=st[j][0]; t[0]=k; t[1]=0;});//y为0，x为1
		for(var j=0;j<dim;j++)
			if(sel[j] && j!=i && j!=i+1){
				d3.select($("circle.Extra."+i+""+j)[0])
				.transition()
				.duration(changeT)
				.attr("cx",AxScale(j))
				.remove();
				d3.select($("text.Extra."+i+""+j)[0])
				.transition()
				.duration(changeT)
				.attr("x",AxScale(j))
				.remove();
				sel[j]=false;}
	}
	else
		for(var j=0;j<num;j++) IntData[i].Scdata[j]=st[j].slice(0,2);

	IntData[i].Curve=!tCur;
	changeMDS(d3.select($(".Interval:nth-child("+(i+1)+")")[0]),i,tCur);
	
	changePCP(d3.select($(".Interval:nth-child("+(i+1)+")")[0]),i,[true,true]);
		if(i!=0) {
			g=d3.select($(".Interval:nth-child("+(i)+")")[0]);
			changePCP(g,i-1,[false,true]);
		}
		if(i!=dim-2){
			g=d3.select($(".Interval:nth-child("+(i+2)+")")[0]);
			changePCP(g,i+1,[true,false]);
		}
}

function bStart(){
	var pos=d3.mouse(Rsvg[0][0]);
	Bi=AxScale.invert(pos[0]);
	if(Bi<0 || Bi>=dim-1 || pos[1]>hei-TxPad+Rad*2 || pos[1]<TxPad-Rad*2)
		return;
	Bi=~~Bi;
	PArr=[];
	Brushed=true;
	if(pos[0]-AxScale(Bi)>AxPad-Rad*2){
		if(AxScale(Bi+1)-pos[0]<AxPad-Rad*2){
			Btype="Axes";
			Bi++;
		}
		else{
			if(!IntData[Bi].Curve)
				Btype="Ang";
			else{
				Btype="Area";
				PArr.push(pos);
			}
		}
	}
	else
		Btype="Axes";
	Pset="M"+pos[0]+" "+pos[1]+" ";
	Path=Rsvg.append("path")
		.attr("class","Pbrush")
		.attr("opacity",0.8)
		.attr("fill","none")
		.attr("stroke",Bcol);
	Pext=[pos,pos];
	$(".Rsvg").css("cursor","crosshair");
}

function bMove(){
	if(!Brushed)
		return;
	var pos=d3.mouse(Rsvg[0][0]);
	if(Btype=="Area"){
		pos[0]=Math.max(AxScale(Bi)+AxPad-Rad*2,Math.min(AxScale(Bi+1)-AxPad+Rad*2,pos[0]));
		PArr.push(pos);
	}else if(Btype=="Axes"){
		pos[0]=Math.max(AxScale(Bi)-AxPad+Rad*2,Math.min(AxScale(Bi)+AxPad-Rad*2,pos[0]));
		}
	pos[1]=Math.max(TxPad-Rad*2,Math.min(hei-TxPad+Rad*2,pos[1]));
	Pset+="L"+pos[0]+" "+pos[1]+" ";
	Path.attr("d",Pset);
	Pext=[[Math.min(pos[0],Pext[0][0]),Math.min(pos[1],Pext[0][1])],[Math.max(pos[0],Pext[1][0]),Math.max(pos[1],Pext[1][1])]];
}

function bEnd(){
	if(!Brushed)
		return;
	var x,y,e=Pext;
	Brushed=false;
	//Pset+="Z";
	Path.attr("d",Pset);
	var g=Rsvg.selectAll(".Interval:nth-child("+(Bi==dim-1?Bi:Bi+1)+")");
	if(Btype=="Area"){
		g.selectAll(".point")
		.each(function(d,j){
					   var obj=d3.select(this);
						x=+obj.attr("cx")+AxScale(Bi);
						y=+obj.attr("cy");
						if(x<e[0][0] || x>e[1][0] || y<e[0][1] || y>e[1][1])
							return;
							if(insidePolygon(PArr,[x,y]))
								Paint(j);
					   });
	}else{
		if(Bi==dim-1)
			g.selectAll(".curve.begin")
			.each(function(d,j){
						   if(d[3][1]>e[0][1] && d[3][1]<e[1][1])
							Paint(j);
						   });
		else
			g.selectAll(".curve.begin")
			.each(function(d,j){
						   if(d[0][1]>e[0][1] && d[0][1]<e[1][1])
							Paint(j);
						   });
	}
	d3.selectAll(".Pbrush")
	.transition()
	.duration(changeT)
	.attr("opacity",0)
	.remove();		
	$(".Rsvg").css("cursor","default");
}

function Paint(i){
	d3.selectAll($("path."+i)).attr("stroke",Bcol);
	d3.selectAll($(".point."+i)).attr("fill",Bcol);
}

function insidePolygon(t,r){
	var e=false,n=-1;
	for(var i=t.length,a=i-1;++n<i;a=n)
			if( (t[n][1]<=r[1] && r[1]<t[a][1] || t[a][1]<=r[1] && r[1]<t[n][1]) && r[0]<(t[a][0]-t[n][0])*(r[1]-t[n][1])/(t[a][1]-t[n][1])+t				[n][0])				e=!e;
		return e};
// JavaScript Document