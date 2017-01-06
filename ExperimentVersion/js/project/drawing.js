//Methods for canvas
function initCanvas(){
	var tords=[], poss=this.canvas.scale.range(), tpos=[];

	for(var i=0;i<this.dimNum;i++){
		tpos.push((poss[1]-poss[0])*i/(this.dimNum-1)+poss[0])
		tords.push(i);
	}
	this.canvas.ords=tords;
	this.canvas.scale.range(tpos);
	this.canvas.scale.domain(tords);
	this.canvas.initAxes();
	this.canvas.initHdls();
	this.canvas.initPlanes();
	this.canvas.initLines();
}

function initAxes(){
	ax_div=this.scale(0.1)-this.scale(0);
	this.axes=[];
	for(var i=0;i<this.ords.length;i++){
		this.axes.push(createAxis(i, this.scale(i), ""));
		this.axes[i].init();
		this.axes[i].show();
	}
}

function initHdls(){
	this.handlers=[];
	for(var i=0;i<this.axes.length-1;i++){
		var a=this.axes[i].aname;
		var h1=[createHandler(a, this.axes[i].pos, $(".handler_"+a))];
		this.handlers.push(h1);//handlers of axes
		var h2=[];
		this.handlers.push(h2);//handlers on planes
	}
	var o=this.axes[this.axes.length-1];
	this.handlers.push([createHandler(o.aname, o.pos, $(".handler_"+o.aname))])
}

function initPlanes(){
	var w=this.scale(1)-this.scale(0)-2*ax_div;
	this.intStep=this.minWidth=w/2;
	this.planes=[];
	for(var i=0;i<this.ords.length-1;i++){
		this.planes.push(createPlane(i, this.scale(i)+ax_div, ax_div, w, [this.axes[i].aname, this.axes[i+1].aname]));
		this.planes[i].init();
		this.planes[i].show();
	}
}

function initLines(){
	var signs=[], ords=[];
	$.each(this.planes, function(id, d) {
		ords.push(id);
		signs.push(d.sign);
	});
	this.lines=[];
	for(var i=0;i<dataSet.dims[0].dist.length;i++){
		this.lines.push(createLine(i));
		this.lines[i].init();
		this.lines[i].show(signs, ords);
	}
}

function changePlane(ord, type){
	switch(type){
		case 0://Toggle scatterplot
			var o=this.planes[ord], s=o.scales;
			var t=o.toggle();
			if(t)
				$.each(this.lines, function(id, d) {
					d.points[2*ord+1]=[s[1](o.points[id][0])+o.pos, s[0](o.points[id][1])];
				});
			else
				$.each(this.lines, function(id, d) {
					d.points[2*ord+1]=[o.pos-o.div, s[0](o.points[id][1])];
				});
			this.changeLines(ord,0);
		break;
		case 1://Prepare MDS transition
			var o=this.planes[ord], s=o.scales;
			var eb=0, ef=0;
			clearInterval(o.MDS.timer);
			o.MDS.timer=setInterval(function(){
				ef=MDSTrans(o);
				if(Math.abs(ef-eb)/eb<errThres){
					clearInterval(o.MDS.timer);
				}
				eb=ef;
			},50);
		break;
		case 2://One MDS transition
			var o=this.planes[ord], s=o.scales;
			d3.selectAll("#"+o.dims[0]+"_"+o.dims[1]+" .point")
			.data(o.points)
			.attr("cx",function(d){return s[1](d[0]);})
			.attr("cy",function(d){return s[0](d[1]);});
			this.changeLines(ord,1);
		break;
		case 3://Axis Change
			for(var i=0;i<ord.length;i++){
				var tord=ord[i];
				var o=this.planes[tord], s=o.scales;
				this.handlers[2*tord+1]=[];
				$(".temporaryHdl").remove();
				d3.selectAll("#middle_"+tord)
				.transition()
				.ease("linear")
				.duration(aniTime)
				.attr("opacity",0)
				.remove();
				d3.selectAll("#"+o.dims[0]+"_"+o.dims[1]+" .point")
				.data(o.points)
				.transition()
				.ease("linear")
				.duration(aniTime)
				.attr("cx", -o.div*1.02)
				.attr("cy",function(d){return s[0](d[1]);})
				.attr("opacity",0);
				var bAxis=this.axes[tord], aAxis=this.axes[tord+1]
				var sl, ts=this.scale;
				$.each(this.lines, function(id, d) {
					var bt=bAxis.dist[id], at=aAxis.dist[id];
					d.points[2*tord]=[bAxis.pos, bt];
					d.points[2*tord+1]=[bAxis.pos, bt];
					d.points[2*tord+2]=[aAxis.pos, at];
					sl=(bt-at)/(bAxis.pos-aAxis.pos);
					d.slopes[tord]=[sl,sl,sl];
				});
				this.changeLines(ord[i],2);
			}
		break;
		default:
	}
}

