// Import axios using ES module syntax
import axios from 'https://cdn.skypack.dev/axios';

// Example request
const options = {
  url: "https://api.printnode.com/printjobs",
  method: "POST",
  headers: {
    Authorization: "Basic REdqckZpUFVnUndGckdxbFNFSmpHbnRpUmotREhqb3FPeFhlUlg3UlYtbw==",
  },
  data: {
    printerId: "69642287",
    title: "first title",
    contentType: "pdf_uri",
    content: "https://easypost-files.s3-us-west-2.amazonaws.com/files/postage_label/20200815/bbf6eec2a93a475bbcd841777d0dc837.pdf",
    source: "Comes from EasyPost API",
  },
};

axios(options)
  .then(response => {
    console.log("statusCode:", response.status);
    console.log(response.data);
    console.log("Axios working in main.js")
  })
  .catch(error => {
    console.error("error:", error);
  });

