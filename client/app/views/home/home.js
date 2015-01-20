'use strict';

angular.module('echoCalendarApp.home', ['daypilot', 'ngSanitize', 'ngCsv'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/home/:configId?', {
      templateUrl: 'views/home/home.html',
      controller: 'homeCtrl'
    });
  }])
  .controller('homeCtrl', function ($scope, $q, $modal, $timeout, $routeParams, $location, $window, $localStorage, $sessionStorage, Event, EventType, Property, ConfigState) {
    'use strict';
    var init = true;
    $scope.$lStorage = $localStorage.$default({});
    $scope.scheduler = {
      config: {
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
        contextMenu: new DayPilot.Menu({
          items: [
            {
              text: "View event details in full screen", onclick: function () {
              //problem with conflict of lib and angularjs
              //$scope.scheduler.viewItemDetails(1234);
            }
            }
          ]
        }),
        onTimeRangeSelect: function (args) {},
        onTimeRangeSelected: function (args) {
          var menu = new DayPilot.Menu({
            items: [
              {
                text: "Add an event",
                href: '#/addEvent/?start=' + args.start.value + '&end=' + args.end.value + '&resource=' + args.resource
              }
            ]
          });
          menu.show(args);
        },
        onResourceHeaderClicked: function (args) {},
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
        onRowClick: function () {},
        onEventSelected: function (args) {
          /*var selectedEvent = $scope.dp.multiselect.events();
           if (selectedEvent.length == 1) {
           console.log(args);
           $scope.scheduler.viewItemDetails(selectedEvent[0].data);
           }*/
          $scope.scheduler.viewItemDetails(args.e.id());
        },
        timeHeaders: [
          {groupBy: "Month"}, {groupBy: "Week", format: "Week - ww"}
        ],
        treeEnabled: true,
        separators: [
          {color: "#8b6f4d", width: 10, opacity: 30, location: (new Date()).toISOString(), layer: "BelowEvents"}
        ]
      },
      viewItemDetails: function (id) {
        if (id) {
          $modal.open({
            templateUrl: 'views/event/event-details.html',
            controller: 'eventDetailCtrl',
            resolve: {
              eventId: function () {
                return id;
              }
            }
          });
        }
      },
      queryResources: function () {
        return Property.query().$promise.then(function (results) {
          $scope.scheduler.config.resources = $scope.scheduler.orgionalResources = results;
        });
      },
      queryEvents: function () {
        return Event.schedulerList($scope.scheduler.currentQuery).$promise.then(function (results) {
          $scope.events = results.events;
        });
      },
      queryEventTypes: function () {
        return EventType.query().$promise.then(function (results) {
          $scope.eventTypes = results;
        })
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
        $scope.scheduler.config.momentScale = momentScale || $scope.scheduler.config.momentScale;
        $scope.scheduler.config.currentDate = date || $scope.scheduler.config.currentDate;
        switch (momentScale) {
          case 'day':
            $scope.scheduler.config.timeHeaders = [{groupBy: "Day", format: "yyyy-MM-dd dddd"}, {groupBy: "Cell"}];
            $scope.scheduler.config.startDate = moment($scope.scheduler.config.currentDate).format('YYYY-MM-DD');
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
            $scope.scheduler.config.startDate = moment($scope.scheduler.config.currentDate).startOf('Week').format('YYYY-MM-DD');
            $scope.scheduler.config.days = 7;
            $scope.scheduler.config.scale = 'Day';
            $scope.scheduler.config.cellWidth = (dp.clientWidth - $scope.dp.rowHeaderWidth ) / $scope.scheduler.config.days;
            break;
          case 'month':
            $scope.scheduler.config.timeHeaders = [
              {groupBy: "Month"},
              {groupBy: "Week", format: "Week ww"},
              {groupBy: "Day", format: "dd"}];
            $scope.scheduler.config.startDate = moment($scope.scheduler.config.currentDate).startOf('Month').format('YYYY-MM-DD');
            $scope.scheduler.config.days = moment($scope.scheduler.config.startDate).daysInMonth();
            $scope.scheduler.config.scale = 'Day';
            $scope.scheduler.config.cellWidth = (dp.clientWidth - $scope.dp.rowHeaderWidth ) / $scope.scheduler.config.days;
            break;
          case 'year':
            $scope.scheduler.config.timeHeaders = [{groupBy: "Year"}, {groupBy: "Month", format: "MMMM"}];
            $scope.scheduler.config.startDate = moment($scope.scheduler.config.currentDate).startOf('Month').format('YYYY-MM-DD');
            $scope.scheduler.config.days = 365;
            $scope.scheduler.config.scale = 'Month';
            $scope.scheduler.config.cellWidth = (dp.clientWidth - $scope.dp.rowHeaderWidth ) / 6;
            break;
        }
      },
      next: function () {
        $scope.scheduler.config.startDate = moment($scope.scheduler.config.startDate).add($scope.scheduler.config.momentScale, 1).format('YYYY-MM-DD');
        $scope.scheduler.config.currentDate = $scope.scheduler.config.startDate;
      },
      prev: function () {
        $scope.scheduler.config.startDate = moment($scope.scheduler.config.startDate).add($scope.scheduler.config.momentScale, -1).format('YYYY-MM-DD');
        $scope.scheduler.config.currentDate = $scope.scheduler.config.startDate;
      },
      today: function () {
        $scope.scheduler.config.startDate = $scope.scheduler.config.currentDate = moment().format('YYYY-MM-DD');
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
        //query resource
        if ($routeParams.configId) {
          $q.all([
            ConfigState.findById({id: $routeParams.configId}).$promise,
            $scope.scheduler.queryEventTypes(),
            $scope.scheduler.queryResources()
          ]).then(function (responses) {
            $scope.scheduler.config = responses[0].config;
            //query events with filter
            $scope.scheduler.applyAdvanceFilters();
            init = false;
          });
        }
        else if($scope.$lStorage.config){
          $q.all([
            $scope.scheduler.queryEventTypes(),
            $scope.scheduler.queryResources()
          ]).then(function () {
            $scope.scheduler.config = $scope.$lStorage.config;
            //query events with filter
            $scope.scheduler.applyAdvanceFilters();
            //timeout to walk around issues with calendar grid width calculation when there is js animations
            //on the slider
            $timeout(function () {
              $scope.scheduler.config.timestamp = new Date();
            });
            init = false;
          });
        }
        else {
          $scope.scheduler.queryEventTypes();
          $scope.scheduler.queryResources();
          $scope.scheduler.queryEvents();
          //default scale
          $timeout(function () {
            $scope.scheduler.changeScale('month', (new Date()));
          });
          init = false;
        }
      },
      showAdvancedFilter: function () {
        $modal.open({
          templateUrl: 'partials/advance-filter.html',
          controller: 'advanceFilterCtrl',
          resolve: {
            filters: function () {
              return $scope.scheduler.config.advanceFilters
            }
          }
        }).result.then(function (filters) {
            $scope.scheduler.config.advanceFilters = filters;
            $scope.scheduler.applyAdvanceFilters();
          });
      },
      applyAdvanceFilters: function () {
        var query = {};
        for (var key in $scope.scheduler.config.advanceFilters) {
          var currentProp = $scope.scheduler.config.advanceFilters[key];
          var currentInclude = [];
          if (!currentProp.all) {
            currentProp.include.forEach(function (af) {
              currentInclude.push(af.key);
            });
            query["metadata." + key + ".key"] = {in: currentInclude};
          }
        }
        query = {"filter": query};
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

    $scope.$watch('scheduler.config', function (nv,ov) {
      if(nv && !init && !$routeParams.configId){
        $scope.$lStorage.config = nv;
      }
    },true);

    $scope.$watch('scheduler.config.filters', function (nv) {
      if (nv && $scope.scheduler.orgionalResources) {
        $scope.scheduler.config.resources = $scope.scheduler.filterResources(nv, angular.copy($scope.scheduler.orgionalResources));
      }
    }, true);

    $scope.guid = $routeParams.configId || $scope.guid();

    $scope.saveConfigState = function () {
      ConfigState.upsert({id: $scope.guid}, {
        config: $scope.scheduler.config,
        id: $scope.guid
      }).$promise.then(function (response) {
          $modal.open({
            templateUrl: 'partials/share-url.html',
            controller: 'shareURLCtrl',
            resolve: {
              item: function () {
                return {title: $window.location.origin + $window.location.pathname + '#/home/' + response.id}
              }
            }
          });
        });
    };

    $scope.checkApproval();

    $scope.scheduler.init();
  })
;
