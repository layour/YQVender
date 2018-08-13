/**
 * Created by Administrator on 2018/3/25.
 */
/*获取司机个人信息*/
;//$(function () {
summerready = function(){
    $.showPreloader();
    ajaxRequests('/venderInfo/info/','get','',function (response) {
        if (response.retCode === '0') {
            if(response.data){
                var companyType = parseInt(response.data.companyType);
                response.data.companyType = filterCompanyTypes(companyType);
                response.data.address = (response.data.provinceName || "") + (response.data.cityName || "") + (response.data.countyName || "")+(response.data.fullAddress || "");
                addItem("#list",response.data,"#list_dom");
                $(".content").removeClass("dis-n");
                $.hidePreloader();
            }
        }
    });
    $.init();
    }
//})