;//$(function () {
summerready = function(){
    var id = getQueryString("id");
    var type = getQueryString("type");
    var infoId = '';
    $.showPreloader();
    ajaxRequests('/venderInformationRelease/getInformationRelease/' + id,'get','',function (response) {
        if (response.retCode === '0') {
            /*加载模板数据*/
            response.data.updateTimes = response.data.updateTime?timestampToTime(response.data.updateTime / 1000):timestampToTime(response.data.createTime / 1000);
            response.data.leaveTime = timestampToTime(response.data.leaveTime / 1000);
            response.data.beginAddress = (response.data.beginProvinceName || "") + (response.data.beginCityName || "") +(response.data.beginCountyName || "") + (response.data.beginAddress || "");
            response.data.endAddress = (response.data.endProvinceName || "") + (response.data.endCityName || "") + (response.data.endCountyName || "") +(response.data.endAddress || "");
            infoId = response.data.id;
            addItem("#list", response.data, ".list-block ul");
            $(".content-block").removeClass("dis-n");
            $.hidePreloader();
        } else {
            $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
        }
    })
    $.init();
    }
//})