(function () {
    "use strict";

    angular.module("blocktrail.core")
        .controller("VerifyEmailCtrl", VerifyEmailCtrl);

    function VerifyEmailCtrl($scope, $stateParams, $location, $translate, accountSecurityService, settingsService) {
        $scope.working  = true;
        $scope.verified = false;
        $scope.success  = false;

        // Get state parameter
        var token = $stateParams.token;

        accountSecurityService.verifyEmail(token)
            .then(function (result) {
                if(result && result["data"] && !result["data"]["result"]) {
                    $scope.success = false;
                } else {
                    $scope.success = true;
                }

                return settingsService.syncSettingsDown()
                    .then(function(settingsReadOnlyData) {
                        $scope.verified = settingsReadOnlyData.verifiedEmail;
                    })
                    .then(accountSecurityService.updateSecurityScore);

            })
            .then(function () {
                $scope.working = false;
            })
            .catch(function () {
                $scope.working = false;
                return new Error($translate.instant("MSG_ERROR_TRY_AGAIN_LATER"))
            });

        $scope.continueToWallet = function() {
            $location.path("/");
        }
    }
})();
