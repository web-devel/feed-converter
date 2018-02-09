import {ActivityHeader, checkRows, parseExcel, ParsingRes, PartnerHeader} from "./parse";
import {html, render} from 'lit-html';
import {Observable, Subject} from "rxjs/Rx";
import {generateXML} from "./generate";
import moment from "moment";

namespace feed_converter {

  const fileInputEl = document!.querySelector<HTMLInputElement>('#file')!;
  const consoleEl = document.getElementById('console')!;
  const logSubj = new Subject<string>();

  const fileSource = Observable.fromEvent<TypedEvent<HTMLInputElement>>(fileInputEl, 'change')
    .filter((e) => e.target.files!.length > 0)
    .map((e) => e.target.files![0])
    .do((file: File) => {
      logSubj.next(`Chosen file: ${file.name}, type: ${file.type}`);
      logSubj.next(`Uploading started`);
    })
    .switchMap((file: File) => {
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      return Observable.fromEvent(reader, 'load');
    })
    .do(() =>
      logSubj.next(`Uploading finished`)
    )
    .map<any, any>((e: TypedEvent<FileReader>) => e.target.result);


  fileSource.subscribe((data: string) => {
    try {
      const res: ParsingRes = parseExcel(data, logSubj);
      logSubj.next(`Found ${res.partners.length} partners, ${res.activities.length} activities`);
      checkRows(res.activities, ActivityHeader).forEach(error => logSubj.next(error));
      checkRows(res.partners, PartnerHeader).forEach(error => logSubj.next(error));

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

  function renderLink(data: string, filename: string, type: string) {
    const file = new Blob([data], {type: type});
    const resTmpURL = URL.createObjectURL(file);

    render(
      html`<a href="${resTmpURL}" download="${filename}">${filename}</a>`,
      document.getElementById('results')!
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