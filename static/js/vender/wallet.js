/**
 * Created by Administrator on 2018/4/9.
 */
;//$(function () {
summerready = function(){
    $.init();
    var companyType = getCookie("companyType");
    if (companyType == 3 || companyType == 4) {
        $(".GasStation").remove();
        $(".yqSite").remove();
    }else{
        $(".LogisticsProviders").remove();
    }
    ajaxRequests('/venderInfo/info/','get','',function (response) {
        if (response.retCode === '0') {
            var data = response.data;
            if(data){
                $("#collectAmount").html(parseFloat(data.collectAmount+data.rechargeAmount).toFixed(2));
                $(".collectAmount").html(parseFloat(data.collectAmount).toFixed(2));
                $(".lockAmount").html(parseFloat(data.lockAmount).toFixed(2));
                $("#rechargeAmount").html(parseFloat(data.rechargeAmount).toFixed(2));
                $(".content").removeClass("dis-n");
            }
        }
    });
    }
//})