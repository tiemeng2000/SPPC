var Cov,ScData,Eigens=[],EVec,ObjCov,Sqrt=Math.sqrt;

function InitCov(){	
	//求总协方差矩阵
	var temp=[],tMean=[],sc=[],wt=[];
	for(var i=0;i<num;i++)
		temp.push(1);
	temp=$M(temp);
	for(var i=0;i<dim;i++){
			tMean.push(Mean[i]);
			sc.push(ObjData.row(i+1).elements);
	}
	ScData=$M(sc).transpose();
	tMean=ScData.subtract( temp.x($M(tMean).transpose()) );
	ObjCov=tMean.transpose().x(tMean).elements;
}

function getMDS(j){
	getCov(j);
	getEig(j);
}

function getCov(j){
	//求协方差子矩阵
	var selD=[],wt=[],sc=[],tData=IntData[j];
	SelN=0;
	tData.sel.forEach(function(d,i){
								if(d){
									selD.push(i);
									wt.push(tData.weight[i]);
									sc.push(ObjData.row(i+1).elements);
									SelN++;
								}
							});
	Cov=Matrix.Zero(SelN,SelN).elements;
	ScData=$M(sc).transpose();
	for(var i=0;i<SelN;i++)
		for(var k=0;k<SelN;k++)
			Cov[i][k]=ObjCov[selD[i]][selD[k]]*wt[i]*wt[k];
	Cov=$M(Cov);
}

function getEig(j){
	//PCA，求出特征值，找到最大的两个维度作为投影平面
	Eigens=[];
	EVec=Matrix.Zero(SelN,SelN).elements;
	householder(Cov.elements,SelN,EVec,Eigens);
	qr(SelN,Eigens,EVec);//返回所有特征值与归一化后的特征向量
	EVec=($M(EVec).transpose()).elements;
	var TVec=[],Trans=[],sign,t;
	EVec.forEach(function(d,i){
		if(d[0]<0 || (d[0]==0 && d[1]<0))
			sign=-1;
		else
			sign=1;
		d.forEach(function(t,j){d[j]=+sign*t.toFixed(6);});
		TVec.push(new EigVec(Eigens[i],d));
		});
	EVec=TVec.sort(function(a,b){return Math.abs(b.Eig)-Math.abs(a.Eig)});//特征值按模排序
	EVec.forEach(function(d){Trans.push(d.Vec)});
	ScData=ScData.x($M(Trans).transpose());//作降维投影
	ScData=ScData.minor(1,1,num,2);
	Skew(j);
	//IntData[j].Scdata=ScData.elements;
	//IntData[j].Stdata=ScData.dup().elements;
}

function Skew(j){
	var xDo=d3.extent(ScData.col(1).elements),yDo=d3.extent(ScData.col(2).elements);
	var xRa=[AxPad,AxScale(j+1)-AxScale(j)-AxPad],yRa=[hei-TxPad,TxPad];
	var ap=d3.scale.linear().domain(xDo).range([0,1]);
	var an=d3.scale.linear().domain(xDo).range([1,0]);
	var bp=d3.scale.linear().domain(yDo).range([0,1]);
	var bn=d3.scale.linear().domain(yDo).range([1,0]);
	var xs=IntData[j].XScale;
	var ys=IntData[j].YScale;
	var sc=ScData.elements,it=IntData[j].Scdata;
	var x=[ap,an],y=[bp,bn],sum=[0,0,0,0,0,0,0,0],tMin,tOrd,tSig;
	if(xs.range()[0]>xs.range()[1])
		xs.range([1,0]);
	else
		xs.range([0,1]);
	if(ys.range()[0]>ys.range()[1])
		ys.range([1,0]);
	else
		ys.range([0,1]);
	
	it.forEach(function(d,s){
						var t=sc[s];
						var p=[xs(d[1]),ys(d[0])];
						for(var i=0;i<2;i++)
							for(var k=0;k<2;k++){
								sum[2*i+k]+=dst([x[i](t[0]),y[k](t[1])],p);
								sum[4+2*i+k]+=dst([y[i](t[1]),x[k](t[0])],p);	
							}
						});
	for(var i=1,tOrd=0,tMin=sum[0];i<8;i++)
		if(sum[i]<tMin){
		tMin=sum[i];
		tOrd=i;
	}
	console.log(sum);
	console.log(tOrd);
	var tx,ty;
	if(tOrd>3){	tOrd-=4;tSig=true;tx=y,ty=x;}
	else {tSig=false;tx=x,ty=y;}//tSig[2]:true则x-a,y-b，false则y-a,x-b
	IntData[j].XScale=tOrd>1?tx[1].range([xRa[1],xRa[0]]):tx[0].range([xRa[0],xRa[1]]);
	if(tOrd>1) tOrd-=2;
	IntData[j].YScale=tOrd>0?ty[1].range([yRa[1],yRa[0]]):ty[0].range([yRa[0],yRa[1]]);
	it.forEach(function(d,s){
						var t=sc[s];
						if(tSig){
							d[0]=t[0];
							d[1]=t[1];//注意在Scdata中，坐标为[y,x]
						}
						else{
							d[1]=t[0];
							d[0]=t[1];
						}
						});
}

function dst(a,b){
	return Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]);
	//return Sqrt((a[0]-b[0])*(a[0]-b[0])+(a[1]-b[1])*(a[1]-b[1]));
}

function EigVec(Eig,Vec){
	this.Eig=Eig;
	this.Vec=Vec;
}// JavaScript Document