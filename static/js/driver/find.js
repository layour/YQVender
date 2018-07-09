;$(function () {
    'use strict';
    $.showPreloader();
    var lng,lat;
    var $infinite_scroll_preloader = $(".infinite-scroll-preloader");
    var $find_filter = $(".find-filter");
    $(".filter-box-menu").removeClass("dis-n");
    var lng = getCookie("lng");
    var lat = getCookie("lat");
    $.hidePreloader();
    //多个标签页下的无限滚动
    $(document).on("pageInit", "#pageFind", function (e, id, page) {
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
                getListData();
                // 更新最后加载的序号
                $.refreshScroller();
            }, 1000);
            time++;
        });
    });
    /*tab切换*/
    $(document).on("click", ".tab-link", function () {
        var _this = $(this);
        var currentPage = Number(_this.attr("data-currentpage"));
        var infotype = Number(_this.attr("data-info-type"));
        if (currentPage == 1) {
            getListData();
        }
        if (infotype == 2) {
            $find_filter.css("display", "block");
        } else {
            $find_filter.css("display", "none");
        }
    });
    //筛选框显示
    $(".find-filter").on("click",function () {
        if($.closePanel('#panel-right-demo')){
            $.closePanel('#panel-right-demo');
        }else{
            $.openPanel('#panel-right-demo');
        }
    })
    //关闭筛选框显示
    $(".find-close").on("click",function () {
        $.closePanel('#panel-right-demo');
    })
    $(document).on("click",".item",function () {
        var _this = $(this);
        var filterInfo_type = _this.attr("data-filterInfo-type");
        $(this).addClass("active").siblings(".item").removeClass("active");
        if (filterInfo_type == "beginProvince") {
            var idx =_this.attr("data-idx");
            $(".begin-city").html("");
            $(".begin-county").html("");
            setCities(addressData.children[idx],".begin-city","beginCity","city");
            setCities(addressData.children[idx].children[0],".begin-county","beginCounty","county");
        }else if(filterInfo_type == "beginCity"){
            $(".begin-county").html("");
            var pidx =$(".begin-province .item.active").attr("data-idx");
            var cidx =_this.attr("data-idx");
            if(addressData.children[pidx].children[cidx].children.length>0){
                setCities(addressData.children[pidx].children[cidx],".begin-county","beginCounty","county");
            }else{
                $(".begin-county").html("没有区可选");
            }
        }else  if (filterInfo_type == "endProvince") {
            console.log(11);
            var idx =_this.attr("data-idx");
            $(".end-city").html("");
            $(".end-county").html("");
            setCities(addressData.children[idx],".end-city","endCity","city");
            setCities(addressData.children[idx].children[0],".end-county","endCounty","county");
        }else if(filterInfo_type == "endCity"){
            $(".end-county").html("");
            var pidx =$(".end-province .item.active").attr("data-idx");
            var cidx =_this.attr("data-idx");
            if(addressData.children[pidx].children[cidx].children.length>0){
                setCities(addressData.children[pidx].children[cidx],".end-county","endCounty","county");
            }else{
                $(".end-county").html("没有区可选");
            }
        }
    })
    $(document).on("click",".set",function () {
        var $item_box = $(".item-box");
        var params={};
        $item_box.forEach(function (v,index) {
            var filterInfo_type = $item_box.eq(index).find(".item.active").attr("data-filterInfo-type");
            var filterInfo_type_val = $item_box.eq(index).find(".item.active").attr("data-type");
            switch (filterInfo_type){
                case 'carType':
                    params.carType = filterInfo_type_val;
                    params.infoType = 2;
                    break;
                case 'companyType':
                    params.companyType = filterInfo_type_val;
                    params.infoType = 2;
                    break;
                case 'goodType':
                    params.goodsType = filterInfo_type_val;
                    params.infoType = 2;
                    break;
                case 'beginProvince':
                    params.beginProvinceId = filterInfo_type_val;
                    params.infoType = 2;
                    break;
                case 'beginCity':
                    params.beginCityId = filterInfo_type_val;
                    params.infoType = 2;
                    break;
                case 'beginCounty':
                    params.beginCountyId = filterInfo_type_val;
                    params.infoType = 2;
                    break;
                case 'endProvince':
                    params.endProvinceId = filterInfo_type_val;
                    params.infoType = 2;
                    break;
                case 'endCity':
                    params.endCityId = filterInfo_type_val;
                    params.infoType = 2;
                    break;
                case 'endCounty':
                    params.endCountyId = filterInfo_type_val;
                    params.infoType = 2;
                    break;
            }
        })
        var str = '';
        for(var i in params){
            str += i+"="+params[i]+"&";
        }
        str = str.substr(0,str.length-1);
        if(params.infoType){
            if($(".item-box .item.active").length>0){
                window.location.href = "findList.html?"+str;
                $.closePanel();
            }else{
                $.toast('请选择筛选条件', 2000, 'custom-toast');
            }
        }else{
            $.toast('请选择筛选条件', 2000, 'custom-toast');
        }
    });
    $(".reset").on("click",function () {
        $(".item-box .item").removeClass("active");
    })
    $(".filter-item-box .icon").on("click",function () {
        var type = $(this).attr("data-type");
        if($(this).hasClass("icon-right")){
            $(this).addClass("icon-down").removeClass("icon-right");
            if (type == "address") {
                $(this).parents(".address-box").find(".item-box").css("display","block");
            }else{
                $(this).parents(".filter-item-box").find(".item-box").not(".address-box .item-box").css("display","block");
            }
        }else{
            $(this).addClass("icon-right").removeClass("icon-down");
            if (type == "address") {
                $(this).parents(".address-box").find(".item-box").css("display", "none");
            } else {
                $(this).parents(".filter-item-box").find(".item-box").not(".address-box .item-box").css("display", "none");
            }
        }
    })
    function getListData() {
        var currentDemo = $(".tab-link.active");
        var idx = currentDemo.index();
        var index = parseInt(idx) + 1;
        var currentPage = currentDemo.attr("data-currentPage");
        var infoType = currentDemo.attr("data-info-type");
        var currentTab = $("#tab" + index);
        var data = {
            pageNum: currentPage,
            pageSize: config.pageSize,
            infoType: infoType,
            lat: lat||"39.90469",
            lng: lng||"116.40717"
        }
        ajaxRequests("/driverInformationRelease/informationReleaseList","post",{
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
                    addItem("#infoList" + index, response.data, "#find" + index);
                    if (currentPage == 1 && response.data.total < config.pageSize) {
                        $infinite_scroll_preloader.eq(idx).css("display", "none");
                    }
                    var totalPage = Math.ceil(response.data.total / config.pageSize);
                    currentPage++;
                    currentDemo.attr("data-currentPage", currentPage);
                    currentDemo.attr("data-totalpage", totalPage);
                }else {
                    if (currentPage == 1) {
                        setListNone(currentTab);
                    } else {
                        setListPageNone(currentTab);
                    }
                }
            }else if(response.retCode === '1000'){
                pageGo("login");
            }else {
                $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
            }
        })
    }
    function setTmpl(data,obj,type) {
        var tmpl = '';
        data.forEach(function (v) {
            tmpl +='<div class="item" data-type="'+v.type+'" data-filterInfo-type="'+type+'">'+v.name+'</div>';
        })
        tmpl += ' <div class="clearfix"></div>';
        $(obj).html(tmpl);
    }
    var addressData;
    $.getJSON('../../static/js/lib/address.json',function (data) {
        addressData = {children: data};
        setCities(addressData,".begin-province","beginProvince","province");
        setCities(addressData.children[0],".begin-city","beginCity","city");
        setCities(addressData.children[0].children[0],".begin-county","beginCounty","county");
        setCities(addressData,".end-province","endProvince","province");
        setCities(addressData.children[0],".end-city","endCity","city");
        setCities(addressData.children[0].children[0],".end-county","endCounty","county");
    })
    function setCities(data,obj,type,cityType) {
        var tmpl = '';
        data.children.forEach(function (v,index) {
            tmpl +='<div class="item" data-type="'+v.code+'" data-idx="'+index+'" data-filterInfo-type="'+type+'" data-citytype="'+cityType+'">'+v.name+'</div>';
        })
        tmpl += ' <div class="clearfix"></div>';
        $(obj).html(tmpl);
    }
    setTmpl(config.vehicle_type,".car-type",'carType');
    setTmpl(config.vender_type,".company-type",'companyType');
    setTmpl(config.goods_type,".goods-type",'goodType');
    setBanner('driver',function (response) {
        addItem("#banner", response, ".swiper-wrapper");
        addItem("#outlink", config, ".out-link");
        /*发现获取列表*/
        getListData();
        $.init();
    })
});
