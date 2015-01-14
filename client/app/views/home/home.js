'use strict';

angular.module('echoCalendarApp.home', ['daypilot', 'ngSanitize', 'ngCsv'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/home/:configId?', {
      templateUrl: 'views/home/home.html',
      controller: 'homeCtrl'
    });
  }])
  .controller('homeCtrl', function ($scope, $q, $modal, $timeout, $routeParams, $location, $window, Event, Property, ConfigState) {
    $scope.scheduler = {
      momentScale: 'month',
      currentDate: new Date(),
      filters: {
        TheStar: true,
        Jupiters: true,
        Treasury: true,
        Gaming: true,
        NonGaming: true,
        Public: true
      },
      advanceFilters: {
        product: {all: true, include: []},
        customer: {all: true, include: []},
        venue: {all: true, include: []}
      },
      config: {
        scale: "Day",
        headerHeight: 28,
        startDate: moment().startOf('year').format('YYYY-MM-DD'),
        days: 365,
        //layout:"TableBased",
        //locale:'en-au',
        theme: "echo",
        groupConcurrentEvents: true,
        groupAllEvents: true,
        groupConcurrentEventsLimit: 1,
        dynamicEventRenderingCacheSweeping: true,
        eventMoveHandling: 'Disabled',
        onTimeRangeSelected: function (args) {
          $window.location.href = '#/addEvent?start=' + args.start.value + '&end=' + args.end.value;
        },
        onResourceHeaderClicked: function (args) {
        },
        onResourceCollapse: function (args) {
          var selector = $("div[class$='_event_group'][resource^='" + args.resource.id + "']");
          selector.trigger('click');
          //var selector = "div[resource^='" + args.resource.id + "']:not([class$='_event_group'])";
        },
        onResourceExpand: function (args) {
          var selector = $("div[resource^='" + args.resource.id + "']:not([class$='_event_group'])");
        },
        eventHoverHandling: "Bubble",
        onBeforeEventRender: function (args) {
          args.e.bubbleHtml = "<div><b>" + args.e.text + "</b></div><div>Start: " + new DayPilot.Date(args.e.start).toString("M/d/yyyy") + "</div>";
        },
        onBeforeRowHeaderRender: function (args) {
          var hasExpanded = args.row.groups.expanded().length > 0;
          var hasCollapsed = args.row.groups.collapsed().length > 0;
          if (!hasExpanded && !hasCollapsed && args.row.events.all().length > 1) {
            args.row.areas = [
              {
                v: "Visible",
                right: 0,
                top: 0,
                height: 12,
                width: 12,
                style: "cursor:pointer",
                html: "<img class='toggle-collapse' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAIAAABv85FHAAAAKXRFWHRDcmVhdGlvbiBUaW1lAHDhIDMwIEkgMjAwOSAwODo0NjozMSArMDEwMClDkt4AAAAHdElNRQfZAR4HLxB+p9DXAAAACXBIWXMAAA7CAAAOwgEVKEqAAAAABGdBTUEAALGPC/xhBQAAAENJREFUeNpjrK6s5uTl/P75OybJ0NLW8h8bAIozgeSxAaA4E1A7VjmgOAtEHyMjI7IE0EygOAtEH5CDqY9c+xjx+A8ANndK9WaZlP4AAAAASUVORK5CYII=' />",
                action: "JavaScript",
                js: function (row) {
                  row.events.collapseGroups();
                }
              }
            ];
          }
          else if (hasCollapsed) {
            args.row.areas = [
              {
                v: "Visible",
                right: 0,
                top: 0,
                height: 12,
                width: 12,
                style: "cursor:pointer",
                html: "<img  class='toggle-expand' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAIAAABv85FHAAAAKXRFWHRDcmVhdGlvbiBUaW1lAHDhIDMwIEkgMjAwOSAwODo0NjozMSArMDEwMClDkt4AAAAHdElNRQfZAR4HLyUoFBT0AAAACXBIWXMAAA7CAAAOwgEVKEqAAAAABGdBTUEAALGPC/xhBQAAAFJJREFUeNpjrK6s5uTl/P75OybJ0NLW8h8bAIozgeRhgJGREc4GijMBtTNgA0BxFog+uA4IA2gmUJwFog/IgUhAGBB9KPYhA3T74Jog+hjx+A8A1KRQ+AN5vcwAAAAASUVORK5CYII=' />",
                action: "JavaScript",
                js: function (row) {
                  row.events.expandGroups();
                }
              }
            ];
          }
          else if (hasExpanded) {
            args.row.areas = [
              {
                v: "Visible",
                right: 0,
                top: 0,
                height: 12,
                width: 12,
                style: "cursor:pointer",
                html: "<img class='toggle-collapse' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAIAAABv85FHAAAAKXRFWHRDcmVhdGlvbiBUaW1lAHDhIDMwIEkgMjAwOSAwODo0NjozMSArMDEwMClDkt4AAAAHdElNRQfZAR4HLxB+p9DXAAAACXBIWXMAAA7CAAAOwgEVKEqAAAAABGdBTUEAALGPC/xhBQAAAENJREFUeNpjrK6s5uTl/P75OybJ0NLW8h8bAIozgeSxAaA4E1A7VjmgOAtEHyMjI7IE0EygOAtEH5CDqY9c+xjx+A8ANndK9WaZlP4AAAAASUVORK5CYII=' />",
                action: "JavaScript",
                js: function (row) {
                  row.events.collapseGroups();
                }
              }
            ];
          }
        },
        onEventMoved: function (args) {
          $scope.dp.message("Event moved: " + args.e.text());
        },
        eventClickHandling: "Select",
        onRowClick: function () {
        },
        onEventSelected: function (args) {
          var selectedEvent = $scope.dp.multiselect.events();
          if (selectedEvent.length == 1) {
            $modal.open({
              templateUrl: 'views/event/event-details.html',
              controller: 'eventDetailCtrl',
              resolve: {
                event: function () {
                  return selectedEvent[0].data;
                }
              }
            });
            $scope.$apply();
          }
        },
        timeHeaders: [
          {groupBy: "Month"}, {groupBy: "Week", format: "Week - ww"}
        ],
        treeEnabled: true,
        separators: [
          {color: "#8b6f4d", width: 10, opacity: 30, location: (new Date()).toISOString(), layer: "BelowEvents"}
        ]
      },
      queryResources: function () {
        Property.query().$promise.then(function (results) {
          $scope.scheduler.config.resources = $scope.scheduler.orgionalResources = results;
        });
      },
      queryEvents: function () {
        Event.query($scope.scheduler.currentQuery).$promise.then(function (results) {
          $scope.events = results;
        });
      },
      filterResources: function (filters, resources) {
        resources = resources.filter(function (res) {
          var filtered = true;
          for (var f in filters) {
            if (f === res.key) {
              filtered = filters[f];
            }
          }
          return filtered;
        });
        resources.forEach(function (resource) {
          if (resource.children && resource.children.length) {
            resource.children = $scope.scheduler.filterResources(filters, resource.children);
          }
        });
        return resources;
      },
      changeScale: function (momentScale, date) {
        $scope.scheduler.momentScale = momentScale || $scope.scheduler.momentScale;
        $scope.scheduler.currentDate = date || $scope.scheduler.currentDate;
        switch (momentScale) {
          case 'day':
            $scope.scheduler.config.timeHeaders = [{groupBy: "Day", format: "yyyy-MM-dd dddd"}, {groupBy: "Cell"}];
            $scope.scheduler.config.startDate = moment($scope.scheduler.currentDate).format('YYYY-MM-DD');
            $scope.scheduler.config.days = 1;
            $scope.scheduler.config.scale = 'Hour';
            $scope.scheduler.config.cellWidth = (dp.clientWidth - $scope.dp.rowHeaderWidth ) / 12;
            break;
          case 'week':
            $scope.scheduler.config.timeHeaders = [
              {groupBy: "Month"},
              {groupBy: "Day", format: "ddd"},
              {groupBy: "Day", format: "dd"}
            ];
            $scope.scheduler.config.startDate = moment($scope.scheduler.currentDate).startOf('Week').format('YYYY-MM-DD');
            $scope.scheduler.config.days = 7;
            $scope.scheduler.config.scale = 'Day';
            $scope.scheduler.config.cellWidth = (dp.clientWidth - $scope.dp.rowHeaderWidth ) / $scope.scheduler.config.days;
            break;
          case 'month':
            $scope.scheduler.config.timeHeaders = [
              {groupBy: "Month"},
              {groupBy: "Week", format: "Week"},
              {groupBy: "Day", format: "dd"}];
            $scope.scheduler.config.startDate = moment($scope.scheduler.currentDate).startOf('Month').format('YYYY-MM-DD');
            $scope.scheduler.config.days = moment($scope.scheduler.config.startDate).daysInMonth();
            $scope.scheduler.config.scale = 'Day';
            $scope.scheduler.config.cellWidth = (dp.clientWidth - $scope.dp.rowHeaderWidth ) / $scope.scheduler.config.days;
            break;
          case 'year':
            $scope.scheduler.config.timeHeaders = [{groupBy: "Year"}, {groupBy: "Month", format: "MMMM"}];
            $scope.scheduler.config.startDate = moment($scope.scheduler.currentDate).startOf('Month').format('YYYY-MM-DD');
            $scope.scheduler.config.days = 365;
            $scope.scheduler.config.scale = 'Month';
            $scope.scheduler.config.cellWidth = (dp.clientWidth - $scope.dp.rowHeaderWidth ) / 6;
            break;
        }
      },
      next: function () {
        $scope.scheduler.config.startDate = moment($scope.scheduler.config.startDate).add($scope.scheduler.momentScale, 1).format('YYYY-MM-DD');
        $scope.scheduler.currentDate = $scope.scheduler.config.startDate;
      },
      prev: function () {
        $scope.scheduler.config.startDate = moment($scope.scheduler.config.startDate).add($scope.scheduler.momentScale, -1).format('YYYY-MM-DD');
        $scope.scheduler.currentDate = $scope.scheduler.config.startDate;
      },
      today: function () {
        $scope.scheduler.config.startDate = $scope.scheduler.currentDate = moment().format('YYYY-MM-DD');
      },
      scrollTo: function (date) {
        $timeout(function () {
          $scope.dp.scrollTo(date);
        })
      },
      move: function () {
        var event = $scope.events[0];
        event.start = event.start.addDays(1);
        event.end = event.end.addDays(1);
      },
      init: function () {
        if ($routeParams.configId) {
          ConfigState.findById({id: $routeParams.configId}, function (config) {
            console.dir(config);
            angular.extend($scope.scheduler, config);
          })
        }
        $timeout(function () {
          $scope.scheduler.changeScale('month', (new Date()));
        });
        $scope.scheduler.queryResources();
        $scope.scheduler.queryEvents();
      },
      showAdvancedFilter: function () {
        $modal.open({
          templateUrl: 'partials/advance-filter.html',
          controller: 'advanceFilterCtrl',
          resolve: {
            filters: function () {
              return $scope.scheduler.advanceFilters
            }
          }
        }).result.then(function (filters) {
            $scope.scheduler.advanceFilters = filters;
            $scope.scheduler.applyAdvanceFilters();
          });
      },
      applyAdvanceFilters: function () {
        var query = {};
        for (var key in $scope.scheduler.advanceFilters) {
          var currentProp = $scope.scheduler.advanceFilters[key];
          var currentInclude = [];
          if (!currentProp.all) {
            currentProp.include.forEach(function (af) {
              currentInclude.push(af.key);
            });
            query["metadata." + key + ".key"] = {in: currentInclude};
          }
        }
        query = angular.equals(query, {}) ? {} : {"filter": {"where": query}};
        $scope.scheduler.currentQuery = query;
        $scope.scheduler.queryEvents();
      },
      exportCSV: function () {
        var defer = $q.defer();
        Event.query().$promise.then(function (data) {
          defer.resolve(data);
        });
        return defer.promise;
      }
    };

    $scope.$watch('scheduler.filters', function (nv) {
      if (nv && $scope.scheduler.orgionalResources) {
        var orgResources = angular.copy($scope.scheduler.orgionalResources);
        $scope.scheduler.config.resources = $scope.scheduler.filterResources(nv, orgResources);
      }
    }, true);

    $scope.guid = $routeParams.configId || $scope.guid();
    $scope.saveConfigState = function () {
      ConfigState.upsert({
        id: $scope.guid,
        momentScale: $scope.scheduler.momentScale,
        currentDate: $scope.scheduler.currentDate,
        filters: $scope.scheduler.filters,
        config: $scope.scheduler.config
      }).$promise.then(function () {
          $modal.open({
            templateUrl: 'partials/modal.html',
            controller: 'modalCtrl',
            resolve: {
              item: function () {
                return {title: $window.location.origin + $window.location.pathname + '#/home/' + $scope.guid}
              }
            }
          });
        });
    };

    $scope.scheduler.init();
  })
;
