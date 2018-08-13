/**
 * Created by Administrator on 2018/4/10.
 */
;//$(function () {
summerready = function(){
    var currentPage = 1;
    var totalpage = 1;
    var $infinite_scroll_preloader = $(".infinite-scroll-preloader");
    $(document).on("pageInit", "#recordList", function (e, id, page) {
        var loading = false;
        var time = 0;
        $(page).on('infinite', function () {
            // 如果正在加载，则退出
            if (loading) return;
            // 设置flag
            loading = true;
            var hasNext = true;
            console.log(hasNext?5555:6666);
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
                getTransferList() ;
                // 更新最后加载的序号
                $.refreshScroller();
            }, 1000);
            time++;
        });
    })
    function getTransferList() {
        var currentTab = $("#recordList .content");
        if (currentTab.find("li").length > 20 || currentPage == 1) {
            $("#infinite-scroll-preloader").css("display", "block")
        }
        ajaxRequests('/venderTransfer/oilGasTransferList','post',{
            "body": {
                pageNum: 1,
                pageSize: 20
            }
        },function (response) {
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
                    addItem("#list", response.data, "#indexList");
                    totalpage = Math.ceil(response.data.total / 8);
                    if (totalpage < 1) {
                        $infinite_scroll_preloader.css("display","none");
                    }
                    currentPage++;
                } else {
                    if (currentPage = 1) {
                        currentTab.html("<div style='font-size: .6rem;color: #999;text-align: center;padding: 3rem 0;'>暂无数据(⊙o⊙)</div>");
                    } else {
                        currentTab.find("list-block").append("<div style='font-size: .6rem;color: #999;text-align: center'>暂无数据(⊙o⊙)</div>");
                    }
                }
            } else {
                $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
            }
        })
    }
    getTransferList();
    $.init();
    }
//})