$(function () {
    var id = getQueryString("id");
    var params = {
        url: '/driverVenderNoLogin/driverVenderInfo/' + id,
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
                console.log(data);
                addItem("#detail_demo", data, "#detail");
            } else {
                alert(response.retMsg || '操作失败');
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