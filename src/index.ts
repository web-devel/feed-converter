import * as XLSX from 'xlsx';
import {Observable} from "rxjs/Rx";

namespace feed_converter {

  const fileInput: HTMLInputElement = document.querySelector('#file');

  const fileSource = Observable.fromEvent(fileInput, 'change')
    .filter((e: TypedEvent<HTMLInputElement>) => e.target.files.length > 0)
    .map((e: TypedEvent<HTMLInputElement>) => e.target.files[0])
    .map((file:File) => {
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      return Observable.fromEvent(reader, 'load');
    })
    .switch()
    .map((e:TypedEvent<FileReader>) => e.target.result);

  fileSource.subscribe((data) => {
    parseExcel(data);
  });


  function parseExcel(data: string) {
    const wb: XLSX.WorkBook = XLSX.read(data, {type: 'binary'});
    const wsname: string = wb.SheetNames[0];
    const ws: XLSX.WorkSheet = wb.Sheets[wsname];
    let list1json = XLSX.utils.sheet_to_json(ws);

    initiateDownload(JSON.stringify(list1json), 'result.json', 'application/json');
  }

  // Function to download data to a file
  function initiateDownload(data, filename: string, type) {
    const file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
      let a = document.createElement("a");
      a.href = URL.createObjectURL(file);
      a.download = filename;
      a.textContent = filename;
      document.body.appendChild(a);
    }
  }

}

declare interface TypedEvent<T> extends Event {
  target: T & EventTarget;
}