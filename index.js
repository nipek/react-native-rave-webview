import React, { useState } from 'react';
import { Modal, View, ActivityIndicator, WebView } from 'react-native';



export const RaveWebView = props => {
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(true);

  let Rave = {
    html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body onload="payWithRave()" style="background-color:#fff;height:100vh ">
            <form>
              <script src="https://api.ravepay.co/flwv3-pug/getpaidx/api/flwpbf-inline.js"></script>
            </form>

            <script>
              const API_publicKey = "${props.raveKey}";
              window.onload = payWithRave;
              function payWithRave() {
                var x = getpaidSetup({
                  PBFPubKey: API_publicKey,
                  amount: ${props.amount},
                  customer_phone: "${(props.customerPhone || '')}",
                  customer_email: "${(props.customerEmail || '')}",
                  custom_description: "${props.contentDescription}",
                  currency: "NGN",
                  txref: "${props.txref}",
                  meta: [{
                      metaname: "${props.billingName || props.customerEmail || ''}",
                      metavalue: "${props.billingMobile || props.customerPhone || ''}"
                  }],
                  onclose: function() {
                    var resp = {event:'cancelled'};
                    window.postMessage(JSON.stringify(resp))
                  },
                  callback: function(response) {
                      var txref = response.tx.txRef;
                        if (
                          response.tx.chargeResponseCode == "00" ||
                          response.tx.chargeResponseCode == "0"
                      ) {
                            var resp = {event:'successful', transactionRef:txref};
                            window.postMessage(JSON.stringify(resp))
                      } else {
                        var resp = {event:'error'};
                        window.postMessage(JSON.stringify(resp))
                      }
                      x.close();
                  }
                });
              }
            </script>
          </body>
        </html>
      `
  }
  const messageRecived = async (props, data) => {
    var webResponse = JSON.parse(data);
    switch (webResponse.event) {
      case 'cancelled':
        await setShowModal(false);
        props.onCancel();
        break;
      case 'successful':
        await setShowModal(false);
        props.onSuccess(webResponse);
        break;
      default:
        await setShowModal(false);
        props.onError();
        break;
    }
  }
  return (
    <Modal
      visible={showModal}
     // style={{ backgroundColor: 'red' }}
      animationType="slide"
      transparent={false}>
      <WebView
        javaScriptEnabled={true}
        javaScriptEnabledAndroid={true}
        originWhitelist={['*']}
        //  ref={(webView) => this.MyWebView = webView}
        source={Rave}
        onMessage={(e) => { messageRecived({ onCancel: props.onCancel, onSuccess: props.onSuccess, onError: props.onError }, e.nativeEvent.data) }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
      />
      {
        isLoading === true && <View style={{ position: 'absolute', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', top: 0 }}>
          <ActivityIndicator size="large" color={props.ActivityIndicatorColor || '#f5a623'} />
        </View>
      }
    </Modal>
  );
}

