/**
 * ColorPicker - pure JavaScript color picker without using images, external CSS or 1px divs.
 * Copyright © 2011 David Durman, All rights reserved.
 */
(function(window, document, undefined) {

    var type = (window.SVGAngle || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML"),
        picker, slide, hueOffset = 0, svgNS = 'http://www.w3.org/2000/svg';

    // This HTML snippet is inserted into the innerHTML property of the passed color picker element
    // when the no-hassle call to ColorPicker() is used, i.e. ColorPicker(function(hex, hsv, rgb) { ... });
    
    var colorpickerHTMLSnippet = [
        
        '<div class="picker-wrapper">',
                '<div class="picker"></div>',
                '<div class="picker-indicator"></div>',
        '</div>',
        '<div class="slide-wrapper">',
                '<div class="slide"></div>',
                '<div class="slide-indicator"></div>',
        '</div>'
        
    ].join('');

    /**
     * Return mouse position relative to the element el.
     */
    function mousePosition(evt) {
        // IE:
        if (window.event && window.event.contentOverflow !== undefined) {
            return { x: window.event.offsetX, y: window.event.offsetY };
        }
        // Webkit:
        if (evt.offsetX !== undefined && evt.offsetY !== undefined) {
            return { x: evt.offsetX, y: evt.offsetY };
        }
        // Firefox:
        var wrapper = evt.target.parentNode.parentNode;
        return { x: evt.layerX - wrapper.offsetLeft, y: evt.layerY - wrapper.offsetTop };
    }

    /**
     * Create SVG element.
     */
    function $(el, attrs, children) {
        el = document.createElementNS(svgNS, el);
        for (var key in attrs)
            el.setAttribute(key, attrs[key]);
        if (Object.prototype.toString.call(children) != '[object Array]') children = [children];
        var i = 0, len = (children[0] && children.length) || 0;
        for (; i < len; i++)
            el.appendChild(children[i]);
        return el;
    }

    /**
     * Create slide and picker markup depending on the supported technology.
     */
    if (type == 'SVG') {

        slide = $('svg', { xmlns: 'http://www.w3.org/2000/svg', version: '1.1', width: '100%', height: '100%' },
                  [
                      $('defs', {},
                        $('linearGradient', { id: 'gradient-hsv', x1: '0%', y1: '100%', x2: '0%', y2: '0%'},
                          [
                              $('stop', { offset: '0%', 'stop-color': '#FF0000', 'stop-opacity': '1' }),
                              $('stop', { offset: '16.7%', 'stop-color': '#FF00FF', 'stop-opacity': '1' }),
                              $('stop', { offset: '33.3%', 'stop-color': '#0000FF', 'stop-opacity': '1' }),
                              $('stop', { offset: '50%', 'stop-color': '#00FFFF', 'stop-opacity': '1' }),  
                              $('stop', { offset: '66.7%', 'stop-color': '#00FF00', 'stop-opacity': '1' }),
                              $('stop', { offset: '83.3%', 'stop-color': '#FFFF00', 'stop-opacity': '1' }),
                              $('stop', { offset: '100%', 'stop-color': '#FF0000', 'stop-opacity': '1' })
                          /*
                              $('stop', { offset: '0%', 'stop-color': '#FF0000', 'stop-opacity': '1' }),
                              $('stop', { offset: '12.5%', 'stop-color': '#FF00FF', 'stop-opacity': '1' }),
                              $('stop', { offset: '25%', 'stop-color': '#8000FF', 'stop-opacity': '1' }),
                              $('stop', { offset: '37.5%', 'stop-color': '#0040FF', 'stop-opacity': '1' }),
                              $('stop', { offset: '50%', 'stop-color': '#00FFFF', 'stop-opacity': '1' }),
                              $('stop', { offset: '62.5%', 'stop-color': '#00FF40', 'stop-opacity': '1' }),
                              $('stop', { offset: '75%', 'stop-color': '#0BED00', 'stop-opacity': '1' }),
                              $('stop', { offset: '87.5%', 'stop-color': '#FFFF00', 'stop-opacity': '1' }),
                              $('stop', { offset: '100%', 'stop-color': '#FF0000', 'stop-opacity': '1' })     
                              */                        
                          ]
                         )
                       ),
                      $('rect', { x: '0', y: '0', width: '100%', height: '100%', fill: 'url(#gradient-hsv)'})
                  ]
                 );

        picker = $('svg', { xmlns: 'http://www.w3.org/2000/svg', version: '1.1', width: '100%', height: '100%' },
                   [
                       $('defs', {},
                         [
                             $('linearGradient', { id: 'gradient-black', x1: '0%', y1: '100%', x2: '0%', y2: '0%'},
                               [
                                   $('stop', { offset: '0%', 'stop-color': '#000000', 'stop-opacity': '1' }),
                                   $('stop', { offset: '100%', 'stop-color': '#000000', 'stop-opacity': '0' })
                               ]
                              ),
                             $('linearGradient', { id: 'gradient-white', x1: '0%', y1: '100%', x2: '100%', y2: '100%'},
                               [
                                   $('stop', { offset: '0%', 'stop-color': '#FFFFFF', 'stop-opacity': '1' }),
                                   $('stop', { offset: '100%', 'stop-color': '#FFFFFF', 'stop-opacity': '0' })
                               ]
                              )
                         ]
                        ),
                       $('rect', { x: '0', y: '0', width: '100%', height: '100%', fill: 'url(#gradient-white)'}),
                       $('rect', { x: '0', y: '0', width: '100%', height: '100%', fill: 'url(#gradient-black)'})
                   ]
                  );

    } else if (type == 'VML') {
        slide = [
            '<DIV style="position: relative; width: 100%; height: 100%">',
            '<v:rect style="position: absolute; top: 0; left: 0; width: 100%; height: 100%" stroked="f" filled="t">',
            '<v:fill type="gradient" method="none" angle="0" color="red" color2="red" colors="8519f fuchsia;.25 #8000ff;24903f #0040ff;.5 aqua;41287f #00ff40;.75 #0bed00;57671f yellow"></v:fill>',
            '</v:rect>',
            '</DIV>'
        ].join('');

        picker = [
            '<DIV style="position: relative; width: 100%; height: 100%">',
            '<v:rect style="position: absolute; left: -1px; top: -1px; width: 101%; height: 101%" stroked="f" filled="t">',
            '<v:fill type="gradient" method="none" angle="270" color="#FFFFFF" opacity="100%" color2="#CC9A81" o:opacity2="0%"></v:fill>',
            '</v:rect>',
            '<v:rect style="position: absolute; left: 0px; top: 0px; width: 100%; height: 101%" stroked="f" filled="t">',
            '<v:fill type="gradient" method="none" angle="0" color="#000000" opacity="100%" color2="#CC9A81" o:opacity2="0%"></v:fill>',
            '</v:rect>',
            '</DIV>'
        ].join('');
        
        if (!document.namespaces['v'])
            document.namespaces.add('v', 'urn:schemas-microsoft-com:vml', '#default#VML');
    }

    /**
     * Convert HSV representation to RGB HEX string.
     * Credits to http://www.raphaeljs.com
     */
    function hsv2rgb(hsv) {
        var R, G, B, X, C;
        var h = (hsv.h % 360) / 60;
        var f, p, q, t;
        
        h = ~~h;
        f = hsv.h / 60 - h;
        p = hsv.v * (1 - hsv.s);
        q = hsv.v * (1 - f * hsv.s);
        t = hsv.v * (1 - (1 - f) * hsv.s);
        var c;
        switch(h){
            case 0:
                c=[hsv.v, t, p];
            break;
            case 1:
                c=[q, hsv.v, p];
            break;
            case 2:
                c=[p, hsv.v, t];
            break;
            case 3:
                c=[p, q, hsv.v];
            break;
            case 4:
                c=[t, p, hsv.v];
            break;
            case 5:
                c=[hsv.v, p, q];
            break;
            default:
        };
        R=c[0];
        G=c[1];
        B=c[2];
        /*
        C = hsv.v * hsv.s;
        X = C * (1 - Math.abs(h % 2 - 1));
        R = G = B = hsv.v - C;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];

        */
        var r = Math.floor(R * 255);
        var g = Math.floor(G * 255);
        var b = Math.floor(B * 255);
        return { r: r, g: g, b: b, hex: "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1) };
    }

    /**
     * Convert RGB representation to HSV.
     * r, g, b can be either in <0,1> range or <0,255> range.
     * Credits to http://www.raphaeljs.com
     */
    function rgb2hsv(rgb) {

        var r = rgb.r;
        var g = rgb.g;
        var b = rgb.b;
        
        if (rgb.r > 1 || rgb.g > 1 || rgb.b > 1) {
            r /= 255;
            g /= 255;
            b /= 255;
        }

        var H, S, V, C;
        V = Math.max(r, g, b);
        C = V - Math.min(r, g, b);
        H = (C == 0 ? null :
             V == r ? (g - b) / C + (g < b ? 6 : 0) :
             V == g ? (b - r) / C + 2 :
                      (r - g) / C + 4);
        H = (H % 6) * 60;
        S = C == 0 ? 0 : C / V;
        return { h: H, s: S, v: V };
    }

    /**
     * Return click event handler for the slider.
     * Sets picker background color and calls ctx.callback if provided.
     */  
    function slideListener(ele, ctx) {
            var pos=d3.mouse(ele),
            width=parseInt(getCSS(ele, "width")),
            height=parseInt(getCSS(ele, "height"));
            var mouse={x:pos[0],y:pos[1]};
            d3.select("#slider-indicator")
            .attr("y",Math.max(Math.min(pos[1],height*0.96),height*0.03));

            ctx.h = mouse.y / ctx.slideElement.offsetHeight * 360 + hueOffset;
            var pickerColor = hsv2rgb({ h: ctx.h, s: 1, v: 1 });
            var c = hsv2rgb({ h: ctx.h, s: ctx.s, v: ctx.v });
            d3.select("#slide-show").attr("fill", pickerColor.hex);
            ctx.callback && ctx.callback(c.hex, { h: ctx.h - hueOffset, s: ctx.s, v: ctx.v }, { r: c.r, g: c.g, b: c.b }, undefined, mouse);
    };

    /**
     * Return click event handler for the picker.
     * Calls ctx.callback if provided.
     */  

    function pickerListener(ele, ctx) {
            var pos=d3.mouse(ele),
            width=parseInt(getCSS(ele, "width")),
            height=parseInt(getCSS(ele, "height"));
            var mouse={x:pos[0],y:pos[1]};
            ctx.s = mouse.x / width;
            ctx.v = (height - mouse.y) / height;
            var col = ~~((1-ctx.v)*192);
            d3.select("#picker-indicator")
            .attr("cx",Math.max(Math.min(pos[0],width*0.92),width*0.07))
            .attr("cy",Math.max(Math.min(pos[1],height*0.97),height*0.03))
            .attr("stroke","rgb("+col+","+col+","+col+")");

            var c = hsv2rgb(ctx);
            ctx.callback && ctx.callback(c.hex, { h: ctx.h - hueOffset, s: ctx.s, v: ctx.v }, { r: c.r, g: c.g, b: c.b }, mouse);
    };

    var uniqID = 0;
    
    /**
     * ColorPicker.
     * @param {DOMElement} slideElement HSV slide element.
     * @param {DOMElement} pickerElement HSV picker element.
     * @param {Function} callback Called whenever the color is changed provided chosen color in RGB HEX format as the only argument.
     */
    function ColorPicker(slideElement, pickerElement, callback) {
        
        if (!(this instanceof ColorPicker)) return new ColorPicker(slideElement, pickerElement, callback);

        this.h = 0;
        this.s = 1;
        this.v = 1;

        if (!callback) {
            // call of the form ColorPicker(element, funtion(hex, hsv, rgb) { ... }), i.e. the no-hassle call.

            var element = slideElement;
            element.innerHTML = colorpickerHTMLSnippet;
            
            this.slideElement = element.getElementsByClassName('slide')[0];
            this.pickerElement = element.getElementsByClassName('picker')[0];
            var slideIndicator = element.getElementsByClassName('slide-indicator')[0];
            var pickerIndicator = element.getElementsByClassName('picker-indicator')[0];
            
            ColorPicker.fixIndicators(slideIndicator, pickerIndicator);

            this.callback = function(hex, hsv, rgb, pickerCoordinate, slideCoordinate) {

                ColorPicker.positionIndicators(slideIndicator, pickerIndicator, slideCoordinate, pickerCoordinate);
                
                pickerElement(hex, hsv, rgb);
            };
            
        } else {
        
            this.callback = callback;
            this.pickerElement = pickerElement;
            this.slideElement = slideElement;
        }

        if (type == 'SVG') {

            // Generate uniq IDs for linearGradients so that we don't have the same IDs within one document.
            // Then reference those gradients in the associated rectangles.

            var slideClone = slide.cloneNode(true);
            var pickerClone = picker.cloneNode(true);
            
            var hsvGradient = slideClone.getElementById('gradient-hsv');
            
            var hsvRect = slideClone.getElementsByTagName('rect')[0];
            
            hsvGradient.id = 'gradient-hsv-' + uniqID;
            hsvRect.setAttribute('fill', 'url(#' + hsvGradient.id + ')');

            var blackAndWhiteGradients = [pickerClone.getElementById('gradient-black'), pickerClone.getElementById('gradient-white')];
            var whiteAndBlackRects = pickerClone.getElementsByTagName('rect');
            
            blackAndWhiteGradients[0].id = 'gradient-black-' + uniqID;
            blackAndWhiteGradients[1].id = 'gradient-white-' + uniqID;
            
            whiteAndBlackRects[0].setAttribute('fill', 'url(#' + blackAndWhiteGradients[1].id + ')');
            whiteAndBlackRects[1].setAttribute('fill', 'url(#' + blackAndWhiteGradients[0].id + ')');

            this.slideElement.appendChild(slideClone);
            this.pickerElement.appendChild(pickerClone);

            uniqID++;
            
        } else {
            
            this.slideElement.innerHTML = slide;
            this.pickerElement.innerHTML = picker;            
        }

        var ctx=this;
        d3.select("#picker svg")
        .on("mousedown",function(e){
            if(!palDown){
                palDown=true;
                pickerListener(this, ctx);
            }
        });
        d3.select("#picker svg")
        .on("mousemove", function(e) {
            if(palDown)
                pickerListener(this, ctx);
        });
        d3.select("#picker svg")
        .on("mouseup", function(e) {
            palDown=false;
        });

        d3.select("#slide svg")
        .on("mousedown",function(e){
            if(!palDown){
                palDown=true;
                slideListener(this, ctx);
            }
        });
        d3.select("#slide svg")
        .on("mousemove", function(e) {
            if(palDown)
                slideListener(this, ctx);
        });
        d3.select("#slide svg")
        .on("mouseup", function(e) {
            palDown=false;
        });
    };

    function addEventListener(element, event, listener) {

        if (element.attachEvent) {
            
            element.attachEvent('on' + event, listener);
            
        } else if (element.addEventListener) {

            element.addEventListener(event, listener, false);
        }
    }

   /**
    * Enable drag&drop color selection.
    * @param {object} ctx ColorPicker instance.
    * @param {DOMElement} element HSV slide element or HSV picker element.
    * @param {Function} listener Function that will be called whenever mouse is dragged over the element with event object as argument.
    */
    function enableDragging(ctx, element, listener) {
        
        var mousedown = false;

        addEventListener(element, 'mousedown', function(evt) { mousedown = true;  });
        addEventListener(element, 'mouseup',   function(evt) { mousedown = false;  });
        addEventListener(element, 'mouseout',  function(evt) { mousedown = false;  });
        addEventListener(element, 'mousemove', function(evt) {

            if (mousedown) {
                
                listener(evt);
            }
        });
    }


    ColorPicker.hsv2rgb = function(hsv) {
        var rgbHex = hsv2rgb(hsv);
        delete rgbHex.hex;
        return rgbHex;
    };
    
    ColorPicker.hsv2hex = function(hsv) {
        return hsv2rgb(hsv).hex;
    };
    
    ColorPicker.rgb2hsv = rgb2hsv;

    ColorPicker.rgb2hex = function(rgb) {
        return hsv2rgb(rgb2hsv(rgb)).hex;
    };
    
    ColorPicker.hex2hsv = function(hex) {
        return rgb2hsv(ColorPicker.hex2rgb(hex));
    };
    
    ColorPicker.hex2rgb = function(hex) {
        return { r: parseInt(hex.substr(1, 2), 16), g: parseInt(hex.substr(3, 2), 16), b: parseInt(hex.substr(5, 2), 16) };
    };

    /**
     * Sets color of the picker in hsv/rgb/hex format.
     * @param {object} ctx ColorPicker instance.
     * @param {object} hsv Object of the form: { h: <hue>, s: <saturation>, v: <value> }.
     * @param {object} rgb Object of the form: { r: <red>, g: <green>, b: <blue> }.
     * @param {string} hex String of the form: #RRGGBB.
     */
     function setColor(ctx, hsv, rgb, hex) {
         ctx.h = hsv.h % 360;
         ctx.s = hsv.s;
         ctx.v = hsv.v;
         
         var c = hsv2rgb(ctx);
         
         var mouseSlide = {
             y: (ctx.h * ctx.slideElement.offsetHeight) / 360,
             x: 0    // not important
         };
         
         var pickerHeight = ctx.pickerElement.offsetHeight;
         
         var mousePicker = {
             x: ctx.s * ctx.pickerElement.offsetWidth,
             y: pickerHeight - ctx.v * pickerHeight
         };
         
         ctx.pickerElement.style.backgroundColor = hsv2rgb({ h: ctx.h, s: 1, v: 1 }).hex;
         ctx.callback && ctx.callback(hex || c.hex, { h: ctx.h, s: ctx.s, v: ctx.v }, rgb || { r: c.r, g: c.g, b: c.b }, mousePicker, mouseSlide);
         
         return ctx;
    };

    /**
     * Sets color of the picker in hsv format.
     * @param {object} hsv Object of the form: { h: <hue>, s: <saturation>, v: <value> }.
     */
    ColorPicker.prototype.setHsv = function(hsv) {
        return setColor(this, hsv);
    };
    
    /**
     * Sets color of the picker in rgb format.
     * @param {object} rgb Object of the form: { r: <red>, g: <green>, b: <blue> }.
     */
    ColorPicker.prototype.setRgb = function(rgb) {
        return setColor(this, rgb2hsv(rgb), rgb);
    };

    /**
     * Sets color of the picker in hex format.
     * @param {string} hex Hex color format #RRGGBB.
     */
    ColorPicker.prototype.setHex = function(hex) {
        return setColor(this, ColorPicker.hex2hsv(hex), undefined, hex);
    };

    /**
     * Helper to position indicators.
     * @param {HTMLElement} slideIndicator DOM element representing the indicator of the slide area.
     * @param {HTMLElement} pickerIndicator DOM element representing the indicator of the picker area.
     * @param {object} mouseSlide Coordinates of the mouse cursor in the slide area.
     * @param {object} mousePicker Coordinates of the mouse cursor in the picker area.
     */
    ColorPicker.positionIndicators = function(slideIndicator, pickerIndicator, mouseSlide, mousePicker) {
        
        if (mouseSlide) {
            slideIndicator.style.top = (mouseSlide.y - slideIndicator.offsetHeight/2) + 'px';
        }
        if (mousePicker) {
            pickerIndicator.style.top = (mousePicker.y - pickerIndicator.offsetHeight/2) + 'px';
            pickerIndicator.style.left = (mousePicker.x - pickerIndicator.offsetWidth/2) + 'px';
        } 
    };

    /**
     * Helper to fix indicators - this is recommended (and needed) for dragable color selection (see enabledDragging()).
     */
    ColorPicker.fixIndicators = function(slideIndicator, pickerIndicator) {

        pickerIndicator.style.pointerEvents = 'none';
        slideIndicator.style.pointerEvents = 'none';
    };

    window.ColorPicker = ColorPicker;

})(window, window.document);

function getCSS(element, property){
    return $(element).css(property);
}
