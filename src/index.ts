import {activityHeaders, checkRows, parseExcel, ParsingRes, partnerHeaders} from "./excel";
import {html, render} from 'lit-html';
import {Observable, Subject} from "rxjs/Rx";

namespace feed_converter {

  const fileInputEl: HTMLInputElement = document.querySelector('#file');
  const consoleEl = document.getElementById('console');
  const logSubj: Subject<string> = new Subject();

  const fileSource = Observable.fromEvent(fileInputEl, 'change')
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


  fileSource.subscribe((res: ParsingRes) => {
    checkRows(res.activities, activityHeaders).forEach(error=> logSubj.next(error));
    checkRows(res.partners, partnerHeaders).forEach(error=> logSubj.next(error));
    renderLink(res, "result.json", 'application/json');
  });

  logSubj.subscribe((msg) => {
    console.log(msg);
    renderLogMessage(msg);
  });

  function renderLink(data, filename: string, type) {
    const file = new Blob([data], {type: type});
    const resTmpURL = URL.createObjectURL(file);

    render(
      html`<a href="${resTmpURL}" download="${filename}">${filename}</a>`,
      document.getElementById('results')
    );
  }

  function renderLogMessage(msg: string) {
    consoleEl.insertAdjacentHTML('beforeend', `<div>${msg}</div>`);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }
}

declare interface TypedEvent<T> extends Event {
  target: T & EventTarget;
}