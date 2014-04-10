var graph=[];
var data;

function renderStandard(index) { 
	update = metricURL(gon.metrics[index].feed, gon.start, gon.stop, gon.step);
                
	$.getJSON(update, function(data) {
		var chart = "chart_" + index;
		var yaxis = "y_axis_" + index;
		
		if (data.error) { 
			renderError(chart, errorMessage.endpointError, data.error); 
			stopAll(); 
			return false;
		} 
		if (data.length === 0) { 
			renderError(chart, errorMessage.noData, metricURL(gon.metrics[index].feed, gon.start, gon.stop, gon.step)); 
			stopAll(); 
			return false;
		}
		graph[index] = new Rickshaw.Graph({
			element: document.getElementById(chart),
			width: 700,
			height: 200,
			min: 'auto',
			renderer: 'line',
			series: [{data: data, color: color[index]}]
		});

		if (gon.metrics[index].metric.indexOf("uom:c") != -1 )  { 
			min = Number.MAX_VALUE; max = Number.MIN_VALUE;
			for (i = 0; i < data.length; i++) {
				min = Math.min(min, data[i].y);
				max = Math.max(max, data[i].y);
			}
			graph[index].configure({min: min - 0.5, max: max + 0.5, interpolation: 'step'});
		}


		new Rickshaw.Graph.Axis.Y( {
			graph: graph[index],
			orientation: 'left',
		   	pixelsPerTick: 30,
			tickFormat: Rickshaw.Fixtures.Number.formatBase1024KMGTP_round,
			element: document.getElementById(yaxis)
		} );

		new Rickshaw.Graph.Axis.Time({
			graph: graph[index],
			timeFixture: new Rickshaw.Fixtures.Time.Precise.Local()
		});

		dynamicWidth(graph[index]);
		graph[index].render();
		
		new Rickshaw.Graph.HoverDetail({
			graph: graph[index],
			formatter: function (series, x, y) {
				content = "<span class='date'>"+d3.time.format("%Y-%m-%d %H:%M:%S %Z")(new Date(x*1000)) +"</span><br/>"+
					d3.format(",.02f")(y);
				return content;
			}
		});

		graph[index].render();

		unrenderWaiting(chart);
		renderSlider();
	});
}

function updateStandard(){ 
	id = setInterval(function() { 		
		now = parseInt(Date.now()/1000);
		span = (gon.stop - gon.start);

		$.each(gon.metrics, function(i, metric) { 
			if (metric.live) { 

				update = metricURL(metric.feed,now-span,now,gon.step);
				$.getJSON(update, function(d){
					if (d.error) { 
						renderError("flash", errorMessage.endpointError + " on update", d.error); stopAll(); 
						return false;
					} 
					if (d.length === 0) {
						renderError("flash", errorMessage.noData + " on update", update); stopAll(); 
						return false;
					}
					graph[i].series[0].data = d;
					graph[i].render();
				});
			}
		});
	}	, gon.step*1000);
	return id;
}


var complete = 0;
var slider; 
function renderSlider() { 
	complete++;

        // Render the multiple graph slider only when all the graphing operations have been completed.
        if (complete == gon.metrics.length) { 
	slider = new Rickshaw.Graph.RangeSlider.Preview({ 
                graphs: clean(graph, undefined), 
                height: 30,
		element: document.getElementById("multi_slider")//$("#multi_slider")
                });
        }
	fitSlider(); 
}
