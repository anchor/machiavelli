require 'color'

class Graph::Cubism < Graph::GenericGraph
	GRAPH_COLOUR = Settings.cubism_color || "#006d2c"
	
	def self.view
		"cubism"
	end

	# Given a metric name and a series of x:y datapoints, format the metric
	# however the graphing library requires it. 
	def self.parse_metric name, metric
		stream = metric.map { |m| m[:y] }
		resolution = metric[1][:x] - metric[0][:x]

		# Only need to generate colours once
		@@colors ||= tint_range(complement GRAPH_COLOUR) + tint_range(GRAPH_COLOUR, reverse: true)
		
		{data: stream, resolution: resolution, colors: @@colors}
	end

	# Cubism colour range. 
	# By default: 8 colour, representing -4, -3, -2, -1, +1, +2, +3, +4; cubism defaults:  #08519c -4; #006d2c +4
	# Method gives a tinting of color, dark to light. Reverse for positive side (light to dark)
	def self.tint_range base, opts={}
		rgb = base[1..-1].scan(/.{1,2}/).map{|a| a.to_i(16)}

		arr = [rgb]
		int = rgb

		i = opts[:iterations] || 4     # Denotes amount of overlapping layers
		f = opts[:factor]     || (1.0 / i) # Denotes tint factor

		(i-1).times do 
			int = int.map{|b| ((255 - b)*f).to_i + b}
			arr << int
		end

		arr = arr.reverse if opts[:reverse]

		arr.map{|b| "#"+b.map{|a| a.to_s(16).rjust(2,"0")}.join("")}
	end
	
	# Given a html color, establish it's complement on the color wheel
 	# Uses the 'color' library
	def self.complement base	
		hsl = (Color::RGB.from_html base).to_hsl
		hsl.hue = (hsl.hue + 180) % 360
		hsl.to_rgb.html
	end
end
