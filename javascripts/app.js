(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle) {
    for (var key in bundle) {
      if (has(bundle, key)) {
        modules[key] = bundle[key];
      }
    }
  }

  globals.require = require;
  globals.require.define = define;
  globals.require.brunch = true;
})();

window.require.define({"initialize": function(exports, require, module) {
  (function() {
    var Router, initJsPlumb, loadDataset;

    Router = require('router');

    loadDataset = function() {
      var category, country, entire_world, group, id, index, qdata, qnum, x, y, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _m, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _results;
      assert(_EXPLORER_DATASET !== null, 'Failed to load dataset.');
      id = 0;
      _ref = _EXPLORER_DATASET.groupings;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        x = _ref[_i];
        _ref2 = x.entries;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          y = _ref2[_j];
          y.group_id = id++;
        }
      }
      id = 0;
      _ref3 = _EXPLORER_DATASET.question;
      for (qnum in _ref3) {
        qdata = _ref3[qnum];
        qnum = parseInt(qnum);
        qdata.groups = [];
        _ref4 = _EXPLORER_DATASET.groupings;
        for (_k = 0, _len3 = _ref4.length; _k < _len3; _k++) {
          category = _ref4[_k];
          _ref5 = category.entries;
          for (_l = 0, _len4 = _ref5.length; _l < _len4; _l++) {
            group = _ref5[_l];
            if (group.qs.contains(qnum)) {
              qdata.groups.push('group-' + group.group_id);
            }
          }
        }
      }
      entire_world = {
        name: 'Entire World',
        contains: []
      };
      _ref6 = _EXPLORER_DATASET.country;
      for (_m = 0, _len5 = _ref6.length; _m < _len5; _m++) {
        country = _ref6[_m];
        entire_world.contains.push(country.alpha2);
      }
      _EXPLORER_DATASET.regions.unshift(entire_world);
      _results = [];
      for (index in _EXPLORER_DATASET.regions) {
        _results.push(_EXPLORER_DATASET.regions[index].region_index = parseInt(index));
      }
      return _results;
    };

    initJsPlumb = function() {
      var arrowCommon, color;
      color = '#aaa';
      jsPlumb.importDefaults({
        Anchors: ['RightMiddle', 'LeftMiddle'],
        PaintStyle: {
          strokeStyle: color,
          lineWidth: 2
        },
        Endpoint: 'Blank',
        EndpointStyle: {
          radius: 9,
          fillStyle: color
        },
        Connector: [
          "Bezier", {
            curviness: 30
          }
        ]
      });
      arrowCommon = {
        foldback: 0.8,
        fillStyle: color,
        width: 9,
        length: 10
      };
      return jsPlumb._custom_overlay = [
        [
          "Arrow", {
            location: 0.5
          }, arrowCommon
        ]
      ];
    };

    $(function() {
      var router;
      initJsPlumb();
      loadDataset();
      router = new Router();
      return Backbone.history.start();
    });

  }).call(this);
  
}});

window.require.define({"router": function(exports, require, module) {
  (function() {
    var AvailabilityPage, DownloadPage, MapPage, ProfilePage, RankingsPage, Router, SplashPage, TimelinePage, reportGenerator, singletons,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    MapPage = require('views/page/map');

    TimelinePage = require('views/page/timeline');

    RankingsPage = require('views/page/rankings');

    DownloadPage = require('views/page/download');

    ProfilePage = require('views/page/profile');

    AvailabilityPage = require('views/page/availability');

    SplashPage = require('views/page/splash');

    reportGenerator = require('views/reportgenerator');

    singletons = {
      mapPage: function() {
        return this._map = this._map || new MapPage();
      },
      timelinePage: function() {
        return this._timeline = this._timeline || new TimelinePage();
      },
      rankingsPage: function() {
        return this._rankings = this._rankings || new RankingsPage();
      },
      availabilityPage: function() {
        return this._avail = this._avail || new AvailabilityPage();
      },
      downloadPage: function() {
        return this._download = this._download || new DownloadPage();
      },
      splashPage: function() {
        return this._splash = this._splash || new SplashPage();
      }
    };

    module.exports = Router = (function(_super) {

      __extends(Router, _super);

      function Router() {
        this.setCurrent = __bind(this.setCurrent, this);
        Router.__super__.constructor.apply(this, arguments);
      }

      Router.prototype.routes = {
        '': 'home',
        'home': 'home',
        'map': 'map',
        'timeline': 'timeline',
        'rankings': 'rankings',
        'availability': 'availability',
        'download': 'download',
        'profile': 'profile',
        'profile/:country': 'profile'
      };

      Router.prototype.initialize = function() {
        var _this = this;
        reportGenerator.render($('#report-generator'));
        reportGenerator.setInitialState();
        return this.on('all', function(trigger) {
          var active, location;
          location = window.location.hash.slice(1);
          trigger = trigger.split(':');
          if (trigger[0] === 'route') {
            $('#main-nav li').removeClass('active');
            active = $('#main-nav li a[href$="#' + location + '"]');
            if (active.length === 0) {
              active = $('#main-nav li a[href$="#' + trigger[1] + '"]');
            }
            active = $(active.parents('li')[0]);
            return active.add(active.parents('.dropdown')).addClass('active');
          }
        });
      };

      Router.prototype.setCurrent = function(view, showReportGenerator) {
        if (showReportGenerator == null) showReportGenerator = true;
        if (!(view === this.currentView)) {
          this.currentView = view;
          view.renderPage($('#explorer'));
        }
        if (showReportGenerator) {
          return $('#report-generator').show();
        } else {
          return $('#report-generator').hide();
        }
      };

      Router.prototype.home = function() {
        var showReportGenerator;
        return this.setCurrent(singletons.splashPage(), showReportGenerator = false);
      };

      Router.prototype.map = function() {
        return this.setCurrent(singletons.mapPage());
      };

      Router.prototype.timeline = function() {
        return this.setCurrent(singletons.timelinePage());
      };

      Router.prototype.rankings = function() {
        return this.setCurrent(singletons.rankingsPage());
      };

      Router.prototype.availability = function() {
        var showReportGenerator;
        return this.setCurrent(singletons.availabilityPage(), showReportGenerator = false);
      };

      Router.prototype.download = function() {
        return this.setCurrent(singletons.downloadPage());
      };

      Router.prototype.profile = function(country) {
        if (country == null) country = '';
        return this.setCurrent(new ProfilePage(country));
      };

      return Router;

    })(Backbone.Router);

  }).call(this);
  
}});

window.require.define({"util": function(exports, require, module) {
  (function() {

    module.exports = {
      sortFunction: function(a, b) {
        var x;
        x = b.score - a.score;
        if (!x) return a.country.localeCompare(b.country);
        return x;
      },
      sortFunctionByName: function(a, b) {
        var x;
        x = a.country.localeCompare(b.country);
        if (!x) x = b.score - a.score;
        return x;
      }
    };

  }).call(this);
  
}});

window.require.define({"views/page/availability": function(exports, require, module) {
  (function() {
    var ProjectPage, reportGenerator, template_page, template_row,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
      __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

    template_page = require('views/templates/page/availability');

    template_row = require('views/templates/availability_row');

    reportGenerator = require('views/reportgenerator');

    module.exports = ProjectPage = (function(_super) {

      __extends(ProjectPage, _super);

      function ProjectPage() {
        this.clickregion = __bind(this.clickregion, this);
        this._repaint = __bind(this._repaint, this);
        this._yearToggle = __bind(this._yearToggle, this);
        this.renderPage = __bind(this.renderPage, this);
        ProjectPage.__super__.constructor.apply(this, arguments);
      }

      ProjectPage.prototype.regionId = 0;

      ProjectPage.prototype.initialize = function() {};

      ProjectPage.prototype.renderPage = function(target) {
        this.$el.html(template_page());
        target.html(this.$el);
        $('#year-toggles button').click(this._yearToggle);
        $('button[data-year="2012"]').click();
        return $('.av-region-toggler').click(this.clickregion);
      };

      ProjectPage.prototype._yearToggle = function(e) {
        var target;
        target = $(e.delegateTarget);
        $('#year-toggles button').removeClass('active');
        target.addClass('active');
        this.year = $(e.delegateTarget).attr('data-year');
        return this._repaint();
      };

      ProjectPage.prototype._repaint = function(dataset, questionSet, region) {
        var countriesIncluded, key, row, tbody, _i, _len, _ref, _ref2, _results;
        if (dataset == null) dataset = reportGenerator.dataset;
        if (questionSet == null) questionSet = reportGenerator.questionSet;
        if (region == null) region = reportGenerator.region;
        tbody = $('#availability tbody');
        tbody.empty();
        countriesIncluded = _EXPLORER_DATASET.regions[this.regionId].contains;
        _ref = _EXPLORER_DATASET.availability;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          row = _ref[_i];
          key = 'db_' + this.year;
          if (!(key in row)) continue;
          if (!(_ref2 = row[key].alpha2, __indexOf.call(countriesIncluded, _ref2) >= 0)) {
            continue;
          }
          _results.push(tbody.append(template_row(row[key])));
        }
        return _results;
      };

      ProjectPage.prototype.clickregion = function(e) {
        var id, id_num, target;
        e.preventDefault();
        target = $(e.delegateTarget);
        id = target.attr('id');
        id_num = parseInt(id.substr('7'));
        this.regionId = id_num;
        this._repaint();
        $('.av-region-toggler').removeClass('active');
        target.addClass('active');
        return false;
      };

      return ProjectPage;

    })(Backbone.View);

  }).call(this);
  
}});

