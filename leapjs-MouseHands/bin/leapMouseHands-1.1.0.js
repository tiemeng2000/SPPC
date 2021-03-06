/*
 * 2015-11-21
 *
 * 增加：1、创建LeapG类，将leapG的事件与DOM事件分开
 *      2、
        
 * 改变：
 */

(function($){
    'use strict';   //严格模式

    //创建LeapG命名空间
    $.LeapG = {};
    
    //定义Controller类
    $.LeapG.Controller = function(){

        //属性
        this.leapController = null;  //LeapMotion控制器
        //this.g_positions = {};
        this.pointers = {};
        //this.pinchEle = {};

        //私有方法：初始化
        this._initialize = function () {

            //创建leapMotion controller对象
            var controller = !this.leapController;
            if (controller){
                this.leapController = new Leap.Controller({enableGestures:true});
            }
            
            //绑定frame侦听器
            this._bindFrameListener();   

            //LeapMotion控制器connect
            if(controller){
                $("body").focus();
                this.leapController.connect();  
            }        
        }
        
        //私有方法：绑定frame侦听器
        this._bindFrameListener = function(){

            //绑定onConnect响应函数
            this.leapController.on("connect", this.onConnect.bind(this));

            //绑定onFrame响应函数
            this.leapController.on("frame", this.onFrame.bind(this));
        }

        //方法：LeapMotion连入时事件响应函数      
        this.onConnect = function(){
            //提示 "Connect Succeed!" 在控制台
            console.log("LeapMotion Device Connect Succeed!");
        }

        //方法：frame数据响应函数
        this.onFrame = function (frame){
            var pointer = null;
            var pointers = this.pointers;

            frame.hands.forEach(function (hand, index){
                pointer = ( pointers[index] || (pointers[index]=new $.LeapG.Pointer()) );

                pointer.bindPointerToHand(index);
                var framePos = $.LeapG.leapToScene(hand, frame);
                if(framePos === null){
                    console.log("framePos为空");
                    return;
                }
                pointer.updatePosition(framePos);
                pointer.handEventTrigger(hand);     //hand事件触发
            });
        }
        
        //执行初始化
        this._initialize();      
    };


    //定义Pointer类
    $.LeapG.Pointer = function (){

        //属性
        this.cursor = null;
        this.currX = null;
        this.currY = null;
        this.prevX = null;
        this.prevY = null;
        this.index = null;

        this.currPos = [this.currX, this.currY];
        this.prevPos = [this.prevX, this.prevY];

        this.is_hand_pinching = false;
        this.is_hand_waving = false;

        //初始化pointer
        this._init = function(){
            var no_cursor = !this.cursor;
            if(no_cursor){
                this._createCursor();    //创建cursor
            }

            //绑定事件
            this._bindPointerEvent();

            //添加pointer
            if(true){
                this.addPointer();
            }         
        }

        //私有方法：创建cursor函数
        this._createCursor = function(){
            this.cursor = $("<span>");  //创建cursor元素
            this.cursor.css({           //细化cursor样式
                display: 'block',
                background: '#000',
                borderRadius: '5px',
                width: '8px',
                height: '8px',
                position: 'absolute',
                zIndex: 255,
            });
        }  

        //方法：在页面上添加pointer
        this.addPointer = function (){
            this.cursor.appendTo($("body"));
            this.cursor.trigger("POINTER_ADDED");
        } 

        //方法：更新pointer坐标,并触发POINTER_MOVE事件
        this.updatePosition = function(framePos){
            this.prevX = this.currX;
            this.prevY = this.currY;
            this.currX = framePos[0];
            this.currY = framePos[1];

            this.cursor.css({
                top: (this.currY - 5) + 'px',
                left: (this.currX - 5) + 'px',                    
            });
            this.cursor.trigger("POINTER_MOVE");
        }

        //方法：关联pointer和hand
        this.bindPointerToHand = function(index){
            this.index = index;
        }

        //私有方法：绑定pointer事件
        this._bindPointerEvent = function (){
            this.cursor.on("POINTER_ADDED", this.onPointerAdded.bind(this));  
            this.cursor.on("POINTER_DELETED", this.onPointerDeleted.bind(this));
            this.cursor.on("POINTER_MOVE", this.onPointerMove.bind(this));
            this.cursor.on("POINTER_ENTER", this.onPointerEnter.bind(this));
            this.cursor.on("POINTER_LEAVE", this.onPointerLeave.bind(this));
            this.cursor.on("POINTER_HOVER", this.onPointerHover.bind(this));

            this.cursor.on("HAND_PINCH", this.onHandPinch.bind(this));
            this.cursor.on("HAND_UNPINCH", this.onHandUnpinch.bind(this));
        }

        //函数：hand动作判断
        this.handEventTrigger = function (hand){
            this.handPinchCheck(hand);  //pinch
        }

        //函数：pinch事件、unPinch事件 
        this.handPinchCheck = function(hand){
            var pinchThreshold = 40;
            var tipDist = $.LeapG.distanceOfThumbIndex(hand);
            if( (tipDist<pinchThreshold) && (this.is_hand_pinching===false) ){
                this.cursor.trigger("HAND_PINCH");
                this.is_hand_pinching = true;
            }
            else if( (tipDist>=pinchThreshold) && (this.is_hand_pinching===true) ){
                this.cursor.trigger("HAND_UNPINCH")
                this.is_hand_pinching = false;
            }
        }

        //DOM元素事件触发
        this.triggerDOMEvent = function(event_name){
            //创建DOM事件
            var e = $.Event(event_name);
            e.pageX = (this.currPos === null) ? 0 : this.currX;
            e.pageY = (this.currPos === null) ? 0 : this.currY;
            //获取Pointer位置dom元素
            this.cursor.hide();
            var element = document.elementFromPoint(e.pageX, e.pageY);
            this.cursor.show();
            //在element上触发事件e
            $(element).trigger(e);
 

            // var evt = document.createEvent('CustomEvent');
            // evt.initCustomEvent(event_name, false, true, null);
            // element.dispatchEvent(evt);
            if ($(element).prop("nodeName")!="BODY") {
                console.log($(element).prop("nodeName"));
            }

            return element;
        }


        //响应函数：onPointerAdded
        this.onPointerAdded = function (){
            console.log("Pointer Added");
        }    

        //响应函数：onPointerDeleted
        this.onPointerDeleted = function (){
            console.log("Pointer Deleted");
        }

        //响应函数：onPointerMove
        this.onPointerMove = function (){
            this.cursor.trigger("POINTER_HOVER");
            // var dispatch = d3.dispatch("mousemove");
            // dispatch.on("mousemove.svg", function(){console.log("dispatch succeed!");});
            // dispatch.mousemove();
            return this.triggerDOMEvent("mousemove");
            //return this.triggerDOMEvent("test");
        }

        //响应函数：onPointerEnter
        this.onPointerEnter = function (){
            return this.triggerDOMEvent("mouseenter");
        }

        //响应函数：onPointerLeave
        this.onPointerLeave = function (){
            var e = $.Event("mouseleave");
            e.pageX = (this.prevPos === null) ? 0 : this.prevX;
            e.pageY = (this.prevPos === null) ? 0 : this.prevY;
            this.cursor.hide();
            var element = document.elementFromPoint(e.pageX, e.pageY);
            this.cursor.show();
            $(element).trigger(e);
            return element;
        }

        //响应函数：onPointerHover
        this.onPointerHover = function (){
            //创建DOM事件
            var e_mouseenter = $.Event("mouseenter");
            var e_mouseleave = $.Event("mouseleave");
            
            //获取pointer当前位置的上下文位置
            var currX = (this.currPos === null) ? 0 : this.currX;
            var currY = (this.currPos === null) ? 0 : this.currY;
            var prevX = (this.prevPos === null) ? 0 : this.prevX;
            var prevY = (this.prevPos === null) ? 0 : this.prevY;

            //获取Pointer位置上下文元素
            this.cursor.hide();
            var eleCurr = document.elementFromPoint(currX, currY);
            var elePrev = document.elementFromPoint(prevX, prevY);
            this.cursor.show();

            //当前元素和前一元素不一致时，说明分别发生pointer的enter和leave
            if( eleCurr != elePrev ){
                //$(eleCurr).trigger(e_mouseenter);   //当前元素触发mouseenter事件
                this.cursor.trigger("POINTER_ENTER");
                //$(elePrev).trigger(e_mouseleave);   //前一元素触发mouseleave事件
                this.cursor.trigger("POINTER_LEAVE");
            }
            else if ( eleCurr === elePrev ){
                $(eleCurr).trigger("hover");

            }
            return eleCurr;
        }

        //响应函数：onHandPinch
        this.onHandPinch = function(){
            console.log("pointer:handpinch");
            return this.triggerDOMEvent("handpinch");
        }

        //响应函数：onHandUnpinch
        this.onHandUnpinch = function(){
            console.log("pointer:handunpinch");
            return this.triggerDOMEvent("handunpinch");
        }
        //响应函数：onHandWave
        this.onHandWave = function(){}



        //执行初始化
        this._init();
    };
    

    //工具函数：Hands的屏幕位置计算
    $.LeapG.leapToScene = function (hand, frame){
        //获取拇指对象及关节位置
        var pipThumb = hand.fingers[0].pipPosition;     //拇指
        var xThumb = pipThumb[0];  //拇指pip关节position
        var yThumb = pipThumb[1];
        var zThumb = pipThumb[2];
        
        //获取食指对象及关节位置
        var finger_Index = hand.fingers[1];         //食指对象
        var xIndex = finger_Index.mcpPosition[0];   //食指mcp关节position
        var yIndex = finger_Index.mcpPosition[1];
        var zIndex = finger_Index.dipPosition[2];   //食指根部dip关节positoin

        //指尖位置xy取拇指，z去食指
        var tipx = xThumb; //用大拇指finger[0]的x坐标作为cursor的x
        var tipy = yThumb; //用大拇指finger[0]的Y坐标作为cursor的y
        var tipz = zIndex;

        //归一化指尖位置
        var tip  = [tipx, tipy, tipz];          //未归一化的位置
        var ibox = frame.interactionBox;
        var npos = ibox.normalizePoint(tip);    //归一化位置
        var w = $(window).width();
        var h = $(window).height();

        //tip在屏幕上的位置
        var x = w * npos[0];
        var y = h * (1 - npos[1]);

        //g位置越界的处理
        if ( (x < 0)||(x > w) || (y < 0)||(y > h) ) {
            return null;
        }            

        //返回位置坐标
        return [x, y];                    
    }


    //工具函数：拇指食指指尖距离计算
    $.LeapG.distanceOfThumbIndex = function (hand)
    {
        var d = 0;  //指尖距离

        var dipThumb = hand.fingers[0].dipPosition;     //拇指dip关节position
        var tipThumb = dipThumb;                        //拇指指尖选用dip关节位置
        var xThumb = tipThumb[0];       //拇指指尖x分量
        var yThumb = tipThumb[1];
        var zThumb = tipThumb[2];
        
        var dipIndex = hand.fingers[1].dipPosition;     //食指dip关节position
        var tipIndex = dipIndex;                        //拇指指尖选用dip关节位置
        var xIndex = tipIndex[0];       //食指指尖x分量
        var yIndex = tipIndex[1];
        var zIndex = tipIndex[2];       

        d = Math.sqrt( Math.pow((xThumb-xIndex),2) + Math.pow((yThumb-yIndex),2) ); //计算指尖距离
        //console.log("d: ",d);
        return d;   //返回指尖距离
    }

})(jQuery);