// Get the chart variable
var Chart = require('chart.js');
Chart = typeof(Chart) === 'function' ? Chart : window.Chart;
var helpers = Chart.helpers;
var isArray = helpers.isArray;

// Take the zoom namespace of Chart
Chart.Annotation = Chart.Annotation || {};

// Default options if none are provided
var defaultOptions = Chart.Annotation.defaults = {
	drawTime: "afterDraw", // defaults to drawing after draw
	annotations: [] // default to no annotations
};

var lineAnnotation = require('./line.js')(Chart);
var boxAnnotation = require('./box.js')(Chart);

// Map of all types
var annotationTypes = Chart.Annotation.annotationTypes = {
	line: lineAnnotation.Constructor,
	box: boxAnnotation.Constructor
};

// Map of all update functions
var updateFunctions = Chart.Annotation.updateFunctions = {
	line: lineAnnotation.update,
	box: boxAnnotation.update
};

var drawTimeOptions = Chart.Annotation.drawTimeOptions = {
	afterDraw: "afterDraw",
	afterDatasetsDraw: "afterDatasetsDraw",
	beforeDatasetsDraw: "beforeDatasetsDraw",
};

function drawAnnotations(drawTime, chartInstance, easingDecimal) {
	var annotationOpts = chartInstance.options.annotation;
	if (annotationOpts.drawTime != drawTime) {
		return;
	}
	// If we have annotations, draw them
	var annotationObjects = chartInstance._annotationObjects;
	if (isArray(annotationObjects)) {
		var ctx = chartInstance.chart.ctx;

		annotationObjects.forEach(function(obj) {
			obj.transition(easingDecimal).draw(ctx);
		});
	}
}

// Chartjs Zoom Plugin
var annotationPlugin = {
	beforeInit: function(chartInstance) {
		var options = chartInstance.options;
		options.annotation = helpers.configMerge(Chart.Annotation.defaults, options.annotation);

		var annotationConfigs = options.annotation.annotations;
		if (isArray(annotationConfigs)) {
			var annotationObjects = chartInstance._annotationObjects = [];

			annotationConfigs.forEach(function(configuration, i) {
				var Constructor = annotationTypes[configuration.type];
				if (Constructor) {
					annotationObjects.push(new Constructor({
						_index: i,
						opt: annotationConfigs[i],
					}));
				}
			});
		}
	},
	afterScaleUpdate: function(chartInstance) {
		// Once scales are ready, update
		var annotationObjects = chartInstance._annotationObjects;
		var annotationOpts = chartInstance.options.annotation;
// get font height.
		var div = document.createElement("div");
    	div.innerHTML = "o";
    	div.style.position = 'absolute';
    	div.style.top  = '-9999px';
    	div.style.left = '-9999px';
    	div.style.border= '0px';
    	div.style.margin= '0px';
		div.style.padding='0px';
    	div.style.font = chartInstance.chart.ctx.font;
		document.body.appendChild(div);
		var fontHeight=div.offsetHeight;
		document.body.removeChild(div);
//
		if (isArray(annotationObjects)) {
			if(annotationObjects.length != annotationOpts.annotations.length){
				this.beforeInit(chartInstance);
				annotationObjects = chartInstance._annotationObjects;
			}
			annotationObjects.forEach(function(annotationObject, i) {
				annotationObject._fontHeight=fontHeight;
				var opts = annotationOpts.annotations[annotationObject._index];
				var updateFunction = updateFunctions[opts.type];

				if (updateFunction) {
					updateFunction(annotationObject, opts, chartInstance);
				}
			});
		}
	},

	afterDraw: function(chartInstance, easingDecimal) {
		drawAnnotations(
			Chart.Annotation.drawTimeOptions.afterDraw,
			chartInstance,
			easingDecimal
		);
	},
	afterDatasetsDraw: function(chartInstance, easingDecimal) {
		drawAnnotations(
			Chart.Annotation.drawTimeOptions.afterDatasetsDraw,
			chartInstance,
			easingDecimal
		);
	},
	beforeDatasetsDraw: function(chartInstance, easingDecimal) {
		drawAnnotations(
			Chart.Annotation.drawTimeOptions.beforeDatasetsDraw,
			chartInstance,
			easingDecimal
		);
	}
};

module.exports = annotationPlugin;
Chart.pluginService.register(annotationPlugin);
