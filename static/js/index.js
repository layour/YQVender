;$(function () {
    'use strict';
    /*加载模板数据*/
    addItem("#banner", config, ".swiper-wrapper");
    addItem("#subnav", config, ".menu-nav");
    if (window.gasstation) {
        var lngLat = window.gasstation.getLocation();
    }
    var $infinite_scroll_preloader = $(".infinite-scroll-preloader");
    //多个标签页下的无限滚动
    $(document).on("pageInit", "#index", function (e, id, page) {
        var loading = false;
        var time = 0;
        $(page).on('infinite', function () {
            var currentDemo = $(".tab-link.active");
            var idx = currentDemo.index();
            var currentPage = Number(currentDemo.attr("data-currentpage"));
            var totalPage = Number(currentDemo.attr("data-totalpage"));
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
                    $.detachInfiniteScroll($('.infinite-scroll').eq(idx));
                    // 删除加载提示符
                    $('.infinite-scroll-preloader').eq(idx).html("<span style='font-size: .6rem;color: #dbdbdb;'>到底了(⊙o⊙)</span>");
                    return;
                }
                getList();
                // 更新最后加载的序号
                $.refreshScroller();
            }, 1000);
            time++;
        });
    });
    $("#other-business-choice").on("change", function () {
        location.href = "map.html"
    })
    $(document).on("click", ".tab-link", function () {
        var companyTpe = $(this).attr("data-type");
        var currentPage = $(this).attr("data-currentPage");
        if ($(this).hasClass("btn_3")) {
            location.href = "map.html"
        } else {
            if (currentPage == 1) {
                getList();
            }
        }
    })

    function getList() {
        var currentDemo = $(".tab-link.active");
        var index = parseInt(currentDemo.index()) + 1;
        var currentPage = currentDemo.attr("data-currentPage");
        var companyTpe = currentDemo.attr("data-type");
        var currentTab = $("#tab" + index);
        if (currentTab.find("li").length < 6 || currentPage == 1) {
            $(".infinite-scroll-preloader").eq(index).css("display", "none");
        }
        if(lngLat){
            var lng = lngLat.lng;
            var lat = lngLat.lat;
        }else{
            var lng = '116.427281';
            var lat = '39.903719';
        }
        ajaxRequests('/driverVenderNoLogin/driverVenderList','post',{
            "body": {
                pageNum: currentPage,
                pageSize: 10,
                companyType: companyTpe,
                lat: lat,
                lng: lng
            }
        },function (response) {
            if (response.retCode === '0') {
                /*加载模板数据*/
                if (response.data.total !== 0) {
                    var datas = response.data.list;
                    for (var i = 0; i < datas.length; i++) {
                        for (var j in datas[i]) {
                            if (j === 'earthDistance') {
                                datas[i].earthDistance = parseFloat(datas[i].earthDistance / 1000).toFixed(2);
                            }
                        }
                    }
                    addItem("#list" + index, response.data, "#demo" + index);
                    var totalPage = Math.ceil(response.data.total / 10);
                    currentPage++;
                    currentDemo.attr("data-currentPage", currentPage);
                    currentDemo.attr("data-totalpage", totalPage);
                } else {
                    if (currentPage = 1) {
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
    function infiniteScrollPreloader(n) {
        $infinite_scroll_preloader.css("display", "none");
        $infinite_scroll_preloader.eq(n).css("display", "block");
    }
    getList();
    infiniteScrollPreloader(0);
    $.init();
});

