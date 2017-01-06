/*
 * 2015-03-17
 *
 * 增加：
        
 * 改变：
 *
 */

(function($){
    'use strict';   //严格模式

    var g_positions={};
    var cursors = {};
    var flag_mousedown = false;
    var pinchEle = {};
    //连接Leap设备
    $.gInit = function (){

        //$cursor.appendTo($('body'));


        var controller = new Leap.Controller();

        controller.on('connect',function(){
            //提示 "Connect Succeed!" 在控制台
            console.log("Connect Succeed!");
        });

        controller.on('frame', function (frame){
            //if (frame.hands.length != 1) return;
            
            frame.hands.forEach ( function (hand, index){
                var cursor = ( cursors[index] || (cursors[index]=new $.gCursor()) );
                var g_position = ( g_positions[index] || (g_positions[index]=[0,0]) );

                cursor.appendTo($('body'));

                //更新MouseHands位置
                var prevPosition = g_position;                
                
                var framePosition = $.gLeapToScene( hand, frame);
                if(framePosition === null){
                    console.log("framePosition为空");
                    return;
                }
                g_position = framePosition;
                g_positions[index] = g_position;

                
                var ele = (pinchEle[index] || false);
                //if(ele){
                    console.log($(ele).prop("offsetTop"));
                //}

                
                //触发"Hover"
                $.gTriggerHoverEvent(cursor, prevPosition, g_position);
                //触发"Pinch"
                pinchEle[index] = $.gTriggerPinchEvent(cursor, g_position, hand, frame);
                
                //触发"mousemove"
                $.gTriggerEvent('mousemove', cursor, prevPosition, g_position);
                //改变$cursor位置
                cursor.css({
                    top: (g_position[1] - 5) + 'px',
                    left: (g_position[0] - 5) + 'px',
                    opacity: 0.5

                });
            });
        });     

        $('body').focus();
        controller.connect();       
    };

    //更新element位置
    $.updateElementPosition = function (eventElement, currCursorPosition, prevCursorPosition){
        var spanX = currCursorPosition[0] - prevCursorPosition[0];
        var spanY = currCursorPosition[1] - prevCursorPosition[1];

    }

    //触发事件函数
    $.gTriggerEvent = function (eventName, visualCursor, currCursorPosition, prevCursorPosition){
        var e = $.Event(eventName);
        e.pageX = (currCursorPosition === null) ? 0 : currCursorPosition[0];
        e.pageY = (currCursorPosition === null) ? 0 : currCursorPosition[1];
        visualCursor.hide();
        var element = document.elementFromPoint(e.pageX, e.pageY);
        visualCursor.show();
        $(element).trigger(e);
        //$(element).on("mousedown", function (){
        if(flag_mousedown === true){
            var spanX = currCursorPosition[0] - prevCursorPosition[0];
            var spanY = currCursorPosition[1] - prevCursorPosition[1];

            $(element).css("top", ($(element).prop("offsetTop") - spanY) );
            $(element).css("left", ($(element).prop("offsetLeft") - spanX) );
        }
    };

    //Hover事件响应函数
    $.gTriggerHoverEvent = function (visualCursor, prevCursorPosition, currCursorPosition){
        var gEnter = $.Event('mouseenter');
        var gLeave = $.Event('mouseleave');
        var gXCurr = (currCursorPosition === null) ? 0 : currCursorPosition[0];
        var gYCurr = (currCursorPosition === null) ? 0 : currCursorPosition[1];
        var gXPrev = (prevCursorPosition === null) ? 0 : prevCursorPosition[0];
        var gYPrev = (prevCursorPosition === null) ? 0 : prevCursorPosition[1];
        visualCursor.hide();
        var elemCurr = document.elementFromPoint(gXCurr, gYCurr);
        var elemPrev = document.elementFromPoint(gXPrev, gYPrev);
        visualCursor.show();
        if (elemCurr != elemPrev){
            $(elemCurr).trigger(gEnter);
            $(elemPrev).trigger(gLeave);
        }
    }

    //Pinch捏取事件响应函数（绑定 MouseDown 和 MouseUp ）
    $.gTriggerPinchEvent = function (visualCursor, currCursorPosition, hand, frame){
        var pinchThreshold = 40
        var tipDist = $.distanceOfThumbIndex(hand, frame);
        var e = $.Event('mousedown');
        e.pageX = (currCursorPosition === null) ? 0 : currCursorPosition[0];
        e.pageY = (currCursorPosition === null) ? 0 : currCursorPosition[1];
        visualCursor.hide();
        var element = document.elementFromPoint(e.pageX, e.pageY);
        visualCursor.show();
        if ( tipDist < pinchThreshold ){
            if(flag_mousedown === false){                        
                $(element).trigger('mousedown');                        
                flag_mousedown=true;
                return $(element);
            }            
        }
        if ( tipDist >= pinchThreshold ){
            if(flag_mousedown === true){
                $(element).trigger('mouseup');
                flag_mousedown = false;
                return null;
            }
        }
    }


    //拇指食指指尖距离计算
    $.distanceOfThumbIndex = function (hand, frame)
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

    //g的屏幕位置标定
    $.gLeapToScene = function (hand,frame){

        var finger_0 = hand.fingers[0];     //拇指
        var f0x = finger_0.pipPosition[0];  //拇指pip关节position
        var f0y = finger_0.pipPosition[1];
        var f0z = finger_0.dipPosition[2];
        
        var finger_1 = hand.fingers[1];     //食指
        var f1x = finger_1.mcpPosition[0];  //食指mcp关节position
        var f1y = finger_1.mcpPosition[1];
        var f1z = finger_1.dipPosition[2];

        var tipx = f0x; //用大拇指finger[0]的x坐标作为cursor的x
        var tipy = f0y; //用大拇指finger[0]的Y坐标作为cursor的y
        var tipz = f1z;

        var tip  = [tipx, tipy, tipz];  //未归一化的位置
        //var tip = hand.palmPosition;
        //console.log("tip: ",tip);

        var ibox = frame.interactionBox;
        var npos = ibox.normalizePoint(tip);
        var w = $(window).width();
        var h = $(window).height();

        var x = w * npos[0];
        var y = h * (1 - npos[1]);

        if ( (x < 0)||(x > w) || (y < 0)||(y > h) )
        return null;

        return [w * npos[0], h * (1 - npos[1])];
    };

    //添加Cursor
    $.gCursor = function (){
        var cursor = $('<span>');
        cursor.css({
            display: 'block',
            background: '#000',
            borderRadius: '5px',
            width: '10px',
            height: '10px',
            position: 'absolute',
            zIndex: 255,
        });
        console.log("Cursor Added");

        return cursor;
    };


})(jQuery);