function changeLines(ord, type){
	var signs=[], ords=[];
	switch(type){
		case 0:
			if(ord!=0){
				signs.push(this.planes[ord-1].sign);
				ords.push(ord-1);
			}
			signs.push(this.planes[ord].sign);
			ords.push(ord);
			if(ord!=this.planes.length-1){
				signs.push(this.planes[ord+1].sign);
				ords.push(ord+1);		
			}
			$.each(this.lines, function(id, d) {
				d.change(signs,ords,false);
			});
			var tlines=this.lines;
			$.each(ords, function(id, d) {
				d3.selectAll(".curve.pl"+d)
				.data(tlines)
				.transition()
				.ease("linear")
				.duration(aniTime)
				.attr("d",function(t){return t.path[d];});
			});
		break;
		case 1:
			signs.push(this.planes[ord].sign);
			ords.push(ord);
			$.each(this.lines, function(id, d) {
				d.change(signs,ords,true);
			});
			var tlines=this.lines;
			$.each(ords, function(id, d) {
				d3.selectAll(".curve.pl"+d)
				.data(tlines)
				.transition()
				.ease("linear")
				.duration(aniTime)
				.attr("d",function(t){return t.path[d];});
			});
		break;
		case 2:
			if(ord!=0){
				signs.push(this.planes[ord-1].sign);
				ords.push(ord-1);
			}
			signs.push(this.planes[ord].sign);
			ords.push(ord);
			if(ord!=this.planes.length-1){
				signs.push(this.planes[ord+1].sign);
				ords.push(ord+1);		
			}
			$.each(this.lines, function(id, d) {
				d.change(signs,ords,false);
			});
			var tlines=this.lines;
			$.each(ords, function(id, d) {
				d3.selectAll(".curve.pl"+d)
				.data(tlines)
				.transition()
				.ease("linear")
				.duration(aniTime)
				.attr("d",function(t){return t.path[d];});
			});
		break;
		default:
	};
}

function changeAxes(ord1, ord2){
	var ords=[this.findAxis(ord1),this.findAxis(ord2)];
	var trange;
	ords.sort(d3.ascending);
	//update axes
	var tax0=this.axes.splice(ords[0],1)[0];
	var tax1=this.axes.splice(ords[1]-1,1)[0];
	var dim0=dataSet.dims[dataSet.findDim(tax0.aname)];
	var dim1=dataSet.dims[dataSet.findDim(tax1.aname)];
	tax0.pos=this.scale(ords[1]);
	tax1.pos=this.scale(ords[0]);
	tax0.ord=ords[1];
	tax1.ord=ords[0];
	this.axes.splice(ords[0],0,tax1);
	this.axes.splice(ords[1],0,tax0);
	$(".axis#"+tax0.aname)
	.attr("transform","translate("+tax0.pos+",0)");
	$(".axis#"+tax1.aname)
	.attr("transform","translate("+tax1.pos+",0)");
	//update planes
	var pls=[], left=this.planes[ords[1]]?true:false,
	right=this.planes[ords[0]-1]?true:false;
	var thdl0=this.handlers[2*ords[0]];
	var thdl1=this.handlers[2*ords[1]];
	this.handlers[2*ords[0]]=thdl1;
	this.handlers[2*ords[1]]=thdl0;

	var plord=[-1,-1,-1,-1], tords=[];
	pl=this.planes[ords[0]];
	pl.renew(0, tax1.aname, dim1, null);
	plord[0]=pl.ord;
	if(right){
		pl=this.planes[ords[0]-1];
		pl.renew(1, tax1.aname, dim1, this.axes[ords[0]-1]);
		plord[1]=pl.ord;
	}
	pl=this.planes[ords[1]-1];
	pl.renew(1, tax0.aname, dim0, this.axes[ords[1]-1]);
	if(pl.ord!=plord[0] && pl.ord!=plord[1])
		plord[2]=pl.ord;
	if(left){
		pl=this.planes[ords[1]];
		pl.renew(0, tax0.aname, dim0, null);
		if(pl.ord!=plord[0] && pl.ord!=plord[1])
			plord[3]=pl.ord;
	}
	for(var i=0;i<4;i++)
		if(plord[i]>=0)
			tords.push(plord[i]);
	this.changePlane(tords, 3);
}

