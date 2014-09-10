(function (angular) {
    'use strict';
    
    // Use a common namespace
    var module;
    try {
        module = angular.module('coUtils');
    } catch (e) {
        module = angular.module('coUtils', ['ngGesture']);
    }
    
    // Ensures this module is loaded.
    angular.module('ngGesture');
    

    module
        .directive('coRange', [
                '$timeout',
            function ($timeout) {
                return {
                    restrict: 'A',
                    scope: {
                        model: '=?',
                        min: '=?',
                        max: '=?',
                        step: '=?',
                        precision: '=?',
                        horizontal: '=?',
                        disabled: '=?'
                    },

                    template:   
                        '<div ng-class="{disabled: disabled, horz: horizontal, vert: !horizontal, animate: !dragging, dragging: dragging}"' + 
                        'ng-click="clicked($event)" touch-action="pan-y" drag-begin="dragStart($event)" drag-stop="dragEnd()" ng-drag="drag($event)">' +
                            '<div class="track"></div>' +
                            '<div class="progress"></div>' +
                            '<div class="handle" role="slider" touch-action="pan-y" drag-begin="dragStart($event)" drag-stop="dragEnd()" ng-drag="drag($event)"></div>' +
                        '</div>',

                    link: function($scope, $element, attrs) {
                        var input    = $element.find('input'),
                            handle   = $element.find('.handle'),
                            progress = $element.find('.progress');

                        // defaults
                        $scope.min  = $scope.min  || 0;
                        $scope.max  = $scope.max  || 100;
                        $scope.step = $scope.step || 1;
                        $scope.horizontal = $scope.horizontal !== false;
                        $scope.disabled = $scope.disabled === false || attrs.hasOwnProperty('disabled');

                        // Add class to outer element (no replace)
                        $element.addClass('co-range-slider');
                        if (!$scope.horizontal) {
                            $element.addClass('vert');
                        }

                        // Keep precision in sync
                        var precision,
                            setPrecision = function () {
                                precision = Math.pow(10, $scope.precision || $scope.step);
                            };
                        $scope.$watch('precision', setPrecision);
                        $scope.$watch('step',      setPrecision);

                        // Keep orientation in sync
                        var handleProperty,
                            progressProperty;

                        $scope.$watch('horizontal', function (horizontal) {
                            if (handleProperty !== undefined) {
                                // remove the old styles
                                progress.css(progressProperty, '');
                                handle.css(handleProperty, '');
                            }

                            if (horizontal) {
                                handleProperty   = 'left';
                                progressProperty = 'width';
                                $element.removeClass('vert');
                            } else {
                                handleProperty   = 'bottom';
                                progressProperty = 'height';
                                $element.addClass('vert');
                            }

                            // Update to the new orientation
                            $timeout(slide, 0, false);
                        });

                        // ---------------------
                        // binding
                        // ---------------------
                        var lastModelValue = 0;

                        $scope.$watch('model', function(val) {
                            if ($scope.dragging) {
                                lastModelValue = val;
                                return;
                            } else if (val !== $scope.value && $scope.model !== undefined && $scope.model !== null) {
                                $scope.value = val;
                                slide();
                            }
                        });

                        // ---------------------
                        // rendering
                        // ---------------------
                        function calculateValue(event) {
                            if ($scope.horizontal) {
                                var pos = event.center.pageX - $element.offset().left;
                                var percent = pos / $element.width();
                            } else {
                                var pos = event.center.pageY - $element.offset().top;
                                var percent = 1 - (pos / $element.height());
                            }

                            // expand the value to an number min...max, and clip
                            // it to a multiple of step
                            var stepped = Math.round((percent * $scope.max) / $scope.step) * $scope.step;

                            // round the stepped value to a precision level
                            var rounded = Math.round(stepped * precision) / precision;

                            // constraint min..X..max
                            return Math.min($scope.max, Math.max($scope.min, rounded));
                        }

                        function slide() {
                            var percent = ($scope.value / $scope.max) * 100;
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
                            if ($scope.disabled || event.target === handle[0]) {
                                event.stopPropagation();
                                return event.preventDefault();
                            } else {
                                handleEvent(event);
                            }
                        }

                        $scope.dragStart = function(event) {
                            event.stopPropagation();
                            event.preventDefault();
                            if (!$scope.disabled) {
                                $scope.dragging = true;
                                lastModelValue = $scope.value;
                            }
                        };

                        $scope.drag = function(event) {
                            if ($scope.disabled)
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
                        // NOTE:: the watch on scope.horizontal will set the initial slide value
                    }
                }
            }
        ]);

}(this.angular));
