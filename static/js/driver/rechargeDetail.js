/**
 * Created by Administrator on 2018/4/22.
 */
;//$(function () {
summerready = function(){
    var id = getQueryString("id");
    ajaxRequests('/driverRechargeDetail/driverRechargeDetail/' + id,'get','',function (response) {
        if (response.retCode === '0') {
            /*加载模板数据*/
            response.data.rechargeTime = timestampToTime(response.data.rechargeTime / 1000);
            response.data.rechargeAmount = setNumFixed_2(response.data.rechargeAmount);
            response.data.resourceGrade = filterOilAndGasType(response.data.resourceGrade);
            response.data.rechargeStatus = setRechargeStatus(response.data.status);
            response.data.status_txt = rechargeStatus(response.data.status);
            addItem("#list", response.data, ".list-block ul");
        } else {
            $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
        }
    })
    $.init();
    }
//})
