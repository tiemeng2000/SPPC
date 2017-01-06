$(".openData").on("click", function(e) {
	var fileName="";
	switch($(this).attr("id")){
		case "Iris":
			newTask("data/Iris.csv", false);
		break;
		case "Car":
			newTask("data/Car.csv", false);
		break;
		case "Local":
			return;
		default:
	}
});
$("#saveData").on("click", function(e) {
	if(dataSet!=undefined){	
		if(engine.browser[0]=="Safari")
			myAlert("Sorry, this function is not supported by Safari.\n Please change the browser for a better experience.",
			 "Browser Not Supported");
		crowbar(".main");
	}
});

$("#Confirm").on("click", function (e) {	
	if(engine.browser[0]=="Safari"){
		myAlert("Sorry, this function is not supported by Safari.\n Please change the browser for a better experience.",
		 "Browser Not Supported");
		return;
	}
	newTask("", true);
})

$("#Cansel").on("click", function (e) {
	clearFile();
})

$(".help-content0").attr("width",parseInt($(".bs-example-modal-lg").css("width"))*0.15);
$(".help-content1").attr("width",parseInt($(".bs-example-modal-lg").css("width"))*0.2);
$(".help-content2").attr("width",parseInt($(".bs-example-modal-lg").css("width"))*0.3);

$(".instruction").on("click", function(e){
	d3.selectAll(".instruction")
	.classed("active",false);
	d3.select(this)
	.classed("active",true);
	switch(d3.select(this).attr("id")){
		case "1":
			$(".help").css("display","none");
			$("#DataLoading").css("display","inline");
		break;
		case "2_1":
			$(".help").css("display","none");
			$("#Toggling").css("display","inline");
		break;
		case "2_2":
			$(".help").css("display","none");
			$("#AreaBrushing").css("display","inline");
			d3.selectAll(".this")
			.classed("this",false);
			d3.select("#AreaBrushing .active")
			.classed("this",true)
		break;
		case "2_3":
			$(".help").css("display","none");
			$("#MDSMode").css("display","inline");
		break;
		case "2_4":
			$(".help").css("display","none");
			$("#AxisExchange").css("display","inline");
		break;
		case "3":
			$(".help").css("display","none");
			$("#ResultSaving").css("display","inline");
		break;
		default:
	}
})
$(".page").on("click",function(e){
	var tagid=parseInt($(".this").attr("id"));
	var tid=$(this).parents(".help").attr("id");
	if(tid.indexOf("Brushing")>=0)
		switch($(this).attr("id")){
			case "1":
				d3.selectAll(".this")
				.classed("this",false);
				$(".help").css("display","none");
				$("#AreaBrushing").css("display","inline");
				d3.select("#AreaBrushing .active")
				.classed("this",true)
			break;
			case "2":
				d3.selectAll(".this")
				.classed("this",false);
				$(".help").css("display","none");
				$("#AxisBrushing").css("display","inline");
				d3.select("#AxisBrushing .active")
				.classed("this",true)
			break;
			case "3":
				d3.selectAll(".this")
				.classed("this",false);
				$(".help").css("display","none");
				$("#AngularBrushing").css("display","inline");
				d3.select("#AngularBrushing .active")
				.classed("this",true)
			break;
			case "before":
				if(tagid==1)
					return;
				d3.selectAll(".this")
				.classed("this",false);
				$(".help").css("display","none");
				switch(tagid-1){
					case 1:
						$("#AreaBrushing").css("display","inline");
						d3.select("#AreaBrushing .active")
						.classed("this",true)
					break;
					case 2:
						$("#AxisBrushing").css("display","inline");
						d3.select("#AxisBrushing .active")
						.classed("this",true)
					break;				
				}
			break;
			case "after":
				if(tagid==3)
					return;
				d3.selectAll(".this")
				.classed("this",false);
				$(".help").css("display","none");
				switch(tagid+1){
					case 2:
						$("#AxisBrushing").css("display","inline");
						d3.select("#AxisBrushing .active")
						.classed("this",true)
					break;
					case 3:
						$("#AngularBrushing").css("display","inline");
						d3.select("#AngularBrushing .active")
						.classed("this",true)
					break;			
				}
			break;
			default:
		}
	else
		switch($(this).attr("id")){
			case "1":
				d3.selectAll(".this")
				.classed("this",false);
				$(".help").css("display","none");
				$("#MDSMode").css("display","inline");
				d3.select("MDSMode .active")
				.classed("this",true)
			break;
			case "2":
				d3.selectAll(".this")
				.classed("this",false);
				$(".help").css("display","none");
				$("#DimensionToggle").css("display","inline");
				d3.select("#DimensionToggle .active")
				.classed("this",true)
			break;
			case "before":
				if(tagid==1)
					return;
				d3.selectAll(".this")
				.classed("this",false);
				$(".help").css("display","none");
				$("#MDSMode").css("display","inline");
				d3.select("#MDSMode .active")
				.classed("this",true)
			break;
			case "after":
				if(tagid==2)
					return;
				d3.selectAll(".this")
				.classed("this",false);
				$(".help").css("display","none");
				$("#DimensionToggle").css("display","inline");
				d3.select("#DimensionToggle .active")
				.classed("this",true)
			break;
			default:
		}
})