function findAxis(aname){
	var ind=-1;
	for(var i=0;i<this.axes.length;i++)
		if(this.axes[i].aname==aname)
		{
			ind=i;
			break;
		}
	return ind;
}

function findHandler(o, hname, isObj){
	var ind=isObj?undefined:-1, array=this.handlers[o];
	for(var i=0;i<array.length;i++)
		if(array[i].hname==hname)
		{
			if(isObj)
				ind=array[i];
			else
				ind=i;
			break;
		}
	return ind;	
}

function delHdl(o, hname){
	var ord=this.findHdl(o,hname,false);
	if(ord>=0)
		this.handlers[o].splice(ord,1);
}

//Methods for axis
function initAxis(){
	var o=dataSet.dims[this.ord];//The initial order of dimensions is fixed here
	var s=d3.scale.linear().domain(o.range).range(dataScale.range());
	this.aname=o.dname;
	this.aaxis=d3.svg.axis().scale(s).orient("left").ticks(0);
	var tdist=[];
	$.each(o.dist, function(id, d) {
		tdist[id]=s(d);
	});
	this.dist=tdist;
}

function showAxis(){
	var r=this.aaxis.scale().domain();
	var ax_name=this.aname;
	var g=svg.append("g")
	.attr("class","axis")
	.attr("id",this.aname)
	.attr("transform","translate("+this.pos+",0)");
	g.call(this.aaxis);
	g.append("text")
	.attr("class","ax_max")
	.attr("x",-18)
	.attr("y",max_pos)
	.text(r[1].toFixed(prec));
	g.append("text")
	.attr("class","ax_min")
	.attr("x",-18)
	.attr("y",min_pos)
	.text(r[0].toFixed(prec));
	var t=$(".axis path:first").attr("d");
	var top=parseFloat(t.slice(t.indexOf(",")+1,t.indexOf("H")))-4;
	t=t.substring(t.indexOf("H")+1,t.length);
	var btm=parseFloat(t.slice(t.indexOf("V")+1,t.indexOf("H")))+4;
	g.append("rect")
	.attr("x",-ax_div*ax_scale)
	.attr("y",top)
	.attr("width",ax_div*2*ax_scale)
	.attr("height",btm-top)
	.attr("stroke-dasharray","6,6")
	.attr("fill","none")
	.attr("stroke","#555")
	.attr("stroke-width",1)
	.attr("stroke-opacity",0)
	.attr("class","ax_frame");
	var hdl=g.append("g")
	.attr("class","handler_"+this.aname);
	hdl.append("text")
	.attr("class","ax_title")
	.attr("x",-this.aname.length*3.3)
	.attr("y",title_pos)
	.text(this.aname.replace(RegExp("_","g"), " "));
	hdl.append("circle")
	.attr("class","handler hdl_on")
	.attr("id",this.aname)
	.attr("cx",0)
	.attr("cy",hdl_pos)
	.attr("r",elp_r[0]);
}