window.require.define({"views/page/download": function(exports, require, module) {
  (function() {
    var DownloadPage, reportGenerator, template_page,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
      __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

    template_page = require('views/templates/page/download');

    reportGenerator = require('views/reportgenerator');

    module.exports = DownloadPage = (function(_super) {

      __extends(DownloadPage, _super);

      function DownloadPage() {
        this._repaint = __bind(this._repaint, this);
        this.changeyear = __bind(this.changeyear, this);
        this.renderPage = __bind(this.renderPage, this);
        this.initialize = __bind(this.initialize, this);
        DownloadPage.__super__.constructor.apply(this, arguments);
      }

      DownloadPage.prototype.initialize = function() {
        return reportGenerator.bind('update', this._repaint);
      };

      DownloadPage.prototype.tx = function() {
        return $('#custom-csv');
      };

      DownloadPage.prototype.renderPage = function(target) {
        var options,
          _this = this;
        this.$el.html(template_page(_EXPLORER_DATASET));
        target.html(this.$el);
        this._repaint();
        this.tx().bind('click', function() {
          return _this.tx().select();
        });
        $('input[name="downloadyear"]').bind('change', this.changeyear);
        options = {
          filename: function() {
            return 'custom-budget-report.csv';
          },
          data: function() {
            return $('#custom-csv').val();
          },
          onComplete: function() {
            return alert('Your File Has Been Saved!');
          },
          onCancel: function() {
            return null;
          },
          onError: function() {
            return null;
          },
          swf: 'downloadify.swf',
          downloadImage: 'images/download.png',
          width: 100,
          height: 30,
          transparent: true,
          append: false
        };
        return Downloadify.create('downloadify', options);
      };

      DownloadPage.prototype.changeyear = function(event) {
        return this._repaint();
      };

      DownloadPage.prototype._writeLine = function(out, x) {
        var element, index, _ref;
        for (index = 0, _ref = x.length; 0 <= _ref ? index < _ref : index > _ref; 0 <= _ref ? index++ : index--) {
          element = x[index] || '';
          assert(!(__indexOf.call(element, '"') >= 0), 'Cannot encode string: ' + element);
          if (__indexOf.call(element, ',') >= 0) x[index] = '"' + element + '"';
        }
        return out.push(x.join(','));
      };

      DownloadPage.prototype._csvQuestions = function(questionSet) {
        var headers, out, q, x, _i, _len;
        out = [];
        headers = ['NUMBER', 'TEXT', 'A', 'B', 'C', 'D', 'E'];
        this._writeLine(out, headers);
        q = _EXPLORER_DATASET.question;
        for (_i = 0, _len = questionSet.length; _i < _len; _i++) {
          x = questionSet[_i];
          this._writeLine(out, [x, q[x].text, q[x].a, q[x].b, q[x].c, q[x].d, q[x].e]);
        }
        return out;
      };

      DownloadPage.prototype._number_to_letter = function(value) {
        "The given letters in the source data arent always there. \n'q102l' does not exist while 'q102' does.\nTherefore it is safer to use this technique to extract a letter...";      assert(value === -1 || value === 0 || value === 33 || value === 67 || value === 100, 'Invalid value: ' + value);
        return {
          '-1': 'e',
          0: 'd',
          33: 'c',
          67: 'b',
          100: 'a'
        }[value];
      };

      DownloadPage.prototype._csvAnswers = function(dataset, region, questionSet) {
        var all_years, country, headers, out, q, row, selected_year, tmp, value, x, year, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _len6, _len7, _m, _n, _o, _ref, _ref2;
        out = [];
        headers = ['COUNTRY', 'COUNTRY_NAME', 'YEAR', 'SCORE'];
        for (_i = 0, _len = questionSet.length; _i < _len; _i++) {
          x = questionSet[_i];
          headers.push(x.toString());
        }
        for (_j = 0, _len2 = questionSet.length; _j < _len2; _j++) {
          x = questionSet[_j];
          headers.push(x + 'l');
        }
        this._writeLine(out, headers);
        tmp = {};
        _ref = _EXPLORER_DATASET.country;
        for (_k = 0, _len3 = _ref.length; _k < _len3; _k++) {
          x = _ref[_k];
          tmp[x.alpha2] = x;
        }
        for (_l = 0, _len4 = dataset.length; _l < _len4; _l++) {
          country = dataset[_l];
          if (_ref2 = country.alpha2, __indexOf.call(_EXPLORER_DATASET.regions[region].contains, _ref2) < 0) {
            continue;
          }
          all_years = ['2006', '2008', '2010', '2012'];
          selected_year = $('input[name="downloadyear"]:checked').val();
          if (!(__indexOf.call(all_years, selected_year) >= 0)) {
            selected_year = all_years;
          } else {
            selected_year = [selected_year];
          }
          for (_m = 0, _len5 = selected_year.length; _m < _len5; _m++) {
            year = selected_year[_m];
            if (!(year in country)) continue;
            row = [country.alpha2, country.country, year, country[year]];
            for (_n = 0, _len6 = questionSet.length; _n < _len6; _n++) {
              q = questionSet[_n];
              row.push(tmp[country.alpha2]['db_' + year][q]);
            }
            for (_o = 0, _len7 = questionSet.length; _o < _len7; _o++) {
              q = questionSet[_o];
              value = tmp[country.alpha2]['db_' + year][q];
              row.push(this._number_to_letter(value));
            }
            assert(row.length === headers.length);
            this._writeLine(out, row);
          }
        }
        return out;
      };

      DownloadPage.prototype._repaint = function(dataset, questionSet, region) {
        if (dataset == null) dataset = reportGenerator.dataset;
        if (questionSet == null) questionSet = reportGenerator.questionSet;
        if (region == null) region = reportGenerator.region;
        return this.tx().html((this._csvAnswers(dataset, region, questionSet)).join('\n'));
      };

      return DownloadPage;

    })(Backbone.View);

  }).call(this);
  
}});

window.require.define({"views/page/map": function(exports, require, module) {
  (function() {
    var COLOR_SCHEME, MAP_NAME, ProjectPage, reportGenerator, template_page,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
      __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

    template_page = require('views/templates/page/map');

    reportGenerator = require('views/reportgenerator');

    MAP_NAME = 'world_mill_en';

    COLOR_SCHEME = ['B8282E', 'F48022', 'DAC300', '007A78', '0065A4'];

    jvm.NumericScale.prototype.getValue = function(_x) {
      var x;
      x = Math.min(_x - 1, 99);
      x = (x - (x % 20)) / 20;
      x = COLOR_SCHEME[x];
      assert(!(x === void 0), 'Could not process ' + _x + ' (' + x + ')');
      return x;
    };

    module.exports = ProjectPage = (function(_super) {

      __extends(ProjectPage, _super);

      function ProjectPage() {
        this._clickCountry = __bind(this._clickCountry, this);
        this._labelShow = __bind(this._labelShow, this);
        this._repaint = __bind(this._repaint, this);
        this._mapToggle = __bind(this._mapToggle, this);
        this.renderPage = __bind(this.renderPage, this);
        this.initialize = __bind(this.initialize, this);
        ProjectPage.__super__.constructor.apply(this, arguments);
      }

      ProjectPage.prototype.mapData = {};

      ProjectPage.prototype.countriesInSurvey = [];

      ProjectPage.prototype.initialize = function() {
        return reportGenerator.bind('update', this._repaint);
      };

      ProjectPage.prototype.renderPage = function(target) {
        var map, x;
        this.$el.html(template_page());
        target.html(this.$el);
        map = this.$el.find('#map');
        x = map.vectorMap({
          map: MAP_NAME,
          series: {
            regions: [{}]
          },
          regionStyle: {
            initial: {
              stroke: 'none',
              'stroke-width': '1.0',
              'stroke-opacity': '0.5',
              fill: '#cccccc'
            }
          },
          backgroundColor: '#ffffff',
          onRegionLabelShow: this._labelShow,
          onRegionClick: this._clickCountry,
          zoomOnScroll: false
        });
        this.mapObject = map.vectorMap('get', 'mapObject');
        $('#map-toggles button').click(this._mapToggle);
        return $('button[data-year="2012"]').click();
        /*
                # Debug gradient (usually a static PNG file)
                g = $('#map-gradient')
                s = '-webkit-linear-gradient(top, [C3] 0%,[C2] 33%,[C1] 66%,[C0] 100%)'
                for x in [0...SCHEME.length]
                  s = s.replace('[C'+x+']', SCHEME[x])
                g.css('background',s)
        */
      };

      ProjectPage.prototype._mapToggle = function(e) {
        var target;
        target = $(e.delegateTarget);
        $('#map-toggles button').removeClass('active');
        target.addClass('active');
        this.year = $(e.delegateTarget).attr('data-year');
        return this._repaint();
      };

      ProjectPage.prototype._repaint = function(dataset, questionSet, region) {
        var countries_in_map, country, selected_countries, value, x, _i, _len, _ref;
        if (dataset == null) dataset = reportGenerator.dataset;
        if (questionSet == null) questionSet = reportGenerator.questionSet;
        if (region == null) region = reportGenerator.region;
        countries_in_map = jvm.WorldMap.maps[MAP_NAME].paths;
        selected_countries = _EXPLORER_DATASET.regions[region].contains;
        this.mapData = {};
        this.mapColor = {};
        this.countriesInSurvey = [];
        for (x in countries_in_map) {
          this.mapData[x] = -1;
          this.mapColor[x] = 0;
        }
        if (reportGenerator.questionSet.length > 0) {
          for (_i = 0, _len = dataset.length; _i < _len; _i++) {
            country = dataset[_i];
            if (!(country.alpha2 in countries_in_map)) continue;
            if (!(_ref = country.alpha2, __indexOf.call(selected_countries, _ref) >= 0)) {
              continue;
            }
            if (!(this.year in country)) continue;
            value = country[this.year];
            if (value < 0) continue;
            assert(value >= -1, 'Bad mapping value: ' + value);
            this.countriesInSurvey.push(country.alpha2);
            this.mapColor[country.alpha2] = Math.max(1, value);
            this.mapData[country.alpha2] = value;
          }
        }
        return this.mapObject.series.regions[0].setValues(this.mapColor);
      };

      ProjectPage.prototype._labelShow = function(e, mapLabel, code) {
        this.mapLabel = mapLabel;
        if (!(__indexOf.call(this.countriesInSurvey, code) >= 0)) {
          return this.mapLabel.css({
            'opacity': '0.5'
          });
        } else {
          this.mapLabel.css({
            'opacity': '1.0'
          });
          return this.mapLabel.html(this.mapLabel.html() + ': ' + this.mapData[code]);
        }
      };

      ProjectPage.prototype._clickCountry = function(event, alpha2) {
        if (__indexOf.call(this.countriesInSurvey, alpha2) >= 0) {
          if (this.mapLabel.length) this.mapLabel.remove();
          return window.location = '#profile/' + alpha2;
        }
      };

      return ProjectPage;

    })(Backbone.View);

  }).call(this);
  
}});

