'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GenericDatasource = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GenericDatasource = exports.GenericDatasource = function () {
  function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {
    _classCallCheck(this, GenericDatasource);

    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.withCredentials = instanceSettings.withCredentials;
    this.headers = { 'Content-Type': 'application/json' };
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }

    this.stackNumber = instanceSettings.jsonData.stackNumber;
    this.apiKey = instanceSettings.jsonData.apiKey;

    this.getGraphQuery = "GetGraph?";
    this.url = "https://api-" + this.stackNumber + ".beeinstant.com/";

    this.beeScript = "";
  }

  _createClass(GenericDatasource, [{
    key: 'query',
    value: function query(options) {

      var targets = options.targets;
      var queryString = this.url + this.getGraphQuery;

      var target;
      var metric;
      var queryParam;
      var metricCount = 0;
      var beeScriptEnable = false;

      var beeScript;

      for (var i = 0; i < targets.length; i++) {
        target = targets[i];

        if (target["beeScript"] !== undefined) {
          beeScript = target["beeScript"];
          beeScriptEnable = target["enable"];
        }

        metric = target["metric"];
        queryParam = target["query"];
        if (metric !== undefined || queryParam !== undefined) {
          metricCount++;

          if (metricCount != 0) {
            queryString += "&";
          }

          if (metric !== undefined) {
            queryString += "metric" + metricCount + "=";
            Object.keys(metric).forEach(function (key, index) {
              queryString += key + "=" + metric[key];
              if (index < Object.keys(metric).length - 1) {
                queryString += ",";
              }
            });
          }

          if (queryParam !== undefined) {
            queryString += "search" + metricCount + "=";
            queryString += encodeURIComponent(queryParam);
          }

          Object.keys(target).forEach(function (p, index) {
            if (p == "label" || p == "period" || p == "stat" || p == "axis" || p == "func") {
              queryString += "&" + p + metricCount + "=" + encodeURIComponent(target[p]);
            }
          });
        }
      }

      queryString += "&type=grafana&agg=undefined";

      if (beeScriptEnable == true && beeScript != undefined && beeScript != "") {
        queryString += "&script=" + encodeURIComponent(beeScript);
      }

      var end = options.range.to;
      var start = options.range.from;
      queryString += "&start=" + start.unix() + "&end=" + end.unix();
      queryString += "&api_key=" + this.apiKey;

      return this.doRequest({
        url: queryString,
        method: 'GET'
      });
    }
  }, {
    key: 'testDatasource',
    value: function testDatasource() {

      return this.doRequest({
        url: this.url + 'SearchMetric?q=' + "&api_key=" + this.apiKey,
        method: 'GET'
      }).then(function (response) {
        if (response.status === 200) {
          return { status: "success", message: "Data source is working", title: "Success" };
        }
      });
    }
  }, {
    key: 'annotationQuery',
    value: function annotationQuery(options) {
      var query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
      var annotationQuery = {
        range: options.range,
        annotation: {
          name: options.annotation.name,
          datasource: options.annotation.datasource,
          enable: options.annotation.enable,
          iconColor: options.annotation.iconColor,
          query: query
        },
        rangeRaw: options.rangeRaw
      };

      return this.doRequest({
        url: this.url + '/annotations',
        method: 'POST',
        data: annotationQuery
      }).then(function (result) {
        return result.data;
      });
    }
  }, {
    key: 'metricFindQuery',
    value: function metricFindQuery(query) {
      var interpolated = {
        target: this.templateSrv.replace(query, null, 'regex')
      };

      return this.doRequest({
        url: this.url + '/search',
        data: interpolated,
        method: 'POST'
      }).then(this.mapToTextValue);
    }
  }, {
    key: 'mapToTextValue',
    value: function mapToTextValue(result) {
      return _lodash2.default.map(result.data, function (d, i) {
        if (d && d.text && d.value) {
          return { text: d.text, value: d.value };
        } else if (_lodash2.default.isObject(d)) {
          return { text: d, value: i };
        }
        return { text: d, value: d };
      });
    }
  }, {
    key: 'doRequest',
    value: function doRequest(options) {
      options.withCredentials = this.withCredentials;
      options.headers = this.headers;

      return this.backendSrv.datasourceRequest(options);
    }
  }, {
    key: 'buildQueryParameters',
    value: function buildQueryParameters(options) {
      var _this = this;

      //remove placeholder targets
      options.targets = _lodash2.default.filter(options.targets, function (target) {
        return target.target !== 'select metric';
      });

      var targets = _lodash2.default.map(options.targets, function (target) {
        return {
          target: _this.templateSrv.replace(target.target, options.scopedVars, 'regex'),
          refId: target.refId,
          hide: target.hide,
          type: target.type || 'timeserie'
        };
      });

      options.targets = targets;

      return options;
    }
  }, {
    key: 'getTagKeys',
    value: function getTagKeys(options) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.doRequest({
          url: _this2.url + '/tag-keys',
          method: 'POST',
          data: options
        }).then(function (result) {
          return resolve(result.data);
        });
      });
    }
  }, {
    key: 'getTagValues',
    value: function getTagValues(options) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.doRequest({
          url: _this3.url + '/tag-values',
          method: 'POST',
          data: options
        }).then(function (result) {
          return resolve(result.data);
        });
      });
    }
  }]);

  return GenericDatasource;
}();
//# sourceMappingURL=datasource.js.map
