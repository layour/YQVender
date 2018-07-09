;$(function () {
    'use strict';
    /*加载模板数据*/
    var params = [{loading: true}, {loading: true}];
    var lng,lat;
    var $infinite_scroll_preloader = $(".infinite-scroll-preloader");
    var last_scroll_top = 0;
    //多个标签页下的无限滚动
    $(document).on("pageInit", "#index", function (e, id, page) {

        function infinite(index) {
            console.log("第二次");
            console.log(params[index].loading?"1":"0");
            if (params[index].loading){
                return;
            }
            console.log("第二次infinite");
            params[index].loading = true;
            $infinite_scroll_preloader.eq(index).css("display", "block");
            getList();
            $.refreshScroller();
        }
        $(page).on('infinite', function () {
            var currentDemo = $(".tab-link.active");
            var currentPage = currentDemo.attr("data-currentPage");
            var totalPage = currentDemo.attr("data-totalpage");
            var idx = currentDemo.index();
            var index = parseInt(idx)+1;
            var new_scroll_top =$(".content ").scrollTop();
            var currentTab = $("#tab" + index);
            console.log("new_scroll_top:"+new_scroll_top);
            console.log("last_scroll_top:"+last_scroll_top);

            if (new_scroll_top - last_scroll_top > 600) {
                if (currentPage <= totalPage) {
                    console.log("分页请求开始");
                    // debounce(infinite(idx),2000);
                    infinite(idx);
                }
            }
        });
    });
    $(document).on("click", ".tab-link", function () {
        var currentPage = $(this).attr("data-currentPage");
        if ($(this).hasClass("btn_3")) {
            pageGo("map");
        } else {
            if (currentPage == 1) {
                console.log("第一次开始请求："+currentPage);
                getList();
            }
        }
        last_scroll_top = 0;
    })
    //获取数据
    function getList() {
        var currentDemo = $(".tab-link.active");
        var idx = currentDemo.index();
        var index = parseInt(idx) + 1;
        var currentPage = currentDemo.attr("data-currentPage");
        var companyTpe = currentDemo.attr("data-type");
        var currentTab = $("#tab" + index);
        var totalPage = currentDemo.attr("data-totalpage");
        console.log("请求列表："+currentPage);
        ajaxCompleteRequests('/driverVenderNoLogin/driverVenderList','post',{
            "body": {
                pageNum: currentPage,
                pageSize: 10,
                companyType: companyTpe,
                lat: lat||"39.90469",
                lng: lng||"116.40717"
            }
        },function (response) {
            if (response.retCode === '0') {
                /*加载模板数据*/
                if (response.data.total && response.data.total > 0) {
                    var datas = response.data.list;
                    for (var i = 0; i < datas.length; i++) {
                        datas[i].earthDistance = parseFloat(datas[i].earthDistance / 1000).toFixed(2);
                        if (datas[i].venderResourceList.length > 0) {
                            datas[i].isHaveVenderResourceList = true;
                            for (var j = 0; j < datas[i].venderResourceList.length; j++) {
                                datas[i].venderResourceList[j].usedUnitFee = setNumFixed_2(datas[i].venderResourceList[j].usedUnitFee);
                            }
                        }else{
                            datas[i].isHaveVenderResourceList = false;
                        }

                        datas[i].venderResourceList.resourceGrade = filterOilAndGasType(datas[i].venderResourceList.resourceGrade);
                    }
                    addItem("#list", response.data, "#demo" + index);
                    last_scroll_top = $(".content").scrollTop();
                    if (currentPage == 1 && response.data.total < 10) {
                        $infinite_scroll_preloader.eq(idx).css("display", "none");
                    }
                    var timer = setTimeout(function () {
                        params[idx].loading = false;
                        clearTimeout(timer);
                    },0);
                    var totalPage = Math.ceil(response.data.total / 10);
                    if ((currentPage == totalPage) && (currentPage != 1)) {
                        $.detachInfiniteScroll($infinite_scroll_preloader.eq(idx))
                        $infinite_scroll_preloader.eq(idx).remove();
                        setListPageNone(currentTab);
                        return;
                    }
                    currentPage++;
                    currentDemo.attr("data-currentPage", currentPage);
                    currentDemo.attr("data-totalpage", totalPage);
                } else {
                    if (currentPage == 1) {
                        setListNone(currentTab);
                    } else {
                        setListPageNone(currentTab);
                    }

                }
            } else {
                $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
            }
        },function () {
            if ((currentPage > totalPage) && (currentPage != 1)) {
                $.detachInfiniteScroll($infinite_scroll_preloader.eq(idx))
                $infinite_scroll_preloader.eq(idx).remove();
                setListPageNone(currentTab);
                return;
            }
        },function () {
            $infinite_scroll_preloader.eq(idx).css("display", "none");
        })
    }
    /*app获取经纬度失败时*/
    function failSet() {
        getLngLat(function (data) {
            lng = data[0];
            lat = data[1];
            setCookie("lng",lng);
            setCookie("lat",lat);
            getList();
        },function () {
            lng = '116.40717';
            lat='39.90469';
            setCookie("lng",lng);
            setCookie("lat",lat);
            getList();
        })
    }
    setBanner('driver',function (response) {
        addItem("#banner", response, ".swiper-wrapper");
        addItem("#subnav", config, ".menu");
        //获取经纬度
        failSet();
        $.init();
    })
    //app自动登陆
    function appAutoLogin(){
    	var loginName = getCookie("loginName");
        var loginPwd = getCookie("loginPwd");
        var id = getCookie("id");
        var token = getCookie("token");
        getAPPMethod(function () {
            if(window.gasstation){
                var str = {
                    loginName:loginName,
                    loginPwd:loginPwd,
                    id:id,
                    token:token
                }
                var messageStr = JSON.stringify(str);
                console.log(messageStr);
                window.gasstation && window.gasstation.saveCookie(messageStr);
            }else{
                var str = {
                    loginName:loginName,
                    loginPwd:loginPwd,
                    id:id,
                    token:token
                }
                var messageStr = JSON.stringify(str);
                console.log(messageStr);
            }
        },function(){
        	 var str = {
                     loginName:loginName,
                     loginPwd:loginPwd,
                     id:id,
                     token:token
                 }
                 var messageStr = JSON.stringify(str);
        })
    };
    appAutoLogin();
});