window.require.define({"views/page/profile": function(exports, require, module) {
  (function() {
    var ProfilePage, reportGenerator, template_page, template_profile_details, template_profile_details_future, template_profile_percentages, template_question_text,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    template_page = require('views/templates/page/profile');

    template_profile_percentages = require('views/templates/profile_percentages');

    template_profile_details = require('views/templates/profile_details');

    template_profile_details_future = require('views/templates/profile_details_future');

    template_question_text = require('views/templates/question_text');

    reportGenerator = require('views/reportgenerator');

    module.exports = ProfilePage = (function(_super) {

      __extends(ProfilePage, _super);

      function ProfilePage() {
        this._animationHackScale = __bind(this._animationHackScale, this);
        this._repaint2014 = __bind(this._repaint2014, this);
        this._onClick2014 = __bind(this._onClick2014, this);
        this._onToggleMode = __bind(this._onToggleMode, this);
        this._repaint = __bind(this._repaint, this);
        this.renderPage = __bind(this.renderPage, this);
        this.initialize = __bind(this.initialize, this);
        ProfilePage.__super__.constructor.apply(this, arguments);
      }

      ProfilePage.prototype.initialize = function(alpha2) {
        this.alpha2 = alpha2;
        this.data = this.lookup(this.alpha2);
        this.db_2014 = $.extend({}, this.data.db_2012);
        return reportGenerator.bind('update', this._repaint);
      };

      ProfilePage.prototype.lookup = function(alpha2) {
        "Look up a country object by alpha2 code";
        var x, _i, _len, _ref;
        _ref = _EXPLORER_DATASET.country;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          x = _ref[_i];
          if (x.alpha2 === alpha2) return x;
        }
        if (alpha2 === "") return {};
        return assert(false, alpha2 + ' is not a valid country code.');
      };

      ProfilePage.prototype.renderPage = function(target) {
        var nav, renderData;
        renderData = {
          alpha2: this.alpha2,
          countries: _EXPLORER_DATASET.country,
          data: this.data,
          empty: this.alpha2 === "",
          main_website_url: this._ibp_website_url(this.alpha2)
        };
        this.viewPast = true;
        this.$el.html(template_page(renderData));
        target.html(this.$el);
        this._repaint();
        nav = this.$el.find('.country-nav-select');
        nav.chosen();
        nav.val(this.alpha2).trigger('liszt:updated');
        nav.bind('change', this._onNavChange);
        return $('#profile-toggle input').bind('change', this._onToggleMode);
      };

      ProfilePage.prototype._repaint = function(dataset, questionSet) {
        var detailsData, percentageData, qnum, render_score, score, x, _i, _len, _ref;
        if (dataset == null) dataset = reportGenerator.dataset;
        if (questionSet == null) questionSet = reportGenerator.questionSet;
        percentageData = {
          percentages: [this._get_percentages(this.data.alpha2, this.data.db_2006, '2006', questionSet), this._get_percentages(this.data.alpha2, this.data.db_2008, '2008', questionSet), this._get_percentages(this.data.alpha2, this.data.db_2010, '2010', questionSet), this._get_percentages(this.data.alpha2, this.data.db_2012, '2012', questionSet)]
        };
        $('.percentages').empty().append($(template_profile_percentages(percentageData)));
        $('.percentbar').tooltip({
          placement: 'right',
          delay: 50,
          animation: true
        });
        detailsData = this._get_details(this.data, questionSet);
        if (this.viewPast) {
          $('.past').show();
          $('.future').hide();
          $('.details').html(template_profile_details(detailsData));
        } else {
          $('.future').show();
          $('.past').hide();
          $('.details').html(template_profile_details_future(detailsData));
          $('.letter.multi img').bind('click', this._onClick2014);
          this._repaint2014;
          _ref = $('.question-row');
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            x = _ref[_i];
            x = $(x);
            qnum = parseInt(x.attr('data-question-number'));
            score = this.db_2014[qnum];
            x.find('img[data-score="' + score + '"]').removeClass('inactive').addClass('active');
          }
        }
        this._repaint2014();
        this.$el.find('tr.question-row').mouseover(this._onHoverQuestion);
        this.$el.find('tr.question-row:first').mouseover();
        render_score = function(year, score) {
          if (!(score === void 0)) {
            $('.scores .year-' + year).css('opacity', '1.0');
            return $('.scores .year-' + year + ' .bottom').text('Score: ' + score);
          } else {
            $('.scores .year-' + year).css('opacity', '0.2');
            return $('.scores .year-' + year + ' .bottom').text('-');
          }
        };
        render_score(2006, percentageData.percentages[0].score);
        render_score(2008, percentageData.percentages[1].score);
        render_score(2010, percentageData.percentages[2].score);
        render_score(2012, percentageData.percentages[3].score);
        return this._repaint2014();
      };

      ProfilePage.prototype._ibp_website_url = function(alpha2) {
        if (alpha2 === 'BJ') alpha2 = 'benin';
        if (alpha2 === 'QA' || alpha2 === 'TN' || alpha2 === 'MM') return '';
        return 'http://internationalbudget.org/what-we-do/open-budget-survey/country-info/?country=' + alpha2.toLowerCase();
      };

      ProfilePage.prototype._onHoverQuestion = function(e) {
        var max_top, number, q, qbox, target, top;
        target = $(e.delegateTarget);
        number = target.attr('data-question-number');
        q = _EXPLORER_DATASET.question[number];
        qbox = $('.question-box');
        qbox.html(template_question_text(q));
        top = target.position().top - 21;
        max_top = $('.details').height() - qbox.height() - 21;
        qbox.css({
          left: $('.details table').width(),
          top: Math.max(0, Math.min(top, max_top))
        });
        $('tr.question-row').removeClass('hover');
        return target.addClass('hover');
      };

      ProfilePage.prototype._onNavChange = function(e) {
        var value;
        value = $(e.delegateTarget).val();
        if (value.length === 0) {
          return window.location = '#profile';
        } else {
          assert(value.length === 2, 'Invalid country code: ' + value);
          return window.location = '#profile/' + value;
        }
      };

      ProfilePage.prototype._number_to_letter = function(dataset, questionNumber) {
        "The given letters in the source data arent always there. \n'q102l' does not exist while 'q102' does.\nTherefore it is safer to use this technique to extract a letter...";
        var value;
        if (dataset === void 0) return '';
        value = dataset[questionNumber];
        assert(value === -1 || value === 0 || value === 33 || value === 67 || value === 100, 'Invalid value: ' + value);
        return {
          '-1': 'e',
          0: 'd',
          33: 'c',
          67: 'b',
          100: 'a'
        }[value];
      };

      ProfilePage.prototype._get_percentages = function(alpha2, data, year, questionSet) {
        var i, letter, out, x, _i, _j, _len, _len2, _ref;
        if (data === void 0) {
          return {
            year: year,
            not_defined: true
          };
        }
        out = {
          total: questionSet.length,
          year: year,
          a: 0,
          b: 0,
          c: 0,
          d: 0,
          e: 0
        };
        _ref = reportGenerator.dataset;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          x = _ref[_i];
          if (x.alpha2 === alpha2) {
            out.score = x[year];
            if (out.score < 0) out.score = 'N/A';
          }
        }
        for (_j = 0, _len2 = questionSet.length; _j < _len2; _j++) {
          i = questionSet[_j];
          letter = this._number_to_letter(data, i);
          assert(letter === 'a' || letter === 'b' || letter === 'c' || letter === 'd' || letter === 'e');
          out[letter]++;
        }
        assert(out.a + out.b + out.c + out.d + out.e === out.total, "Integrity problem in profile calculation");
        out.a_width = out.a * 100 / out.total;
        out.b_width = (out.a + out.b) * 100 / out.total;
        out.c_width = (out.a + out.b + out.c) * 100 / out.total;
        out.d_width = (out.a + out.b + out.c + out.d) * 100 / out.total;
        out.e_width = 100;
        return out;
      };

      ProfilePage.prototype._get_details = function(data, questionSet) {
        var out, x, _i, _len;
        out = {
          questions: []
        };
        for (_i = 0, _len = questionSet.length; _i < _len; _i++) {
          x = questionSet[_i];
          out.questions.push({
            number: x,
            l2006: this._number_to_letter(data.db_2006, x),
            l2008: this._number_to_letter(data.db_2008, x),
            l2010: this._number_to_letter(data.db_2010, x),
            l2012: this._number_to_letter(data.db_2012, x)
          });
        }
        return out;
      };

      ProfilePage.prototype._onToggleMode = function() {
        var animate, explanation, _viewPast;
        _viewPast = this.viewPast;
        this.viewPast = !$('#profile-toggle input').is(':checked');
        animate = !(_viewPast === this.viewPast);
        this._repaint();
        explanation = $('.explanation');
        if (!this.viewPast) {
          explanation.show();
          if (animate) {
            return $('.future').css('opacity', 0).animate({
              'opacity': 1
            }, 300);
          }
        } else {
          return explanation.hide();
        }
      };

      ProfilePage.prototype._onClick2014 = function(e) {
        var el, qnum, score, tr;
        el = $(e.delegateTarget);
        tr = el.parents('tr:first');
        qnum = tr.attr('data-question-number');
        score = el.attr('data-score');
        tr.find('img').removeClass('active').addClass('inactive');
        el.removeClass('inactive').addClass('active');
        this.db_2014[qnum] = parseInt(score);
        this._repaint2014();
        return this._animationHackScale($('.year-box.year-2014'));
      };

      ProfilePage.prototype._repaint2014 = function() {
        var score;
        score = reportGenerator.calculateScore(this.db_2014, reportGenerator.questionSet);
        score = Math.round(score);
        return $('.scores .year-2014 .bottom').text('Score: ' + score);
      };

      ProfilePage.prototype._animationHackScale = function(element, scale, time) {
        var _this = this;
        if (scale == null) scale = 1.3;
        if (time == null) time = 340;
        "Hacky function to make an element pulse to a new scale and back again.\nFollows a SIN wave. Looks like a heartbeat. Overwrites the font-size property. Hence hacky.";
        element = $(element);
        element.css('font-size', 100);
        return element.animate({
          'font-size': 0
        }, {
          duration: time,
          easing: 'linear',
          step: function(now, fx) {
            var x, _scale;
            x = (now * Math.PI) / 100;
            x = 1 + (Math.sin(x) * (scale - 1));
            _scale = 'scale(' + x + ',' + x + ')';
            return element.css({
              '-moz-transform': _scale,
              '-o-transform': _scale,
              '-ms-transform': _scale,
              '-webkit-transform': _scale,
              'transform': _scale
            });
          }
        });
      };

      return ProfilePage;

    })(Backbone.View);

  }).call(this);
  
}});

window.require.define({"views/page/rankings": function(exports, require, module) {
  (function() {
    var IBP_COLORS, ProjectPage, reportGenerator, template_page, template_rankings_row, template_rankings_tooltip, util,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
      __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

    template_page = require('views/templates/page/rankings');

    template_rankings_row = require('views/templates/rankings_row');

    template_rankings_tooltip = require('views/templates/rankings_tooltip');

    util = require('util');

    reportGenerator = require('views/reportgenerator');

    IBP_COLORS = ['#B7282E', '#F58024', '#DAC402', '#22aa33'];

    module.exports = ProjectPage = (function(_super) {

      __extends(ProjectPage, _super);

      function ProjectPage() {
        this._reflow = __bind(this._reflow, this);
        this._sortByNameToggle = __bind(this._sortByNameToggle, this);
        this._rankingsToggle = __bind(this._rankingsToggle, this);
        this.renderPage = __bind(this.renderPage, this);
        this.initialize = __bind(this.initialize, this);
        ProjectPage.__super__.constructor.apply(this, arguments);
      }

      ProjectPage.prototype.sortByName = false;

      ProjectPage.prototype.initialize = function() {
        return reportGenerator.bind('update', this._reflow);
      };

      ProjectPage.prototype.renderPage = function(target) {
        this.$el.html(template_page());
        target.html(this.$el);
        $('.sortbyname').click(this._sortByNameToggle);
        $('.sortbyname[data-sortbyname="' + this.sortByName + '"]').addClass('active');
        $('#rankings-toggles button').click(this._rankingsToggle);
        return $('button[data-year="2012"]').click();
      };

      ProjectPage.prototype._rankingsToggle = function(e) {
        var target;
        target = $(e.delegateTarget);
        $('#rankings-toggles button').removeClass('active');
        target.addClass('active');
        this.year = $(e.delegateTarget).attr('data-year');
        return this._reflow();
      };

      ProjectPage.prototype._count = function(array, search, questionSet) {
        var q, total, _i, _len;
        total = 0;
        for (_i = 0, _len = questionSet.length; _i < _len; _i++) {
          q = questionSet[_i];
          if (array[q] === search) total++;
        }
        return total;
      };

      ProjectPage.prototype._findScore = function(dataset, country, year) {
        var x, _i, _len;
        for (_i = 0, _len = dataset.length; _i < _len; _i++) {
          x = dataset[_i];
          if (x.alpha2 === country) return x[year];
        }
        return assert(false, 'couldnt find country: ' + country);
      };

      ProjectPage.prototype._sortByNameToggle = function(e) {
        var target;
        e.preventDefault();
        target = $(e.delegateTarget);
        $('.sortbyname').removeClass('active');
        target.addClass('active');
        this.sortByName = target.attr('data-sortbyname') === 'true';
        this._reflow();
        return false;
      };

      ProjectPage.prototype._reflow = function(dataset, questionSet, region) {
        var country, data, db, el, obj, selected_countries, target, _i, _j, _len, _len2, _ref, _ref2;
        if (dataset == null) dataset = reportGenerator.dataset;
        if (questionSet == null) questionSet = reportGenerator.questionSet;
        if (region == null) region = reportGenerator.region;
        target = $('#rankings-table tbody').empty();
        if (questionSet.length === 0) {
          target.html('<p style="margin: 4px 15px; font-weight: bold; min-width: 400px;">(No questions selected)</p>');
          return;
        }
        data = [];
        selected_countries = _EXPLORER_DATASET.regions[region].contains;
        _ref = _EXPLORER_DATASET.country;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          country = _ref[_i];
          if (!(('db_' + this.year) in country)) continue;
          if (!(_ref2 = country.alpha2, __indexOf.call(selected_countries, _ref2) >= 0)) {
            continue;
          }
          db = country['db_' + this.year];
          obj = {
            country: country.name,
            alpha2: country.alpha2,
            score: this._findScore(dataset, country.alpha2, this.year),
            a: this._count(db, 100, questionSet),
            b: this._count(db, 67, questionSet),
            c: this._count(db, 33, questionSet),
            d: this._count(db, 0, questionSet),
            e: this._count(db, -1, questionSet)
          };
          obj.total = obj.a + obj.b + obj.c + obj.d + obj.e;
          obj.a_width = (obj.a * 100) / obj.total;
          obj.b_width = (obj.b * 100) / obj.total;
          obj.c_width = (obj.c * 100) / obj.total;
          obj.d_width = (obj.d * 100) / obj.total;
          obj.e_width = (obj.e * 100) / obj.total;
          obj.b_left = obj.a_width;
          obj.c_left = obj.b_width + obj.b_left;
          obj.d_left = obj.c_width + obj.c_left;
          obj.e_left = obj.d_width + obj.d_left;
          data.push(obj);
        }
        if (this.sortByName) {
          data.sort(util.sortFunctionByName);
        } else {
          data.sort(util.sortFunction);
        }
        for (_j = 0, _len2 = data.length; _j < _len2; _j++) {
          obj = data[_j];
          if (obj.score < 0) obj.score = 'N/A';
          el = $(template_rankings_row(obj)).appendTo(target);
        }
        return $('.percentbar').tooltip({
          placement: 'right',
          delay: 50,
          animation: true
        });
      };

      return ProjectPage;

    })(Backbone.View);

  }).call(this);
  
}});

