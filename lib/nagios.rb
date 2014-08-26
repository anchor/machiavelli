# Collector: https://github.com/anchor/vaultaire-collector-nagios
class Nagios < Source
	include Helpers

	# Humanize the title for the perfdata feed. Handles both v1 and v2 style Vaultaire metadata
	def titleize metric 
		keys = keysplit(metric)

		nice = []
		if keys.include? "hostname"
		# Version one
			nice << keys["hostname"]
			nice << keys["service_name"] unless keys["service_name"] == "host"
			nice << keys["metric"]
		else
			nice << keys["host"]
			nice << keys["service"] unless keys["service"] == "host"
			nice << keys["metric"]
		end

		return URI.decode(nice.join(" - "))

	end
end
