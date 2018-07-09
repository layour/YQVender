$(function () {
    var id = getQueryString("id");
    var params = {
        url: '/driverVender/driverVenderInfo/' + id,
        type: 'get',
        callback: function (response) {
            if (response.retCode === '0') {
                /*加载模板数据*/
                var dataList = response.data.vender;
                var supportType = filter(dataList.supportServices);
                var companyTpe = dataList.companyType;
                var siteInfo = getType(companyTpe);
                var data = $.extend(dataList, supportType, siteInfo);
                data.list = response.data.venderResourceList;
                data.star = new Array();
                data.star.length = data.starNum;
                addItem("#detail_demo", data, "#detail");
            } else {
                $.toast(response.retMsg || '信息获取失败', 2000, 'custom-toast');
            }
        }
    }
    $(document).on("click", ".add", function () {
        var type = $(this).attr("data-type");
        location.href = "./site.html?type=" + type + "&id=" + id;
    })
    ajaxRequest(params);
    $.init();
})