palette=createPalette($(".palette")[0]);
document.body.onload=function(){
				var stimer=setInterval(function(){
					if($("#picker")[0])
		            	if(!trimed){
		            		trimed=true;
		            		var margin=$(".main").css("margin");
		            		$("#colorpicker div").css("height", parseInt($(".main").css("height"))*0.9);
							$("#picker").css("height", $("#picker svg").css("height"));
							$("#slide").css("height", $("#slide svg").css("height"));
							var xv=0.07*parseInt($("#picker svg").css("width")),
							    yv=0.03*parseInt($("#picker svg").css("height"));
							$("#picker rect").attr("width", "86%").attr("x", xv);
							$("#picker rect").attr("height", "94%").attr("y", yv);
							d3.select("#picker svg")
							.insert("rect", "#picker rect")
							.attr("x", xv)
							.attr("y", yv)
							.attr("width","86%")
							.attr("height","94%")
							.attr("fill","red")
							.attr("id","slide-show");
							initPalette();
							var xv=0.05*parseInt($("#slide svg").css("width")),
							    yv=0.03*parseInt($("#slide svg").css("height"));
							$("#slide rect:first").attr("width", "90%").attr("x", xv);
							$("#slide rect:first").attr("height", "94%").attr("y", yv);
							clearInterval(stimer);
		            	}},
		            100);
			}
ColorPicker(
            document.getElementById("slide"),
            document.getElementById("picker"),
            function(hex, hsv, rgb) {
            	palette.color=hex;
				$("#colorShow").css("background-color",hex);
            });

d3.select(".main").on("dblclick", function(e) {
	if(dataSet==undefined)
		return;
	var s=dataSet.canvas.scale;
	var o=~~s.invert(d3.mouse(this)[0]);
	clearInterval(dataSet.canvas.planes[o].MDS.timer);
	dataSet.canvas.changePlane(o,0);
});
d3.select(".main").on("mousedown", dragBegin);
d3.select(".main").on("mousemove", dragOn);
d3.select(".main").on("mouseup", dragStop);
$(".main").bind("mousewheel", changeInterval);
d3.select("body").on("mouseup", dragRelease);

function newTask(file, type){
	//Clear the last workspace
	var tCanvas;
	if(dataSet!=undefined){
		$.each(dataSet.canvas.planes, function(id, d) {
			clearInterval(d.MDS.timer);
		});
		dataSet.canvas.scale.range(dimScale.range());
	}
	else{
		tCanvas=createCanvas([wid,hei], d3.scale.linear().range(dimScale.range()), svg);
		tDataSet=createDataSet(tCanvas);
	}
	var t=setInterval(function(){
		if(tDataSet.ready){
			dataSet=tDataSet;
			//Create empty objects
			$(".canvas").empty();
			$(".placeholder").attr("visibility", "hidden");
			clearInterval(t);
			dataSet.ready=false;
			if(dataSet.illegal){
				dataSet.illegal=false;
				myAlert("Illegal Data!","Data Error");
				return;
			}
			dataSet.initCanvas();
			initInteractions("handler");
		}
	},500);
	//Load in the data
	if(type){
		getData();
		var k=setInterval(function(){
			if(tDataSet.readAll){
				clearInterval(k);
				clearFile();
				tDataSet.readAll=false;
				tDataSet.readData(tDataSet.contents, type);
			}
		},100);
	}
	else{
		tDataSet.readData(file, type);
}	
}

