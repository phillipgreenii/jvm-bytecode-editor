(function() {
	"use strict";

	/* App Module */
	var uiModule = angular.module('listarUi', []);


	/**
	 * Directive that executes an expression when the element it is applied to loses focus
	 */
	uiModule.directive('todoBlur', function() {
		return function(scope, elem, attrs) {
			elem.bind('blur', function() {
				scope.$apply(attrs.todoBlur);
			});
		};
	});

	/**
	 * Directive that places focus on the element it is applied to when the expression it binds to evaluates to true
	 */
	uiModule.directive('todoFocus', function($timeout) {
		return function(scope, elem, attrs) {
			scope.$watch(attrs.todoFocus, function(newVal) {
				if (newVal) {
					$timeout(function() {
						elem[0].focus();
					}, 0, false);
				}
			});
		};
	});

}());