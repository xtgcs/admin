'use strict';

/* Controllers */

angular.module('myApp.columncontrollers', ['ui.bootstrap'])
    .controller('ColumnCtrl', ['$scope', '$modal', '$log', 'me', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'Article', 'data', 'ResourceChecker', 'ResourceTranslator', 'ImageSelectService', 'ResourceSelectService', 'ResourceTextService', 'ResourceSingleSelectService','ArticleSelectService', "ActivitySelectService", "GoodsSelectService", "UserSingleSelectService", "SensitiveReplaceService", 'Resource', 'Activity', 'Goods', 'User', '$rootScope', 'FileUploader', 'token', 'category', 'Columns','Column','VALID',
        function ($scope, $modal, $log, me, $state, Alert, ConfirmService, CONFIG, Article, data, ResourceChecker, ResourceTranslator, ImageSelectService, ResourceSelectService, ResourceTextService, ResourceSingleSelectService,ArticleSelectService, ActivitySelectService, GoodsSelectService, UserSingleSelectService, SensitiveReplaceService, Resource, Activity, Goods, User, $rootScope, FileUploader, token, category,Columns, Column,VALID) {
            //文章列表数据
            $scope.data = data;
            //文章类型
            $scope.category = category.data;
            $scope.grid = {
                page: 1
            };

            $scope.articlelist = {
                show: true
            };
            // 是否为付费
            $scope.free = false;
            $scope.selectFree = function () {
                if (!$scope.free){
                    $scope.free = true;
                    $scope.article.type = 1;
                    $scope.article.price =$scope.price;
                }else{
                    $scope.free = false;
                    $scope.article.type = 0;
                    $scope.article.price =0;

                }
            }

            $rootScope.isEditingArticle = false;

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.TRUE};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
                if ($scope.grid.recommended) {
                    SPEC.recommended = $scope.grid.recommended;
                }
                if ($scope.grid.type) {
                    SPEC.type = $scope.grid.type;
                }
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Article.get(SPEC, function () {
                    console.log(d);
                    $scope.data = d;
                });
            };
            //搜索文章列表中的文章
            $scope.search = function () {
                refresh($scope.grid.page);
            };

            $scope.$watch('grid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refresh(newVal);
                }
            });

            $scope.resources = [];
            $scope.resourceIds = [];
            $scope.previewImg = [];

            var clearData = function () {
                $log.info("clear data");
                $scope.resources = [];
                $scope.resourceIds = [];
                $scope.previewImg = [];
                $scope.article = {'resources': [], 'type': 0};
            };

            $scope.clearData = function () {
                $rootScope.isEditingArticle = false;
                clearData();
            };

            $scope.insertTextarea = function () {
                ResourceTextService.open('', 2000).then(function (txt) {
                    console.log('插入文本'+txt);
                    if (txt.length) {
                        Resource.getId.get(function (res) {
                            $scope.resources.push({id: res.id, tp: 2, txt: txt});
                        });
                    }
                });
            };

            Array.prototype.contains = function(v) {
                for (var i = 0; i < this.length; ++i) {
                    if (this[i] == v)
                        return true;
                }
                return false;
            };
            $scope.selectResource = function () {
                var ids = $scope.resourceIds;
                ResourceSelectService.open(ids).then(function (selected) {
                    $scope.resourceIds = selected;

                    if (selected.length) {
                        Resource.batch.get({}, {'ids': selected}, function (data) {
                            angular.forEach(data.data, function (o) {
                                var currentIds = [];
                                angular.forEach($scope.resources, function (r) {
                                    currentIds.push(r.id)
                                });

                                if (currentIds.indexOf(o.id) == -1) {
                                    $scope.resources.push(o);
                                }
                                if (o.tp == 1) {
                                    $.hasVideo = true;
                                }
                            });
                        });
                    }
                });
            };

            $scope.selectArticle = function () {
                var articleIds = [];
                angular.forEach($scope.data,  function (r) {
                    if (r.type == 0) {
                        articleIds.push(r.article.id);
                    }
                });

                $scope.articleSelecting = true;
                ArticleSelectService.open([], 1).then(function (selected) {
                    $scope.articleSelecting = false;

                    var ids = [];
                    angular.forEach(selected, function (id) {
                        if (!articleIds.contains(id)) {
                            ids.push(id);
                        }
                    });

                    if (ids.length) {
                        Article.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 0, article: a};
                                $scope.data.unshift(o);
                                $scope.changed = true;
                            });
                            $log.log($scope.data);
                        });
                    }
                }, function () {
                    $scope.articleSelecting = false;
                });
            };


            //选择作者
            $scope.name={
                author_name:''
            };
            $scope.results = false;
            $scope.myKeyup = function () {
                var kw = $scope.name.author_name;
                if(kw == ""){
                    $scope.results = false;
                    return false;
                }
                var SPEC = {page: 1, size: 20, tp:1};
                if ($scope.name.author_name) {
                    SPEC.name = $scope.name.author_name;
                }
                var d = User.get(SPEC, function () {
                    $scope.authors = d.data;
                    if ($scope.authors.length!=0){
                        $scope.results = true;
                        $scope.noauthor=false;
                    }else{
                        $scope.noauthor=true;
                    }
                });
                $scope.getAuthor=function (index) {
                    $scope.article.user = $scope.authors[index];
                    $scope.name.author_name = $scope.authors[index].nick;
                    $scope.results = false;
                }

            }
            $scope.selectTopImage = function () {
                ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                    .then(function (o) {
                    if (!o) {
                        return;
                    }
                    $scope.previewImg.push(o);
                });
            };

            $scope.selectBannerImage = function () {
                ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                    .then(function (o) {
                        if (!o) {
                            return;
                        }
                        $scope.bannerImg.push(o);
                    });
            };

            $scope.selectCoverImage = function () {
                ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight, CONFIG.topImageAspectRatio)
                    .then(function (o) {
                        if (!o) {
                            return;
                        }
                        $scope.coverImg.push(o);
                    });
            };

            $scope.sortOptions = {
                //restrict move across backlogs. move only within backlog.
                accept: function (sourceItemHandleScope, destSortableScope) {
                },
                itemMoved: function (event) {
                },
                orderChanged: function (event) {
                },
                containment: '#board'
            };

            $scope.editResource = function (resource) {
                $log.info("edit resource:", resource);
                ResourceTextService.open(resource.txt, 2000).then(function (txt) {
                    angular.forEach($scope.resources, function (r) {
                        if (r.id === resource.id) {
                            r.txt = txt;
                        }
                    });
                });
            };

            $scope.removeResource = function (resource) {
                $log.info("remove resource:", resource);
                angular.forEach($scope.resources, function (r) {
                    if (r.id === resource.id) {
                        $scope.resources.splice($scope.resources.indexOf(resource), 1);
                    }

                });

                $scope.hasAudio = false;
                $scope.hasVideo = false;
                angular.forEach($scope.resources, function (r) {
                    if (r.tp == 3) {
                        $scope.hasAudio = true;
                    }
                    else if (r.tp == 1) {
                        $scope.hasVideo = true;
                    }
                });
            };

            $scope.removePreviewImg = function (resource) {
                $log.info("remove resource:", resource);
                angular.forEach($scope.previewImg, function (r) {
                    if (r.id === resource.id) {
                        $scope.previewImg.splice($scope.previewImg.indexOf(resource), 1);
                    }
                });
            };


            // datepicker begin
            function newDate() {
                return {
                    date: new Date(),
                    time: new Date(),
                    opened: false
                }
            }

            function parseDate(date) {
                return Date.UTC(date.date.getFullYear(), date.date.getMonth(), date.date.getDate(), date.time.getHours(), date.time.getMinutes()) +
                    date.date.getTimezoneOffset() * 60 * 1000;
            }

            function fromTimestamp(ts) {
                var d = new Date(ts);
                return {
                    date: d,
                    time: d,
                    opened: false
                }
            }
            $scope.hstep = 1;
            $scope.mstep = 5;
            $scope.dateFormat = "yyyy-MM-dd";

            $scope.startDate = newDate();
            $scope.openStartDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.startDate.opened = true;
            };

            $scope.publishDate = newDate();
            $scope.openPublishDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.publishDate.opened = true;
            };

            String.prototype.trim=function()
            {
                return this.replace(/(^\s*)|(\s*$)/g,'');
            };

            function validateArticle() {
                if ($scope.article.type == 2) {
                    var videoCount = 0;
                    var imageCount = 0;

                    angular.forEach($scope.resources, function (r) {
                        if (r.tp == 0) {
                            imageCount++;
                        } else if (r.tp == 1) {
                            videoCount++;
                        }
                    });
                    if (imageCount > 0) {
                       Alert.alert("视频文章不能含有图片，请移除后重试", true);
                       return false;
                    }
                    if (videoCount > 1) {
                        Alert.alert("视频文章只能包含一个视频，请移除多余的视频后重试", true);
                        return false;
                    }

                    if (videoCount === 0) {
                        Alert.alert("请选择视频后重试", true);
                        return false;
                    }
                }

                if (!ResourceChecker.check($scope.resources)) {
                    return false;
                }

                return true;
            }

            $scope.stripFormat = ResourceTranslator.stripFormat;


            $scope.create = function (type) {
                if (type==1){
                    $scope.setPrice=true;
                }
                $log.info("create column");
                $rootScope.isEditingArticle = true;
                $scope.create.show = true;
                $scope.article = {'resources': [], tags:''};
                $scope.keywordNames = "";
                $scope.keywordIds = [];
                $scope.keywordId = [];
                $scope.topImg = {};
                $scope.hasAudio = false;
                $scope.hasVideo = false;
                $scope.author_name = '';
                $scope.articleContent = '';

                // 编辑内容检查
                function check(publish){
                    if (!$scope.article.name || $scope.article.name.length == 0) {
                        Alert.alert("标题不能为空", true);
                        return false;
                    }
                    $scope.resources = ResourceTranslator.fromHtml('#content-editor');
                    var previewImg = [];
                    angular.forEach($scope.previewImg, function (r) {
                        if (r.tp == 0 && previewImg.length < 1) {
                            previewImg.push(r);
                        }
                    });
                    if (previewImg.length == 0) {
                        Alert.alert("请设置文章头图", true);
                        return false;
                    }

                    $scope.article.resources = $scope.resources;
                    $scope.article.topImage = previewImg[0];
                    // $scope.article.type = Number($scope.article.type);

                    if (!validateArticle()) {
                        return false;
                    }
                    console.log($scope.article.tags);
                    var tags = $scope.article.tags.replace('，', ',').split(',');
                    var newTags = [];
                    angular.forEach(tags, function (r) {
                        newTags.push(r.trim());
                    });
                    $scope.article.tags = newTags;

                    $log.info("save article", $scope.article);
                    return true;
                }
                //栏目保存
                $scope.save = function (publish) {
                    // check(publish);
                    if (!$scope.article.name || $scope.article.name.length == 0) {
                        Alert.alert("标题不能为空", true);
                        return false;
                    }
                    $scope.resources = ResourceTranslator.fromHtml('#content-editor');
                    var previewImg = [];
                    angular.forEach($scope.previewImg, function (r) {
                        if (r.tp == 0 && previewImg.length < 1) {
                            previewImg.push(r);
                        }
                    });
                    if (previewImg.length == 0) {
                        Alert.alert("请设置文章头图", true);
                        return false;
                    }

                    $scope.article.resources = $scope.resources;
                    $scope.article.topImage = previewImg[0];
                    // $scope.article.type = Number($scope.article.type);

                    if (!validateArticle()) {
                        return false;
                    }
                    console.log($scope.article.tags);
                    var tags = $scope.article.tags.replace('，', ',').split(',');
                    var newTags = [];
                    angular.forEach(tags, function (r) {
                        newTags.push(r.trim());
                    });
                    $scope.article.tags = newTags;


                    $scope.article.publish = publish ? 1 : 0;
                    var createCheck = function () {
                        $scope.uploading = true;
                        Column.save($scope.article, function () {
                            Alert.alert("操作成功").then(function () {
                                $scope.create.show = false;
                                $scope.articlelist.show = true;
                                $scope.uploading = false;
                                document.location.reload(true);
                            });
                        }, function (res) {
                            $scope.updating = true;
                            $scope.uploading = false;
                            $log.info(res.data);
                            Alert.alert("操作失败：" + res.data, true);
                        });
                    };
                    createCheck();
                };

                $scope.cancel = function () {
                    $scope.create.show = false;
                    $scope.articlelist.show = true;
                    $scope.uploading = false;

                    clearData();
                };
            };

            $scope.edit = function (idx,type) {
                if (type==1){
                    $scope.setPrice=true;
                }
                var n = $scope.data.data[idx];
                Column.get({id: n.id}, function (o) {
                    $log.info("edit article:", o);
                    $rootScope.isEditingArticle = true;
                    //是否为付费
                    if (o.type==0){
                        $scope.free = false;
                    }else{
                        $scope.free = true;
                    }
                    $scope.article = o;
                    console.log(o);
                    $scope.editArticleContent = ResourceTranslator.toHtml(o.resources);

                    // SensitiveReplaceService.replaceArticle(o);

                    $scope.name.author_name = o.user.nick;
                    o.user = o.user;
                    o.category = o.category.id;

                    $scope.edit.show = true;

                    if (o.tags) {
                        o.tags = o.tags.join(',');
                    } else {
                        o.tags = '';
                    }
                    //todo, who use resourceIds ??
                    $scope.resourceIds = [];
                    $scope.hasAudio = false;
                    $scope.hasVideo = false;
                    angular.forEach($scope.article.resources, function (o) {
                        $scope.resourceIds.push(o.id);
                        if (o.tp == 3) {
                            $scope.hasAudio = true;
                        } else if (o.tp == 1) {
                            $scope.hasVideo = true;
                        }
                    });
                    $scope.resources = o.resources;

                    $scope.previewImg = [o.topImage];
                    // $scope.bannerImg = [o.bannerImage];
                    // $log.log($scope.bannerImg);
                    // $scope.coverImg = [];
                    // if (o.cover) {
                    //     if (o.cover.w) {
                    //         o.cover.url += '?imageMogr2/crop/!' + o.cover.w + 'x' + o.cover.h + 'a' + o.cover.x + 'a' + o.cover.y;
                    //     }
                    //     $scope.coverImg.push(o.cover);
                    // }
                    $scope.update = function () {
                        $log.info("update article");
                        if (!$scope.article.name || $scope.article.name.length == 0) {
                            Alert.alert("标题不能为空", true);
                            return;
                        }
                        $scope.resources = ResourceTranslator.fromHtml('#content-editor');

                        var previewImg = [];
                        angular.forEach($scope.previewImg, function (r) {
                            if (r.tp == 0 && previewImg.length < 1) {
                                previewImg.push(r);
                            }
                        });
                        if (previewImg.length == 0) {
                            Alert.alert("请设置栏目头图", true);
                            return;
                        }

                        $scope.article.resources = $scope.resources;
                        $scope.article.topImage = previewImg[0];
                        $scope.article.category ={
                            id:$scope.article.category
                        };

                        $log.info("article:", $scope.article);

                        if (!validateArticle()) {
                            return;
                        }

                        var tags = $scope.article.tags.replace('，', ',').split(',');
                        var newTags = [];
                        angular.forEach(tags, function (r) {
                            newTags.push(r.trim());
                        });
                        $scope.article.tags = newTags;

                        var editCheck = function () {
                            $scope.uploading = true;
                            Column.editor.update({id: o.id}, $scope.article, function () {
                                Alert.alert("操作成功").then(function () {
                                    $scope.create.show = false;
                                    $scope.articlelist.show = true;
                                    $scope.uploading = false;
                                    //refresh($scope.grid.page);
                                    document.location.reload(true);
                                });
                            }, function (res) {
                                $scope.updating = true;
                                $scope.uploading = false;
                                $log.info(res.data);
                                Alert.alert("操作失败：" + res.data, true);
                            });
                        };
                        editCheck();
                    };

                    $scope.cancel = function () {
                        $scope.create.show = false;
                        $scope.articlelist.show = true;
                        $scope.uploading = false;

                        clearData();
                    };

                });
            };
            $scope.manage = function (idx) {
                var n = $scope.data.data[idx];
                $rootScope.isEditingArticle = true;
                $scope.manage.show = true;
                Column.articles.get({id: n.id}, function (o) {
                    $scope.data = o;
                      console.log(o);
                    })
                }
            $scope.managecancel = function () {
                $scope.manage.show = false;
                // $scope.articlelist.show = true;
                document.location.reload(true);
            };
            // $scope.cancel = function () {
            //     $scope.manage.show = false;
            //     $scope.columnFreelist.show = true;
            // };
            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("del article:", o);
                ConfirmService.confirm('确定要删除此文章吗?').then(function () {
                    Column.remove({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };
            $scope.pay = "设为付费";
            $scope.setPay = function () {
                if ($scope.pay == "设为付费"){
                    $scope.pay = "设为免费";
                    $scope.type==0;
                }else{
                    $scope.pay = "设为付费";
                    $scope.type==1;
                }
            }

        }]);
