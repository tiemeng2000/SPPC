/*
 * 2015-03-27
 *
 * 增加：1、resize的仿真实模型
        
 * 改变：1、pinch状态中move不产生事件
 *      2、updateElementSize函数，按照四象限模型
 *      
 */

(function($){
    'use strict';   //严格模式

    var g_positions={};             //cursor
    var cursors = {};               //cursor列表
    var pinchEle = {};              //捏取的元素列表
     
    
    //连接Leap设备
    $.gInit = function (){
        //创建控制器对象
        var controller = new Leap.Controller(); 

        //控制器接入时
        controller.on('connect',function(){            
            console.log("LeapMotion Device Connect Succeed!");  //提示 "Connect Succeed!" 在控制台
        });

        //帧循环：每frame获取数据并刷新cursor
        controller.on('frame', function (frame){
            //if (frame.hands.length != 1) return;  //限制为单手
            
            //处理frame内的每只手状态
            frame.hands.forEach ( function (hand, index){
                var cursor = ( cursors[index] || (cursors[index]=new $.gCursor()) );    //通过index 关联 cursor
                var g_position = ( g_positions[index] || (g_positions[index]=[0,0]) );  //通过index 关联 g_position

                //添加cursor元素至页面
                cursor.appendTo($('body'));

                //更新MouseHands位置
                var prevPosition = g_position;  //更新前保存前一帧cursor位置                          
                var framePosition = $.gLeapToScene( hand, frame);   //当前帧cursor位置用gLeapToScene更新
                if(framePosition === null){
                    console.log("framePosition为空");
                    return;
                }
                g_position = framePosition;         //用当前帧位置刷新g_position                
                var currPosition = g_position;      //当前cursor位置
                g_positions[index] = currPosition;    //将该hand的g_position添加至位置列表
                //触发"mousemove"
                $.gTriggerEvent_MouseMove(cursor, prevPosition, currPosition);
                //触发"Pinch"
                pinchEle[index] = $.gTriggerEvent_Pinch(cursor, currPosition, hand, frame);  
                
                //改变$cursor位置
                cursor.css({
                    top: (currPosition[1] - 5) + 'px',
                    left: (currPosition[0] - 5) + 'px',                    
                });
            });
        });     

        $('body').focus();
        controller.connect();       
    };

    //更新element位置
    $.updateElementPosition = function (eventElement, currCursorPosition, prevCursorPosition){
        //cursor单步位移
        var spanX = currCursorPosition[0] - prevCursorPosition[0];
        var spanY = currCursorPosition[1] - prevCursorPosition[1];

        //更新eventElement位置
        $(eventElement).css("top", ( $(eventElement).prop("offsetTop") - spanY) );
        $(eventElement).css("left", ( $(eventElement).prop("offsetLeft") - spanX) );
    }

    //更新element尺寸
    $.updateElementSize = function (eventElement, currCursorPosition, prevCursorPosition){
        //cursor单步位移
        var deltaX = currCursorPosition[0] - prevCursorPosition[0];
        var deltaY = currCursorPosition[1] - prevCursorPosition[1];

        //eventElement属性prev
        var prev_height = $(eventElement).prop("clientHeight"); //变化前的元素高度
        var prev_width  = $(eventElement).prop("clientWidth");  //变化前的元素宽度
        var prev_top    = $(eventElement).prop("offsetTop");    //变化前的元素顶偏移
        var prev_left   = $(eventElement).prop("offsetLeft");   //变化前的元素左偏移        
        var centerX     = prev_width/2 + prev_left; //变化前eventElement的中心X坐标
        var centerY     = prev_height/2 + prev_top; //变化前eventElement的中心Y坐标

        //eventElement属性curr
        var curr_height, curr_width, curr_top, curr_left;       //声明输出

        //宽度计算、左偏移计算
        if( prevCursorPosition[0] >= centerX ){     //一、四象限
            curr_width = prev_width - deltaX;   
        }        
        else if(prevCursorPosition[0] < centerX ){  //二、三象限
            curr_width = prev_width + deltaX;   
            curr_left  = prev_left  - deltaX; 
        }
        //高度计算、顶偏移计算
        if( prevCursorPosition[1] >= centerY ){     //三、四象限
            curr_height = prev_height - deltaY
        }
        else if( prevCursorPosition[1] < centerY ){ //一、二象限
            curr_height = prev_height + deltaY;
            curr_top    = prev_top    - deltaY;
        }

        //更新eventElement位置
        $(eventElement).css("height", curr_height);
        $(eventElement).css("top",    curr_top);
        $(eventElement).css("width",  curr_width);
        $(eventElement).css("left",   curr_left);
    }   

    //mousemove事件触发函数
    $.gTriggerEvent_MouseMove = function (visualCursor, currCursorPosition, prevCursorPosition){
        //创建mousemove事件
        var e_mousemove = $.Event('mousemove');     //mousemove事件对象
        e_mousemove.pageX = ( currCursorPosition === null ) ? 0 : currCursorPosition[0];    //事件位置为当前cursor位置
        e_mousemove.pageY = ( currCursorPosition === null ) ? 0 : currCursorPosition[1];
        
        //获取cursor位置的元素
        visualCursor.hide();    //隐藏cursor元素以便获取当前位置element
        var element = document.elementFromPoint(e_mousemove.pageX, e_mousemove.pageY);  //当前位置元素
        visualCursor.show();    //恢复cursor
    
        
        //status_pinch状态为DOUBLE_PINCHED时触发Resize
        if( $(element).attr("status_pinch") === "DOUBLE_PINCHED" ){
            $.updateElementSize(element, currCursorPosition, prevCursorPosition);
        }
        
        //status_pinch状态为SINGLE_PINCHED时触发Drag
        else if( ($(element).attr("status_pinch") === "SINGLE_PINCHED") && (visualCursor.isPinching===true) ){
            $.updateElementPosition(element, currCursorPosition, prevCursorPosition);
        }
        $(element).trigger(e_mousemove);  //在element上触发mousemove事件
        $.gTriggerEvent_Hover(visualCursor, currCursorPosition, prevCursorPosition);    //触发hover事件    
    };

    //hover事件响应函数
    $.gTriggerEvent_Hover = function (visualCursor, prevCursorPosition, currCursorPosition){
        //创建mouseenter和mouseleave事件
        var e_mouseenter = $.Event('mouseenter');
        var e_mouseleave = $.Event('mouseleave');
        
        //获取cursor位置上下文
        var gXCurr = ( currCursorPosition === null ) ? 0 : currCursorPosition[0];
        var gYCurr = ( currCursorPosition === null ) ? 0 : currCursorPosition[1];
        var gXPrev = ( prevCursorPosition === null ) ? 0 : prevCursorPosition[0];
        var gYPrev = ( prevCursorPosition === null ) ? 0 : prevCursorPosition[1];
        
        //获取cursor位置的上下文元素
        visualCursor.hide();    //隐藏cursor元素以便获取当前位置element
        var eleCurr = document.elementFromPoint(gXCurr, gYCurr);
        var elePrev = document.elementFromPoint(gXPrev, gYPrev);
        visualCursor.show();    //恢复cursor
        
        //当前元素和前一元素不一致时，说明分别发生cursor的enter和leave
        if ( eleCurr != elePrev ){            
            $(eleCurr).trigger(e_mouseenter);   //当前元素发生mouseenter事件
            $(elePrev).trigger(e_mouseleave);   //前一元素发生mouseleave事件
        }
    }

    //Pinch捏取事件响应函数（绑定 MouseDown 和 MouseUp ）
    $.gTriggerEvent_Pinch = function (visualCursor, currCursorPosition, hand, frame){
        var pinchThreshold = 40;    //指尖距离40作为pinch发生的阈值
        var tipDist = $.distanceOfThumbIndex(hand, frame);  //获取指尖距离
        
        //创建mousedown事件
        var e_mousedown = $.Event('mousedown');
        e_mousedown.pageX = (currCursorPosition === null) ? 0 : currCursorPosition[0];
        e_mousedown.pageY = (currCursorPosition === null) ? 0 : currCursorPosition[1];
        
        //获取cursor位置元素
        visualCursor.hide();
        var element = document.elementFromPoint(e_mousedown.pageX, e_mousedown.pageY);  //当前位置元素
        visualCursor.show();

        //指尖距离小于pinch阈值时发生pinch，即mousedown事件发生且flag_mousedown置true
        if ( (tipDist < pinchThreshold) && (visualCursor.isPinching===false) ){
            //通过判断pinch手个数改变pinch状态，用于激活drag或resize
            switch( $(element).attr("status_pinch") ){
                case undefined:
                    visualCursor.isPinching = true;
                    $(element).trigger('mousedown');
                    $(element).attr("status_pinch", "SINGLE_PINCHED");
                    return $(element);
                    break;

                case "SINGLE_PINCHED":     
                    if( visualCursor.isPinching === true ){
                        break;
                    }
                    else if( visualCursor.isPinching === false ){
                        visualCursor.isPinching = true;
                        $(element).trigger('resize');
                        $(element).attr("status_pinch", "DOUBLE_PINCHED");
                        return $(element);
                        break;
                    }                    
               
                case "DOUBLE_PINCHED":
                    if(visualCursor.isPinching === true){
                        break;
                    }
                    else if( visualCursor.isPinching === false ){
                        console.log("Triple Hands! Three hands? or error?");
                        break;
                    }                     
                    break;

                default:
                    break;
            }          
        }
        //指尖距离大于pinch阈值时撤销pinch，即mouseup事件发生且flag_mousedown置false
        else if ( (tipDist >= pinchThreshold) && (visualCursor.isPinching===true) ){
            //通过判断pinch手个数改变pinch状态，用于结束drag或resize
            switch( $(element).attr("status_pinch") ){
                case "DOUBLE_PINCHED":
                    visualCursor.isPinching = false; 
                    $(element).trigger('unresize');              
                    $(element).attr("status_pinch", "SINGLE_PINCHED");
                    return null;
                    break;

                case "SINGLE_PINCHED":
                    if(visualCursor.isPinching === false){
                        break;
                    }
                    else if(visualCursor.isPinching === true){
                        visualCursor.isPinching = false;
                        $(element).trigger('mouseup');
                        $(element).removeAttr("status_pinch");
                        return null;
                        break;
                    }
                    
                case undefined:
                    break;

                default:
                    break;
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
    };

    //添加Cursor
    $.gCursor = function (){
        var cursor = $('<span>');
        cursor.css({
            display: 'block',
            background: '#000',
            borderRadius: '5px',
            width: '8px',
            height: '8px',
            position: 'absolute',
            zIndex: 255,
        });
        cursor.isPinching = false;
        console.log("Cursor Added");

        return cursor;
    };


})(jQuery);