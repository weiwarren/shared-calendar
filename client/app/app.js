'use strict';

// Declare app level module which depends on views, and components
angular.module('echoCalendarApp', [
  'ngRoute',
  'ngCookies',
  'lbServices',
  'ngResource',
  'ngClipboard',
  'ngStorage',
  'daypilot',
  'angularMoment',
  'mgcrea.ngStrap.modal',
  'echoCalendarApp.auth',
  'echoCalendarApp.home',
  'echoCalendarApp.editEvent',
  'echoCalendarApp.eventDetails',
  'echoCalendarApp.advanceFilter',
  'echoCalendarApp.version',
  'echoCalendarApp.eventApproval',
  'echoCalendarApp.shareURL',
  'echoCalendarApp.error',
  'echoCalendarApp.admin'
])
  .config(['$routeProvider', '$httpProvider', 'LoopBackResourceProvider', 'ngClipProvider',
    function ($routeProvider, $httpProvider, LoopBackResourceProvider, ngClipProvider) {
      $routeProvider.when('/', {redirectTo: '/home'});
      // Use a custom auth header instead of the default 'Authorization'
      LoopBackResourceProvider.setAuthHeader('X-Access-Token');

      // Change the URL where to access the LoopBack REST API server
      LoopBackResourceProvider.setUrlBase('/api');

      // http interceptors
      $httpProvider.interceptors.push(function ($q, $window, $location, $cookies, $injector) {
        return {
          responseError: function (rejection) {
            var rootScope;
            if (rejection.status == 401) {
              //redirect to 401 if user is already logged in
              if ($cookies["access_token"] != 'undefined' && $cookies["access_token"] != undefined) {
                //possibly modal dialog
                rootScope = $injector.get('$rootScope');
                rootScope.hideLoading();
                $location.nextAfterLogin = $location.path();
                $location.path('/error/401');
              }
              else {
                //cache the redirect url except for login before redirect to login
                if ($location.path() != '/login'){
                  $location.nextAfterLogin = $location.path();
                }
                $location.path("/login");
              }
            }
            return $q.reject(rejection);
          }
        };
      });

      //flash clipboard for copy urls
      ngClipProvider.setPath("bower_components/zeroclipboard/dist/ZeroClipboard.swf");

      //moment js global config
      moment.locale('en-AU', {
        longDateFormat: {
          LT: "h:mm a",
          LTS: "H:mm:ss",
          L: "DD/MM/YYYY",
          LL: "D MMMM YYYY",
          LLL: "D MMMM YYYY LT",
          LLLL: "dddd D MMMM YYYY LT",
          F: "YYYY-MM-DD",
          FT: "YYYY-MM-DD HH:mm"
        }
      });
      moment.locale('en-AU');
    }])
  .filter('trim', function () {
    return function (text) {
      if (text)
        return text.replace(/\s+/g, '');
    };
  })
  //<debug val="?" />
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
  //global anchor config - prevent from angular routing
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
  //copy model values
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
  //reverse of syncModel directive
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
  //convert datetime 3rd party jquery module to angularjs directive
  .directive('datetimez', function ($rootScope) {
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
              setTimeout(function () {
                scope.$apply(function () {
                  scope.ngModel = e.date.format(scope.f);
                });
              })
            });

            if (ngModelCtrl.$viewValue) {
              element.data('DateTimePicker').setDate(scope.ngModel);
            }
          }
        );
      }
    }
  })
  //watch start, end date time and duration
  .directive('dateWatcher', function ($timeout) {
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
        scope.updating = false;

        scope.$watch('start', function (nv, ov) {
          if (nv && scope.duration && scope.enabled && !scope.updating) {
            scope.updating = true;
            scope.end = moment(nv, scope.format).add(scope.duration).format(scope.format);
          }
          else if (scope.updating) {
            scope.updaing = false;
          }
        });
        scope.$watch('duration', function (nv, ov) {
          if (nv && scope.start && scope.enabled && !scope.updating) {
            scope.updating = true;
            scope.end = moment(scope.start, scope.format).add(nv).format(scope.format);
          }
          else if (scope.updating) {
            scope.updating = false;
          }
        });
        scope.$watch('end', function (nv, ov) {
          if (nv && scope.start && scope.enabled && !scope.updating) {
            scope.updating = true;
            if (moment(scope.end, scope.format).diff(moment(scope.start, scope.format)) < 0) {
              scope.end = null;
            }
            else {
              scope.duration = moment.duration(moment(nv, scope.format).diff(moment(scope.start, scope.format)));
            }
          }
          else if (scope.updating) {
            scope.updating = false;
          }
        });
      }
    }
  })
  //image slider directive
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
  //focus on controls based on model
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
  //form wide error focus
  .directive('formFocusError', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        scope.$watch(attrs.formFocusError, function (nv) {
          if (nv) {
            setTimeout(function () {
              var el = $(element).find('.form-control.ng-invalid:first');
              if (el.is('.hidden')) {
                el.removeClass('hidden').focus().addClass('hidden');
              }
              else {
                el.focus();
              }
            }, 100);
          }
        })
      }
    }
  })
  //minimum value validator
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
  //max value validator
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
  //thumbnail preview using canvas
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
  .run(function ($rootScope, $injector, $cookies, $route, $localStorage, $location, $modal, LoopBackAuth, Event) {
    if ($localStorage["redirect_url"]) {
      $location.path($localStorage["redirect_url"]);
      $localStorage["redirect_url"] = null;
    }
    LoopBackAuth.setUser($cookies['access_token'], $cookies['userId'], {
      userName: $cookies['userName'],
      userRoles: $cookies['userRoles']
    });
    LoopBackAuth.rememberMe = false;
    LoopBackAuth.save();
    $rootScope.currentUserId = LoopBackAuth.currentUserData.userName || "Anonymous";
    $rootScope.accessToken = LoopBackAuth.accessTokenId;

    $injector.get("$http").defaults.transformRequest = function (data, headersGetter) {
      headersGetter()['X-Access-Token'] = LoopBackAuth.accessTokenId;
      if (data) {
        return angular.toJson(data);
      }
    };

    $rootScope.debug = $location.search().debug;

    //modalservice
    $rootScope.$on("$locationChangeStart", function (event, next) {
      //detect when the page is to be loaded using modal dialog
      if (next && next.toLowerCase().indexOf('?modal=1') > 0) {
        event.preventDefault();
        $rootScope.modal($location.path());
      }
    });

    $rootScope.checkApproval = function () {
      console.log(LoopBackAuth.currentUserData.userRoles)
      if (LoopBackAuth.currentUserData.userRoles == 'Manager') {
        Event.count({filter: {where: {approved: {ne: true}}}}, function (response) {
          $rootScope.waitApproval = response.count;
        });
      }
    };

    $rootScope.showLoading = function () {
      $rootScope.loadingModal = $modal.open({
        templateUrl: 'partials/loading.html',
        backdrop: 'static'
      });
    };

    $rootScope.hideLoading = function () {
      if ($rootScope.loadingModal)
        $rootScope.loadingModal.close();
    };

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
