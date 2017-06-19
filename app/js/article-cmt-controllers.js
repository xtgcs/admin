'use strict';

/* Controllers */

angular.module('myApp.articlecmtcontrollers', ['ui.bootstrap'])
    .controller('ArticleCommentCtrl', ['$scope', '$stateParams', '$modal', '$log', 'Alert', 'ConfirmService', 'SensitiveReplaceService', 'CONFIG', 'data', 'ArticleComment', 'Article',
        function ($scope, $stateParams, $modal, $log, Alert, ConfirmService, SensitiveReplaceService, CONFIG, data, ArticleComment, Article) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };
            var refresh = function (page) {
                $log.info('refresh');
                var SPEC = {page: page, size: CONFIG.limit};
                if ($scope.grid.txt) {
                    SPEC.q = $scope.grid.txt;
                }

                var d = ArticleComment.get(SPEC, function () {
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

            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("del cmt:", o);
                ConfirmService.confirm('确定要删除此评论吗?').then(function () {
                    ArticleComment.remove({id: o.id}, function (res) {
                        console.log(res);
                        var tmpStr = '';
                        for (var k in res) {
                            if (k.match(/^\d+$/)) {
                                tmpStr += res[k];
                            }
                        }
                        console.log(tmpStr);
                        if (tmpStr == 'delete cmt successfully') {
                            $scope.data.data.splice(idx, 1);
                            $scope.data.total--;
                            $scope.data.size--;
                            Alert.alert("操作成功");
                        } else {
                            Alert.alert("操作失败：" + tmpStr, true);
                        }
                    }, function (res) {
                        console.log(res);
                        var tmpStr = '';
                        for (var k in res) {
                            if (k.match(/^\d+$/)) {
                                tmpStr += res[k];
                            }
                        }
                        Alert.alert("操作失败：" + tmpStr, true);
                    });
                });
            };

            $scope.view = function (idx) {
                var o = $scope.data.data[idx];
                $log.info('=====', o);
                $modal.open({
                    templateUrl: 'partials/article/article_view.html',
                    controller: function ($scope, $modalInstance, article) {
                        $scope.article = article;

                        $scope.wordsd = article.sensitive.join('|');
                        SensitiveReplaceService.replaceArticle(article);

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        article: function () {
                            return Article.get({id: o.article.id}).$promise;
                        }
                    }
                });
            };
        }])
    .controller('SensitiveArticleCommentCtrl', ['$scope', '$stateParams', '$modal', '$log', 'Alert', 'ConfirmService', 'SensitiveReplaceService', 'CONFIG', 'data', 'ArticleComment', 'Article',
        function ($scope, $stateParams, $modal, $log, Alert, ConfirmService, SensitiveReplaceService, CONFIG, data, ArticleComment, Article) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };
            var refresh = function (page) {
                $log.info('refresh');
                var SPEC = {page: page, size: CONFIG.limit};
                if ($scope.grid.txt) {
                    SPEC.q = $scope.grid.txt;
                }

                if ($scope.grid.tp) {
                    SPEC.tp = $scope.grid.tp;
                }

                var d = ArticleComment.sensitive.get(SPEC, function () {
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

            $scope.view = function (idx) {
                var o = $scope.data.data[idx];
                $modal.open({
                    templateUrl: 'partials/article/article_view.html',
                    controller: function ($scope, $modalInstance, article) {
                        $scope.article = article;

                        $scope.wordsd = article.sensitive.join('|');
                        SensitiveReplaceService.replaceArticle(article);


                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        article: function () {
                            return Article.get({id: o.article.id}).$promise;
                        }
                    }
                });
            };

            $scope.audit = function (idx) {
                var _data = $scope.data;
                var o = $scope.data.data[idx];
                $log.info("audit cmt:", o);
                $modal.open({
                    templateUrl: 'partials/comment/article_comment_audit.html',
                    controller: function ($scope, $modalInstance, cmt, page) {
                        $scope.cmt = cmt;
                        $scope.cmt.status = "0";

                        $scope.audit = function () {
                            ConfirmService.confirm('确定要删除此评论吗?').then(function () {
                                ArticleComment.remove({id: o.id}, function (res) {
                                    Alert.alert('操作成功');
                                    refresh(page);
                                    $modalInstance.close();
                                }, function (res) {
                                    Alert.alert('操作失败:' + res, true);
                                });
                            });
                        };

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        cmt: function () {
                            return ArticleComment.get({id: o.id}).$promise;
                        },
                        page: function () {
                            return $scope.grid.page;
                        }
                    }
                });
            };
        }]);
