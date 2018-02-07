import {activityHeaders, checkRows, parseExcel, partnerHeaders} from "../excel";
import {Subject} from "rxjs/Subject";
import * as fs from 'fs';
import * as path from "path";

describe('excel', function () {

  const logSubj = new Subject<string>();
  logSubj.asObservable().subscribe(msg => console.log(msg));

  it('parses xml', function () {
    const res = parseExcel(readFile('180130.xls'), logSubj);
    checkRows(res.activities, activityHeaders).forEach(error=> logSubj.next(error));
    checkRows(res.partners, partnerHeaders).forEach(error=> logSubj.next(error));
  });

});

function readFile(fileName: string) {
  const fileBuff = fs.readFileSync(path.join(__dirname, fileName));
  return fileBuff.toString('binary');
}
