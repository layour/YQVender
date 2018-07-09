$(function () {
    var id = getQueryString("id");
    var type = getQueryString("type");
    var noticeInfoId = getQueryString("noticeInfoId");
    var infotype;
    if(type==1){
        ajaxRequests('/driverNoticeInfo/noticeInfoDetail/' + noticeInfoId, "get", "", function (response) {
            if (response.retCode === '0') {
                /*加载模板数据*/
                response.data.leaveTime = response.data.leaveTime?timestampToTime(response.data.leaveTime / 1000):null;
                response.data.updateTimes = response.data.updateTime?timestampToTime(response.data.updateTime / 1000):timestampToTime(response.data.createTime / 1000);
                response.data.beginAddress = (response.data.beginProvinceName || "") + (response.data.beginCityName || "") +(response.data.beginCountyName || "") + (response.data.beginAddress || "");
                response.data.endAddress = (response.data.endProvinceName || "") + (response.data.endCityName || "") +(response.data.endCountyName || "") + (response.data.endAddress || "");
                response.data.carType = filterInfoCarTypes(response.data.carType);
                infotype = response.data.infoType;
                addItem("#list", response.data, ".list-block ul");
                if(response.data.status == 4){
                    $("#disabled").remove();
                }
                if (response.data.driverNoticeInfoStatus == 3) {
                    $("#cancle").remove();
                    $("#complete").remove();
                }
                if(type==1){
                    $("#rechive").removeClass("dis-n");
                }else{
                    $("#public").removeClass("dis-n");
                }
            } else {
                $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
            }
        })
    }else{
        ajaxRequests('/driverInformationRelease/getInformationRelease/' + id, "get", "", function (response) {
            if (response.retCode === '0') {
                /*加载模板数据*/
                response.data.leaveTime = response.data.leaveTime?timestampToTime(response.data.leaveTime / 1000):null;
                response.data.updateTimes = response.data.updateTime?timestampToTime(response.data.updateTime / 1000):timestampToTime(response.data.createTime / 1000);
                response.data.beginAddress = (response.data.beginProvinceName || "") + (response.data.beginCityName || "") +(response.data.beginCountyName || "") + (response.data.beginAddress || "");
                response.data.endAddress = (response.data.endProvinceName || "") + (response.data.endCityName || "") +(response.data.endCountyName || "") + (response.data.endAddress || "");
                response.data.carType = filterInfoCarTypes(response.data.carType);
                infotype = response.data.infoType;
                addItem("#list", response.data, ".list-block ul");
                if(response.data.status == 4){
                    $("#disabled").remove();
                    $("#modify").remove();
                }
                if(type==1){
                    $("#rechive").removeClass("dis-n");
                }else{
                    $("#public").removeClass("dis-n");
                }
            } else {
                $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
            }
        })
    }
    //司机取消接受信息
    $(document).on("click","#cancle",function () {
        ajaxRequests('/driverNoticeInfo/removeNoticeInfo/'+noticeInfoId+'/2','get',"",function (response) {
            if (response.retCode === '0') {
                /*加载模板数据*/
                $.alert("提交成功",'',function () {
                    pageBack();
                });
            } else {
                $.alert(response.retMsg || '操作失败');
            }
        })
    });
    //司机完成接受信息
    $(document).on("click","#complete",function () {
        ajaxRequests('/driverNoticeInfo/removeNoticeInfo/'+noticeInfoId+'/3','get',"",function (response) {
            if (response.retCode === '0') {
                /*加载模板数据*/
                $.alert("提交成功",'',function () {
                    pageBack();
                });
            } else {
                $.alert(response.retMsg || '操作失败');
            }
        })
    });
    //司机停用信息
    $(document).on("click", "#disabled", function () {
        ajaxRequests('/driverNoticeInfo/delInformationRelease/' + id, 'get', "", function (response) {
            if (response.retCode === '0') {
                /*加载模板数据*/
                $.alert(response.retMsg || "停用成功", '', function () {
                    pageBack();
                });
            } else {
                $.alert(response.retMsg || '操作失败');
            }
        })
    });
    //司机发布信息修改
    $(document).on("click","#modify",function () {
        if (infotype == 3 || infotype == 4) {
            pageGo("otherMessageModify","?id="+id+"&type="+infotype);
        }else{
            pageGo("messageModify","?id="+id+"&type="+infotype);
        }

    })
    $.init();
})