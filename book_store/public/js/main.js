// Testing ground
const request = require("request");

//Hasan's Info
//computer id:317176
//printer id:69642287
const options = {
  url: 'https://api.printnode.com/printjobs',
  //url: 'https://api.printnode.com/computers/317176/printers/69642287',
  json:true,
  headers: {
    'Authorization': 'Basic REdqckZpUFVnUndGckdxbFNFSmpHbnRpUmotREhqb3FPeFhlUlg3UlYtbw==',
  },
  method:'POST',
  body:{
    'printerId': '69642287',
    'title':'first title',
    'contentType':'pdf_uri',
    'content':'https://easypost-files.s3-us-west-2.amazonaws.com/files/postage_label/20200815/bbf6eec2a93a475bbcd841777d0dc837.pdf',
    'source':'Comes from EasyPost API'
  }
};
//base 64 format
//REdqckZpUFVnUndGckdxbFNFSmpHbnRpUmotREhqb3FPeFhlUlg3UlYtbw==

request(options, (err, response, body) => {
  console.error('error:', err); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  //console.log('body:', JSON.parse(body));
  //let result = JSON.parse(body)
  //console.log(result)
  // console.log("====")
   console.log(body)// Print the HTML for the Google homepage.
})
