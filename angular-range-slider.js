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
                                    '<div class="handle" role="slider" touch-action="pan-y" drag-begin="dragStart($event)" drag-stop="dragEnd()" ng-drag="drag($position)"></div>' +
                                    '<input type="number" data-type="range" ng-class="{hide: !options.visible}" max="{{options.max}}" min="{{options.min}}" step="{{options.step}}" />' +
                                '</div>',

                    link: function($scope, $element) {
                        var input = $element.find('input'),
                            handle = $element.find('.handle'),
                            progress = $element.find('.progress'),
                            value = $scope.model,
                            dragging = false;

                        if ($scope.options.horizontal) {
                            var handleProperty   = 'left';
                            var progressProperty = 'width';
                        } else {
                            var handleProperty   = 'bottom';
                            var progressProperty = 'height';
                        }

                        function calculateValue(event) {
                            if ($scope.options.horizontal) {
                                var pos = event.center.pageX - $element.offset().left;
                                var percent = pos / $element.width();
                            } else {
                                var pos = event.center.pageY - $element.offset().top;
                                var percent = 1 - (pos / $element.height());
                            }

                            // TODO: handle min, max, steps etc. here
                            return Math.round(percent * 100);
                        }

                        function slide() {
                            progress.css(progressProperty, value + '%');
                            handle.css(handleProperty, value + '%');
                            input.val(value);
                        }

                        $scope.clicked = function(event) {
                            value = calculateValue(event);
                            $scope.model = value;
                            slide();
                        }

                        slide();
                    }
                }
            }
        ]);

}(this.angular));
