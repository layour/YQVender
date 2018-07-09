/**
 * Created by Administrator on 2018/4/10.
 */
;$(function () {
    var currentPage = 1;
    var totalPage = 1;
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
                getReceiptList();
                // 更新最后加载的序号
                $.refreshScroller();
            }, 1000);
            time++;
        });
    })
    function getReceiptList() {
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
                        }
                    }
                    if (totalPage < 7 && currentPage == 1) {
                        $infinite_scroll_preloader.eq(0).css("display", "none");
                    }
                    addItem("#list", response.data, "#indexList");
                    totalPage = Math.ceil(response.data.total / config.pageSize);
                    currentPage++;
                } else {
                    if (currentPage = 1) {
                        $(".content").html("<div style='font-size: .6rem;color: #999;text-align: center;padding: 3rem 0;'>暂无数据(⊙o⊙)</div>");
                    } else {
                        $("list-block").append("<div style='font-size: .6rem;color: #999;text-align: center'>暂无数据(⊙o⊙)</div>");
                    }
                }
            } else {
                $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
            }
        })
    }
    getReceiptList();
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
    $.init();
})