window.require.define({"views/page/splash": function(exports, require, module) {
  (function() {
    var SplashPage, template_page,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    template_page = require('views/templates/page/splash');

    module.exports = SplashPage = (function(_super) {

      __extends(SplashPage, _super);

      function SplashPage() {
        this.renderPage = __bind(this.renderPage, this);
        this.initialize = __bind(this.initialize, this);
        SplashPage.__super__.constructor.apply(this, arguments);
      }

      SplashPage.prototype.initialize = function() {};

      SplashPage.prototype.renderPage = function(target) {
        this.$el.html(template_page());
        return target.html(this.$el);
      };

      return SplashPage;

    })(Backbone.View);

  }).call(this);
  
}});

window.require.define({"views/page/timeline": function(exports, require, module) {
  (function() {
    var TimelinePage, reportGenerator, template_page, template_timeline_column, util,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
      __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

    template_page = require('views/templates/page/timeline');

    template_timeline_column = require('views/templates/timeline_column');

    util = require('util');

    reportGenerator = require('views/reportgenerator');

    module.exports = TimelinePage = (function(_super) {

      __extends(TimelinePage, _super);

      function TimelinePage() {
        this._redrawJsPlumb = __bind(this._redrawJsPlumb, this);
        this._mouseoverRanking = __bind(this._mouseoverRanking, this);
        this._updateReport = __bind(this._updateReport, this);
        this._buildRankingTable = __bind(this._buildRankingTable, this);
        this._onToggleMode = __bind(this._onToggleMode, this);
        this.renderPage = __bind(this.renderPage, this);
        this.initialize = __bind(this.initialize, this);
        TimelinePage.__super__.constructor.apply(this, arguments);
      }

      TimelinePage.prototype.initialize = function() {
        reportGenerator.bind('update', this._updateReport);
        reportGenerator.bind('resizeStart', jsPlumb.deleteEveryEndpoint);
        return reportGenerator.bind('resized', this._redrawJsPlumb);
      };

      TimelinePage.prototype.renderPage = function(target) {
        this.$el.html(template_page());
        target.html(this.$el);
        $('input[name="timeline"]').bind('change', this._onToggleMode);
        return this._updateReport();
      };

      TimelinePage.prototype._onToggleMode = function(showRank) {
        var value;
        if (showRank == null) showRank = true;
        value = $('input[name="timeline"]:checked').val();
        assert(value === 'rankings' || value === 'scores');
        if (value === 'rankings') {
          $('.timeline-cell-score').hide();
          return $('.timeline-cell-rank').show();
        } else {
          $('.timeline-cell-rank').hide();
          return $('.timeline-cell-score').show();
        }
      };

      TimelinePage.prototype._buildRankingTable = function(year, dataset, selected_countries) {
        var country, latest, n, obj, out, rank, tag_duplicates, x, _i, _j, _len, _len2, _ref, _ref2;
        out = [];
        for (country in dataset) {
          obj = dataset[country];
          if (!(year in obj)) continue;
          if (!(_ref = obj.alpha2, __indexOf.call(selected_countries, _ref) >= 0)) {
            continue;
          }
          obj.score = obj[year];
          out.push(obj);
        }
        out.sort(util.sortFunction);
        rank = 0;
        latest = 999;
        n = 0;
        tag_duplicates = [];
        for (_i = 0, _len = out.length; _i < _len; _i++) {
          x = out[_i];
          n += 1;
          if (x.score < latest) {
            latest = x.score;
            rank = n;
          } else {
            tag_duplicates.push(x.score);
          }
          x.rank = rank;
        }
        for (_j = 0, _len2 = out.length; _j < _len2; _j++) {
          x = out[_j];
          if (x.score < 0) {
            x.rank = 'N/A';
            x.score = 'N/A';
          }
          if (_ref2 = x.score, __indexOf.call(tag_duplicates, _ref2) >= 0) {
            x.rank = '= ' + x.rank;
          }
          x.score = Math.round(x.score);
        }
        return out;
      };

      TimelinePage.prototype._updateReport = function(dataset, questionSet, region, dataset_unrounded) {
        var html, selected_countries, target, year, _i, _len, _ref;
        if (dataset == null) dataset = reportGenerator.dataset;
        if (questionSet == null) questionSet = reportGenerator.questionSet;
        if (region == null) region = reportGenerator.region;
        if (dataset_unrounded == null) {
          dataset_unrounded = reportGenerator.dataset_unrounded;
        }
        target = $('#timeline-columns');
        if (target.length === 0) return;
        html = '';
        selected_countries = _EXPLORER_DATASET.regions[region].contains;
        _ref = [2006, 2008, 2010, 2012];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          year = _ref[_i];
          html += template_timeline_column({
            year: year,
            data: this._buildRankingTable(year, dataset_unrounded, selected_countries)
          });
        }
        target.html(html);
        target.find('tr').bind('mouseover', this._mouseoverRanking);
        if (!this.mouseoverAlpha2) {
          this.mouseoverAlpha2 = $('#timeline-column-2012 tbody tr:first-child').attr('data-alpha2');
        }
        this._redrawJsPlumb();
        return this._onToggleMode();
      };

      TimelinePage.prototype._mouseoverRanking = function(e) {
        var alpha2, el;
        el = $(e.delegateTarget);
        alpha2 = el.attr('data-alpha2');
        if (alpha2 && !(alpha2 === this.mouseoverAlpha2)) {
          return this._redrawJsPlumb(alpha2);
        }
      };

      TimelinePage.prototype._redrawJsPlumb = function(alpha2) {
        var els;
        if (alpha2 == null) alpha2 = null;
        if (alpha2) this.mouseoverAlpha2 = alpha2;
        $('.hover').removeClass('hover');
        els = $('.timeline-row-' + this.mouseoverAlpha2);
        if (!els.length) return;
        els.addClass('hover');
        jsPlumb.deleteEveryEndpoint();
        if (this.timeout) clearTimeout(this.timeout);
        return this.timeout = setTimeout(function() {
          var x, _ref;
          for (x = 0, _ref = els.length - 1; 0 <= _ref ? x < _ref : x > _ref; 0 <= _ref ? x++ : x--) {
            jsPlumb.connect({
              source: els[x],
              target: els[x + 1],
              overlays: jsPlumb._custom_overlay
            });
          }
          return this.timeout = null;
        }, 50);
      };

      return TimelinePage;

    })(Backbone.View);

  }).call(this);
  
}});

window.require.define({"views/reportgenerator": function(exports, require, module) {
  (function() {
    var ReportGenerator, debug, template,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    template = require('views/templates/reportgenerator');

    debug = false;

    ReportGenerator = (function(_super) {

      __extends(ReportGenerator, _super);

      function ReportGenerator() {
        this._clickBoxToggle = __bind(this._clickBoxToggle, this);
        this._clickRegionToggle = __bind(this._clickRegionToggle, this);
        this._clickGroupToggle = __bind(this._clickGroupToggle, this);
        this._setSubtitle = __bind(this._setSubtitle, this);
        this._expand_collapse = __bind(this._expand_collapse, this);
        this._select_or_clear = __bind(this._select_or_clear, this);
        this._updated = __bind(this._updated, this);
        this.calculateScore = __bind(this.calculateScore, this);
        this.render = __bind(this.render, this);
        this.setInitialState = __bind(this.setInitialState, this);
        this.debugReports = __bind(this.debugReports, this);
        this.initialize = __bind(this.initialize, this);
        ReportGenerator.__super__.constructor.apply(this, arguments);
      }

      ReportGenerator.prototype.initialize = function() {
        if (debug) this.debugReports();
        return this.region = 0;
      };

      ReportGenerator.prototype.debugReports = function() {
        var country, expected, obi_questions, score, year, _i, _j, _len, _len2, _ref, _ref2;
        obi_questions = _EXPLORER_DATASET.groupings[0].entries[0].qs;
        _ref = _EXPLORER_DATASET.country;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          country = _ref[_i];
          _ref2 = ['db_2006', 'db_2008', 'db_2010', 'db_2012'];
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            year = _ref2[_j];
            if (year in country) {
              score = this.calculateScore(country[year], obi_questions);
              expected = country[year].obi;
              if (!(Math.round(expected * 100) === Math.round(score * 100))) {
                console.warn('Warning ' + country.name + '.' + year + ' failed data integrity test. Expected OBI=' + expected + '; I calculated ' + score);
              }
            }
          }
        }
        return console.log('[debug] Data integrity check complete.');
      };

      ReportGenerator.prototype.setInitialState = function() {
        return this.$el.find('#group-0').click();
      };

      ReportGenerator.prototype.render = function(target) {
        var renderData, x,
          _this = this;
        renderData = {
          groupings0: _EXPLORER_DATASET.groupings.slice(0, 3),
          groupings1: _EXPLORER_DATASET.groupings.slice(3, 5),
          question: (function() {
            var _results;
            _results = [];
            for (x in _EXPLORER_DATASET.question) {
              _results.push(_EXPLORER_DATASET.question[x]);
            }
            return _results;
          })(),
          country: _EXPLORER_DATASET.country,
          regions: _EXPLORER_DATASET.regions
        };
        this.$el.html(template(renderData));
        target.empty().append(this.$el);
        this.$el.find('.group-toggler').bind('mouseover', this._hoverGroupToggle);
        this.$el.find('.group-toggler').bind('click', this._clickGroupToggle);
        this.$el.find('.region-toggler').bind('click', this._clickRegionToggle);
        this.$el.find('.group-toggler').bind('mouseout', function(e) {
          return _this.$el.find('.toggle-box').removeClass('hover');
        });
        this.$el.find('.toggle-box').bind('click', this._clickBoxToggle);
        this.$el.find('.nav a').bind('click', this._expand_collapse);
        this.$el.find('.select-or-clear button').bind('click', this._select_or_clear);
        this.$el.find('.toggle-box').tooltip({
          placement: 'left',
          delay: 100,
          animation: true
        });
        this.$el.find('#region-' + this.region).addClass('active');
        this.$el.find('#accordion2').on('show', function() {
          return $('.customize-link').html('&laquo; Hide options');
        });
        return this.$el.find('#accordion2').on('hide', function() {
          return $('.customize-link').html('Customize Report &raquo;');
        });
      };

      ReportGenerator.prototype.calculateScore = function(db, questionSet, verbose) {
        var acc, count, x, _i, _len;
        if (verbose == null) verbose = false;
        if (questionSet.length === 0) return 0;
        acc = 0;
        count = 0;
        for (_i = 0, _len = questionSet.length; _i < _len; _i++) {
          x = questionSet[_i];
          if (db[x] >= 0) {
            acc += db[x];
            count++;
          }
        }
        if (count === 0) return -1;
        if (verbose) {
          console.log('result', acc, count, acc / count, Math.round(acc / count), questionSet);
        }
        return acc / count;
      };

      ReportGenerator.prototype._updated = function() {
        var country, e, el, obj, score, x, year, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _m, _ref, _ref2, _ref3, _ref4, _ref5;
        this.questionSet = [];
        el = $('.toggle-box.select');
        _ref = el || [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          e = _ref[_i];
          this.questionSet.push(parseInt($(e).attr('id').substr(7)));
        }
        this.dataset_unrounded = [];
        _ref2 = _EXPLORER_DATASET.country;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          country = _ref2[_j];
          obj = {
            country: country.name,
            alpha2: country.alpha2
          };
          _ref3 = [2006, 2008, 2010, 2012];
          for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
            year = _ref3[_k];
            if (!(('db_' + year) in country)) continue;
            score = this.calculateScore(country['db_' + year], this.questionSet);
            obj[year] = score;
          }
          this.dataset_unrounded.push(obj);
        }
        this.dataset = [];
        _ref4 = this.dataset_unrounded;
        for (_l = 0, _len4 = _ref4.length; _l < _len4; _l++) {
          x = _ref4[_l];
          obj = $.extend({}, x);
          _ref5 = [2006, 2008, 2010, 2012];
          for (_m = 0, _len5 = _ref5.length; _m < _len5; _m++) {
            year = _ref5[_m];
            if (!(year in obj)) continue;
            obj[year] = Math.round(obj[year]);
          }
          this.dataset.push(obj);
        }
        return this.trigger('update', this.dataset, this.questionSet, this.region, this.dataset_unrounded);
      };

      ReportGenerator.prototype._select_or_clear = function(e) {
        var el;
        this._setSubtitle();
        this.$el.find('.group-toggler').removeClass('active');
        el = $(e.delegateTarget);
        if (el.hasClass('select')) {
          $('.toggle-box').addClass('select');
        } else if (el.hasClass('clear')) {
          $('.toggle-box').removeClass('select');
        }
        return this._updated();
      };

      ReportGenerator.prototype._expand_collapse = function(e) {
        var inner, li;
        e.preventDefault();
        inner = this.$el.find('.inner');
        li = ($(e.delegateTarget)).parents('li');
        this.$el.find('.nav li').removeClass('active');
        li.addClass('active');
        if (li.hasClass('more-options')) {
          this.trigger('resizeStart');
          inner.find('> .more').show(200);
          inner.find('> .less').hide(200);
        } else if (li.hasClass('less-options')) {
          this.trigger('resizeStart');
          this.$el.find('.inner .group-toggler:first').click();
          this.$el.find('.inner .region-toggler:first').click();
          inner.find('> .more').hide(200);
          inner.find('> .less').show(200);
        }
        return false;
      };

      ReportGenerator.prototype._setSubtitle = function(title) {
        if (title == null) title = 'Custom Report';
        return this.$el.find('.subtitle').html(title);
      };

      ReportGenerator.prototype._hoverGroupToggle = function(e) {
        var el, group;
        el = $(e.delegateTarget);
        group = el.attr('id');
        return $('#toggle-boxes .' + group).addClass('hover');
      };

      ReportGenerator.prototype._clickGroupToggle = function(e) {
        var el, group, x;
        e.preventDefault();
        el = $(e.delegateTarget);
        group = el.attr('id');
        this.$el.find('.group-toggler').removeClass('active');
        el.addClass('active');
        this._setSubtitle(el.text());
        x = this.$el.find('#toggle-boxes');
        x.find('.toggle-box').removeClass('select');
        x.find(' .' + group).addClass('select');
        this._updated();
        return false;
      };

      ReportGenerator.prototype._clickRegionToggle = function(e) {
        var el;
        e.preventDefault();
        el = $(e.delegateTarget);
        this.region = parseInt(el.attr('id').replace('region-', ''));
        this.$el.find('.region-toggler').removeClass('active');
        el.addClass('active');
        this._updated();
        return false;
      };

      ReportGenerator.prototype._clickBoxToggle = function(e) {
        var el;
        e.preventDefault();
        el = $(e.delegateTarget);
        if (el.hasClass('select')) {
          el.removeClass('select');
        } else {
          el.addClass('select');
        }
        this._setSubtitle();
        this.$el.find('.group-toggler').removeClass('active');
        this._updated();
        return false;
      };

      return ReportGenerator;

    })(Backbone.View);

    module.exports = new ReportGenerator();

  }).call(this);
  
}});

