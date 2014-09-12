Clizia.Graph.Horizon = function(args) { 
	var that = Clizia.Graph(args)

	that.init = function(args) { 
		if (that.chart.indexOf("#") === -1 ) { that.chart = "#" + that.chart }
		that.clock = args.clock || "utc"
		that.width = args.width || 600;
		that.color = args.color || ["#08519c","#3182bd","#6baed6","#bdd7e7","#bae4b3","#74c476","#31a354","#006d2c"];

	}

	that.render = function() { 
		delay = Date.now() - (gon.stop* 1000)

		var context = cubism.context()
			.serverDelay(delay)
			.clientDelay(0)
			.step(gon.step*1000) //1e3)
			.size(that.width)
			.stop();
		
		initProgress();

		if (that.clock == "utc") { context.utcTime(true);}

		datum = [];

		machiavelli = context.machiavelli(window.location.origin);
		for (n = 0; n < that.metric.length; n++ ) { 
			m = that.metric[n]
			datum.push(machiavelli.metric(m.id,m.titleize, updateProgress));
		}

		$(document).ajaxComplete(doneProgress);

		d3.select(that.chart).call(function(div) {
			div.append("div")
				.attr("class", "axis")
				.call(context.axis().orient("top"));

			div.selectAll(".horizon")
				.data(datum)
				.enter().append("div")
				.attr("class", "horizon")
				.call(
					context.horizon()
					.height(50)
					.colors(that.color)
				); 

			div.append("div")
				.attr("class", "rule")
				.call(context.rule());
		});
		// On mousemove, reposition the chart values to match the rule.
		context.on("focus", function(i) {
			d3.selectAll(".value").style("right", i == null ? null : context.size() - i + "px");
		});	
	} 


	that.init(args)
	return that
} 
