;//$(function () {
summerready = function(){
    'use strict';
    var companyType = getCookie("companyType");
    var $infinite_scroll_preloader = $(".infinite-scroll-preloader");
    var status = Number(getCookie("status"));
    var $pop = $("#pop");
    var $pop_a = $pop.find("a");
    $(document).on("click", ".tab-link", function () {
        var type = parseInt($(this).attr("data-type"));
        var currentPage = parseInt($(this).attr("data-currentPage"));
        var totalPage = parseInt($(this).attr("data-totalPage"));
        if (currentPage < totalPage || currentPage == 1) {
            infiniteScrollPreloader(type - 1);
            addData(type);
        }
        popSetTab(type);
    })
    //多个标签页下的无限滚动
    $(document).on("pageInit", "#page-fixed-tab-infinite-scroll", function (e, id, page) {
        var loading = false;
        var time = 0;
        $(page).on('infinite', function () {
            var currentDom = $(".tab-link.active");
            var typeIndex = currentDom.attr("data-type");
            var currentPage = Number(currentDom.attr("data-currentpage"));
            var totalPage = Number(currentDom.attr("data-totalPage"));
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
                    $.detachInfiniteScroll($('.infinite-scroll').eq(typeIndex - 1));
                    // 删除加载提示符
                    $infinite_scroll_preloader.eq(typeIndex - 1).html("<span style='font-size: .6rem;color: #dbdbdb;'>到底了(⊙o⊙)</span>");
                    return;
                }
                addData(parseInt(typeIndex));
                // 更新最后加载的序号
                $.refreshScroller();
            }, 1000);
            time++;
        });
    });

    function getReceiptList() {
        var btnDom = $(".btn_1");
        var currentPage = Number(btnDom.attr("data-currentPage"));
        var currentTab = $("#tab1");
        if (currentTab.find("li").length > 9 || currentPage == 1) {
            ajaxRequests('/venderBillDetail/oilGasReceivablesList', 'post', {
                "body": {
                    pageNum: currentPage,
                    pageSize: config.pageSize
                }
            }, function (response) {
                if (response.retCode === '0') {
                    /*加载模板数据*/
                    if (response.data.total !== 0) {
                        for (var i in response.data.list) {
                            var datas = response.data.list[i];
                            // console.log(datas);
                            for (var j in datas) {
                                if (j === "updateTime") {
                                    datas.createTime = timestampToTime(datas.createTime / 1000);
                                }
                                if (j === "resourceType") {
                                    datas.resourceType = filterResourceType(datas.resourceType);
                                }
                                if (j === "id") {
                                    datas.aid =  setRandom20(datas.id);
                                }
                                if (j === "consumFee") {
                                    datas.consumFee =  setNumFixed_2(datas.consumFee - datas.serviceFee);
                                }
                            }
                        }
                        addItem("#list1", response.data, "#indexList1");
                        var totalPage = Math.ceil(response.data.total / config.pageSize);
                        if (totalPage == 1) {
                            $infinite_scroll_preloader.eq(0).css("display", "none");
                        }
                        currentPage += 1;
                        btnDom.attr("data-currentPage", currentPage);
                        btnDom.attr("data-totalPage", totalPage);
                    } else {
                        if (currentPage = 1) {
                            currentTab.html("<div style='font-size: .6rem;color: #999;text-align: center;padding-top: 1rem;'>暂无数据(⊙o⊙)</div>");
                        } else {
                            currentTab.find("list-block").append("<div style='font-size: .6rem;color: #999;text-align: center;padding-top: 1rem;'>暂无数据(⊙o⊙)</div>");
                        }
                    }
                } else {
                    $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
                }
            });
        }
    }

    function getTransferList() {
        var btnDom = $(".btn_2");
        var currentPage = btnDom.attr("data-currentPage");
        var currentTab = $("#tab2");
        if (currentTab.find("li").length > 6 || currentPage == 1) {
            var params = {
                url: '/venderTransfer/oilGasTransferList',
                data: {
                    "body": {
                        pageNum: currentPage,
                        pageSize: config.pageSize
                    }
                },
                type: 'post',
                callback: function (response) {
                    if (response.retCode === '0') {
                        /*加载模板数据*/
                        if (response.data.total !== 0) {
                            for (var i in response.data.list) {
                                var datas = response.data.list[i];
                                for (var j in datas) {
                                    if (j === "tranDate") {
                                        datas.tranDate = timestampToTime(datas.tranDate / 1000);
                                    }
                                }
                            }
                            addItem("#list2", response.data, "#indexList2");
                            var totalPage = Math.ceil(response.data.total / config.pageSize);
                            if (totalPage == 1) {
                                $infinite_scroll_preloader.eq(1).css("display", "none");
                            }
                            currentPage++;
                            btnDom.attr("data-currentPage", currentPage);
                            btnDom.attr("data-totalPage", totalPage);
                        } else {
                            if (currentPage = 1) {
                                currentTab.html("<div style='font-size: .6rem;color: #999;text-align: center;padding-top: 1rem;'>暂无数据(⊙o⊙)</div>");
                            } else {
                                currentTab.find("list-block").append("<div style='font-size: .6rem;color: #999;text-align: center;padding-top: 1rem;'>暂无数据(⊙o⊙)</div>");
                            }
                        }
                    } else {
                        $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
                    }
                }
            }
            ajaxRequest(params);
        }
    }

    function getRechargeList() {
        var btnDom = $(".btn_3");
        var currentPage = btnDom.attr("data-currentPage");
        var currentTab = $("#tab3");
        if (currentTab.find("li").length > 6 || currentPage == 1) {
            var params = {
                url: '/venderRecharge/oilGasRechargeList',
                data: {
                    "body": {
                        pageNum: currentPage,
                        pageSize: config.pageSize
                    }
                },
                type: 'post',
                callback: function (response) {
                    if (response.retCode === '0') {
                        /*加载模板数据*/
                        var pageData = response.data.pageData;
                        if (pageData.total !== 0) {
                            for (var i in pageData.list) {
                                var datas = pageData.list[i];
                                for (var j in datas) {
                                    if (j === "rechargeTime") {
                                        datas.rechargeTime = timestampToTime(datas.rechargeTime / 1000);
                                    }
                                }
                                datas.status_txt = rechargeStatus(datas.status);
                            }
                            addItem("#list3", pageData, "#indexList3");
                            var totalPage = Math.ceil(pageData.total / config.pageSize);
                            if (totalPage == 1) {
                                $infinite_scroll_preloader.eq(2).css("display", "none");
                            }
                            currentPage++;
                            btnDom.attr("data-currentPage", currentPage);
                            btnDom.attr("data-totalPage", totalPage);
                        } else {
                            if (currentPage = 1) {
                                currentTab.html("<div style='font-size: .6rem;color: #999;text-align: center;padding-top: 1rem;'>暂无数据(⊙o⊙)</div>");
                            } else {
                                currentTab.find("list-block").append("<div style='font-size: .6rem;color: #999;text-align: center;padding-top: 1rem;'>暂无数据(⊙o⊙)</div>");
                            }
                        }
                    } else {
                        $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
                    }
                }
            }
            ajaxRequest(params);
        }
    }

    function infiniteScrollPreloader(n) {
        $infinite_scroll_preloader.css("display", "none");
        $infinite_scroll_preloader.eq(n).css("display", "block");
    }

    function addData(type) {
        switch (type) {
            case 1:
                popSet("./receipt.html", "收款");
                getReceiptList();
                break;
            case 2:
                popSet("./transfer.html", "转账");
                getTransferList();
                break;
            case 3:
                popSet("./recharge.html", "充值");
                getRechargeList();
                break;
        }
    }

    function popSetTab(type) {
        switch (type) {
            case 1:
                popSet("./receipt.html", "收款");
                break;
            case 2:
                popSet("./transfer.html", "转账");
                break;
            case 3:
                popSet("./recharge.html", "充值");
                break;
        }
    }
    function popSet(url, txt) {
        $pop_a.attr("href", url);
        $pop_a.html(txt);
    }
    setBanner('vender',function (response) {
        /*加载模板数据*/
        addItem("#banner", response, ".swiper-wrapper");
        if (status != 1 && status != 4) {
            $pop.remove();
            if (status == 2) {
                $.alert("审核未通过", "提示", function () {
                    $(".tabs").html("<div style='padding: 1rem;text-align: center;font-size: .7rem;color: #828282;'>审核未通过，请重新提交审核材料</div>");
                })
            }else{
                $.alert("请等待审核通过后使用该功能", "提示", function () {
                    $(".tabs").html("<div style='padding: 1rem;text-align: center;font-size: .7rem;color: #828282;'>入驻申请审核中，请重新登录查看审核状态</div>");
                })
            }
        } else {
            //内容初始化
            if (companyType == 3 || companyType == 4) {
                $(".btn_1").remove();
                $("#tab1").remove();
                popSet("./transfer.html", "转账");
                $(".btn_2").trigger("click");
            }else{
                getReceiptList();
                infiniteScrollPreloader(0);
            }
        }
        $.init();
    })
    /*生成20位的随机数*/
    function setRandom20(str) {
        var init_num = String(str);
        var len = init_num.length;
        var newNumber = '';
        for(var i=0;i<19-len;i++){
            var r=Math.floor(Math.random()*10);
            newNumber+=r;
        }
        newNumber = newNumber+init_num;
        return newNumber;
    }
    var orgin = getQueryString("orgin");
    if (orgin == "recharge") {
        $(".btn_3").trigger("click");
    }
    if (orgin == "transfer") {
        $(".btn_2").trigger("click");
    }
    }
//});

