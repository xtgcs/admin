'use strict';

/* Controllers */

angular.module('myApp.actcategorycontrollers', ['ui.bootstrap'])
    .controller('ActCategoryCtrl', ['$scope', '$stateParams', '$log', 'Alert', 'ConfirmService', 'data', '$modal', 'ActCategory', 'CONFIG',
        function ($scope, $stateParams, $log, Alert, ConfirmService, data, $modal, ActCategory, CONFIG) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: CONFIG.limit};
                if ($scope.grid.name) {
                    SPEC.name = $scope.grid.name;
                }

                var d = ActCategory.get(SPEC, function () {
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

            $scope.create = function () {
                $modal.open({
                    templateUrl: 'partials/category/activity_category_create.html',
                    controller: function ($scope, $modalInstance) {
                        $scope.category = {};
                        $scope.save = function () {
                            if (!$scope.category.name) {
                                Alert.alert("名称不能为空", true);
                                return;
                            }
                            ActCategory.save($scope.category, function () {
                                Alert.alert("操作成功");
                                //refresh list
                                refresh(1);
                                $modalInstance.close();
                            }, function (res) {
                                console.log(res);
                                Alert.alert("操作失败：" + '名称已存在', true);
                            });
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        }
                    }
                })
            };

            $scope.edit = function (idx) {
                var o = $scope.data.data[idx];
                $modal.open({
                    templateUrl: 'partials/category/activity_category_edit.html',
                    controller: function ($modalInstance, $scope, category) {
                        $scope.category = category;
                        $scope.categoryOriginal = {
                            name: category.name
                        };
                        $log.info(category);
                        $scope.save = function () {
                            ActCategory.update({id: category.id}, $scope.category, function () {
                                $log.info("save success");
                                $modalInstance.dismiss();
                            }, function (res) {
                                Alert.alert("操作失败：" + '名称已存在', true);
                                o.name = $scope.categoryOriginal.name;
                            });

                        };
                        $scope.ok = function () {
                            $modalInstance.dismiss();
                        }
                    },
                    resolve: {
                        category: function () {
                            return o;
                        }

                    }
                })
            };

            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                ConfirmService.confirm('确定要删除此分类吗?').then(function () {
                    ActCategory.remove({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res, true);
                    });
                });
            }
        }]);


/* Controllers */