window.require.define({"views/templates/availability_row": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<tr>\n    <td class=\"country\"><a href=\"#profile/";
    foundHelper = helpers.alpha2;
    stack1 = foundHelper || depth0.alpha2;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "alpha2", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a></td>\n    <td class=\"flag\"><img src=\"images/flags/";
    foundHelper = helpers.alpha2;
    stack1 = foundHelper || depth0.alpha2;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "alpha2", { hash: {} }); }
    buffer += escapeExpression(stack1) + ".GIF\"/></td>\n    <td class=\"dot\"><img src=\"images/dot/";
    foundHelper = helpers.prebudgetstatement;
    stack1 = foundHelper || depth0.prebudgetstatement;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "prebudgetstatement", { hash: {} }); }
    buffer += escapeExpression(stack1) + ".png\"/></td>\n    <td class=\"dot\"><img src=\"images/dot/";
    foundHelper = helpers.executivesbudgetproposal;
    stack1 = foundHelper || depth0.executivesbudgetproposal;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "executivesbudgetproposal", { hash: {} }); }
    buffer += escapeExpression(stack1) + ".png\"/></td>\n    <td class=\"dot\"><img src=\"images/dot/";
    foundHelper = helpers.enactedbudget;
    stack1 = foundHelper || depth0.enactedbudget;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "enactedbudget", { hash: {} }); }
    buffer += escapeExpression(stack1) + ".png\"/></td>\n    <td class=\"dot\"><img src=\"images/dot/";
    foundHelper = helpers.citizensbudget;
    stack1 = foundHelper || depth0.citizensbudget;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "citizensbudget", { hash: {} }); }
    buffer += escapeExpression(stack1) + ".png\"/></td>\n    <td class=\"dot\"><img src=\"images/dot/";
    foundHelper = helpers.inyearreports;
    stack1 = foundHelper || depth0.inyearreports;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "inyearreports", { hash: {} }); }
    buffer += escapeExpression(stack1) + ".png\"/></td>\n    <td class=\"dot\"><img src=\"images/dot/";
    foundHelper = helpers.midyearreview;
    stack1 = foundHelper || depth0.midyearreview;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "midyearreview", { hash: {} }); }
    buffer += escapeExpression(stack1) + ".png\"/></td>\n    <td class=\"dot\"><img src=\"images/dot/";
    foundHelper = helpers.yearendreport;
    stack1 = foundHelper || depth0.yearendreport;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "yearendreport", { hash: {} }); }
    buffer += escapeExpression(stack1) + ".png\"/></td>\n    <td class=\"dot\"><img src=\"images/dot/";
    foundHelper = helpers.auditreport;
    stack1 = foundHelper || depth0.auditreport;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "auditreport", { hash: {} }); }
    buffer += escapeExpression(stack1) + ".png\"/></td>\n</tr>\n";
    return buffer;});
}});

window.require.define({"views/templates/explorer": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div id=\"report-generator\">\n</div>\n<div id=\"explorer\">\n</div>\n\n";});
}});

window.require.define({"views/templates/page/availability": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"document-availability\">\n    <h2>Public Availability of Budget Documents</h2>\n\n    <div class=\"col4\">\n      <table id=\"availability-key\">\n        <tr>\n            <th colspan=\"2\">Key</th>\n            </tr>\n            <tr>\n                <td class=\"dot\"><img src=\"images/dot/PW.png\"/></td>\n                <td class=\"text\">Available to the public</td>\n            </tr>\n            <tr>\n                <td class=\"dot\"><img src=\"images/dot/IU.png\"/></td>\n                <td class=\"text\">Available for internal use</td>\n            </tr>\n            <tr>\n                <td class=\"dot\"><img src=\"images/dot/NP.png\"/></td>\n                <td class=\"text\">Not produced</td>\n            </tr>\n      </table>\n      <div id=\"region\">\n          <h6><img src=\"images/world.png\"> Region</h6>\n          <ul id=\"av-region-toggler\">\n              <li><a id=\"region-0\" class=\"av-region-toggler active\" href=\"#\">Entire World</a></li>\n              <li><a id=\"region-1\" class=\"av-region-toggler\" href=\"#\">East Asia &amp; Pacific</a></li>\n              <li><a id=\"region-2\" class=\"av-region-toggler\" href=\"#\">Eastern Europe &amp; Central Asia</a></li>\n              <li><a id=\"region-3\" class=\"av-region-toggler\" href=\"#\">Latin America &amp; Caribbean</a></li>\n              <li><a id=\"region-4\" class=\"av-region-toggler\" href=\"#\">Middle East &amp; North Africa</a></li>\n              <li><a id=\"region-5\" class=\"av-region-toggler\" href=\"#\">South Asia</a></li>\n              <li><a id=\"region-6\" class=\"av-region-toggler\" href=\"#\">Sub-Saharan Africa</a></li>\n              <li><a id=\"region-7\" class=\"av-region-toggler\" href=\"#\">Western Europe &amp; the U.S.</a></li>\n          </ul>\n        </div>\n    </div>\n    <div class=\"col8\">\n        <div class=\"year-selector btn-group\" id=\"year-toggles\">\n            <button data-year=\"2006\" class=\"btn\">2006</button>\n            <button data-year=\"2008\" class=\"btn\">2008</button>\n            <button data-year=\"2010\" class=\"btn\">2010</button>\n            <button data-year=\"2012\" class=\"btn\">2012</button>\n        </div>\n        <table id=\"availability\" class=\"table table-striped table-condensed\">\n            <thead>\n                <tr>\n                    <td class=\"country\">&nbsp;</td>\n                    <td class=\"flag\">&nbsp;</td>\n                    <td class=\"dot\">Pre-Budget Statement</td>\n                    <td class=\"dot\">Executive's Budget Proposal</td>\n                    <td class=\"dot\">Enacted Budget</td>\n                    <td class=\"dot\">Citizens Budget</td>\n                    <td class=\"dot\">In-Year Reports</td>\n                    <td class=\"dot\">Mid-Year Review</td>\n                    <td class=\"dot\">Year-End Report</td>\n                    <td class=\"dot\">Audit Report</td>\n                </tr>\n            </thead>\n            <tbody>\n            </tbody>\n        </table>\n    </div>\n    <div class=\"clearfix\"></div>\n</div>";});
}});

window.require.define({"views/templates/page/download": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n        <tr><td style=\"text-align: right;\">";
    foundHelper = helpers.format;
    stack1 = foundHelper || depth0.format;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "format", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td><a href=\"downloads/";
    foundHelper = helpers.filename;
    stack1 = foundHelper || depth0.filename;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "filename", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    foundHelper = helpers.filename;
    stack1 = foundHelper || depth0.filename;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "filename", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a> (";
    foundHelper = helpers.size;
    stack1 = foundHelper || depth0.size;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "size", { hash: {} }); }
    buffer += escapeExpression(stack1) + ")</td></tr>\n      ";
    return buffer;}

    buffer += "<div class=\"pull-left download-data1\">\n  <h2>Download the Entire Dataset</h2>\n  <p>The entire dataset encompassing the 2006-2012 surveys is available in multiple formats:</p>\n  <table class=\"table table-bordered\" style=\"width: 300px;\"\n      <tr><th style=\"text-align: right;\">Format</th><th>Filename</th></tr>\n      ";
    foundHelper = helpers.downloads;
    stack1 = foundHelper || depth0.downloads;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  </table>\n</div>\n<div class=\"pull-left download-data2\">\n  <h2>Save Custom Report</h2>\n  <p>The report generated in your browser can be saved to disk as a CSV. Copy the contents of the textbox below, or click \"Save To Disk\".</p>\n  <label class=\"radio inline\">\n    <input type=\"radio\" name=\"downloadyear\" value=\"all\" checked>\n      All&nbsp;years\n  </label>\n  <label class=\"radio inline\">\n    <input type=\"radio\" name=\"downloadyear\" value=\"2006\">\n      2006\n  </label>\n  <label class=\"radio inline\">\n    <input type=\"radio\" name=\"downloadyear\" value=\"2008\">\n      2008\n  </label>\n  <label class=\"radio inline\">\n    <input type=\"radio\" name=\"downloadyear\" value=\"2010\">\n      2010\n  </label>\n  <label class=\"radio inline\">\n    <input type=\"radio\" name=\"downloadyear\" value=\"2012\">\n      2012\n  </label>\n\n  <p id=\"downloadify\">\n    <b>\"Save To Disk\" not available. (Requires Flash 10).</b><br/> This file cannot be downloaded automatically: Click on the textbox, then use cut-and-paste to save the contents into a text file on your computer.\n  </p>\n  <textarea id=\"custom-csv\"\" readonly>\n    Loading...\n  </textarea>\n</div>\n<div class=\"clearfix\"></div>\n";
    return buffer;});
}});

