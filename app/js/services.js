'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
    .value('version', 'v1.0')
    .factory('AuthInterceptor', ['$rootScope', '$q', 'AUTH_EVENTS',
        function ($rootScope, $q, AUTH_EVENTS) {
            var CODE_MAPPING = {
                401: AUTH_EVENTS.loginNeeded,
                403: AUTH_EVENTS.httpForbidden,
                419: AUTH_EVENTS.loginNeeded,
                440: AUTH_EVENTS.loginNeeded
            };
            return {
                request: function (config) {
                    $rootScope.loading = true;
                    return config
                },
                requestError: function (rejection) {
                    $rootScope.loading = false;
                    return $q.reject(rejection);
                },
                response: function (res) {
                    $rootScope.loading = false;
                    return res;
                },
                responseError: function (response) {
                    $rootScope.loading = false;
                    var val = CODE_MAPPING[response.status];
                    if (val) {
                        $rootScope.$broadcast(val, response);
                    }
                    return $q.reject(response);
                }
            };
        }])
    .service('ConfirmService', ['$modal', function ($modal) {
        this.confirm = function (txt) {
            return $modal.open({
                templateUrl: 'partials/w/confirm.html',
                size: 'sm',
                controller: function ($scope, $modalInstance, txt) {
                    $scope.txt = txt;
                    $scope.ok = function () {
                        $modalInstance.close(true);
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss();
                    };
                },
                resolve: {
                    txt: function () {
                        return txt;
                    }
                }
            }).result;
        };
    }])
    .service('Alert', ['$modal', function ($modal) {
        this.alert = function (txt, err) {
            return $modal.open({
                templateUrl: 'partials/w/alert.html',
                size: 'sm',
                controller: function ($scope, $modalInstance, txt) {
                    $scope.txt = txt;
                    $scope.err = err;
                    $scope.ok = function () {
                        $modalInstance.close();
                    };
                },
                resolve: {
                    txt: function () {
                        return txt;
                    },
                    err: function () {
                        return err;
                    }
                }
            }).result;
        };
    }])
    .service('KeywordSelectService', ['$modal', '$log', 'CONFIG',
        function ($modal, $log, CONFIG) {
            /*
             * @ids, initial keyword ids
             */
            this.open = function (ids) {
                var LIMIT = CONFIG.limit;
                return $modal.open({
                    templateUrl: 'partials/keyword/keyword_select.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance, Keyword, keywords) {
                        $scope.keywords = keywords;
                        $scope.grid = {
                            page: 1
                        };
                        $scope.ids = angular.copy(ids);
                        var refresh = function (page) {
                            $log.info('refresh');
                            var SPEC = {page: page, size: LIMIT};
                            if ($scope.grid.name) {
                                SPEC.name = $scope.grid.name;
                            }

                            var d = Keyword.get(SPEC, function () {
                                $scope.keywords = d;
                            });
                        };

                        $scope.search = function () {
                            refresh($scope.grid.page);
                        };

                        $scope.$watch('grid.page', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                refresh(newVal);
                            }
                        });

                        $scope.toggleSelection = function (id) {
                            var idx = $scope.ids.indexOf(id);
                            if (idx > -1) {
                                $scope.ids.splice(idx, 1);
                            } else {
                                $scope.ids.push(id);
                            }
                        };

                        $scope.ok = function () {
                            $modalInstance.close($scope.ids);
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    },
                    resolve: {
                        keywords: function (Keyword) {
                            return Keyword.get({page: 1, size: LIMIT}).$promise;
                        }
                    }
                }).result;
            };
        }])
    .service('ResourceSingleSelectService', ['$modal', '$log', 'CONFIG',
        function ($modal, $log, CONFIG) {
            this.open = function (id, tp, cancelWithClose) {
                if (tp == undefined) {
                    tp = "";
                }
                var LIMIT = CONFIG.limit;
                return $modal.open({
                    templateUrl: 'partials/resource/resource_single_select.html',
                    controller: function ($scope, $modalInstance, Resource, resources) {
                        $scope.resources = resources;
                        $scope.grid = {
                            page: 1
                        };
                        $scope.selectedId = angular.copy(id);

                        var refresh = function (page) {
                            $log.info('refresh');
                            var SPEC = {page: page, size: LIMIT};
                            if ($scope.grid.name) {
                                SPEC.name = $scope.grid.name;
                            }
                            if (tp) {
                                SPEC.tp = tp;
                            }
                            var d = Resource.get(SPEC, function () {
                                $scope.resources = d;
                            });
                        };

                        $scope.search = function () {
                            refresh($scope.grid.page);
                        };

                        $scope.$watch('grid.page', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                refresh(newVal);
                            }
                        });

                        $scope.toggleSelection = function (r) {
                            $scope.selectedId = r.id;
                            $modalInstance.close(r);
                        };

                        $scope.cancel = function () {
                            if (cancelWithClose) {
                                $modalInstance.close();
                            } else {
                                $modalInstance.dismiss();
                            }
                        };
                    },
                    resolve: {
                        resources: function (Resource) {
                            return Resource.get({page: 1, size: LIMIT, tp: tp}).$promise;
                        }
                    }
                }).result;
            };
        }])
    .service('ResourceSelectService', ['$modal', '$log', 'CONFIG',
        function ($modal, $log, CONFIG) {
            /*
             * @ids, initial resource ids
             */
            this.open = function (ids, tp) {
                if (tp == undefined) {
                    tp = 1;
                }

                var LIMIT = CONFIG.limit;
                return $modal.open({
                    templateUrl: 'partials/resource/resource_select.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance, Resource, resources) {
                        $scope.resources = resources;
                        $scope.grid = {
                            page: 1,
                            tp: tp
                        };
                        $scope.ids = angular.copy(ids);

                        var refresh = function (page) {
                            $log.info('refresh');
                            var SPEC = {page: page, size: LIMIT, tp: 1, status: 1};
                            if ($scope.grid.name) {
                                SPEC.name = $scope.grid.name;
                            }
                            var d = Resource.get(SPEC, function () {
                                $scope.resources = d;
                            });
                        };

                        $scope.search = function () {
                            refresh($scope.grid.page);
                        };

                        $scope.$watch('grid.page', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                refresh(newVal);
                            }
                        });

                        $scope.toggleSelection = function (id) {
                            var idx = $scope.ids.indexOf(id);
                            if (idx > -1) {
                                $scope.ids.splice(idx, 1);
                            } else {
                                $scope.ids.push(id);
                            }
                        };

                        $scope.ok = function () {
                            $modalInstance.close($scope.ids);
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    },
                    resolve: {
                        resources: function (Resource) {
                            return Resource.get({page: 1, size: LIMIT, tp: tp, status: 1}).$promise;
                        }
                    }
                }).result;
            };
        }])
    .service('UserSingleSelectService', ['$modal', '$log', 'CONFIG',
        function ($modal, $log, CONFIG) {
            this.open = function (id, tp) {
                if (tp == undefined) {
                    tp = "";
                }

                var LIMIT = CONFIG.limit;
                return $modal.open({
                    templateUrl: 'partials/user/user_single_select.html',
                    controller: function ($scope, $modalInstance, User, users) {
                        $scope.users = users;
                        $scope.grid = {
                            page: 1
                        };
                        $scope.selectedId = angular.copy(id);
                        if (tp == 1) {
                            $scope.user_type = '达人';
                        } else if (tp == 2) {
                            $scope.user_type = '编辑';
                        } else {
                            $scope.user_type = '用户';
                        }
                        var refresh = function (page) {
                            $log.info('refresh');
                            var SPEC = {page: page, size: LIMIT};
                            if ($scope.grid.name) {
                                SPEC.name = $scope.grid.name;
                            }
                            if (tp) {
                                SPEC.tp = tp;
                            }
                            var d = User.get(SPEC, function () {
                                $scope.users = d;
                            });
                        };

                        $scope.search = function () {
                            refresh($scope.grid.page);
                        };

                        $scope.$watch('grid.page', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                refresh(newVal);
                            }
                        });

                        $scope.toggleSelection = function (r) {
                            $scope.selectedId = r.id;
                            $modalInstance.close(r);
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    },
                    resolve: {
                        users: function (User) {
                            return User.get({page: 1, size: LIMIT, tp: tp}).$promise;
                        }
                    }
                }).result;
            };
        }])
    .service('UserSelectService', ['$modal', '$log', 'CONFIG',
        function ($modal, $log, CONFIG) {
            /*
             * @ids, initial resource ids
             */
            this.open = function (ids, tp, max_users) {
                if (tp == undefined) {
                    tp = "";
                }

                var LIMIT = CONFIG.limit;
                return $modal.open({
                    templateUrl: 'partials/user/user_select.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance, User, data) {
                        $scope.users = data;
                        $scope.grid = {
                            page: 1,
                            tp: 1
                        };
                        $scope.ids = angular.copy(ids);

                        if (tp == 1) {
                            $scope.user_type = '达人';
                        } else if (tp == 2) {
                            $scope.user_type = '编辑';
                        } else {
                            $scope.user_type = '用户';
                        }
                        $scope.max_users = max_users;

                        var refresh = function (page) {
                            $log.info('refresh');
                            var SPEC = {page: page, size: LIMIT};
                            if ($scope.grid.name) {
                                SPEC.name = $scope.grid.name;
                            }

                            if (tp) {
                                SPEC.tp = tp;
                            }

                            var d = User.get(SPEC, function () {
                                $scope.users = d;
                            });
                        };

                        $scope.search = function () {
                            refresh($scope.grid.page);
                        };

                        $scope.$watch('grid.page', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                refresh(newVal);
                            }
                        });

                        $scope.toggleSelection = function (id) {
                            var idx = $scope.ids.indexOf(id);
                            if (idx > -1) {
                                $scope.ids.splice(idx, 1);
                            } else {
                                $scope.ids.push(id);
                            }
                        };

                        $scope.ok = function () {
                            $modalInstance.close($scope.ids);
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    },
                    resolve: {
                        data: function (User) {
                            return User.get({page: 1, size: LIMIT, tp: tp}).$promise;
                        }
                    }
                }).result;
            };
        }])
    .service('ArticleSelectService', ['$modal', '$log', 'CONFIG', 'Article',
        function ($modal, $log, CONFIG, Article) {
            /*
             * @ids, initial ids
             */
            this.open = function (ids, max_length) {
                if (!max_length) {
                    max_length = 3;
                }
                var LIMIT = CONFIG.limit;
                return $modal.open({
                    templateUrl: 'partials/article/article_select.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance, Article, articles, VALID, STATUS) {
                        $scope.data = articles;
                        $scope.grid = {
                            page: 1
                        };
                        $scope.ids = angular.copy(ids);
                        $scope.max_length = max_length;

                        var refresh = function (page) {
                            $log.info('refresh');
                            var SPEC = {page: page, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED};
                            if ($scope.grid.name) {
                                SPEC.q = $scope.grid.name;
                            }
                            var d = Article.get(SPEC, function () {
                                $scope.data = d;
                            });
                        };

                        $scope.search = function () {
                            refresh($scope.grid.page);
                        };

                        $scope.$watch('grid.page', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                refresh(newVal);
                            }
                        });

                        $scope.toggleSelection = function (id) {
                            var idx = $scope.ids.indexOf(id);
                            if (idx > -1) {
                                $scope.ids.splice(idx, 1);
                            } else {
                                $scope.ids.push(id);
                            }
                            $log.debug("selected articles:", $scope.ids);
                        };

                        $scope.ok = function () {
                            $modalInstance.close($scope.ids);
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    },
                    resolve: {
                        articles: function (Article, VALID, STATUS) {
                            return Article.get({page: 1, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED}).$promise;
                        }
                    }
                }).result;
            };
        }])
    .service('ArticleSingleSelectService', ['$modal', '$log', 'CONFIG', 'Article',
        function ($modal, $log, CONFIG, Article) {
            /*
             * @ids, initial ids
             */
            this.open = function (ids, cancelWithClose) {
                var LIMIT = CONFIG.limit;
                return $modal.open({
                    templateUrl: 'partials/article/article_single_select.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance, Article, articles, VALID, STATUS) {
                        $scope.data = articles;
                        $scope.grid = {
                            page: 1
                        };
                        $scope.ids = ids;
                        var refresh = function (page) {
                            $log.info('refresh');
                            var SPEC = {page: page, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED};
                            if ($scope.grid.name) {
                                SPEC.q = $scope.grid.name;
                            }
                            var d = Article.get(SPEC, function () {
                                $scope.data = d;
                            });
                        };

                        $scope.search = function () {
                            refresh($scope.grid.page);
                        };

                        $scope.$watch('grid.page', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                refresh(newVal);
                            }
                        });
                        $scope.toggleSelection = function (r) {
                            $scope.ids = r.id;
                            $modalInstance.close(r);
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    },
                    resolve: {
                        articles: function (Article, VALID, STATUS) {
                            return Article.get({page: 1, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED}).$promise;
                        }
                    }
                }).result;
            };
        }])
    .service('ActivitySelectService', ['$modal', '$log', 'CONFIG',
        function ($modal, $log, CONFIG) {
            /*
             * @ids, initial ids
             */
            this.open = function (ids, max_activities, filterId) {
                if (max_activities === undefined) {
                    max_activities = 1;
                }

                if (filterId === undefined) {
                    filterId = '';
                }

                var LIMIT = CONFIG.limit;
                return $modal.open({
                    templateUrl: 'partials/activity/activity_select.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance, Activity, activities, VALID, STATUS) {
                        $scope.data = activities;
                        $scope.grid = {
                            page: 1
                        };
                        $scope.max_activities = max_activities;
                        $scope.ids = angular.copy(ids);

                        var refresh = function (page) {
                            $log.info('refresh');
                            var SPEC = {page: page, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED, filterId: filterId};
                            if ($scope.grid.name) {
                                SPEC.q = $scope.grid.name;
                            }
                            var d = Activity.get(SPEC, function () {
                                $scope.data = d;
                            });
                        };

                        $scope.search = function () {
                            refresh($scope.grid.page);
                        };

                        $scope.$watch('grid.page', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                refresh(newVal);
                            }
                        });

                        $scope.toggleSelection = function (id) {
                            var idx = $scope.ids.indexOf(id);
                            if (idx > -1) {
                                $scope.ids.splice(idx, 1);
                            } else {
                                $scope.ids.push(id);
                            }
                            $log.debug("selected activities:", $scope.ids);
                        };

                        $scope.ok = function () {
                            $modalInstance.close($scope.ids);
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    },
                    resolve: {
                        activities: function (Activity, VALID, STATUS) {
                            return Activity.get({page: 1, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED, filterId: filterId}).$promise;
                        }
                    }
                }).result;
            };
        }])
    .service('ActivitySingleSelectService', ['$modal', '$log', 'CONFIG',
        function ($modal, $log, CONFIG) {
            /*
             * @ids, initial ids
             */
            this.open = function (ids, cancelWithClose) {
                var LIMIT = CONFIG.limit;
                return $modal.open({
                    templateUrl: 'partials/activity/activity_single_select.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance, Activity, activities, VALID, STATUS) {
                        $scope.data = activities;
                        $scope.grid = {
                            page: 1
                        };
                          $scope.ids = ids;

                        var refresh = function (page) {
                            $log.info('refresh');
                            var SPEC = {page: page, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED};
                            if ($scope.grid.name) {
                                SPEC.q = $scope.grid.name;
                            }
                            var d = Activity.get(SPEC, function () {
                                $scope.data = d;
                            });
                        };

                        $scope.search = function () {
                            refresh($scope.grid.page);
                        };

                        $scope.$watch('grid.page', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                refresh(newVal);
                            }
                        });

                        $scope.toggleSelection = function (r) {
                            $scope.ids = r.id;
                            $modalInstance.close(r);
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    },
                    resolve: {
                        activities: function (Activity, VALID, STATUS) {
                            return Activity.get({page: 1, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED}).$promise;
                        }
                    }
                }).result;
            };
        }])
    .service('LiveSingleSelectService', ['$modal', '$log', 'CONFIG',
        function ($modal, $log, CONFIG) {
            /*
             * @ids, initial ids
             */
            this.open = function (ids, cancelWithClose) {
                var LIMIT = CONFIG.limit;
                return $modal.open({
                    templateUrl: 'partials/live/live_single_select.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance, Live, lives, VALID, STATUS) {
                        $scope.data = lives;
                        $scope.grid = {
                            page: 1
                        };
                        $scope.ids = ids;

                        var refresh = function (page) {
                            $log.info('refresh');
                            var SPEC = {page: page, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED};
                            if ($scope.grid.name) {
                                SPEC.q = $scope.grid.name;
                            }
                            var d = Live.get(SPEC, function () {
                                $scope.data = d;
                            });
                        };

                        $scope.search = function () {
                            refresh($scope.grid.page);
                        };

                        $scope.$watch('grid.page', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                refresh(newVal);
                            }
                        });

                        $scope.toggleSelection = function (r) {
                            $scope.ids = r.id;
                            $modalInstance.close(r);
                        };
                        // $scope.toggleSelection = function (id) {
                        //
                        //     var idx = $scope.ids.indexOf(id);
                        //     if (idx > -1) {
                        //         $scope.ids.splice(idx, 1);
                        //     } else {
                        //         $scope.ids.push(id);
                        //     }
                        //     $log.debug("selected lives:", $scope.ids);
                        // };

                        // $scope.ok = function () {
                        //     $modalInstance.close($scope.ids);
                        // };
                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    },
                    resolve: {
                        lives: function (Live, VALID, STATUS) {
                            return Live.get({page: 1, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED}).$promise;
                        }
                    }
                }).result;
            };
        }])
    .service('LiveSelectService', ['$modal', '$log', 'CONFIG',
        function ($modal, $log, CONFIG) {
            /*
             * @ids, initial ids
             */
            this.open = function (ids, max_lives, filterId) {
                if (max_lives === undefined) {
                    max_lives = 1;
                }
                if (filterId === undefined) {
                    filterId = '';
                }
                var LIMIT = CONFIG.limit;
                return $modal.open({
                    templateUrl: 'partials/live/live_select.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance, Live, lives, VALID, STATUS) {
                        $scope.data = lives;
                        $scope.grid = {
                            page: 1
                        };
                        $scope.max_lives = max_lives;
                        $scope.ids = angular.copy(ids);
                        var refresh = function (page) {
                            $log.info('refresh');
                            var SPEC = {page: page, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED, filterId: filterId};
                            if ($scope.grid.name) {
                                SPEC.q = $scope.grid.name;
                            }
                            var d = Live.get(SPEC, function () {
                                $scope.data = d;
                            });
                        };

                        $scope.search = function () {
                            refresh($scope.grid.page);
                        };

                        $scope.$watch('grid.page', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                refresh(newVal);
                            }
                        });

                        $scope.toggleSelection = function (id) {

                            var idx = $scope.ids.indexOf(id);
                            if (idx > -1) {
                                $scope.ids.splice(idx, 1);
                            } else {
                                $scope.ids.push(id);
                            }
                            $log.debug("selected lives:", $scope.ids);
                        };

                        $scope.ok = function () {
                            $modalInstance.close($scope.ids);
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    },
                    resolve: {
                        lives: function (Live, VALID, STATUS) {
                            return Live.get({page: 1, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED, filterId: filterId}).$promise;
                        }
                    }
                }).result;
            };
        }])
    .service('AdSelectService', ['$modal', '$log', 'CONFIG',
        function ($modal, $log, CONFIG) {
            /*
             * @ids, initial ids
             */
            this.open = function (ids, max_ads) {
                if (max_ads === undefined) {
                    max_ads = 1;
                }

                var LIMIT = CONFIG.limit;
                return $modal.open({
                    templateUrl: 'partials/ad/ad_select.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance, Ad, ads, VALID, STATUS) {
                        $scope.data = ads;
                        $scope.grid = {
                            page: 1
                        };
                        $scope.max_ads = max_ads;
                        $scope.ids = angular.copy(ids);

                        var refresh = function (page) {
                            $log.info('refresh');
                            var SPEC = {page: page, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED};
                            var d = Ad.search.get(SPEC, function () {
                                $scope.data = d;
                            });
                        };

                        $scope.search = function () {
                            refresh($scope.grid.page);
                        };

                        $scope.$watch('grid.page', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                refresh(newVal);
                            }
                        });

                        $scope.toggleSelection = function (id) {
                            var idx = $scope.ids.indexOf(id);
                            if (idx > -1) {
                                $scope.ids.splice(idx, 1);
                            } else {
                                $scope.ids.push(id);
                            }
                            $log.debug("selected ads:", $scope.ids);
                        };

                        $scope.ok = function () {
                            $modalInstance.close($scope.ids);
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    },
                    resolve: {
                        ads: function (Ad, VALID, STATUS) {
                            return Ad.search.get({page: 1, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED}).$promise;
                        }
                    }
                }).result;
            };
        }])
    .service('TopicSelectService', ['$modal', '$log', 'CONFIG', 'Article',
        function ($modal, $log, CONFIG,Article) {
            /*
             * @ids, initial ids
             */
            this.open = function (ids, max_length) {
                if (!max_length) {
                    max_length = 3;
                }
                var LIMIT = CONFIG.limit;
                return $modal.open({
                    templateUrl: 'partials/topic/topic_select.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance, Article, articles, VALID, STATUS) {
                        $scope.data = articles;
                        $scope.grid = {
                            page: 1
                        };
                        $scope.ids = angular.copy(ids);
                        $scope.max_length = max_length;

                        var refresh = function (page) {
                            $log.info('refresh');
                            var SPEC = {page: page, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED,isTopic:1};
                            if ($scope.grid.name) {
                                SPEC.q = $scope.grid.name;
                            }
                            var d = Article.get(SPEC, function () {
                                $scope.data = d;
                            });
                        };

                        $scope.search = function () {
                            refresh($scope.grid.page);
                        };

                        $scope.$watch('grid.page', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                refresh(newVal);
                            }
                        });

                        $scope.toggleSelection = function (id) {
                            var idx = $scope.ids.indexOf(id);
                            if (idx > -1) {
                                $scope.ids.splice(idx, 1);
                            } else {
                                $scope.ids.push(id);
                            }
                            $log.debug("selected articles:", $scope.ids);
                        };

                        $scope.ok = function () {
                            $modalInstance.close($scope.ids);
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    },
                    resolve: {
                        articles: function (Topic, VALID, STATUS) {
                            return Article.get({page: 1, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED,isTopic:1}).$promise;
                        }
                    }
                }).result;
            };
        }])
    .service('GoodsSingleSelectService', ['$modal', '$log', 'CONFIG',
        function ($modal, $log, CONFIG) {
            this.open = function (id, cancelWithClose) {
                var LIMIT = CONFIG.limit;
                return $modal.open({
                    templateUrl: 'partials/goods/goods_single_select.html',
                    controller: function ($scope, $modalInstance, Goods, goods, VALID, STATUS) {
                        $scope.data = goods;
                        $scope.grid = {
                            page: 1
                        };
                        $scope.selectId = id;

                        var refresh = function (page) {
                            $log.info('refresh');
                            var SPEC = {page: page, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED};
                            if ($scope.grid.name) {
                                SPEC.q = $scope.grid.name;
                            }
                            var d = Goods.get(SPEC, function () {
                                $scope.data = d;
                            });
                        };

                        $scope.search = function () {
                            refresh($scope.grid.page);
                        };

                        $scope.$watch('grid.page', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                refresh(newVal);
                            }
                        });

                        $scope.toggleSelection = function (r) {
                            $scope.selectedId = r.id;
                            $modalInstance.close(r);
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    },
                    resolve: {
                        goods: function (Goods, VALID, STATUS) {
                            return Goods.get({page: 1, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED}).$promise;
                        }
                    }
                }).result;
            };
        }])
    .service('GoodsSelectService', ['$modal', '$log', 'CONFIG',
        function ($modal, $log, CONFIG) {
            /*
             * @ids, initial ids
             */
            this.open = function (ids) {
                var LIMIT = CONFIG.limit;
                return $modal.open({
                    templateUrl: 'partials/goods/goods_select.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance, Goods, goods, VALID, STATUS) {
                        $scope.data = goods;
                        $scope.grid = {
                            page: 1
                        };
                        $scope.ids = angular.copy(ids);
                        // console.log(ids);
                        // console.log($scope.ids);

                        var refresh = function (page) {
                            $log.info('refresh');
                            var SPEC = {page: page, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED};
                            if ($scope.grid.name) {
                                SPEC.q = $scope.grid.name;
                            }
                            var d = Goods.get(SPEC, function () {
                                $scope.data = d;
                            });
                        };

                        $scope.search = function () {
                            refresh($scope.grid.page);
                        };

                        $scope.$watch('grid.page', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                refresh(newVal);
                            }
                        });

                        $scope.toggleSelection = function (id) {
                            var idx = $scope.ids.indexOf(id);
                            if (idx > -1) {
                                $scope.ids.splice(idx, 1);
                            } else {
                                $scope.ids.push(id);
                            }
                            $log.debug("selected goods:", $scope.ids);
                        };

                        $scope.ok = function () {
                            $modalInstance.close($scope.ids);
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    },
                    resolve: {
                        goods: function (Goods, VALID, STATUS) {
                            return Goods.get({page: 1, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED}).$promise;
                        }
                    }
                }).result;
            };
        }])
    .service('ColumnSingleSelectService', ['$modal', '$log', 'CONFIG',
        function ($modal, $log, CONFIG) {
            /*
             * @ids, initial ids
             */
            this.open = function (ids, cancelWithClose) {
                var LIMIT = CONFIG.limit;
                return $modal.open({
                    templateUrl: 'partials/column/column_select.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance, Columns, column, VALID, STATUS) {
                        $scope.data = column;
                        $scope.grid = {
                            page: 1
                        };
                        $scope.ids = ids;

                        var refresh = function (page) {
                            $log.info('refresh');
                            var SPEC = {page: page, size: LIMIT, valid: VALID.TRUE, status: STATUS.PUBLISHED};
                            if ($scope.grid.name) {
                                SPEC.q = $scope.grid.name;
                            }
                            var d = Columns.get(SPEC, function () {
                                $scope.data = d;
                            });
                        };

                        $scope.search = function () {
                            refresh($scope.grid.page);
                        };

                        $scope.$watch('grid.page', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                refresh(newVal);
                            }
                        });

                        $scope.toggleSelection = function (r) {
                            $scope.ids = r.id;
                            $modalInstance.close(r);
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    },
                    resolve: {
                        column: function (Columns) {
                            return Columns.get({page: 1, size: 20,columnType:1 }).$promise;
                        }
                    }
                }).result;
            };
        }])
    .service('ResourceTextService', ['$modal', 'Alert',
        function ($modal, Alert) {
            this.open = function (txt, maxlength) {
                if(!maxlength) {
                    maxlength = 50;
                }
                console.log('maxlength:' + maxlength);
                return $modal.open({
                    templateUrl: 'partials/resource/resource_editor.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance) {
                        $scope.editor = {
                            txt: txt,
                            maxlength: maxlength
                        };
                        $scope.ok = function () {
                            var txt_tmp = $scope.editor.txt || '';
                            txt_tmp = txt_tmp.replace(/<[^>]*>/ig, '');
                            console.log(txt_tmp);
                            if (txt_tmp.length > maxlength) {
                                Alert.alert("内容不能超过" + maxlength + "字", true);
                            } else {
                                $modalInstance.close($scope.editor.txt);
                            }
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    }
                }).result;
            };
        }])
    .service('reviseTitleService', ['$modal', 'Alert',
        function ($modal, Alert) {
            this.open = function (txt, maxlength) {
                if(!maxlength) {
                    maxlength = 50;
                }
                console.log('maxlength:' + maxlength);
                return $modal.open({
                    templateUrl: 'partials/resource/title_editor.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance) {
                        $scope.editor = {
                            txt: txt
                        };
                        $scope.ok = function () {
                            var txt_tmp = $scope.editor.txt || '';
                            txt_tmp = txt_tmp.replace(/<[^>]*>/ig, '');
                                $modalInstance.close($scope.editor.txt);
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    }
                }).result;
            };
        }])
    .service('reviseUrlService', ['$modal', 'Alert',
        function ($modal, Alert) {
            this.open = function (url) {
                return $modal.open({
                    templateUrl: 'partials/openscreen/url_editor.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance) {
                        $scope.editor = {
                            url: url
                        };
                        $scope.ok = function () {
                            $modalInstance.close($scope.editor.url);
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    }
                }).result;
            };
        }])
    .service('reviseTimeService', ['$modal',
        function ($modal) {
            this.open = function (time) {
                return $modal.open({
                    templateUrl: 'partials/openscreen/time_editor.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance) {

                        $scope.time = {

                        };
                        var t =   new Date(new Date(new Date().toLocaleDateString()).getTime()+24*60*60*1000);
                        var e =   new Date(new Date(new Date().toLocaleDateString()).getTime()+24*60*60*1000*3-1);

                        $scope.startDate = fromTimestamp(t);
                        $scope.endDate = fromTimestamp(e);

                        function parseDate(date) {
                            return Date.UTC(date.date.getFullYear(), date.date.getMonth(), date.date.getDate(), date.time.getHours(), date.time.getMinutes()) +
                                date.date.getTimezoneOffset() * 60 * 1000;
                        }

                        function fromTimestamp(ts) {
                            var d = new Date(ts);
                            return {
                                date: d,
                                time: d,
                                minDate: new Date(),
                                opened: false
                            }
                        }
                        function newDate() {
                            return {
                                date: new Date(),
                                time: new Date(),
                                minDate: new Date(),
                                opened: false
                            }
                        }

                        // datepicker begin
                        $scope.hstep = 1;
                        $scope.mstep = 5;
                        $scope.dateFormat = "yyyy-MM-dd";

                        // $scope.startDate = newDate();
                        $scope.openStartDatePicker = function ($event) {
                            $event.preventDefault();
                            $event.stopPropagation();
                            $scope.startDate.opened = true;
                        };

                        // $scope.endDate = newDate();
                        $scope.openEndDatePicker = function ($event) {
                            $event.preventDefault();
                            $event.stopPropagation();
                            $scope.endDate.opened = true;
                        };

                        $scope.ok = function () {
                            $scope.time.st = parseDate($scope.startDate);
                            $scope.time.et = parseDate($scope.endDate);
                            $modalInstance.close($scope.time);
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        };
                    }
                }).result;
            };
        }])
    .service('ImageSelectService', ['$modal', '$log', 'Alert', 'Resource', 'FileUploader',
        function ($modal, $log, Alert, Resource, FileUploader) {
            this.open = function (minWidth, minHeight, aspectRatio) {
                if (minWidth === undefined) {
                    minWidth = 0;
                }
                if (minHeight === undefined) {
                    minHeight = 0;
                }
                if (aspectRatio === undefined) {
                    aspectRatio = 0;
                }
                return $modal.open({
                    templateUrl: 'partials/resource/image_upload.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance, token) {
                        $scope.uploadToken = token.token;
                        $scope.resource={};
                        $log.info("token:", $scope.uploadToken);

                        function checkImageDimention(file, callback) {
                            var reader = new FileReader();
                            //Read the contents of Image File.
                            reader.readAsDataURL(file);
                            reader.onload = function (e) {
                                //Initiate the JavaScript Image object.
                                var image = new Image();
                                //Set the Base64 string return from FileReader as source.
                                image.src = e.target.result;
                                image.onload = function () {
                                    //Determine the Height and Width.
                                    var height = this.height;
                                    var width = this.width;

                                    if (width < minWidth || height < minHeight) {
                                        Alert.alert('图片尺寸不符合要求');
                                        callback(false);
                                        return;
                                    }
                                    callback(true);
                                };
                            };
                        }
                        var uploader = $scope.uploader = new FileUploader({
                            //url: 'http://upload.qiniu.com',
                            url: 'http://uptx.qiniu.com',
                            alias: 'file',
                            queueLimit: 1,
                            removeAfterUpload: true,
                            formData: [
                                {"token": $scope.uploadToken}
                            ]
                        });

                        // FILTERS
                        uploader.filters.push({
                            name: 'customFilter',
                            fn: function () {
                                return this.queue.length < 1;
                            }
                        });

                        uploader.filters.push({
                            name: 'imageFilter',
                            fn: function (item) {
                                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                                return '|jpg|png|jpeg|gif|'.indexOf(type) !== -1;
                            }
                        });

                        // CALLBACKS
                        uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
                            console.info('onWhenAddingFileFailed', item, filter, options);
                        };
                        uploader.onAfterAddingFile = function (fileItem) {
                            console.info('onAfterAddingFile', fileItem);
                            $scope.fileName = fileItem.file.name;
                            checkImageDimention(fileItem._file, function (valid) {
                                if (!valid) {
                                    uploader.removeFromQueue(fileItem);
                                    return;
                                }
                                Resource.getId.get(function (res) {
                                    $log.info("resource id:", res.id);
                                    fileItem.formData.push({"key": res.id});
                                    fileItem.upload();
                                    $scope.uploading = true;
                                }, function (res) {
                                    $log.error("get resource id error:", res);
                                });
                            });
                        };
                        uploader.onAfterAddingAll = function (addedFileItems) {
                            console.info('onAfterAddingAll', addedFileItems);
                        };
                        uploader.onBeforeUploadItem = function (item) {
                            console.info('onBeforeUploadItem', item);
                        };
                        uploader.onSuccessItem = function (fileItem, response, status, headers) {
                            console.info('onSuccessItem', fileItem, response, status, headers);

                            var resource = {name: fileItem.file.name, tp: 0, key: response.key, hash: response.hash};
                            $log.info('create resource:', resource);
                            Resource.save(resource, function () {
                                $log.info("create resource successfully");
                                if (resource.key) {
                                    $log.info(resource);
                                    Resource.batch.get({}, {'ids': [resource.key]}, function (data) {
                                        if (data.data.length) {
                                            $scope.resource = data.data[0];
                                            onImageUploaded($scope.resource.url);
                                        }
                                    });
                                }
                                $scope.uploading = false;
                            }, function (res) {
                                $scope.uploading = false;
                                Alert.alert("操作失败：" + res.data, true);
                            });

                        };
                        uploader.onErrorItem = function (fileItem, response, status, headers) {
                            console.info('onErrorItem', fileItem, response, status, headers);
                        };
                        uploader.onCancelItem = function (fileItem, response, status, headers) {
                            console.info('onCancelItem', fileItem, response, status, headers);
                        };
                        uploader.onCompleteItem = function (fileItem, response, status, headers) {
                            console.info('onCompleteItem', fileItem, response, status, headers);
                        };
                        uploader.onCompleteAll = function () {
                            console.info('onCompleteAll');
                        };

                        $scope.ok = function () {
                            var result = angular.extend($scope.resource, $scope.cropResult);
                            if (result.w) {
                                result.x = parseInt(Math.round(result.x));
                                result.y = parseInt(Math.round(result.y));
                                result.w = parseInt(Math.round(result.w));
                                result.h = parseInt(Math.round(result.h));
                                result.url += '?imageMogr2/crop/!' + result.w + 'x' + result.h + 'a' + result.x + 'a' + result.y;
                            }
                            $log.log(result);
                            $modalInstance.close(result);
                        };

                        $scope.cancel = function() {
                            $modalInstance.close();
                        };

                        $scope.cropResult = {
                        };
                        function onImageUploaded(imgUrl) {
                            var $image = $('#selected-image');
                            // if (aspectRatio > 0) {
                            //     $image.cropper('destroy');
                            //     $image.bind('load', function (){
                            //         $image.cropper({
                            //             aspectRatio: aspectRatio,
                            //             zoomable: false,
                            //             crop: function (e) {
                            //                 $scope.cropResult.x = e.x;
                            //                 $scope.cropResult.y = e.y;
                            //                 $scope.cropResult.w = e.width;
                            //                 $scope.cropResult.h = e.height;
                            //             }
                            //         });
                            //     });
                            // }
                            $image.attr('src', imgUrl);
                        }

                        function onImageEdited(data) {
                            if (!data) {
                                $scope.meituShowing = false;
                                return;
                            }

                            data = angular.fromJson(data);
                            var resource = {tp: 0, key: data.key, hash: data.hash};
                            Resource.save(resource, function (r) {
                                $log.log(r);
                                $scope.meituShowing = false;
                                $scope.resource = r;
                                onImageUploaded($scope.resource.url);
                            }, function (res) {
                                $scope.meituShowing = false;
                                Alert.alert("操作失败：" + res.data, true);
                            });
                        }

                        $scope.meituShowing = false;
                        $scope.editImage = function () {
                            Resource.getId.get(function (res) {
                                var win = document.getElementById("meitu-frame").contentWindow;
                                $scope.meituShowing = true;
                                win.editPhoto($scope.resource.url, res.id, token.token, onImageEdited);
                            }, function (res) {
                                $log.error("get resource id error:", res);
                            });
                        };
                    },
                    resolve: {
                        token: function () {
                            return Resource.token.get().$promise;
                        }
                    }
                }).result;
            };
        }])
    .service('videoSelectService', ['$modal', '$log', 'Alert', 'Resource', 'FileUploader',
        function ($modal, $log, Alert, Resource, FileUploader) {
            this.open = function () {
                return $modal.open({
                    templateUrl: 'partials/resource/video_upload.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance, token) {
                        $scope.state = true;
                        $scope.uploadToken = token.token;
                        $log.info("token:", $scope.uploadToken);
                        $scope.resource={};

                        var uploader = $scope.uploader = new FileUploader({
                            //url: 'http://upload.qiniu.com',
                            url: 'http://uptx.qiniu.com',
                            alias: 'file',
                            formData: [
                                {"token": $scope.uploadToken}
                            ]
                        });
                        // FILTERS
                        uploader.filters.push({
                            name: 'videoFilter',
                            fn: function (item) {
                                $log.info("item:", item);
                                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                                if (type != '|mp4|' && type != '|mp3|') {
                                    Alert.alert('请确认上传视频格式为mp4', true);
                                    return false;
                                }
                                return '|mp4|'.indexOf(type) !== -1;
                            }
                        });
                        // CALLBACKS
                        uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
                            console.info('onWhenAddingFileFailed', item, filter, options);
                        };
                        uploader.onAfterAddingFile = function (fileItem) {
                            console.info('onAfterAddingFile', fileItem);
                            $scope.fileName = fileItem.file.name;
                            Resource.getId.get(function (res) {
                                $log.info("resource id:", res.id);
                                fileItem.formData.push({"key": res.id})
                            }, function (res) {
                                $log.error("get resource id error:", res);
                            });
                        };
                        uploader.onAfterAddingAll = function (addedFileItems) {
                            console.info('onAfterAddingAll', addedFileItems);
                        };
                        uploader.onBeforeUploadItem = function (item) {
                            console.info('onBeforeUploadItem', item);
                        };
                        uploader.onSuccessItem = function (fileItem, response, status, headers) {
                            console.info('onSuccessItem', fileItem, response, status, headers);

                            var type = fileItem.file.type.slice(fileItem.file.type.indexOf("/") + 1);
                            $log.info("file type:", type);
                            var tp = 1;
                            var resource = {name: fileItem.file.name, tp: tp, key: response.key, hash: response.hash};
                            $log.info('create resource:', resource);
                            Resource.save(resource, function () {
                                $log.info("create resource successfully")
                                if (resource.key) {
                                    $log.info(resource);
                                    Resource.batch.get({}, {'ids': [resource.key]}, function (data) {
                                        if (data.data.length) {
                                            $scope.resource = data.data[0];
                                        }
                                    });
                                }
                            }, function (res) {
                                Alert.alert("操作失败：" + res.data, true);
                            });
                            // $scope.resource = resource;

                        };
                        uploader.onErrorItem = function (fileItem, response, status, headers) {
                            console.info('onErrorItem', fileItem, response, status, headers);
                        };
                        uploader.onCancelItem = function (fileItem, response, status, headers) {
                            console.info('onCancelItem', fileItem, response, status, headers);
                        };
                        uploader.onCompleteItem = function (fileItem, response, status, headers) {
                            console.info('onCompleteItem', fileItem, response, status, headers);
                        };
                        uploader.onCompleteAll = function () {
                            console.info('onCompleteAll');
                        };

                        console.info('uploader', uploader);

                        $scope.close = function () {
                            if (!$scope.state){

                              $scope.resource = '<iframe frameborder="0" width="640" height="498" src="https://v.qq.com/iframe/player.html?vid=l0378ktbrzq&tiny=0&auto=0" allowfullscreen></iframe>';
                              // $scope.resource = $scope.Link;
                            }
                            $modalInstance.close($scope.resource);
                        };
                        $scope.cancel = function() {
                            $modalInstance.close();
                        };

                        //本地上传
                        $scope.local = function () {
                            $scope.state = true;
                        }
                        //第三方链接
                        $scope.link = function () {
                            $scope.state = false;
                        }
                    },
                    resolve: {
                        token: function () {
                            return Resource.token.get().$promise;
                        }
                    }
                }).result;
            };
        }])
    .service('audioSelectService', ['$modal', '$log', 'Alert', 'Resource', 'FileUploader',
        function ($modal, $log, Alert, Resource, FileUploader) {
            this.open = function () {
                return $modal.open({
                    templateUrl: 'partials/resource/audio_upload.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance, token) {
                        $scope.uploadToken = token.token;
                        $log.info("token:", $scope.uploadToken);
                        $scope.resource={};

                        var uploader = $scope.uploader = new FileUploader({
                            //url: 'http://upload.qiniu.com',
                            url: 'http://uptx.qiniu.com',
                            alias: 'file',
                            formData: [
                                {"token": $scope.uploadToken}
                            ]
                        });
                        // FILTERS
                        uploader.filters.push({
                            name: 'videoFilter',
                            fn: function (item) {
                                $log.info("item:", item);
                                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                                if (type != '|mp3|') {
                                    Alert.alert('请确认上传音频格式为mp3', true);
                                    return false;
                                }
                                return '|mp3|'.indexOf(type) !== -1;
                            }
                        });
                        // CALLBACKS
                        uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
                            console.info('onWhenAddingFileFailed', item, filter, options);
                        };
                        uploader.onAfterAddingFile = function (fileItem) {
                            console.info('onAfterAddingFile', fileItem);
                            $scope.fileName = fileItem.file.name;
                            Resource.getId.get(function (res) {
                                $log.info("resource id:", res.id);
                                fileItem.formData.push({"key": res.id})
                            }, function (res) {
                                $log.error("get resource id error:", res);
                            });
                        };
                        uploader.onAfterAddingAll = function (addedFileItems) {
                            console.info('onAfterAddingAll', addedFileItems);
                        };
                        uploader.onBeforeUploadItem = function (item) {
                            console.info('onBeforeUploadItem', item);
                        };
                        uploader.onSuccessItem = function (fileItem, response, status, headers) {
                            console.info('onSuccessItem', fileItem, response, status, headers);

                            var type = fileItem.file.type.slice(fileItem.file.type.indexOf("/") + 1);
                            $log.info("file type:", type);
                            var tp = 3;
                            var resource = {name: fileItem.file.name, tp: tp, key: response.key, hash: response.hash};
                            $log.info('create resource:', resource);
                            Resource.save(resource, function () {
                                $log.info("create resource successfully")
                                if (resource.key) {
                                    $log.info(resource);
                                    Resource.batch.get({}, {'ids': [resource.key]}, function (data) {
                                        if (data.data.length) {
                                            $scope.resource = data.data[0];
                                        }
                                    });
                                }
                            }, function (res) {
                                Alert.alert("操作失败：" + res.data, true);
                            });
                        };
                        uploader.onErrorItem = function (fileItem, response, status, headers) {
                            console.info('onErrorItem', fileItem, response, status, headers);
                        };
                        uploader.onCancelItem = function (fileItem, response, status, headers) {
                            console.info('onCancelItem', fileItem, response, status, headers);
                        };
                        uploader.onCompleteItem = function (fileItem, response, status, headers) {
                            console.info('onCompleteItem', fileItem, response, status, headers);
                        };
                        uploader.onCompleteAll = function () {
                            console.info('onCompleteAll');
                        };

                        console.info('uploader', uploader);

                        $scope.close = function () {
                            $modalInstance.close($scope.resource);
                            //todo refresh list
                        };
                        $scope.cancel = function() {
                            $modalInstance.close();
                        };
                        $scope.state = true;
                        //本地上传
                        $scope.local = function () {
                            $scope.state = true;
                        }
                        //第三方链接
                        $scope.link = function () {
                            $scope.state = false;
                        }
                    },
                    resolve: {
                        token: function () {
                            return Resource.token.get().$promise;
                        }
                    }
                }).result;
            };
        }])

    .service("SensitiveReplaceService", [function () {
        var service = {};

        function replaceSensitive(text, reg) {
            return text.replace(reg, function (m) {
                return '<span class="me">' + m + '</span>'
            });
        }

        service.replaceArticle = function(o) {
            var word = o.sensitive.join('|');
            var reg = new RegExp(word, "ig");
            if (word) {
                o.desc = replaceSensitive(o.desc, reg);
                angular.forEach(o.resource, function (res) {
                    if (res.txt) {
                        res.txt = replaceSensitive(res.txt, reg);
                    }
                });
            }
        };

        service.replaceActivity = function(o) {
            var word = o.sensitive.join('|');
            var reg = new RegExp(word, "ig");
            if (word) {
                o.text = replaceSensitive(o.text, reg);
                angular.forEach(o.resource, function (res) {
                    if (res.txt) {
                        res.txt = replaceSensitive(res.txt, reg);
                    }
                });
            }
        };

        return service;
    }])
    .service('AuthService',['$http','API', function ($http,API) {
        var API = API.url;
        this.login = function (credentials) {
            return $http.post(API+'/portal/pub/login', credentials);
        };
        this.logout = function () {
            return $http.post(API+'/portal/pub/logout', {});
        };
    }])
    .service('ResourceChecker', ['$log', 'Alert', function($log, Alert){
        this.check = function (resources) {
            var lastSubTitleIndex = -1;
            for (var i = 0; i < resources.length; ++i) {
                var res = resources[i];
                //$log.log(res);
                if (res.tp != 2)
                    continue;
                if (!res.txt.startsWith('<h1>') || !res.txt.endsWith('</h1>'))
                    continue;

                var text = res.txt.substring(4, res.txt.length - 5);
                if (lastSubTitleIndex >= 0 &&  lastSubTitleIndex + 1 == i) {
                    Alert.alert('连续的子标题:' + text);
                    return false;
                }

                if (text.length > 17) {
                    Alert.alert('子标题: "' + text + '"超过了17字,请删减后重试!')
                    return false;
                }
                lastSubTitleIndex = i;
            }
            return true;
        }
    }])
    .service('ResourceTranslator', ['$location', '$log', function ($location, $log) {

        function getMediaUrl(tp, id) {
            var absUrl = $location.absUrl();
            var url  = $location.url();

            return absUrl.substr(0, absUrl.length - url.length) + '/media/' + tp + '/' + id;
        }

        this.toHtml = function (resources) {
            if (!resources || !resources.length) {
                return '';
            }
            var html = '';

            angular.forEach(resources, function (r){
                switch(r.tp) {
                   case 0:
                       html += '<p><iframe class="ta-app-media ta-insert-image" src="' + getMediaUrl(0, r.id) + '" width="100%" height="300px" frameborder="0"></iframe></p>';
                       break;
                   case 1:
                       html += '<p><iframe class="ta-app-media ta-insert-video" src="' + getMediaUrl(1, r.id) + '" width="100%" height="300px" frameborder="0"></iframe></p>';
                       break;
                   case 2:
                       if(!r.txt.match(/^<p>/i) && !r.txt.match(/^<h1>/i)) {
                           if (r.txt) {
                               html += '<p>' + r.txt + '</p>';
                           }
                       } else if (r.txt) {
                           html += r.txt;
                       }
                       break;
                   case 3:
                       html += '<p><iframe class="ta-app-media ta-insert-audio" src="' + getMediaUrl(3, r.id) + '" width="100%" height="100px" frameborder="0"></iframe></p>';
                       break;
                    case 4:
                        html += '<p><iframe class="ta-app-media ta-insert-goods" src="' + getMediaUrl(4, r.gid) + '" width="100%" height="60px" frameborder="0"></iframe></p>';
                        break;
                    case 8:
                        html += '<p><iframe class="ta-app-media ta-insert-live" src="' + getMediaUrl(8, r.gid) + '" width="100%" height="60px" frameborder="0"></iframe></p>';
                        break;
                    case 6:
                        html += '<p><iframe class="ta-app-media ta-insert-article" src="' + getMediaUrl(6, r.gid) + '" width="100%" height="60px" frameborder="0"></iframe></p>';
                        break;
                    case 7:
                        html += '<p><iframe class="ta-app-media ta-insert-activity" src="' + getMediaUrl(7, r.gid) + '" width="100%" height="60px" frameborder="0"></iframe></p>';
                        break;
                    case 10:
                        html+='<p style="text-align: center">'+r.txt+'</p>';
                        break;
                    case 11:
                        html+='<p style="text-align: left">'+r.txt+'</p>';
                        break;
                    case 12:
                        html+='<p style="text-align: right">'+r.txt+'</p>';
                        break;
                    case 13:
                        html+='<ol>'+r.txt+'</ol>';
                        break;
                    case 14:
                        html+='<ul>'+r.txt+'</ul>';
                        break;
                }

                if (r.tp != 2 && r.desc) {
                    html += '<h6>' + r.desc + '</h6>';
                }
            });
            $log.log("HTML=="+html);
            return formatHtml(html);
        };
        this.fromHtml = function (editorId) {
            var resources = [];
            $(editorId + ' .ta-scroll-window > .ta-bind').children().each(function (index){
                var $this = $(this);
                if (!$this.html())
                    return;
                $log.log($this.html());
                var iframe = $('iframe', this);
                if (iframe.length > 0) {
                    if (iframe[0].className==''){
                        resources.push({tp: 2, txt: this.innerHTML});
                    }else{
                        var id = iframe[0].contentWindow.document.getElementById('resource-id').value;
                        var type = parseInt(iframe[0].contentWindow.document.getElementById('resource-type').value);
                        var gid = iframe[0].contentWindow.document.getElementById('resource-gid').value;
                        resources.push({tp: type, id: id, gid:gid});
                    }
                } else {
                    var tagName = this.tagName.toLowerCase();
                    if (tagName === 'h6' && resources.length > 0 && resources[resources.length - 1].tp != 2 && $this.html()) {
                        resources[resources.length - 1].desc = $this.html();
                    } else if (tagName == 'h1') {
                        resources.push({tp: 2, txt: '<h1>' + $this.html() + '</h1>'});
                    } else if (tagName == 'h5') {
                        resources.push({tp: 2, txt: '<h5>' + $this.html() + '</h5>'});
                    } else if (tagName == 'ol'){
                        // for (var i=0; i< this.childNodes.length;i++){
                        //     resources.push({tp: 8, txt: this.childNodes[i].innerText});
                            resources.push({tp: 13, txt: $this.html()});
                        // }
                    }else if (tagName == 'ul'){
                        // for (var i=0; i< this.childNodes.length;i++){
                        //     resources.push({tp: 9, txt: this.childNodes[i].innerText});
                        // }
                        resources.push({tp: 14, txt: $this.html()});

                    // }else if (tagName == 'a'){
                    //     resources.push({tp: 10, txt: this.outerHTML});
                    // }else if (tagName=='b'){
                    //     resources.push({tp: 11, txt: '<b>' + $this.html() + '</b>'});
                   }else {
                        var txt = $this.html();
                        if (txt != '<br>') {
                            if(this.style.cssText =="text-align: center;") {
                                resources.push({tp: 10, txt: txt});
                           }else if(this.style.cssText =="text-align: left;"){
                                resources.push({tp: 11, txt: txt});
                            }else if (this.style.cssText =="text-align: right;"){
                                resources.push({tp: 12, txt: txt});
                            // }
                                // else if (txt.match(/^<b>/i)){
                            //     resources.push({tp: 11, txt: txt});
                            // }else if (txt.match(/^<a(.*?)href="(.*?)"(.*?)>(.*?)<\/a>/i)){
                            //     resources.push({tp: 10, txt: txt});
                             }else{
                                resources.push({tp: 2, txt: txt});
                            }
                        }
                    }
                }
            });
            return resources;
        };

        function makeMap(str) {
            var obj = {}, items = str.split(','), i;
            for (i = 0; i < items.length; i++) obj[items[i]] = true;
            return obj;
        }

        var optionalEndTagBlockElements = makeMap(""),
            optionalEndTagInlineElements = makeMap("rp,rt"),
            optionalEndTagElements = angular.extend({},
                optionalEndTagInlineElements,
                optionalEndTagBlockElements);

        var blockElements = makeMap("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr,address,article," +
            "aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5," +
            "h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul,iframe,b,a");

        function appendParagraph(paragraphs, text, tagName,style) {
            if (tagName == 'p') {
                if (style=="text-align: center;"){
                    paragraphs.push('<p style="text-align: center">' + text + '</p>');
                }else if (style=="text-align: left;"){
                    paragraphs.push('<p style="text-align: left">' + text + '</p>');
                }else if (style=="text-align: right;"){
                    paragraphs.push('<p style="text-align: right">' + text + '</p>');
                }else{
                    var lines = text.replace(/\r\n/ig, '\n').replace(/\r/ig, '\n').split('\n');
                    angular.forEach(lines, function (line){
                        paragraphs.push('<p>' + line + '</p>');
                    });
                }
            } else {
                // if (text.match(/^<a(.*?)href="(.*?)"(.*?)>(.*?)<\/a>/i)){
                //     text = text;
                // }else{
                    text = text.replace(/(\r|\n)/ig, '');
                // }
                if (tagName == 'h6') {
                    paragraphs.push('<h6>' + text + '</h6>');
                } else if (tagName == 'h1') {
                    paragraphs.push('<h1>' + text + '</h1>');
                } else if (tagName == 'h5') {
                    paragraphs.push('<h5>' + text + '</h5>');
                // }else if (tagName =='b'){
                //     paragraphs.push('<b>' + text + '</b>');
                // }else if (tagName=='a'){
                //     paragraphs.push(text);
                 }else if (tagName =='ol'){
                    paragraphs.push('<ol>' + text + '</ol>');
                 }else if (tagName =='ul'){
                    paragraphs.push('<ul>' + text + '</ul>');
                }
            }
        }

        function doFormat(paragraphs, $root) {
            var paragraphSegments = [];
            $root.contents().each(function () {
                $log.log('html:' + this.innerHTML);
                var tagName = this.tagName;
                if (typeof(this.style) != "undefined"){
                    var style = this.style.cssText;
                }
                // var style = this.style.cssText;
                // var a = this.outerHTML;
                var $this = $(this);

                if (!tagName) {
                    paragraphSegments.push($this.text());
                } else {
                    tagName = tagName.toLowerCase();
                    if (blockElements[tagName]) {
                        var paragraph = paragraphSegments.join('');
                        if (paragraph) {
                            appendParagraph(paragraphs, paragraph, 'p');
                        }
                        paragraphSegments = [];

                        if (tagName == 'h6') {
                            appendParagraph(paragraphs, $this.text(), tagName);
                        } else if (tagName == 'h1' || tagName == 'h5') {
                            appendParagraph(paragraphs, $this.text(), tagName);
                        } else if (tagName == 'iframe') {
                            var className = this.className;
                            if (className.indexOf('ta-app-media') != -1) {
                                paragraphs.push('<p>' + this.outerHTML + '</p>')
                            }else{
                                paragraphs.push('<p>' + this.outerHTML + '</p>')
                            }
                        } else {
                            var txt = $this.html();
                            if (style =="text-align: center;"){
                                if (txt.match(/^<b>/i) || txt.match(/^<a(.*?)href="(.*?)"(.*?)>(.*?)<\/a>/i) || txt.match(/^<span>/i) || txt.match(/^<font>/i)){
                                    appendParagraph(paragraphs, this.innerHTML, tagName,style);
                                }else{
                                    appendParagraph(paragraphs, $this.text(), tagName,style);
                                }
                            }else if (style =="text-align: left;"){
                                if (txt.match(/^<b>/i) || txt.match(/^<a(.*?)href="(.*?)"(.*?)>(.*?)<\/a>/i) || txt.match(/^<span>/i) || txt.match(/^<font>/i)){
                                    appendParagraph(paragraphs, this.innerHTML, tagName,style);
                                }else{
                                    appendParagraph(paragraphs, $this.text(), tagName,style);
                                }
                            }else if (style =="text-align: right;"){
                                if (txt.match(/^<b>/i) || txt.match(/^<a(.*?)href="(.*?)"(.*?)>(.*?)<\/a>/i) || txt.match(/^<span>/i) || txt.match(/^<font>/i)){
                                    appendParagraph(paragraphs, this.innerHTML, tagName,style);
                                }else{
                                    appendParagraph(paragraphs, $this.text(), tagName,style);
                                }
                            }else if (txt.indexOf("iframe") > 0 ) {
                                doFormat(paragraphs, $this);
                            }else{
                                appendParagraph(paragraphs, this.innerHTML, tagName);

                                // doFormat(paragraphs, $this);
                            }

                        }
                    } else {
                        paragraphSegments.push($this.text());
                    }
                }
            });
            if (paragraphSegments.length > 0) {
                var paragraph = paragraphSegments.join('');
                if (paragraph) {
                    appendParagraph(paragraphs, paragraph, 'p');
                }
            }
        }

        function formatHtml(html) {
            var result = [];
            html = '<div>' + html + '</div>'; // To avoid jquery complaint
            var root = $(html);

            doFormat(result, root);
            return result.join('');
        }

        this.stripFormat = function ($html) {
            var result = formatHtml($html);
            //$log.log('result:' + result);
            return result;
        };
    }])
    .service('DateFormatter', [function (){
        var service = {};

        function formatDate(d) {
            return (d.getMonth() + 1) + '月' + d.getDate() + '日';
        }

        function formatNumber(n) {
            if (n < 10) {
                return '0' + n;
            } else {
                return '' + n;
            }
        }

        service.formatActivityDate = function (ts) {
            var date = new Date(ts);
            return formatDate(date) + ' ' + formatNumber(date.getHours()) + ':' + formatNumber(date.getMinutes());
        };

        service.formatCommentDate = function (ts) {
            return formatDate(new Date(ts));
        };

        service.formatLiveDate = function (ts) {
            var date = new Date(ts);
            var weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            return formatNumber(date.getMonth() + 1) + '-' + formatNumber(date.getDate()) + ' ' + formatNumber(date.getHours()) + ':' + formatNumber(date.getMinutes()) + ' ' + weekdays[date.getDay()];
        };

        return service;
    }]).factory('locals',['$window',function($window){
      return{        //存储单个属性
        set :function(key,value){
            $window.localStorage[key]=value;
        },        //读取单个属性
        get:function(key,defaultValue){
            return  $window.localStorage[key] || defaultValue;
        },        //存储对象，以JSON格式存储
        setObject:function(key,value){
            $window.localStorage[key]=JSON.stringify(value);
        },        //读取对象
        getObject: function (key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }

     }
    }])
    .factory('Article', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Article = $resource(API+'/portal/article/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Article.batch = $resource(API+'/portal/article/batch', {}, {
            'get': {method: 'POST'}
        });
        Article.publish = $resource(API+'/portal/article/:id/publish', {id: '@id'}, {
            'commit': {method: 'POST'}
        });
        Article.cmt = $resource(API+'/portal/article/:id/comment', {id: '@id'});
        Article.recommendComment = $resource(API+'/portal/article/:id/comment/recommend/add', {id: '@id'}, {
            'get': {method: 'POST'}
        });
        Article.removeRecommendComment = $resource(API+'/portal/article/:id/comment/recommend/remove', {id: '@id'}, {
            'get': {method: 'POST'}
        });
        Article.recommend = $resource(API+'/portal/article/:id/recommend', {id: '@id'}, {
            'get': {method: 'POST'}
        });
        Article.cancelRecommend = $resource(API+'/portal/article/:id/recommend/cancel', {id: '@id'}, {
            'get': {method: 'POST'}
        });
        Article.recover = $resource(API+'/portal/article/:id/recover', {id: '@id'}, {
            'commit': {method: 'POST'}
        });
        Article.check = $resource(API+'/portal/article/:id/check', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Article.audit = $resource(API+'/portal/article/:id/audit', {id: '@id'}, {
            'commit': {method: 'POST'}
        });

        return Article;
    }])

    .factory('Brandclass', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Brandclass = $resource(API+'/portal/brandclass/:id',{id:'@id'}, {
            'update': {method: 'POST'}
        });
        return Brandclass;
    }])

    .factory('Category', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Category = $resource(API+'/portal/category/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });

        Category.all = $resource(API+'/portal/category/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        return Category;
    }])
    .factory('Columns', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Columns = $resource(API+'/portal/columns/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        return Columns;
    }])
    .factory('Column', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Column = $resource(API+'/portal/column/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
          Column.editor = $resource(API+'/portal/column/:id', {id: '@id'}, {
            'update': {method: 'PUT'}
        });

        Column.articles = $resource(API+'/portal/column/:id/articles', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        return Column;
    }])
    .factory('Topic', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Topic = $resource(API+'/portal/topic/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Topic.batch = $resource(API+'/portal/topic/batch', {}, {
            'get': {method: 'POST'}
        });
        Topic.publish = $resource(API+'/portal/topic/:id/publish', {id: '@id'}, {
            'commit': {method: 'POST'}
        });
        Topic.recover = $resource(API+'/portal/topic/:id/recover', {id: '@id'}, {
            'commit': {method: 'POST'}
        });
        return Topic;
    }])
    .factory('Banner', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Banner = $resource(API+'/portal/banner/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        return Banner;
    }])
    .factory('Openscreen', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Openscreen = $resource(API+'/portal/advert/common/:id',{id:'@id'},{
            'update': {method: 'POST'}
        });
         Openscreen.editor = $resource(API+'/portal/advert/common/:id', {id: '@id'}, {
            'update': {method: 'PUT'}
         });
        return Openscreen;
    }])
    .factory('Recommends', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Recommends = $resource(API+'/portal/recommends/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        return Recommends;
    }])
    .factory('Recommend', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Recommend = $resource(API+'/portal/recommend/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Recommend.batch = $resource(API+'/portal/recommend/batch', {}, {
            'query': {method:'POST',isArray:true}
        });
        return Recommend;
    }])
    .factory('Activity', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Activity = $resource(API+'/portal/activity/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Activity.batch = $resource(API+'/portal/activity/batch', {}, {
            'get': {method: 'POST'}
        });
        Activity.publish = $resource(API+'/portal/activity/:id/publish', {id: '@id'}, {
            'commit': {method: 'POST'}
        });
        Activity.cmt = $resource(API+'/portal/activity/:id/comment', {id: '@id'});
        Activity.recover = $resource(API+'/portal/activity/:id/recover', {id: '@id'}, {
            'commit': {method: 'POST'}
        });
        Activity.check = $resource(API+'/portal/activity/:id/check', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Activity.audit = $resource(API+'/portal/activity/:id/audit', {id: '@id'}, {
            'commit': {method: 'POST'}
        });
        Activity.recommend = $resource(API+'/portal/activity/recommend', {}, {
            'update': {method: 'POST'}
        });
        Activity.recommendAdd = $resource(API+'/portal/activity/recommend/add', {}, {
            'get': {method: 'POST'}
        });
        Activity.recommendRemove = $resource(API+'/portal/activity/recommend/remove', {}, {
            'get': {method: 'POST'}
        });
        Activity.recommendComment = $resource(API+'/portal/activity/:id/comment/recommend/add', {id: '@id'}, {
            'get': {method: 'POST'}
        });
        Activity.removeRecommendComment = $resource(API+'/portal/activity/:id/comment/recommend/remove', {id: '@id'}, {
            'get': {method: 'POST'}
        });
        Activity.hint = $resource(API+'/portal/activity/hint', {}, {
            'update': {method: 'POST'}
        });
        Activity.vcode = $resource(API+'/portal/vcode', {}, {
            'update': {method: 'POST'}
        });
        Activity.bill = $resource(API+'/portal/activity/bill', {}, {
            'update': {method: 'POST'}
        });
        Activity.updateBill = $resource(API+'/portal/activity/bill/:id/update/status', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Activity.today = $resource(API+'/portal/activity/today', {}, {});
        Activity.coming = $resource(API+'/portal/activity/coming', {}, {});
        Activity.old = $resource(API+'/portal/activity/old', {}, {});
        return Activity;
    }])
    .factory('ActCategory', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var ActCategory = $resource(API+'/portal/activity/category/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });

        ActCategory.all = $resource(API+'/portal/activity/category/list/all', {}, {
            'update': {method: 'POST'}
        });
        return ActCategory;
    }])
    .factory('Goods', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Goods = $resource(API+'/portal/goods/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Goods.batch = $resource(API+'/portal/goods/batch', {}, {
            'get': {method: 'POST'}
        });
        Goods.publish = $resource(API+'/portal/goods/:id/publish', {id: '@id'}, {
            'commit': {method: 'POST'}
        });
        Goods.recover = $resource(API+'/portal/goods/:id/recover', {id: '@id'}, {
            'commit': {method: 'POST'}
        });
        Goods.hint = $resource(API+'/portal/goods/hint', {}, {
            'update': {method: 'POST'}
        });

        return Goods;
    }])
    .factory('Order', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Order = $resource(API+'/portal/order/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Order.deliver = $resource(API+'/portal/order/:id/deliver', {id: '@id'}, {
            'commit': {method: 'POST'}
        });
        Order.status = $resource(API+'/portal/order/:id/status', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        return Order;
    }])
    .factory('Application', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Service = $resource(API+'/portal/application/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Service.audit = $resource(API+'/portal/application/:id/audit', {id: '@id'}, {
            'commit': {method: 'POST'}
        });
        return Service;
    }])
    .factory('Feedback', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var feedback = $resource(API+'/portal/feedback/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        return feedback;
    }])
    .factory('Keyword', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Keyword = $resource(API+'/portal/keyword/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Keyword.batch = $resource(API+'/portal/keyword/batch', {}, {
            'get': {method: 'POST'}
        });
        return Keyword;
    }])
    .factory('Sensitive', ['$resource','API', function ($resource,API) {
        var API = API.url;
        return $resource(API+'/portal/sensitiveWord/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
    }])
    .factory('Resource', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Resource = $resource(API+'/portal/resource/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Resource.batch = $resource(API+'/portal/resource/batch', {}, {
            'get': {method: 'POST'}
        });
        Resource.getId = $resource(API+'/portal/resource/getId');
        Resource.token = $resource(API+'/portal/qiniu/token');
        return Resource;
    }])
    .factory('Company', ['$resource','API', function ($resource,API) {
        var API = API.url;
        return $resource(API+'/portal/company', {}, {
            'update': {method: 'POST'}
        });
    }])
    .factory('Msg', ['$resource','API', function ($resource,API) {
        var API = API.url;
        return $resource(API+'/portal/msg/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
    }])
    .factory('Message', ['$resource','API', function ($resource,API) {
        var API = API.url;
        return $resource(API+'/portal/message/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
    }])
    .factory('ArticleComment', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Cmt = $resource(API+'/portal/article/comment/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Cmt.sensitive = $resource(API+'/portal/article/comment/sensitive');
        Cmt.audit = $resource(API+'/portal/article/comment/:id/audit', {id: '@id'}, {
            'commit': {method: 'POST'}
        });
        return Cmt;
    }])
    .factory('ActivityComment', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Cmt = $resource(API+'/portal/activity/comment/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Cmt.sensitive = $resource(API+'/portal/activity/comment/sensitive');
        Cmt.audit = $resource(API+'/portal/activity/comment/:id/audit', {id: '@id'}, {
            'commit': {method: 'POST'}
        });

        return Cmt;
    }])
    .factory('About', ['$resource','API', function ($resource,API) {
        var API = API.url;
        return $resource(API+'/portal/setting/about', {}, {
            'update': {method: 'POST'}
        });
    }])
    .factory('Level', ['$resource','API', function ($resource,API) {
        var API = API.url;
        return $resource(API+'/portal/level/:id', {id: '@id'}, {
            'get': {method: 'GET', isArray: true},
            'update': {method: 'POST'}
        });
    }])
    .factory('Point', ['$resource','API', function ($resource,API) {
        var API = API.url;
        return $resource(API+'/portal/point/:id', {id: '@id'}, {
            'get': {method: 'GET', isArray: true},
            'update': {method: 'POST'}
        });
    }])
    .factory('Friends', ['$resource','API', function ($resource,API) {
        var API = API.url;
        return $resource(API+'/portal/setting/invitation', {}, {
            'update': {method: 'POST'}
        });
    }])
    .factory('Ad', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Ad = $resource(API+'/portal/ad', {}, {
            'update': {method: 'POST'}
        });
        Ad.search = $resource(API+'/portal/ad/search', {}, {
            'update': {method: 'POST'}
        });
        Ad.batch = $resource(API+'/portal/ad/batch', {}, {
            'get': {method: 'POST'}
        });

        return Ad;
    }])
    .factory('User', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var User = $resource(API+'/portal/user/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        User.select = $resource(API+'/portal/user/select');

        User.batch = $resource(API+'/portal/user/batch', {}, {
            'get': {method: 'POST'}
        });
        User.config = $resource(API+'/portal/user/:id/:config', {id: '@id', config: '@config'}, {
            'set': {method: 'POST'}
        });
        User.me = $resource(API+'/portal/me', {}, {
            'update': {method: 'POST'}
        });
        User.me.passwd = $resource(API+'/portal/me/passwd', {}, {
            'update': {method: 'POST'}
        });
        User.recover = $resource(API+'/portal/user/:id/recover', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        User.upgrade = $resource(API+'/portal/user/:id/upgrade', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        return User;
    }])
    .factory('SystemAdmin', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var SystemAdmin = $resource(API+'/portal/admin/system/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        SystemAdmin.recover = $resource(API+'/portal/admin/system/:id/recover', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        return SystemAdmin;
    }])
    .factory('Editor', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Editor = $resource(API+'/portal/editor/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Editor.recover = $resource(API+'/portal/editor/:id/recover', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        return Editor;
    }])
    .factory('Author', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Author = $resource(API+'/portal/author/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Author.recover = $resource(API+'/portal/author/:id/recover', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Author.downgrade = $resource(API+'/portal/author/:id/downgrade', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Author.desc = $resource(API+'/portal/author/:id/desc', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Author.recommend = $resource(API+'/portal/author/recommend', {}, {
            'update': {method: 'POST'}
        });
        Author.recommendAdd = $resource(API+'/portal/author/recommend/add', {}, {
            'get': {method: 'POST'}
        });
        Author.recommendRemove = $resource(API+'/portal/author/recommend/remove', {}, {
            'get': {method: 'POST'}
        });

        return Author;
    }])
    .factory('Badge', ['$resource','API', function ($resource,API) {
        var API = API.url;
        return $resource(API+'/portal/badge');
    }])
    .factory('FinanceStat', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var FianceStat = $resource(API+'/portal/finance_stat/:id', {id: '@id'}, {

        });
        return FianceStat;
    }])
    .factory('Live', ['$resource','API', function ($resource,API) {
        var API = API.url;
        var Live = $resource(API+'/portal/live/:id', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        Live.batch = $resource(API+'/portal/live/batch', {}, {
            'get': {method: 'POST'}
        });
        Live.publish = $resource(API+'/portal/live/:id/publish', {id: '@id'}, {
            'commit': {method: 'POST'}
        });
        Live.recover = $resource(API+'/portal/live/:id/recover', {id: '@id'}, {
            'commit': {method: 'POST'}
        });
        Live.audit = $resource(API+'/portal/live/:id/audit', {id: '@id'}, {
            'commit': {method: 'POST'}
        });
        Live.updateBill = $resource(API+'/portal/live/:id/bill/status', {id: '@id'}, {
            'update': {method: 'POST'}
        });
        return Live;
    }]);
