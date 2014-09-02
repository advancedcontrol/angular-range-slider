(function (angular) {
    'use strict';

    angular.module('coRangeSlider', ['ngGesture', 'coAnimate', 'SafeApply'])
        .directive('range', [
            '$window',
            '$timeout',
            '$safeApply',
            '$animation',
            function ($window, $timeout, $safeApply, $animation) {

            }
        ]);

}(this.angular));
