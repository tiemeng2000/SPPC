var dim,num,Rdy=false;
var Max=[],Min=[],Mean=[];
var data=[],title=[];
var ObjData,Scale=[];
var IsNum=[];
var DimSel=[],SelN;

function getData(){
	//读取数据
	var dataText;
	d3.xhr("data.csv",function(dt){
		d3.csv.parseRows(dt.responseText,
					 function(d,i){
						if(i==0){
							var ti;
							d.forEach(function(di){
									if(di.indexOf("(Y)")>0){
										ti=di.indexOf("(Y)");
										IsNum.push(true);
									}
									else{
										ti=di.indexOf("(N)");
										IsNum.push(false);
									}
								title.push(di.slice(0,ti));
								});
						}
						else{
							d.forEach(function(di,j){if(IsNum[j]) d[j]=+di;});
							data.push(d);
						}
				});//PareseOver
	StatData();
	InitCov();
});
};

function StatData(){
	//统计数据
	var TransData=$M(data).transpose().elements;
	TransData.forEach(function (d,i){
			var Extent,t;
			if(IsNum[i]){
				Extent=d3.extent(d);
				Scale.push(d3.scale.linear().domain(Extent).range([0,1]));
				Mean.push(Scale[i](d3.mean(d)));
			}
			else{
				var tOrd=[],rg=[];
				t=d3.nest().key(function(dt){return dt;}).entries(d);
				if(!isNaN(+t[0].key))
				t.sort(function(a,b){return +a.key-+b.key;});
				t.forEach(function(dt,i){rg.push(i/(t.length-1)); tOrd.push(dt.key);});
				Extent=[tOrd[0],tOrd[tOrd.length-1]];
				Scale.push(d3.scale.ordinal().domain(tOrd).range(rg));
				Mean.push(Scale[i](tOrd.sort(d3.ascending)[~~(tOrd.length/2)]));//找到中间元素的值
			}
			Max.push(Extent[1]);
			Min.push(Extent[0]);
			DimSel.push(true);
			d.forEach(function(td,j){d[j]=Scale[i](td);});
	});
	ObjData=$M(TransData);
	dim=ObjData.rows();
	num=ObjData.cols();
	Rdy=true;
};