function initInteractions(className){	
	d3.selectAll("."+className).on("mousedown", function(e){
		dragSign=0;
		var Orig=!d3.select(this).classed("mdl_handler");
		var Name=$(this).attr("id");
		var Dim=dataSet.canvas.findAxis(Name);
		var Pos, From;
		if(Orig){
			From=Dim;
			Pos=dataSet.canvas.axes[Dim].pos;
		}
		else{
			From=-1;
			Pos=-1;
		}
		dragObj=createDragObj(Dim,Orig,From,Pos,Name);
	});
}

//dragging
/*dragSign: -1 for nothing, 0 for handler dragging, 1 for axis brushing,
2 for angular brushing, 3 for point brushing
*/
function dragBegin(){
	if(dataSet==undefined)
		return;
	var pos=d3.mouse(this);
	var s=dataSet.canvas.scale;
	if(dragSign<0){
		var rh=s.range(), rv=dataScale.range();
		if(pos[0]<rh[0]-ax_div/2 || pos[0]>rh[rh.length-1]+ax_div/2
			|| pos[1]<rv[1] || pos[1]>rv[0]){
			return;
		}else{
			dragObj=createDragObj(-1,true,-1,-1,"");//initialize the dragObj
			var rg=dataScale.range();
			var t=$(".axis path:first").attr("d");
			var top=parseFloat(t.slice(t.indexOf(",")+1,t.indexOf("H")))-4;
			t=t.substring(t.indexOf("H")+1,t.length);
			var btm=parseFloat(t.slice(t.indexOf("V")+1,t.indexOf("H")))+4;
			dragObj.vscale=[top, btm];
			dragObj.dir=1;
			var o=~~(s.invert(pos[0])+0.5);
			if(pos[0]>s(o)){
				if(pos[0]-s(o)>ax_div){
					var pl=dataSet.canvas.planes[o];
					if(pl.sign)			
						dragSign=3;
					else
						dragSign=2;
					dragObj.plane=o;
					dragObj.hscale=[pl.pos-ax_div*(1-ax_scale), pl.pos+pl.width+ax_div*(1-ax_scale)];
				}
				else{
					var ax=dataSet.canvas.axes[o];
					dragSign=1;
					dragObj.axis=o;
					dragObj.hscale=[ax.pos-ax_div*ax_scale, ax.pos+ax_div*ax_scale];
				}
			}
			else{
				if(s(o)-pos[0]>ax_div){
					var pl=dataSet.canvas.planes[o-1];
					if(pl.sign)
						dragSign=3;
					else
						dragSign=2;
					dragObj.plane=o-1;
					dragObj.hscale=[pl.pos-ax_div*(1-ax_scale), pl.pos+pl.width+ax_div*(1-ax_scale)];
				}
				else{
					var ax=dataSet.canvas.axes[o];
					dragSign=1;
					dragObj.axis=o;
					dragObj.hscale=[ax.pos-ax_div*ax_scale, ax.pos+ax_div*ax_scale];
				}
			}
		}
		switch(dragSign){
			case 0:
			break;
			case 1:
				d3.select(".axis#"+dataSet.canvas.axes[dragObj.axis].aname+" .ax_frame")
				.transition()
				.delay(400)
				.attr("stroke-opacity",1);
				break;
			case 2:
			case 3:
				var tds=dataSet.canvas.planes[dragObj.plane].dims;
				d3.select(".plane#"+tds[0]+"_"+tds[1]+" .pl_frame")
				.transition()
				.delay(400)
				.attr("stroke-opacity",1);
				break;
			break;
			default:
		}
		if(dragSign!=0){
			dragObj.path.push(pos);
			dragObj.range[0]=[pos[0],pos[0]];
			dragObj.range[1]=[pos[1],pos[1]];
			dragObj.color=$("#colorShow").css("background-color");
			dragObj.path_txt="M"+pos[0]+" "+pos[1];
			svg.append("path")
			.attr("class","dragPath")
			.attr("stroke",dragObj.color);
		}
	}
	else{
		switch(dragSign){
			case 0:
				if(!dragObj.orig){
					var o=~~s.invert(pos[0]);
					var ord=dataSet.canvas.planes[o].existDim(dragObj.dname);
					dragObj.from=o;
					var hdl=dataSet.canvas.findHdl([2*o+1],dragObj.dname,true).hdl;
					var t=hdl.attr("transform");
					dragObj.pos=parseFloat(t.substring(t.indexOf("(")+1,t.indexOf(",")));
					d3.select(hdl[0])
					.classed("temporaryHdl",true);
				}
			break;
			default:
		}
	}
}

