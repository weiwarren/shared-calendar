'use strict';

angular.module('echoCalendarApp.version', [
  'echoCalendarApp.version.interpolate-filter',
  'echoCalendarApp.version.version-directive'
])

.value('version', '0.1');
