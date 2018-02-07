import {parseExcel} from "./excel";
import {html, render} from 'lit-html';
import {Observable, Subject} from "rxjs/Rx";

namespace feed_converter {

  const fileInput: HTMLInputElement = document.querySelector('#file');
  const logSubj: Subject<string> = new Subject();

  const fileSource = Observable.fromEvent(fileInput, 'change')
    .filter((e: TypedEvent<HTMLInputElement>) => e.target.files.length > 0)
    .map((e: TypedEvent<HTMLInputElement>) => e.target.files[0])
    .do((file:File) => {
      logSubj.next(`Chosen file: ${file.name}, type: ${file.type}`);
      logSubj.next(`Uploading started`);
    })
    .switchMap((file:File) => {
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      return Observable.fromEvent(reader, 'load');
    })
    .do(() =>
      logSubj.next(`Uploading finished`)
    )
    .map((e:TypedEvent<FileReader>) => e.target.result)
    .map((data) => parseExcel(data, logSubj));


  fileSource.subscribe((result) => {
    renderLink(result, "result.json", 'application/json');
  });

  logSubj.subscribe((msg) => {
    console.log(msg);
    renderLogMessage(msg);
  });

  function renderLink(data, filename: string, type) {
    console.table(data);
    const file = new Blob([data], {type: type});
    const resTmpURL = URL.createObjectURL(file);

    render(
      html`<a href="${resTmpURL}" download="${filename}">${filename}</a>`,
      document.getElementById('results')
    );
  }

  function renderLogMessage(msg: string) {
    document.getElementById('console').insertAdjacentHTML('beforeend', `<p>${msg}</p>`);
  }
}


declare interface TypedEvent<T> extends Event {
  target: T & EventTarget;
}