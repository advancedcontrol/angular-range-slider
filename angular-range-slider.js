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
                        model: '=?'
                    },

                    template:   '<div class="co-range-slider" ng-class="{disabled: options.disabled, readonly: options.readonly, vert: options.vertical, horz: options.horizontal, animate: !dragging, dragging: dragging}"' + 
                                'ng-click="clicked($event)" touch-action="pan-y" drag-begin="dragStart($event)" drag-stop="dragEnd()" ng-drag="drag($event)">' +
                                    '<div class="track"></div>' +
                                    '<div class="progress"></div>' +
                                    '<div class="handle" role="slider" touch-action="pan-y" drag-begin="dragStart($event)" drag-stop="dragEnd()" ng-drag="drag($event)"></div>' +
                                    '<input ng-model="value" type="number" data-type="range" ng-class="{hide: !options.visible}" max="{{options.max}}" min="{{options.min}}" step="{{options.step}}">' +
                                '</div>',

                    link: function($scope, $element) {
                        var input    = $element.find('input'),
                            handle   = $element.find('.handle'),
                            progress = $element.find('.progress'),
                            options  = $scope.options;

                        var min  = options.min  || 0,
                            max  = options.max  || 100,
                            step = options.step || 1,
                            precision = Math.pow(10, options.precision || step);

                        if (options.horizontal) {
                            var handleProperty   = 'left';
                            var progressProperty = 'width';
                        } else {
                            var handleProperty   = 'bottom';
                            var progressProperty = 'height';
                        }

                        // ---------------------
                        // binding
                        // ---------------------
                        var lastModelValue = 0;

                        $scope.$watch('model', function(val) {
                            if ($scope.dragging) {
                                lastModelValue = val;
                                return;
                            } else {
                                $scope.value = val;
                                slide();
                            }
                        });

                        // ---------------------
                        // rendering
                        // ---------------------
                        function calculateValue(event) {
                            if (options.horizontal) {
                                var pos = event.center.pageX - $element.offset().left;
                                var percent = pos / $element.width();
                            } else {
                                var pos = event.center.pageY - $element.offset().top;
                                var percent = 1 - (pos / $element.height());
                            }

                            // expand the value to an number min...max, and clip
                            // it to a multiple of step
                            var stepped = Math.round((percent * max) / step) * step;

                            // round the stepped value to a precision level
                            var rounded = Math.round(stepped * precision) / precision;

                            // constraint min..X..max
                            return Math.min(max, Math.max(min, rounded));
                        }

                        function slide() {
                            var percent = ($scope.value / max) * 100;
                            progress.css(progressProperty, percent + '%');
                            handle.css(handleProperty, percent + '%');
                        }

                        function handleEvent(event) {
                            $scope.value = calculateValue(event);
                            $scope.model = $scope.value;
                            slide();
                        }

                        // ---------------------
                        // events
                        // ---------------------
                        $scope.clicked = function(event) {
                            if (options.disabled || event.target === handle[0]) {
                                event.stopPropagation();
                                return event.preventDefault();
                            } else {
                                handleEvent(event);
                            }
                        }

                        $scope.dragStart = function(event) {
                            event.stopPropagation();
                            event.preventDefault();
                            if (!options.disabled) {
                                $scope.dragging = true;
                                lastModelValue = $scope.value;
                            }
                        };

                        $scope.drag = function(event) {
                            if (options.disabled)
                                return;
                            else
                                handleEvent(event);
                        };

                        $scope.dragEnd = function() {
                            $scope.dragging = false;
                            $scope.value = lastModelValue;
                            slide();
                        };

                        // ---------------------
                        // initialisation
                        // ---------------------
                        $scope.value = $scope.model || 0;
                        $scope.dragging = false;
                        slide();
                    }
                }
            }
        ]);

}(this.angular));