//Methods for handler
function copyHdl(xPos){
	var a=this.hname.replace(/_/g, " ");
	var hdl=svg.append("g")
	.attr("class","temporaryHdl")
	.attr("transform","translate("+xPos+",0)")
	.on("click",function(){
		var o=d3.select(this);
		if(o.classed("hdl_remove") || o.classed("hdl_mistake")){
			o.classed("hdl_mistake",false);
			return;
		}
		else{
			o=o.select(".handler");
			if(o.classed("hdl_on")){
				o.classed("hdl_on", false);
			}
			else{
				o.classed("hdl_on", true);
			}
			return;
		}
	});
	hdl.append("text")
	.attr("class","ax_title")
	.attr("x",-a.length*3.3)
	.attr("y",title_pos)
	.text(a);
	hdl.append("circle")
	.attr("class","handler hdl_on mdl_handler")
	.attr("id",this.hname)
	.attr("cx",0)
	.attr("cy",hdl_pos)
	.attr("r",elp_r[0]);
}

//Methods for plane
function initPlane(){
	var lo=dataSet.findDim(this.dims[0]), ro=dataSet.findDim(this.dims[1]);//The initial order of dimensions is fixed here
	var l=dataSet.dims[lo], r=dataSet.dims[ro];
	this.scales[0]=d3.scale.linear().range(dataScale.range()).domain([0,1]);
	this.scales[1]=d3.scale.linear().range([0,this.width]).domain([0,1]);
	this.dscales[0]=d3.scale.linear().range([0,1]).domain(l.range);
	this.dscales[1]=d3.scale.linear().range([0,1]).domain(r.range);
	var tpoints=[], v=this.dscales[0], h=this.dscales[1];
	$.each(l.dist, function(id, d) {
		tpoints[id]=[h(r.dist[id]), v(d)];
	});
	var mds=createMDS();
	for(var i=0;i<l.dist.length;i++){
		mds.disMat[i]=[];
		mds.scrMat[i]=[];
		mds.relMat[i]=[];
		for(var j=0;j<r.dist.length;j++){
			mds.disMat[i][j]=l.disMat[i][j]+r.disMat[i][j];
		}
	}
	this.MDS=mds;
	this.points=tpoints;
}

function showPlane(){	
	var g=svg.insert("g",".axis")
	.attr("class","plane")
	.attr("id",this.dims[0]+"_"+this.dims[1])
	.attr("transform","translate("+this.pos+",0)");
	var div=this.div;
	var s=this.scales;
	var r=dataScale.range(), tinfos=dataSet.infos;
	g.append("rect")
	.attr("x",-ax_div)
	.attr("y",r[1]-4)
	.attr("width",this.width+2*ax_div)
	.attr("height",r[0]-r[1]+8)
	.attr("fill","#FFF")
	.attr("fill-opacity",0)
	.attr("stroke","none")
	.attr("class","pl_plane");
	g.append("rect")
	.attr("x",-ax_div*(1-ax_scale))
	.attr("y",r[1]-4)
	.attr("width",this.width+2*ax_div*(1-ax_scale))
	.attr("height",r[0]-r[1]+8)
	.attr("fill","none")
	.attr("stroke-dasharray","6,6")
	.attr("stroke","#555")
	.attr("stroke-width",1)
	.attr("stroke-opacity",0)
	.attr("class","pl_frame");
	$.each(this.points, function(id, d) {
		g.append("circle")
		.attr("cx",-div*1.02)
		.attr("cy",s[0](d[1]))
		.attr("r",cir_r)
		.attr("opacity",0)
		.attr("class", "point point_"+id+" sel"+id)
		.on("mouseover",function(){
			$(".point.sel"+id).attr("r",2*cir_r); 
			d3.selectAll("path.sel"+id)
			.classed("deep",true);})
		.on("mouseout",function(){
			$(".point.sel"+id).attr("r",cir_r); 
			d3.selectAll("path.sel"+id)
			.classed("deep",false);})
		.append("title")
		.text(tinfos[id]);
	});
}

function togglePlane(){
	if(this.sign){
		this.sign=false;
		d3.selectAll("#"+this.dims[0]+"_"+this.dims[1]+" .point")
		.transition()
		.ease("linear")
		.duration(aniTime)
		.attr("cx",-this.div*1.02)
		.attr("opacity",0);
		d3.select("#"+this.dims[0]+"_"+this.dims[1]+" .pl_plane")
		.transition()
		.duration(aniTime)
		.attr("fill-opacity", 0);
	}
	else{
		this.sign=true;
		var tdims=this.dims;
		var s=this.scales;
			d3.selectAll("#"+tdims[0]+"_"+tdims[1]+" .point")
			.data(this.points)
			.transition()
			.ease("linear")
			.duration(aniTime)
			.attr("cx",function(d){return s[1](d[0]);})
			.attr("opacity",1);
			d3.select("#"+this.dims[0]+"_"+this.dims[1]+" .pl_plane")
			.transition()
			.duration(aniTime)
			.attr("fill-opacity", pl_opc);
	}
	return this.sign;
}