window.require.define({"views/templates/page/map": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"year-selector btn-group\" id=\"map-toggles\">\n    <button data-year=\"2006\" class=\"btn\">2006</button>\n    <button data-year=\"2008\" class=\"btn\">2008</button>\n    <button data-year=\"2010\" class=\"btn\">2010</button>\n    <button data-year=\"2012\" class=\"btn\">2012</button>\n</div>\n<div id=\"map\" class=\"pull-left\"></div>\n<div id=\"map-gradient\" class=\"pull-left\"></div>\n<div id=\"map-gradient-label\" class=\"pull-left\">\n  <p class=\"first\">100</p>\n  <p>80</p>\n  <p>60</p>\n  <p>40</p>\n  <p class=\"penultimate\">20</p>\n  <p>0</p>\n</div>\n<div class=\"clearfix\"></div>\n";});
}});

window.require.define({"views/templates/page/profile": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n<option value=\"";
    foundHelper = helpers.alpha2;
    stack1 = foundHelper || depth0.alpha2;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "alpha2", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</option>\n";
    return buffer;}

  function program3(depth0,data) {
    
    
    return "\n  <h3>Select a country...</h3>\n";}

  function program5(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n  ";
    foundHelper = helpers.main_website_url;
    stack1 = foundHelper || depth0.main_website_url;
    stack2 = helpers['if'];
    tmp1 = self.program(6, program6, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  <h3>Country Datasheet: ";
    foundHelper = helpers.data;
    stack1 = foundHelper || depth0.data;
    stack2 = helpers['with'];
    tmp1 = self.program(9, program9, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += " (";
    foundHelper = helpers.alpha2;
    stack1 = foundHelper || depth0.alpha2;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "alpha2", { hash: {} }); }
    buffer += escapeExpression(stack1) + ")</h3>\n  <table class=\"percentages\">\n  </table>\n  <div id=\"profile-mode\">\n    <div class=\"scores\">\n      <div class=\"year-box year-2006 badge\">\n        <span class=\"top\">2006</span><span class=\"bottom\"></span>\n      </div>\n      <div class=\"year-box year-2008 badge\">\n        <span class=\"top\">2008</span><span class=\"bottom\"></span>\n      </div>\n      <div class=\"year-box year-2010 badge\">\n        <span class=\"top\">2010</span><span class=\"bottom\"></span>\n      </div>\n      <div class=\"year-box year-2012 badge\">\n        <span class=\"top\">2012</span><span class=\"bottom\"></span>\n      </div>\n      <div class=\"year-box year-2014 badge badge-success future\">\n        <span class=\"top\">2014</span><span class=\"bottom\"></span>\n      </div>\n      <div class=\"clearfix\"></div>\n    </div>\n    <br/>\n    <div>\n      <label class=\"checkbox\" id=\"profile-toggle\">\n          <input type=\"checkbox\"> Show 2014 Calculator...\n      </label>\n    </div>\n    <p class=\"explanation future\">Click on the letters below to calculate the possible outcome of the 2014 survey.<br/>Changing the value of a question automatically updates the score.</p>\n  </div>\n  <div style=\"position: relative;\">\n    <div class=\"details\"></div>\n    <div class=\"question-box\">\n    </div>\n  </div>\n  <div class=\"clearfix\"></div>\n";
    return buffer;}
  function program6(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n    <a class=\"main-website-link\" href=\"";
    foundHelper = helpers.main_website_url;
    stack1 = foundHelper || depth0.main_website_url;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "main_website_url", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">View ";
    foundHelper = helpers.data;
    stack1 = foundHelper || depth0.data;
    stack2 = helpers['with'];
    tmp1 = self.program(7, program7, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += " on IBP Site &raquo;</a>\n  ";
    return buffer;}
  function program7(depth0,data) {
    
    var stack1;
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    return escapeExpression(stack1);}

  function program9(depth0,data) {
    
    var stack1;
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    return escapeExpression(stack1);}

    buffer += "<div class=\"country-nav-select-outer\">\n<h3>Country:&nbsp;&nbsp;\n<select class=\"country-nav-select\">\n<option value=\"\">Select a country...</option>\n";
    foundHelper = helpers.countries;
    stack1 = foundHelper || depth0.countries;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</select></h3>\n</div>\n<div id=\"country-profile\">\n";
    foundHelper = helpers.empty;
    stack1 = foundHelper || depth0.empty;
    stack2 = helpers['if'];
    tmp1 = self.program(3, program3, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.program(5, program5, data);
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</div>\n";
    return buffer;});
}});

window.require.define({"views/templates/page/rankings": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"country-rankings\">\n    <div class=\"year-selector btn-group\" id=\"rankings-toggles\">\n        <button data-year=\"2006\" class=\"btn\">2006</button>\n        <button data-year=\"2008\" class=\"btn\">2008</button>\n        <button data-year=\"2010\" class=\"btn\">2010</button>\n        <button data-year=\"2012\" class=\"btn\">2012</button>\n    </div>\n    <table id=\"rankings-table\">\n        <thead>\n            <tr>\n                <th class=\"col1\" colspan=\"2\"><a href=\"#\" class=\"sortbyname\" data-sortbyname=\"true\"><span class=\"text\">Name</span> <span class=\"caret\"></span></a></th>\n                <th class=\"col2\" colspan=\"2\"><a href=\"#\" class=\"sortbyname\" data-sortbyname=\"false\"><span class=\"text\">Score</span> <span class=\"caret\"></span></a></th>\n            </tr>\n        </thead>\n        <tbody></tbody>\n    </table>\n</div>\n";});
}});

window.require.define({"views/templates/page/rawdata": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n      <li>";
    foundHelper = helpers.alpha2;
    stack1 = foundHelper || depth0.alpha2;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "alpha2", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</li>\n    ";
    return buffer;}

  function program3(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n    <div class=\"question\">\n      ";
    foundHelper = helpers.in_index;
    stack1 = foundHelper || depth0.in_index;
    stack2 = helpers['if'];
    tmp1 = self.program(4, program4, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n      <span class=\"text\">\n          <span class=\"number\">";
    foundHelper = helpers.number;
    stack1 = foundHelper || depth0.number;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "number", { hash: {} }); }
    buffer += escapeExpression(stack1) + ": </span> \n          ";
    foundHelper = helpers.text;
    stack1 = foundHelper || depth0.text;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "text", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\n          <a class=\"expand\" href=\"#\">[...]</a>\n      </span>\n      <span class=\"answer a\"><span class=\"prefix\">A: </span>";
    foundHelper = helpers['a'];
    stack1 = foundHelper || depth0['a'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "a", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</span>\n      <span class=\"answer b\"><span class=\"prefix\">B: </span>";
    foundHelper = helpers['b'];
    stack1 = foundHelper || depth0['b'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "b", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</span>\n      <span class=\"answer c\"><span class=\"prefix\">C: </span>";
    foundHelper = helpers['c'];
    stack1 = foundHelper || depth0['c'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "c", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</span>\n      ";
    foundHelper = helpers['d'];
    stack1 = foundHelper || depth0['d'];
    stack2 = helpers['if'];
    tmp1 = self.program(6, program6, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n      ";
    foundHelper = helpers['e'];
    stack1 = foundHelper || depth0['e'];
    stack2 = helpers['if'];
    tmp1 = self.program(8, program8, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n    </div>\n    ";
    return buffer;}
  function program4(depth0,data) {
    
    
    return "<span class=\"label\">index</span>";}

  function program6(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "<span class=\"answer d\"><span class=\"prefix\">D: </span>";
    foundHelper = helpers['d'];
    stack1 = foundHelper || depth0['d'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "d", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</span>";
    return buffer;}

  function program8(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "<span class=\"answer e\"><span class=\"prefix\">E: </span>";
    foundHelper = helpers['e'];
    stack1 = foundHelper || depth0['e'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "e", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</span>";
    return buffer;}

  function program10(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n        <h4 style=\"border-bottom: 1px solid #000; margin-top: 15px;\">";
    foundHelper = helpers.by;
    stack1 = foundHelper || depth0.by;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "by", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h4>\n        ";
    foundHelper = helpers.entries;
    stack1 = foundHelper || depth0.entries;
    stack2 = helpers.each;
    tmp1 = self.program(11, program11, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n    ";
    return buffer;}
  function program11(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n            <h6 style=\"margin-bottom: 0;\">";
    foundHelper = helpers.title;
    stack1 = foundHelper || depth0.title;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
    buffer += escapeExpression(stack1) + ":</h6>\n            <p>";
    foundHelper = helpers.qs;
    stack1 = foundHelper || depth0.qs;
    stack2 = helpers.each;
    tmp1 = self.program(12, program12, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "</p>\n        ";
    return buffer;}
  function program12(depth0,data) {
    
    var buffer = "", stack1;
    stack1 = depth0;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
    buffer += escapeExpression(stack1) + ", ";
    return buffer;}

    buffer += "<div class=\"row\">\n<div class=\"span2\">\n    <h3>Countries</h3>\n    <ul>\n    ";
    foundHelper = helpers.country;
    stack1 = foundHelper || depth0.country;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n    </ul>\n</div>\n<div class=\"span6\">\n    <h3>Questions</h3>\n    ";
    foundHelper = helpers.question;
    stack1 = foundHelper || depth0.question;
    stack2 = helpers.each;
    tmp1 = self.program(3, program3, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</div>\n<div class=\"span4\">\n    <h3>Groupings</h3>\n    ";
    foundHelper = helpers.groupings;
    stack1 = foundHelper || depth0.groupings;
    stack2 = helpers.each;
    tmp1 = self.program(10, program10, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</div>\n</div>\n";
    return buffer;});
}});

window.require.define({"views/templates/page/splash": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"splash\">\n  <a href=\"#map\" class=\"banner\">\n    The <strong>Open Budget Survey</strong> is a comprehensive analysis and survey that evaluates whether governments give the public access to budget information and opportunities to participate in the budget process at the national level. The Survey also assesses the capacity and independence of formal oversight institutions. The IBP works with civil society partners in 100 countries to collect the data for the Survey.\n  </a>\n  <div class=\"row\">\n    <div class=\"span4\">\n      <a class=\"pod rankings\" href=\"#rankings\">To easily measure the commitment to transparency, IBP created the <strong>Open Budget Index</strong> from the Survey. </a>\n    </div>\n    <div class=\"span4\">\n      <a class=\"pod timeline\" href=\"#timeline\">The <strong>Open Budget Index</strong> allows for comparisons among countries and across years.\n      </a>\n    </div>\n    <div class=\"span4\">\n      <a class=\"pod calculator\" href=\"#profile\">Use the <strong>2014 calculator</strong> to predict the outcome of the next survey and see where transparency can improve.</a>\n    </div>\n  </div>\n</div>\n";});
}});

window.require.define({"views/templates/page/timeline": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"timeline-header\">\n    <h2 class=\"pull-left\">Timeline</h2>\n    <h4 class=\"pull-left\">View:</h4>\n    <div class=\"timeline-toggle pull-left\">\n      <label class=\"radio\">\n        <input type=\"radio\" name=\"timeline\" value=\"rankings\" checked>\n        Rankings\n      </label>\n      <label class=\"radio\">\n        <input type=\"radio\" name=\"timeline\" value=\"scores\">\n        Scores\n      </label>\n    </div>\n    <div class=\"clearfix\"></div>\n</div>\n<div id=\"timeline-columns\"></div>\n";});
}});

