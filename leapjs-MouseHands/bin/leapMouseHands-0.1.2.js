/*
 *
 *
 * 增加：hover功能
 *
 *
 */

(function($){
	'use strict';	//严格模式

	var g_position=null;
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
				cursor.appendTo($('body'));

				//更新MouseHands位置
				var prevPosition = g_position;
				var framePosition = $.gLeapToScene( hand, frame);
				if(framePosition === null){
					console.log("framePosition为空");
					return;
				}
				g_position = framePosition;

				//触发"mousemove"
				$.gTriggerEvent('mousemove', cursor);
				$.gTriggerHoverEvent(cursor, prevPosition);


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
	$.gTriggerEvent = function gTriggerEvent(eventName, visualCursor){
		var e = $.Event(eventName);
		e.pageX = (g_position === null) ? 0 : g_position[0];
        e.pageY = (g_position === null) ? 0 : g_position[1];
        visualCursor.hide();
        var element = document.elementFromPoint(e.pageX, e.pageY);
        visualCursor.show();
        $(element).trigger(e);
        //console.log(e.type);
	};

	//Enter事件
	$.gTriggerHoverEvent = function gTriggerHoverEvent(visualCursor, prevCursorPosition){
		var gEnter = $.Event('mouseenter');
		var gLeave = $.Event('mouseleave');
		var gXCurr = (g_position === null) ? 0 : g_position[0];
		var gYCurr = (g_position === null) ? 0 : g_position[1];
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
