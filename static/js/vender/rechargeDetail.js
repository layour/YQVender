/**
 * Created by Administrator on 2018/4/5.
 */
;//$(function () {
summerready = function(){
    'use strict';
    $.init();
    var id = getQueryString("id");
    ajaxRequests('/venderRecharge/oilGasRechargeInfo/'+id,'get',{},function (response) {
        if (response.retCode === '0') {
            if(response.data){
                response.data.id = id;
                response.data.rechargeMethod = getRechargeMethod(response.data.rechargeMethod);
                response.data.rechargeTime = timestampToTime(response.data.rechargeTime / 1000);
                response.data.isgoinvoice = (response.data.status == 1 && (response.data.invoiceApplyStatus != 1&&response.data.invoiceApplyStatus != 2)) ? true : false;
                response.data.status_txt = rechargeStatus(response.data.status);
                response.data.invoiceApplyStatus = getInvoiceApplyStatus(response.data.invoiceApplyStatus);

                addItem("#form",response.data,"#list");
            }else{
                setNoDataContent();
            }
        } else {
            setNoDataContent();
        }
    });
    }
//});