window.require.define({"views/templates/profile_details": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n  <tr class=\"question-row\" data-question-number=\"";
    foundHelper = helpers.number;
    stack1 = foundHelper || depth0.number;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "number", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n    <td class=\"number\">";
    foundHelper = helpers.number;
    stack1 = foundHelper || depth0.number;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "number", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td>\n    <td class=\"letter\">";
    foundHelper = helpers.l2006;
    stack1 = foundHelper || depth0.l2006;
    stack2 = helpers['if'];
    tmp1 = self.program(2, program2, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.program(4, program4, data);
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "</td>\n    <td class=\"letter\">";
    foundHelper = helpers.l2008;
    stack1 = foundHelper || depth0.l2008;
    stack2 = helpers['if'];
    tmp1 = self.program(6, program6, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.program(8, program8, data);
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "</td>\n    <td class=\"letter\">";
    foundHelper = helpers.l2010;
    stack1 = foundHelper || depth0.l2010;
    stack2 = helpers['if'];
    tmp1 = self.program(10, program10, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.program(12, program12, data);
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "</td>\n    <td class=\"letter\">";
    foundHelper = helpers.l2012;
    stack1 = foundHelper || depth0.l2012;
    stack2 = helpers['if'];
    tmp1 = self.program(14, program14, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.program(16, program16, data);
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "</td>\n    <td class=\"space\"></td>\n  </tr>\n  ";
    return buffer;}
  function program2(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "<img src=\"images/letter/";
    foundHelper = helpers.l2006;
    stack1 = foundHelper || depth0.l2006;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "l2006", { hash: {} }); }
    buffer += escapeExpression(stack1) + ".png\"/>";
    return buffer;}

  function program4(depth0,data) {
    
    
    return "-";}

  function program6(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "<img src=\"images/letter/";
    foundHelper = helpers.l2008;
    stack1 = foundHelper || depth0.l2008;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "l2008", { hash: {} }); }
    buffer += escapeExpression(stack1) + ".png\"/>";
    return buffer;}

  function program8(depth0,data) {
    
    
    return "-";}

  function program10(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "<img src=\"images/letter/";
    foundHelper = helpers.l2010;
    stack1 = foundHelper || depth0.l2010;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "l2010", { hash: {} }); }
    buffer += escapeExpression(stack1) + ".png\"/>";
    return buffer;}

  function program12(depth0,data) {
    
    
    return "-";}

  function program14(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "<img src=\"images/letter/";
    foundHelper = helpers.l2012;
    stack1 = foundHelper || depth0.l2012;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "l2012", { hash: {} }); }
    buffer += escapeExpression(stack1) + ".png\"/>";
    return buffer;}

  function program16(depth0,data) {
    
    
    return "-";}

    buffer += "\n<table class=\"table table-condensed\">\n  <tr>\n    <th></th>\n    <th><span class=\"badge\">2006</span></th>\n    <th><span class=\"badge\">2008</span></th>\n    <th><span class=\"badge\">2010</span></th>\n    <th><span class=\"badge\">2012</span></th>\n    <th class=\"space\"></th>\n  </tr>\n  ";
    foundHelper = helpers.questions;
    stack1 = foundHelper || depth0.questions;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</table>\n";
    return buffer;});
}});

window.require.define({"views/templates/profile_details_future": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n  <tr class=\"question-row\" data-question-number=\"";
    foundHelper = helpers.number;
    stack1 = foundHelper || depth0.number;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "number", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n    <td class=\"number\">";
    foundHelper = helpers.number;
    stack1 = foundHelper || depth0.number;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "number", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td>\n    <td class=\"letter\">";
    foundHelper = helpers.l2012;
    stack1 = foundHelper || depth0.l2012;
    stack2 = helpers['if'];
    tmp1 = self.program(2, program2, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.program(4, program4, data);
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "</td>\n    <td class=\"letter multi\">\n      ";
    foundHelper = helpers.l2012;
    stack1 = foundHelper || depth0.l2012;
    stack2 = helpers['if'];
    tmp1 = self.program(6, program6, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.program(8, program8, data);
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n    </td>\n    <td class=\"space\"></td>\n  </tr>\n  ";
    return buffer;}
  function program2(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "<img src=\"images/letter/";
    foundHelper = helpers.l2012;
    stack1 = foundHelper || depth0.l2012;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "l2012", { hash: {} }); }
    buffer += escapeExpression(stack1) + ".png\"/>";
    return buffer;}

  function program4(depth0,data) {
    
    
    return "-";}

  function program6(depth0,data) {
    
    
    return "\n        <img src=\"images/letter/a.png\" class=\"inactive\" data-score=\"100\"/>\n        <img src=\"images/letter/b.png\" class=\"inactive\" data-score=\"67\"/>\n        <img src=\"images/letter/c.png\" class=\"inactive\" data-score=\"33\"/>\n        <img src=\"images/letter/d.png\" class=\"inactive\" data-score=\"0\"/>\n        <img src=\"images/letter/e.png\" class=\"inactive\" data-score=\"-1\"/>\n      ";}

  function program8(depth0,data) {
    
    
    return "\n        -\n      ";}

    buffer += "\n<table class=\"table table-condensed\">\n  <tr>\n    <th></th>\n    <th><span class=\"badge\">2012</span></th>\n    <th><span class=\"badge badge-success\">2014</span></th>\n    <th class=\"space\"></th>\n  </tr>\n  ";
    foundHelper = helpers.questions;
    stack1 = foundHelper || depth0.questions;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</table>\n";
    return buffer;});
}});

window.require.define({"views/templates/profile_percentages": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n  <tr>\n    <td class=\"year\"><span class=\"badge\">";
    foundHelper = helpers.year;
    stack1 = foundHelper || depth0.year;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "year", { hash: {} }); }
    buffer += escapeExpression(stack1) + ":</span></td>\n    <td class=\"score\">";
    foundHelper = helpers.not_defined;
    stack1 = foundHelper || depth0.not_defined;
    stack2 = helpers['if'];
    tmp1 = self.program(2, program2, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.program(4, program4, data);
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "</td>\n    <td class=\"bar\">\n      ";
    foundHelper = helpers.not_defined;
    stack1 = foundHelper || depth0.not_defined;
    stack2 = helpers['if'];
    tmp1 = self.program(6, program6, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.program(8, program8, data);
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n    </td>\n  </tr>\n";
    return buffer;}
  function program2(depth0,data) {
    
    
    return " ";}

  function program4(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "Score: ";
    foundHelper = helpers.score;
    stack1 = foundHelper || depth0.score;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "score", { hash: {} }); }
    buffer += escapeExpression(stack1);
    return buffer;}

  function program6(depth0,data) {
    
    
    return "\n        <div class=\"percentbar disabled\">(Not surveyed)</div>\n      ";}

  function program8(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n        <div class=\"percentbar\" title=\"<table class='percentbar-tooltip'>\n        <tr><th colspan='4'>Share of questions by letter grade:</th></tr>\n        <tr class='row-a'><td class='letter'>A:</td><td class='left'>";
    foundHelper = helpers['a'];
    stack1 = foundHelper || depth0['a'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "a", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td class='middle'>/</td><td class='right'>";
    foundHelper = helpers.total;
    stack1 = foundHelper || depth0.total;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "total", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td></tr>\n        <tr class='row-b'><td class='letter'>B:</td><td class='left'>";
    foundHelper = helpers['b'];
    stack1 = foundHelper || depth0['b'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "b", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td class='middle'>/</td><td class='right'>";
    foundHelper = helpers.total;
    stack1 = foundHelper || depth0.total;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "total", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td></tr>\n        <tr class='row-c'><td class='letter'>C:</td><td class='left'>";
    foundHelper = helpers['c'];
    stack1 = foundHelper || depth0['c'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "c", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td class='middle'>/</td><td class='right'>";
    foundHelper = helpers.total;
    stack1 = foundHelper || depth0.total;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "total", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td></tr>\n        <tr class='row-d'><td class='letter'>D:</td><td class='left'>";
    foundHelper = helpers['d'];
    stack1 = foundHelper || depth0['d'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "d", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td class='middle'>/</td><td class='right'>";
    foundHelper = helpers.total;
    stack1 = foundHelper || depth0.total;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "total", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td></tr>\n        <tr class='row-e'><td class='letter'>E:</td><td class='left'>";
    foundHelper = helpers['e'];
    stack1 = foundHelper || depth0['e'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "e", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td class='middle'>/</td><td class='right'>";
    foundHelper = helpers.total;
    stack1 = foundHelper || depth0.total;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "total", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td></tr>\n        </table>\">\n          <div class=\"bg-e\" style=\"width: ";
    foundHelper = helpers.e_width;
    stack1 = foundHelper || depth0.e_width;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "e_width", { hash: {} }); }
    buffer += escapeExpression(stack1) + "%\"></div>\n          <div class=\"bg-d\" style=\"width: ";
    foundHelper = helpers.d_width;
    stack1 = foundHelper || depth0.d_width;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "d_width", { hash: {} }); }
    buffer += escapeExpression(stack1) + "%\"></div>\n          <div class=\"bg-c\" style=\"width: ";
    foundHelper = helpers.c_width;
    stack1 = foundHelper || depth0.c_width;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "c_width", { hash: {} }); }
    buffer += escapeExpression(stack1) + "%\"></div>\n          <div class=\"bg-b\" style=\"width: ";
    foundHelper = helpers.b_width;
    stack1 = foundHelper || depth0.b_width;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "b_width", { hash: {} }); }
    buffer += escapeExpression(stack1) + "%\"></div>\n          <div class=\"bg-a\" style=\"width: ";
    foundHelper = helpers.a_width;
    stack1 = foundHelper || depth0.a_width;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "a_width", { hash: {} }); }
    buffer += escapeExpression(stack1) + "%\"></div>\n        </div>\n      ";
    return buffer;}

    foundHelper = helpers.percentages;
    stack1 = foundHelper || depth0.percentages;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n";
    return buffer;});
}});