angular.module('myApp.activitycmtcontrollers', ['ui.bootstrap'])
    .controller('ActivityCommentCtrl', ['$scope', '$stateParams', '$modal', '$log', 'Alert', 'ConfirmService', 'SensitiveReplaceService', 'CONFIG', 'data', 'ActivityComment', 'Activity',
        function ($scope, $stateParams, $modal, $log, Alert, ConfirmService, SensitiveReplaceService, CONFIG, data, ActivityComment, Activity) {
            $scope.data = data;
            $log.info(data);
            $scope.grid = {
                page: 1
            };
            var refresh = function (page) {
                $log.info('refresh');
                var SPEC = {page: page, size: CONFIG.limit};
                if ($scope.grid.txt) {
                    SPEC.q = $scope.grid.txt;
                }
                var d = ActivityComment.get(SPEC, function () {
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
                    ActivityComment.remove({id: o.id}, function (res) {
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
                    templateUrl: 'partials/activity/activity_view.html',
                    controller: function ($scope, $modalInstance, activity) {
                        $scope.activity = activity;

                        $scope.wordsd = activity.sensitive.join('|');
                        SensitiveReplaceService.replaceActivity(activity);

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        activity: function () {
                            return Activity.get({id: o.activity.id}).$promise;
                        }
                    }
                });
            };
        }])
    .controller('SensitiveActivityCommentCtrl', ['$scope', '$stateParams', '$modal', '$log', 'Alert', 'ConfirmService', 'SensitiveReplaceService', 'CONFIG', 'data', 'ActivityComment', 'Activity',
        function ($scope, $stateParams, $modal, $log, Alert, ConfirmService, SensitiveReplaceService, CONFIG, data, ActivityComment, Activity) {
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
                var d = ActivityComment.sensitive.get(SPEC, function () {
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
                    templateUrl: 'partials/activity/activity_view.html',
                    controller: function ($scope, $modalInstance, activity) {
                        $scope.activity = activity;

                        $scope.wordsd = activity.sensitive.join('|');
                        SensitiveReplaceService.replaceActivity(activity);

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        activity: function () {
                            return Activity.get({id: o.activity.id}).$promise;
                        }
                    }
                });
            }

            $scope.audit = function (idx) {
                var _data = $scope.data;
                var o = $scope.data.data[idx];
                $log.info("audit cmt:", o);
                $modal.open({
                    templateUrl: 'partials/comment/activity_comment_audit.html',
                    controller: function ($scope, $modalInstance, cmt, page) {
                        $scope.cmt = cmt;
                        $scope.cmt.status = "0";

                        $scope.audit = function () {
                            ConfirmService.confirm('确定要删除此评论吗?').then(function () {
                                ActivityComment.remove({id: o.id}, function (res) {
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
                            return ActivityComment.get({id: o.id}).$promise;
                        },
                        page: function () {
                            return $scope.grid.page;
                        }
                    }
                });
            };
        }]);

/* Controllers */

angular.module('myApp.activitycontrollers', ['ui.bootstrap'])
    .controller('ActivityCtrl', ['$scope', '$modal', '$log', '$state', 'Alert', 'ConfirmService', 'DateFormatter', 'CONFIG', 'Activity', 'Order', 'data', 'defaultHint', 'ResourceTranslator', 'ImageSelectService', 'ResourceSelectService', 'ResourceTextService', 'ResourceSingleSelectService', 'UserSingleSelectService', 'SensitiveReplaceService', 'ActivitySelectService', 'Resource', '$rootScope', 'FileUploader', "category",'categoryextend','brandclass','token', 'VALID','User','Recommend',
        function ($scope, $modal, $log, $state, Alert, ConfirmService, DateFormatter, CONFIG, Activity, Order, data, defaultHint, ResourceTranslator, ImageSelectService, ResourceSelectService, ResourceTextService, ResourceSingleSelectService, UserSingleSelectService, SensitiveReplaceService, ActivitySelectService, Resource, $rootScope, FileUploader, category,categoryextend,brandclass, token, VALID,User,Recommend) {
            $scope.statusList = [
                {"id": "0", "name": "未发布的活动"},
                {"id": "1", "name": "已发布的活动"}
            ];

            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            $scope.activitylist = {
                show: true
            };
            $scope.recommended=false;
            $scope.category = category.data;
            $scope.categoryextend = categoryextend.data;
            $scope.brandClass = brandclass.data;

            $rootScope.isEditingActivity = false;

            function processActivities(activities) {
                angular.forEach(activities.data, function (activity) {
                    var st = new Date(activity.st);
                    var year = st.getFullYear();
                    var month = st.getMonth() + 1;
                    var date = st.getDate();
                    activity._start_date = year + '.' + month + '.' + date;
                    activity.exportUrl = '/portal/activity/' + activity.id + '/order/export';
                });
            }

            processActivities(data);

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.TRUE};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Activity.get(SPEC, function () {
                    processActivities(data);
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

            $scope.showCmt = function (idx, showOp) {
                var parentScope = $scope;
                var o = $scope.data.data[idx];
                $modal.open({
                    templateUrl: 'partials/activity/activity_cmt.html',
                    controller: function ($scope, $modalInstance, cmt, user) {
                        $scope.cmt = cmt;
                        $scope.grid = {
                            page: 1
                        };

                        $scope.commentIds = [];
                        angular.forEach(parentScope.activity.comments, function (c) {
                            $scope.commentIds.push(c.id);
                        });

                        $scope.showCommentOp = showOp;

                        var refresh = function (page) {
                            var SPEC = {id: user.id, page: page, size: CONFIG.less};
                            if ($scope.grid.q) {
                                SPEC.q = $scope.grid.q;
                            }

                            var d = Activity.cmt.get(SPEC, function () {
                                $scope.cmt = d;
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

                        $scope.recommendComment = function (comment) {
                            $log.info("recommend activity comment:", o);
                            ConfirmService.confirm('确定要将此评论标记为精华吗?').then(function () {
                                Activity.recommendComment.get({id: parentScope.activity.id}, {ids: [comment.id]}, function (o) {
                                    parentScope.activity = o;
                                    $scope.commentIds = [];
                                    angular.forEach(o.comments, function (c) {
                                        $scope.commentIds.push(c.id);
                                    });

                                    Alert.alert("操作成功");
                                }, function (res) {
                                    Alert.alert("操作失败：" + res.data, true);
                                });
                            });
                        };

                        $scope.ok = function () {
                            $modalInstance.close();
                            delete $scope.showCommentOp;
                        };

                        $scope.cancel = function () {
                            $modalInstance.close();
                            delete $scope.showCommentOp;
                        };
                    },
                    resolve: {
                        cmt: function () {
                            return Activity.cmt.get({'id': o.id, page: 1, size: CONFIG.less}).$promise;
                        },
                        user: function () {
                            return o;
                        }
                    }
                });
            };

            // // 是否为精品活动
            // $scope.boutique = false;
            // $scope.selectBoutique = function () {
            //     if (!$scope.boutique){
            //         $scope.boutique = true;
            //         $scope.activity.isboutique = 1;
            //     }else{
            //         $scope.boutique = false;
            //         $scope.activity.isboutique = 0;
            //     }
            // }

            $scope.resources = [];
            $scope.resourceIds = [];
            $scope.linkActivity = [];
            $scope.linkActivityIds = [];
            $scope.previewImg = [];

            var clearData = function () {
                $log.info("clear data");
                $scope.resources = [];
                $scope.resourceIds = [];
                $scope.linkActivity = [];
                $scope.linkActivityIds = [];
                $scope.previewImg = [];
                $scope.activity = {'resource': [], 'tp': 0};
            };

            $scope.clearData = function () {
                $rootScope.isEditingActivity = false;
                clearData();
            };


            $rootScope.geo = {};

            $scope.map = function () {
                $modal.open({
                    templateUrl: 'partials/activity/activity_map.html',
                    controller: function ($scope, $modalInstance) {

                        $scope.ok = function () {
                            var map = document.getElementById("myIFrame").contentWindow;
                            var location = map.document.getElementById("location").value;
                            var address = map.document.getElementById("address").value;
                            var city = map.document.getElementById("city").value;
                            var lat = map.document.getElementById("lat").value;
                            var lng = map.document.getElementById("lng").value;
                            var city_lat = map.document.getElementById("city_lat").value;
                            var city_lng = map.document.getElementById("city_lng").value;
                            $log.info("location:", location, "address:", address, "city:", city, "lat:", lat, "lng:", lng);
                            var locationName;
                            if (location.indexOf(city) !== -1) {
                                locationName = location;
                            } else {
                                locationName = city + location;
                            }
                            $rootScope.address = locationName;
                            $log.info('root', $rootScope.address);
                            $rootScope.geo = {
                                "name": locationName,
                                "address": address,
                                "city": {
                                    "name": city,
                                    "longitude": parseFloat(city_lng),
                                    "latitude": parseFloat(city_lat)
                                },
                                "coordinates": {
                                    "longitude": parseFloat(lng),
                                    "latitude": parseFloat(lat)
                                }
                            };

                            $modalInstance.close();
                        };

                        $scope.cancel = function () {
                            $modalInstance.close();
                        }
                    }
                })
            };

            $scope.insertTextarea = function () {
                ResourceTextService.open('', 2000).then(function (txt) {
                    if (txt.length) {
                        Resource.getId.get(function (res) {
                            $scope.resources.push({id: res.id, tp: 2, txt: txt});
                        });
                    }
                });
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
                            });
                        });
                    }
                });
            };


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
                    console.log($scope.authors);

                });
                $scope.getAuthor=function (index) {
                    $scope.activity.user = $scope.authors[index].id;
                    $scope.name.author_name = $scope.authors[index].nick;
                    $scope.results = false;
                }

            }



            $scope.selectTopImage = function () {
                ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight).then(function (o) {
                    if (!o) {
                        return;
                    }

                    $scope.previewImg.push(o);
                });
            };

            // datepicker begin
            $scope.hstep = 1;
            $scope.mstep = 5;
            $scope.dateFormat = "yyyy-MM-dd";

            $scope.startDate = newDate();
            $scope.openStartDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.startDate.opened = true;
            };

            $scope.endDate = newDate();
            $scope.openEndDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.endDate.opened = true;
            };

            $scope.deadlineDate = newDate();
            $scope.openDeadlineDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.deadlineDate.opened = true;
            };

            $scope.createDate = newDate();
            $scope.openCreateDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.createDate.opened = true;
            };

            $scope.publishDate = newDate();
            $scope.openPublishDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.publishDate.opened = true;
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
            };

            $scope.removePreviewImg = function (resource) {
                $log.info("remove resource:", resource);
                angular.forEach($scope.previewImg, function (r) {
                    if (r.id === resource.id) {
                        $scope.previewImg.splice($scope.previewImg.indexOf(resource), 1);
                    }
                });
            };


            $scope.removeActivity = function (id) {
                angular.forEach($scope.linkActivity, function (r) {
                    if (r.id === id) {
                        $scope.linkActivity.splice($scope.linkActivity.indexOf(r), 1);
                        $scope.linkActivityIds.splice($scope.linkActivityIds.indexOf(id), 1)
                    }
                });
            };

            $scope.selectActivity = function () {
                var ids = $scope.linkActivityIds;
                $scope.activitySelecting = true;
                ActivitySelectService.open(ids, 2, $scope.activity.id).then(function (selected) {
                    $scope.activitySelecting = false;
                    $scope.linkActivityIds = selected;
                    $scope.linkActivity = [];
                    if (selected.length) {
                        Activity.batch.get({}, {'ids': selected}, function (data) {
                            $scope.linkActivity = data.data;
                        });
                    }
                }, function () {
                    $scope.activitySelecting = false;
                });
            };

            function newDate() {
                return {
                    date: new Date(),
                    time: new Date(),
                    minDate: new Date(),
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
                    minDate: new Date(),
                    opened: false
                }
            }

            $scope.formatActivityDate = function (ts) {
                return DateFormatter.formatActivityDate(ts);
            };

            $scope.publishTypes = [
                {"id": "0", "name": "手工发布"},
                {"id": "1", "name": "定时发布"}
            ];

            $scope.pushSetting = [
                {"id": "0", "name": "不发送推送消息"},
                {"id": "1", "name": "发送推送消息"}
            ];

            $scope.stripFormat = ResourceTranslator.stripFormat;
            $scope.create = function () {
                $log.info("create activity");
                $rootScope.isEditingActivity = true;
                $scope.create.show = true;
                $scope.activity = {
                    'resource': [], tags: '', autoPublishString: '0', needPushString: '0', items: [],
                    hint: defaultHint.txt
                };
                $rootScope.geo = {};
                $rootScope.address = "";
                $scope.keywordNames = "";
                $scope.keywordIds = [];
                $scope.keywordId = [];
                var names = '';
                var ids = [];

                $scope.activityContent = '';

                $scope.startDate = newDate();
                $scope.endDate = newDate();
                $scope.createDate = newDate();
                $scope.deadlineDate = newDate();
                $scope.publishDate = newDate();
                $scope.someProperty = false;
                $scope.select = function () {
                    $scope.someProperty = true;
                }
                // 创建活动检查
                function check(publish) {
                    var activity = $scope.activity;
                    if (!activity.name || activity.name.length == 0) {
                        Alert.alert("活动名称不能为空", true);
                        return;
                    }

                    if (!$rootScope.address || $rootScope.address.length == 0) {
                        Alert.alert("必须设置活动位置", true);
                        return;
                    }

                    if (activity.items.length == 0) {
                        Alert.alert("请添加活动项目", true);
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
                        Alert.alert("请设置活动头图", true);
                        return;
                    }

                    activity.resource = $scope.resources;
                    activity.topImage = previewImg[0];
                    // if (bannerImg.length > 0) {
                    //     activity.bannerImage = bannerImg[0];
                    // }
                    // activity.cover = coverImg[0];
                    $scope.activity.activityIds = $scope.linkActivityIds;

                    activity.maxAttendees = Number(activity.maxAttendees);
                    angular.forEach(activity.items, function (item) {
                        item.price = Number(item.price);
                    });

                    activity.st = parseDate($scope.startDate);
                    activity.et = parseDate($scope.endDate);
                    activity.dt = parseDate($scope.deadlineDate);
                    activity.ct = parseDate($scope.createDate);
                    activity.pt = parseDate($scope.publishDate);
                    activity.publish = publish ? 1 : 0;
                    activity.needPush = parseInt(activity.needPushString);

                    activity.geo = $rootScope.geo;
                    if($scope.activity.tags  instanceof Array){
                        var newTags = $scope.activity.tags;

                    }else{
                        var tags = activity.tags.replace('，', ',').split(',');
                        var newTags = [];
                        angular.forEach(tags, function (r) {
                            newTags.push(r.trim());
                        });
                    }
                    activity.tags = newTags;

                    $log.info("activity:", activity);
                }
                $scope.save = function (publish) {
                    $log.info("save activity");
                    // check(publish);

                    var activity = $scope.activity;
                    if (!activity.name || activity.name.length == 0) {
                        Alert.alert("活动名称不能为空", true);
                        return;
                    }

                    if (!$rootScope.address || $rootScope.address.length == 0) {
                        Alert.alert("必须设置活动位置", true);
                        return;
                    }

                    if (activity.items.length == 0) {
                        Alert.alert("请添加活动项目", true);
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
                        Alert.alert("请设置活动头图", true);
                        return;
                    }

                    activity.resource = $scope.resources;
                    activity.topImage = previewImg[0];
                    angular.forEach($scope.brandClass,function (n) {
                        if (n.id==$scope.activity.brandClass){
                            $scope.activity.brandClass = n
                        }

                    })

                    $scope.activity.activityIds = $scope.linkActivityIds;

                    activity.maxAttendees = Number(activity.maxAttendees);
                    angular.forEach(activity.items, function (item) {
                        item.price = Number(item.price);
                    });

                    activity.st = parseDate($scope.startDate);
                    activity.et = parseDate($scope.endDate);
                    activity.dt = parseDate($scope.deadlineDate);
                    activity.ct = parseDate($scope.createDate);
                    activity.pt = parseDate($scope.publishDate);
                    activity.publish = publish ? 1 : 0;
                    activity.needPush = parseInt(activity.needPushString);

                    activity.geo = $rootScope.geo;
                    if($scope.activity.tags  instanceof Array){
                        var newTags = $scope.activity.tags;

                    }else{
                        var tags = activity.tags.replace('，', ',').split(',');
                        var newTags = [];
                        angular.forEach(tags, function (r) {
                            newTags.push(r.trim());
                        });
                    }
                    activity.tags = newTags;

                    $log.info("activity:", activity);

                    var createCheck = function () {
                        $scope.uploading = true;
                        Activity.save($scope.activity, function () {
                            Alert.alert("操作成功").then(function () {
                                $scope.create.show = false;
                                $scope.activitylist.show = true;
                                $scope.uploading = false;
                                refresh($scope.grid.page);
                            });
                        }, function (res) {
                            $scope.updating = true;
                            $scope.uploading = false;
                            Alert.alert("操作失败：" + res.data, true);
                        });
                    };
                    createCheck();
                };

                // 活动编辑好预览
                $scope.preview = function (publish) {
                    check(publish);
                    var createCheck = function () {
                        $scope.uploading = true;
                        Activity.save($scope.activity, function (data) {
                            $scope.uploading =false;
                            var o = data;
                            $modal.open({
                                templateUrl: 'partials/activity/activity_view.html',
                                controller: function ($scope, $modalInstance, activity) {
                                    $scope.activity = activity;
                                    $scope.wordsd = activity.sensitive.join('|');
                                    SensitiveReplaceService.replaceActivity(activity);
                                    $scope.ok = function () {
                                        $modalInstance.close();
                                    };
                                },
                                resolve: {
                                    activity: function () {
                                        return Activity.get({id: o.id}).$promise;
                                    }
                                }
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
                    $scope.activitylist.show = true;
                    $scope.uploading = false;

                    clearData();
                };
            };


            $scope.edit = function (idx) {
                var n = $scope.data.data[idx];
                Activity.get({id: n.id}, function (o) {
                    $log.info("edit activity:", o);
                    $rootScope.geo = o.geo;
                    $rootScope.isEditingActivity = true;
                    $scope.activity = o;

                    $scope.name.author_name = o.user.nick;
                    o.user = o.user.id;
                    o.category = o.category.id;
                    if (o.brandClass){
                        o.brandClass = o.brandClass.id;
                    }
                    if (o.categoryextend){
                        o.categoryextend = o.categoryextend.id;
                    }
                    console.log(o.category);
                    $scope.editorActivityContent = ResourceTranslator.toHtml(o.resource);

                    SensitiveReplaceService.replaceActivity(o);

                    $log.log('init:' + o.st);
                    $scope.startDate = fromTimestamp(o.st);
                    $scope.endDate = fromTimestamp(o.et);
                    $scope.deadlineDate = fromTimestamp(o.dt);
                    $scope.createDate = fromTimestamp(o.ct);
                    $scope.publishDate = fromTimestamp(o.pt);

                    $scope.edit.show = true;

                    $scope.activity.autoPublishString = '' + $scope.activity.autoPublish;
                    $scope.activity.needPushString = '' + $scope.activity.needPush;

                    if (o.tags) {
                        o.tags = o.tags.join(',');
                    } else {
                        o.tags = '';
                    }

                    //todo, why $rootScope
                    if (o.geo && o.geo.name) {
                        $rootScope.address = o.geo.name;
                    }

                    //todo, who use resourceIds ??
                    $scope.resourceIds = [];
                    angular.forEach($scope.activity.resource, function (o) {
                        $scope.resourceIds.push(o.id);
                    });

                    $scope.resources = o.resource;
                    $scope.linkActivity = o.activities;
                    $scope.previewImg = [o.topImage];

                    o.maxAttendees = Number(o.maxAttendees);
                    o.price = Number(o.price);

                    o.st = parseDate($scope.startDate);
                    o.et = parseDate($scope.endDate);
                    o.dt = parseDate($scope.deadlineDate);
                    o.ct = parseDate($scope.createDate);

                    $scope.linkActivityIds = [];
                    angular.forEach($scope.linkActivity, function (o) {
                        $scope.linkActivityIds.push(o.id);
                    });

                    // // 是否为精品活动
                    // if (o.isboutique == 0){
                    //     $scope.boutique = false;
                    // }else{
                    //     $scope.boutique = true;
                    // }
                    // 编辑活动检查
                    function Check(publish) {
                        $scope.resources = ResourceTranslator.fromHtml('#content-editor');

                        var activity = $scope.activity;

                        if (!activity.name || activity.name.length == 0) {
                            Alert.alert("活动名称不能为空", true);
                            return;
                        }

                        if (!$rootScope.address || $rootScope.address.length == 0) {
                            Alert.alert("必须设置活动位置", true);
                            return;
                        }

                        if (activity.items.length == 0) {
                            Alert.alert("请添加活动项目", true);
                            return;
                        }

                        var previewImg = [];
                        angular.forEach($scope.previewImg, function (r) {
                            if (r.tp == 0 && previewImg.length < 1) {
                                previewImg.push(r);
                            }
                        });

                        if (previewImg.length == 0) {
                            Alert.alert("请设置活动头图", true);
                            return;
                        }
                        $scope.activity.resource = $scope.resources;
                        $scope.activity.topImage = previewImg[0];
                        // if (bannerImg.length > 0) {
                        //     $scope.activity.bannerImage = bannerImg[0];
                        // }
                        // $scope.activity.cover = coverImg[0];
                        $scope.activity.activityIds = $scope.linkActivityIds;

                        $scope.activity.maxAttendees = Number($scope.activity.maxAttendees);

                        angular.forEach(activity.items, function (item) {
                            item.price = Number(item.price);
                        });

                        $scope.activity.st = parseDate($scope.startDate);
                        // $log.log('update st: ' + $scope.activity.st);
                        $scope.activity.et = parseDate($scope.endDate);
                        $scope.activity.dt = parseDate($scope.deadlineDate);
                        $scope.activity.ct = parseDate($scope.createDate);
                        $scope.activity.pt = parseDate($scope.publishDate);
                        $scope.activity.publish = publish ? 1 : 0;

                        $scope.activity.needPush = parseInt($scope.activity.needPushString);

                        $scope.activity.geo = $rootScope.geo;

                        if($scope.activity.tags  instanceof Array){
                            var newTags = $scope.activity.tags;

                        }else{
                            var tags = $scope.activity.tags.replace('，', ',').split(',');
                            var newTags = [];
                            angular.forEach(tags, function (r) {
                                newTags.push(r.trim());
                            });
                        }
                        $scope.activity.tags = newTags;

                        $log.info("activity:", $scope.activity);

                    }
                    $scope.update = function (publish) {
                        $log.info("update activity");
                        // Check(publish);

                        $scope.resources = ResourceTranslator.fromHtml('#content-editor');

                        var activity = $scope.activity;

                        if (!activity.name || activity.name.length == 0) {
                            Alert.alert("活动名称不能为空", true);
                            return;
                        }

                        if (!$rootScope.address || $rootScope.address.length == 0) {
                            Alert.alert("必须设置活动位置", true);
                            return;
                        }

                        if (activity.items.length == 0) {
                            Alert.alert("请添加活动项目", true);
                            return;
                        }

                        var previewImg = [];
                        angular.forEach($scope.previewImg, function (r) {
                            if (r.tp == 0 && previewImg.length < 1) {
                                previewImg.push(r);
                            }
                        });

                        if (previewImg.length == 0) {
                            Alert.alert("请设置活动头图", true);
                            return;
                        }
                        $scope.activity.resource = $scope.resources;
                        $scope.activity.topImage = previewImg[0];
                        angular.forEach($scope.brandClass,function (n) {
                            if (n.id==$scope.activity.brandClass){
                                $scope.activity.brandClass = n
                            }

                        })
                        // if (bannerImg.length > 0) {
                        //     $scope.activity.bannerImage = bannerImg[0];
                        // }
                        // $scope.activity.cover = coverImg[0];
                        $scope.activity.activityIds = $scope.linkActivityIds;

                        $scope.activity.maxAttendees = Number($scope.activity.maxAttendees);

                        angular.forEach(activity.items, function (item) {
                            item.price = Number(item.price);
                        });

                        $scope.activity.st = parseDate($scope.startDate);
                        // $log.log('update st: ' + $scope.activity.st);
                        $scope.activity.et = parseDate($scope.endDate);
                        $scope.activity.dt = parseDate($scope.deadlineDate);
                        $scope.activity.ct = parseDate($scope.createDate);
                        $scope.activity.pt = parseDate($scope.publishDate);
                        $scope.activity.publish = publish ? 1 : 0;

                        $scope.activity.needPush = parseInt($scope.activity.needPushString);

                        $scope.activity.geo = $rootScope.geo;

                        if($scope.activity.tags  instanceof Array){
                            var newTags = $scope.activity.tags;

                        }else{
                            var tags = $scope.activity.tags.replace('，', ',').split(',');
                            var newTags = [];
                            angular.forEach(tags, function (r) {
                                newTags.push(r.trim());
                            });
                        }
                        $scope.activity.tags = newTags;

                        $log.info("activity:", $scope.activity);


                        var editCheck = function () {
                            $scope.uploading = true;
                            Activity.update({id: o.id}, $scope.activity, function () {
                                Alert.alert("操作成功").then(function () {
                                    $scope.create.show = false;
                                    $scope.activitylist.show = true;
                                    $scope.uploading = false;
                                    //refresh($scope.grid.page);
                                    document.location.reload(true);
                                });
                            }, function (res) {
                                $scope.updating = true;
                                $scope.uploading = false;
                                Alert.alert("操作失败：" + res.data, true);
                            });
                        };
                        editCheck();
                    };

                    // 活动编辑好预览
                    $scope.updatePreview = function (publish) {
                        Check(publish);
                        var createCheck = function () {
                            $scope.uploading = true;
                            Activity.save($scope.activity, function (data) {
                                $scope.uploading =false;
                                var o = data;
                                $modal.open({
                                    templateUrl: 'partials/activity/activity_view.html',
                                    controller: function ($scope, $modalInstance, activity) {
                                        $scope.activity = activity;
                                        $scope.wordsd = activity.sensitive.join('|');
                                        SensitiveReplaceService.replaceActivity(activity);
                                        $scope.ok = function () {
                                            $modalInstance.close();
                                        };
                                    },
                                    resolve: {
                                        activity: function () {
                                            return Activity.get({id: o.id}).$promise;
                                        }
                                    }
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
                        $scope.activitylist.show = true;
                        $scope.uploading = false;

                        clearData();
                    };

                });
            };

            $scope.listRecommendComment = function (idx) {
                var n = $scope.data.data[idx];
                $scope.currentIndex = idx;
                Activity.get({id: n.id}, function (o) {
                    $log.info("recommend comment:", o);
                    $scope.activity = o;

                    $scope.commentIds = [];
                    angular.forEach(o.comments, function (c) {
                        $scope.commentIds.push(c.id);
                    });

                    $scope.listRecommendComment.show = true;
                    $scope.cancel = function () {
                        $scope.listRecommendComment.show = false;
                        $scope.activitylist.show = true;
                    };
                });
            };

            $scope.removeRecommendComment = function (comment) {
                ConfirmService.confirm('确定要取消此精华评论吗?').then(function () {
                    Activity.removeRecommendComment.get({id: $scope.activity.id}, {ids: [comment.id]}, function (o) {
                        $scope.activity = o;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.listOrders = function (idx, name) {
                $scope.kid = name;
                var n = $scope.data.data[idx];
                $scope.currentIndex = idx;
                $scope.currentGid = n.id;

                $scope.orderGrid = {page: 1};
                $scope.orders = {};

                $scope.orderStatusList = [
                    {"id": "0", "name": "待支付的订单"},
                    {"id": "1", "name": "已取消的订单"},
                    {"id": "2", "name": "已支付的订单"}
                ];

                var refresh = function (page) {
                    $scope.exportUrl = '/portal/activity/' + n.id + '/order/export';
                    var SPEC = {gid: n.id, type: 1, page: page, size: 20, valid: VALID.TRUE};
                    if ($scope.orderGrid.status) {
                        SPEC.status = $scope.orderGrid.status;
                        $scope.exportUrl += '?status=' + SPEC.status;
                    }
                    if ($scope.orderGrid.name) {
                        SPEC.q = $scope.orderGrid.name;
                    }
                    var d = Order.get(SPEC, function () {
                        $scope.orders = d;
                    });
                };

                refresh(1);

                $scope.search = function () {
                    refresh($scope.orderGrid.page);
                };

                var orderPageWatch = $scope.$watch('orderGrid.page', function (newVal, oldVal) {
                    if (newVal != oldVal) {
                        refresh(newVal);
                    }
                });

                $scope.listOrders.show = true;
                $scope.cancel = function () {
                    $scope.listOrders.show = false;
                    $scope.activitylist.show = true;
                    orderPageWatch();
                };
            };

            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("del activity:", o);
                ConfirmService.confirm('确定要删除活动 [ ' + o.name + ' ] ?').then(function () {
                    Activity.remove({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        //Alert.alert("操作成功");
                        var dom = document.getElementById("delete_success");
                        dom.style.display = "block";
                        setTimeout(function () {
                            dom.style.display = "none";
                        },2000)
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };
            $scope.recommend = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("recommend article:", o);
                ConfirmService.confirm('确定要推荐此文章到feed流吗?').then(function () {
                    Recommend.update({activity:{id: o.id},type:0,image:o.cover,title:o.name}, function () {
                        $scope.recommended = true;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.cancelRecommend = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("cancel recommend article:", o);
                ConfirmService.confirm('确定要取消推荐此文章吗?').then(function () {
                    Recommend.remove({id: o.id}, function () {
                        o.recommended = 0;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };
            $scope.recommendBanner = function (idx) {
                var o = $scope.data.data[idx];
                var id = [];
                id.push(o.id);
                $log.info("recommend article:", o);
                ConfirmService.confirm('确定要推荐此文章到banner吗?').then(function () {
                    Activity.batch.get({}, {'ids':id}, function () {
                        o.recommendedBanner = 1;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.view = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("view activity:", o);
                $modal.open({
                    templateUrl: 'partials/activity/activity_view.html',
                    controller: function ($scope, $modalInstance, activity) {
                        $scope.activity = activity;

                        $scope.wordsd = activity.sensitive.join('|');
                        SensitiveReplaceService.replaceActivity(activity);

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        activity: function () {
                            return Activity.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.publish = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("publish activity:", o);
                ConfirmService.confirm('确定要发布此活动吗?').then(function () {
                    Activity.publish.commit({id: o.id}, function () {
                        o.status = 1;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.audit = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("audit activity:", o);
                $modal.open({
                    templateUrl: 'partials/activity/activity_audit.html',
                    controller: function ($scope, $modalInstance, activity, page) {
                        $scope.activity = activity;
                        activity.auditInfo = '通过';

                        $scope.activity.statusd = 1;
                        $scope.audit = function () {
                            if (!$scope.activity.auditInfo) {
                                Alert.alert('必须设置审核意见', true);
                                return;
                            }
                            var postData = {
                                'status': Number($scope.activity.statusd),
                                'auditInfo': $scope.activity.auditInfo
                            };
                            $log.info("audit:", postData);
                            $log.info("audit activity...:", o);
                            Activity.check.get({id: activity.id}, function (res) {
                                $log.info('length', res.words.length);
                                if (res.words.length != 0 && $scope.activity.statusd == 1) {
                                    ConfirmService.confirm('活动含有敏感词，确定提交吗?').then(function () {
                                        auditCheck();
                                    });
                                } else {
                                    auditCheck();
                                }
                            }, function (res) {
                                Alert.alert('操作失败' + res.data, true);
                            });
                            var auditCheck = function () {
                                Activity.audit.commit({id: activity.id}, postData, function () {
                                    Alert.alert('操作成功');
                                    refresh(page);
                                    $modalInstance.close();
                                }, function (res) {
                                    Alert.alert('操作失败:' + res, true);
                                });
                            }
                        };

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        activity: function () {
                            return Activity.get({id: o.id}).$promise;
                        },
                        page: function () {
                            return $scope.grid.page;
                        }
                    }
                });
            };

            $scope.removeItem = function (idx) {
                if (!$scope.activity) {
                    return;
                }

                if ($scope.activity.items.length <= idx) {
                    return;
                }

                $scope.activity.items.splice(idx, 1);
            };

            $scope.editItem = function (idx) {
                var activity = $scope.activity;
                if (!$scope.activity.items) {
                    $scope.activity.items = [];
                }

                $modal.open({
                    templateUrl: 'partials/activity/activity_item.html',
                    controller: function ($scope, $modalInstance) {
                        $scope.hstep = 1;
                        $scope.mstep = 5;
                        $scope.dateFormat = "yyyy-MM-dd";

                        $scope.openStartDatePicker = function ($event) {
                            $event.preventDefault();
                            $event.stopPropagation();
                            $scope.startDate.opened = true;
                        };


                        $scope.openEndDatePicker = function ($event) {
                            $event.preventDefault();
                            $event.stopPropagation();
                            $scope.endDate.opened = true;
                        };

                        $scope.openDeadlineDatePicker = function ($event) {
                            $event.preventDefault();
                            $event.stopPropagation();
                            $scope.deadlineDate.opened = true;
                        };
                        var item;
                        var creating = false;

                        if (idx === undefined) {
                            item = {title: '', price: 0.0};
                            creating = true;
                            $scope.startDate = newDate();
                            $scope.endDate = newDate();
                            $scope.deadlineDate = newDate();
                        } else {
                            var oItem = activity.items[idx];
                            $scope.startDate = fromTimestamp(oItem.st);
                            $scope.endDate = fromTimestamp(oItem.et);
                            $scope.deadlineDate = fromTimestamp(oItem.dt);

                            item = {title: oItem.title, price: oItem.price,maxAttendees:oItem.maxAttendees}
                        }

                        $scope.currentItem = item;
                        $scope.ok = function () {
                            $modalInstance.close();
                            if (creating) {
                                item.st = parseDate($scope.startDate);
                                item.et = parseDate($scope.endDate);
                                item.dt = parseDate($scope.deadlineDate);
                                activity.items.push(item);
                            } else {
                                activity.items[idx].title = item.title;
                                activity.items[idx].price = item.price;
                                activity.items[idx].maxAttendees = item.maxAttendees;
                                activity.items[idx].st = parseDate($scope.startDate);
                                activity.items[idx].et = parseDate($scope.endDate);
                                activity.items[idx].dt = parseDate($scope.deadlineDate);
                            }
                        };

                        $scope.cancel = function () {
                            $modalInstance.close();
                        };

                    }
                });
            }

        }])
    .controller('DeletedActivityCtrl', ['$scope', '$modal', '$log', 'Alert', 'ConfirmService', 'CONFIG', 'data', 'Activity', 'VALID',
        function ($scope, $modal, $log, Alert, ConfirmService, CONFIG, data, Activity, VALID) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.FALSE};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
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

            $scope.view = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("view activity:", o);
                $modal.open({
                    templateUrl: 'partials/activity/activity_view.html',
                    controller: function ($scope, $modalInstance, activity) {
                        $scope.activity = activity;

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        activity: function () {
                            return Activity.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.recover = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("recover activity:", o);
                ConfirmService.confirm('确定要恢复此活动吗?').then(function () {
                    Activity.recover.commit({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

        }]).controller('RecommendActivityCtrl', ['$scope', '$log', 'Alert', 'ConfirmService', 'ActivitySelectService', 'Activity', '$modal', 'data', 'Author', 'CONFIG',
    function ($scope, $log, Alert, ConfirmService, ActivitySelectService, Activity, $modal, data, Author, CONFIG) {
        $scope.data = data;

        $scope.del = function (idx) {
            var u = $scope.data[idx];
            $log.info("cancel recommend activity:", u);
            ConfirmService.confirm('确定要取消推荐此活动吗?').then(function () {
                Activity.recommendRemove.get({}, {ids: [u.id]}, function () {
                    $scope.data.splice(idx, 1);
                    $scope.data.total--;
                    $scope.data.size--;
                    Alert.alert("操作成功");
                }, function (res) {
                    Alert.alert("操作失败：" + res.data, true);
                });
            });
        };

        $scope.selectActivity = function () {
            $scope.activitySelecting = true;

            var ids = [];
            angular.forEach($scope.data, function (r) {
                ids.push(r.id);
            });

            ActivitySelectService.open(ids, 100).then(function (selected) {
                $scope.activitySelecting = false;
                if (selected) {
                    Activity.recommendAdd.get({}, {ids: selected}, function () {
                        Activity.recommend.query(function (data) {
                            $scope.data = data;
                        });
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                }
            }, function () {
                $scope.activitySelecting = false;
            });
        };
    }
])
    .controller('ActivityHintCtrl', ['$scope', '$stateParams', '$log', 'Alert', 'ConfirmService', 'CONFIG', 'data', 'Activity',
        function ($scope, $stateParams, $log, Alert, ConfirmService, CONFIG, data, Activity) {
            $scope.data = data;
            $scope.save = function (name, val) {
                var SPEC = {"key": name, "val": val};
                Activity.hint.update(SPEC, function () {
                    Alert.alert("操作成功");
                }, function (res) {
                    Alert.alert("操作失败：" + res, true);
                })
            };
        }])
    .controller('ActivityVerifyOrderCtrl', ['$scope', '$stateParams', '$log', 'Alert', 'ConfirmService', 'CONFIG', 'activities', 'vcodes', 'Activity',
        function ($scope, $stateParams, $log, Alert, ConfirmService, CONFIG, activities, vcodes, Activity) {
            $scope.activities = activities;
            $scope.vcodes = vcodes;

            $scope.code = '';

            String.prototype.trim = function () {
                return this.replace(/(^\s*)|(\s*$)/g, '');
            };

            function refreshTodayActivities() {
                Activity.today.query({}, function (data) {
                    $scope.activities = data;
                });
            }

            function refreshVCodes() {
                Activity.vcode.query({}, function (data) {
                    $scope.vcodes = data;
                });
            }

            $scope.verifyCode = function () {
                $scope.code = $scope.code.trim();
                if (!$scope.code) {
                    return;
                }
                Activity.vcode.update({vcode: $scope.code}, function (data) {
                    $scope.code = "";
                    Alert.alert("操作成功");
                    refreshTodayActivities();
                    refreshVCodes();
                }, function (res) {
                    Alert.alert("操作失败：" + res.data, true);
                })
            };

        }])
    .controller('ActivityBillCtrl', ['$scope', '$stateParams', '$log', 'Alert', 'ConfirmService', 'me', 'CONFIG', 'bills', 'comingActivities', 'oldActivities', 'Activity',
        function ($scope, $stateParams, $log, Alert, ConfirmService, me, CONFIG, bills, comingActivities, oldActivities, Activity) {
            $scope.bills = bills;
            $scope.comingActivities = comingActivities;
            $scope.oldActivities = oldActivities;

            function processBills(bills) {
                angular.forEach(bills.data, function (bill) {
                    bill.exportUrl = '/portal/activity/bill/' + bill.id + '/export';
                });
            }

            function processComingActivities(activities) {
                angular.forEach(activities.data, function (activity) {
                    var dayMillis = 1000 * 24 * 3600;
                    var dt = activity.dt % dayMillis * dayMillis;
                    var now = new Date().getUTCMilliseconds() % dayMillis * dayMillis;
                    activity._rdays = Math.max((now - dt) / dayMillis, 1);
                });
            }

            function processOldActivities(activities) {
                angular.forEach(activities.data, function (activity) {
                    var st = new Date(activity.st);
                    var year = st.getFullYear();
                    var month = st.getMonth() + 1;
                    var date = st.getDate();
                    activity._start_date = year + '.' + month + '.' + date;
                });
            }

            processBills(bills);
            processComingActivities(comingActivities);
            processOldActivities(oldActivities);

            if (me.bankCard.length >= 4) {
                $scope.bankCardSuffix = me.bankCard.substr(me.bankCard.length - 4, 4);
            } else {
                $scope.bankCardSuffix = '';
            }

            String.prototype.trim = function () {
                return this.replace(/(^\s*)|(\s*$)/g, '');
            };

            $scope.billGrid = {
                page: 1
            };

            var refreshBills = function (page) {
                var SPEC = {page: page, size: 5};
                Activity.bill.get(SPEC, function (data) {
                    $scope.bills = data;
                    processBills(data);
                });

            };

            $scope.$watch('billGrid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refreshBills(newVal);
                }
            });

            $scope.comingGrid = {
                page: 1
            };

            var refreshComingActivities = function (page) {
                var SPEC = {page: page, size: 10};
                Activity.coming.get(SPEC, function (data) {
                    $scope.comingActivities = data;
                    processComingActivities(data);
                });

            };

            $scope.$watch('comingGrid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refreshComingActivities(newVal);
                }
            });

            $scope.oldGrid = {
                page: 1
            };

            var refreshOldActivities = function (page) {
                var SPEC = {page: page, size: 10};
                Activity.old.get(SPEC, function (data) {
                    $scope.oldActivities = data;
                    processOldActivities(data);
                });

            };

            $scope.$watch('oldGrid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refreshOldActivities(newVal);
                }
            });


            $scope.updateStatus = function ($index) {
                var bill = $scope.bills.data[$index];

                ConfirmService.confirm('确定已经打款了吗?').then(function () {
                    Activity.updateBill.update({id: bill.id}, function (data) {
                        bill.status = 1;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });

            };

        }]);


// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ui.bootstrap',
    'ui.router',
    'angularFileUpload',
    'ui.select',
    'xeditable',
    'checklist-model',
    'ui.sortable',
    'checklist-model',
    'textAngular',
    'myApp.filters',
    'myApp.services',
    'myApp.directives',
    'myApp.controllers',
    'myApp.articlecontrollers',
    'myApp.topiccontrollers',
    'myApp.activitycontrollers',
    'myApp.goodscontrollers',
    'myApp.ordercontrollers',
    'myApp.authorcontrollers',
    'myApp.editorcontrollers',
    'myApp.usercontrollers',
    'myApp.resourcecontrollers',
    'myApp.articlecmtcontrollers',
    'myApp.activitycmtcontrollers',
    'myApp.sensitivecontrollers',
    'myApp.categorycontrollers',
    'myApp.messagecontrollers',
    'myApp.actcategorycontrollers',
    'myApp.feedbackcontrollers',
    'myApp.applicationcontrollers',
    'myApp.financecontrollers',
    'myApp.livecontrollers',
    'myApp.bannercontrollers',
    'myApp.recommendedcontrollers',
    'myApp.columncontrollers',
    'myApp.openscreencontrollers'
])
    .constant('CONFIG', {
        limit: 10,
        less: 5,
        topImageMinWidth: 0,
        topImageMinHeight: 0,
        topImageAspectRatio: 4/3
    })
    .constant('AUTH_EVENTS', {
        loginNeeded: 'auth-login-needed',
        loginSuccess: 'auth-login-success',
        httpForbidden: 'auth-http-forbidden'
    })
    .constant('MSG_AUTH', [
        {value: 1, text: '有'},
        {value: 0, text: '无'}
    ])
    .constant('VALID', {
        TRUE: 0,
        FALSE: 1
    })
    .constant('STATUS', {
        PENDING: 0,
        PUBLISHED: 1
    })
    .constant('API', {
        // url:'/songguoAPI',
        // url:'apis',
        url:''
    })
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/index");
        $stateProvider
            .state('login', {
                url: '/login',
                controller: 'LoginCtrl',
                templateUrl: 'partials/login.html'
            }).state('home', {
                abstract: true,
                resolve: {
                    me: function ($rootScope, User) {
                        if ($rootScope.me) {
                            return $rootScope.me;
                        } else {
                            return User.me.get().$promise;
                        }
                    },
                    badge: function (Badge) {
                        return Badge.get().$promise;
                    }
                },
                controller: 'HomeCtrl',
                templateUrl: 'partials/home.html'
            })
            .state('home.index', {
                url: '/index',
                controller: 'IndexCtrl',
                templateUrl: 'partials/index-placeholder.html'
            })
            .state('home.article', {
                resolve: {
                    data: function (CONFIG, Article, VALID) {
                        return Article.get({page: 1, size: 20, valid: VALID.TRUE}).$promise;
                    },
                    token: function (Resource) {
                        return Resource.token.get().$promise;
                    },
                    category: function(Category) {
                         return Category.get({version:2.1}).$promise;
                        // return Category.all.query().$promise;
                    },
                    columns: function (CONFIG, Columns, VALID) {
                        return Columns.get({page: 1, size: 20, valid: VALID.TRUE}).$promise;
                    },
                },
                controller: 'ArticleCtrl',
                url: '/article',
                templateUrl: 'partials/article/article_list.html'
            }).state('home.deletedArticles', {
                resolve: {
                    data: function (CONFIG, Article, VALID) {
                        return Article.get({page: 1, size: 20, valid: VALID.FALSE}).$promise;
                    }
                },
                controller: 'DeletedArticleCtrl',
                url: '/deletedArticle',
                templateUrl: 'partials/article/deleted_article_list.html'
            }).state('home.column', {
                 resolve: {
                data: function (CONFIG, Columns, VALID) {
                    return Columns.get({page: 1, size: 20,columnType:1}).$promise;
                },
                token: function (Resource) {
                    return Resource.token.get().$promise;
                },
               category: function(Category) {
                    return Category.get({version:2.1}).$promise;
                         // return Category.all.query().$promise;
                     },
            },
            controller: 'ColumnCtrl',
            url: '/column',
            templateUrl: 'partials/column/column_list.html'
        }).state('home.columnFree', {
            resolve: {
                data: function (CONFIG, Columns, VALID) {
                    return Columns.get({page: 1, size: 20,columnType:0}).$promise;
                },
                token: function (Resource) {
                    return Resource.token.get().$promise;
                },
                category: function(Category) {
                    return Category.get({version:2.1}).$promise;
                    // return Category.all.query().$promise;
                },
            },
            controller: 'ColumnCtrl',
            url: '/columnFree',
            templateUrl: 'partials/column/column_free_list.html'
        }).state('home.topic', {
                resolve: {
                    data: function (CONFIG, Topic, VALID) {
                        return Topic.get({page: 1, size: 20, valid: VALID.TRUE}).$promise;
                    },
                    token: function (Resource) {
                        return Resource.token.get().$promise;
                    }
                },
                controller: 'TopicCtrl',
                url: '/topic',
                templateUrl: 'partials/topic/topic_list.html'
            }).state('home.deletedTopics', {
                resolve: {
                    data: function (CONFIG, Topic, VALID) {
                        return Topic.get({page: 1, size: 20, valid: VALID.FALSE}).$promise;
                    }
                },
                controller: 'DeletedTopicCtrl',
                url: '/deletedTopic',
                templateUrl: 'partials/topic/deleted_topic_list.html'
            }).state('home.activity', {
                resolve: {
                    data: function (CONFIG, Activity, VALID) {
                        return Activity.get({page: 1, size: 20, valid: VALID.TRUE}).$promise;
                    },
                    token: function (Resource) {
                        return Resource.token.get().$promise;
                    },
                    categoryextend: function(Category) {
                        return Category.get({version:2.1}).$promise;
                    },
                    category: function(Category) {
                        return Category.get().$promise;
                        // return Category.all.query().$promise;
                    },
                    defaultHint: function (Activity) {
                        return Activity.hint.get().$promise
                    },
                    brandclass: function(Brandclass) {
                        return Brandclass.get().$promise;
                    },
                },
                controller: 'ActivityCtrl',
                url: '/activity',
                templateUrl: 'partials/activity/activity_list.html'
            }).state('home.deletedActivities', {
                resolve: {
                    data: function (CONFIG, Activity, VALID) {
                        return Activity.get({page: 1, size: 20, valid: VALID.FALSE}).$promise;
                    }
                },
                controller: 'DeletedActivityCtrl',
                url: '/deletedActivity',
                templateUrl: 'partials/activity/deleted_activity_list.html'
            }).state('home.recommendActivity', {
                resolve: {
                    data: function (Activity, CONFIG) {
                        return Activity.recommend.query().$promise;
                    }
                },
                controller: 'RecommendActivityCtrl',
                url: '/recommendActivity',
                templateUrl: 'partials/activity/recommend_activity_list.html'
            }).state('home.activityHint', {
                resolve: {
                    data: function (Activity) {
                        return Activity.hint.get().$promise
                    }
                },
                controller: 'ActivityHintCtrl',
                url: '/activityHint',
                templateUrl: 'partials/activity/activity_hint.html'
            }).state('home.activityVerify', {
                resolve: {
                    activities: function (Activity) {
                        return Activity.today.query().$promise
                    },
                    vcodes: function (Activity) {
                        return Activity.vcode.query().$promise
                    }
                },
                controller: 'ActivityVerifyOrderCtrl',
                url: '/activityVerify',
                templateUrl: 'partials/activity/activity_order_verify.html'
            }).state('home.activityBill', {
                resolve: {
                    bills: function (Activity) {
                        return Activity.bill.get({page:1, size:5}).$promise
                    },
                    comingActivities: function (Activity) {
                        return Activity.coming.get({page:1, size:10}).$promise
                    },
                    oldActivities: function (Activity) {
                        return Activity.old.get({page:1, size:20}).$promise
                    }
                },
                controller: 'ActivityBillCtrl',
                url: '/activityBill',
                templateUrl: 'partials/activity/activity_bill.html'
            }).state('home.actCategory', {
                resolve: {
                    data: function (CONFIG, ActCategory) {
                        return ActCategory.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'ActCategoryCtrl',
                url: '/actCategory',
                templateUrl: 'partials/category/activity_category_list.html'
            }).state('home.goods', {
                resolve: {
                    data: function (CONFIG, Goods, VALID) {
                        return Goods.get({page: 1, size: 20, valid: VALID.TRUE}).$promise;
                    },
                    token: function (Resource) {
                        return Resource.token.get().$promise;
                    },
                    defaultHint: function (Goods) {
                        return Goods.hint.get().$promise
                    }
                },
                controller: 'GoodsCtrl',
                url: '/goods',
                templateUrl: 'partials/goods/goods_list.html'
            }).state('home.deletedGoods', {
                resolve: {
                    data: function (CONFIG, Goods, VALID) {
                        return Goods.get({page: 1, size: 20, valid: VALID.FALSE}).$promise;
                    }
                },
                controller: 'DeletedGoodsCtrl',
                url: '/deletedGoods',
                templateUrl: 'partials/goods/deleted_goods_list.html'
            }).state('home.goodsHint', {
                resolve: {
                    data: function (Goods) {
                        return Goods.hint.get().$promise
                    }
                },
                controller: 'GoodsHintCtrl',
                url: '/goodsHint',
                templateUrl: 'partials/goods/goods_hint.html'
            }).state('home.order', {
                resolve: {
                    data: function (CONFIG, Order, VALID) {
                        return Order.get({page: 1, size: 20}).$promise;
                    }
                },
                controller: 'OrderCtrl',
                url: '/order',
                templateUrl: 'partials/order/order_list.html'
            }).state('home.banner', {
                resolve: {
                    data: function (Banner) {
                        return Banner.query().$promise;
                    }
                },
                controller: 'BannerCtrl',
                url: '/banner',
                templateUrl: 'partials/banner/banner_list.html'
            }).state('home.openscreen', {
                resolve: {
                    data: function (Openscreen) {
                        return Openscreen.query({advertkind:0}).$promise;
                    }
                },
                controller: 'OpenScreenCtrl',
                url: '/openscreen',
                templateUrl: 'partials/openscreen/openscreen_edit.html'
        }).state('home.recommended', {
                resolve: {
                    data: function (Recommends) {
                        return Recommends.get({page: 1, size: 20}).$promise;
                    }
                },
                controller: 'recommendedCtrl',
                url: '/recommended',
                templateUrl: 'partials/recommended/recommended_list.html'
        }).state('home.application', {
                resolve: {
                    data: function (CONFIG, Application, VALID) {
                        return Application.get({page: 1, size: 20}).$promise;
                    }
                },
                controller: 'ApplicationCtrl',
                url: '/application',
                templateUrl: 'partials/application/application_list.html'
            }).state('home.feedback', {
                resolve: {
                    data: function (CONFIG, Feedback, VALID) {
                        return Feedback.get({page: 1, size: 20}).$promise;
                    }
                },
                controller: 'FeedbackCtrl',
                url: '/feedback',
                templateUrl: 'partials/feedback/feedback_list.html'
            }).state('home.keyword', {
                resolve: {
                    data: function (CONFIG, Keyword) {
                        return Keyword.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'KeywordCtrl',
                url: '/keyword',
                templateUrl: 'partials/keyword/keyword_list.html'
            }).state('home.articleComment', {
                resolve: {
                    data: function (CONFIG, ArticleComment) {
                        return ArticleComment.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'ArticleCommentCtrl',
                url: '/articleComment',
                templateUrl: 'partials/comment/article_comment_list.html'
            }).state('home.sensitiveArticleComment', {
                resolve: {
                    data: function (CONFIG, ArticleComment) {
                        return ArticleComment.sensitive.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'SensitiveArticleCommentCtrl',
                url: '/sensitiveArticleComment',
                templateUrl: 'partials/comment/article_comment_sensitive.html'
            }).state('home.activityComment', {
                resolve: {
                    data: function (CONFIG, ActivityComment) {
                        return ActivityComment.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'ActivityCommentCtrl',
                url: '/activityComment',
                templateUrl: 'partials/comment/activity_comment_list.html'
            }).state('home.sensitiveActivityComment', {
                resolve: {
                    data: function (CONFIG, ActivityComment) {
                        return ActivityComment.sensitive.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'SensitiveActivityCommentCtrl',
                url: '/sensitiveActivityComment',
                templateUrl: 'partials/comment/activity_comment_sensitive.html'
            }).state('home.user', {
                resolve: {
                    user_black: function () {
                        return false;
                    },
                    data: function (CONFIG, User) {
                        return User.get({page: 1, size: CONFIG.limit, status: 0, sort: 0}).$promise;
                    }
                },
                controller: 'UserCtrl',
                url: '/user',
                templateUrl: 'partials/user/user_list.html'
            }).state('home.black', {
                resolve: {
                    user_black: function () {
                        return true;
                    },
                    data: function (CONFIG, User) {
                        return User.get({page: 1, size: CONFIG.limit, status: 1, sort: 0}).$promise;    //todo status 过滤黑名单字段
                    }
                },
                controller: 'BlackCtrl',
                url: '/black',
                templateUrl: 'partials/user/user_list.html' //user 和 black 共用一个list
            }).state('home.ad', {
                resolve: {
                    data: function (Ad) {
                        return Ad.get().$promise
                    }
                },
                controller: 'AdCtrl',
                url: '/ad',
                templateUrl: 'partials/ad/ad_edit.html'
            }).state('home.about', {
                resolve: {
                    data: function (About) {
                        return About.get().$promise
                    }
                },
                controller: 'AboutCtrl',
                url: '/about',
                templateUrl: 'partials/about.html'
            }).state('home.resource', {
                resolve: {
                    data: function (CONFIG, Resource) {
                        return Resource.get({page: 1, size: CONFIG.limit, tp: '1,3', status: 1}).$promise;
                    }
                },
                controller: 'ResourceCtrl',
                url: '/resource',
                templateUrl: 'partials/resource/resource_list.html'
            }).state('home.sensitive', {
                resolve: {
                    data: function (CONFIG, Sensitive) {
                        return Sensitive.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'SensitiveCtrl',
                url: '/sensitive',
                templateUrl: 'partials/sensitive/sensitive_list.html'
            }).state('home.category', {
                resolve: {
                    data: function (CONFIG, Category) {
                        return Category.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'CategoryCtrl',
                url: '/category',
                templateUrl: 'partials/category/category_list.html'
            }).state('home.setting', {
                resolve: {
                    one: function ($rootScope, User) {

                        return User.me.get().$promise;

                    }
                },
                controller: 'SettingCtrl',
                url: '/setting',
                templateUrl: 'partials/setting.html'
            }).state('home.editor', {
                resolve: {
                    editor_black: function () {
                        return false;
                    },
                    data: function (Editor, CONFIG) {
                        return Editor.get({page: 1, size: CONFIG.limit, status: 0}).$promise;
                    }
                },
                controller: 'EditorCtrl',
                url: '/editor',
                templateUrl: 'partials/admin/editor_list.html'
            }).state('home.editorBlack', {
                resolve: {
                    editor_black: function () {
                        return true;
                    },
                    data: function (Editor, CONFIG) {
                        return Editor.get({page: 1, size: CONFIG.limit, status: 1}).$promise;
                    }
                },
                controller: 'EditorCtrl',
                url: '/editorBlack',
                templateUrl: 'partials/admin/editor_list.html'
            }).state('home.author', {
                resolve: {
                    author_black: function () {
                        return false;
                    },
                    data: function (Author, CONFIG) {
                        return Author.get({page: 1, size: CONFIG.limit, status: 0}).$promise;
                    },
                    token: function (Resource) {
                        return Resource.token.get().$promise;
                    },
                    category: function(Category) {
                        return Category.get({version:2.1}).$promise;
                    }
                },
                controller: 'AuthorCtrl',
                url: '/author',
                templateUrl: 'partials/admin/author_list.html'
            }).state('home.authorBlack', {
                resolve: {
                    author_black: function () {
                        return true;
                    },
                    data: function (Author, CONFIG) {
                        return Author.get({page: 1, size: CONFIG.limit, status: 1}).$promise;
                    },
                    token: function (Resource) {
                        return Resource.token.get().$promise;
                    }
                },
                controller: 'AuthorCtrl',
                url: '/authorBlack',
                templateUrl: 'partials/admin/author_list.html'
            }).state('home.recommendAuthor', {
                resolve: {
                    data: function (Author, CONFIG) {
                        return Author.recommend.query().$promise;
                    }
                },
                controller: 'RecommendAuthorCtrl',
                url: '/recommendAuthor',
                templateUrl: 'partials/admin/recommend_author_list.html'
            }).state('home.msg', {
                resolve: {
                    data: function (CONFIG, Msg) {
                        return Msg.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'MsgCtrl',
                url: '/msg',
                templateUrl: 'partials/msg/msg_list.html'
            }).state('home.message', {
                resolve: {
                    data: function (CONFIG, Message) {
                        return Message.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'MessageCtrl',
                url: '/message',
                templateUrl: 'partials/message/message_list.html'
            }).state('home.testEditor', {
                resolve: {
                    article: function (Article, VALID) {
                        return Article.get({page: 1, size: 20, status: 1, valid: VALID.TRUE}).$promise;
                    }
                },
                controller: 'TestEditorCtrl',
                url: '/testEditor',
                templateUrl: 'partials/test/editor.html'
            }).state('/media', {
                resolve: {
                    goods: function ($log, Goods, $stateParams) {
                        if ($stateParams.tp == '4')
                            return Goods.get({id: $stateParams.id}).$promise;
                        return null;
                    },
                    resource: function (Resource, $stateParams) {
                        if ($stateParams.tp == '0' || $stateParams.tp == '1' || $stateParams.tp == '2' || $stateParams.tp == '3')
                        return Resource.get({id: $stateParams.id}).$promise;
                        return null;
                    },
                    lives: function ($log,Live, $stateParams) {
                        if ($stateParams.tp == '8')
                            return Live.get({id: $stateParams.id}).$promise;
                        return null;
                    },
                    articles: function ($log,Article, $stateParams) {
                        if ($stateParams.tp == '6')
                            return Article.get({id: $stateParams.id}).$promise;
                        return null;
                    },
                    activities: function ($log,Activity, $stateParams) {
                        if ($stateParams.tp == '7')
                            return Activity.get({id: $stateParams.id}).$promise;
                        return null;
                    }

                },
                controller: 'MediaCtrl',
                url: '/media/:tp/:id',
                templateUrl: 'partials/resource/media.html'
            }).state('home.financeStat', {
                resolve: {
                    data: function (CONFIG, FinanceStat, VALID) {
                        return FinanceStat.get({page: 1, size: 20, valid: VALID.TRUE}).$promise;
                    }
                },
                controller: 'FinanceStatCtrl',
                url: '/finance',
                templateUrl: 'partials/finance/finance_stat_list.html'
            }).state('home.live', {
                resolve: {
                    data: function (CONFIG, Live, VALID) {
                        return Live.get({page: 1, size: 20, valid: VALID.TRUE}).$promise;
                    },
                    token: function (Resource) {
                        return Resource.token.get().$promise;
                    },
                    category: function(Category) {
                        return Category.get({version:2.1}).$promise;
                        // return Category.all.query().$promise;
                    }
                },
                controller: 'LiveCtrl',
                url: '/live',
                templateUrl: 'partials/live/live_list.html'
            }).state('home.liveBill', {
                resolve: {
                    lives: function (Live) {
                        return Live.get({page:1, size: 20}).$promise
                    }
                },
                controller: 'LiveBillCtrl',
                url: '/lvieBill',
                templateUrl: 'partials/live/live_bill.html'
            }).state('home.deletedLives', {
                resolve: {
                    data: function (CONFIG, Live, VALID) {
                        return Live.get({page: 1, size: 20, valid: VALID.FALSE}).$promise;
                    }
                },
                controller: 'DeletedLiveCtrl',
                url: '/deletedLive',
                templateUrl: 'partials/live/deleted_live_list.html'
            });
    }])
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push([
            '$injector',
            function ($injector) {
                return $injector.get('AuthInterceptor');
            }
        ]);
    }])
    .config(function (uiSelectConfig) {
        uiSelectConfig.theme = 'bootstrap';
    })
    .run(['$state', '$rootScope', 'ConfirmService', function ($state, $rootScope, ConfirmService) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.transfering = true;

            if (fromState.name.indexOf('news') > -1 && $rootScope.isEditingNews) {
//                ConfirmService.confirm('您确定要离开此页面么？').then(function () {
//                    console.log('go to: ' + toState.name);
//                }, function () {
//                    console.log('stay at state: ' + fromState.name);
//                    event.preventDefault();
//                });

                if (confirm("您确定要离开此页面么？")) {
                    console.log('go to: ' + toState.name);
                } else {
                    console.log('stay at state: ' + fromState.name);
                    event.preventDefault();
                    $rootScope.transfering = false;
                }

            }
        });
        $rootScope.$on('$stateChangeSuccess', function () {
            $rootScope.transfering = false;
        });
    }]).run(['editableOptions', function (editableOptions) {
        editableOptions.theme = 'bs3';
    }]).run(['$log', '$timeout', 'taRegisterTool', 'taOptions', '$window', 'taTranslations', 'taSelection', 'ResourceSingleSelectService', 'ImageSelectService', 'GoodsSingleSelectService','LiveSingleSelectService','videoSelectService','audioSelectService','ArticleSingleSelectService','ActivitySingleSelectService','Resource', '$location',
        function ($log, $timeout, taRegisterTool, taOptions, $window, taTranslations, taSelection, ResourceSingleSelectService, ImageSelectService, GoodsSingleSelectService,LiveSingleSelectService,videoSelectService,audioSelectService,ArticleSingleSelectService,ActivitySingleSelectService,Resource, $location) {
            var _selection = null;
            $window.onUpdateEditorSelection = function () {
                $timeout(function (){
                    _selection = taSelection.getSelection();
                }, 0);
            };

            taOptions.toolbar.push(['appInsertImage', 'appInsertVideo', 'appInsertAudio','appInsertLive']);
            taRegisterTool('appInsertImage', {
                iconclass: 'fa fa-picture-o',
                tooltiptext: '请选择图片',
                action: function(){
                    var that = this;
                    var selection = _selection;//taSelection.getSelection();
                    $log.log(selection.container?selection.container.tagName:'undefined');
                    ImageSelectService.open().then(function (o) {
                        selection.container.focus();
                        taSelection.setSelection(selection.container, selection.start, selection.end);
                        if (o) {
                            var embed = '<iframe class="ta-app-media ta-insert-image" src="' + getMediaUrl(0, o.id) + '" width="100%" height="300px" frameborder="0"><iframe>';
                            that.$editor().wrapSelection('insertHTML', embed, true)
                        }
                    });
                },
                onElementSelect: {
                    element: 'iframe',
                    onlyWithAttrs: ['ta-insert-image'],
                    action: angular.noop
                }
            });

            function getMediaUrl(tp, id) {
                var absUrl = $location.absUrl();
                var url  = $location.url();
                 console.log(absUrl.substr(0, absUrl.length - url.length) + '/media/' + tp + '/' + id);
                return absUrl.substr(0, absUrl.length - url.length) + '/media/' + tp + '/' + id;
            }

            taRegisterTool('appInsertVideo', {
                iconclass: 'fa fa-file-video-o',
                tooltiptext: taTranslations.insertVideo.tooltip,
                action: function(){
                    var that = this;
                    var selection = _selection;//taSelection.getSelection();
                    $log.log((selection.container?selection.container.tagName:'undefined'));
                    videoSelectService.open().then(function (o) {
                        selection.container.focus();
                        taSelection.setSelection(selection.container, selection.start, selection.end);
                        if ((typeof o)== 'string') {
                            var embed = o;
                        }else{
                            var embed = '<iframe class="ta-app-media ta-insert-video" src="' + getMediaUrl(1, o.id) + '" width="100%" height="300px" frameborder="0"><iframe>';
                        }
                        console.log(embed);
                        that.$editor().wrapSelection('insertHTML', embed, true)

                    });
                },
                onElementSelect: {
                    element: 'iframe',
                    onlyWithAttrs: ['ta-insert-video'],
                    action: angular.noop
                }
            });

            taRegisterTool('appInsertLive', {
                iconclass: 'fa  fa-paper-plane',
                tooltiptext: '请选择连线',
                action: function(){
                    var that = this;
                    var selection = _selection;//taSelection.getSelection();
                    $log.log(selection.container?selection.container.tagName:'undefined');
                    LiveSingleSelectService.open('').then(function (o) {
                        selection.container.focus();
                        taSelection.setSelection(selection.container, selection.start, selection.end);
                        if (o) {
                            var embed = '<iframe class="ta-app-media ta-insert-live" src="' + getMediaUrl(8, o.id) + '" width="100%" height="60px" frameborder="0"><iframe>';
                            that.$editor().wrapSelection('insertHTML', embed, true);
                        }
                    });
                },
                onElementSelect: {
                    element: 'iframe',
                    onlyWithAttrs: ['ta-insert-live'],
                    action: angular.noop
                }
            });
            taRegisterTool('appInsertArticle', {
                iconclass: 'fa   fa-file-text-o',
                tooltiptext: '请选择文章',
                action: function(){
                    var that = this;
                    var selection = _selection;//taSelection.getSelection();
                    $log.log(selection.container?selection.container.tagName:'undefined');
                    ArticleSingleSelectService.open('').then(function (o) {
                        selection.container.focus();
                        taSelection.setSelection(selection.container, selection.start, selection.end);
                        if (o) {
                            var embed = '<iframe class="ta-app-media ta-insert-article" src="' + getMediaUrl(6, o.id) + '" width="100%" height="60px" frameborder="0"><iframe>';
                            that.$editor().wrapSelection('insertHTML', embed, true);
                        }
                    });
                },
                onElementSelect: {
                    element: 'iframe',
                    onlyWithAttrs: ['ta-insert-article'],
                    action: angular.noop
                }
            });

            taRegisterTool('appInsertActivity', {
                iconclass: 'fa  fa-gavel',
                tooltiptext: '请选择活动',
                action: function(){
                    var that = this;
                    var selection = _selection;//taSelection.getSelection();
                    $log.log(selection.container?selection.container.tagName:'undefined');
                    ActivitySingleSelectService.open('').then(function (o) {
                        selection.container.focus();
                        taSelection.setSelection(selection.container, selection.start, selection.end);
                        if (o) {
                            var embed = '<iframe class="ta-app-media ta-insert-activity" src="' + getMediaUrl(7, o.id) + '" width="100%" height="60px" frameborder="0"><iframe>';
                            that.$editor().wrapSelection('insertHTML', embed, true);
                        }
                    });
                },
                onElementSelect: {
                    element: 'iframe',
                    onlyWithAttrs: ['ta-insert-activity'],
                    action: angular.noop
                }
            });

            taRegisterTool('appInsertAudio', {
                iconclass: 'fa fa-file-audio-o',
                tooltiptext: "请选择音乐",
                action: function(){
                    var that = this;
                    var selection = _selection;//taSelection.getSelection();
                    $log.log(selection.container?selection.container.tagName:'undefined');
                    audioSelectService.open().then(function (o) {
                        selection.container.focus();
                        taSelection.setSelection(selection.container, selection.start, selection.end);
                        if (o) {
                            var embed = '<iframe class="ta-app-media ta-insert-audio" src="' + getMediaUrl(3, o.id) + '" width="100%" height="100px" frameborder="0"><iframe>';
                            console.log(embed);
                            that.$editor().wrapSelection('insertHTML', embed, true);
                        }
                    });
                },
                onElementSelect: {
                    element: 'iframe',
                    onlyWithAttrs: ['ta-insert-audio'],
                    action: angular.noop
                }
            });

            taRegisterTool('appInsertGoods', {
                iconclass: 'fa fa-book',
                tooltiptext: "请选择物件",
                action: function(){
                    var that = this;
                    var selection = _selection;//taSelection.getSelection();
                    $log.log(selection.container?selection.container.tagName:'undefined');
                    GoodsSingleSelectService.open('').then(function (o) {
                        selection.container.focus();
                        taSelection.setSelection(selection.container, selection.start, selection.end);
                        if (o) {
                            var embed = '<iframe class="ta-app-media ta-insert-goods" src="' + getMediaUrl(4, o.id) + '" width="100%" height="60px" frameborder="0"><iframe>';
                             console.log(embed);
                            that.$editor().wrapSelection('insertHTML', embed, true);
                        }
                    });
                },
                onElementSelect: {
                    element: 'iframe',
                    onlyWithAttrs: ['ta-insert-audio'],
                    action: angular.noop
                }
            });

            taRegisterTool('fontColor', {
                display: "<button colorpicker type='button' class='btn btn-default ng-scope'  title='Font Color'  colorpicker-close-on-select colorpicker-position='bottom' ng-model='fontColor' style='color: {{fontColor}}'><i class='fa fa-font '></i></button>",
                iconclass: "fa fa-font ",
                tooltiptext: "字体颜色",
                action: function (deferred) {
                    var self = this;
                    if (typeof self.listener == 'undefined') {
                        self.listener = self.$watch('fontColor', function (newValue) {
                            self.$editor().wrapSelection('foreColor', newValue);
                        });
                    }
                    self.$on('colorpicker-selected', function () {
                        deferred.resolve();
                    });
                    self.$on('colorpicker-closed', function () {
                        deferred.resolve();
                    });
                    return false;

                        // this.$editor().wrapSelection('forecolor', 'red');
                }
            });

            taRegisterTool('appListItem', {
                iconclass: 'fa fa-bars',
                tooltiptext: "设置为列表项",
                action: function(){
                    return this.$editor().wrapSelection("formatBlock", "<p>");
                },
                activeState: function(){ return this.$editor().queryFormatBlockState('p'); }
            });

            taRegisterTool('appMediaDesc', {
                iconclass: 'fa fa-comment-o',
                tooltiptext: "设置为图说（图说必须在图片，视频或音频的底部)",
                action: function(){
                    return this.$editor().wrapSelection("formatBlock", "<h6>");
                },
                activeState: function(){ return this.$editor().queryFormatBlockState('h6'); }
            });
            //备注
            taRegisterTool('appMediaNote', {
                iconclass: 'fa  fa-file-o',
                tooltiptext: "备注",
                action: function(){
                    return this.$editor().wrapSelection("formatBlock", "<h5>");
                },
                activeState: function(){ return this.$editor().queryFormatBlockState('h5'); }
            });
        }]);

/* Controllers */

angular.module('myApp.applicationcontrollers', ['ui.bootstrap'])
    .controller('ApplicationCtrl', ['$scope', '$modal', '$log', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'Application', 'data', '$rootScope', 'VALID',
        function ($scope, $modal, $log, $state, Alert, ConfirmService, CONFIG, Application, data, $rootScope, VALID) {
            $scope.statusList = [
                {"id": "0", "name": "待审核的申请"},
                {"id": "1", "name": "已通过的申请"},
                {"id": "2", "name": "已拒绝的申请"}
            ];

            $scope.applicationlist = {
                show: true
            };

            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.TRUE};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Application.get(SPEC, function () {
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
                $scope.application = o;

                $scope.view.show = true;

                $scope.ok = function () {
                    $scope.view.show = false;
                    $scope.applicationlist.show = true;
                };
            };

            $scope.audit = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("audit application:", o);
                $modal.open({
                    templateUrl: 'partials/application/application_audit.html',
                    controller: function ($scope, $modalInstance, application, page) {
                        $scope.application = application;
                        application.auditInfo = '通过';

                        $scope.application.statusd = 1;
                        $scope.audit = function () {
                            if (!$scope.application.auditInfo) {
                                Alert.alert('必须设置审核意见', true);
                                return;
                            }
                            var postData = {
                                'status': Number($scope.application.statusd),
                                'auditInfo': $scope.application.auditInfo
                            };
                            $log.info("audit:", postData);
                            $log.info("audit application...:", o);
                            Application.audit.commit({id: application.id}, postData, function () {
                                Alert.alert('操作成功');
                                refresh(page);
                                $modalInstance.close();
                            }, function (res) {
                                Alert.alert('操作失败:' + res, true);
                            });
                        };

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        application: function () {
                            return Application.get({id: o.id}).$promise;
                        },
                        page: function () {
                            return $scope.grid.page;
                        }
                    }
                });
            }
        }]);

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

/* Controllers */

angular.module('myApp.articlecontrollers', ['ui.bootstrap'])
    .controller('ArticleCtrl', ['$scope', '$modal', '$log', 'me', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'Article', 'data','columns','$interval' ,'ResourceChecker', 'ResourceTranslator', 'ImageSelectService', 'ResourceSelectService', 'ResourceTextService', 'ResourceSingleSelectService', "ActivitySelectService", "GoodsSelectService", "UserSingleSelectService", "SensitiveReplaceService", 'Resource', 'Activity', 'Goods', 'User', '$rootScope', 'FileUploader', 'token', 'category', 'VALID','locals','Recommend',
        function ($scope, $modal, $log, me, $state, Alert, ConfirmService, CONFIG, Article, data,columns,$interval, ResourceChecker, ResourceTranslator, ImageSelectService, ResourceSelectService, ResourceTextService, ResourceSingleSelectService, ActivitySelectService, GoodsSelectService, UserSingleSelectService, SensitiveReplaceService, Resource, Activity, Goods, User, $rootScope, FileUploader, token, category, VALID,locals,Recommend) {
            console.log('loading article controller....');
            $scope.statusList = [
                {"id": "0", "name": "未发布的文章"},
                {"id": "1", "name": "已发布的文章"},
                {"id": "2", "name": "被拒绝的文章"},
                {"id": "3", "name": "自动抓取的文章"}
            ];
            $scope.recommendedList = [
                {"id": "0", "name": "未推荐的文章"},
                {"id": "1", "name": "已推荐的文章"}
            ];
            $scope.typeList = [
                {"id": "0", "name": "文章"},
                //{"id": "1", "name": "图集"},
                {"id": "2", "name": "视频"}
            ];

            //文章列表数据
            $scope.data = data;
            //文章类型
            $scope.category = category.data;
            //文章栏目
            $scope.columns = columns.data;
            $scope.grid = {
                page: 1
            };

            $scope.articlelist = {
                show: true
            };

            //发布方式选择
            $scope.someProperty = false;
            $scope.select = function () {
                $scope.someProperty = true;
            }
            // 是否为专题
            $scope.topic = false;
            $scope.selectTopic = function () {
                if (!$scope.topic){
                    $scope.topic = true;
                    $scope.article.isTopic = 1;
                }else{
                    $scope.topic = false;
                    $scope.article.isTopic = 0;
                }
            }

            // 是否为免费
            $scope.price = false;
            $scope.isFree=false;
            $scope.selectPrice = function () {
                if (!$scope.price){
                    $scope.price = true;
                    $scope.article.freeRead = 1;
                }else{
                    $scope.price = false;
                    $scope.article.freeRead = 0;
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
            //查看文章列表文章的评论
            $scope.showCmt = function (idx, showOp) {
                var parentScope = $scope;
                var o = $scope.data.data[idx];
                $modal.open({
                    templateUrl: 'partials/article/article_cmt.html',
                    controller: function ($scope, $modalInstance, cmt, user) {
                        $scope.cmt = cmt;
                        $scope.grid = {
                            page: 1
                        };

                        $scope.commentIds = [];
                        angular.forEach(parentScope.article.comments, function (c){
                            $scope.commentIds.push(c.id);
                        });

                        $scope.showCommentOp = showOp;

                        var refresh = function (page) {
                            var SPEC = {id: user.id, page: page, size: CONFIG.less};
                            if ($scope.grid.q) {
                                SPEC.q = $scope.grid.q;
                            }

                            var d = Article.cmt.get(SPEC, function () {
                                $scope.cmt = d;
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

                        $scope.recommendComment = function (comment) {
                            $log.info("recommend article comment:", o);
                            ConfirmService.confirm('确定要将此评论标记为精华吗?').then(function () {
                                Article.recommendComment.get({id: parentScope.article.id}, {ids: [comment.id]}, function (o) {
                                    parentScope.article = o;
                                    $scope.commentIds = [];
                                    angular.forEach(o.comments, function (c){
                                        $scope.commentIds.push(c.id);
                                    });

                                    Alert.alert("操作成功");
                                }, function (res) {
                                    Alert.alert("操作失败：" + res.data, true);
                                });
                            });
                        };

                        $scope.ok = function () {
                            $modalInstance.close();
                            delete $scope.showCommentOp;
                        };

                        $scope.cancel = function () {
                            $modalInstance.close();
                            delete $scope.showCommentOp;
                        };
                    },
                    resolve: {
                        cmt: function () {
                            return Article.cmt.get({'id': o.id, page: 1, size: CONFIG.less}).$promise;
                        },
                        user: function () {
                            return o;
                        }
                    }
                });
            };

            $scope.resources = [];
            $scope.resourceIds = [];
            $scope.linkArticle = [];
            $scope.linkArticleIds = [];
            $scope.linkActivity = [];
            $scope.linkActivityIds = [];
            $scope.linkGoods = [];
            $scope.linkGoodsIds = [];
            $scope.linkLive = [];
            $scope.linkLiveIds = [];
            $scope.previewImg = [];
            $scope.bannerImg = [];
            $scope.coverImg = [];

            var clearData = function () {
                $log.info("clear data");
                $scope.resources = [];
                $scope.resourceIds = [];
                $scope.linkArticle = [];
                $scope.linkArticleIds = [];
                $scope.linkActivity = [];
                $scope.linkActivityIds = [];
                $scope.linkGoods = [];
                $scope.linkGoodsIds = [];
                $scope.linkLive = [];
                $scope.linkLiveIds = [];
                $scope.previewImg = [];
                $scope.bannerImg = [];
                $scope.coverImg = [];
                $scope.article = {'resource': [], 'type': 0};
            };

            $scope.clearData = function () {
                $rootScope.isEditingArticle = false;
                clearData();
            };


            $rootScope.geo = {};

            $scope.map = function () {
                $modal.open({
                    templateUrl: 'partials/article/article_map.html',
                    controller: function ($scope, $modalInstance) {

                        $scope.ok = function () {
                            var map = document.getElementById("myIFrame").contentWindow;
                            var location = map.document.getElementById("location").value;
                            var address = map.document.getElementById("address").value;
                            var city = map.document.getElementById("city").value;
                            var lat = map.document.getElementById("lat").value;
                            var lng = map.document.getElementById("lng").value;
                            var city_lat = map.document.getElementById("city_lat").value;
                            var city_lng = map.document.getElementById("city_lng").value;
                            $log.info("location:", location, "address:", address, "city:", city, "lat:", lat, "lng:", lng);
                            var locationName;
                            if (location.indexOf(city) !== -1) {
                                locationName = location;
                            } else {
                                locationName = city + location;
                            }
                            $rootScope.address = locationName;
                            $log.info('root', $rootScope.address);
                            $rootScope.geo = {
                                "name": locationName,
                                "address": address,
                                "city": {
                                    "name": city,
                                    "longitude": parseFloat(city_lng),
                                    "latitude": parseFloat(city_lat)
                                },
                                "coordinates": {
                                    "longitude": parseFloat(lng),
                                    "latitude": parseFloat(lat)
                                }
                            };

                            $modalInstance.close();
                        };

                        $scope.cancel = function () {
                            $modalInstance.close();
                        }
                    }
                })
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

            $scope.selectAudio= function () {
                ResourceSingleSelectService.open('', "3").then(function (selected) {
                    if (selected) {
                        Resource.batch.get({}, {'ids': [selected.id]}, function (data) {
                            angular.forEach(data.data, function (o) {
                                var currentIds = [];
                                angular.forEach($scope.resources, function (r) {
                                    currentIds.push(r.id)
                                });

                                if (currentIds.indexOf(o.id) == -1) {
                                    $scope.resources.push(o);
                                }
                            });
                        });
                    }

                    $scope.hasAudio = false;
                    angular.forEach($scope.resources, function (r) {
                        if (r.tp == 3) {
                            $scope.hasAudio = true;
                        }
                    });
                });
            };

            $scope.selectActivity = function () {
                var ids = $scope.linkActivityIds;
                $scope.activitySelecting = true;
                ActivitySelectService.open(ids, 3).then(function (selected) {
                    $scope.activitySelecting = false;
                    $scope.linkActivityIds = selected;
                    $scope.linkActivity = [];
                    if (selected.length) {
                        Activity.batch.get({}, {'ids': selected}, function (data) {
                            $scope.linkActivity = data.data;
                        });
                    }
                }, function () {
                    $scope.activitySelecting = false;
                });
            };

            $scope.selectGoods = function () {
                console.log("选择物件");
                var ids = $scope.linkGoodsIds;
                $scope.goodsSelecting = true;
                GoodsSelectService.open(ids).then(function (selected) {
                    $scope.goodsSelecting = false;
                    $scope.linkGoodsIds = selected;
                    $scope.linkGoods = [];
                    if (selected.length) {
                        Goods.batch.get({}, {'ids': selected}, function (data) {
                            $scope.linkGoods = data.data;
                        });
                    }
                }, function () {
                    $scope.goodsSelecting = false;
                });
            };

            //选择作者
            $scope.name={
                author_name:""
            };
            $scope.results = false;
            $scope.myKeyup = function () {
                var kw = $scope.name.author_name;
                console.log(kw);
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
                $scope.article.user = $scope.authors[index].id;
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

            // $scope.removeBannerImg = function (resource) {
            //     $log.info("remove resource:", resource);
            //     angular.forEach($scope.bannerImg, function (r) {
            //         if (r.id === resource.id) {
            //             $scope.bannerImg.splice($scope.bannerImg.indexOf(resource), 1);
            //         }
            //     });
            // };
            //
            // $scope.removeCoverImg = function (resource) {
            //     $log.info("remove resource:", resource);
            //     angular.forEach($scope.coverImg, function (r) {
            //         if (r.id === resource.id) {
            //             $scope.coverImg.splice($scope.coverImg.indexOf(resource), 1);
            //         }
            //     });
            // };
            //
            // $scope.removeArticle = function (id) {
            //     angular.forEach($scope.linkArticle, function (r) {
            //         if (r.id === id) {
            //             $scope.linkArticle.splice($scope.linkArticle.indexOf(r), 1);
            //             $scope.linkArticleIds.splice($scope.linkArticleIds.indexOf(id), 1)
            //         }
            //     });
            // };
            //
            // $scope.removeActivity = function (id) {
            //     angular.forEach($scope.linkActivity, function (r) {
            //         if (r.id === id) {
            //             $scope.linkActivity.splice($scope.linkActivity.indexOf(r), 1);
            //             $scope.linkActivityIds.splice($scope.linkActivityIds.indexOf(id), 1)
            //         }
            //     });
            // };
            //
            // $scope.removeGoods = function (id) {
            //     angular.forEach($scope.linkGoods, function (r) {
            //         if (r.id === id) {
            //             $scope.linkGoods.splice($scope.linkGoods.indexOf(r), 1);
            //             $scope.linkGoodsIds.splice($scope.linkGoodsIds.indexOf(id), 1)
            //         }
            //     });
            // };

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
                if (!$scope.article.desc) {
                    Alert.alert("请输入文章摘要", true);
                    return false;
                }

                if (!ResourceChecker.check($scope.resources)) {
                    return false;
                }

                return true;
            }

            $scope.publishTypes = [
                {"id": "0", "name": "手工发布"},
                {"id": "1", "name": "定时发布"}
            ];


            $scope.pushSetting = [
                {"id": "0", "name": "不发送推送消息"},
                {"id": "1", "name": "发送推送消息"}
            ];

            $scope.stripFormat = ResourceTranslator.stripFormat;


            $scope.create = function (type) {
                if (!type) {
                    type = 0;
                }
                type = parseInt(type);
                $log.log('type:' + type);
                $log.info("create article");
                $rootScope.isEditingArticle = true;
                $scope.create.show = true;
                $scope.article = {'resource': [], tags:'', type:type, autoPublishString: '0', needPushString: '0',freeRead:0};
                $rootScope.geo = {};
                $rootScope.address = "";
                $scope.keywordNames = "";
                $scope.keywordIds = [];
                $scope.keywordId = [];
                $scope.topImg = {};
                $scope.hasAudio = false;
                $scope.hasVideo = false;
                $scope.author_name = '';

                // $scope.startDate = newDate();
                $scope.publishDate = newDate();

                // $scope.articleContent = '';
                //读取数据
                // console.log(locals.get("username",""));
                // $scope.articleContent = locals.get("username","");
                // console.log($scope.articleContent);
                $log.log($scope.articleContent);
                delete $rootScope.geo;

                $scope.$watch('article.columns',function(newValue,oldValue, scope){
                    if (newValue){
                        $scope.isFree=true;
                        console.log($scope.isFree);
                    }
                });

                // 编辑内容检查
                function check(publish) {
                    if (!$scope.article.title || $scope.article.title.length == 0) {
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

                    $scope.article.resource = $scope.resources;
                    $scope.article.topImage = previewImg[0];
                    $scope.article.column ={
                        id:$scope.article.columns
                    };

                    $scope.article.activityIds = $scope.linkActivityIds;
                    $scope.article.goodsIds = $scope.linkGoodsIds;
                    $scope.article.LiveIds = $scope.linkLiveIds;

                    $scope.article.type = Number($scope.article.type);
                    $scope.article.geo = $rootScope.geo;

                    $scope.article.ct = parseDate($scope.startDate);
                    $scope.article.pt = parseDate($scope.publishDate);
                    $scope.article.autoPublish = parseInt($scope.article.autoPublishString);
                    $scope.article.needPush = parseInt($scope.article.needPushString);

                    if (!validateArticle()) {
                        return false;
                    }
                    console.log($scope.article.tags);
                    if($scope.article.tags  instanceof Array){
                        var newTags = $scope.article.tags;

                    }else{
                        var tags = $scope.article.tags.replace('，', ',').split(',');
                        var newTags = [];
                        angular.forEach(tags, function (r) {
                            newTags.push(r.trim());
                        });
                    }
                    $scope.article.tags = newTags;
                    $log.info("save article", $scope.article);
                    console.log("保存信息"+$scope.article);
                    $scope.article.publish = publish ? 1 : 0;
                }
                //文章保存
                $scope.save = function (publish) {
                     // check(publish);

                    if (!$scope.article.title || $scope.article.title.length == 0) {
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

                    $scope.article.resource = $scope.resources;
                    $scope.article.topImage = previewImg[0];
                    $scope.article.column ={
                        id:$scope.article.columns
                    };
                    if (!$scope.article.columns) {
                        $scope.article.freeRead = 1;
                    }
                    $scope.article.activityIds = $scope.linkActivityIds;
                    $scope.article.goodsIds = $scope.linkGoodsIds;
                    $scope.article.LiveIds = $scope.linkLiveIds;

                    $scope.article.type = Number($scope.article.type);
                    $scope.article.geo = $rootScope.geo;

                    $scope.article.ct = parseDate($scope.startDate);
                    $scope.article.pt = parseDate($scope.publishDate);
                    $scope.article.autoPublish = parseInt($scope.article.autoPublishString);
                    $scope.article.needPush = parseInt($scope.article.needPushString);

                    if (!validateArticle()) {
                        return false;
                    }
                    console.log($scope.article.tags);
                    if($scope.article.tags  instanceof Array){
                        var newTags = $scope.article.tags;

                    }else{
                        var tags = $scope.article.tags.replace('，', ',').split(',');
                        var newTags = [];
                        angular.forEach(tags, function (r) {
                            newTags.push(r.trim());
                        });
                    }
                    $scope.article.tags = newTags;
                    $log.info("save article", $scope.article);
                    console.log("保存信息"+$scope.article);
                    $scope.article.publish = publish ? 1 : 0;

                    var createCheck = function () {
                        $scope.uploading = true;
                        Article.save($scope.article, function (data) {
                                Alert.alert("操作成功").then(function () {
                                    $scope.create.show = false;
                                    $scope.articlelist.show = true;
                                    $scope.uploading = false;
                                    document.location.reload(true);
                                });
                        }, function (res) {
                            // $scope.updating = true;
                            $scope.uploading = false;
                            $log.info(res.data);
                            Alert.alert("操作失败：" + res.data, true);
                        });
                    };
                    createCheck();
                };

                // 文章创建好预览
                $scope.preview = function (publish) {
                    check(publish);
                    var createCheck = function () {
                    $scope.uploading = true;
                    Article.save($scope.article, function (data) {
                        $scope.uploading =false;
                        var o = data;
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
                                    return Article.get({id: o.id}).$promise;
                                }
                            }
                        });
                    }, function (res) {
                        // $scope.updating = true;
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

                // var timer=$interval(function(){
                //     var str = '';
                // $scope.Keyup = function (articleContent) {
                //     str = articleContent;
                //     console.log(str);
                //     console.log(str.length);
                //
                // if(str.length>20 && (str.indexOf("。")>-1 || str.indexOf("，")>-1)){ /*有内容才保存 且有句号或逗号*/
                //     //存储数据
                //     locals.set("username",str);
                //     console.log("获取数据:"+locals.get("username",""));
                //
                //     var d = new Date();
                //
                //     var YMDHMS = d.getFullYear() + "-" +(d.getMonth()+1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
                //     // spanObj.innerText='（数据保存于: '+YMDHMS+'）';
                //     console.log(YMDHMS);
                //     // setTimeout(function(){ spanObj.innerText=''; },5000);
                // }
                //
                //     console.log('hello world')
                // }
                // },2000);

            };


            $scope.edit = function (idx) {
                var n = $scope.data.data[idx];
                Article.get({id: n.id}, function (o) {
                    $log.info("edit article:", o);
                    $rootScope.geo = o.geo;
                    $rootScope.isEditingArticle = true;
                    $scope.article = o;
                    console.log(o);
                    $scope.editArticleContent = ResourceTranslator.toHtml(o.resource);
                    console.log($scope.editArticleContent);

                    SensitiveReplaceService.replaceArticle(o);

                    $scope.name.author_name = o.user.nick;
                    o.user = o.user.id;

                    $scope.startDate = fromTimestamp(o.ct);
                    $scope.publishDate = fromTimestamp(o.pt);

                    o.category = o.category.id;
                    if (o.column!==null){
                        o.columns = o.column.id;
                    }
                    $scope.edit.show = true;

                    $scope.article.autoPublishString = '' + $scope.article.autoPublish;
                    $scope.article.needPushString = '' + $scope.article.needPush;

                    if (o.tags) {
                        o.tags = o.tags.join(',');
                    } else {
                        o.tags = '';
                    }
                    //todo, why $rootScope
                    if (o.geo && o.geo.name) {
                        $rootScope.address = o.geo.name;
                    }
                    //todo, who use resourceIds ??
                    $scope.resourceIds = [];
                    $scope.hasAudio = false;
                    $scope.hasVideo = false;
                    angular.forEach($scope.article.resource, function (o) {
                        $scope.resourceIds.push(o.id);
                        if (o.tp == 3) {
                            $scope.hasAudio = true;
                        } else if (o.tp == 1) {
                            $scope.hasVideo = true;
                        }
                    });
                    $scope.resources = o.resource;

                    $scope.linkActivityIds = [];
                    $scope.linkActivity = o.activities;
                    angular.forEach(o.activities, function (o) {
                        $scope.linkActivityIds.push(o.id);
                    });

                    $scope.linkGoodsIds = [];
                    $scope.linkGoods = o.goods;
                    angular.forEach(o.goods, function (o) {
                        $scope.linkGoodsIds.push(o.id);
                    });
                    $scope.linkLiveIds = [];
                    $scope.linkLive = o.lives;
                    angular.forEach(o.lives, function (o) {
                        $scope.linkLiveIds.push(o.id);
                    });
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

                    $scope.$watch('article.columns',function(newValue,oldValue, scope){
                        if (newValue){
                            $scope.isFree=true;
                            console.log($scope.isFree);
                        }
                    });

                    // 是否为专题
                        if (o.isTopic == 0){
                            $scope.topic = false;
                        }else{
                            $scope.topic = true;
                        }

                    // 是否为免费
                        if (o.freeRead == 0){
                            $scope.price = false;
                        }else{
                            $scope.price = true;
                        }
                    // 文章编辑检查
                     function updateCheck(publish) {
                         if (!$scope.article.title || $scope.article.title.length == 0) {
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
                             Alert.alert("请设置文章头图", true);
                             return;
                         }
                         $scope.article.topImage = previewImg[0];
                         $scope.article.resource = $scope.resources;
                         $scope.article.column ={
                             id:$scope.article.columns
                         };
                         $scope.article.activityIds = $scope.linkActivityIds;
                         $scope.article.goodsIds = $scope.linkGoodsIds;
                         $scope.article.liveIds = $scope.linkLiveIds;

                         $scope.article.geo = $rootScope.geo;
                         $scope.article.type = Number($scope.article.type);
                         // $scope.article.ct = parseDate($scope.startDate);
                         $scope.article.pt = parseDate($scope.publishDate);
                         $scope.article.autoPublish = parseInt($scope.article.autoPublishString);
                         $scope.article.needPush = parseInt($scope.article.needPushString);
                         $scope.article.publish = publish ? 1 : 0;
                         $log.info("article:", $scope.article);
                         if (!validateArticle()) {
                             return;
                         }
                         if($scope.article.tags  instanceof Array){
                             var newTags = $scope.article.tags;

                         }else{
                             var tags = $scope.article.tags.replace('，', ',').split(',');
                             var newTags = [];
                             angular.forEach(tags, function (r) {
                                 newTags.push(r.trim());
                             });
                         }
                         $scope.article.tags = newTags;

                     }

                    $scope.update = function (publish) {
                        $log.info("update article");
                        // updateCheck(publish);

                        if (!$scope.article.title || $scope.article.title.length == 0) {
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
                            Alert.alert("请设置文章头图", true);
                            return;
                        }
                        $scope.article.topImage = previewImg[0];
                        $scope.article.resource = $scope.resources;
                        $scope.article.column ={
                            id:$scope.article.columns
                        };

                        if (!$scope.article.columns) {
                            $scope.article.freeRead = 1;
                        }

                        $scope.article.activityIds = $scope.linkActivityIds;
                        $scope.article.goodsIds = $scope.linkGoodsIds;
                        $scope.article.liveIds = $scope.linkLiveIds;

                        $scope.article.geo = $rootScope.geo;
                        $scope.article.type = Number($scope.article.type);
                        // $scope.article.ct = parseDate($scope.startDate);
                        $scope.article.pt = parseDate($scope.publishDate);
                        $scope.article.autoPublish = parseInt($scope.article.autoPublishString);
                        $scope.article.needPush = parseInt($scope.article.needPushString);
                        $scope.article.publish = publish ? 1 : 0;
                        $log.info("article:", $scope.article);
                        if (!validateArticle()) {
                            return;
                        }
                        if($scope.article.tags  instanceof Array){
                            var newTags = $scope.article.tags;

                        }else{
                            var tags = $scope.article.tags.replace('，', ',').split(',');
                            var newTags = [];
                            angular.forEach(tags, function (r) {
                                newTags.push(r.trim());
                            });
                        }
                        $scope.article.tags = newTags;

                        var editCheck = function () {
                            $scope.uploading = true;
                            console.log($scope.article);
                            Article.update({id: o.id}, $scope.article, function () {
                                Alert.alert("操作成功").then(function () {
                                    $scope.create.show = false;
                                    $scope.articlelist.show = true;
                                    $scope.uploading = false;
                                    //refresh($scope.grid.page);
                                    document.location.reload(true);

                                });
                            }, function (res) {
                                // $scope.updating = true;
                                $scope.uploading = false;
                                $log.info(res.data);
                                Alert.alert("操作失败：" + res.data, true);
                            });
                        };
                        editCheck();
                    };

                    // 文章编辑好预览
                    $scope.updatePreview = function (publish){
                       updateCheck(publish);
                        var createCheck = function () {
                            $scope.uploading = true;
                            Article.save($scope.article, function (data) {
                                $scope.uploading =false;
                                var o = data;
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
                                            return Article.get({id: o.id}).$promise;
                                        }
                                    }
                                });
                            }, function (res) {
                                // $scope.updating = true;
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

                });
            };

            $scope.listRecommendComment = function (idx) {
                var n = $scope.data.data[idx];
                $scope.currentIndex = idx;
                Article.get({id: n.id}, function (o) {
                    $log.info("recommend comment:", o);
                    $scope.article = o;

                    $scope.commentIds = [];
                    angular.forEach(o.comments, function (c) {
                        $scope.commentIds.push(c.id);
                    });

                    $scope.listRecommendComment.show = true;
                    $scope.cancel = function () {
                        $scope.listRecommendComment.show = false;
                        $scope.articlelist.show = true;
                    };
                });
            };

            $scope.removeRecommendComment = function (comment) {
                ConfirmService.confirm('确定要取消此精华评论吗?').then(function () {
                    Article.removeRecommendComment.get({id: $scope.article.id}, {ids: [comment.id]}, function (o) {
                        $scope.article = o;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("del article:", o);
                ConfirmService.confirm('确定要删除此文章吗?').then(function () {
                    Article.remove({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.view = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("view article:", o);
                $modal.open({
                    templateUrl: 'partials/article/article_view.html',
                    controller: function ($scope, $modalInstance, article) {
                        $scope.article = article;
                       console.log(article);
                        $scope.wordsd = article.sensitive.join('|');
                        SensitiveReplaceService.replaceArticle(article);

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        article: function () {
                            return Article.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.publish = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("publish article:", o);
                ConfirmService.confirm('确定要发布此文章吗?').then(function () {
                    Article.publish.commit({id: o.id}, function () {
                        o.status = 1;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.recommend = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("recommend article:", o);
                ConfirmService.confirm('确定要推荐此文章到feed流吗?').then(function () {
                    Recommend.update({article:{id: o.id},type:1,image:o.cover,title:o.title}, function () {
                        o.recommended = 1;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.recommendBanner = function (idx) {
                var o = $scope.data.data[idx];
                var id = [];
                     id.push(o.id);
                $log.info("recommend article:", o);
                ConfirmService.confirm('确定要推荐此文章到banner吗?').then(function () {
                    Article.batch.get({}, {'ids':id}, function () {
                        o.recommendedBanner = 1;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };


            $scope.cancelRecommend = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("cancel recommend article:", o);
                ConfirmService.confirm('确定要取消推荐此文章吗?').then(function () {
                    Recommend.remove({id: o.id}, function () {
                        o.recommended = 0;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };


            $scope.audit = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("audit article:", o);
                $modal.open({
                    templateUrl: 'partials/article/article_audit.html',
                    controller: function ($scope, $modalInstance, article, page) {
                        $scope.article = article;
                        article.auditInfo = '通过';

                        $scope.article.statusd = 1;
                        $scope.audit = function () {
                            if (!$scope.article.auditInfo) {
                                Alert.alert('必须设置审核意见', true);
                                return;
                            }
                            var postData = {
                                'status': Number($scope.article.statusd),
                                'auditInfo': $scope.article.auditInfo
                            };
                            $log.info("audit:", postData);
                            $log.info("audit article...:", o);
                            Article.check.get({id: article.id}, function (res) {
                                if (res.words.length != 0 && $scope.article.statusd == 1) {
                                    ConfirmService.confirm('文章含有敏感词，确定提交吗?').then(function () {
                                        auditCheck();
                                    });
                                } else {
                                    auditCheck();
                                }
                            }, function (res) {
                                Alert.alert('操作失败' + res.data, true);
                            });
                            var auditCheck = function () {
                                Article.audit.commit({id: article.id}, postData, function () {
                                    Alert.alert('操作成功');
                                    refresh(page);
                                    $modalInstance.close();
                                }, function (res) {
                                    Alert.alert('操作失败:' + res, true);
                                });
                            }
                        };

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        article: function () {
                            return Article.get({id: o.id}).$promise;
                        },
                        page: function () {
                            return $scope.grid.page;
                        }
                    }
                });
            }

        }])
    .controller('DeletedArticleCtrl', ['$scope', '$modal', '$log', 'Alert', 'ConfirmService', 'CONFIG', 'data', 'Article', 'VALID',
        function ($scope, $modal, $log, Alert, ConfirmService, CONFIG, data, Article, VALID) {
            $scope.data = data;
            console.log("cascas");
            $scope.grid = {
                page: 1
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.FALSE};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
                if ($scope.grid.type) {
                    SPEC.tp = $scope.grid.type;
                }
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

            $scope.view = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("view article:", o);
                console.log("cavcqwvq");
                $modal.open({
                    templateUrl: 'partials/article/article_view.html',
                    controller: function ($scope, $modalInstance, article) {
                        $scope.article = article;

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        article: function () {
                            return Article.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.recover = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("recover article:", o);
                ConfirmService.confirm('确定要恢复此文章吗?').then(function () {
                    Article.recover.commit({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

        }]);

/* Controllers */

angular.module('myApp.authorcontrollers', ['ui.bootstrap'])
    .controller('AuthorCtrl', ['$scope', '$log', '$filter', 'Alert', 'ConfirmService', 'ResourceTranslator', 'ResourceTextService', '$modal', 'FileUploader', 'data','category','Author', 'User', 'Resource', 'author_black', 'CONFIG', 'token',
        function ($scope, $log, $filter, Alert, ConfirmService, ResourceTranslator, ResourceTextService, $modal, FileUploader, data,category, Author, User, Resource, author_black, CONFIG, token) {
            $scope.data = data;
            $scope.category = category.data;

            $scope.grid = {
                page: 1
            };

            $scope.authorlist = {
                show: true
            };
            $scope.author_black = author_black;


            var refresh = function (page) {
                var SPEC = {page: page, size: CONFIG.limit, status: 0};
                if ($scope.grid.nick) {
                    SPEC.nick = $scope.grid.nick;
                }

                var d = Author.get(SPEC, function () {
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
                var u = $scope.data.data[idx];
                $log.info("del author:", u);
                ConfirmService.confirm('确定要删除此作者吗?').then(function () {
                    Author.downgrade.update({id: u.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.recover = function (idx) {
                var u = $scope.data.data[idx];
                $log.info("recover author:", u);
                ConfirmService.confirm('确定要恢复此作者吗?').then(function () {
                    Author.recover.update({id: u.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.resetPwd = function (idx) {
                var o = $scope.data.data[idx];
                $modal.open({
                    templateUrl: 'partials/admin/reset_pwd.html',
                    controller: function ($scope, $modalInstance, id) {
                        $scope.passwd = {};
                        $scope.save = function () {
                            if ($scope.passwd.confirmPassword != $scope.passwd.password) {
                                return false;
                            }
                            var SPEC = {'key': 'password', 'val': $scope.passwd.confirmPassword};
                            Author.update({id: id}, SPEC, function () {
                                Alert.alert('修改成功');
                            }, function (res) {
                                Alert.alert('操作失败！' + res, true);
                            })
                        };
                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        id: function () {
                            return o.id;
                        }
                    }
                })
            };

            $scope.edit = function (idx) {
                var o = $scope.data.data[idx];
                $modal.open({
                    templateUrl: 'partials/admin/author_edit.html',
                    controller: function ($scope, $modalInstance, user) {
                        $scope.category = category.data;
                        console.log($scope.category);
                        $log.info("edit user:", user);
                        $scope.authorTypes = [
                            {"id": "0", "name": "个人"},
                            {"id": "1", "name": "机构"}
                        ];
                        $scope.showAuthorType = function() {
                            var text = '点击编辑';
                            $log.log($scope.user.authorTpStr)
                            for (var i = 0; i < $scope.authorTypes.length; ++i) {
                                if ($scope.authorTypes[i].id == $scope.user.authorTpStr) {
                                    text = $scope.authorTypes[i].name;
                                    break;
                                }
                            }

                            return text;
                        };

                        user.authorTpStr = user.authorTp + '';
                        $scope.user = user;
                        user.category = user.category;
                        $scope.userOriginal = {
                            mobile: user.mobile
                        };

                        $scope.showAuthorCategory = function() {
                            var text = '点击编辑';
                            for (var j=0;j<$scope.category.length;++j){
                                if ($scope.user.category){
                                    if ($scope.category[j].id == $scope.user.category.id){

                                        text = $scope.category[j].name;
                                    }
                                }

                            }

                            return text;
                        };
                        // -- upload icon setting begin --//
                        var uploaded = function (imgId) {
                            $log.info("uploaded user img:", imgId);
                            Author.update({id: user.id}, {"key": "icon", "val": imgId}, function () {
                                Alert.alert('操作成功！');
                                Author.get({'id': user.id}, {}, function (u) {
                                    o.icon = u.icon;
                                    $scope.user = u;
                                    $scope.uploading = false;
                                });
                            }, function (res) {
                                Alert.alert('操作失败！' + res, true);
                            });
                        };

                        var up = function () {
                            var opts = {
                                queueLimit: 1,
                                url: '/api/pub/up',
                                alias: 'bin',
                                removeAfterUpload: true
                            };

                            var uploader = new FileUploader(opts);

                            uploader.filters.push({
                                name: 'imageFilter',
                                fn: function (item) {
                                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                                    return '|jpg|png|jpeg|'.indexOf(type) !== -1;
                                }
                            });

                            uploader.onSuccessItem = function (fileItem, data) {
                                if (data.code == 0) {
                                    Alert.alert('上传失败: ' + data, true);
                                    return;
                                }
                                uploaded(data);
                            };
                            uploader.onErrorItem = function (fileItem, res, status) {
                                Alert.alert('上传失败: ' + status + ',  ' + res, true);
                            };

                            return uploader;
                        };
                        $scope.iconUploader = up();

                        $scope.upload = function () {
                            $scope.uploading = true;
                            $scope.iconUploader.uploadAll();
                        };
                        // -- upload icon setting end --//

                        $scope.save = function (name, val) {
                            $log.log(name + ':' + val);
                            if (!val) {
                                return '内容不能为空';
                            }
                            if (name == 'mobile' && !val.match(/^((13|15|18)[0-9]{9})|(145)[0-9]{8}$/)) {
                                return '手机号格式不正确';
                            }
                            var SPEC = {"key": name, "val": val};
                            Author.update({id: user.id}, SPEC, function () {
                                //刷新列表
                                $log.info("save success");
                                console.log(o);
                                if (name == "category"){
                                    o.category = val;
                                }else{
                                    o[name] = val;
                                }
                            }, function () {
                                $log.info("save failed");
                                Alert.alert('手机号码已存在', true);
                                user.mobile = $scope.userOriginal.mobile;
                            });
                        };

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        user: function () {
                            return Author.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.resources = [];
            $scope.resourceIds = [];

            $scope.insertTextarea = function () {
                ResourceTextService.open('', 2000).then(function (txt) {
                    if (txt.length) {
                        Resource.getId.get(function (res) {
                            $scope.resources.push({id: res.id, tp: 2, txt: txt});
                        });
                    }
                });
            };

            var insertPic = function (preview, num) {
                $scope.uploadToken = token.token;
                $log.info("token:", $scope.uploadToken);

                var uploader = new FileUploader({
                    //url: 'http://upload.qiniu.com',
                    queueLimit: num,
                    url: 'http://uptx.qiniu.com',
                    alias: 'file',
                    formData: [
                        {"token": $scope.uploadToken}
                    ]
                });

                // FILTERS
                uploader.filters.push({
                    name: 'customFilter',
                    fn: function () {
                        return this.queue.length < num;
                    }
                });

                uploader.filters.push({
                    name: 'imageFilter',
                    fn: function (item) {
                        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                        return '|jpg|png|jpeg|'.indexOf(type) !== -1;
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
                        fileItem.formData.push({"key": res.id});
                        if (preview == "previewImg") {
                            $scope.previewUploading = true;
                        } else {
                            $scope.uploading = true;
                        }
                        fileItem.upload();
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
                    var type = fileItem.file.type.slice(0, fileItem.file.type.indexOf("/"));
                    $log.info("file type:", type);
                    var tp = 0;
                    if (type != "image") {
                        tp = 1;
                    }
                    var resource = {name: fileItem.file.name, tp: tp, key: response.key, hash: response.hash, source: 1};
                    $log.info('create resource:', resource);
                    Resource.save(resource, function () {
                        $log.info("create resource successfully");
                        if (resource.key) {
                            Resource.batch.get({}, {'ids': [resource.key]}, function (data) {
                                angular.forEach(data.data, function (o) {
                                    var currentIds = [];
                                    angular.forEach($scope.resources, function (r) {
                                        currentIds.push(r.id)
                                    });

                                    if (currentIds.indexOf(o.id) == -1) {
                                        if (preview == "previewImg") {
                                            $log.info(o);
                                            if ($scope.previewImg.length < 1) {
                                                $scope.previewImg.push(o);
                                                $log.info($scope.previewImg);
                                            }
                                        } else {
                                            $scope.resources.push(o);
                                        }
                                    }
                                });
                            });
                        }
                        $log.info($scope.previewImg);
                        if (preview == "previewImg") {
                            $scope.previewUploading = false;
                        } else {
                            $scope.uploading = false;
                        }
                    }, function (res) {
                        if (preview == "previewImg") {
                            $scope.previewUploading = false;
                        } else {
                            $scope.uploading = false;
                        }
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
                return uploader;
            };

            $scope.uploader = insertPic("resource", 50);

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
            };

            $scope.stripFormat = ResourceTranslator.stripFormat;
            $scope.updateDesc = function (idx) {
                var user = $scope.data.data[idx];
                User.get({id: user.id}, function (o) {
                    $log.info("edit user:", o);
                    $scope.user = o;

                    $scope.authorDescContent = ResourceTranslator.toHtml(o.resource);

                    $scope.edit.show = true;

                    $scope.save = function () {
                        $log.info("update user");

                        $scope.user.resource = ResourceTranslator.fromHtml('#content-editor');

                        $scope.uploading = true;
                        Author.desc.update({id: o.id}, $scope.user, function () {
                            Alert.alert("操作成功").then(function () {
                                $scope.authorlist.show = true;
                                $scope.uploading = false;
                                //$scope.authorDescContent = '';
                                //refresh($scope.grid.page);
                                document.location.reload();
                            });
                        }, function (res) {
                            $scope.updating = true;
                            $scope.uploading = false;
                            $log.info(res.data);
                            Alert.alert("操作失败：" + res.data, true);
                        });
                    };

                    $scope.cancel = function () {
                        $scope.authorlist.show = true;
                        $scope.uploading = false;
                    };

                });

            };

            $scope.view = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("view author:", o);
                $modal.open({
                    templateUrl: 'partials/admin/author_view.html',
                    controller: function ($scope, $modalInstance, user) {
                        $scope.user = user;

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        user: function () {
                            return User.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.create = function () {
                $modal.open({
                    templateUrl: 'partials/admin/author_create.html',
                    controller: function ($scope, $modalInstance) {
                        $scope.category = category.data;
                        console.log($scope.category);
                        $scope.user = {"tp": 1, authorTpStr: "1"};
                        $scope.authorTypes = [
                            {"id": "0", "name": "个人"},
                            {"id": "1", "name": "机构"}
                        ];

                        $scope.ids = [];
                        $scope.toggleSelection = function (id) {
                            var idx = $scope.ids.indexOf(id);
                            if (idx > -1) {
                                $scope.ids.splice(idx, 1);
                            } else {
                                $scope.ids.push(id);
                            }
                        };
                        // -- upload icon setting begin --//
                        $scope.reader = new FileReader();   //创建一个FileReader接口
                        // $scope.form = {     //用于绑定提交内容，图片或其他数据
                        //     image:{},
                        // };

                        $scope.img_upload = function(files) {       //单次提交图片的函数
                            // $scope.guid = (new Date()).valueOf();   //通过时间戳创建一个随机数，作为键名使用
                            $scope.reader.readAsDataURL(files[0]);  //FileReader的方法，把图片转成base64
                            $scope.reader.onload = function (ev) {
                                $scope.$apply(function () {
                                    $scope.user = {
                                        icon: ev.target.result,  //接收base64
                                    }
                                });
                            };
                        };

                        var up = function () {
                            var opts = {
                                queueLimit: 1,
                                url: '/api/pub/up',
                                alias: 'bin',
                                removeAfterUpload: true
                            };

                            var uploader = new FileUploader(opts);

                            uploader.filters.push({
                                name: 'imageFilter',
                                fn: function (item) {
                                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                                    return '|jpg|png|jpeg|'.indexOf(type) !== -1;
                                }
                            });

                            uploader.onSuccessItem = function (fileItem, data) {
                                if (data.code == 0) {
                                    Alert.alert('上传失败: ' + data, true);
                                    return;
                                }
                                console.log(fileItem);
                                uploaded(data);
                            };
                            uploader.onErrorItem = function (fileItem, res, status) {
                                Alert.alert('上传失败: ' + status + ',  ' + res, true);
                            };

                            return uploader;
                        };
                        $scope.iconUploader = up();

                        var uploaded = function (tmpId) {
                            $log.info("uploaded tmpId:", tmpId);
                            $scope.user.icon = tmpId;

                            save();
                        };

                        $scope.save = function () {
                            //如果有头像，则先上传头像
                            if ($scope.iconUploader.queue.length) {
                                $scope.iconUploader.uploadAll();
                            } else {
                                save();
                            }
                        };
                        // -- upload icon setting end --//


                        var save = function () {
                            $log.info($scope.user);
                            $scope.user.action = $scope.ids;
                            $scope.user.category = {id: $scope.user.category};
                            $scope.user.authorTp = parseInt($scope.user.authorTpStr);
                            if ($scope.user.confirmPassword != $scope.user.password) {
                                return false;
                            }
                            if (!$scope.user.mobile) {
                                Alert.alert("操作失败：" + '手机号码错误', true);
                                return false;
                            }
                            Author.save($scope.user, function () {
                                Alert.alert("操作成功");
                                //refresh list
                                $modalInstance.dismiss();
                                refresh(1);
                            }, function (res) {
                                $scope.updating = true;
                                var err = "";
                                if (res.data instanceof Array) {
                                    angular.forEach(res.data, function (o) {
                                        err += o.message + ",";
                                    });
                                    Alert.alert("操作失败：" + err, true);
                                } else {
                                    err += res.data;
                                    Alert.alert("操作失败：" + err, true);
                                }
                            });
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        }
                    }
                });
            };
        }
    ]).controller('RecommendAuthorCtrl', ['$scope', '$log', 'Alert', 'ConfirmService', 'UserSelectService', 'User', '$modal', 'data', 'Author', 'CONFIG',
        function ($scope, $log, Alert, ConfirmService, UserSelectService, User, $modal, data, Author, CONFIG) {
            $scope.data = data;

            $scope.cancelRecommend = function (idx) {
                var u = $scope.data[idx];
                $log.info("cancel recommend author:", u);
                ConfirmService.confirm('确定要取消推荐此作者吗?').then(function () {
                    Author.recommendRemove.get({}, {ids: [u.id]}, function () {
                        $scope.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.selectAuthor = function () {
                $scope.authorSelecting = true;

                var ids = [];
                angular.forEach($scope.data, function (r) {
                   ids.push(r.id);
                });

                UserSelectService.open(ids, 1).then(function (selected) {
                    $scope.authorSelecting = false;
                    if (selected) {
                        Author.recommendAdd.get({}, {ids: selected}, function (){
                            Author.recommend.query(function (data) {
                                $scope.data = data;
                            });
                        }, function (res) {
                            Alert.alert("操作失败：" + res.data, true);
                        });
                    }
                }, function () {
                    $scope.authorSelecting = false;
                });
            };
        }
    ]);

/* Controllers */

angular.module('myApp.bannercontrollers', ['ui.bootstrap'])
    .controller('BannerCtrl', ['$scope', '$modal', '$log', 'me', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'Banner', 'data', 'Article', 'Activity', 'Live', 'Ad', 'Topic', 'ArticleSelectService', 'ActivitySelectService', 'LiveSelectService', 'AdSelectService', 'TopicSelectService', '$rootScope','ImageSelectService',
        function ($scope, $modal, $log, me, $state, Alert, ConfirmService, CONFIG, Banner, data, Article, Activity, Live, Ad, Topic, ArticleSelectService, ActivitySelectService, LiveSelectService, AdSelectService, TopicSelectService, $rootScope,ImageSelectService) {

            $scope.data = data;
            $scope.origData = data.slice(0, data.length);

            $scope.changed = false;

            $scope.bannerlist = {
                show: true
            };

            function getId(o) {
                if (o.type == 0) {
                    return o.article.id;
                } else if (o.type == 1) {
                    return o.activity.id;
                } else if (o.type == 2) {
                    return o.topic.id;
                }
                return '';
            }

            Array.prototype.contains = function(v) {
                for (var i = 0; i < this.length; ++i) {
                    if (this[i] == v)
                        return true;
                }
                return false;
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
                        }else{
                            Alert.alert("该文章已存在", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Article.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                               var o = {type: 0, article: a};
                                $scope.data.push(o);
                                $scope.changed = true;
                            });
                            $log.log($scope.data);
                        });
                    }
                }, function () {
                    $scope.articleSelecting = false;
                });
            };

            $scope.selectActivity = function () {
                var activityIds = [];
                angular.forEach($scope.data,  function (r) {
                    if (r.type == 1) {
                        activityIds.push(r.activity.id);
                    }
                });

                $scope.activitySelecting = true;
                ActivitySelectService.open([], 1).then(function (selected) {
                    $scope.activitySelecting = false;

                    var ids = [];
                    angular.forEach(selected, function (id) {
                        if (!activityIds.contains(id)) {
                            ids.push(id);
                        }else{
                            Alert.alert("该活动已存在", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Activity.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 1, activity: a};
                                $scope.data.push(o);
                                $scope.changed = true;
                            });
                        });
                    }
                }, function () {
                    $scope.activitySelecting = false;
                });
            };

            $scope.selectLive = function () {
                var liveIds = [];
                angular.forEach($scope.data,  function (r) {
                    if (r.type == 3) {
                        liveIds.push(r.live.id);
                    }
                });

                $scope.liveSelecting = true;
                LiveSelectService.open([], 1).then(function (selected) {
                    $scope.liveSelecting = false;

                    var ids = [];
                    angular.forEach(selected, function (id) {
                        if (!liveIds.contains(id)) {
                            ids.push(id);
                        }else{
                            Alert.alert("该连线已存在", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Live.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 3, live: a};
                                $scope.data.push(o);
                                $scope.changed = true;
                            });
                        });
                    }
                }, function () {
                    $scope.liveSelecting = false;
                });
            };

            $scope.selectAd = function () {
                var adIds = [];
                angular.forEach($scope.data,  function (r) {
                    if (r.type == 4) {
                        adIds.push(r.ad.id);
                    }
                });

                $scope.adSelecting = true;
                AdSelectService.open([], 1).then(function (selected) {
                    $scope.adSelecting = false;

                    var ids = [];
                    angular.forEach(selected, function (id) {
                        if (!adIds.contains(id)) {
                            ids.push(id);
                        }else{
                            Alert.alert("该广告已存在", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Ad.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 4, ad: a};
                                $scope.data.push(o);
                                $scope.changed = true;
                            });
                        });
                    }
                }, function () {
                    $scope.adSelecting = false;
                });
            };

            $scope.selectTopic = function () {
                var topicIds = [];
                angular.forEach($scope.data,  function (r) {
                    if (r.type == 2) {
                        topicIds.push(r.topic.id);
                    }
                });

                $scope.topicSelecting = true;
                TopicSelectService.open([], 1).then(function (selected) {
                    $scope.topicSelecting = false;

                    var ids = [];
                    angular.forEach(selected, function (id) {
                        if (!topicIds.contains(id)) {
                            ids.push(id);
                        }else{
                            Alert.alert("该专题已存在", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Topic.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 2, topic: a};
                                $scope.data.push(o);
                                $scope.changed = true;
                            });
                        });
                    }
                }, function () {
                    $scope.topicSelecting = false;
                });
            };

            $scope.sortOptions = {
                //restrict move across backlogs. move only within backlog.
                accept: function (sourceItemHandleScope, destSortableScope) {
                },
                itemMoved: function (event) {
                },
                orderChanged: function (event) {
                    $scope.changed = true;
                },
                containment: '#board'
            };

            $scope.removeBanner = function (index) {
                if (index < 0 || index >= $scope.data.length)
                    return;

                $scope.data.splice(index, 1);
            };

            $scope.bannerImage = [];
            $scope.selectTopImage = function (index) {
                $scope.bannerImage = [];
                var t= $scope.data[index];
                if (t.type ==0){
                    ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                        .then(function (o) {
                            if (!o) {
                                return;
                            }
                            $scope.bannerImage.push(o);

                            var bannerImage = [];
                            angular.forEach($scope.bannerImage, function (r) {
                                if (r.tp == 0 && bannerImage.length < 1) {
                                    bannerImage.push(r);
                                }
                            });
                            $scope.data[index].article.bannerImage = bannerImage[0];
                        });
                }else if (t.type ==1){
                    ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                        .then(function (o) {
                            if (!o) {
                                return;
                            }
                            $scope.bannerImage.push(o);

                            var bannerImage = [];
                            angular.forEach($scope.bannerImage, function (r) {
                                if (r.tp == 0 && bannerImage.length < 1) {
                                    bannerImage.push(r);
                                }
                            });
                            $scope.data[index].activity.bannerImage = bannerImage[0];
                        });
                }else  if (t.type ==2){
                    ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                        .then(function (o) {
                            if (!o) {
                                return;
                            }
                            $scope.bannerImage.push(o);

                            var bannerImage = [];
                            angular.forEach($scope.bannerImage, function (r) {
                                if (r.tp == 0 && bannerImage.length < 1) {
                                    bannerImage.push(r);
                                }
                            });
                            $scope.data[index].topic.bannerImage = bannerImage[0];
                        });
                }else if (t.type ==3){
                    ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                        .then(function (o) {
                            if (!o) {
                                return;
                            }
                            $scope.bannerImage.push(o);

                            var bannerImage = [];
                            angular.forEach($scope.bannerImage, function (r) {
                                if (r.tp == 0 && bannerImage.length < 1) {
                                    bannerImage.push(r);
                                }
                            });
                            $scope.data[index].live.bannerImage = bannerImage[0];
                        });
                }else  if (t.type ==4){
                    ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                        .then(function (o) {
                            if (!o) {
                                return;
                            }
                            $scope.bannerImage.push(o);

                            var bannerImage = [];
                            angular.forEach($scope.bannerImage, function (r) {
                                if (r.tp == 0 && bannerImage.length < 1) {
                                    bannerImage.push(r);
                                }
                            });
                            $scope.data[index].ad.bannerImage = bannerImage[0];
                        });
                }

            };


            $scope.edit = {
                show: false
            };

            function validateArticle() {
                var imageCount = 0;

                angular.forEach($scope.data, function (r) {
                    if (r.type==0 && r.article.bannerImage) {
                        imageCount++;
                    }else if (r.type==1 && r.activity.bannerImage){
                        imageCount++;
                    }else if (r.type==2 && r.topic.bannerImage){
                        imageCount++;
                    }else if (r.type==3 && r.live.bannerImage){
                        imageCount++;
                    }else if (r.type==4 && r.ad.bannerImage){
                        imageCount++;
                    }
                });
                if (imageCount <$scope.data.length) {
                    Alert.alert("头图不能为空", true);
                    return false;
                }

                if ($scope.data.length==0) {
                    Alert.alert("无推荐内容", true);
                    return false;
                }

                return true;
            };

            $scope.editBanner = function () {
                $scope.edit.show = true;
                $scope.save = function () {
                    var ids = [];
                    if (!validateArticle()) {
                        return;
                    }
                    angular.forEach($scope.data, function(o){
                        if (o.type == 0) {
                            ids.push({type: o.type, id: o.article.id,imageId:o.article.bannerImage.id});
                        } else if (o.type == 1) {
                            ids.push({type: o.type, id: o.activity.id,imageId:o.activity.bannerImage.id});
                        } else if (o.type == 2) {
                            ids.push({type: o.type, id: o.topic.id,imageId:o.topic.bannerImage.id});
                        } else if (o.type == 3) {
                            ids.push({type: o.type, id: o.live.id,imageId:o.live.bannerImage.id});
                        } else if (o.type == 4) {
                            ids.push({type: o.type, id: o.ad.id,imageId:o.ad.bannerImage.id});
                        }
                    });
                    $log.log(ids);
                    Banner.save({ids: ids}, function () {
                        Alert.alert("操作成功").then(function () {
                            $scope.edit.show = false;
                            $scope.bannerlist.show = true;
                            $scope.upading = false;
                            $scope.origData = $scope.data.slice(0, $scope.data.length);
                            $scope.changed = false;
                        });
                    }, function (res) {
                        $scope.updating = true;
                        $log.info(res.data);
                        Alert.alert("操作失败：" + res.data, true);
                    });
                };

                $scope.cancel = function () {
                    $scope.edit.show = false;
                    $scope.bannerlist.show = true;
                    $scope.updating = false;
                    $scope.changed = false;
                    $scope.data = $scope.origData.slice(0, $scope.origData.length);
                };
            };

        }]);

/* Controllers */

angular.module('myApp.categorycontrollers', ['ui.bootstrap'])
    .controller('CategoryCtrl', ['$scope', '$stateParams', '$log', 'Alert', 'ConfirmService', 'data', '$modal', 'Category', 'CONFIG',
        function ($scope, $stateParams, $log, Alert, ConfirmService, data, $modal, Category, CONFIG) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: CONFIG.limit};
                if ($scope.grid.name) {
                    SPEC.name = $scope.grid.name;
                }

                var d = Category.get(SPEC, function () {
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

            $scope.create = function () {
                $modal.open({
                    templateUrl: 'partials/category/category_create.html',
                    controller: function ($scope, $modalInstance) {
                        $scope.category = {};
                        $scope.save = function () {
                            if (!$scope.category.name) {
                                Alert.alert("名称不能为空", true);
                                return;
                            }
                            Category.save($scope.category, function () {
                                Alert.alert("操作成功");
                                //refresh list
                                refresh(1);
                                $modalInstance.close();
                            }, function (res) {
                                console.log(res);
                                Alert.alert("操作失败：" + '名称已存在', true);
                            });
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        }
                    }
                })
            };

            $scope.edit = function (idx) {
                var o = $scope.data.data[idx];
                $modal.open({
                    templateUrl: 'partials/category/category_edit.html',
                    controller: function ($modalInstance, $scope, category) {
                        $scope.category = category;
                        $scope.categoryOriginal = {
                            name: category.name
                        };
                        $log.info(category);
                        $scope.save = function () {
                            Category.update({id: category.id}, $scope.category, function () {
                                $log.info("save success");
                                $modalInstance.dismiss();
                            }, function (res) {
                                Alert.alert("操作失败：" + '名称已存在', true);
                                o.name = $scope.categoryOriginal.name;
                            });

                        };
                        $scope.ok = function () {
                            $modalInstance.dismiss();
                        }
                    },
                    resolve: {
                        category: function () {
                            return o;
                        }

                    }
                })
            };

            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                ConfirmService.confirm('确定要删除此分类吗?').then(function () {
                    Category.remove({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res, true);
                    });
                });
            }
        }]);

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

/* Controllers */

angular.module('myApp.controllers', ['ui.bootstrap'])
    .controller('AppCtrl', ['$rootScope', '$scope', '$state', 'User', 'Alert', 'AUTH_EVENTS',
        function ($rootScope, $scope, $state, User, Alert, AUTH_EVENTS) {
            $scope.setMe = function (me) {
                $rootScope.me = me;
            };
            $scope.$on(AUTH_EVENTS.loginNeeded, function () {
                $state.go("login");
            });
            $scope.$on(AUTH_EVENTS.loginSuccess, function () {
                User.me.get(function (me) {
                    if (me.tp == 3) {
                        $state.go("home.editor");
                    } else if (me.tp == 1) {
                        $state.go("home.activity");
                    } else {
                        $state.go("home.article");
                    }
                })
            });
            $scope.$on(AUTH_EVENTS.httpForbidden, function () {
                //Alert.alert('权限不足，禁止操作', true);

                User.me.get(function (me) {
                    if (me.tp == 3) {
                        $state.go("home.editor");
                    } else if (me.tp == 1) {
                        $state.go("home.activity");
                    } else {
                        $state.go("home.article");
                    }
                })
            });
        }])
    .controller('IndexCtrl', ['$scope', '$state',
        function ($scope, $state) {
            if ($scope.me.tp == 1){
                $state.go('home.activity');
            } else {
                $state.go('home.article');
            }
        }])
    .controller('LoginCtrl', ['$scope', '$rootScope', 'AUTH_EVENTS', 'AuthService', 'Alert',
        function ($scope, $rootScope, AUTH_EVENTS, AuthService, Alert) {
            $scope.credentials = {};

            $scope.login = function () {
                $scope.loading = true;
                AuthService.login($scope.credentials).success(function () {
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                    $scope.loading = false;
                }).error(function () {
                    $scope.loading = false;
                    Alert.alert('登录失败', true);
                });
            };
        }])
    .controller('HomeCtrl', ['$scope', '$rootScope', '$interval', 'AUTH_EVENTS', 'AuthService', 'me', 'Badge', 'badge',
        function ($scope, $rootScope, $interval, AUTH_EVENTS, AuthService, me, Badge, badge) {
            if (!$scope.me) {
                $scope.setMe(me);
            }
            $scope.logout = function () {
                var cb = function () {
                    $scope.setMe(null);
                    $rootScope.$broadcast(AUTH_EVENTS.loginNeeded);
                };
                AuthService.logout().success(cb).error(cb);
            };

            $scope.badge = badge;
            $interval(function () {
                Badge.get(function (res) {
                    $scope.badge = res;
                });
            }, 5000);

            $rootScope.menuOpen = true;
        }])
    .controller('AboutCtrl', ['$scope', '$stateParams', '$log', 'Alert', 'ConfirmService', 'CONFIG', 'data', 'About',
        function ($scope, $stateParams, $log, Alert, ConfirmService, CONFIG, data, About) {
            $scope.data = data;
            $scope.save = function (name, val) {
                var SPEC = {"key": name, "val": val};
                About.update(SPEC, function () {
                    Alert.alert("操作成功");
                }, function (res) {
                    Alert.alert("操作失败：" + res, true);
                })
            };
        }])
    .controller('AdCtrl', ['$scope', '$stateParams', '$log', 'Alert', "Resource", 'ConfirmService', 'CONFIG', 'data', 'Ad', 'FileUploader',
        function ($scope, $stateParams, $log, Alert, Resource, ConfirmService, CONFIG, data, Ad, FileUploader) {
            if (!data) {
                data = {}
            }
            $scope.ad = data;

            // -- upload icon setting begin --//
            var uploaded = function (imgId) {
                Resource.get({id: imgId}, function (r){
                    $scope.ad.image = r.url;
                    $scope.uploading = false;
                    $log.info(data.image);
                });
            };

            var up = function () {
                var opts = {
                    queueLimit: 1,
                    url: '/api/pub/up',
                    alias: 'bin',
                    removeAfterUpload: true
                };

                var uploader = new FileUploader(opts);

                uploader.filters.push({
                    name: 'imageFilter',
                    fn: function (item) {
                        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                        return '|jpg|png|jpeg|'.indexOf(type) !== -1;
                    }
                });

                uploader.onAfterAddingFile = function (fileItem) {
                    console.info('onAfterAddingFile', fileItem);
                    $scope.uploading = true;
                    fileItem.upload();
                };

                uploader.onSuccessItem = function (fileItem, data) {
                    if (data.code == 0) {
                        Alert.alert('上传失败: ' + data, true);
                        return;
                    }
                    uploaded(data);
                };
                uploader.onErrorItem = function (fileItem, res, status) {
                    Alert.alert('上传失败: ' + status + ',  ' + res, true);
                };

                return uploader;
            };
            $scope.adUploader = up();

            $scope.upload = function () {
                $scope.uploading = true;
                $scope.adUploader.uploadAll();
            };

            $scope.save = function (){
                if (!$scope.ad.image) {
                    Alert.alert("请选择广告图");
                    return
                }

                ConfirmService.confirm('广告保存后，将自动发布给所有用户，确定保存吗?').then(function () {
                    Ad.save($scope.ad, function () {
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.del = function (){
                ConfirmService.confirm('确定要移除广告吗?').then(function () {
                    Ad.remove({}, function () {
                        Alert.alert("操作成功");
                        $scope.ad = {};
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            }

        }])
    .controller('MsgCtrl', ['$scope', '$modal', '$log', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'User', 'Msg', 'data', '$rootScope',
        function ($scope, $modal, $log, $state, Alert, ConfirmService, CONFIG, User, Msg, data, $rootScope) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };
            $log.info('here');
            $log.info(data);

            var refresh = function (page) {
                $log.info('refresh');
                var SPEC = {page: page, size: CONFIG.limit};
                if ($scope.grid.name) {
                    SPEC.name = $scope.grid.name;
                }
                var d = MsgRecord.get(SPEC, function () {
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
        }])
    .controller('SettingCtrl', ['$scope', '$log', 'Alert', 'me', 'User', 'FileUploader',
        function ($scope, $log, Alert, me, User, FileUploader) {
//            -- upload icon setting begin --//
            $scope.meOriginal = {
                nick: me.nick
            };
            $scope.tab = function(id) {
                console.log('-------', id);
                $scope.tabId = id;
            };
            var uploaded = function (imgId) {
                $log.info("uploaded user img:", imgId);
                User.me.update({id: me.id}, {"key": "icon", "val": imgId}, function () {
                    Alert.alert('操作成功！');
                    User.me.get({'id': me.id}, {}, function (u) {
                        me.icon = u.icon;
                        me = u;
                        $scope.uploading = false;
                    });
                }, function (res) {
                    Alert.alert('操作失败！' + res, true);
                });
            };

            var up = function () {
                var opts = {
                    queueLimit: 1,
                    url: '/api/pub/up',
                    alias: 'bin',
                    removeAfterUpload: true
                };

                var uploader = new FileUploader(opts);

                uploader.filters.push({
                    name: 'imageFilter',
                    fn: function (item) {
                        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                        return '|jpg|png|jpeg|'.indexOf(type) !== -1;
                    }
                });

                uploader.onSuccessItem = function (fileItem, data) {
                    if (data.code == 0) {
                        Alert.alert('上传失败: ' + data, true);
                        return;
                    }
                    uploaded(data);
                };
                uploader.onErrorItem = function (fileItem, res, status) {
                    Alert.alert('上传失败: ' + status + ',  ' + res, true);
                };

                return uploader;
            };
            $scope.iconUploader = up();

            $scope.upload = function () {
                $scope.uploading = true;
                $scope.iconUploader.uploadAll();
            };
            // -- upload icon setting end --//
            $scope.save = function (name, val) {
                if (!val) {
                    return '内容不能为空';
                }
                if (name == 'mobile' && !val.match(/^((13|15|18)[0-9]{9})|(145)[0-9]{8}$/)) {
                    return '手机号码错误';
                }
                var SPEC = {"key": name, "val": val};
                $log.info(me.id);
                User.me.update({id: me.id}, SPEC, function () {
                    Alert.alert('操作成功');
                }, function (res) {
                    me.nick = $scope.meOriginal.nick;
                    Alert.alert('操作失败: ' + res.data, true);
                });
            };

            $scope.passwd = {};

            $scope.changePasswd = function () {
                $log.info("passwd:", $scope.passwd);
                if (!$scope.passwd.oldPassword) {
                    Alert.alert('原始密码不能为空', true);
                    return;
                }
                if (!$scope.passwd.newPassword) {
                    Alert.alert('新密码不能为空', true);
                    return;
                }
                if (!$scope.passwd.confirmPassword) {
                    Alert.alert('确认密码不能为空', true);
                    return;
                }
                if ($scope.passwd.confirmPassword != $scope.passwd.newPassword) {
                    Alert.alert('确认密码和新密码不一致', true);
                    return;
                }
                User.me.passwd.update($scope.passwd, function () {
                    Alert.alert('操作成功');
                    $scope.tabId = false;
                }, function (res) {
                    $log.info('err', res);
                    Alert.alert('操作失败: ' + res.data, true);
                });
            };

        }])
    .controller('MediaCtrl', ['$scope', '$log', 'resource', 'goods','lives','articles','activities',
        function ($scope, $log, resource, goods,lives,articles,activities) {
            $log.log('resource' + resource);
            $log.log('goods' + goods);
            $log.log('lives' + lives);
            $log.log('articles' + articles);
            if (resource) {
                $scope.resource = resource;
            }else if(lives){
                $scope.resource = {id:'', tp: 8, lives: lives, gid:lives.id};
            }else if(articles){
                $scope.resource = {id:'', tp: 6, articles: articles, gid: articles.id};
            } else if(activities){
                $scope.resource = {id:'', tp: 7, activities: activities, gid:activities.id};
            } else if (goods){
                $scope.resource = {id: '', tp: 4, goods: goods, gid:goods.id};
            }
        }])
    .controller('TestEditorCtrl', ['$scope', '$sce', '$log', 'ResourceTranslator', 'article',
        function ($scope, $sce, $log, ResourceTranslator, article) {
            var text = ResourceTranslator.toHtml(article.data[0].resource);
            $scope.text = text;

            $scope.ok = function () {
                var resources = ResourceTranslator.fromHtml('#this-editor');
                $log.log(resources);
            };

            $scope.stripFormat = ResourceTranslator.stripFormat;

            function test(s) {
                $log.log('-------------------------------');
                $(s).each(function (index) {
                    $log.log($(this).text());
                    $(this).contents().each(function (i) {
                        $log.log(this);
                    });
                });
            }

            $log.log(ResourceTranslator.stripFormat('aaa\nbbbb\r\ncccc\rddddd'));
            $log.log(ResourceTranslator.stripFormat('<div>this is a test</div>'));
            $log.log(ResourceTranslator.stripFormat('<div>haha<p>test</p>bbb</p>aaaaa</div>'));
            $log.log(ResourceTranslator.stripFormat('<div><iframe></iframe></div>'));
            $log.log(ResourceTranslator.stripFormat('<div><iframe class="ta-app-media ta-insert-video"></iframe></div>'));
            $log.log(ResourceTranslator.stripFormat('<div><iframe class="ta-app-media ta-insert-video"></iframe><h6>测试视频</h6></div>'));
            $log.log(ResourceTranslator.stripFormat('<h1>标题</h1><div>正文</div>'));
            $log.log(ResourceTranslator.stripFormat('<p>aaa<span>bbbb</span>cccc<span>eeeeeeeee</span>ddddd</p>'));

            var s = '<p><a></p><p><area></p><p><audio></p><p><base></p><p><body></p><p><blockquote></p><p><button></p><p><canvas></p><p><col></p><p><colgroup></p><p><datalist></p><p><del></p><p><details></p><p><dialog></p><p><embed></p><p><fieldset></p><p><form></p><p><frame></p><p><frameset></p><p><iframe></p><p><img></p><p><ins></p><p><input> button</p><p><input> checkbox</p><p><input> color</p><p><input> date</p><p><input> datetime</p><p><input> datetime-local</p><p><input> email</p><p><input> file</p><p><input> hidden</p><p><input> image</p><p><input> month</p><p><input> number</p><p><input> password</p><p><input> range</p><p><input> radio</p><p><input> reset</p><p><input> search</p><p><input> submit</p><p><input> text</p><p><input> time</p><p><input> url</p><p><input> week</p><p><keygen></p><p><label></p><p><legend></p><p><li></p><p><link></p><p><map></p><p><menu></p><p><menuitem></p><p><meta></p><p><meter></p><p><object></p><p><ol></p><p><optgroup></p><p><option></p><p><param></p><p><progress></p><p><q></p><p><script></p><p><select></p><p><source></p><p><style></p><p><table></p><p><td></p><p><th></p><p><tr></p><p><textarea></p><p><time></p><p><title></p><p><track></p><p><video></p><p>建站手册</p><p>网站构建</p><p>万维网联盟 (W3C)</p><p>浏览器信息</p><p>网站品质</p><p>语义网</p><p>职业规划</p><p>网站主机</p><p>关于 W3School</p><p>帮助 W3School</p><h1>HTML DOM className 属性</h1><p>HTML DOM Element 对象</p><p>定义和用法</p><p>className 属性设置或返回元素的 class 属性。</p><p>语法</p><p>HTMLElementObject.className=classname</p><p>浏览器支持</p><p>IE</p><p>Firefox</p><p>Chrome</p><p>Safari</p><p>Opera</p><p>所有主流浏览器都支持 className 属性。</p><p>实例</p><p>返回 body 元素的 class 属性：</p><p><html></p><p> <body id="myid" class="mystyle"></p><p></p><p> <script></p><p> var x=document.getElementsByTagName("body")[0];</p><p> document.write("Body CSS class: " + x.className);</p><p> document.write("<br>");</p><p> document.write("An alternate way: ");</p><p> document.write(document.getElementById("myid").className);</p><p> </script></p><p></p><p> </body></p><p></html> </p><p></p><p>输出：</p><p>Body CSS class: mystyle</p><p>An alternate way: mystyle </p><p></p><p>亲自试一试</p><p>HTML DOM Element 对象</p><p>SEARCH:</p><p> </p><p>JavaScript 参考手册</p><p>JavaScript 实例</p><p>JavaScript 测验</p><p>W3School 提供的内容仅用于培训。我们不保证内容的正确性。通过使用本站内容随之而来的风险与本站无关。W3School 简体中文版的所有内容仅供测试，对任何法律问题及风险不承担任何责任。</p><p>当使用本站时，代表您已接受了本站的使用条款和隐私条款。版权所有，保留一切权利。 赞助商：上海赢科投资有限公司。 蒙ICP备06004630号</p>';
            $log.log(s);
            $log.log(ResourceTranslator.stripFormat(s));


        }]);

/* Directives */


angular.module('myApp.directives', []).
    directive('appVersion', ['version', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    }])
    .directive('popImg', ['$document', function ($document) {
        return function (scope, elm, attr) {
            elm.bind('mouseenter', function (event) {
                elm.parent()[0].children[1].style.display = 'block';
            });
            elm.bind('mouseout', function (event) {
                elm.parent()[0].children[1].style.display = 'none';
            });
        };
    }])
    .directive('dateFormat', [function() {

    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            function formatter(value) {
                console.log(value);
                var d = new Date(value);
                return {
                    date: d,
                    time: d,
                    minDate: new Date(),
                    opened: false
                }
            }


            function parser() {
                return ctrl.$modelValue;
            }
            console.log(formatter);

            ctrl.$formatters.push(formatter);
            ctrl.$parsers.unshift(parser);

        }
    };
    }]);

/* Controllers */

angular.module('myApp.editorcontrollers', ['ui.bootstrap'])
    .controller('EditorCtrl', ['$scope', '$log', 'Alert', 'ConfirmService', '$modal', 'FileUploader', 'data', 'Editor', 'editor_black', 'CONFIG',
        function ($scope, $log, Alert, ConfirmService, $modal, FileUploader, data, Editor, editor_black, CONFIG) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            $scope.editor_black = editor_black;

            var refresh = function (page) {
                var SPEC = {page: page, size: CONFIG.limit, status: 0};
                if ($scope.grid.nick) {
                    SPEC.nick = $scope.grid.nick;
                }

                var d = Editor.get(SPEC, function () {
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
                var u = $scope.data.data[idx];
                $log.info("del editor:", u);
                ConfirmService.confirm('确定要删除此编辑吗?').then(function () {
                    Editor.remove({id: u.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.recover = function (idx) {
                var u = $scope.data.data[idx];
                $log.info("recover editor:", u);
                ConfirmService.confirm('确定要恢复此编辑吗?').then(function () {
                    Editor.recover.update({id: u.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.resetPwd = function (idx) {
                var o = $scope.data.data[idx];
                $modal.open({
                    templateUrl: 'partials/admin/reset_pwd.html',
                    controller: function ($scope, $modalInstance, id) {
                        $scope.passwd = {};
                        $scope.save = function () {
                            if ($scope.passwd.confirmPassword != $scope.passwd.password) {
                                return false;
                            }
                            var SPEC = {'key': 'password', 'val': $scope.passwd.confirmPassword};
                            Editor.update({id: id}, SPEC, function () {
                                Alert.alert('修改成功');
                            }, function (res) {
                                Alert.alert('操作失败！' + res, true);
                            })
                        };
                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        id: function () {
                            return o.id;
                        }
                    }
                })
            };

            $scope.edit = function (idx) {
                var o = $scope.data.data[idx];
                $modal.open({
                    templateUrl: 'partials/admin/editor_edit.html',
                    controller: function ($scope, $modalInstance, user) {
                        $log.info("edit user:", user);
                        $scope.user = user;
                        $scope.userOriginal = {
                            mobile: user.mobile
                        };

                        // -- upload icon setting begin --//
                        var uploaded = function (imgId) {
                            $log.info("uploaded user img:", imgId);
                            Editor.update({id: user.id}, {"key": "icon", "val": imgId}, function () {
                                Alert.alert('操作成功！');
                                Editor.get({'id': user.id}, {}, function (u) {
                                    o.icon = u.icon;
                                    $scope.user = u;
                                    $scope.uploading = false;
                                });
                            }, function (res) {
                                Alert.alert('操作失败！' + res, true);
                            });
                        };

                        var up = function () {
                            var opts = {
                                queueLimit: 1,
                                url: '/api/pub/up',
                                alias: 'bin',
                                removeAfterUpload: true
                            };

                            var uploader = new FileUploader(opts);

                            uploader.filters.push({
                                name: 'imageFilter',
                                fn: function (item) {
                                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                                    return '|jpg|png|jpeg|'.indexOf(type) !== -1;
                                }
                            });

                            uploader.onSuccessItem = function (fileItem, data) {
                                if (data.code == 0) {
                                    Alert.alert('上传失败: ' + data, true);
                                    return;
                                }
                                uploaded(data);
                            };
                            uploader.onErrorItem = function (fileItem, res, status) {
                                Alert.alert('上传失败: ' + status + ',  ' + res, true);
                            };

                            return uploader;
                        };
                        $scope.iconUploader = up();

                        $scope.upload = function () {
                            $scope.uploading = true;
                            $scope.iconUploader.uploadAll();
                        };
                        // -- upload icon setting end --//

                        $scope.save = function (name, val) {
                            if (!val) {
                                return '内容不能为空';
                            }
                            if (name == 'mobile' && !val.match(/^((13|15|18)[0-9]{9})|(145)[0-9]{8}$/)) {
                                return '手机号格式不正确';
                            }
                            var SPEC = {"key": name, "val": val};
                            Editor.update({id: user.id}, SPEC, function () {
                                //刷新列表
                                $log.info("save success");
                                o[name] = val;
                            }, function () {
                                $log.info("save failed");
                                Alert.alert('手机号码已存在', true);
                                user.mobile = $scope.userOriginal.mobile;
                            });
                        };

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        user: function () {
                            return Editor.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.create = function () {
                $modal.open({
                    templateUrl: 'partials/admin/editor_create.html',
                    controller: function ($scope, $modalInstance) {
                        $scope.user = {"tp": 2};
                        $scope.ids = [];
                        $scope.toggleSelection = function (id) {
                            var idx = $scope.ids.indexOf(id);
                            if (idx > -1) {
                                $scope.ids.splice(idx, 1);
                            } else {
                                $scope.ids.push(id);
                            }
                        };
                        // -- upload icon setting begin --//
                        var up = function () {
                            var opts = {
                                queueLimit: 1,
                                url: '/api/pub/up',
                                alias: 'bin',
                                removeAfterUpload: true
                            };

                            var uploader = new FileUploader(opts);

                            uploader.filters.push({
                                name: 'imageFilter',
                                fn: function (item) {
                                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                                    return '|jpg|png|jpeg|'.indexOf(type) !== -1;
                                }
                            });

                            uploader.onSuccessItem = function (fileItem, data) {
                                if (data.code == 0) {
                                    Alert.alert('上传失败: ' + data, true);
                                    return;
                                }
                                uploaded(data);
                            };
                            uploader.onErrorItem = function (fileItem, res, status) {
                                Alert.alert('上传失败: ' + status + ',  ' + res, true);
                            };

                            return uploader;
                        };
                        $scope.iconUploader = up();

                        var uploaded = function (tmpId) {
                            $log.info("uploaded tmpId:", tmpId);
                            $scope.user.icon = tmpId;
                            save();
                        };

                        $scope.save = function () {
                            //如果有头像，则先上传头像
                            if ($scope.iconUploader.queue.length) {
                                $scope.iconUploader.uploadAll();
                            } else {
                                save();
                            }
                        };
                        // -- upload icon setting end --//


                        var save = function () {
                            $log.info($scope.ids);
                            $scope.user.action = $scope.ids;
                            if ($scope.user.confirmPassword != $scope.user.password) {
                                return false;
                            }
                            if (!$scope.user.mobile) {
                                Alert.alert("操作失败：" + '手机号码错误', true);
                                return false;
                            }
                            Editor.save($scope.user, function () {
                                Alert.alert("操作成功");
                                //refresh list
                                refresh(1);
                            }, function (res) {
                                $scope.updating = true;
                                var err = "";
                                if (res.data instanceof Array) {
                                    angular.forEach(res.data, function (o) {
                                        err += o.message + ",";
                                    });
                                    Alert.alert("操作失败：" + err, true);
                                } else {
                                    err += res.data;
                                    Alert.alert("操作失败：" + err, true);
                                }
                            });
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        }
                    }
                });
            };
        }
    ]);

/* Controllers */

angular.module('myApp.feedbackcontrollers', ['ui.bootstrap'])
    .controller('FeedbackCtrl', ['$scope', '$modal', '$log', '$state', 'CONFIG', 'Feedback', 'data', '$rootScope',
        function ($scope, $modal, $log, $state, CONFIG, Feedback, data, $rootScope) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: 20};
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Feedback.get(SPEC, function () {
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
        }]);

/* Filters */

angular.module('myApp.filters', []).
    filter('interpolate', ['version', function (version) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        };
    }])
    .filter('keywordCategory', function () {
        return function (category) {
            var text;
            if (category == 0) {
                text = "明星";
            } else if (category == 1) {
                text = "新闻事件";
            } else {
                text = "未知";
            }
            return text;
        };
    })
    .filter('resourceTpFilter', function () {
        return function (tp) {
            var text;
            if (tp == 0) {
                text = "图片";
            } else if (tp == 1) {
                text = "视频";
            } else if (tp == 3) {
                text = "音频";
            } else {
                text = "未知";
            }
            return text;
        };
    })
    .filter('resourceStatusFilter', function () {
        return function (status) {
            var text;
            if (status == 0) {
                text = "上传失败";
            } else if (status == 1) {
                text = "上传成功";
            } else {
                text = "未知";
            }
            return text;
        };
    })
    .filter('articleTpFilter', function () {
        return function (tp) {
            var text;
            if (tp == 0) {
                text = "文章";
            } else if (tp == 1) {
                text = "图集";
            } else if (tp == 2) {
                text = "视频";
            } else {
                text = "未知";
            }
            return text;
        }
    })
    .filter('topicTpFilter', function () {
        return function (tp) {
            var text;
            if (tp == 0) {
                text = "文章";
            } else if (tp == 1) {
                text = "活动";
            } else {
                text = "未知";
            }
            return text;
        }
    })
    .filter('articleStatus', function () {
        return function (status) {
            var text;
            if (status == 0) {
                text = "未发布";
            } else if (status == 1) {
                text = "已发布";
            } else if (status == 2) {
                text = "未通过";
            } else if (status == 3) {
                text = "新抓取";
            } else {
                text = "未知";
            }
            return text;
        };
    })
    .filter('topicStatus', function () {
        return function (status) {
            var text;
            if (status == 0) {
                text = "未发布";
            } else if (status == 1) {
                text = "已发布";
            } else {
                text = "未知";
            }
            return text;
        };
    })
    .filter('activityStatus', function () {
        return function (status) {
            var text;
            if (status == 0) {
                text = "未发布";
            } else if (status == 1) {
                text = "已发布";
            } else if (status == 2) {
                text = "未通过";
            } else {
                text = "未知";
            }
            return text;
        };
    })
    .filter('activityTextFilter', function () {
        return function (txt) {
            txt = txt || '';
            txt = txt.replace(/<[^>]*>/ig, '');
            if (txt.length > 2000) {
                return '已超过' + (txt.length - 2000) + '字';
            } else {
                return '还能输入' + (2000 - txt.length) + '字';
            }
        };
    })
    .filter('goodsStatus', function () {
        return function (status) {
            var text;
            if (status == 0) {
                text = "未发布";
            } else if (status == 1) {
                text = "已发布";
            } else {
                text = "未知";
            }
            return text;
        };
    })
    .filter('billStatus', function () {
        return function (status) {
            var text;
            if (status == 0) {
                text = "未打款";
            } else if (status == 1) {
                text = "已打款";
            } else {
                text = "未知";
            }
            return text;
        };
    })
    .filter('orderStatus', function () {
        return function (status) {
            var text;
            if (status == 0) {
                text = "待付款";
            } else if (status == 1) {
                text = "已取消";
            } else if (status == 2) {
                text = "待发货";
            } else if (status == 3) {
                text = "待收货";
            } else if (status == 4) {
                text = "已完成";
            } else if (status == 5) {
                text = "申请退款";
            } else if (status == 6) {
                text = "已退款";
            } else {
                text = "未知";
            }
            return text;
        };
    })
    .filter('activityOrderStatus', function () {
        return function (status) {
            var text;
            if (status == 0) {
                text = "待付款";
            } else if (status == 1) {
                text = "已取消";
            } else if (status == 2) {
                text = "已付款";
            } else if (status == 3) {
                text = "待收货";
            } else if (status == 4) {
                text = "已完成";
            } else {
                text = "未知";
            }
            return text;
        };
    })
    .filter('liveOrderStatus', function () {
        return function (status) {
            var text;
            if (status == 0) {
                text = "待付款";
            } else if (status == 1) {
                text = "已取消";
            } else if (status == 2) {
                text = "已付款";
            } else if (status == 3) {
                text = "待收货";
            } else if (status == 4) {
                text = "已完成";
            } else {
                text = "未知";
            }
            return text;
        };
    })
    .filter('liveStatus', function () {
        return function (status) {
            var text;
            if (status == 0) {
                text = "未发布";
            } else if (status == 1) {
                text = "已发布";
            } else if (status == 2) {
                text = "未通过";
            } else {
                text = "未知";
            }
            return text;
        };
    })
    .filter('orderType', function () {
        return function (status) {
            var text;
            if (status == 0) {
                text = "物件订单";
            } else if (status == 1) {
                text = "活动订单";
            } else {
                text = "未知";
            }
            return text;
        };
    })
    .filter('applicationStatus', function () {
        return function (status) {
            var text;
            if (status == 0) {
                text = "待审核";
            } else if (status == 1) {
                text = "已通过";
            } else if (status == 2) {
                text = "已拒绝";
            } else {
                text = "未知";
            }
            return text;
        };
    })
    .filter('goodsTextFilter', function () {
        return function (txt) {
            txt = txt || '';
            txt = txt.replace(/<[^>]*>/ig, '');
            if (txt.length > 2000) {
                return '已超过' + (txt.length - 2000) + '字';
            } else {
                return '还能输入' + (2000 - txt.length) + '字';
            }
        };
    })
    .filter('trusted', ['$sce', function ($sce) {
        return function (url) {
            return $sce.trustAsResourceUrl(url);
        };
    }])
    .filter('editorFilter', function () {
        return function (txt, maxlength) {
            if (!maxlength) {
                maxlength = 50;
            }
            txt = txt || '';
            txt = txt.replace(/<[^>]*>/ig, '');
            if (txt.length > maxlength) {
                return '已超过' + (txt.length - maxlength) + '字';
            } else {
                return '还能输入' + (maxlength - txt.length) + '字';
            }
        };
    })
    .filter('userTpFilter', function () {
        return function (tp) {
            var text;
            if (tp == 0) {
                text = "普通用户";
            } else if (tp == 1) {
                text = "作者"
            } else if (tp == 2) {
                text = "编辑"
            } else if (tp == 3) {
                text = "管理员"
            } else {
                text = "未知"
            }
            return text;
        }
    }).filter('textLengthFilter', function () {
        return function (txt) {
            var max_length = 200;
            txt = txt || '';
            txt = txt.replace(/<[^>]*>/ig, '');
            if (txt.length > max_length) {
                return '已超过' + (txt.length - max_length) + '字';
            } else {
                return '还能输入' + (max_length - txt.length) + '字';
            }
        };
    })
;
/**
 * Created by chenchao on 15/12/26.
 */

/* Controllers */

angular.module('myApp.financecontrollers', ['ui.bootstrap'])
    .controller('FinanceStatCtrl', ['$scope', '$modal', '$log', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'FinanceStat', 'data', 'VALID',
        function ($scope, $modal, $log, $state, Alert, ConfirmService, CONFIG, FinanceStat, data, VALID) {
            console.log('loading finance stat controller....');

            $scope.data = data;
            $scope.grid = {
                page: 1,
                type: 'd'
            };

            $scope.financestatlist = {
                show: true
            };

            $scope.financestatlistweekly = {
                show: false
            };

            $scope.financestatlistmonthly = {
                show: false
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.TRUE, type:$scope.grid.type};
                var d = FinanceStat.get(SPEC, function () {
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

            var clearData = function () {
                $log.info("clear data");
            };

            $scope.clearData = function () {
                clearData();
            };

            $scope.loadDailyData = function () {
                $scope.financestatlist.show = true;
                $scope.financestatlistweekly.show = false;
                $scope.financestatlistmonthly.show = false;
                $scope.grid.type = 'd';
                $scope.grid.page = 1;
                refresh(1);
            };

            $scope.loadWeeklyData = function () {
                $scope.financestatlist.show = false;
                $scope.financestatlistweekly.show = true;
                $scope.financestatlistmonthly.show = false;
                $scope.grid.type = 'w';
                $scope.grid.page = 1;
                refresh(1);
            };

            $scope.loadMonthlyData = function () {
                $scope.financestatlist.show = false;
                $scope.financestatlistweekly.show = false;
                $scope.financestatlistmonthly.show = true;
                $scope.grid.type = 'm';
                $scope.grid.page = 1;
                refresh(1);
            }
        }]);


/* Controllers */

angular.module('myApp.goodscontrollers', ['ui.bootstrap'])
    .controller('GoodsCtrl', ['$scope', '$modal', '$log', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'Goods', 'data', 'defaultHint', 'ResourceTranslator', 'ImageSelectService', 'ResourceSelectService', 'ResourceTextService', 'ResourceSingleSelectService', 'Resource', '$rootScope', 'FileUploader', 'token', 'VALID',
        function ($scope, $modal, $log, $state, Alert, ConfirmService, CONFIG, Goods, data, defaultHint, ResourceTranslator, ImageSelectService, ResourceSelectService, ResourceTextService, ResourceSingleSelectService, Resource, $rootScope, FileUploader, token, VALID) {
            $scope.statusList = [
                {"id": "0", "name": "未发布的物件"},
                {"id": "1", "name": "已发布的物件"}
            ];

            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            $scope.goodslist = {
                show: true
            };

            $rootScope.isEditingGoods = false;

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.TRUE};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
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

            $scope.resources = [];
            $scope.resourceIds = [];

            var clearData = function () {
                $log.info("clear data");
                $scope.resources = [];
                $scope.resourceIds = [];
                $scope.goods = {'resource': []};
            };

            $scope.clearData = function () {
                $rootScope.isEditingGoods = false;
                clearData();
            };

            $scope.selectResource = function () {
                ImageSelectService.open().then(function (o) {
                    if (!o) {
                        return;
                    }

                    $scope.resources.push(o);
                });
            };

            $scope.selectVideo = function () {
                ResourceSingleSelectService.open('', 1, true).then(function (o) {
                    $scope.resources.push(o);
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
            };

            $scope.create = function () {
                $log.info("create goods");
                $rootScope.isEditingGoods = true;
                $scope.create.show = true;
                $scope.goods = {'resource': [], hint: defaultHint.txt};
                $scope.goodsContent = '';

                $scope.save = function () {
                    $log.info("save goods");
                    var goods = $scope.goods;
                    if (!goods.name || goods.name.length == 0) {
                        Alert.alert("物件名称不能为空", true);
                        return;
                    }

                    var images = [];
                    var imageCount = 0;
                    angular.forEach($scope.resources, function (r) {
                        images.push(r.id);
                        if (r.tp == 0) {
                            imageCount++;
                        }
                    });

                    if (imageCount == 0) {
                        Alert.alert("请至少选择一张物件图片!", true);
                        return;
                    }

                    goods.resource = ResourceTranslator.fromHtml('#content-editor');
                    goods.images = images;
                    goods.price = Number(goods.price);
                    goods.quantity = Number(goods.quantity);

                    $log.info("goods:", goods);

                    var doSave = function () {
                        $scope.uploading = true;
                        Goods.save($scope.goods, function () {
                            Alert.alert("操作成功").then(function () {
                                $scope.create.show = false;
                                $scope.goodslist.show = true;
                                //$scope.uploading = false;
                                //refresh($scope.grid.page);
                                document.location.reload(true);
                            });
                        }, function (res) {
                            $scope.updating = true;
                            $scope.uploading = false;
                            Alert.alert("操作失败：" + res.data, true);
                        });
                    };
                    doSave();
                };

                $scope.cancel = function () {
                    $scope.create.show = false;
                    $scope.goodslist.show = true;
                    $scope.uploading = false;

                    clearData();
                };
            };

            $scope.edit = function (idx) {
                var n = $scope.data.data[idx];
                Goods.get({id: n.id}, function (o) {
                    $log.info("edit goods:", o);
                    $rootScope.isEditingGoods = true;
                    $scope.goods = o;

                    $scope.edit.show = true;
                    $scope.editGoodsContent = ResourceTranslator.toHtml(o.resource);

                    //todo, who use resourceIds ??
                    $scope.resourceIds = [];
                    angular.forEach($scope.goods.images, function (o) {
                        $scope.resourceIds.push(o.id);
                    });

                    $scope.resources = o.images;

                    $scope.update = function () {
                        $log.info("update goods");

                        if ($scope.resources.length == 0) {
                            Alert.alert("最少选择一张物件图片", true);
                            return;
                        }

                        var images = [];
                        var imageCount = 0;
                        angular.forEach($scope.resources, function (r) {
                            images.push(r.id);
                            if (r.tp == 0) {
                                imageCount++;
                            }
                        });

                        if (imageCount == 0) {
                            Alert.alert("请至少选择一张物件图片!", true);
                            return;
                        }
                        o.images = images;
                        o.resource = ResourceTranslator.fromHtml('#content-editor');

                        o.price = Number(o.price);
                        o.quantity = Number(o.quantity);
                        $log.info("goods:", $scope.goods);


                        var doSave = function () {
                            $scope.uploading = true;
                            Goods.update({id: o.id}, $scope.goods, function () {
                                Alert.alert("操作成功").then(function () {
                                    $scope.create.show = false;
                                    $scope.goodslist.show = true;
                                    //$scope.uploading = false;
                                    //refresh($scope.grid.page);
                                    document.location.reload(true);
                                });
                            }, function (res) {
                                $scope.updating = true;
                                $scope.uploading = false;
                                Alert.alert("操作失败：" + res.data, true);
                            });
                        };
                        doSave();
                    };

                    $scope.cancel = function () {
                        $scope.create.show = false;
                        $scope.goodslist.show = true;
                        $scope.uploading = false;

                        clearData();
                    };

                });
            };

            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("del goods:", o);
                ConfirmService.confirm('确定要删除此物件吗?').then(function () {
                    Goods.remove({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.view = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("view goods:", o);
                $modal.open({
                    templateUrl: 'partials/goods/goods_view.html',
                    controller: function ($scope, $modalInstance, goods) {
                        $scope.goods = goods;

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        goods: function () {
                            return Goods.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.publish = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("publish goods:", o);
                ConfirmService.confirm('确定要发布此物件吗?').then(function () {
                    Goods.publish.commit({id: o.id}, function () {
                        o.status = 1;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.removeItem = function (idx) {
                if (!$scope.goods) {
                    return;
                }

                if ($scope.goods.items.length <= idx) {
                    return;
                }

                $scope.goods.items.splice(idx, 1);
            };

            $scope.editItem = function (idx) {
                var goods = $scope.goods;
                if (!$scope.goods.items) {
                    $scope.goods.items = [];
                }

                var item;
                var creating = false;
                if (idx === undefined) {
                    item = {size: '', price: 0.0, quantity: 0, color:''};
                    creating = true;
                } else {
                    var oItem = $scope.goods.items[idx];
                    item = {size: oItem.size, price: oItem.price, quantity: oItem.quantity, color: oItem.color}
                }

                $modal.open({
                    templateUrl: 'partials/goods/goods_item.html',
                    controller: function ($scope, $modalInstance) {
                        $scope.currentItem = item;
                        $scope.ok = function () {
                            $modalInstance.close();
                            if (creating) {
                                goods.items.push(item);
                            } else {
                                goods.items[idx].size = item.size;
                                goods.items[idx].price = item.price;
                                goods.items[idx].quantity = item.quantity;
                                goods.items[idx].color = item.color;
                            }
                        };

                        $scope.cancel = function () {
                            $modalInstance.close();
                        };

                    }
                });
            }
        }])
    .controller('DeletedGoodsCtrl', ['$scope', '$modal', '$log', 'Alert', 'ConfirmService', 'CONFIG', 'data', 'Goods', 'VALID',
        function ($scope, $modal, $log, Alert, ConfirmService, CONFIG, data, Goods, VALID) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.FALSE};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
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

            $scope.view = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("view goods:", o);
                $modal.open({
                    templateUrl: 'partials/goods/goods_view.html',
                    controller: function ($scope, $modalInstance, goods) {
                        $scope.goods = goods;

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        goods: function () {
                            return Goods.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.recover = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("recover goods:", o);
                ConfirmService.confirm('确定要恢复此物件吗?').then(function () {
                    Goods.recover.commit({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

        }])
    .controller('GoodsHintCtrl', ['$scope', '$stateParams', '$log', 'Alert', 'ConfirmService', 'CONFIG', 'data', 'Goods',
        function ($scope, $stateParams, $log, Alert, ConfirmService, CONFIG, data, Goods) {
            $scope.data = data;
            $scope.save = function (name, val) {
                var SPEC = {"key": name, "val": val};
                Goods.hint.update(SPEC, function () {
                    Alert.alert("操作成功");
                }, function (res) {
                    Alert.alert("操作失败：" + res, true);
                })
            };
        }]);

/* Controllers */

angular.module('myApp.livecontrollers', ['ui.bootstrap'])
    .controller('LiveCtrl', ['$scope', '$modal', '$log', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'Live', 'Order', 'data','category', 'ResourceTranslator', 'ImageSelectService', 'ResourceSelectService', 'ResourceTextService', 'ResourceSingleSelectService', 'UserSingleSelectService', 'Resource', '$rootScope', 'FileUploader', 'token', 'VALID','User',
        function ($scope, $modal, $log, $state, Alert, ConfirmService, CONFIG, Live, Order, data,category, ResourceTranslator, ImageSelectService, ResourceSelectService, ResourceTextService, ResourceSingleSelectService, UserSingleSelectService, Resource, $rootScope, FileUploader, token, VALID,User) {
            $scope.statusList = [
                {"id": "0", "name": "未发布的活动"},
                {"id": "1", "name": "已发布的活动"}
            ];

            $scope.data = data;
            $scope.category = category.data;
            $scope.grid = {
                page: 1
            };

            $scope.livelist = {
                show: true
            };

            $rootScope.isEditingLive = false;

            function processLives(lives) {
                angular.forEach(lives.data, function(live) {
                    var st = new Date(live.st);
                    var year = st.getFullYear();
                    var month = st.getMonth() + 1;
                    var date = st.getDate();
                    live._start_date = year + '.' + month + '.' + date;
                });
            }
            processLives(data);

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.TRUE};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Live.get(SPEC, function () {
                    $scope.data = d;
                    processLives(d);
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

            $scope.resources = [];
            $scope.resourceIds = [];
            $scope.previewImg = [];
            $scope.bannerImg = [];

            var clearData = function () {
                $log.info("clear data");
                $scope.resources = [];
                $scope.resourceIds = [];
                $scope.previewImg = [];
                $scope.bannerImg = [];
                $scope.live = {'resource': [], 'tp': 0};
            };

            $scope.clearData = function () {
                $rootScope.isEditingLive = false;
                clearData();
            };

            $scope.insertTextarea = function () {
                ResourceTextService.open('', 2000).then(function (txt) {
                    if (txt.length) {
                        Resource.getId.get(function (res) {
                            $scope.resources.push({id: res.id, tp: 2, txt: txt});
                        });
                    }
                });
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
                            });
                        });
                    }
                });
            };

            $scope.selectTopImage = function () {
                ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight).then(function (o) {
                    if (!o) {
                        return;
                    }

                    $scope.previewImg.push(o);
                });
            };

            $scope.selectBannerImage = function () {
                ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight).then(function (o) {
                    if (!o) {
                        return;
                    }

                    $scope.bannerImg.push(o);
                });
            };

            // $scope.selectAuthor = function () {
            //     $scope.authorSelecting = true;
            //     UserSingleSelectService.open($scope.live.user, 1).then(function (selected) {
            //         $scope.authorSelecting = false;
            //         if (selected) {
            //             $scope.live.user = selected.id;
            //             $scope.author_name = selected.nick;
            //         }
            //     }, function () {
            //         $scope.authorSelecting = false;
            //     });
            // };

            //选择作者
            $scope.name={
                author_name:""
            };
            $scope.results = false;
            $scope.myKeyup = function () {
                var kw = $scope.name.author_name;
                console.log(kw);
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
                    $scope.live.user = $scope.authors[index].id;
                    $scope.name.author_name = $scope.authors[index].nick;
                    $scope.results = false;
                }
            }

            // datepicker begin
            $scope.hstep = 1;
            $scope.mstep = 5;
            $scope.dateFormat = "yyyy-MM-dd";

            $scope.startDate = newDate();
            $scope.openStartDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.startDate.opened = true;
            };

            $scope.endDate = newDate();
            $scope.openEndDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.endDate.opened = true;
            };

            $scope.deadlineDate = newDate();
            $scope.openDeadlineDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.deadlineDate.opened = true;
            };

            $scope.createDate = newDate();
            $scope.openCreateDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.createDate.opened = true;
            };

            $scope.publishDate = newDate();
            $scope.openPublishDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.publishDate.opened = true;
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
            };

            $scope.removePreviewImg = function (resource) {
                $log.info("remove previewImg:", resource);
                angular.forEach($scope.previewImg, function (r) {
                    if (r.id === resource.id) {
                        $scope.previewImg.splice($scope.previewImg.indexOf(resource), 1);
                    }
                });
            };

            $scope.removeBannerImg = function (resource) {
                $log.info("remove bannerImg:", resource);
                angular.forEach($scope.bannerImg, function (r) {
                    if (r.id === resource.id) {
                        $scope.bannerImg.splice($scope.bannerImg.indexOf(resource), 1);
                    }
                });
            };

            function newDate() {
                return {
                    date: new Date(),
                    time: new Date(),
                    minDate: new Date(),
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
                    minDate: new Date(),
                    opened: false
                }
            }

            $scope.publishTypes = [
                {"id": "0", "name": "手工发布"},
                {"id": "1", "name": "定时发布"}
            ];

            $scope.pushSetting = [
                {"id": "0", "name": "不发送推送消息"},
                {"id": "1", "name": "发送推送消息"}
            ];

            $scope.stripFormat = ResourceTranslator.stripFormat;
            $scope.create = function () {
                $log.info("create live");
                $rootScope.isEditingLive = true;
                $scope.create.show = true;
                $scope.live = {'resource': [], autoPublishString: '0', needPushString: '0'};
                $scope.keywordNames = "";
                $scope.keywordIds = [];
                $scope.keywordId = [];
                var names = '';
                var ids = [];

                $scope.liveContent = '';
                $scope.author_name = '';
                $scope.startDate = newDate();
                $scope.endDate = newDate();
                $scope.createDate = newDate();
                $scope.deadlineDate = newDate();
                $scope.publishDate = newDate();

                $scope.save = function () {
                    $log.info("save live");
                    var live = $scope.live;
                    if (!live.title || live.title.length == 0) {
                        Alert.alert("连线名称不能为空", true);
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
                        Alert.alert("请设置连线头图", true);
                        return;
                    }

                    var bannerImg = [];
                    angular.forEach($scope.bannerImg, function (r) {
                        if (r.tp == 0 && bannerImg.length < 1) {
                            bannerImg.push(r);
                        }
                    });

                    if (bannerImg.length == 0) {
                        Alert.alert("请设置连线banner图", true);
                        return;
                    }


                    live.resource = $scope.resources;
                    live.topImage = previewImg[0];
                    if (bannerImg.length > 0) {
                        live.bannerImage = bannerImg[0];
                    }
                    live.category = {
                        id:$scope.live.category
                    }
                    live.maxAttendees = Number(live.maxAttendees);
                    live.maxAskAttendees = Number(live.maxAskAttendees);
                    live.price = Number(live.price);

                    live.st = parseDate($scope.startDate);
                    live.et = parseDate($scope.endDate);
                    live.dt = parseDate($scope.deadlineDate);
                    live.ct = parseDate($scope.createDate);
                    live.pt = parseDate($scope.publishDate);
                    live.autoPublish = parseInt(live.autoPublishString);
                    live.needPush = parseInt(live.needPushString);

                    $log.info("live:", live);

                    var createCheck = function () {
                        $scope.uploading = true;
                        Live.save($scope.live, function () {
                            Alert.alert("操作成功").then(function () {
                                $scope.create.show = false;
                                $scope.livelist.show = true;
                                $scope.uploading = false;
                                refresh($scope.grid.page);
                            });
                        }, function (res) {
                            $scope.updating = true;
                            $scope.uploading = false;
                            Alert.alert("操作失败：" + res.data, true);
                        });
                    };
                    createCheck();
                };

                $scope.cancel = function () {
                    $scope.create.show = false;
                    $scope.livelist.show = true;
                    $scope.uploading = false;

                    clearData();
                };
            };

            $scope.edit = function (idx) {
                var n = $scope.data.data[idx];
                Live.get({id: n.id}, function (o) {
                    $log.info("edit live:", o);
                    $rootScope.isEditingLive = true;
                    $scope.live = o;

                    $scope.name.author_name = o.user.nick;
                    o.user = o.user.id;
                    o.category = o.category.id;
                    $scope.editorLiveContent = ResourceTranslator.toHtml(o.resource);

                    $log.log('init:' + o.st);
                    $scope.startDate = fromTimestamp(o.st);
                    $scope.endDate = fromTimestamp(o.et);
                    $scope.deadlineDate = fromTimestamp(o.dt);
                    $scope.createDate = fromTimestamp(o.ct);
                    $scope.publishDate = fromTimestamp(o.pt);

                    $scope.edit.show = true;

                    $scope.live.autoPublishString = '' + $scope.live.autoPublish;
                    $scope.live.needPushString = '' + $scope.live.needPush;

                    //todo, who use resourceIds ??
                    $scope.resourceIds = [];
                    angular.forEach($scope.live.resource, function (o) {
                        $scope.resourceIds.push(o.id);
                    });

                    $scope.resources = o.resource;
                    $scope.previewImg = [o.topImage];
                    $scope.bannerImg = [o.bannerImage];

                    o.maxAttendees = Number(o.maxAttendees);
                    o.maxAskAttendees = Number(o.maxAskAttendees);
                    o.price = Number(o.price);

                    $scope.update = function () {
                        $log.info("update live");
                        $scope.resources = ResourceTranslator.fromHtml('#content-editor');

                        var previewImg = [];
                        angular.forEach($scope.previewImg, function (r) {
                            if (r.tp == 0 && previewImg.length < 1) {
                                previewImg.push(r);
                            }
                        });

                        if (previewImg.length == 0) {
                            Alert.alert("请设置连线头图", true);
                            return;
                        }

                        var bannerImg = [];
                        angular.forEach($scope.bannerImg, function (r) {
                            if (r.tp == 0 && bannerImg.length < 1) {
                                bannerImg.push(r);
                            }
                        });

                        if (bannerImg.length == 0) {
                            Alert.alert("请设置连线banner图", true);
                            return;
                        }

                        $scope.live.resource = $scope.resources;
                        $scope.live.topImage = previewImg[0];
                        if (bannerImg.length > 0) {
                            $scope.live.bannerImage = bannerImg[0];
                        }
                        $scope.live.category = {
                            id:$scope.live.category
                        };
                        $scope.live.maxAttendees = Number($scope.live.maxAttendees);
                        $scope.live.maxAskAttendees = Number($scope.live.maxAskAttendees);
                        $scope.live.price = Number($scope.live.price);

                        $scope.live.st = parseDate($scope.startDate);
                        $log.log('update st: ' + $scope.live.st);
                        $scope.live.et = parseDate($scope.endDate);
                        $scope.live.dt = parseDate($scope.deadlineDate);
                        $scope.live.ct = parseDate($scope.createDate);
                        $scope.live.pt = parseDate($scope.publishDate);
                        $scope.live.autoPublish = parseInt($scope.live.autoPublishString);
                        $scope.live.needPush = parseInt($scope.live.needPushString);

                        $log.info("live:", $scope.live);


                        var editCheck = function () {
                            $scope.uploading = true;
                            Live.update({id: o.id}, $scope.live, function () {
                                Alert.alert("操作成功").then(function () {
                                    $scope.create.show = false;
                                    $scope.livelist.show = true;
                                    $scope.uploading = false;
                                    //refresh($scope.grid.page);
                                    document.location.reload(true);
                                });
                            }, function (res) {
                                $scope.updating = true;
                                $scope.uploading = false;
                                Alert.alert("操作失败：" + res.data, true);
                            });
                        };
                        editCheck();
                    };

                    $scope.cancel = function () {
                        $scope.create.show = false;
                        $scope.livelist.show = true;
                        $scope.uploading = false;
                        $scope.edit.show = false;

                        clearData();
                    };

                });
            };

            $scope.listOrders = function (idx) {
                var n = $scope.data.data[idx];
                $scope.currentIndex = idx;

                $scope.orderGrid = {page: 1};
                $scope.orders = {};

                $scope.orderStatusList = [
                    {"id": "0", "name": "待支付的订单"},
                    {"id": "1", "name": "已取消的订单"},
                    {"id": "2", "name": "已支付的订单"}
                ];

                var refresh = function (page) {
                    // TODO: update type?
                    var SPEC = {gid: n.id, type: 2, page: page, size: 20, valid: VALID.TRUE};
                    if ($scope.orderGrid.status) {
                        SPEC.status = $scope.orderGrid.status;
                    }
                    if ($scope.orderGrid.name) {
                        SPEC.q = $scope.orderGrid.name;
                    }
                    var d = Order.get(SPEC, function () {
                        $scope.orders = d;
                    });
                };

                refresh(1);

                $scope.search = function () {
                    refresh($scope.orderGrid.page);
                };

                var orderPageWatch = $scope.$watch('orderGrid.page', function (newVal, oldVal) {
                    if (newVal != oldVal) {
                        refresh(newVal);
                    }
                });

                $scope.listOrders.show = true;
                $scope.cancel = function () {
                    $scope.listOrders.show = false;
                    $scope.livelist.show = true;
                    orderPageWatch();
                };
            };

            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("del live:", o);
                ConfirmService.confirm('确定要删除此连线吗?').then(function () {
                     Live.remove({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.view = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("view live:", o);
                $modal.open({
                    templateUrl: 'partials/live/live_view.html',
                    controller: function ($scope, $modalInstance, live) {
                        $scope.live = live;

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        live: function () {
                            return Live.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.publish = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("publish live:", o);
                ConfirmService.confirm('确定要发布此连线吗?').then(function () {
                    Live.publish.commit({id: o.id}, function () {
                        o.status = 1;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.audit = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("audit live:", o);
                $modal.open({
                    templateUrl: 'partials/live/live_audit.html',
                    controller: function ($scope, $modalInstance, live, page) {
                        $scope.live = live;
                        live.auditInfo = '通过';

                        $scope.live.statusd = 1;
                        $scope.audit = function () {
                            if (!$scope.live.auditInfo) {
                                Alert.alert('必须设置审核意见', true);
                                return;
                            }
                            var postData = {
                                'status': Number($scope.live.statusd),
                                'auditInfo': $scope.live.auditInfo
                            };
                            $log.info("audit:", postData);
                            $log.info("audit live...:", o);

                            var auditCheck = function () {
                                Live.audit.commit({id: live.id}, postData, function () {
                                    Alert.alert('操作成功');
                                    refresh(page);
                                    $modalInstance.close();
                                }, function (res) {
                                    Alert.alert('操作失败:' + res, true);
                                });
                            }();
                        };

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        live: function () {
                            return Live.get({id: o.id}).$promise;
                        },
                        page: function () {
                            return $scope.grid.page;
                        }
                    }
                });
            }

        }])
    .controller('DeletedLiveCtrl', ['$scope', '$modal', '$log', 'Alert', 'ConfirmService', 'CONFIG', 'data', 'Live', 'VALID',
        function ($scope, $modal, $log, Alert, ConfirmService, CONFIG, data, Live, VALID) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.FALSE};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
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

            $scope.view = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("view live:", o);
                $modal.open({
                    templateUrl: 'partials/live/live_view.html',
                    controller: function ($scope, $modalInstance, live) {
                        $scope.live = live;

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        live: function () {
                            return Live.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.recover = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("recover live:", o);
                ConfirmService.confirm('确定要恢复此连线吗?').then(function () {
                     Live.recover.commit({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

        }])
    .controller('LiveBillCtrl', ['$scope', '$stateParams', '$log', 'Alert', 'ConfirmService', 'me', 'CONFIG', 'lives', 'Live',
        function ($scope, $stateParams, $log, Alert, ConfirmService, me, CONFIG, lives, Live) {
            $scope.lives = lives;
             console.log(lives);
            if (me.bankCard.length >= 4) {
                $scope.bankCardSuffix = me.bankCard.substr(me.bankCard.length - 4, 4);
            } else {
                $scope.bankCardSuffix = '';
            }

            $scope.grid = {
                page: 1
            };

            function processLives(lives) {
                angular.forEach(lives.data, function(live) {
                    var st = new Date(live.st);
                    var year = st.getFullYear();
                    var month = st.getMonth() + 1;
                    var date = st.getDate();
                    live._start_date = year + '.' + month + '.' + date;
                });
            }

            processLives(lives);

            var refreshLives = function (page) {
                var SPEC = {status:2, page: page, size: 5, valid:0};
                Live.get(SPEC, function (data){
                    $scope.lives = data;
                    processLives(data);
                });

            };

            $scope.$watch('grid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refreshLives(newVal);
                }
            });

            $scope.updateStatus = function ($index) {
                var live = $scope.lives.data[$index];

                ConfirmService.confirm('确定已经打款了吗?').then(function () {
                    Live.updateBill.update({id: live.id}, function (data) {
                        live.billStatus = 1;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });

            };

        }]);

/* Controllers */

angular.module('myApp.messagecontrollers', ['ui.bootstrap'])
    .controller('MessageCtrl', ['$scope', '$modal', '$log', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'Message', 'data', '$rootScope',
        function ($scope, $modal, $log, $state, Alert, ConfirmService, CONFIG, Message, data, $rootScope) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            $scope.messagelist = {
                show: true
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: 20};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Message.get(SPEC, function () {
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

            var clearData = function () {
                $log.info("clear data");
                $scope.message = {'resource': []};
            };

            $scope.clearData = function () {
                clearData();
            };

            $scope.create = function () {
                $log.info("create message");
                $scope.create.show = true;
                $scope.message = {
                    text:''
                };

                $scope.save = function () {
                    $log.info("save message");
                    var message = $scope.message;
                    if (!message.text || message.text.length == 0) {
                        Alert.alert("消息内容不能为空", true);
                        return;
                    }

                    var doSave = function () {
                        $scope.uploading = true;
                        Message.save($scope.message, function () {
                            Alert.alert("操作成功").then(function () {
                                $scope.create.show = false;
                                $scope.messagelist.show = true;
                                $scope.uploading = false;
                                refresh($scope.grid.page);
                            });
                        }, function (res) {
                            $scope.updating = true;
                            $scope.uploading = false;
                            Alert.alert("操作失败：" + res.data, true);
                        });
                    };
                    ConfirmService.confirm('消息发布后，用户立即可以看到，确定要发布此消息吗?').then(function () {
                        doSave();
                    });
                };

                $scope.cancel = function () {
                    $scope.create.show = false;
                    $scope.messagelist.show = true;
                    $scope.uploading = false;

                    clearData();
                };
            };

            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                ConfirmService.confirm('确定要删除此消息吗?').then(function () {
                    Message.remove({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };
        }]);

/* Controllers */

angular.module('myApp.openscreencontrollers', ['ui.bootstrap'])
    .controller('OpenScreenCtrl', ['$scope', '$modal', '$log', 'me', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'Openscreen', 'data', 'Article', 'Activity', 'Live', 'Ad', 'Topic','Column','ArticleSelectService', 'ActivitySelectService', 'LiveSelectService', 'AdSelectService', 'TopicSelectService', '$rootScope','ImageSelectService','reviseTimeService','reviseUrlService','ColumnSingleSelectService',
        function ($scope, $modal, $log, me, $state, Alert, ConfirmService, CONFIG, Openscreen, data, Article, Activity, Live, Ad, Topic,Column, ArticleSelectService, ActivitySelectService, LiveSelectService, AdSelectService, TopicSelectService, $rootScope,ImageSelectService,reviseTimeService,reviseUrlService,ColumnSingleSelectService) {

            $scope.data = data;
            $scope.origData = data.slice(0, data.length);

            $scope.state = true;

            function getId(o) {
                if (o.type == 0) {
                    return o.article.id;
                } else if (o.type == 1) {
                    return o.activity.id;
                } else if (o.type == 2) {
                    return o.topic.id;
                }
                return '';
            }

            Array.prototype.contains = function(v) {
                for (var i = 0; i < this.length; ++i) {
                    if (this[i] == v)
                        return true;
                }
                return false;
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
                        }else{
                            Alert.alert("该文章已存在", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Article.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                               var o = {type: 0, article: a};
                                $scope.data.unshift(o);
                                $scope.changed = true;
                                setTime();
                            });
                            $log.log($scope.data);
                        });
                    }
                }, function () {
                    $scope.articleSelecting = false;
                });
            };

            $scope.selectActivity = function () {
                var activityIds = [];
                angular.forEach($scope.data,  function (r) {
                    if (r.type == 1) {
                        activityIds.push(r.activity.id);
                    }
                });

                $scope.activitySelecting = true;
                ActivitySelectService.open([], 1).then(function (selected) {
                    $scope.activitySelecting = false;

                    var ids = [];
                    angular.forEach(selected, function (id) {
                        if (!activityIds.contains(id)) {
                            ids.push(id);
                        }else{
                            Alert.alert("该活动已存在", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Activity.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 1, activity: a};
                                $scope.data.unshift(o);
                                $scope.changed = true;
                                setTime();
                            });
                        });
                    }
                }, function () {
                    $scope.activitySelecting = false;
                });
            };

            $scope.selectLive = function () {
                var liveIds = [];
                angular.forEach($scope.data,  function (r) {
                    if (r.type == 3) {
                        liveIds.push(r.live.id);
                    }
                });

                $scope.liveSelecting = true;
                LiveSelectService.open([], 1).then(function (selected) {
                    $scope.liveSelecting = false;

                    var ids = [];
                    angular.forEach(selected, function (id) {
                        if (!liveIds.contains(id)) {
                            ids.push(id);
                        }else{
                            Alert.alert("该连线已存在", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Live.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 3, live: a};
                                $scope.data.unshift(o);
                                $scope.changed = true;
                                setTime();
                            });
                        });
                    }
                }, function () {
                    $scope.liveSelecting = false;
                });
            };

            $scope.selectAd = function () {
                var o = {ad:{type: 4,bannerImage:{},st:'',et:'',url:''},type:4};
                $scope.data.unshift(o);
                setTime();
                console.log($scope.data);
                console.log(o);
            };
            $scope.selectTopic = function () {
                var topicIds = [];
                angular.forEach($scope.data,  function (r) {
                    if (r.type == 2) {
                        topicIds.push(r.topic.id);
                    }
                });

                $scope.topicSelecting = true;
                TopicSelectService.open([], 1).then(function (selected) {
                    $scope.topicSelecting = false;

                    var ids = [];
                    angular.forEach(selected, function (id) {
                        if (!topicIds.contains(id)) {
                            ids.push(id);
                        }else{
                            Alert.alert("该专题已存在", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Topic.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 2, topic: a};
                                $scope.data.unshift(o);
                                $scope.changed = true;
                                setTime();
                            });
                        });
                    }
                }, function () {
                    $scope.topicSelecting = false;
                });
            };
            $scope.selectColumn = function () {
                var columnIds = [];
                angular.forEach($scope.data,  function (r) {
                    if (r.type == 5) {
                        columnIds.push(r.column.id);
                    }
                });

                $scope.topicSelecting = true;
                ColumnSingleSelectService.open([], 1).then(function (selected) {
                    $scope.topicSelecting = false;

                        if (!columnIds.contains(selected)) {
                           var  id=selected;
                        }else{
                            Alert.alert("该课堂已存在", true);
                            return ;
                        }

                    if (id) {
                        Column.get({id: id}, function (data) {
                            console.log(data);
                                var o = {type: 5, column: data};
                                $scope.data.unshift(o);
                                setTime();
                        });
                    }
                }, function () {
                    $scope.topicSelecting = false;
                });
            };

            //默认时间设置
            function setTime() {

                var t =   new Date(new Date(new Date().toLocaleDateString()).getTime()+24*60*60*1000);
                var e =   new Date(new Date(new Date().toLocaleDateString()).getTime()+24*60*60*1000*3-1);

                $scope.startDate = fromTimestamp(t);
                $scope.endDate = fromTimestamp(e);

                angular.forEach($scope.data,function (t,index) {
                    if (t.type ==0){
                        $scope.data[index].st = parseDate($scope.startDate);
                        $scope.data[index].et = parseDate($scope.endDate);
                    }else if (t.type ==1){
                        $scope.data[index].st = parseDate($scope.startDate);
                        $scope.data[index].et = parseDate($scope.endDate);
                    }else  if (t.type ==2){
                        $scope.data[index].st = parseDate($scope.startDate);
                        $scope.data[index].et = parseDate($scope.endDate);
                    }else if (t.type ==3){
                        $scope.data[index].st = parseDate($scope.startDate);
                        $scope.data[index].et = parseDate($scope.endDate);

                    }else  if (t.type ==4){
                        $scope.data[index].st = parseDate($scope.startDate);
                        $scope.data[index].et = parseDate($scope.endDate);
                    }else  if (t.type ==5){
                        $scope.data[index].st = parseDate($scope.startDate);
                        $scope.data[index].et = parseDate($scope.endDate);
                    }
                })
            }
            function newDate() {
                return {
                    date: new Date(),
                    time: new Date(),
                    minDate: new Date(),
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
                    minDate: new Date(),
                    opened: false
                }
            }

            $scope.sortOptions = {
                //restrict move across backlogs. move only within backlog.
                accept: function (sourceItemHandleScope, destSortableScope) {
                },
                itemMoved: function (event) {
                },
                orderChanged: function (event) {
                    $scope.changed = true;
                },
                containment: '#board'
            };


            $scope.bannerImage = [];
            $scope.selectTopImage = function (index) {
                $scope.bannerImage = [];
                var t= $scope.data[index];
                if (t.type ==0){
                    ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                        .then(function (o) {
                            if (!o) {
                                return;
                            }
                            $scope.bannerImage.push(o);

                            var bannerImage = [];
                            angular.forEach($scope.bannerImage, function (r) {
                                if (r.tp == 0 && bannerImage.length < 1) {
                                    bannerImage.push(r);
                                }
                            });
                            $scope.data[index].image = bannerImage[0].url;
                        });
                }else if (t.type ==1){
                    ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                        .then(function (o) {
                            if (!o) {
                                return;
                            }
                            $scope.bannerImage.push(o);

                            var bannerImage = [];
                            angular.forEach($scope.bannerImage, function (r) {
                                if (r.tp == 0 && bannerImage.length < 1) {
                                    bannerImage.push(r);
                                }
                            });
                            $scope.data[index].image = bannerImage[0].url;
                        });
                }else  if (t.type ==2){
                    ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                        .then(function (o) {
                            if (!o) {
                                return;
                            }
                            $scope.bannerImage.push(o);

                            var bannerImage = [];
                            angular.forEach($scope.bannerImage, function (r) {
                                if (r.tp == 0 && bannerImage.length < 1) {
                                    bannerImage.push(r);
                                }
                            });
                            $scope.data[index].image = bannerImage[0].url;
                        });
                }else if (t.type ==3){
                    ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                        .then(function (o) {
                            if (!o) {
                                return;
                            }
                            $scope.bannerImage.push(o);

                            var bannerImage = [];
                            angular.forEach($scope.bannerImage, function (r) {
                                if (r.tp == 0 && bannerImage.length < 1) {
                                    bannerImage.push(r);
                                }
                            });
                            $scope.data[index].image = bannerImage[0].url;
                        });
                }else  if (t.type ==4){
                    ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                        .then(function (o) {
                            if (!o) {
                                return;
                            }
                            $scope.bannerImage.push(o);

                            var bannerImage = [];
                            angular.forEach($scope.bannerImage, function (r) {
                                if (r.tp == 0 && bannerImage.length < 1) {
                                    bannerImage.push(r);
                                }
                            });
                            $scope.data[index].image = bannerImage[0].url;
                        });
                }else  if (t.type ==5){
                    ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                        .then(function (o) {
                            if (!o) {
                                return;
                            }
                            $scope.bannerImage.push(o);

                            var bannerImage = [];
                            angular.forEach($scope.bannerImage, function (r) {
                                if (r.tp == 0 && bannerImage.length < 1) {
                                    bannerImage.push(r);
                                }
                            });
                            $scope.data[index].image = bannerImage[0].url;
                        });
                }


            };
            $scope.reviseUrl =function (index) {
                var t= $scope.data[index];
                reviseUrlService.open('').then(function (txt) {
                    if (txt.length) {
                        $scope.data[index].url = txt;
                    }
                });
            }
            $scope.reviseTime = function (index){
                var t= $scope.data[index];
                reviseTimeService.open('').then(function (time) {
                    if (time.st) {
                        $scope.data[index].st = time.st;
                        $scope.data[index].et = time.et;
                    }
                });

            };

            $scope.save = function (index) {
                    var ids = {};
                    var o = $scope.data[index];
                        if (o.type == 0) {
                            ids={type: o.type, gid: o.article.id,image:o.image,st:o.st,et:o.et,advertkind:0};
                        } else if (o.type == 1) {
                            ids={type: o.type, gid: o.activity.id,image:o.image,st:o.st,et:o.et,advertkind:0};
                        } else if (o.type == 2) {
                            ids={type: o.type, gid: o.topic.id,image:o.image,st:o.st,et:o.et,advertkind:0};
                        } else if (o.type == 3) {
                            ids={type: o.type, gid: o.live.id,image:o.image,st:o.st,et:o.et,advertkind:0};
                        } else if (o.type == 4) {
                            ids={type: o.type, gid: '',image:o.image,st:o.st,et:o.et,url:o.url,advertkind:0};
                        } else if (o.type == 5) {
                            ids={type: o.type, gid: o.column.id,image:o.image,st:o.st,et:o.et,advertkind:0};
                        }

                    $log.log(ids);
                    Openscreen.save(ids, function () {
                        Alert.alert("操作成功").then(function () {
                            $scope.upading = false;
                            $scope.origData = $scope.data.slice(0, $scope.data.length);
                            $scope.state = false;
                        });
                    }, function (res) {
                        $scope.updating = true;
                        $log.info(res.data);
                        Alert.alert("操作失败：" + res.data, true);
                    });
                };

                $scope.update = function (index) {
                    var ids = {};
                    var o = $scope.data[index];
                    if (o.type == 0) {
                        ids={type: o.type, id:o.id, gid: o.gid,image:o.image,st:o.st,et:o.et,advertkind:0};
                    } else if (o.type == 1) {
                        ids={type: o.type, id:o.id, gid: o.gid,image:o.image,st:o.st,et:o.et,advertkind:0};
                    } else if (o.type == 2) {
                        ids={type: o.type, id:o.id, gid: o.gid,image:o.image,st:o.st,et:o.et,advertkind:0};
                    } else if (o.type == 3) {
                        ids={type: o.type, id:o.id, gid: o.gid,image:o.image,st:o.st,et:o.et,advertkind:0};
                    } else if (o.type == 4) {
                        ids={type: o.type, id: o.id,gid: o.gid,image:o.image,st:o.st,et:o.et,url:o.url,advertkind:0};
                    }else if (o.type == 5) {
                        ids={type: o.type, id: o.id,gid: o.gid,image:o.image,st:o.st,et:o.et,advertkind:0};
                    }
                    Openscreen.editor.update({id: o.id}, ids, function () {
                    Alert.alert("操作成功").then(function () {
                          $scope.state = false;
                    });
                }, function (res) {
                    $scope.updating = true;
                    $scope.uploading = false;
                    $log.info(res.data);
                    Alert.alert("操作失败：" + res.data, true);
                });
            };
               $scope.delete = function (index) {
                   var u = $scope.data[index];
                   ConfirmService.confirm('确定要删除此广告吗?').then(function () {
                       Openscreen.remove({id: u.id}, function () {
                           $scope.data.splice(index, 1);
                           Alert.alert("操作成功");
                       }, function (res) {
                           Alert.alert("操作失败：" + res.data, true);
                       });
                   });
               }

        }]);

/* Controllers */

angular.module('myApp.ordercontrollers', ['ui.bootstrap'])
    .controller('OrderCtrl', ['$scope', '$modal', '$log', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'Order', 'data', 'ResourceSelectService', 'ResourceTextService', 'ResourceSingleSelectService', 'Resource', '$rootScope', 'FileUploader', 'VALID',
        function ($scope, $modal, $log, $state, Alert, ConfirmService, CONFIG, Order, data, ResourceSelectService, ResourceTextService, ResourceSingleSelectService, Resource, $rootScope, FileUploader, VALID) {
            $scope.statusList = [
                {"id": "0", "name": "待支付的订单"},
                {"id": "1", "name": "已取消的订单"},
                {"id": "2", "name": "已支付的订单"},
                {"id": "3", "name": "待收货的订单"},
                {"id": "4", "name": "已完成的订单"},
                {"id": "5", "name": "申请退款的订单"},
                {"id": "6", "name": "已退款的订单"}
            ];

            $scope.typeList = [
                {"id": "0", "name": "物件订单"},
                {"id": "1", "name": "活动订单"}
            ];

            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            $scope.orderlist = {
                show: true
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.TRUE};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
                if ($scope.grid.type) {
                    SPEC.type = $scope.grid.type;
                }
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Order.get(SPEC, function () {
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
                $log.info("view order:", o);
                $modal.open({
                    templateUrl: 'partials/order/order_view.html',
                    controller: function ($scope, $modalInstance, order) {
                        $scope.order = order;

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        order: function () {
                            return Order.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.deliver = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("deliver order:", o);
                ConfirmService.confirm('确定订单已发货吗?').then(function () {
                    Order.deliver.commit({id: o.id}, function () {
                        o.status = 3;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.refunding = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("refunding order:", o);
                ConfirmService.confirm('确定订单要申请退款吗?').then(function () {
                    Order.status.update({id: o.id, status: 5}, function () {
                        o.status = 5;
                        Alert.alert("操作成功");
                    }, function (res) {
                        $log.log(res.data);
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.refunded = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("refunded order:", o);
                ConfirmService.confirm('确定订单已退款吗?').then(function () {
                    Order.status.update({id: o.id, status: 6}, function () {
                        o.status = 6;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };
        }]);

/* Controllers */

angular.module('myApp.recommendedcontrollers', ['ui.bootstrap'])
    .controller('recommendedCtrl', ['$scope', '$modal', '$log', 'me', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'Recommend', 'data', 'Article', 'Activity', 'Live', 'Ad', 'Topic', 'ArticleSelectService', 'ActivitySelectService', 'LiveSelectService', 'AdSelectService', 'TopicSelectService', '$rootScope','VALID','ImageSelectService','reviseTitleService',
        function ($scope, $modal, $log, me, $state, Alert, ConfirmService, CONFIG, Recommend, data, Article, Activity, Live, Ad, Topic, ArticleSelectService, ActivitySelectService, LiveSelectService, AdSelectService, TopicSelectService, $rootScope,VALID,ImageSelectService,reviseTitleService) {
            $scope.data = data;
            // $scope.origData = data.slice(0, data.length);
            $scope.changed = false;
            $scope.bannerlist = {
                show: true
            };
            $scope.grid = {
                page: 1
            };
            $scope.recommendedType = [
                {"id": "0", "name": "活动"},
                {"id": "1", "name": "文章"},
                {"id": "2", "name": "专题"},
                {"id": "3", "name": "连线"},
                // {"id": "4", "name": "广告"},
            ];
            $scope.addType = [
                {"id": "0", "name": "添加活动"},
                {"id": "1", "name": "添加文章"},
                {"id": "2", "name": "添加专题"},
                {"id": "3", "name": "添加连线"},
                // {"id": "4", "name": "添加广告"},
            ];
            $scope.item=[false,false,false,false,false];
            $scope.name =  $scope.recommendedType[0].name;
            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.TRUE};
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Article.get(SPEC, function () {
                    $scope.data = d;
                });
            };
            //搜索推荐位列表
            $scope.search = function () {
                refresh($scope.grid.page);
            };

            function getId(o) {
                if (o.type == 0) {
                    return o.article.id;
                } else if (o.type == 1) {
                    return o.activity.id;
                } else if (o.type == 2) {
                    return o.topic.id;
                }
                return '';
            }

            Array.prototype.contains = function(v) {
                for (var i = 0; i < this.length; ++i) {
                    if (this[i] == v)
                        return true;
                }
                return false;
            };

            //编辑推荐位分类
            $scope.list = [];
            $scope.item[0]=true;
            angular.forEach($scope.data.data,  function (r) {
                if (r.type == 0) {
                    $scope.list=r.recommends;
                }
            });
            $scope.classify = function (type) {
                type = parseInt(type);
                $scope.name =  $scope.recommendedType[type].name;
                $scope.item=[false,false,false,false,false];
                $scope.item[type]=true;
                $scope.list = [];
                angular.forEach($scope.data.data,  function (r) {
                    if (r.type == type) {
                        $scope.list=r.recommends;
                    }
                });
                console.log($scope.list);

            }
            $scope.add = function (id) {
                if (id == 1){
                    $scope.selectArticle();
                }else if (id ==0){
                    $scope.selectActivity();
                }else if (id ==2){
                    $scope.selectTopic();
                }else if (id ==3){
                    $scope.selectLive();
                }else if (id ==4){
                    $scope.selectAd();
                }
            }

            $scope.selectArticle = function () {
                var articleIds = [];
                angular.forEach($scope.list,  function (r) {
                    if (r.type == 1) {
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
                        }else{
                            Alert.alert("该文章已推荐", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Article.batch.get({}, {'ids': ids}, function (data) {
                            console.log(data);
                            angular.forEach(data.data, function(a) {
                                var o = {type: 1, article: a};
                                $scope.list.unshift(o);
                                $scope.changed = true;
                            });
                            $log.log($scope.data);
                        });
                    }
                }, function () {
                    $scope.articleSelecting = false;
                });
            };

            $scope.selectActivity = function () {
                var activityIds = [];
                angular.forEach($scope.list,  function (r) {
                    if (r.type == 0) {
                        activityIds.push(r.activity.id);
                    }
                });

                $scope.activitySelecting = true;
                ActivitySelectService.open([], 1).then(function (selected) {
                    $scope.activitySelecting = false;

                    var ids = [];
                    angular.forEach(selected, function (id) {
                        if (!activityIds.contains(id)) {
                            ids.push(id);
                        }else{
                            Alert.alert("该活动已推荐", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Activity.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 0, activity: a};
                                $scope.list.unshift(o);
                                $scope.changed = true;
                            });
                        });
                    }
                }, function () {
                    $scope.activitySelecting = false;
                });
            };

            $scope.selectLive = function () {
                var liveIds = [];
                angular.forEach($scope.list,  function (r) {
                    if (r.type == 3) {
                        liveIds.push(r.live.id);
                    }
                });

                $scope.liveSelecting = true;
                LiveSelectService.open([], 1).then(function (selected) {
                    $scope.liveSelecting = false;

                    var ids = [];
                    angular.forEach(selected, function (id) {
                        if (!liveIds.contains(id)) {
                            ids.push(id);
                        }else{
                            Alert.alert("该连线已推荐", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Live.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 3, live: a};
                                $scope.list.unshift(o);
                                $scope.changed = true;
                            });
                        });
                    }
                }, function () {
                    $scope.liveSelecting = false;
                });
            };

            $scope.selectAd = function () {
                var adIds = [];
                angular.forEach($scope.list,  function (r) {
                    if (r.type == 4) {
                        adIds.push(r.ad.id);
                    }
                });

                $scope.adSelecting = true;
                AdSelectService.open([], 1).then(function (selected) {
                    $scope.adSelecting = false;

                    var ids = [];
                    angular.forEach(selected, function (id) {
                        if (!adIds.contains(id)) {
                            ids.push(id);
                        }else{
                            Alert.alert("该广告已推荐", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Ad.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 4, ad: a};
                                $scope.list.unshift(o);
                                $scope.changed = true;
                            });
                        });
                    }
                }, function () {
                    $scope.adSelecting = false;
                });
            };

            $scope.selectTopic = function () {
                var topicIds = [];
                angular.forEach($scope.list,  function (r) {
                    if (r.type == 2) {
                        topicIds.push(r.article.id);
                    }
                });

                $scope.topicSelecting = true;
                TopicSelectService.open([], 1).then(function (selected) {
                    $scope.topicSelecting = false;

                    var ids = [];
                    angular.forEach(selected, function (id) {
                        if (!topicIds.contains(id)) {
                            ids.push(id);
                        }else{
                            Alert.alert("该专题已推荐", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Article.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 2, article: a};
                                $scope.list.unshift(o);
                                $scope.changed = true;
                            });
                        });
                    }
                }, function () {
                    $scope.topicSelecting = false;
                });
            };

            $scope.sortOptions = {
                accept: function (sourceItemHandleScope, destSortableScope) {
                },
                itemMoved: function (event) {
                },
                orderChanged: function (event) {
                    $scope.changed = true;
                },
                containment: '#board'
            };

            $scope.removeBanner = function (index) {
                if (index < 0 || index >= $scope.list.length)
                    return;

                $scope.list.splice(index, 1);
            };

            $scope.edit = {
                show: false
            };

            $scope.coverImg = [];
            $scope.selectTopImage = function (index) {
                $scope.coverImg = [];
                var t= $scope.list[index];
                ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                    .then(function (o) {
                        if (!o) {
                            return;
                        }
                        $scope.coverImg.push(o);

                        var coverImg = [];
                        angular.forEach($scope.coverImg, function (r) {
                            if (r.tp == 0 && coverImg.length < 1) {
                                coverImg.push(r);
                            }
                        });
                        $scope.list[index].image = coverImg[0];
                    });


            };

            $scope.reviseTitle = function (index){
                var t= $scope.list[index];
                reviseTitleService.open('').then(function (txt) {
                    if (txt.length) {
                        $scope.list[index].title = txt;
                    }
                });

        };

            function validateArticle() {
                    var titleCount = 0;
                    var imageCount = 0;

                    angular.forEach($scope.list, function (r) {
                        if (r.image) {
                            imageCount++;
                        }
                        if (r.title) {
                            titleCount++;
                        }
                    });
                    if (titleCount <$scope.list.length) {
                        Alert.alert("标题不能为空", true);
                        return false;
                    }

                    if (imageCount <$scope.list.length) {
                        Alert.alert("头图不能为空", true);
                        return false;
                    }

                    if ($scope.list.length==0) {
                        Alert.alert("无推荐内容", true);
                        return false;
                    }

                return true;
            };

            $scope.editRecommended = function () {
                $scope.edit.show = true;
                console.log($scope.list);
                $scope.save = function () {
                    var ids = [];
                    if (!validateArticle()) {
                        return;
                    }
                    angular.forEach($scope.list, function(o,index){
                        console.log(o);
                            if (o.type == 1) {
                                ids.push({type:1, article:{id:o.article.id},orderNo:index+1,title:o.title,image:o.image});
                            } else if (o.type == 0) {
                                ids.push({type: 0, activity:{id: o.activity.id},orderNo:index+1,title:o.title,image:o.image});
                            } else if (o.type == 2) {
                                ids.push({type:2, article:{id: o.article.id},orderNo:index+1,title:o.title,image:o.image});
                            } else if (o.type == 3) {
                                ids.push({type:3,live:{id: o.live.id},orderNo:index+1,title:o.title,image:o.image});
                                // } else if (o.type == 4) {
                                //     ids.push({type: o.type, id: o.ad.id});
                            }

                    });

                    var Check = function () {
                        $log.log(ids);
                        Recommend.batch.query(ids, function (data) {
                            console.log(data);
                            Alert.alert("操作成功").then(function () {
                                $scope.edit.show = false;
                                $scope.data = data;
                                $scope.bannerlist.show = true;
                                document.location.reload(true);
                                $scope.upading = false;
                                $scope.origData = $scope.data.slice(0, $scope.data.length);
                                $scope.changed = false;
                            });
                        }, function (res) {
                            $scope.updating = true;
                            $log.info(res.data);
                            Alert.alert("操作失败：" + res.data, true);
                        });
                    };

                 Check();
                };
                $scope.cancel = function () {
                    $scope.edit.show = false;
                    $scope.bannerlist.show = true;
                    document.location.reload(true);
                    $scope.updating = false;
                    $scope.changed = false;
                    $scope.data = $scope.origData.slice(0, $scope.origData.length);
                };
            };

        }]);

/* Controllers */

angular.module('myApp.resourcecontrollers', ['ui.bootstrap'])
    .controller('ResourceCtrl', ['$scope', '$log', '$modal', 'Alert', '$http', '$state', 'ConfirmService', 'CONFIG', 'FileUploader', 'Resource', 'data',
        function ($scope, $log, $modal, Alert, $http, $state, ConfirmService, CONFIG, FileUploader, Resource, data) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            var refresh = function (page) {
                $log.info('refresh');
                var SPEC = {page: page, size: CONFIG.limit, tp: '1,3', status: 1};
                if ($scope.grid.name) {
                    SPEC.name = $scope.grid.name;
                }
                var d = Resource.get(SPEC, function () {
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

            $scope.create = function () {
                $modal.open({
                    templateUrl: 'partials/resource/resource_upload.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance, token) {
                        $scope.uploadToken = token.token;
                        $log.info("token:", $scope.uploadToken);

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
                                    Alert.alert('请确认上传视频格式为mp4，音频格式为mp3', true);
                                    return false;
                                }
                                return '|mp4|'.indexOf(type) !== -1 || '|mp3|'.indexOf(type) !== -1;
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
//                        uploader.onProgressItem = function (fileItem, progress) {
//                            console.info('onProgressItem', fileItem, progress);
//                        };
//                        uploader.onProgressAll = function (progress) {
//                            console.info('onProgressAll', progress);
//                        };
                        uploader.onSuccessItem = function (fileItem, response, status, headers) {
                            console.info('onSuccessItem', fileItem, response, status, headers);

                            var type = fileItem.file.type.slice(fileItem.file.type.indexOf("/") + 1);
                            $log.info("file type:", type);
                            var tp = 0;
                            if (type == "mp4") {
                                tp = 1;
                            } else {
                                tp = 3;
                            }
                            var resource = {name: fileItem.file.name, tp: tp, key: response.key, hash: response.hash};
                            $log.info('create resource:', resource);
                            Resource.save(resource, function () {
                                $log.info("create resource successfully")
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
                            refresh(1);
                            $modalInstance.close();
                            //todo refresh list
                        };
                    },
                    resolve: {
                        token: function () {
                            return Resource.token.get().$promise;
                        }
                    }
                });
            };

            $scope.video = function (idx) {
                var o = $scope.data.data[idx];
                $modal.open({
                    templateUrl: 'partials/resource/resource_video.html',
                    controller: function ($scope, $modalInstance, video) {
                        $log.info('=-=-=', video);
                        $scope.url = video.url;
                        $scope.poster = video.poster;
                        $scope.tp = video.tp;
                        $scope.ok = function () {
                            $modalInstance.close();
                        }
                    },
                    resolve: {
                        video: function () {
                            return o;
                        }
                    }
                })
            };

            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("del resource:", o);
                ConfirmService.confirm('确定要删除此资源文件吗?').then(function () {
                    Resource.remove({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

        }]);

/* Controllers */

angular.module('myApp.sensitivecontrollers', ['ui.bootstrap'])
    .controller('SensitiveCtrl', ['$scope', '$stateParams', '$log', 'Alert', 'ConfirmService', 'data', '$modal', 'Sensitive', 'CONFIG',
        function ($scope, $stateParams, $log, Alert, ConfirmService, data, $modal, Sensitive, CONFIG) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: CONFIG.limit};
                if ($scope.grid.name) {
                    SPEC.name = $scope.grid.name;
                }

                var d = Sensitive.get(SPEC, function () {
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

            $scope.create = function () {
                $modal.open({
                    templateUrl: 'partials/sensitive/sensitive_create.html',
                    controller: function ($scope, $modalInstance) {
                        $scope.sensitive = {};
                        $scope.save = function () {
                            if (!$scope.sensitive.name) {
                                Alert.alert("名称不能为空", true);
                                return;
                            }
                            Sensitive.save($scope.sensitive, function () {
                                Alert.alert("操作成功");
                                //refresh list
                                refresh(1);
                                $modalInstance.close();
                            }, function (res) {
                                console.log(res);
                                Alert.alert("操作失败：" + '名称已存在', true);
                            });
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        }
                    }
                })
            };

            $scope.edit = function (idx) {
                var o = $scope.data.data[idx];
                $modal.open({
                    templateUrl: 'partials/sensitive/sensitive_edit.html',
                    controller: function ($modalInstance, $scope, sensitive) {
                        $scope.sensitive = sensitive;
                        $scope.sensitiveOriginal = {
                            name: sensitive.name
                        };
                        $log.info(sensitive);
                        $scope.save = function (name, val) {
                            if (name == 'name' && !val) {
                                return '名称不能为空';
                            }
                            var SPEC = {"key": name, "val": val};
                            Sensitive.update({id: sensitive.id}, SPEC, function () {
                                $log.info("save success");
                                o[name] = val;
                            }, function (res) {
                                Alert.alert("操作失败：" + '名称已存在', true);
                                o[name] = $scope.sensitiveOriginal.name;
                            });
                        };
                        $scope.ok = function () {
                            $modalInstance.dismiss();
                        }
                    },
                    resolve: {
                        sensitive: function () {
                            return o;
                        }

                    }
                })
            };

            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                ConfirmService.confirm('确定要删除此敏感词吗?').then(function () {
                    Sensitive.remove({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res, true);
                    });
                });
            }
        }]);

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

/* Controllers */

angular.module('myApp.topiccontrollers', ['ui.bootstrap'])
    .controller('TopicCtrl', ['$scope', '$modal', '$log', '$state', 'Alert', 'ResourceTranslator', 'ConfirmService', 'CONFIG', 'Topic', 'data', 'ImageSelectService', 'ResourceSelectService', 'ArticleSelectService', 'ResourceSingleSelectService', "ActivitySelectService", "GoodsSelectService", "UserSingleSelectService", 'Resource', 'Article', 'Activity', 'Goods', 'User', '$rootScope', 'FileUploader', 'token', 'VALID',
        function ($scope, $modal, $log, $state, Alert, ResourceTranslator, ConfirmService, CONFIG, Topic, data, ImageSelectService, ResourceSelectService, ArticleSelectService, ResourceSingleSelectService, ActivitySelectService, GoodsSelectService, UserSingleSelectService, Resource, Article, Activity, Goods, User, $rootScope, FileUploader, token, VALID) {
            console.log('loading topic controller....');

            $scope.statusList = [
                {"id": "0", "name": "未发布的专题"},
                {"id": "1", "name": "已发布的专题"}
            ];

            $scope.typeList = [
                {"id": "0", "name": "文章专题"},
                {"id": "1", "name": "活动专题"}
            ];

            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            $scope.topiclist = {
                show: true
            };

            $rootScope.isEditingTopic = false;

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.TRUE};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
                if ($scope.grid.type) {
                    SPEC.type = $scope.grid.type;
                }
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Topic.get(SPEC, function () {
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

            $scope.linkArticle = [];
            $scope.linkArticleIds = [];
            $scope.linkActivity = [];
            $scope.linkActivityIds = [];
            $scope.previewImg = [];
            $scope.bannerImg = [];

            var clearData = function () {
                $log.info("clear data");
                $scope.linkArticle = [];
                $scope.linkArticleIds = [];
                $scope.previewImg = [];
                $scope.bannerImg = [];
                $scope.topic = {};
            };

            $scope.clearData = function () {
                $rootScope.isEditingTopic = false;
                clearData();
            };

            $scope.selectArticle = function () {
                var ids = $scope.linkArticleIds;
                $scope.articleSelecting = true;
                ArticleSelectService.open(ids, 10).then(function (selected) {
                    $scope.articleSelecting = false;
                    $scope.linkArticleIds = selected;
                    $scope.linkArticle = [];
                    if (selected.length) {
                        Article.batch.get({}, {'ids': selected}, function (data) {
                            $scope.linkArticle = data.data;
                        });
                    }
                }, function () {
                    $scope.articleSelecting = false;
                });
            };

            $scope.selectActivity = function () {
                var ids = $scope.linkActivityIds;
                $scope.activitySelecting = true;
                ActivitySelectService.open(ids, 10).then(function (selected) {
                    $scope.activitySelecting = false;
                    $scope.linkActivityIds = selected;
                    $scope.linkActivity = [];
                    if (selected.length) {
                        Activity.batch.get({}, {'ids': selected}, function (data) {
                            $scope.linkActivity = data.data;
                        });
                    }
                }, function () {
                    $scope.activitySelecting = false;
                });
            };

            $scope.selectTopImage = function () {
                ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight).then(function (o) {
                    if (!o) {
                        return;
                    }

                    $scope.previewImg.push(o);
                });
            };

            $scope.selectBannerImage = function () {
                ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight).then(function (o) {
                    if (!o) {
                        return;
                    }

                    $scope.bannerImg.push(o);
                });
            };

            $scope.removeArticle = function (id) {
                angular.forEach($scope.linkArticle, function (r) {
                    if (r.id === id) {
                        $scope.linkArticle.splice($scope.linkArticle.indexOf(r), 1);
                        $scope.linkArticleIds.splice($scope.linkArticleIds.indexOf(id), 1)
                    }
                });
            };

            $scope.removeActivity = function (id) {
                angular.forEach($scope.linkActivity, function (r) {
                    if (r.id === id) {
                        $scope.linkActivity.splice($scope.linkActivity.indexOf(r), 1);
                        $scope.linkActivityIds.splice($scope.linkActivityIds.indexOf(id), 1)
                    }
                });
            };

            $scope.removePreviewImg = function (resource) {
                $log.info("remove preview image:", resource);
                angular.forEach($scope.previewImg, function (r) {
                    if (r.id === resource.id) {
                        $scope.previewImg.splice($scope.previewImg.indexOf(resource), 1);
                    }
                });
            };

            $scope.removeBannerImg = function (resource) {
                $log.info("remove banner image:", resource);
                angular.forEach($scope.bannerImg, function (r) {
                    if (r.id === resource.id) {
                        $scope.bannerImg.splice($scope.bannerImg.indexOf(resource), 1);
                    }
                });
            };

            $scope.stripFormat = ResourceTranslator.stripFormat;
            $scope.create = function (type) {
                $log.info("create topic");
                $rootScope.isEditingTopic = true;
                $scope.create.show = true;
                $scope.topic = {type: parseInt(type)};
                $scope.topImg = {};

                $scope.save = function () {
                    $log.info("save topic");
                    if (!$scope.topic.title || $scope.topic.title.length == 0) {
                        Alert.alert("标题不能为空", true);
                        return;
                    }

                    if ($scope.topic.type == 0 && $scope.linkArticle.length == 0) {
                        Alert.alert("请添加文章!", true);
                        return;
                    }

                    if ($scope.topic.type == 1 && $scope.linkActivity.length == 0) {
                        Alert.alert("请添加活动!", true);
                        return;
                    }

                    var previewImg = [];
                    angular.forEach($scope.previewImg, function (r) {
                        if (r.tp == 0 && previewImg.length < 1) {
                            previewImg.push(r);
                        }
                    });

                    if (previewImg.length == 0) {
                        Alert.alert("请选择预览图", true);
                        return;
                    }

                    var bannerImg = [];
                    angular.forEach($scope.bannerImg, function (r) {
                        if (r.tp == 0 && bannerImg.length < 1) {
                            bannerImg.push(r);
                        }
                    });

                    if (bannerImg.length == 0) {
                        Alert.alert("请选择banner图", true);
                        return;
                    }

                    $scope.topic.topImage = previewImg[0];
                    if (bannerImg.length > 0) {
                        $scope.topic.bannerImage = bannerImg[0];
                    }

                    $scope.topic.articleIds = $scope.linkArticleIds;
                    $scope.topic.activityIds = $scope.linkActivityIds;
                    $log.info("topic:", $scope.topic);

                    var createCheck = function () {
                        $scope.uploading = true;
                        Topic.save($scope.topic, function () {
                            Alert.alert("操作成功").then(function () {
                                $scope.create.show = false;
                                $scope.topiclist.show = true;
                                $scope.uploading = false;
                                //refresh($scope.grid.page);
                                document.location.reload(true);
                            });
                        }, function (res) {
                            $scope.updating = true;
                            $scope.uploading = false;
                            Alert.alert("操作失败：" + res.data, true);
                        });
                    };
                    createCheck();
                };

                $scope.cancel = function () {
                    $scope.create.show = false;
                    $scope.topiclist.show = true;
                    $scope.uploading = false;

                    clearData();
                };
            };

            $scope.edit = function (idx) {
                var n = $scope.data.data[idx];
                Topic.get({id: n.id}, function (o) {
                    $log.info("edit topic:", o);
                    $rootScope.isEditingTopic = true;
                    $scope.topic = o;

                    $scope.edit.show = true;

                    $scope.previewImg = [o.topImage];
                    $scope.bannerImg = [o.bannerImage];

                    $scope.linkArticleIds = [];
                    $scope.linkArticle = o.articles;
                    angular.forEach(o.articles, function (o) {
                        $scope.linkArticleIds.push(o.id);
                    });

                    $scope.linkActivityIds = [];
                    $scope.linkActivity = o.activities;
                    angular.forEach(o.activities, function (o) {
                        $scope.linkActivityIds.push(o.id);
                    });

                    $log.info($scope.linkArticle);
                    $log.info($scope.previewImg);

                    $scope.update = function () {
                        $log.info("update topic");

                        var previewImg = $scope.previewImg;
                        if (previewImg.length == 0) {
                            Alert.alert("请选择预览图", true);
                            return;
                        }

                        var bannerImg = $scope.bannerImg;
                        if (bannerImg.length == 0) {
                            Alert.alert("请选择banner图", true);
                            return;
                        }

                        if ($scope.topic.type == 0 && $scope.linkArticle.length == 0) {
                            Alert.alert("请添加文章!", true);
                            return;
                        }

                        if ($scope.topic.type == 1 && $scope.linkActivity.length == 0) {
                            Alert.alert("请添加活动!", true);
                            return;
                        }

                        $scope.topic.topImage = previewImg[0];
                        if (bannerImg.length > 0) {
                            $scope.topic.bannerImage = bannerImg[0];
                        }

                        $scope.topic.articleIds = $scope.linkArticleIds;
                        $scope.topic.activityIds = $scope.linkActivityIds;
                        $log.info("topic:", $scope.topic);


                        var editCheck = function () {
                            $scope.uploading = true;
                            Topic.update({id: o.id}, $scope.topic, function () {
                                Alert.alert("操作成功").then(function () {
                                    $scope.edit.show = false;
                                    $scope.topiclist.show = true;
                                    $scope.uploading = false;
                                    //refresh($scope.grid.page);
                                    document.location.reload(true);
                                });
                            }, function (res) {
                                $scope.updating = true;
                                $scope.uploading = false;
                                Alert.alert("操作失败：" + res.data, true);
                            });
                        };
                        editCheck();
                    };

                    $scope.cancel = function () {
                        $scope.edit.show = false;
                        $scope.topiclist.show = true;
                        $scope.uploading = false;

                        clearData();
                    };

                });
            };

            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("del topic:", o);
                ConfirmService.confirm('确定要删除此专题吗?').then(function () {
                    Topic.remove({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        //Alert.alert("操作成功");
                        var dom = document.getElementById("delete_success");
                        dom.style.display = "block";
                        setTimeout(function () {
                            dom.style.display = "none";
                        },2000)
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.view = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("view topic:", o);
                $modal.open({
                    templateUrl: 'partials/topic/topic_view.html',
                    controller: function ($scope, $modalInstance, topic) {
                        $scope.topic = topic;

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        topic: function () {
                            return Topic.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.publish = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("publish topic:", o);
                ConfirmService.confirm('确定要发布此专题吗?').then(function () {
                    Topic.publish.commit({id: o.id}, function () {
                        o.status = 1;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

        }])
    .controller('DeletedTopicCtrl', ['$scope', '$modal', '$log', 'Alert', 'ConfirmService', 'CONFIG', 'data', 'Topic', 'VALID',
        function ($scope, $modal, $log, Alert, ConfirmService, CONFIG, data, Topic, VALID) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.FALSE};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
                if ($scope.grid.type) {
                    SPEC.tp = $scope.grid.type;
                }
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Topic.get(SPEC, function () {
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
                $log.info("view topic:", o);
                $modal.open({
                    templateUrl: 'partials/topic/topic_view.html',
                    controller: function ($scope, $modalInstance, topic) {
                        $scope.topic = topic;

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        topic: function () {
                            return Topic.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.recover = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("recover topic:", o);
                ConfirmService.confirm('确定要恢复此专题吗?').then(function () {
                    Topic.recover.commit({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

        }]);

/* Controllers */

angular.module('myApp.usercontrollers', ['ui.bootstrap'])
    .controller('UserCtrl', ['$scope', '$stateParams', '$modal', '$log', 'Alert', 'ConfirmService', 'User', 'CONFIG', 'data', 'FileUploader', 'user_black',
        function ($scope, $stateParams, $modal, $log, Alert, ConfirmService, User, CONFIG, data, FileUploader, user_black) {
            $scope.data = data;
            $scope.user_black = user_black;
            $scope.grid = {
                page: 1,
                sort: 0
            };

            var refresh = function (page, sort) {
                var SPEC = {page: page, size: CONFIG.limit, sort: sort, status: 0};
                if ($scope.grid.name) {
                    SPEC.name = $scope.grid.name;
                }
                SPEC.sort = $scope.grid.sort;

                var d = User.get(SPEC, function () {
                    $scope.data = d;
                });
            };

            $scope.search = function () {
                refresh($scope.grid.page, $scope.grid.sort);
            };

            $scope.$watch('grid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refresh(newVal, $scope.grid.sort);
                }
            });

            $scope.$watch('grid.sort', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refresh($scope.grid.page, newVal);
                }
            });

            $scope.create = function () {
                $modal.open({
                    templateUrl: 'partials/user/user_create.html',
                    controller: function ($scope, $modalInstance) {
                        $log.info('create user');
                        $scope.user = {"tp": 0};

                        // -- upload icon setting begin --//
                        var up = function (tp) {
                            var opts = {
                                queueLimit: 1,
                                url: '/api/pub/up',
                                alias: 'bin',
                                removeAfterUpload: true
                            };

                            var uploader = new FileUploader(opts);

                            uploader.filters.push({
                                name: 'imageFilter',
                                fn: function (item) {
                                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                                    return '|jpg|png|jpeg|'.indexOf(type) !== -1;
                                }
                            });

                            uploader.onSuccessItem = function (fileItem, data) {
                                if (data.code == 0) {
                                    Alert.alert('上传失败: ' + data, true);
                                    return;
                                }
                                uploaded(data, tp);
                            };
                            uploader.onErrorItem = function (fileItem, res, status) {
                                Alert.alert('上传失败: ' + status + ',  ' + res, true);
                            };

                            return uploader;
                        };
                        $scope.iconUploader = up("icon");
                        $scope.coverUploader = up("cover");

                        var flag = 0;

                        var uploaded = function (tmpId, tp) {
                            flag = flag - 1;
                            if (tp == "icon") {
                                $log.info("uploaded iconId:", tmpId);
                                $scope.user.icon = tmpId;
                                if (flag > 0) {
                                    $scope.coverUploader.uploadAll();
                                }
                            } else {
                                $log.info("uploaded coverId:", tmpId);
                                $scope.user.cover = tmpId;
                                if (flag > 0) {
                                    $scope.iconUploader.uploadAll();
                                }
                            }
                            if (flag <= 0) {
                                save();
                            }
                        };

                        $scope.save = function () {
                            flag = $scope.iconUploader.queue.length + $scope.coverUploader.queue.length;
                            //如果有头像，则先上传头像
                            if ($scope.iconUploader.queue.length) {
                                $scope.iconUploader.uploadAll();
                            } else if ($scope.coverUploader.queue.length) {
                                $scope.coverUploader.uploadAll();
                            } else {
                                save();
                            }
                        };
                        // -- upload icon setting end --//


                        var save = function () {
                            $log.info('save user');
                            if (!$scope.user.nick) {
                                Alert.alert('请设置昵称', true);
                                return;
                            }
                            if (!$scope.user.mobile) {
                                Alert.alert('手机号错误', true);
                                return;
                            }
                            if (!$scope.user.password) {
                                Alert.alert('请设置密码', true);
                                return;
                            }
                            if (!$scope.user.confirmPassword) {
                                Alert.alert('请设置确认密码', true);
                                return;
                            }
                            if ($scope.user.password != $scope.user.confirmPassword) {
                                return;
                            }
                            User.save($scope.user, function (res) {
                                if (res.code == 1) {
                                    Alert.alert("操作成功");
                                    //refresh list
                                    refresh(1, 0);
                                    $modalInstance.close();
                                } else {
                                    // Alert.alert("操作失败：" + res.data, true);
                                    Alert.alert("操作失败：" + "手机号已存在", true);
                                }
                            }, function (res) {
                                $scope.updating = true;
                                var err = "";
                                angular.forEach(res.data, function (o) {
                                    err += o.message + ",";
                                });
                                Alert.alert("操作失败：" + err, true);
                            });
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        }
                    }
                });
            };

            $scope.edit = function (idx) {
                var o = $scope.data.data[idx];
                $modal.open({
                    templateUrl: 'partials/user/user_edit.html',
                    controller: function ($scope, $modalInstance, user) {
                        $log.info("edit user:", user);
                        var wp = user.point;
                        $scope.user = user;

                        // -- upload icon setting begin --//
                        var uploaded = function (imgId) {
                            $log.info("uploaded user img:", imgId);
                            User.update({id: user.id}, {"key": "icon", "val": imgId}, function () {
                                Alert.alert('操作成功！');
                                User.get({'id': user.id}, {}, function (u) {
                                    o.icon = u.icon;
                                    $scope.user = u;
                                    $scope.uploading = false;
                                });
                            }, function (res) {
                                Alert.alert('操作失败！' + res, true);
                            });
                        };

                        var uploaded = function (imgId, tp) {
                            $log.info("uploaded user img:", imgId);
                            User.update({id: user.id}, {"key": tp, "val": imgId}, function () {
                                Alert.alert('操作成功！');
                                User.get({'id': user.id}, {}, function (u) {
                                    o[tp] = u[tp];
                                    $scope.user = u;
                                    $scope.uploading = false;
                                });
                            }, function (res) {
                                Alert.alert('操作失败！' + res, true);
                            });
                        };

                        var up = function (tp) {
                            var opts = {
                                queueLimit: 1,
                                url: '/api/pub/up',
                                alias: 'bin',
                                removeAfterUpload: true
                            };

                            var uploader = new FileUploader(opts);

                            uploader.filters.push({
                                name: 'imageFilter',
                                fn: function (item) {
                                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                                    return '|jpg|png|jpeg|'.indexOf(type) !== -1;
                                }
                            });

                            uploader.onSuccessItem = function (fileItem, data) {
                                if (data.code == 0) {
                                    Alert.alert('上传失败: ' + data, true);
                                    return;
                                }
                                uploaded(data, tp);
                            };
                            uploader.onErrorItem = function (fileItem, res, status) {
                                Alert.alert('上传失败: ' + status + ',  ' + res, true);
                            };

                            return uploader;
                        };
                        $scope.iconUploader = up("icon");
                        $scope.coverUploader = up("cover")

                        $scope.upload = function (tp) {
                            $scope.uploading = true;
                            if (tp == "icon") {
                                $scope.iconUploader.uploadAll();
                            } else {
                                $scope.coverUploader.uploadAll();
                            }
                        };
                        // -- upload icon setting end --//

                        $scope.save = function (name, val) {
                            var SPEC = {"key": name, "val": val};
                            if (name == 'nick' && !val) {
                                return '内容不能为空';
                            } else if (name == 'point') {
                                User.point.update({id: user.id}, SPEC, function () {
                                    User.get({'id': user.id}, {}, function (u) {
                                        o.level = u.level;
                                    });
                                }, function (res) {
                                    $scope.user.point = wp;
                                    Alert.alert('积分修改失败');
                                })
                            } else if (name == 'mobile') {
                                if (!val.match(/^((13|15|18|99)[0-9]{9})|(145)[0-9]{8}$/)) {
                                    return '手机号码错误';
                                }
                                User.update({id: user.id}, SPEC, function () {
                                    //修改手机号成功
                                }, function (res) {
                                    Alert.alert('手机号已存在');
                                    User.get({'id': user.id}, {}, function (u) {
                                        $scope.user.mobile = u.mobile;
                                    });
                                })
                            } else {
                                return User.update({id: user.id}, SPEC, function () {
                                    if (name == "point") {
                                        User.get({'id': user.id}, {}, function (u) {
                                            o.level = u.level;
                                        });
                                    } else {
                                        //刷新列表
                                        o[name] = val;
                                    }
                                });
                            }
                        };

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        user: function () {
                            return User.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.upgrade = function (idx) {
                var o = $scope.data.data[idx];
                ConfirmService.confirm('确定推荐该用户为生活家吗?').then(function () {
                    User.upgrade.update({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.del = function (idx) {
                var u = $scope.data.data[idx];
                $log.info("del user:", u);
                ConfirmService.confirm('确定要删除此用户吗?').then(function () {
                    User.remove({id: u.id}, function (res) {
                        console.log(res);
                        var tmpStr = '';
                        for (var k in res) {
                            if (k.match(/^\d+$/)) {
                                tmpStr += res[k];
                            }
                        }
                        console.log(tmpStr);
                        if (tmpStr == 'delete user successfully') {
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
                        console.log(tmpStr);
                        Alert.alert("操作失败：" + tmpStr, true);
                    });
                });
            };
        }])
    .controller('BlackCtrl', ['$scope', '$stateParams', '$modal', '$log', 'Alert', 'ConfirmService', 'User', 'CONFIG', 'data', 'FileUploader', 'user_black',
        function ($scope, $stateParams, $modal, $log, Alert, ConfirmService, User, CONFIG, data, FileUploader, user_black) {
            $scope.data = data;
            $scope.user_black = user_black;
            $scope.grid = {
                page: 1,
                sort: 0
            };

            var refresh = function (page, sort) {
                var SPEC = {page: page, size: CONFIG.limit, sort: sort, status: 1};    //todo 黑名单筛选条件
                if ($scope.grid.name) {
                    SPEC.name = $scope.grid.name;
                }

                var d = User.get(SPEC, function () {
                    $scope.data = d;
                });
            };

            $scope.search = function () {
                refresh($scope.grid.page, $scope.grid.sort);
            };

            $scope.$watch('grid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refresh(newVal, $scope.grid.sort);
                }
            });

            $scope.$watch('grid.sort', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refresh($scope.grid.page, newVal);
                }
            });

            $scope.recover = function (idx) {
                var u = $scope.data.data[idx];
                $log.info("recover user:", u);
                ConfirmService.confirm('确定要恢复此用户吗?').then(function () {
                    User.recover.update({id: u.id}, function (res) {
                        console.log(res);
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        console.log(res);
                        var tmpStr = '';
                        for (var k in res) {
                            if (k.match(/^\d+$/)) {
                                tmpStr += res[k];
                            }
                        }
                        console.log(tmpStr);
                        Alert.alert("操作失败：" + tmpStr, true);
                    });
                });
            };
        }]);
