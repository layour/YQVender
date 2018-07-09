/**
 * Created by Administrator on 2018/4/22.
 */
$(function () {
    var totalPage = 1;
    var currentPage = 1;
    var $infinite_scroll_preloader = $(".infinite-scroll-preloader");
    $(document).on("pageInit", "#account", function (e, id, page) {
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
                getList();
                // 更新最后加载的序号
                $.refreshScroller();
            }, 1000);
            time++;
        });
    })
    function getList() {
        var type = getQueryString("type");
        ajaxRequests('/driverRechargeDetail/driverRechargeDetailList','post',{
            body: {
                pageNum: currentPage,
                pageSize: 20
            }
        },function (response) {
            if (response.retCode === '0') {
                var listData = response.data.pageData.list;
                if ((listData && listData.length < 1) && currentPage == 1) {
                    $(".list-block").html("<div class='noneData'>暂无数据</div>");
                    $('.infinite-scroll-preloader').remove();
                } else {
                    if (listData.length < 20 && currentPage == 1) {
                        $infinite_scroll_preloader.addClass("dis-n");
                    }
                    for(var i=0;i<listData.length;i++){
                        listData[i].rechargeTime = timestampToTime(listData[i].rechargeTime / 1000);
                        listData[i].rechargeAmount = setNumFixed_2(listData[i].rechargeAmount);
                        listData[i].rechargeStatus = setRechargeStatus(listData[i].status);
                        listData[i].status_txt = rechargeStatus(listData[i].status);
                    }
                    addItem("#item", response.data.pageData, "#list");
                    totalPage = Math.ceil(response.data.pageData.total / 20);
                    currentPage++;
                    $("#list").attr("data-pageNum", currentPage);
                }
            } else {
                if(getCookie("token")){
                    //自动登录
                    var loginName = getCookie("loginName");
                    var loginPwd = getCookie("loginPwd");
                    automaticLogin(loginName,loginPwd);
                }else{
                    $.toast(response.retMsg || '加载失败', 2000, 'custom-toast');
                }
            }
        })
    }
    getList();
    $.init();
})
