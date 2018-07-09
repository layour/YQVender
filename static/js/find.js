$(function () {
    'use strict';
    var totalPage = 1;
    //多个标签页下的无限滚动
    $(document).on("pageInit", "#page-fixed-tab-infinite-scroll", function (e, id, page) {
        var loading = false;
        var time = 0;
        var currentPage = $(".tab-link.active").attr("data-currentpage");
        $(page).on('infinite', function () {
            // 如果正在加载，则退出
            if (loading) return;
            // 设置flag
            loading = true;
            var hasNext = true;
            if (currentPage >= totalPage) {
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
                var index = parseInt($(".tab.active").index()) + 1;
                addItem("#infoList" + index, config.findInfo, "#tab" + index + " ul")
                // 更新最后加载的序号
                $.refreshScroller();
            }, 1000);
            time++;
        });
    });
    /*二级筛选加载*/
    $(document).on("click", ".bottom-arrow", function () {
        $(".bottom-arrow").removeClass("active");
        $(this).addClass("active");
        $(".filter-box ul").html("");
        var type = $(this).attr("data-type");
        switch (type) {
            case 'carType':
                addItem("#filter_content", config.findFilter.car.carType, ".filter-box ul");
                break;
            case 'start':
                addItem("#filter_content", config.findFilter.car.start, ".filter-box ul");
                break;
            case 'end':
                addItem("#filter_content", config.findFilter.car.end, ".filter-box ul");
                break;
            case 'goodsType':
                addItem("#filter_content", config.findFilter.car.goodsType, ".filter-box ul");
                break;
            case 'venderType':
                addItem("#filter_content", config.findFilter.promotions.venderType, ".filter-box ul");
                break;
        }
    })
    /*点击筛选赋值*/
    $(document).on("click", ".condition", function () {
        $(".filter-box ul").html("");
        var index = parseInt($(".tab.active").index()) + 1;
        var currentPage = $(".btn-" + index).attr("data-currentPage");
        var infoType = $(".btn-" + index).attr("data-info-type");
        $("#tab" + index + " ul").html("");
        $(this).addClass("active");
        var threeType = $(".bottom-arrow.active").attr("data-type");
        var datas = {
            pageNum: currentPage,
            pageSize: config.pageSize,
            infoType: infoType,
        }
        switch (infoType) {
            case 1:
                if (threeType = "carType") {
                    datas.carType = $(".filter-box .condition").attr("data-type");
                }
                if (threeType = "start") {
                    datas.beginCityId = $(".filter-box .condition").attr("data-type");
                }
                if (threeType = "end") {
                    datas.endCityId = $(".filter-box .condition").attr("data-type");
                }
                break;
            case 2:
                if (threeType = "goodType") {
                    datas.goodsType = $(".filter-box .condition").attr("data-type");
                }
                break;
            case 3:
                datas.carType = $(".filter-box .condition").attr("data-type");
                break;
            case 4:
                break;
        }
        getListData(datas);
        $(".filter-type").html("");
    })
    /*点击显示筛选*/
    $(document).on("click", ".tab-link", function () {
        var type = $(this).attr("data-type");
        $(".filter-type").html("");
        $(".filter-box ul").html("");
        var currentPage = $(this).attr("data-currentPage");
        if (currentPage == 1 && type != "filter") {
            getListData();
        }
        switch (type) {
            case 'car':
                addItem("#filter_type", config.findFilter.car, ".filter-type");
                break;
            case 'promotions':
                addItem("#filter_type", config.findFilter.promotions, ".filter-type");
                break;
            case 'others':
                break;
        }
    })


    function getListData(bodyData) {
        var currentDemo = $(".tab-link.active");
        var index = parseInt(currentDemo.index()) + 1;
        var currentPage = $(".btn-" + index).attr("data-currentPage");
        var currentTab = $("#tab" + index);
        var infoType = currentDemo.attr("data-info-type");
        if (currentTab.find("li").length > 6) {
            $("#infinite-scroll-preloader").css("display", "block")
        }
        var body = bodyData || {
                pageNum: currentPage,
                pageSize: config.pageSize,
                infoType: infoType,
            };
        var param = {
            url: '/driverInformationRelease/informationReleaseList',
            type: 'post',
            data: {
                body: body
            },
            callback: function (response) {
                if (response.retCode === '0') {
                    for (var i = 0; response.data.list && i < response.data.list.length; i++) {
                        response.data.list[i].goods = filterGoodsTypes(response.data.list[i].goodsType);
                        console.log(response.data.list);
                        // response.data.list[i].companyTypesName = filterCompanyTypes(response.data.list[i].companyTypesName);
                    }
                    console.log(11);
                    addItem("#infoList" + index, response.data, "#find" + index);
                    totalPage = Math.ceil(response.data / config.pageSize);
                    currentPage++;
                    $(".btn-" + index).attr("data-currentPage", currentPage);
                } else {
                    $.alert(response.retMsg || '操作失败');
                }
            }
        }
        ajaxRequest(param);
    }

    getListData();
    addItem("#banner", config, ".swiper-wrapper");
    addItem("#outlink", config, ".out-link");
    $.init();
});
