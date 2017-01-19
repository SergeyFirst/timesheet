var myPromise = $.soap({
    url: 'https://localhost/test/ws/timesheets?wsdl',
    method: 'GetHoursByEmailJson',
    async: true,
    data: '<?xml version="1.0" encoding="utf-8"?>' +
        '           <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tim="http://www.npoprogress.com/timesheets">' +
        '               <soapenv:Header/>' +
        '               <soapenv:Body>' +
        '                   <tim:GetHoursByEmailJson>' +
        '                       <tim:Email>ssuchkov@npoprogress.com</tim:Email>' +
        '                       <tim:Date>2016-12-08</tim:Date>' +
        '                       <tim:Token>1234</tim:Token>' +
        '                   </tim:GetHoursByEmailJson>' +
        '               </soapenv:Body>' +
        '           </soapenv:Envelope>',
    HTTPHeaders: {
        Authorization: 'Basic d2ViOjEyMw=='
    }
});
//.done(function(data, textStatus, jqXHR) {}).fail(function(jqXHR, textStatus, errorThrown){});
myPromise.then(function (data, textStatus, jqXHR) {
    var jsonString = data.childNodes[0].childNodes[1].childNodes[1].childNodes[1].innerHTML;
    var myData = $.parseJSON(jsonString)['#value'];
    for (var i = 0; i < myData.length; i++) {
        $('#projects').append('<br>' + myData[i].ProjectCode);
    }
}, function (data, textStatus, jqXHR) {
    $('#projects').append('Не удалось получить трудозатраты по проектам');
});
//# sourceMappingURL=soap.js.map