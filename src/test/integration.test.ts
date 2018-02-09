import {ActivityHeader, checkRows, parseExcel, PartnerHeader} from "../parse";
import {Subject} from "rxjs/Subject";
import * as fs from 'fs';
import * as path from "path";
import {generateXML, parseTimeInterVal} from "../generate";
import * as assert from "assert";

describe('converter', function () {

  const logSubj = new Subject<string>();
  logSubj.asObservable().subscribe(msg => console.log(msg));

  it('parses and generates', function () {
    const res = parseExcel(readFile('test.xls'), logSubj);
    checkRows(res.activities, ActivityHeader).forEach((error: string) => logSubj.next(error));
    checkRows(res.partners, PartnerHeader).forEach((error: string) => logSubj.next(error));
    const xmlData = generateXML(res);
    fs.writeFileSync(path.join(__dirname, 'result.xml'), xmlData);
  });

  it('parses time interval correctly', function () {
    assert.equal(parseTimeInterVal('10:00 - 11:00')!.start.format('HH:mm'), '10:00');
    assert.equal(parseTimeInterVal('10:00 - 11:00')!.end.format('HH:mm'), '11:00');

  })
});

function readFile(fileName: string) {
  const fileBuff = fs.readFileSync(path.join(__dirname, fileName));
  return fileBuff.toString('binary');
}
