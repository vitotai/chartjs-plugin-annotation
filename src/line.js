// Line Annotation implementation
module.exports = function(Chart) {
	var horizontalKeyword = 'horizontal';
	var verticalKeyword = 'vertical';

	var LineAnnotation = Chart.Element.extend({

		draw: function(ctx) {
			var view = this._view;
			var opt=this.opt;
			// Canvas setup
			ctx.save();
			ctx.lineWidth = view.borderWidth;
			ctx.strokeStyle = view.borderColor;

			if (ctx.setLineDash) {
				ctx.setLineDash(view.borderDash);
			}
			ctx.lineDashOffset = view.borderDashOffset;

			// Draw
			ctx.beginPath();
			ctx.moveTo(view.x1, view.y1);
			ctx.lineTo(view.x2, view.y2);
			ctx.stroke();

            if (opt.label) {
    	        
    	        var textWidth=ctx.measureText(opt.label.text).width;
    	        if(textWidth ==0) return;

    	        var textHeight= this._fontHeight; // need to change it later
                var x= (view.x1 + view.x2)/2;
                var y= (view.y1 + view.y2)/2;
				var by=-textHeight/2;

				if(opt.label.align){
					if(opt.mode == verticalKeyword){
						if(opt.label.align == 'top')
							y=view.y1 + textWidth/2;
						else if(opt.label.align == 'bottom')
							y=view.y2 - textWidth/2;
					}else{
						if(opt.label.align == 'left')
							x=view.x1 + textWidth/2;
						else if(opt.label.align == 'right')
							x=view.x2 - textWidth/2;
					}
				}

				if(opt.label.anchor){
					if(opt.label.anchor == 'top')
						by=view.borderWidth;
					else if(opt.label.anchor == 'bottom')
						by= - textHeight - view.borderWidth;
				}
				
                ctx.translate(x,y);
    	        
	            if (opt.mode == verticalKeyword) {
                	ctx.rotate(-Math.PI/2);
	            }
        	        //draw the background of the badge.
        	        if(opt.label.bgColor){
	              		ctx.fillStyle = opt.label.bgColor;
    	            	ctx.fillRect(- textWidth/2 ,by, textWidth, textHeight);
    	            }
                	//Draw the border around the badge.
    	            if(opt.label.borderWidth){
    	            	var w=opt.label.borderWidth;
	                	ctx.fillStyle = view.borderColor;
	                	ctx.lineWidth = opt.label.borderWidth;
    	            	ctx.strokeRect(- textWidth/2 - w, by - w, textWidth + w *2, textHeight + w * 2);
    	            }
                	//Draw the text of the badge.
                	ctx.fillStyle =(opt.label.color)? opt.label.color:'black';
                	ctx.textAlign = 'center';
                	ctx.fillText(opt.label.text,0 ,by);

            }

			ctx.restore();
		}
	});

	function isValid(num) {
		return !isNaN(num) && isFinite(num);
	}

	function lineUpdate(obj, options, chartInstance) {
		var model = obj._model = obj._model || {};

		var scale = chartInstance.scales[options.scaleID];
		var pixel = scale ? scale.getPixelForValue(options.value) : NaN;
		var endPixel = scale && isValid(options.endValue) ? scale.getPixelForValue(options.endValue) : NaN;
		if (isNaN(endPixel))
		    endPixel = pixel;
		var chartArea = chartInstance.chartArea;

		if (!isNaN(pixel)) {
			if (options.mode == horizontalKeyword) {
				model.x1 = chartArea.left;
				model.x2 = chartArea.right;
				model.y1 = pixel;
				model.y2 = endPixel;
			} else {
				model.y1 = chartArea.top;
				model.y2 = chartArea.bottom;
				model.x1 = pixel;
				model.x2 = endPixel;
			}
		}

		model.borderColor = options.borderColor;
		model.borderWidth = options.borderWidth;
		model.borderDash = options.borderDash || [];
		model.borderDashOffset = options.borderDashOffset || 0;
	}


	return {
		Constructor: LineAnnotation,
		update: lineUpdate
	};
};
