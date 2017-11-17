(function () {
    "use strict";

    angular.module("blocktrail.wallet")
        .controller("PaymentURICtrl", PaymentURIController);

    // borrowed from bip21, with a modification for optional addresses
    // in urls.
    function decodeBitcoin (uri) {
        var qregex = /bitcoin:\/?\/?([^?]+)?(\?([^]+))?/.exec(uri);
        if (!qregex) throw new Error('Invalid BIP21 URI: ' + uri);

        var address = qregex[1];
        var query = qregex[3];

        var options = parseQuery("?"+query);
        if (options.amount) {
            options.amount = Number(options.amount);
            if (!isFinite(options.amount)) throw new Error('Invalid amount');
            if (options.amount < 0) throw new Error('Invalid amount');
        }

        return { address: address, options: options };
    }

    function PaymentURIController($state, $stateParams, bip70) {

        var scheme = $stateParams.scheme;
        //parse result for address
        var elm = angular.element('<a>').attr('href', scheme )[0];

        if (elm.protocol === 'bitcoin:') {
            var uri = decodeBitcoin(scheme);
            if (uri.options.r) {
                $state.go('app.wallet.send', {
                    protocol: elm.protocol.slice(0, -1),
                    uri: scheme,
                    paymentUrl: uri.options.r
                });
            } else if (uri.options.amount || uri.address) {
                $state.go('app.wallet.send', {
                    protocol: elm.protocol.slice(0, -1),
                    uri: scheme,
                    amount: uri.options.amount,
                    address: uri.address
                });
            } else {
                // something was horribly wrong?
                $state.go('app.wallet.summary');
            }
        }
    }
})();