function dragOn(){
	if(dragSign<0){
		if(!dataSet)
			return;
		else{
			var pos=d3.mouse(this);	
			var s=dataSet.canvas.scale;	
			var o=s.invert(pos[0]), r=s.domain();
			if(o<r[0] || o>=r[r.length-1]){
				d3.selectAll(".pl_plane")
				.each(function(){
					if($(this).attr("fill-opacity")>0)
						d3.select(this)
						.transition()
						.attr("fill-opacity", 0);
				});
				mousePlane=-1;
				return;	
			}
			o=~~o;
			if(mousePlane==o)
				return;
			else
				mousePlane=o;
			d3.selectAll(".pl_plane")
			.each(function(){
				if(d3.select(this).attr("fill-opacity")>0)
					d3.select(this)
					.transition()
					.attr("fill-opacity", 0);
			});
			var pl=dataSet.canvas.planes[o];
			if(!pl.sign)
				return;
			var tds=pl.dims;
			d3.select(".plane#"+tds[0]+"_"+tds[1]+" .pl_plane")
			.transition()
			.attr("fill-opacity", pl_opc);
		}
	}
	else{
		var pos=d3.mouse(this);
		switch(dragSign){
			case 0:
				if(!dragObj.moved && dragObj.orig){
					dragObj.moved=true;
					dataSet.canvas.handlers[2*dragObj.dim][0].copy(pos[0]);
					d3.selectAll(".hdlChosen")
					.classed("hdlChosen",false);
				}
				$(".temporaryHdl")
				.attr("transform","translate("+pos[0]+",0)");
			break;
			case 1:
			case 2:
			case 3:
				pos[0]=d3.min([d3.max([pos[0], dragObj.hscale[0]]), dragObj.hscale[1]]);
				pos[1]=d3.min([d3.max([pos[1], dragObj.vscale[0]]), dragObj.vscale[1]]);
				dragObj.path.push(pos);
				var x=dragObj.range[0], y=dragObj.range[1];
				dragObj.range[0]=[d3.min([x[0],pos[0]]), d3.max([x[1],pos[0]])];
				dragObj.range[1]=[d3.min([y[0],pos[1]]), d3.max([y[1],pos[1]])];
				dragObj.path_txt+=" L"+pos[0]+" "+pos[1];
				$(".dragPath").attr("d",dragObj.path_txt);
			break;
			default:
		};
		if(dragSign==2){
			var p=dragObj.path, l=p.length;
			if(dragObj.dirCount<dragObj.dirUp){
				if(p[l-2][0]<p[l-1][0]){
					dragObj.dirCount++;
					dragObj.dirSum++;
				}
				else
					if(p[l-2][0]>p[l-1][0]){
						dragObj.dirCount++;
						dragObj.dirSum--;
					}
				if(dragObj.dirCount==dragObj.dirUp)
					if(dragObj.dirSum>dragObj.dirThrs)
						dragObj.dir=2;
					else
						if(dragObj.dirSum<-dragObj.dirThrs)
							dragObj.dir=0;
						else
							dragObj.dir=-1;
			}
		}
	}
}

function dragRelease(){//executed when dragStop is not triggered
	palDown=false;
	if(dragSign<0){
		return;
	}
	else{
		if(dragSign!=0){
		var ts=dataSet.canvas.scale;
		var pl=dataSet.canvas.planes[dragObj.from],ord=pl.existDim(dragObj.dname);
		pos[0]=d3.min([d3.max([pos[0], dragObj.hscale[0]]), dragObj.hscale[1]]);
		pos[1]=d3.min([d3.max([pos[1], dragObj.vscale[0]]), dragObj.vscale[1]]);
		dragObj.path.push(pos);
		var x=dragObj.range[0], y=dragObj.range[1];
		dragObj.range[0]=[d3.min([x[0],pos[0]]), d3.max([x[1],pos[0]])];
		dragObj.range[1]=[d3.min([y[0],pos[1]]), d3.max([y[1],pos[1]])];
		$(".dragPath").remove();
		}
		else{
			if(dragObj.orig){
				d3.select(".temporaryHdl")
				.transition()
				.attr("transform","translate("+dragObj.pos+",0)")
				.remove();
			}
			else{
				d3.select(".temporaryHdl")
				.transition()
				.attr("transform","translate("+dragObj.pos+",0)");
				d3.select(".temporaryHdl")
				.classed("temporaryHdl",false);				
			}			
		}
		dragSign=-1;
	}
}

