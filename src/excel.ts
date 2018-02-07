import * as XLSX from "xlsx";
import {Subject} from "rxjs/Subject";

const enum SheetNames {
  ACT = 'Act',
  PARTNERS = 'Partners'
}

const columHeaders = {
  [SheetNames.ACT]: [
    'Event',
    'Venue Name',
    'Addr 1',
    'Addr 2',
    'Town',
    'County',
    'Postcode',
    'Operator',
    'Contact Telephone',
    'email',
    'Days',
    'Time',
    'id activity',
    'id location',
    'Cost',
    'Short Description',
    'Long Description',
    'image',
    'Image description',
    'Special requirements',
    'Accreditation',
    'Lat',
    'Long',
    'Start date',
    'End date'
  ],
  [SheetNames.PARTNERS]: [
    'PGA Professional',
    'Your Surname',
    'Your Club',
    'Your Role at the Club',
    'Your Telephone Number',
    'Your Email Address',
    'Venue name',
    'Addr 1',
    'Addr 2',
    'Postcode',	'Please give a decscription of the activity taking place during your Club Day. For example come and try sessions, welcome for new coaches, volunteers and officials.',
    'ID',
    'Lat',
    'Long',
    'Job title'
  ]
};


export default function parseExcel(data: string, logSubj: Subject<string>): {} {
  logSubj.next(`Reading workbook`);
  const wb: XLSX.WorkBook = XLSX.read(data, {type: 'binary'});
  const wsname: string = wb.SheetNames[0];
  const ws: XLSX.WorkSheet = wb.Sheets[wsname];
  return XLSX.utils.sheet_to_json(ws);
}