function updatePlane(dname, dir){
	if(dir){
		this.dims.push(dname);
		var o=dataSet.dims[dataSet.findDim(dname)].disMat;
		for(var i=0;i<this.points.length;i++)
			for(var j=0;j<this.points.length;j++){
				this.MDS.disMat[i][j]+=o[i][j];
			}
	}
	else{
		this.delDim(dname);
		var o=dataSet.dims[dataSet.findDim(dname)].disMat;
		for(var i=0;i<this.points.length;i++)
			for(var j=0;j<this.points.length;j++){
				this.MDS.disMat[i][j]-=o[i][j];
			}
	}
	//Normalize
	var min=[], max=[];
	$.each(this.MDS.disMat, function(id, d) {
		var m=d3.extent(d);
		min.push(m[0]);
		max.push(m[1]);
	});
	var s=d3.scale.linear().range([0,1]).domain([d3.min(min),d3.max(max)]);
	var tscr=this.MDS.scrMat;
	$.each(this.MDS.disMat, function(id_a, a) {
		$.each(a, function(id_b, b) {
			tscr[id_a][id_b]=s(b);
		});
	});
}

function newPlane(ord, aname, dim, bAxis){//ord:0 for left & 1 for right
	var mds=this.MDS, div=this.div, sign=this.sign;
	clearInterval(mds.timer);
	var told=this.dims[0]+"_"+this.dims[1];
	this.dims=this.dims.slice(0,2);
	this.dims[ord]=aname;
	var tnew=this.dims[0]+"_"+this.dims[1];
	$("#"+told).attr("id",tnew);
	var s=this.dscales[ord], ts=this.scales;
	s.domain(dim.range);
	if(ord==1){
		var tdist=bAxis.dist;
		var as=bAxis.aaxis.scale();
		as=d3.scale.linear().domain(as.range()).range([0,1]);
		$.each(this.points, function(id, d) {
			d[0]=s(dim.dist[id]);
			d[1]=as(tdist[id]);
		});
	}
	else{
		$.each(this.points, function(id, d) {
			d[1]=s(dim.dist[id]);
		});		
	}
	this.sign=false;
	var tdim=dataSet.dims[dataSet.findDim(this.dims[1-ord])];
	for(var i=0;i<dim.dist.length;i++){
		for(var j=0;j<tdim.dist.length;j++){
			mds.disMat[i][j]=dim.disMat[i][j]+tdim.disMat[i][j];
		}
	}
}

function MDSTrans(o){
	var fAll=0, sign=false;
	if(o.dims.length==2)
		sign=true;
	if(!sign){		
		var lo=dataSet.findDim(o.dims[0]), ro=dataSet.findDim(o.dims[1]);//The initial order of dimensions is fixed here
		var l=dataSet.dims[lo], r=dataSet.dims[ro];
		for(var i=0;i<o.points.length;i++){
			o.MDS.relMat[i][i]=[0,0];
			for(var j=i+1;j<o.points.length;j++){
				var tx=o.points[i][0]-o.points[j][0];
				var ty=o.points[i][1]-o.points[j][1];
				var t=Math.sqrt(tx*tx+ty*ty);
				var f=(t*t-o.MDS.scrMat[i][j])/300;
				fAll+=Math.abs(f);
				if(t!=0){
					o.MDS.relMat[i][j]=[-f*tx/t,-f*ty/t];
					o.MDS.relMat[j][i]=[f*tx/t,f*ty/t];						
				}
				else{
					var ang=Math.random();
					var tang=Math.sqrt(1-ang*ang);
					o.MDS.relMat[i][j]=[-f*ang,-f*tang];
					o.MDS.relMat[j][i]=[f*ang,f*tang];
				}
			}
		}
		for(var i=0;i<o.points.length;i++){
			var fx=0, fy=0;
			for(var j=0;j<o.points.length;j++){
				fx+=o.MDS.relMat[i][j][0];
				fy+=o.MDS.relMat[i][j][1];
			}
			o.points[i][0]+=fx;//-(o.points[i][0]-o.dscales[1](r.dist[i]))/10;
			o.points[i][1]+=fy;//-(o.points[i][1]-o.dscales[0](l.dist[i]))/10;
		}
	}
	else{
		var lo=dataSet.findDim(o.dims[0]), ro=dataSet.findDim(o.dims[1]);//The initial order of dimensions is fixed here
		var l=dataSet.dims[lo], r=dataSet.dims[ro];
		for(var i=0;i<o.points.length;i++){
			var fx=(o.points[i][0]-o.dscales[1](r.dist[i]))/5;
			var fy=(o.points[i][1]-o.dscales[0](l.dist[i]))/5;
			fAll+=Math.abs(fx+fy);
			o.points[i][0]-=fx;
			o.points[i][1]-=fy;
		}
	}
	dataSet.canvas.changePlane(o.ord, 2);
	return fAll;
}