function dragStop(){
	if(dragSign<0)
		return;
	else{
		var pos=d3.mouse(this);
		if(dragSign!=0){			
				pos[0]=d3.min([d3.max([pos[0], dragObj.hscale[0]]), dragObj.hscale[1]]);
				pos[1]=d3.min([d3.max([pos[1], dragObj.vscale[0]]), dragObj.vscale[1]]);
				dragObj.path.push(pos);
				var x=dragObj.range[0], y=dragObj.range[1];
				dragObj.range[0]=[d3.min([x[0],pos[0]]), d3.max([x[1],pos[0]])];
				dragObj.range[1]=[d3.min([y[0],pos[1]]), d3.max([y[1],pos[1]])];
				$(".dragPath").remove();
		}
		switch(dragSign){
			case 0:
				if(dragObj.orig && !dragObj.moved){//Axis Click
					if($(".hdlChosen")[0]){//Axis Change
						var ord1=$(".hdlChosen").attr("id");
						var ord2=dragObj.dname;
						if(ord1!=ord2)
							dataSet.canvas.changeAxes(ord1, ord2);
						d3.selectAll(".hdlChosen")
						.classed("hdlChosen",false);
					}
					else{
						var to=d3.select(".handler#"+dragObj.dname);
						to.classed("hdlChosen",!to.classed("hdlChosen"));	
					}
				}
				else{//Axis Move
					var a=dragObj.dname;
					var ts=dataSet.canvas.scale, o=~~ts.invert(pos[0]);
					if(o<0 || o>=dataSet.dimNum-1){//Interaction cross the line		
						d3.select(".temporaryHdl")
						.transition()
						.attr("transform","translate("+dataSet.canvas.axes[dragObj.dim].pos+",0)")
						.remove();
						if(!dragObj.orig){
							var ord=dataSet.canvas.planes[dragObj.from].delDim(dragObj.dname);
							dataSet.canvas.delHdl(2*dragObj.from+1, a);
						}
					}else{
						if(dragObj.orig){//Add in dimensions
							var pl=dataSet.canvas.planes[o], thdl=dataSet.canvas.findHdl(2*o+1,a,true);
							var tl=dataSet.canvas.handlers[2*o+1].length;
							if(!thdl && pl.sign){//Not existed
								pl.update(a, true);
								var s=d3.scale.linear().range([ts(o), ts(o+1)]).domain([-1,tl+1]);
								dataSet.canvas.handlers[2*o+1].push(createHandler(a, s(tl), $(".temporaryHdl")));
								$.each(dataSet.canvas.handlers[2*o+1], function(id, d) {
									d3.select(d.hdl[0])
									.transition()
									.attr("transform","translate("+s(id)+",0)");
									d.pos=s(id);
								});
								d3.select(".temporaryHdl")
								.attr("id","middle_"+o);
								d3.select(".temporaryHdl")
								.classed("temporaryHdl",false)
								.classed("handler_"+a,true)
								.classed("middle_hdl",true);
								initInteractions("mdl_handler");							
								dataSet.canvas.changePlane(o,1);
							}else{//existed			
								d3.select(".temporaryHdl")
								.transition()
								.attr("transform","translate("+dragObj.pos+",0)")
								.remove();
							}
						}
						else{//Middle handler operations
							var pl=dataSet.canvas.planes[dragObj.from];	
							var tl=dataSet.canvas.handlers[2*o+1].length;
							if(!pl.sign){
								d3.select(".temporaryHdl")
								.classed("hdl_mistake", true)
								.transition()
								.attr("transform","translate("+dragObj.pos+",0)");
								d3.select(".temporaryHdl")
								.classed("temporaryHdl",false);		
								dragSign=-1;		
								return;				
							}
							if(o!=dragObj.from){		
								var ord=pl.existDim(a);	
								d3.select(".temporaryHdl")
								.classed("hdl_remove",true)
								.transition()
								.attr("transform","translate("+dataSet.canvas.axes[dragObj.dim].pos+",0)")
								.remove();
								if(ord>0){
									pl.update(dragObj.dname, false);
								}
								dataSet.canvas.delHdl(2*dragObj.from+1, a);
								var s=d3.scale.linear().range([ts(dragObj.from), ts(dragObj.from+1)]).domain([-1,tl+1]);
								$.each(dataSet.canvas.handlers[2*dragObj.from+1], function(id, d) {
									d3.select(d.hdl[0])
									.transition()
									.attr("transform","translate("+s(id)+",0)");
									d.pos=s(id);
								});
								dataSet.canvas.changePlane(dragObj.from,1);
							}else{
								var tswitch=!(Math.abs(pos[0]-dragObj.pos)>=elp_r[0]);//click or drag
								d3.select(".temporaryHdl")
								.classed("hdl_mistake", !tswitch)
								.transition()
								.attr("transform","translate("+dragObj.pos+",0)");
								if(tswitch){
									var ton=d3.select(".temporaryHdl").select(".handler").classed("hdl_on");
									if(ton){
										pl.update(a, false);
										dataSet.canvas.changePlane(o,1);
									}
									else{
										pl.update(a, true);
										dataSet.canvas.changePlane(o,1);
									}
								}
								d3.select(".temporaryHdl")
								.classed("temporaryHdl",false);
							}
						}
					}
				}
			break;
			case 1:
				dataSet.canvas.axisBrushing(dragObj.range[1], dragObj.axis);
				d3.select(".axis#"+dataSet.canvas.axes[dragObj.axis].aname+" .ax_frame")
				.transition()
				.attr("stroke-opacity",0);				
			break;
			case 2:
				if(dragObj.dir!=1 && dragObj.dir!=-1)
					dataSet.canvas.angularBrushing(dragObj.dir, dragObj.path, dragObj.range[0], dragObj.plane);
				var tds=dataSet.canvas.planes[dragObj.plane].dims;
				d3.select(".plane#"+tds[0]+"_"+tds[1]+" .pl_frame")
				.transition()
				.attr("stroke-opacity",0);
			break;
			case 3:
				dataSet.canvas.pointBrushing(dragObj.path, dragObj.plane);
				var tds=dataSet.canvas.planes[dragObj.plane].dims;
				d3.select(".plane#"+tds[0]+"_"+tds[1]+" .pl_frame")
				.transition()
				.attr("stroke-opacity",0);
			break;
			default:
		}
		dragSign=-1;
	}
}

