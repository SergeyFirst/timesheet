"use strict";
var TokenService = (function () {
    function TokenService() {
    }
    TokenService.prototype.getToken = function () {
        return new Promise(function (resolve, reject) {
            var result = '';
            Office.context.mailbox.getUserIdentityTokenAsync(function (asyncResult) { result = asyncResult.value; });
            resolve(result);
        });
    };
    return TokenService;
}());
exports.TokenService = TokenService;
//# sourceMappingURL=token.service.js.map