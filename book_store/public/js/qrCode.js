var QRCode = require("qrcode");
QRCode.toDataURL("http://example.com", { type: "terminal" }, function (
  err,
  url
) {
  console.log(url);
});