//brushing
function axisBrushing(range, ord){
	var inds=[];
	$.each(this.axes[ord].dist, function(id, d) {
		if(d>=range[0] && d<=range[1])
			inds.push(id);
	});
	this.selData=inds;
	var col=$("#colorShow").css("background-color");
	$.each(this.selData, function(id, d) {
		$("path.sel"+d).attr("stroke",col);
		$("circle.sel"+d).attr("fill",col);
	 });
}

function angularBrushing(dir, path, range, ord){
	var ind, l=path.length;
	if(dir==0)
		$.each(path, function(id, d) {
			if(d[0]==range[0])
				ind=id;
		});
	else
		$.each(path, function(id, d) {
			if(d[0]==range[1])
				ind=id;
		});
	if(ind==undefined || ind==0 || ind==l-1){
		myAlert("Illegal Brushing!", "Invalid Operation");
		return;
	}
	//screen y axis is inverse
	var begSlope=-(path[0][1]-path[ind][1])/(path[0][0]-path[ind][0]),
		endSlope=-(path[l-1][1]-path[ind][1])/(path[l-1][0]-path[ind][0]);
	var slpRange=[begSlope, endSlope];
	slpRange.sort(d3.ascending);
	var bf=this.axes[ord].dist, af=this.axes[ord+1].dist;
	var div=this.axes[ord].pos-this.axes[ord+1].pos, inds=[];
	$.each(bf, function(id,d) {
		var sl=-(d-af[id])/div;
		if(sl>=slpRange[0] && sl<=slpRange[1])
			inds.push(id);
	});
	this.selData=inds;
	var col=$("#colorShow").css("background-color");
	$.each(this.selData, function(id, d) {
		$("path.sel"+d).attr("stroke",col);
		$("circle.sel"+d).attr("fill",col);
	 });
}

