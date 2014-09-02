(function (angular) {
    'use strict';

    angular.module('coRangeSlider', ['ngGesture', 'coAnimate'])
        .directive('range', [
            '$animation',

            function ($animation) {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {
                        options: '=?',
                        model: '='
                    },

                    template:   '<div class="co-range-slider" ng-class="{disabled: options.disabled, readonly: options.readonly, vert: options.vertical, horz: options.horizontal, animate: animate}"' + 
                                'ng-click="clicked($event)" touch-action="pan-y" drag-begin="dragStart($event, true)" drag-stop="dragEnd()" ng-drag="drag($position)">' +
                                    '<div class="track"></div>' +
                                    '<div class="progress"></div>' +
                                    '<span class="handle" role="slider" touch-action="pan-y" drag-begin="dragStart($event)" drag-stop="dragEnd()" ng-drag="drag($position)"></span>' +
                                    '<input type="number" data-type="range" ng-class="{hide: !options.visible}" max="{{options.max}}" min="{{options.min}}" step="{{options.step}}" />' +
                                '</div>'
                }
            }
        ]);

}(this.angular));
