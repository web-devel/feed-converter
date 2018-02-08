import {activityHeaders, checkRows, parseExcel, ParsingRes, partnerHeaders} from "./parse";
import {html, render} from 'lit-html';
import {Observable, Subject} from "rxjs/Rx";
import {generateXML} from "./generate";
import moment from "moment";

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
    .map((e:TypedEvent<FileReader>) => e.target.result);


  fileSource.subscribe((data: string) => {
    try {
      const res:ParsingRes = parseExcel(data, logSubj);
      logSubj.next(`Found ${res.partners.length} partners, ${res.activities.length} activities`);
      checkRows(res.activities, activityHeaders).forEach(error=> logSubj.next(error));
      checkRows(res.partners, partnerHeaders).forEach(error=> logSubj.next(error));

      const generatedXML = generateXML(res);
      renderLink(generatedXML, `result_${moment().format('DD-MM-YY_HH-mm')}.xml`, 'text/xml');
    } catch (e) {
      logSubj.next(`ERROR: ${e}`);
    }
  }, error => logSubj.next(`ERROR: ${error}`));

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