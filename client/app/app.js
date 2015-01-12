'use strict';

// Declare app level module which depends on views, and components
angular.module('echoCalendarApp', [
  'ngRoute',
  'ngCookies',
  'lbServices',
  'ngResource',
  'daypilot',
  'angularMoment',
  'mgcrea.ngStrap.modal',
  'echoCalendarApp.auth',
  'echoCalendarApp.home',
  'echoCalendarApp.editEvent',
  'echoCalendarApp.view2',
  'echoCalendarApp.eventDetails',
  'echoCalendarApp.advanceFilter',
  'echoCalendarApp.version',
  'echoCalendarApp.eventApproval'
]).
  config(['$routeProvider', '$httpProvider', 'LoopBackResourceProvider',
    function ($routeProvider, $httpProvider, LoopBackResourceProvider) {
      $routeProvider.when('/404', {
        templateUrl: 'views/home/404.html',
        controller: 'homeCtrl'
      }).otherwise({redirectTo: '/home'});
      // Use a custom auth header instead of the default 'Authorization'
      LoopBackResourceProvider.setAuthHeader('X-Access-Token');

      // Change the URL where to access the LoopBack REST API server
      LoopBackResourceProvider.setUrlBase('/api');

      $httpProvider.interceptors.push(function ($q, $window, $location) {
        return {
          responseError: function (rejection) {
            if (rejection.status == 401) {
              $location.nextAfterLogin = $location.path();
              $location.path('/login');
            }
            return $q.reject(rejection);
          }
        };
      });

      moment.locale('en-AU', {
        longDateFormat: {
          LT: "h:mm a",
          LTS: "H:mm:ss",
          L: "DD/MM/YYYY",
          LL: "D MMMM YYYY",
          LLL: "D MMMM YYYY LT",
          LLLL: "dddd D MMMM YYYY LT",
          F: "YYYY-MM-DD"
        }
      });
      moment.locale('en-AU');
    }])
  .directive('debug', function () {
    return {
      restrict: 'E',
      scope: {
        expression: '=val'
      },
      template: '<pre>{{debug(expression)}}</pre>',
      link: function (scope) {
        // pretty-prints
        scope.debug = function (exp) {
          return angular.toJson(exp, true);
        };
      }
    }
  })
  .directive('a', function () {
    return {
      restrict: 'E',
      link: function (scope, elem, attrs) {
        if (!attrs.target) {
          angular.element(elem).attr('target', '_self');
        }
      }
    }
  })
  .directive('syncModel', function () {
    return {
      restrict: 'A',
      scope: {
        syncModel: '=',
        ngModel: '='
      },
      link: function (scope) {
        scope.$watch('syncModel', function (nv) {
          scope.ngModel = nv;
        })
      }
    }
  })
  .directive('datetimez', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        pickTime: '=?',
        ngModel: '=?'
      },
      link: function (scope, element, attrs, ngModelCtrl) {
        scope.$watch('pickTime', function (nv) {
            moment.locale('en-AU');
            //update the format if it's all day event
            //the module has to be destroyed first when changing format.
            scope.f = nv ? 'L LT' : 'L';
            if (element.data('DateTimePicker')) {
              element.data('DateTimePicker').destroy();
            }
            if (ngModelCtrl.$viewValue) {
              scope.ngModel = moment(ngModelCtrl.$viewValue, scope.f).format(scope.f);
            }
            element.datetimepicker({
              language: 'en-AU',
              pickTime: nv
            }).on('dp.change', function (e) {
              scope.ngModel = e.date.format(scope.f);
              if (!scope.$$phase) {
                scope.$apply();
              }
            });
          }
        );
      }
    }
  })
  .directive('dateWatcher', function () {
    return {
      restrict: '',
      scope: {
        start: '=',
        end: '=',
        duration: '=',
        format: '=',
        enabled: '=?'
      },
      link: function (scope, element, attrs) {
        //this is not the best way as in event editing, data prepopulates, and this causes multiple watchers
        scope.$watch('start', function (nv, ov) {
          if (nv && scope.duration && scope.enabled) {
            scope.end = moment(nv, scope.format).add(scope.duration).format(scope.format);
          }
        });
        scope.$watch('duration', function (nv, ov) {
          if (nv && scope.start && scope.enabled) {
           // scope.end = moment(scope.start, scope.format).add(nv).format(scope.format);
          }
        });
        scope.$watch('end', function (nv, ov) {
          if (nv && scope.start && scope.enabled)
            scope.duration = moment.duration(moment(nv, scope.format).diff(moment(scope.start, scope.format)));
        });
      }
    }
  })
  .directive('wrapOwlcarousel', function ($timeout) {
    return {
      restrict: 'E',
      require: 'ngModel',
      link: function (scope, element, attrs) {
        var options = scope.$eval($(element).attr('data-options'));
        scope.$watch(attrs.ngModel, function (newValue) {
          if (newValue) {
            $timeout(function () {
              $(element).owlCarousel(options)
            });
          }
        })
      }
    };
  })
  .directive('focusMe', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        scope.$watch(attrs.focusMe, function (nv) {
          if (nv) {
            setTimeout(function () {
              element.focus();
            }, 100);
          }
        })
      }
    }
  })
  .directive('ngThumb', ['$window', function ($window) {
    var helper = {
      support: !!($window.FileReader && $window.CanvasRenderingContext2D),
      isFile: function (item) {
        return angular.isObject(item) && item instanceof $window.File;
      },
      isImage: function (file) {
        var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    };

    return {
      restrict: 'A',
      template: '<canvas/>',
      link: function (scope, element, attributes) {
        if (!helper.support) return;

        var params = scope.$eval(attributes.ngThumb);

        if (!helper.isFile(params.file)) return;
        if (!helper.isImage(params.file)) return;

        var canvas = element.find('canvas');
        var reader = new FileReader();

        reader.onload = onLoadFile;
        reader.readAsDataURL(params.file);

        function onLoadFile(event) {
          var img = new Image();
          img.class = "thumbnail";
          img.onload = onLoadImage;
          img.src = event.target.result;
        }

        function onLoadImage() {
          var width = params.width || this.width / this.height * params.height;
          var height = params.height || this.height / this.width * params.width;
          canvas.attr({width: width, height: height, class: 'thumbnail'});
          canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
        }
      }
    };
  }])
  .directive('updateModel', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        'ngModel': '=',
        'updateModel': '='
      },
      link: function (scope, element, attrs) {
        scope.$watch('ngModel', function (nv, ov) {
          if (nv != ov) {
            scope.updateModel = nv;
          }
        });
      }
    }
  })
  .directive('ngMin', function () {
    function isEmpty(value) {
      return angular.isUndefined(value) || value === '' || value === null || value !== value;
    }

    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, elem, attr, ctrl) {
        scope.$watch(attr.ngMin, function () {
          ctrl.$setViewValue(ctrl.$viewValue);
        });
        var minValidator = function (value) {
          var min = scope.$eval(attr.ngMin) || 0;
          if (!isEmpty(value) && value < min) {
            ctrl.$setValidity('ngMin', false);
            return undefined;
          } else {
            ctrl.$setValidity('ngMin', true);
            return value;
          }
        };

        ctrl.$parsers.push(minValidator);
        ctrl.$formatters.push(minValidator);
      }
    };
  })
  .directive('ngMax', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, elem, attr, ctrl) {
        function isEmpty(value) {
          return angular.isUndefined(value) || value === '' || value === null || value !== value;
        }

        scope.$watch(attr.ngMax, function () {
          ctrl.$setViewValue(ctrl.$viewValue);
        });
        var maxValidator = function (value) {
          var max = scope.$eval(attr.ngMax) || Infinity;
          if (!isEmpty(value) && value > max) {
            ctrl.$setValidity('ngMax', false);
            return undefined;
          } else {
            ctrl.$setValidity('ngMax', true);
            return value;
          }
        };

        ctrl.$parsers.push(maxValidator);
        ctrl.$formatters.push(maxValidator);
      }
    };
  })
  .directive('watchCheckers', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        scope.$watch(attrs.ngModel, function () {

        })
      }
    }
  })
  .run(function ($rootScope, $cookies, $route, $location, $modal, LoopBackAuth) {
    LoopBackAuth.setUser($cookies['access_token'], $cookies['userId'], {userName: $cookies['userName']});
    LoopBackAuth.rememberMe = false;
    LoopBackAuth.save();
    $rootScope.currentUserId = LoopBackAuth.currentUserData.userName || "Anonymous";
    console.log("token", $cookies['access_token']);
    //modalservice
    $rootScope.$on("$locationChangeStart", function (event, next) {
      //detect when the page is to be loaded using modal dialog
      if (next && next.toLowerCase().indexOf('?modal=1') > 0) {
        event.preventDefault();
        $rootScope.modal($location.path());
      }
    });


    $rootScope.modal = function (path, params) {
      angular.forEach($route.routes, function (item) {
        if (item.templateUrl && item.controller && path.match(item.regexp)) {
          var resolve = {
            isModal: function () {
              return true
            }
          };
          for (var key in params) {
            resolve[key] = function () {
              return params[key];
            }
          }
          $modal.open({
            templateUrl: item.templateUrl,
            controller: item.controller,
            backdrop: true,
            windowClass: 'full-screen-modal',
            resolve: resolve
          });
        }
      })
    };

    $rootScope.guid = (function () {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }

      return function () {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
      };
    })();
  })
;
