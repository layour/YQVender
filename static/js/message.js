/**
 * Created by Administrator on 2018/3/25.
 */
$(function () {
    var totalPage = 1;
    var currentPage = 1;

    var type = getQueryString("type");

    $(document).on("pageInit", "#messagetList", function (e, id, page) {
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
        var currentPage = $("#listBlock").attr("data-currentPage");
        if (type == 1) {
            var url = '/driverNoticeInfo/noticeInfoList'
        } else {
            var url = '/driverNoticeInfo/driverPublishInfoList'
        }
        var params = {
            url: url,
            type: 'POST',
            data: {
                body: {
                    pageNum: currentPage,
                    pageSize: 20
                }
            },
            callback: function (response) {
                if (response.retCode === '0') {
                    for (var i = 0; i < response.data.list.length; i++) {
                        if(response.data.list[i].updateTime){
                            response.data.list[i].date = timestampToTime(response.data.list[i].updateTime / 1000);
                        }else{
                            response.data.list[i].date = timestampToTime(response.data.list[i].createTime / 1000);
                        }
                    }
                    addItem("#list", response.data, "#listBlock");
                    if (response.data.list.length < 10 && currentPage == 1) {
                        $(".infinite-scroll-preloader").css("display", "none");
                    }
                    totalPage = Math.ceil(response.data.total / 20);
                    currentPage++;
                } else {
                    $.toast(response.retMsg || '加载失败', 2000, 'custom-toast');
                }
            }
        };
        ajaxRequest(params);
    }
    getList();
    $.init();
})