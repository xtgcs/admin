'use strict';

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
