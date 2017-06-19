'use strict';

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
