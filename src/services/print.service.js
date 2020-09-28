import axios from 'axios';
import Service from './service';

class Downloadable {
  constructor(data, filename) {
    this.data = (data instanceof Blob) ? data : new Blob([data]);
    this.filename = filename;
  }

  download() {
    const url = window.URL.createObjectURL(this.data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', this.filename);
    document.body.appendChild(link);
    link.click();
  }
}

export default class PrintService extends Service {
  print(attachmentName) {
    const { api } = this.client;
    const token = this.client.getStorage().get('token');
    if (!document.getElementsByTagName('base').length) {
      const base = document.createElement('base');
      base.setAttribute('href', document.location.origin);
      const head = document.getElementsByTagName('head')[0];
      head.appendChild(base);
    }
    const html = document.documentElement.innerHTML.toString();
    const bodyFormData = new FormData();
    bodyFormData.set('html', html);
    bodyFormData.set('attachment', attachmentName);
    return axios({
      url: api.baseUrl + 'v1/printPdf/',
      method: 'POST',
      json: true,
      responseType: 'blob',
      data: bodyFormData,
      headers: {
        'Accept': 'application/pdf',
        'Content-Type': 'multipart/form-data',
        'Authorization': token
      }
    }).then((response) => {
      return new Downloadable(response.data, attachmentName);
    });
  }
}
