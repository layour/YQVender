/**
 * Created by Administrator on 2018/4/29.
 */;
 //$(function () {
summerready = function(){
    var totalPage = 1;
    var currentPage = 1;
    if (getCookie("amount") >= 0) {
        delCookie("amount");
    }
    if (getCookie("billDetails") || getCookie("billDetails") == "") {
        delCookie("billDetails");
    }
    $(document).on("pageInit", "#account", function (e, id, page) {
        var loading = false;
        var time = 0;
        $(page).on('infinite', function () {
            // 如果正在加载，则退出
            if (loading) return;
            // 设置flag
            loading = true;
            var hasNext = true;
            if (currentPage >= totalPage) {
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
        var type = getQueryString("type")
        var params = {
            url: '/driverBillDetail/invoiceBillDetailList',
            type: 'post',
            data: {
                body: {
                    consumCategory: type,
                    pageNum: 1,
                    pageSize: 20
                }
            },
            callback: function (response) {
                if (response.retCode === '0') {
                    var result=response.data.list;
                    if(result.length<1){
                        $(".content").removeClass("dis-n");
                        setNoDataContent();
                    }else{
                        for (var i = 0; i < result.length; i++) {
                            var datas = result[i];
                            for (var j in datas) {
                                if (j == 'consumTime') {
                                    datas.consumTime = timestampToTime(datas.consumTime / 1000);
                                }
                                if(j=='consumCategory'){
                                    datas.consumCategory = consumType(datas.consumCategory);
                                }
                            }
                        }
                        addItem("#item", response.data, "#list");
                        if (currentPage == 1 && response.data.total < 20) {
                            $('.infinite-scroll-preloader').css("display", "none");
                        }
                        $(".content").removeClass("dis-n");
                        totalPage = Math.ceil(response.data.total / config.pageSize);
                        currentPage++;

                        $("#list").attr("data-pageNum", currentPage);
                    }
                } else {
                    $.toast(response.retMsg || '加载失败', 2000, 'custom-toast');
                }
            }
        };
        ajaxRequest(params);
    }

    getList();
    $("#pay").on("click", function () {
        var type = getQueryString("type");
        var $dom = $(".label-checkbox");
        var billDetails = [];
        var amount = 0;
        $dom.forEach(function (v, index) {
            if($dom.eq(index).find("input").is(":checked")){
                var bill = $dom.eq(index).find("input:checked").val();
                billDetails.push(bill);
                var num = Number($dom.eq(index).find(".item-after").text());
                amount += num;
            }
        })
        if (amount > 0) {
            setCookie("amount", setNumFixed_2(amount));
            setCookie("billDetails", billDetails);
            location.href = "./invoiceApplication.html?type=" + type;
        }else{
            $.toast('请先选择消费记录，再进行下一步操作', 2000, 'custom-toast');
        }
    })
    $.init();
    }
//})