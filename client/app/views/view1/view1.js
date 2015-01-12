'use strict';

angular.module('echoCalendarApp.view1', ['ngRoute', 'daypilot', 'ui.bootstrap', 'ngCookies'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/view1', {
      templateUrl: 'view1/view1.html',
      controller: 'View1Ctrl',
      resolve: {}
    });
  }])
  .controller('View1Ctrl', function ($scope, $modal, Event, Property, LoopBackAuth, $cookies) {
    $scope.config = {
      scale: "Month",
      startDate: "2014-01-01",
      days: 365,
      //layout:"TableBased",
      groupConcurrentEvents: true,
      groupAllEvents: true,
      groupConcurrentEventsLimit: 1,
      dynamicEventRenderingCacheSweeping: true,
      onResourceCollapse: function (args,collapsed) {
        var level = args.id.indexOf('-')<0?0:1;
        if(level){

        }
        /*var selector = "div[class$='_event_group'][resource^='"+args.resource.id+"']";
         var total = 0;
         $(selector).each(function(){
         total += parseInt($(this).attr("event-count"));
         });
         $(selector).hide();*/
      },
      onResourceExpand: function (args) {
        /*var id = "div[class$='_event_group'][parent-resource='"+args.resource.id+"']";
         $(id).show();*/
      },
      eventHoverHandling: "Bubble",
      onBeforeEventRender: function (args) {
        args.e.bubbleHtml = "<div><b>" + args.e.text + "</b></div><div>Start: " + new DayPilot.Date(args.e.start).toString("M/d/yyyy") + "</div>";
      },
      onBeforeRowHeaderRender: function (args) {
        var hasExpanded = args.row.groups.expanded().length > 0;
        var hasCollapsed = args.row.groups.collapsed().length > 0;
        if (!hasExpanded && !hasCollapsed && args.row.events.all().length) {
          args.row.areas = [
            {
              v: "Visible",
              right: 0,
              top: 0,
              height: 12,
              width: 12,
              style: "cursor:pointer",
              html: "<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAIAAABv85FHAAAAKXRFWHRDcmVhdGlvbiBUaW1lAHDhIDMwIEkgMjAwOSAwODo0NjozMSArMDEwMClDkt4AAAAHdElNRQfZAR4HLxB+p9DXAAAACXBIWXMAAA7CAAAOwgEVKEqAAAAABGdBTUEAALGPC/xhBQAAAENJREFUeNpjrK6s5uTl/P75OybJ0NLW8h8bAIozgeSxAaA4E1A7VjmgOAtEHyMjI7IE0EygOAtEH5CDqY9c+xjx+A8ANndK9WaZlP4AAAAASUVORK5CYII=' />",
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
              html: "<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAIAAABv85FHAAAAKXRFWHRDcmVhdGlvbiBUaW1lAHDhIDMwIEkgMjAwOSAwODo0NjozMSArMDEwMClDkt4AAAAHdElNRQfZAR4HLyUoFBT0AAAACXBIWXMAAA7CAAAOwgEVKEqAAAAABGdBTUEAALGPC/xhBQAAAFJJREFUeNpjrK6s5uTl/P75OybJ0NLW8h8bAIozgeRhgJGREc4GijMBtTNgA0BxFog+uA4IA2gmUJwFog/IgUhAGBB9KPYhA3T74Jog+hjx+A8A1KRQ+AN5vcwAAAAASUVORK5CYII=' />",
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
              html: "<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAIAAABv85FHAAAAKXRFWHRDcmVhdGlvbiBUaW1lAHDhIDMwIEkgMjAwOSAwODo0NjozMSArMDEwMClDkt4AAAAHdElNRQfZAR4HLxB+p9DXAAAACXBIWXMAAA7CAAAOwgEVKEqAAAAABGdBTUEAALGPC/xhBQAAAENJREFUeNpjrK6s5uTl/P75OybJ0NLW8h8bAIozgeSxAaA4E1A7VjmgOAtEHyMjI7IE0EygOAtEH5CDqY9c+xjx+A8ANndK9WaZlP4AAAAASUVORK5CYII=' />",
              action: "JavaScript",
              js: function (row) {
                row.events.collapseGroups();
              }
            }
          ];
        }
      },
      cellWidth: document.body.clientWidth / 6 - 4,
      onEventMoved: function (args) {
        $scope.dp.message("Event moved: " + args.e.text());
      },
      eventClickHandling: "Select",
      onRowClick: function () {
      },
      onEventSelected: function (args) {
        $scope.selectedEvents = $scope.dp.multiselect.events();
        if ($scope.selectedEvents.length == 1 && $scope.selectedEvents[0].eType != 'aggregation') {
          $modal.open({
            templateUrl: '../../templates/event-details.html',
            controller: 'eventDetailCtrl',
            resolve: {
              event: function () {
                return $scope.selectedEvents[0].data;
              }
            }
          });
          $scope.$apply();
        }
      },
      timeHeaders: [
        {groupBy: "Year"},
        {groupBy: "Month", format: "MMM yyyy"}
      ],
      treeEnabled: true
      , resources: [
        {
          name: "Event", id: "5477117ef9dc61a039fdc3da", expanded: true, children: [
          {name: "Absolute/Black", id: "5477117ef9dc61a039fdc3db"}
        ]
        },
        {name: "Promotion", id: "5477113ff9dc61a039fdc3d9"}
      ]
    };

    Property.query(function (results) {
      $scope.config.resources = results;
      //console.dir($scope.config.resources);
    });

    Event.query(function (results) {
      $scope.events = results;
      //$scope.events = [];
      //console.dir($scope.events);
    });

    $scope.changeScale = function (scale) {
      switch (scale) {
        case 'Day':
          $scope.config.timeHeaders = [{groupBy: "Day"}, {groupBy: "Cell"}];
          $scope.config.scale = 'Hour';
          break;
        case 'Week':
          $scope.config.timeHeaders = [{groupBy: "Month"}, {groupBy: "Day", format: "ddd"}, {
            groupBy: "Day",
            format: "dd"
          }];
          $scope.config.scale = 'Day';
          break;
        case 'Month':
          $scope.config.timeHeaders = [{groupBy: "Month"}, {groupBy: "Week", format: "Week - ww"}];
          $scope.config.scale = 'Day';
          $scope.config.cellWidth = document.body.clientWidth / 31;
          break;
        case 'Year':
          $scope.config.timeHeaders = [{groupBy: "Year"}, {groupBy: "Month", format: "MMMM"}];
          $scope.config.scale = 'Month';
          break;
      }
    }

    $scope.add = function () {
      $scope.events.push(
        {
          start: new DayPilot.Date("2014-01-05T00:00:00"),
          end: new DayPilot.Date("2014-09-06T00:00:00"),
          id: DayPilot.guid(),
          resource: "TheStar-Gaming-Event",
          text: "",
          backColor: "#ffffff",
          borerColor: "#ffffff",
          cellBorderColor: "#ffffff",
          fontColor: "#ffffff"
        }
      );
    };

    $scope.move = function () {
      var event = $scope.events[0];
      event.start = event.start.addDays(1);
      event.end = event.end.addDays(1);
    };

    $scope.rename = function () {
      $scope.events[0].text = "New name";
    };

  });
