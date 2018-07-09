/**
 * Created by Administrator on 2018/4/1.
 */
$(function () {
    var id = getQueryString("id");
    var mode = getQueryString("mode");
    var infoId = '';
    ajaxRequests('/driverBillDetail/billDetail/' + id,'get','',function (response) {
        if (response.retCode === '0') {
            /*加载模板数据*/
            response.data.consumTime = timestampToTime(response.data.consumTime/ 1000);
            response.data.resourceGrade = filterOilAndGasType(response.data.resourceGrade);
            infoId = response.data.id;
            addItem("#list", response.data, ".list-block ul");
            if (mode && mode == 2) {
                $(".content-block").removeClass("dis-n");
            }
        } else {
            $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
        }
    })
    /*支付未支付订单*/
    $(document).on("click","#submit",function () {
        ajaxRequests('/driverBillDetail/billDetail/' + id,'post','',function (response) {
            if (response.retCode === '0') {
                /*加载模板数据*/
                response.data.consumTime = timestampToTime(response.data.consumTime/ 1000);
                response.data.resourceGrade = filterOilAndGasType(response.data.resourceGrade);
                infoId = response.data.id;
                addItem("#list", response.data, ".list-block ul");
                if (mode && mode == 2) {
                    $("#content-block").removeClass("dis-n");
                }
            } else {
                $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
            }
        })
    })
    $.init();
})