(function() {
	"use strict";

	/* App Module */
	var listModule = angular.module('list', ['ngResource', 'ngSanitize', 'ui.bootstrap']);


	listModule.controller('TodoCtrl', function TodoCtrl($scope, $location, todoStorage, filterFilter) {
		var todos = $scope.todos = todoStorage.get();

		$scope.newTodo = '';
		$scope.remainingCount = filterFilter(todos, {
			completed: false
		}).length;
		$scope.editedTodo = null;

		if ($location.path() === '') {
			$location.path('/');
		}

		$scope.location = $location;

		$scope.$watch('location.path()', function(path) {
			$scope.statusFilter = (path === '/active') ? {
				completed: false
			} : (path === '/completed') ? {
				completed: true
			} : null;
		});

		$scope.$watch('remainingCount == 0', function(val) {
			$scope.allChecked = val;
		});

		$scope.addTodo = function() {
			var newTodo = $scope.newTodo.trim();
			if (newTodo.length === 0) {
				return;
			}

			todos.push({
				title: newTodo,
				completed: false
			});
			todoStorage.put(todos);

			$scope.newTodo = '';
			$scope.remainingCount++;
		};

		$scope.editTodo = function(todo) {
			$scope.editedTodo = todo;
		};

		$scope.doneEditing = function(todo) {
			$scope.editedTodo = null;
			todo.title = todo.title.trim();

			if (!todo.title) {
				$scope.removeTodo(todo);
			}

			todoStorage.put(todos);
		};

		$scope.removeTodo = function(todo) {
			$scope.remainingCount -= todo.completed ? 0 : 1;
			todos.splice(todos.indexOf(todo), 1);
			todoStorage.put(todos);
		};

		$scope.todoCompleted = function(todo) {
			if (todo.completed) {
				$scope.remainingCount--;
			} else {
				$scope.remainingCount++;
			}
			todoStorage.put(todos);
		};

		$scope.clearCompletedTodos = function() {
			$scope.todos = todos = todos.filter(function(val) {
				return !val.completed;
			});
			todoStorage.put(todos);
		};

		$scope.markAll = function(completed) {
			todos.forEach(function(todo) {
				todo.completed = completed;
			});
			$scope.remainingCount = completed ? 0 : todos.length;
			todoStorage.put(todos);
		};
	});


	/**
	 * Directive that executes an expression when the element it is applied to loses focus
	 */
	listModule.directive('todoBlur', function() {
		return function(scope, elem, attrs) {
			elem.bind('blur', function() {
				scope.$apply(attrs.todoBlur);
			});
		};
	});


	/**
	 * Directive that places focus on the element it is applied to when the expression it binds to evaluates to true
	 */
	listModule.directive('todoFocus', function($timeout) {
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


	/**
	 * Services that persists and retrieves TODOs from localStorage
	 */
	listModule.factory('todoStorage', function() {
		var STORAGE_ID = 'todos-angularjs-perf';

		return {
			get: function() {
				return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
			},

			put: function(todos) {
				localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
			}
		};
	});

}());