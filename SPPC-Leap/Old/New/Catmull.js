var Cmull=[],Count=20;

function Catmull(sa,xa,ya,sb,xb,yb,TDim){

var intvl=(xb-xa)/Count;
var x=xa,str="";
str+=xScale[TDim](xa).toFixed(1)+","+yScale[TDim](ya).toFixed(1)+" ";
getC(sa,0,ya,sb,xb-xa,yb);
for(var loc=0;loc<Count;loc++){
	x+=intvl;
	str+=xScale[TDim](x).toFixed(1)+","+yScale[TDim](getY(x-xa)).toFixed(1)+" ";
	}
	return str;
}//����Catmull����,����sa��(xa,ya)�ֱ�Ϊ����б�ʺ����꣬�յ㶨����ͬ����ע������ĺ���������Ե����꣬��������Ϊ0
//TDimָ���ǵ�ǰ���Ƶ�interval�������

function getC(sa,xa,ya,sb,xb,yb){
Cmull[3]=(sa+sb-2*(yb-ya)/(xb-xa))/Math.pow((xb-xa),2);
Cmull[2]=(sb-sa)*0.5/(xb-xa)-1.5*Cmull[3]*(xa+xb);
Cmull[1]=sa-2*Cmull[2]*xa-3*Cmull[3]*xa*xa;
Cmull[0]=ya-Cmull[1]*xa-Cmull[2]*xa*xa-Cmull[3]*xa*xa*xa;
}//������Catmulll����,����sa��(xa,ya)�ֱ�Ϊ����б�ʺ����꣬�յ㶨����ͬ����ע������ĺ���������Ե����꣬��������Ϊ0

function getY(x){
return Cmull[0]+Cmull[1]*x+Cmull[2]*x*x+Cmull[3]*Math.pow(x,3);
}//��Catmull���ߵ�����