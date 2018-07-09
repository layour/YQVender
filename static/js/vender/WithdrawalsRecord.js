/**
 * Created by Administrator on 2018/4/7.
 */
$(function () {
    'use strict';
    var $itemList= $("#itemList");
    var $infinite_scroll_preloader = $(".infinite-scroll-preloader");
    //多个标签页下的无限滚动
    $(document).on("pageInit", "#page-infinite-scroll-bottom", function (e, id, page) {
        var loading = false;
        var time = 0;
        $(page).on('infinite', function () {
            var currentPage = $itemList.attr("data-currentpage");
            var totalPage = $itemList.attr("data-totalPage");
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
                getWithdrawalsApplyList();
                // 更新最后加载的序号
                $.refreshScroller();
            }, 1000);
            time++;
        });
    });
    function getWithdrawalsApplyList() {
        var currentPage = $itemList.attr("data-currentPage");
        ajaxRequests('/venderWithdrawLog/withdrawalsApplyList','post',{
            body:{
                pageNum:currentPage,
                pageSize:10
            }
        },function (response) {
            if (response.retCode === '0') {
                if(response.data.total !== 0){
                    var list = response.data.list;
                    for(var i in list){
                        list[i].status = setStatus(list[i].status);
                        if (list[i].status == 1) {
                            list[i].orderStatus = setOrderStatus(list[i].callBankStatus);
                        }
                        if(list[i].updateTime){
                            list[i].updateTime = timestampToTime(list[i].updateTime  / 1000);
                        }else{
                            list[i].updateTime = timestampToTime(list[i].createTime  / 1000);
                        }
                    }
                    addItem("#list",response.data,"#itemList");
                    if (currentPage == 1 && response.data.total < 10) {
                        $infinite_scroll_preloader.css("display", "none");
                    }
                    var totalPage = Math.ceil(response.data.total / 10);
                    currentPage++;
                    $itemList.attr("data-currentPage", currentPage);
                    $itemList.attr("data-totalPage",totalPage);
                }else {
                    setNoDataContent();
                }
            }else{
                setNoDataContent();
            }
        });
    }
    getWithdrawalsApplyList();
    $.init();
});