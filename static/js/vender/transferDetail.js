/**
 * Created by Administrator on 2018/4/5.
 */
;//$(function () {
summerready = function(){
    'use strict';
    $.init();
    var id = getQueryString("id");
    ajaxRequests('/venderTransfer/oilGasTransferInfo/'+id,'get',{},function (response) {
        if (response.retCode === '0') {
            if(response.data){
                addItem("#form",response.data,"#list");
            }else {
                setNoDataContent();
            }
        }else{
            setNoDataContent();
        }
    });
    }
//});

