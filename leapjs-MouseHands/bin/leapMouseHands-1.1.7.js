/*
 * 2016-02-18 *
 * 增加：1、onGesture中，增加circle和screenTap手势判断
 *      2、HAND_POINTING 和 HAND_UNPOINTING事件，及相关响应函数onHandPointing和onHandUnpointing
 *      3、增加工具函数$.LeapG.distanceOfTipsPalm(hand)
 *      4、中增加this.is_hand_pointing属性
 * 改变：1、更新1.1.6版中onGesture函数中，发生gesture的手指id的错误判断方法
 *      2、改swipe手势触发的事件，从wave变为swipe
 *      3、去掉swip手势中对手指的判断
 *		4、cursor改新样式
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
        this.pointers = []; //pointers数组
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

            //绑定onGesture响应函数
            this.leapController.on("gesture", this.onGesture.bind(this));
        }

        //方法：LeapMotion连入时事件响应函数      
        this.onConnect = function(){
            //提示 "Connect Succeed!" 在控制台
            console.log("LeapMotion Device Connect Succeed!");
        }

        //方法：frame数据响应函数
        this.onFrame = function (frame){

            //声明pointer和pointers内部变量
            var pointers = this.pointers;
            var pointer = null;

            //删除多余pointers
            while(pointers.length > frame.hands.length){
                    pointers.pop().removePointer();
            }

            //
            frame.hands.forEach(function (hand, index){

                pointer = ( pointers[index] || (pointers[index]=new $.LeapG.Pointer()) );
                //pointer = ( pointers[hand.id] || (pointers[hand.id]=new $.LeapG.Pointer()) );

                pointer.bindPointerToHand(index, hand.id);
                var framePos = $.LeapG.leapToScene(hand, frame);
                if(framePos === null){
                    console.log("framePos为空");
                    return;
                }
                pointer.updatePosition(framePos);
                pointer.handEventTrigger(hand);     //hand事件触发

            });


        }

        this.onGesture = function (gesture,hand){
            
            var duration     = gesture.duration;
            var pointableIds = gesture.pointableIds;
            var type         = gesture.type;
            var handId       = gesture.handIds[0];
            var state        = gesture.state;
            var id           = gesture.id;

            //声明pointer和pointers内部变量
            var pointers = this.pointers;
            var pointer = null;

            //找到gesture对应的pointer
            for (var index in pointers){
                if (pointers[index].handId === handId){
                    pointer = pointers[index];
                }
            }

            //circle手势
            if (type === "circle" && state==="start"){
                if(parseInt(pointableIds) === hand.pointables[1].id){
                    pointer.cursor.trigger("HAND_CIRCLE");                
                }
            }

            //swipe手势
            else if (type === "swipe" && state === "stop") {
                //gesture发生的手指id               
                // if( parseInt(pointableIds) === hand.pointables[1].id || 
                //     parseInt(pointableIds) === hand.pointables[2].id ||
                //     parseInt(pointableIds) === hand.pointables[3].id || 
                //     parseInt(pointableIds) === hand.pointables[4].id ){

                    pointer.cursor.trigger("HAND_SWIPE");
                //}
                console.log("swipe gesture captured");
            }

            //keyTap手势
            else if(type === "keyTap"){
                if( parseInt(pointableIds) === hand.pointables[1].id || 
                    parseInt(pointableIds) === hand.pointables[2].id ||
                    parseInt(pointableIds) === hand.pointables[3].id || 
                    parseInt(pointableIds) === hand.pointables[4].id ){
                
                    pointer.cursor.trigger("HAND_TAP_START");
                    pointer.cursor.trigger("HAND_TAP_END");
                }
            }

            //screenTap手势
            else if(type === "screenTap"){
                pointer.cursor.trigger("HAND_SCREENTAP");
            }
        }
        
        //执行初始化 
        this._initialize();      
    };


    //定义Pointer类
    $.LeapG.Pointer = function (){

        //属性
        this.cursor = null;
        this.tips   = null;
        this.currX  = null;
        this.currY  = null;
        this.prevX  = null;
        this.prevY  = null;
        this.index  = null;
        this.handId = null;

        this.currPos = [this.currX, this.currY];
        this.prevPos = [this.prevX, this.prevY];

        this.is_hand_pinching = false;
        this.is_hand_waving = false;
        this.is_hand_pointing = false;

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
                'background-image': 'url(../leapjs-MouseHands/css/cursor_0.1_rhand.png)',
                opacity: '1',
                borderRadius: '0px',
                margin: '0px',
                padding: '0px',
                width: '32px',
                height: '32px',
                position: 'absolute',
                zIndex: 255,
            });
        }  

        //方法：在页面上添加pointer
        this.addPointer = function (){
            this.cursor.appendTo($("body"));
            this.cursor.trigger("POINTER_ADDED");
        } 

        //方法：在页面上删除pointer
        this.removePointer = function(){
            this.cursor.remove();
            this.cursor.trigger("POINTER_DELETED");
            
            
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
        this.bindPointerToHand = function(index, handId){
            this.index = index;
            this.handId = handId;
        }

        //私有方法：绑定pointer事件
        this._bindPointerEvent = function (){
            this.cursor.on("POINTER_ADDED",     this.onPointerAdded.bind(this));  
            this.cursor.on("POINTER_DELETED",   this.onPointerDeleted.bind(this));
            this.cursor.on("POINTER_MOVE",      this.onPointerMove.bind(this));
            this.cursor.on("POINTER_ENTER",     this.onPointerEnter.bind(this));
            this.cursor.on("POINTER_LEAVE",     this.onPointerLeave.bind(this));
            this.cursor.on("POINTER_HOVER",     this.onPointerHover.bind(this));

            this.cursor.on("HAND_PINCH",        this.onHandPinch.bind(this));
            this.cursor.on("HAND_UNPINCH",      this.onHandUnpinch.bind(this));
            this.cursor.on("HAND_POINTING",     this.onHandPointing.bind(this));
            this.cursor.on("HAND_UNPOINTING",   this.onHandUnpointing.bind(this));
            this.cursor.on("HAND_SWIPE",        this.onHandSwipe.bind(this));
            this.cursor.on("HAND_TAP_START",    this.onHandTapStart.bind(this));
            this.cursor.on("HAND_TAP_END",      this.onHandTapEnd.bind(this));
            this.cursor.on("HAND_SCREENTAP",    this.onHandScreenTap.bind(this));
            this.cursor.on("HAND_CIRCLE",       this.onHandCircle.bind(this));
        }

        //函数：hand动作判断
        this.handEventTrigger = function (hand){
            this.handCheck_Pinch(hand);  //pinch
            this.handCheck_Pointing(hand); //pointing
        }

        //函数：触发pinch状态、unPinch状态，及相应事件 
        this.handCheck_Pinch = function(hand){
            // //通过指尖距离触发Pinch状态
            // var pinchThreshold = 50;
            // var tipDist = $.LeapG.distanceOfThumbIndex(hand);
            // if( (tipDist<pinchThreshold) && (this.is_hand_pinching===false) ){
            //     this.cursor.trigger("HAND_PINCH");
            //     this.is_hand_pinching = true;
            // }
            // else if( (tipDist>=pinchThreshold) && (this.is_hand_pinching===true) ){
            //     this.cursor.trigger("HAND_UNPINCH")
            //     this.is_hand_pinching = false;
            // }
            //通过pinchStrength触发pinch状态
            var pinchThreshold = 0.6;
            var pinchStrength = hand.pinchStrength;

            if( (pinchStrength>pinchThreshold) && (this.is_hand_pinching===false) ){
                this.cursor.trigger("HAND_PINCH");
                this.is_hand_pinching = true;
            }
            else if( (pinchStrength<=pinchThreshold) && (this.is_hand_pinching===true) ){
                this.cursor.trigger("HAND_UNPINCH")
                this.is_hand_pinching = false;
            }
        }

        this.handCheck_Pointing = function(hand){
            //通过指尖距离触发Pointing状态
            var pointingThreshold = 60;
            var tipDistofPalm = $.LeapG.distanceOfTipsPalm(hand);
            
            if( (tipDistofPalm<pointingThreshold) && (this.is_hand_pointing===false) ){
                this.cursor.trigger("HAND_POINTING");   
                this.is_hand_pointing = true;             
            }
            else if( (tipDistofPalm>=pointingThreshold) && (this.is_hand_pointing===true) ){
                this.cursor.trigger("HAND_UNPOINTING");
                this.is_hand_pointing = false;
            }
        }

        //DOM元素事件触发
        this.triggerDOMEvent = function(event_name){
            //创建DOM事件
            ////var e = $.Event(event_name);
            var evt = document.createEvent("CustomEvent");
            evt.initCustomEvent(event_name, true, true, null);
            evt.pageX = (this.currPos === null) ? 0 : this.currX;
            evt.pageY = (this.currPos === null) ? 0 : this.currY;

            //获取Pointer位置dom元素
            this.cursor.hide();
            var element = document.elementFromPoint(evt.pageX, evt.pageY);
            this.cursor.show();

            //触发事件evt
            element.dispatchEvent(evt);
            ////$(element).trigger(e);
            return element;
        }


        //响应函数：onPointerAdded
        this.onPointerAdded = function (){
            //console.log("Pointer Added");
            return this.triggerDOMEvent("pointeradded");
        }    

        //响应函数：onPointerDeleted
        this.onPointerDeleted = function (){
            //console.log("Pointer Deleted");
            return this.triggerDOMEvent("pointerdeleted");
        }

        //响应函数：onPointerMove
        this.onPointerMove = function (){
            this.cursor.trigger("POINTER_HOVER");
            return this.triggerDOMEvent("mousemove");
        }

        //响应函数：onPointerHover
        this.onPointerHover = function (){
            
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
                this.cursor.trigger("POINTER_ENTER");
                this.cursor.trigger("POINTER_LEAVE");
            }
            // else if ( eleCurr === elePrev ){
            //     var evt = document.createEvent("CustomEvent");
            //     evt.initCustomEvent("hover", true, true, null);
            //     eleCurr.dispatchEvent(evt);
            //     $(eleCurr).trigger($.Event("hover"));

            // }
            return eleCurr;
        }


        //响应函数：onPointerEnter 和 onPointerover
        this.onPointerEnter = function (){
            this.triggerDOMEvent("mouseover");
            return this.triggerDOMEvent("mouseenter");
        }

        //响应函数：onPointerLeave 和 onPointerout
        this.onPointerLeave = function (){
            ////var e = $.Event("mouseleave");
            var evt = document.createEvent("CustomEvent");
            var evt2 = document.createEvent("CustomEvent");
            evt2.initCustomEvent("mouseout",true, true, null);
            evt.initCustomEvent("mouseleave",true, true, null);
            evt.pageX = (this.prevPos === null) ? 0 : this.prevX;
            evt.pageY = (this.prevPos === null) ? 0 : this.prevY;
            this.cursor.hide();
            var element = document.elementFromPoint(evt.pageX, evt.pageY);
            this.cursor.show();
            element.dispatchEvent(evt2);
            element.dispatchEvent(evt);
            ////$(element).trigger(e);
            return element;
        }

        //响应函数：onHandPinch
        this.onHandPinch = function(){
            this.cursor.css({'background-image': 'url(../leapjs-MouseHands/css/cursor_0.1_rhand_fist.png)'});
            this.tips = $("<span>Pinching</span>");
            this.tips.css({'margin-top':'30px', 'position':'absolute', 'color':'#33ccFF'});
            this.tips.appendTo(this.cursor);
            this.triggerDOMEvent("mousedown");  //绑定pinch和mousedown
            return this.triggerDOMEvent("handpinch");
        }

        //响应函数：onHandUnpinch
        this.onHandUnpinch = function(){
            this.cursor.css({'background-image': 'url(../leapjs-MouseHands/css/cursor_0.1_rhand.png)'});
            this.tips.remove();
            
            this.triggerDOMEvent("mouseup");    //绑定unpinch和mouseup
            return this.triggerDOMEvent("handunpinch");
        }

        //响应函数：onHandPointing
        this.onHandPointing = function(){
            this.triggerDOMEvent("mousedown");  //绑定pointing和mousedown
            return this.triggerDOMEvent("handpointing");
        }

        //响应函数：onHandUnpointing
        this.onHandUnpointing = function(){
            this.triggerDOMEvent("mouseup");  //绑定unpointing和mouseup
            return this.triggerDOMEvent("handunpointing");
        }

        //响应函数：onHandSwipe
        this.onHandSwipe = function(){
            this.triggerDOMEvent("dblclick");   //绑定handswipe和dblclick
            this.tips = $("<span>Swaping</span>");
            this.tips.css({'margin-top':'30px', 'position':'absolute', 'color':'#33ccFF'});
            //this.tips.appendTo(this.cursor);
            //setInterval('this.tips.remove();',1000);  
            return this.triggerDOMEvent("handswipe");                      
        }

        //响应函数：onHandTapStart
        this.onHandTapStart = function(){
            this.triggerDOMEvent("mousedown");
            return this.triggerDOMEvent("handtapstart");
        }
        //响应函数：onHandTapEnd
        this.onHandTapEnd = function(){
            this.triggerDOMEvent("mouseup");
            this.triggerDOMEvent("click");
            return this.triggerDOMEvent("handtapend");
        }

        //响应函数：onHandCircle
        this.onHandCircle = function(){
            //this.triggerDOMEvent("dblclick");       
            return this.triggerDOMEvent("handcircle");     
        }

        //响应函数：onHandScreenTap
        this.onHandScreenTap = function(){            
            this.triggerDOMEvent("mousedown");
            this.triggerDOMEvent("mouseup");
            return this.triggerDOMEvent("handscreentap");
        }
        //执行初始化
        this._init();
    };
    

    //工具函数：Hands的屏幕位置计算
    $.LeapG.leapToScene = function (hand, frame){
        //获取拇指对象及关节位置
        var pipThumb = hand.fingers[0].pipPosition;     //拇指pip关节位置 d
        var xThumb = pipThumb[0];  //拇指pip关节position
        var yThumb = pipThumb[1];
        var zThumb = pipThumb[2];
        
        //获取食指对象及关节位置
        var finger_Index = hand.fingers[1];         //食指对象
        var xIndex = finger_Index.mcpPosition[0];   //食指mcp关节position
        var yIndex = finger_Index.mcpPosition[1];
        var zIndex = finger_Index.dipPosition[2];   //食指根部dip关节positoin
        //var zIndex = finger_Index.stabilizedTipPosition[2]  //食指稳定位置

        //获取无名指对象及关节位置
        var finger_Ring = hand.fingers[3];         //无名指对象
        var xRing = finger_Ring.carpPosition[0];   //无名指carp关节position
        var yRing = finger_Ring.carpPosition[1];
        var zRing = finger_Ring.carpPosition[2];   

        //获取小指对象及关节位置
        var finger_Pinky = hand.fingers[4];         //无名指对象
        var xPinky = finger_Pinky.carpPosition[0];   //无名指carp关节position
        var yPinky = finger_Pinky.carpPosition[1];
        var zPinky = finger_Pinky.carpPosition[2];  

        //获取手掌的位置
        var palm = hand.palmPosition;
        var xPalm = palm[0];
        var yPalm = palm[1];
        var zPalm = palm[2];

        //获取手掌稳定位置
        var palmStabilized = hand.stabilizedPalmPosition;
        var xPalmStabilized = palmStabilized[0];
        var yPalmStabilized = palmStabilized[1];
        var zPalmStabilized = palmStabilized[2];

        //********************************************

        //hand位置xy取拇指，z去食指
        var tipx = xPalmStabilized; //用palm的x坐标作为cursor的x
        var tipy = yPalmStabilized; //用palm的Y坐标作为cursor的y
        var tipz = zPalm;
        // if(hand.pinchStrength>0.3){
        //     tipx = xPalm; //用palmStabilized的x坐标作为cursor的x
        //     tipy = yPalm; //用palmStabilized的Y坐标作为cursor的y
        //     tipz = zPalm;
        // }

        //归一化hand位置
        var tip  = [tipx*0.5, tipy, tipz];          //未归一化的位置, tipx后面的系数用来调整横向宽度
        var ibox = frame.interactionBox;
        var npos = ibox.normalizePoint(tip);    //归一化位置
        npos[1] = npos[1]-0.2; // 调整手部高度，0.4视情况而定
        var w_win = $(window).width();
        var h_win = $(window).height();
        var w_doc = $(document).width();
        var h_doc = $(document).height();

        //hand在屏幕上的位置
        var x = w_win * npos[0];
        var y = h_win * (1 - npos[1]);

        //LeapG位置越界的处理
        if ( (x < 0)||(x > w_win) || (y < 0)||(y > h_win) ) {
            return null;
        }            

        //返回位置坐标
        return [x, y];                    
    }


    //工具函数：拇指食指指尖距离计算
    $.LeapG.distanceOfThumbIndex = function (hand)
    {
        var dI = 0;  //拇指与食指指尖距离 
        var dM = 0;  //拇指与中指指尖距离
        var dI_Leap = 0;   //拇指与食指指尖距离,leapMotion自带计算
        
        var dipThumb = hand.fingers[0].dipPosition;     //拇指dip关节position
        var tipThumb = dipThumb;        //拇指指尖选用dip关节位置
        var xThumb = tipThumb[0];       //拇指指尖x分量
        var yThumb = tipThumb[1];
        var zThumb = tipThumb[2];
        
        var dipIndex = hand.fingers[1].dipPosition;     //食指dip关节position
        var tipIndex = dipIndex;                        //拇指指尖选用dip关节位置
        var xIndex = tipIndex[0];       //食指指尖x分量
        var yIndex = tipIndex[1];
        var zIndex = tipIndex[2]; 

        var dipMiddle = hand.fingers[2].dipPosition;     //中指dip关节position
        var tipMiddle = dipMiddle;                        //拇指指尖选用dip关节位置
        var xMiddle = tipMiddle[0];       //中指指尖x分量
        var yMiddle = tipMiddle[1];
        var zMiddle = tipMiddle[2];       

        dI = Math.sqrt( Math.pow((xThumb-xIndex),2) + Math.pow((yThumb-yIndex),2) );        //计算拇指与食指指尖距离
        dM= Math.sqrt( Math.pow((xThumb-xMiddle),2) + Math.pow((yThumb-yMiddle),2) );       //计算拇指与中指指尖距离
        dI_Leap = Leap.vec3.distance(hand.thumb.dipPosition, hand.indexFinger.dipPosition); //计算拇指与食指指尖距离，Leap自带函数

        return dI_Leap;   //返回指尖距离
    }

    //工具函数：指尖与掌心距离计算
    $.LeapG.distanceOfTipsPalm = function (hand){
        var dI = Leap.vec3.distance(hand.palmPosition, hand.indexFinger.dipPosition);   //计算掌心与食指指尖距离，Leap自带函数
        var dM = Leap.vec3.distance(hand.palmPosition, hand.middleFinger.dipPosition);  //计算掌心与中指指尖距离，Leap自带函数
        var dR = Leap.vec3.distance(hand.palmPosition, hand.ringFinger.dipPosition);    //计算掌心与无名指指尖距离，Leap自带函数    
        var dP = Leap.vec3.distance(hand.palmPosition, hand.pinky.dipPosition);         //计算掌心与小指指尖距离，Leap自带函数

        return dR;
    }

})(jQuery);