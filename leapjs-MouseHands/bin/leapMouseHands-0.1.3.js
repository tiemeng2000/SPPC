/*
 *
 *
 * 增加：多Cursor同时hover功能
 *
 *
 */

(function($){
	'use strict';	//严格模式

	var g_positions={};
	var cursors = {};


	//连接Leap设备
	$.gInit = function gInit(){

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
				//var g_position =  g_positions[index];					
				cursor.appendTo($('body'));

				//更新MouseHands位置
				var prevPosition = g_position;
				console.log("p"+prevPosition);
				
				var framePosition = $.gLeapToScene( hand, frame);
				if(framePosition === null){
					console.log("framePosition为空");
					return;
				}
				g_position = framePosition;
				g_positions[index] = g_position;
				//console.log("c"+g_position);
				//触发"mousemove"
				$.gTriggerEvent('mousemove', cursor, g_position);
				$.gTriggerHoverEvent(cursor, prevPosition, g_position);


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

	//触发事件
	$.gTriggerEvent = function gTriggerEvent(eventName, visualCursor, currCursorPosition){
		var e = $.Event(eventName);
		e.pageX = (currCursorPosition === null) ? 0 : currCursorPosition[0];
        e.pageY = (currCursorPosition === null) ? 0 : currCursorPosition[1];
        visualCursor.hide();
        var element = document.elementFromPoint(e.pageX, e.pageY);
        visualCursor.show();
        $(element).trigger(e);
        //console.log(e.type);
	};

	//Enter事件
	$.gTriggerHoverEvent = function gTriggerHoverEvent(visualCursor, prevCursorPosition, currCursorPosition){
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


	//g的屏幕位置标定
	$.gLeapToScene = function gLeapToScene(hand,frame){
		var tip = hand.palmPosition;
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
	$.gCursor = function gCursor(){
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
