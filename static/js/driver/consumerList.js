/**
 * Created by Administrator on 2018/4/22.
 */
;
//$(function () {
summerready = function(){
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
            console.log("currentPage"+currentPage);
            console.log("totalPage"+totalPage);
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
        ajaxRequests('/driverBillDetail/driverBillDetailList','post',{
            body: {
                pageNum: currentPage,
                pageSize: 20
            }
        },function (response) {
            if (response.retCode === '0') {
                var listData = response.data.list;
                if ((listData && listData.length < 1) && currentPage == 1) {
                    $(".list-block").html("<div class='noneData'>暂无数据</div>");
                    $infinite_scroll_preloader.addClass("dis-n");
                } else {
                    if (listData.length < 20 && currentPage == 1) {
                        $infinite_scroll_preloader.addClass("dis-n");
                    }
                    for(var i=0;i<listData.length;i++){
                        listData[i].consumTime = timestampToTime(listData[i].consumTime / 1000);
                        listData[i].consumCategory = consumType(listData[i].consumCategory);
                        if(listData[i].billStatus=="1"){
                            listData[i].billStatus_txt = "已支付";
                        }else{
                            listData[i].billStatus_txt = "未支付";
                        }
                    }
                    addItem("#item", response.data, "#list");
                    totalPage = Math.ceil(response.data.total / 20);
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
    }
//})
