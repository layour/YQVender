/**
 * Created by Administrator on 2018/3/25.
 */
$(function () {
    $.init();
    var carTypeData = config.vehicle_type;
    var carTypeTmpl = '';
    carTypeData.forEach(function (v) {
        carTypeTmpl+="<option value='"+v.type+"'>"+v.name+"</option>";
    })
    $(".carType").html(carTypeTmpl);
    setAddressChoose("#begin_city_picker",'选择起始地址');
    setAddressChoose("#end_city_picker",'目的地');

    function getDetail() {
        var type = getQueryString("type");
        var id = getQueryString("id");
        var currentPage = $("#listBlock").attr("data-currentPage");
        var params = {
            url: '/driverInformationRelease/getInformationRelease/'+id,
            type: 'get',
            callback: function (response) {
                if (response.retCode === '0') {
                    for (var i in response.data) {
                        if (i === "updateTime") {
                            response.data.updateTimes = timestampToTime(response.data.updateTime / 1000);
                        }
                    }
                    addItem("#list", response.data, "#listBlock");
                    addItem("#operating", response.data, "#operatingBlock");

                } else {
                    $.toast(response.retMsg || '加载失败', 2000, 'custom-toast');
                }
            }
        };
        ajaxRequest(params);
    }
    getDetail();
    var type = getQueryString("type");
    if (type == 1) {
        $(".title").html("接受信息详情");
        var isReceive = true;
    } else {
        $(".title").html("发布信息详情");
        var isReceive = false;
    }
    var datas={
        isReceive:isReceive
    }
    /*取消，完成信息*/
    $(document).on("click",".operating",function () {
        var id = getQueryString("id");
        var type = getQueryString("type");
        var status = $(this).attr("data-status");
        var operatingParams = {
            url: '/driverNoticeInfo/removeNoticeInfo/'+id+'/'+status,
            type: 'get',
            callback: function (response) {
                if (response.retCode === '0') {
                    loading.href="./message.html?type="+type
                } else {
                    $.toast(response.retMsg || '加载失败', 2000, 'custom-toast');
                }
            }
        };
        ajaxRequest(operatingParams);
    })
    /*删除信息*/
    $(document).on("click","#del",function () {
        var id = getQueryString("id");
        var type = getQueryString("type");
        var status = $(this).attr("data-status");
        var operatingParams = {
            url: '/driverNoticeInfo/delInformationRelease/'+id,
            type: 'get',
            callback: function (response) {
                if (response.retCode === '0') {
                    loading.href="./message.html?type="+type
                } else {
                    $.toast(response.retMsg || '加载失败', 2000, 'custom-toast');
                }
            }
        };
        ajaxRequest(operatingParams);
    })
})