function pointBrushing(path, ord){
	var inds=[], pl=this.planes[ord], pos=pl.pos, s=pl.scales;
	$.each(pl.points, function(id, d) {
		var t=[s[1](d[0])+pos,s[0](d[1])];
		if(insidePolygon(path, t))
			inds.push(id);
	});
	this.selData=inds;
	var col=$("#colorShow").css("background-color");
	$.each(this.selData, function(id, d) {
		$("path.sel"+d).attr("stroke",col);
		$("circle.sel"+d).attr("fill",col);
	 });
}

function insidePolygon(t,r){
	var e=false,n=-1;
	for(var i=t.length,a=i-1;++n<i;a=n)
			if( (t[n][1]<=r[1] && r[1]<t[a][1] || t[a][1]<=r[1] && r[1]<t[n][1]) && 
				r[0]<(t[a][0]-t[n][0])*(r[1]-t[n][1])/(t[a][1]-t[n][1])+t[n][0])				
				e=!e;
	return e
}

//palette
function initPalette(){
	d3.select("#picker svg")
	.append("circle")
	.attr("cx","92%")
	.attr("cy","3%")
	.attr("r","2%")
	.attr("fill","none")
	.attr("stroke","black")
	.attr("stroke-width","2px")
	.attr("id","picker-indicator");
	d3.select("#slide svg")
	.append("rect")
	.attr("x","0%")
	.attr("y","3%")
	.attr("width",$("#slide svg").css("width"))
	.attr("height","5px")
	.attr("fill","none")
	.attr("stroke","black")
	.attr("stroke-width","2px")
	.attr("id","slider-indicator");
}

//Interval
function changeInterval(e, alpha){
	if(false){//dataSet
		var pos=[e.offsetX, e.offsetY], dir=alpha;
		var s=dataSet.canvas.scale, t=dataSet.canvas.intStep,
			m=dataSet.canvas.minWidth;
		var tpos=s.range();
		if(pos[0]<=tpos[0] || pos[0]>=tpos[tpos.length-1])
			return;
		var o=~~s.invert(pos[0]), por=(pos[0]-tpos[o])/(tpos[o+1]-tpos[o]);
		var tint=[];		
		for(var i=1;i<=o && i<tpos.length-1;i++)
			tint[i]=(tpos[i]-tpos[i-1]);
		for(var i=tpos.length-2;i>o && i>0;i--)
			tint[i]=tpos[i+1]-tpos[i];		
		if(dir>=0){
			var tt=t*por, l=tpos[o]-tpos[0]-tt;
			for(var i=1;i<=o && i<tpos.length-1;i++){
				var p=tint[i]/(l+tt)*l;
				if(p<=m)
					tpos[i]=tpos[i-1]+m;
				else
					tpos[i]=tpos[i-1]+p;
			}

			tt=t*(1-por), l=tpos[tpos.length-1]-tpos[o+1]-tt;	
			for(var i=tpos.length-2;i>o && i>0;i--){
				var p=tint[i]/(l+tt)*l;
				if(p<=m)
					tpos[i]=tpos[i+1]-m;
				else
					tpos[i]=tpos[i+1]-p;
			}
			s.range(tpos);
		}
		else{
			if(tpos[o+1]-tpos[o]<=m)
				return;
			if(tpos[o+1]-tpos[o]-2*t<m)
				t=(tpos[o+1]-tpos[o]-m)/2;
			var tt=t*por,l=tpos[o]-tpos[0]+tt;
			for(var i=1;i<=o && i<tpos.length-1;i++)
				tpos[i]=tpos[i-1]+tint[i]/(l-tt)*l;

			tt=t*(1-por), l=tpos[tpos.length-1]-tpos[o+1]+tt;	
			for(var i=tpos.length-2;i>o && i>0;i--)
				tpos[i]=tpos[i+1]-tint[i]/(l-tt)*l;
			s.range(tpos);			
		}
		/*
		*/
		$.each(dataSet.canvas.axes, function(id, d) {
			d.pos=tpos[id];
			$(".axis#"+d.aname)
			.attr("transform","translate("+d.pos+",0)");
		});
	}
}

function myAlert(content, title){
	jAlert(content, title);
	$("#popup_container").css("border","3px solid rgb(153, 153, 153)");
	$("#popup_title").css("background","#EEE");
}