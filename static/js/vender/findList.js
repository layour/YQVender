;$(function () {
    'use strict';
    var currentPage = 1;
    var totalPage = 1;
    var infoType = getQueryString("infoType");
    var carType = getQueryString("carType");
    var companyType = getQueryString("companyType");
    var goodsType = getQueryString("goodsType");
    var beginCityId = getQueryString("beginCityId");
    var beginProvinceId = getQueryString("beginProvinceId");
    var beginCountyId = getQueryString("beginCountyId");
    var endProvinceId = getQueryString("endProvinceId");
    var endCountyId = getQueryString("endCountyId");
    var endCityId = getQueryString("endCityId");
    var lng = getCookie("lng");
    var lat = getCookie("lat");
    var $infinite_scroll_preloader = $(".infinite-scroll-preloader");
    //多个标签页下的无限滚动
    $(document).on("pageInit", "#pageFind", function (e, id, page) {
        var loading = false;
        var time = 0;
        $(page).on('infinite', function () {
            // 如果正在加载，则退出
            if (loading) return;
            // 设置flag
            loading = true;
            var hasNext = true;
            if (currentPage > totalPage) {
                hasNext = false;
            }
            // 模拟1s的加载过程
            setTimeout(function () {
                // 重置加载flag
                loading = false;
                if (!hasNext) {
                    // 加载完毕，则注销无限加载事件，以防不必要的加载
                    $.detachInfiniteScroll($('.infinite-scroll'));
                    // 删除加载提示符
                    $('.infinite-scroll-preloader').html("<span style='font-size: .6rem;color: #dbdbdb;'>到底了(⊙o⊙)</span>");
                    return;
                }
                getListData();
                // 更新最后加载的序号
                $.refreshScroller();
            }, 1000);
            time++;
        });
    });
    function getListData() {
        var data = {
            pageNum: currentPage,
            pageSize: 20,
            infoType: infoType,
            lat: lat||"39.90469",
            lng: lng||"116.40717"
        }
        if (infoType == 2) {
            var index = 1;
        } else {
            var index = 1;
        }
        if (carType) {
            data.carType = carType;
        }
        if (companyType) {
            data.companyType = companyType;
        }
        if (goodsType) {
            data.goodsType = goodsType;
        }
        if (beginCityId) {
            data.beginCityId = beginCityId;
        }
        if (beginProvinceId) {
            data.beginProvinceId = beginProvinceId;
        }
        if (beginCountyId) {
            data.beginCountyId = beginCountyId;
        }
        if (endProvinceId) {
            data.endProvinceId = endProvinceId;
        }
        if (endCityId) {
            data.endCityId = endCityId;
        }
        if (endCountyId) {
            data.endCountyId = endCountyId;
        }
        var currentTab = $(".find-list");
        ajaxRequests("/venderInformationRelease/informationReleaseList","post",{
            body:data
        },function (response) {
            if (response.retCode === '0') {
                if (response.data.total && response.data.total > 0) {
                    var datas = response.data.list;
                    for (var i = 0;  i < datas.length; i++) {
                        var siteInfo = getType(Number(datas[i].companyType));
                        datas[i].companyTypeInfo = siteInfo.title;
                        datas[i].goodsType = filterInfoGoodsTypes(datas[i].goodsType);
                        datas[i].carType = filterInfoCarTypes(datas[i].carType);
                    }
                    console.log(index);
                    addItem("#infoList" + index, response.data, "#findList");
                    if (currentPage == 1 && response.data.total < 20) {
                        $infinite_scroll_preloader.css("display", "none");
                    }
                    totalPage = Math.ceil(response.data.total / 20);
                    currentPage++;
                }else {
                    if (currentPage == 1) {
                        setListNone(currentTab);
                    } else {
                        setListPageNone(currentTab);
                    }
                }
            } else {
                $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
            }
        })
    }
    getListData();
    $.init();
});
