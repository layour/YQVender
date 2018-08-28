;//$(function () {
summerready = function(){
    var id = getQueryString("id");
    $.showPreloader();
    var carType = getCookie("carType");
    ajaxRequests('/driverVenderNoLogin/driverVenderInfo/' + id,'get','',function (result) {
        if (result.retCode === '0') {
            /*加载模板数据*/
            var dataList = result.data.vender;
            var support = filter(dataList.supportServices);
            var companyTpe = dataList.companyType;
            var siteInfo = getType(companyTpe);
            var data = $.extend(dataList,siteInfo);
            data.support = support;
            data.list = result.data.venderResourceList;
            data.isShowList = data.list.length > 0 ? true : false;
            data.isShowSupportType = dataList.supportServices ? true : false;
            data.star = new Array();
            data.star.length = data.starNum;
            $.hidePreloader();
            addItem("#detail_demo", data, "#detail");
            console.log(companyTpe);
            console.log(carType);
            if (parseInt(companyTpe) != parseInt(carType)) {
                $(".add").remove();
            }
            if (result.data.venderResourceList.length == 0) {
                $(".add").remove();
            }
        } else {
            alert(result.retMsg || '操作失败');
        }
    })
    $(document).on("click", ".add", function () {
        var type = $(this).attr("data-type");
        location.href = "./site.html?type=" + type + "&id=" + id;
    })
    $.init();
    }
//})