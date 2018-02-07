import * as XLSX from "xlsx";
import {Subject} from "rxjs/Subject";

const enum SheetNames {
  ACT = 'Act',
  PARTNERS = 'Partners'
}

export const activityHeaders = {
  'Event': 'Event',
  'Venue Name': 'Venue Name',
  'Addr 1': 'Addr 1',
  'Addr 2': 'Addr 2',
  'Town': 'Town',
  'County': 'County',
  'Postcode': 'Postcode',
  'Operator': 'Operator',
  'Contact Telephone': 'Contact Telephone',
  'email': 'email',
  'Days': 'Days',
  'Time': 'Time',
  'id activity': 'id activity',
  'id location': 'id location',
  'Cost': 'Cost',
  'Short Description': 'Short Description',
  'Long Description': 'Long Description',
  'image': 'image',
  'Image description': 'Image description',
  'Special requirements': 'Special requirements',
  'Accreditation': 'Accreditation',
  'Lat': 'Lat',
  'Long': 'Long',
  'Start date': 'Start date',
  'End date': 'End date'
};

export type Activity = {
  [P in keyof typeof activityHeaders]: string
}

export const partnerHeaders = {
  'PGA Professional': 'PGA Professional',
  'Your Surname': 'Your Surname',
  'Your Club': 'Your Club',
  'Your Role at the Club': 'Your Role at the Club',
  'Your Telephone Number': 'Your Telephone Number',
  'Your Email Address': 'Your Email Address',
  'Venue name': 'Venue name',
  'Addr 1': 'Addr 1',
  'Addr 2': 'Addr 2',
  'Postcode': 'Postcode',
  'Please give a decscription of the activity taking place during your Club Day. For example come and try sessions, welcome for new coaches, volunteers and officials.': 'Please give a decscription of the activity taking place during your Club Day. For example come and try sessions, welcome for new coaches, volunteers and officials.',
  'ID': 'ID',
  'Lat': 'Lat',
  'Long': 'Long',
  'Job title': 'Job title'
};

export type Partner = {
  [P in keyof typeof partnerHeaders]: string
}


export interface ParsingRes {
  activities: Activity[],
  partners: Partner[]
}

export function parseExcel(data: string, logSubj: Subject<string>): ParsingRes {
  logSubj.next(`Reading workbook`);
  const wb: XLSX.WorkBook = XLSX.read(data, {type: 'binary'});

  const sheetNames = Object.keys(wb.Sheets);
  logSubj.next(`Found ${sheetNames.length} sheets: ${sheetNames.join(',')}`);

  const actSheet = wb.Sheets[SheetNames.ACT];
  const partnersSheet = wb.Sheets[SheetNames.PARTNERS];
  if (!actSheet || !partnersSheet) {
    throw new Error('Required sheets not found');
  }

  const activities:Activity[] = XLSX.utils.sheet_to_json(actSheet);
  const partners:Partner[] = XLSX.utils.sheet_to_json(partnersSheet);

  return {activities: activities, partners: partners};
}

export function checkRows<T>(rows:T[], headers: typeof activityHeaders | typeof partnerHeaders): string[] {
  const errors = [];
  rows.forEach((row: T, i) => {
    Object.keys(headers).forEach(key => {
      if (!row.hasOwnProperty(key)) {
        errors.push(`Row#${i}, column '${key}' is not specified`);
      }
    });
  });
  return errors;
}