window.require.define({"views/templates/question_text": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "<div class=\"answer\"><b>A: </b>";
    foundHelper = helpers['a'];
    stack1 = foundHelper || depth0['a'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "a", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</div>";
    return buffer;}

  function program3(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "<div class=\"answer\"><b>B: </b>";
    foundHelper = helpers['b'];
    stack1 = foundHelper || depth0['b'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "b", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</div>";
    return buffer;}

  function program5(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "<div class=\"answer\"><b>C: </b>";
    foundHelper = helpers['c'];
    stack1 = foundHelper || depth0['c'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "c", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</div>";
    return buffer;}

  function program7(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "<div class=\"answer\"><b>D: </b>";
    foundHelper = helpers['d'];
    stack1 = foundHelper || depth0['d'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "d", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</div>";
    return buffer;}

  function program9(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "<div class=\"answer\"><b>E: </b>";
    foundHelper = helpers['e'];
    stack1 = foundHelper || depth0['e'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "e", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</div>";
    return buffer;}

    buffer += "<div class=\"question-template\">\n  <div class=\"question-text\">\n    <b>Question ";
    foundHelper = helpers.number;
    stack1 = foundHelper || depth0.number;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "number", { hash: {} }); }
    buffer += escapeExpression(stack1) + ":</b> ";
    foundHelper = helpers.text;
    stack1 = foundHelper || depth0.text;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "text", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\n  </div>\n  ";
    foundHelper = helpers['a'];
    stack1 = foundHelper || depth0['a'];
    stack2 = helpers['if'];
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  ";
    foundHelper = helpers['b'];
    stack1 = foundHelper || depth0['b'];
    stack2 = helpers['if'];
    tmp1 = self.program(3, program3, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  ";
    foundHelper = helpers['c'];
    stack1 = foundHelper || depth0['c'];
    stack2 = helpers['if'];
    tmp1 = self.program(5, program5, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  ";
    foundHelper = helpers['d'];
    stack1 = foundHelper || depth0['d'];
    stack2 = helpers['if'];
    tmp1 = self.program(7, program7, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  ";
    foundHelper = helpers['e'];
    stack1 = foundHelper || depth0['e'];
    stack2 = helpers['if'];
    tmp1 = self.program(9, program9, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</div>\n";
    return buffer;});
}});

window.require.define({"views/templates/rankings_row": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<tr>\n    <td class=\"country\"><a href=\"#profile/";
    foundHelper = helpers.alpha2;
    stack1 = foundHelper || depth0.alpha2;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "alpha2", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    foundHelper = helpers.country;
    stack1 = foundHelper || depth0.country;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "country", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a></td>\n    <td class=\"flag\"><img src=\"images/flags/";
    foundHelper = helpers.alpha2;
    stack1 = foundHelper || depth0.alpha2;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "alpha2", { hash: {} }); }
    buffer += escapeExpression(stack1) + ".GIF\"/></td>\n    <td class=\"score\">";
    foundHelper = helpers.score;
    stack1 = foundHelper || depth0.score;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "score", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td>\n    <td class=\"bar\">\n      <div class=\"percentbar\" title=\"<table class='percentbar-tooltip'>\n        <tr><th colspan='4'>Share of questions by letter grade:</th></tr>\n        <tr class='row-a'><td class='letter'>A:</td><td class='left'>";
    foundHelper = helpers['a'];
    stack1 = foundHelper || depth0['a'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "a", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td class='middle'>/</td><td class='right'>";
    foundHelper = helpers.total;
    stack1 = foundHelper || depth0.total;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "total", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td></tr>\n        <tr class='row-b'><td class='letter'>B:</td><td class='left'>";
    foundHelper = helpers['b'];
    stack1 = foundHelper || depth0['b'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "b", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td class='middle'>/</td><td class='right'>";
    foundHelper = helpers.total;
    stack1 = foundHelper || depth0.total;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "total", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td></tr>\n        <tr class='row-c'><td class='letter'>C:</td><td class='left'>";
    foundHelper = helpers['c'];
    stack1 = foundHelper || depth0['c'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "c", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td class='middle'>/</td><td class='right'>";
    foundHelper = helpers.total;
    stack1 = foundHelper || depth0.total;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "total", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td></tr>\n        <tr class='row-d'><td class='letter'>D:</td><td class='left'>";
    foundHelper = helpers['d'];
    stack1 = foundHelper || depth0['d'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "d", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td class='middle'>/</td><td class='right'>";
    foundHelper = helpers.total;
    stack1 = foundHelper || depth0.total;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "total", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td></tr>\n        <tr class='row-e'><td class='letter'>E:</td><td class='left'>";
    foundHelper = helpers['e'];
    stack1 = foundHelper || depth0['e'];
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "e", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td class='middle'>/</td><td class='right'>";
    foundHelper = helpers.total;
    stack1 = foundHelper || depth0.total;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "total", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td></tr>\n        </table>\">\n          <div class=\"bg-a\" style=\"left: 0%; width: ";
    foundHelper = helpers.a_width;
    stack1 = foundHelper || depth0.a_width;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "a_width", { hash: {} }); }
    buffer += escapeExpression(stack1) + "%\"></div>\n          <div class=\"bg-b\" style=\"left: ";
    foundHelper = helpers.b_left;
    stack1 = foundHelper || depth0.b_left;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "b_left", { hash: {} }); }
    buffer += escapeExpression(stack1) + "%; width: ";
    foundHelper = helpers.b_width;
    stack1 = foundHelper || depth0.b_width;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "b_width", { hash: {} }); }
    buffer += escapeExpression(stack1) + "%\"></div>\n          <div class=\"bg-c\" style=\"left: ";
    foundHelper = helpers.c_left;
    stack1 = foundHelper || depth0.c_left;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "c_left", { hash: {} }); }
    buffer += escapeExpression(stack1) + "%; width: ";
    foundHelper = helpers.c_width;
    stack1 = foundHelper || depth0.c_width;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "c_width", { hash: {} }); }
    buffer += escapeExpression(stack1) + "%\"></div>\n          <div class=\"bg-d\" style=\"left: ";
    foundHelper = helpers.d_left;
    stack1 = foundHelper || depth0.d_left;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "d_left", { hash: {} }); }
    buffer += escapeExpression(stack1) + "%; width: ";
    foundHelper = helpers.d_width;
    stack1 = foundHelper || depth0.d_width;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "d_width", { hash: {} }); }
    buffer += escapeExpression(stack1) + "%\"></div>\n          <div class=\"bg-e\" style=\"left: ";
    foundHelper = helpers.e_left;
    stack1 = foundHelper || depth0.e_left;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "e_left", { hash: {} }); }
    buffer += escapeExpression(stack1) + "%; width: ";
    foundHelper = helpers.e_width;
    stack1 = foundHelper || depth0.e_width;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "e_width", { hash: {} }); }
    buffer += escapeExpression(stack1) + "%\"></div>\n        </div>\n    </td>\n</tr>\n";
    return buffer;});
}});

window.require.define({"views/templates/rankings_tooltip": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    foundHelper = helpers.alpha2;
    stack1 = foundHelper || depth0.alpha2;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "alpha2", { hash: {} }); }
    buffer += escapeExpression(stack1) + " is a great place\n";
    return buffer;});
}});

window.require.define({"views/templates/reportgenerator": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n                    <h6>";
    foundHelper = helpers.by;
    stack1 = foundHelper || depth0.by;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "by", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h6>\n                    <ul>\n                      ";
    foundHelper = helpers.entries;
    stack1 = foundHelper || depth0.entries;
    stack2 = helpers.each;
    tmp1 = self.program(2, program2, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n                    </ul>\n                ";
    return buffer;}
  function program2(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n                      <li><a href=\"#\" class=\"group-toggler\" id=\"group-";
    foundHelper = helpers.group_id;
    stack1 = foundHelper || depth0.group_id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "group_id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    foundHelper = helpers.title;
    stack1 = foundHelper || depth0.title;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a></li>\n                      ";
    return buffer;}

  function program4(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n                    <h6>";
    foundHelper = helpers.by;
    stack1 = foundHelper || depth0.by;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "by", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h6>\n                    <ul>\n                      ";
    foundHelper = helpers.entries;
    stack1 = foundHelper || depth0.entries;
    stack2 = helpers.each;
    tmp1 = self.program(5, program5, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n                    </ul>\n                ";
    return buffer;}
  function program5(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n                      <li><a href=\"#\" class=\"group-toggler\" id=\"group-";
    foundHelper = helpers.group_id;
    stack1 = foundHelper || depth0.group_id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "group_id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    foundHelper = helpers.title;
    stack1 = foundHelper || depth0.title;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a></li>\n                      ";
    return buffer;}

  function program7(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n                  <a href=\"#\" class=\"toggle-box ";
    foundHelper = helpers.groups;
    stack1 = foundHelper || depth0.groups;
    stack2 = helpers.each;
    tmp1 = self.program(8, program8, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\" id=\"toggle-";
    foundHelper = helpers.number;
    stack1 = foundHelper || depth0.number;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "number", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" title=\"<p class='question-tooltip'>";
    foundHelper = helpers.text;
    stack1 = foundHelper || depth0.text;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "text", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</p>\">";
    foundHelper = helpers.number;
    stack1 = foundHelper || depth0.number;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "number", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a>\n                ";
    return buffer;}
  function program8(depth0,data) {
    
    var buffer = "", stack1;
    stack1 = depth0;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
    buffer += escapeExpression(stack1) + " ";
    return buffer;}

  function program10(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n                  <li><a href=\"#\" class=\"region-toggler\" id=\"region-";
    foundHelper = helpers.region_index;
    stack1 = foundHelper || depth0.region_index;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "region_index", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a></li>\n                  ";
    return buffer;}

    buffer += "<div class=\"accordion\" id=\"accordion2\">\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <span class=\"accordion-toggle\" data-toggle=\"collapse\" data-parent=\"#accordion2\" href=\"#collapseOne\">\n        <span class=\"pre-subtitle\">Viewing: </span>\n        \"<span class=\"subtitle\"></span>\"\n        <a class=\"customize-link\" data-toggle=\"collapse\" data-parent=\"#accordion2\" href=\"#collapseOne\">\n          Customize Report &raquo;\n        </a>\n      </span>\n    </div>\n    <div id=\"collapseOne\" class=\"accordion-body collapse\">\n      <div class=\"accordion-inner\">\n          <div class=\"col1 grouplist\">\n                ";
    foundHelper = helpers.groupings0;
    stack1 = foundHelper || depth0.groupings0;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n            </div>\n            <div class=\"col2 grouplist\">\n                ";
    foundHelper = helpers.groupings1;
    stack1 = foundHelper || depth0.groupings1;
    stack2 = helpers.each;
    tmp1 = self.program(4, program4, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n            </div>\n            <div class=\"col3\">\n                <div id=\"toggle-boxes\">\n                ";
    foundHelper = helpers.question;
    stack1 = foundHelper || depth0.question;
    stack2 = helpers.each;
    tmp1 = self.program(7, program7, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n                <div class=\"clearfix\"></div>\n                <div class=\"select-or-clear\">\n                    <button class=\"btn btn-primary btn-small select\">Select All</button>\n                    <button class=\"btn btn-small clear\">Clear All</button>\n                </div>\n                </div>\n            </div>\n            <div class=\"col4 grouplist\">\n                <h6><img src=\"images/world.png\"/> Region</h6>\n                <ul>\n                  ";
    foundHelper = helpers.regions;
    stack1 = foundHelper || depth0.regions;
    stack2 = helpers.each;
    tmp1 = self.program(10, program10, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n                </ul>\n            </div>\n            <div class=\"clearfix\"></div>\n      </div>\n    </div>\n  </div>\n</div>\n";
    return buffer;});
}});

window.require.define({"views/templates/timeline_column": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n      <tr class=\"timeline-row-";
    foundHelper = helpers.alpha2;
    stack1 = foundHelper || depth0.alpha2;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "alpha2", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" data-alpha2=\"";
    foundHelper = helpers.alpha2;
    stack1 = foundHelper || depth0.alpha2;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "alpha2", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n        <td class=\"timeline-cell-name\"><a href=\"#profile/";
    foundHelper = helpers.alpha2;
    stack1 = foundHelper || depth0.alpha2;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "alpha2", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    foundHelper = helpers.country;
    stack1 = foundHelper || depth0.country;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "country", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a></td>\n        <td class=\"timeline-cell-flag\"><img src=\"images/flags/";
    foundHelper = helpers.alpha2;
    stack1 = foundHelper || depth0.alpha2;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "alpha2", { hash: {} }); }
    buffer += escapeExpression(stack1) + ".GIF\"/></td>\n        <td class=\"timeline-cell-score\">";
    foundHelper = helpers.score;
    stack1 = foundHelper || depth0.score;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "score", { hash: {} }); }
    buffer += escapeExpression(stack1) + "&nbsp;&nbsp;</td>\n        <td class=\"timeline-cell-rank\">";
    foundHelper = helpers.rank;
    stack1 = foundHelper || depth0.rank;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "rank", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td>\n      </tr>\n    ";
    return buffer;}

    buffer += "<div class=\"timeline-column\" id=\"timeline-column-";
    foundHelper = helpers.year;
    stack1 = foundHelper || depth0.year;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "year", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n  <h4>";
    foundHelper = helpers.year;
    stack1 = foundHelper || depth0.year;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "year", { hash: {} }); }
    buffer += escapeExpression(stack1) + " Survey</h4>\n  <table>\n    <thead>\n      <tr>\n        <th class=\"timeline-cell-name\">Country</th>\n        <th class=\"timeline-cell-flag\"></th>\n        <th class=\"timeline-cell-score\">Score</th>\n        <th class=\"timeline-cell-rank\">Rank</th>\n      </tr>\n    </thead>\n    <tbody>\n    ";
    foundHelper = helpers.data;
    stack1 = foundHelper || depth0.data;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n    </tbody>\n  </table>\n</div>\n\n";
    return buffer;});
}});

