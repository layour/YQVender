/**
 * Created by Administrator on 2018/4/10.
 */
/**
 * Created by Administrator on 2018/4/10.
 */
$(function () {
    $.init();
    var currentPage = 1;
    var $addBnak = $(".addBnak");
    // if(getCookie("bank_laiyuan")&&getCookie("bank_laiyuan")=="1"){
    //     $(".bar-nav a").attr("href","recharge.html");
    // }
    $.showPreloader();
    function getReceiptList() {
        ajaxRequests('/venderBankCard/oilGasBankCardList', 'post', {
            "body": {
                pageNum: currentPage,
                pageSize: config.pageSize
            }
        }, function (response) {
            if (response.retCode === '0') {
                /*加载模板数据*/
                if (response.data.total !== 0) {
                    var list = response.data.list;
                    for (var i = 0; i < list.length; i++) {
                        var item = list[i];
                        response.data.list[i].bankTypeName =filterBankName(item.bankType);
                        for (var j in item){
                            if (j == 'bankCardNo') {
                                var ncard = '';
                                for (var n = 0; n < item[j].length; n = n + 4) {
                                    ncard += item[j].substring(n, n + 4) + " ";
                                }
                                response.data.list[i].bankCardNo =ncard.substr(0,4)+" ******** "+ncard.substr(-4);
                            }
                            if(response.data.list[i].status==0){
                                response.data.list[i].bankStatus = '待审核';
                            }
                        }
                    }
                    addItem("#list", response.data, "#BankCardList");

                } else {
                    $addBnak.css("display","block");
                }
            } else {
                $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
            }
            $.hidePreloader();

        })
    }
    getReceiptList();
})