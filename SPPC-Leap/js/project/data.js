//Methods for tDataSet
function readData(file, type){
	var dimCount=0, tdims=[], titles=[], dists=[], scales=[], tinfos=[];
	if(type){
		var length=getLength(file);
		d3.csv.parse(file, function(d, id){
			if(id==0){
				for(var tDim in d){//Count all the dimensions
					var tdist=[];
					dimCount++;
					titles.push(tDim);
					dists.push(tdist);
				}
				tDataSet.dimNum=dimCount;
				if(dimCount==1){
					tDataSet.illegal=true;
					tDataSet.ready=true;
					return;
				}
				length=~~((length-dimCount)/(dimCount-1)+0.5);//Get data length
			}
			//Store the data by dimension
			var ttext="ID: "+id;
			for(var j=0;j<dimCount;j++){
				var tdata=d[titles[j]];
				dists[j].push(parseFloat(tdata));
				ttext+="\n"+titles[j]+": "+tdata;
			}
			tinfos.push(ttext);
			if(id==length-1){	
				//Create dimensions
				for(var i=0;i<dimCount;i++){
					var r=d3.extent(dists[i]);
					var s=d3.scale.linear().domain(r).range([0,1]);
					tdims.push(createDim(titles[i].replace(/ /g, "_"), r, s, dists[i]));
					tdims[i].init();
				}

				tDataSet.dims=tdims;
				tDataSet.infos=tinfos;
				tDataSet.illegal=false;//How to recognize illegal data?
				tDataSet.ready=true;
			}
		});		
	}
	else{
		d3.csv(file, function(d){
			tDataSet.ready=true;
			if(d.length>0){
				for(var tDim in d[0]){//Count all the dimensions
					var tdist=[];
					dimCount++;
					titles.push(tDim);
					dists.push(tdist);
				}
				//Store the data by dimension
				for(var i=0;i<d.length;i++){
					var ttext="ID: "+i;
					for(var j=0;j<dimCount;j++){
						var tdata=d[i][titles[j]];
						dists[j].push(parseFloat(tdata));
						ttext+="\n"+titles[j]+": "+tdata;
					}
					tinfos.push(ttext);
				}
				//Create dimensions
				for(var i=0;i<dimCount;i++){
					var r=d3.extent(dists[i]);
					var s=d3.scale.linear().domain(r).range([0,1]);
					tdims.push(createDim(titles[i].replace(/ /g, "_"), r, s, dists[i]));
					tdims[i].init();
				}

				tDataSet.dimNum=dimCount;
				tDataSet.dims=tdims;
				tDataSet.infos=tinfos;
				tDataSet.illegal=false;
			}
			else
				tDataSet.illegal=true;
		});		
	}
}

function findDim(dname){
	var ind=-1;
	for(var i=0;i<this.dims.length;i++)
		if(this.dims[i].dname==dname)
		{
			ind=i;
			break;
		}
	return ind;
}

function initMatrix(){
	var s=this.scale;
	var tMat=[], l=this.dist.length;
	for(var i=0;i<l;i++){
		tMat[i]=[];
	}
	for(var i=0;i<l;i++){
		tMat[i][i]=0;
		for(var j=i+1;j<l;j++){
			var t=s(this.dist[i])-s(this.dist[j]);
			tMat[i][j]=t*t;
			tMat[j][i]=tMat[i][j];
		}
	}
	this.disMat=tMat;
}

function getData(){
    var file = document.getElementById("File").files[0];  
    var reader = new FileReader();
    //Read data as text 
    reader.readAsText(file);  
    reader.onload=function(f){
    	tDataSet.contents=this.result;
    	tDataSet.readAll=true;
    	if(tDataSet.illegal){
    		tDataSet.ready=true;
    	}
    }
} 

function getLength(text){
	return text.split(",").length;
}

function clearFile(){
     var file = document.getElementById("File");
	// for IE, Opera, Safari, Chrome
     if (file.outerHTML) {
         file.outerHTML = file.outerHTML;
     } else { // FF(包括3.5)
         file.value = "";
     }
}