function existDim(dname){
	var ind=-1;
	for(var i=0;i<this.dims.length;i++)
		if(this.dims[i]==dname)
		{
			ind=i;
			break;
		}
	return ind;
}

function delDim(dname){
	var ord=this.existDim(dname);
	this.dims.splice(ord,1);
	return ord;
}

//Methods for line
function initLine(){
	var o=dataSet.canvas.axes;
	this.slopes=[];
	this.points=[];
	this.path=[];
	for(var i=0;i<o.length-1;i++){
		var p=[o[i].pos, o[i].dist[this.id]];
		this.points.push(p);
		this.points.push(p);
		var sl=(o[i+1].dist[this.id]-o[i].dist[this.id])/(o[i+1].pos-o[i].pos);
		this.slopes.push([sl,sl,sl]);
	}
	var p=[o[o.length-1].pos,o[o.length-1].dist[this.id]];
	this.points.push(p);
}

function showLine(signs, ords){
	var g=svg.insert("g", ".plane")
	.attr("class","line");
	this.change(signs, ords, false);
	var ord=this.id;
	$.each(this.path, function(id, d) {
		g.append("path")
		.attr("class","curve sel"+ord+" pl"+id)
		.attr("stroke","#000000")
		.attr("d", d);
	});
}

function changeLine(signs, ords, middle){
	var p="";
	for(var i=0;i<signs.length;i++){
		var s=signs[i];
		var id=ords[i];
		var o=dataSet.canvas.planes[id]
		if(!s){
			this.slopes[id][0]=this.slopes[id][1];
			this.slopes[id][2]=this.slopes[id][1];
		}
		else{
			if(i!=0)
				this.slopes[id][0]=this.slopes[id-1][2];
			if(i!=signs.length-1)
				if(signs[i+1])
					this.slopes[id][2]=(this.slopes[id][1]+this.slopes[id+1][1])/2;
				else
					this.slopes[id][2]=this.slopes[id+1][1];
		}
		if(middle)
			this.points[2*id+1]=[o.scales[1](o.points[this.id][0])+o.pos, o.scales[0](o.points[this.id][1])];
		this.path[id]=getLine(this.slopes[id], this.points.slice(2*id,2*id+3), s);
	}
}

function getLine(slope, points, expend){
	var p="", w=points[2][0]-points[0][0];
	if(!expend){
		p="M"+points[0][0]+","+points[0][1];
		for(var i=0;i<2;i++){			
			p+=" C"+points[i][0]+","+points[i][1];
			p+=" "+points[i+1][0]+","+points[i+1][1];
			p+=" "+points[i+1][0]+","+points[i+1][1];
		}
	}else{		
		p+="M"+points[0][0]+","+points[0][1];
		for(var i=0;i<2;i++){			
			p+=" C"+(points[i][0]+w*ax_slp)+","+(points[i][1]+slope[i]*w*ax_slp);
			p+=" "+(points[i+1][0]-w*ax_slp)+","+(points[i+1][1]-slope[i+1]*w*ax_slp);
			p+=" "+points[i+1][0]+","+points[i+1][1];
		}
	}
	return p;
}