## BeeInstant Datasource - datasource plugin to query metrics from BeeInstant backend

This is BeeInstant official plugin for Grafana monitoring platform to leverage querying metrics from BeeInstant backend. The plugin 
allows connecting via stack numbers and authentication using API keys.

Key feature: 
  * Connect to BeeInstant backend 
  * Search and plot metrics using Search functionality
  * Group metrics by search criteria
  * Change timeframe of querying metrics
  * Adjust metrics' properties such as: stat, function, period
  * Apply custom function on individual metrics
  * Apply beeCode functions for further analysis


### Installation

To install copy the `beeinstant-datasource` folder inside `./release` to `/var/lib/grafana/plugins/`
Then, restart the server
```
  sudo service grafana-server restart
```

### Backend configuration: 
- Stack number: Stack number that is on the url. For e.g: `"https://api-101-gcp.beeinstant.com/"`
- API key: authentication API key


### If using Grafana 2.6
NOTE!
for grafana 2.6 please use [this version](https://github.com/grafana/simple-json-datasource/commit/b78720f6e00c115203d8f4c0e81ccd3c16001f94)

Copy the data source you want to `/public/app/plugins/datasource/`. Then restart grafana-server. The new data source should now be available in the data source type dropdown in the Add Data Source View.

