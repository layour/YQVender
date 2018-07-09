/**
 * Created by Administrator on 2018/4/5.
 */
$(function () {
    'use strict';
    $.init();
    var id = getQueryString("id");
    var type = getQueryString("id");
    ajaxRequests('/venderInformationRelease/getInformationRelease/'+id,'get',{},function (response) {
        if (response.retCode === '0') {
            if(response.data){
                response.data.id = id;
                if (response.data.updateTime) {
                    response.data.updateTime = timestampToTime(response.data.updateTime / 1000);
                } else {
                    response.data.updateTime = timestampToTime(response.data.createTime / 1000);
                }
                response.data.leaveTimes = timestampToTime(response.data.leaveTime / 1000);
                response.data.beginAddress = (response.data.beginProvinceName || "") + (response.data.beginCityName || "") +(response.data.beginCountyName || "") + (response.data.beginAddress || "");
                response.data.endAddress = (response.data.endProvinceName || "") + (response.data.endCityName || "") + (response.data.endCountyName || "") +(response.data.endAddress || "");
                addItem("#list",response.data,"#list_dom");
            }else{
                setNoDataContent();
            }
        } else {
            setNoDataContent();
        }
    });
});

