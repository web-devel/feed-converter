import * as XLSX from "xlsx";
import {Subject} from "rxjs/Subject";

const enum SheetNames {
  ACT = 'Act',
  PARTNERS = 'Partners'
}

export enum ActivityHeader {
  event = 'Event',
  venueName = 'Venue Name',
  addr1 = 'Addr 1',
  addr2 = 'Addr 2',
  town = 'Town',
  county = 'County',
  postcode = 'Postcode',
  operator = 'Operator',
  telephone = 'Contact Telephone',
  email = 'email',
  days = 'Days',
  time = 'Time',
  idActivity = 'id activity',
  idLocation = 'id location',
  cost = 'Cost',
  shortDescription = 'Short Description',
  longDescription = 'Long Description',
  image = 'image',
  imageDescription = 'Image description',
  specialRequirements = 'Special requirements',
  accreditation = 'Accreditation',
  lat = 'Lat',
  long = 'Long',
  startDate = 'Start date',
  endDate = 'End date'
}

export type Activity = {
  [P in ActivityHeader]: string
}

export enum PartnerHeader {
  pga = 'PGA Professional',
  surname = 'Your Surname',
  club = 'Your Club',
  role = 'Your Role at the Club',
  telephone = 'Your Telephone Number',
  email = 'Your Email Address',
  venueName = 'Venue name',
  addr1 = 'Addr 1',
  addr2 = 'Addr 2',
  postcode = 'Postcode',
  description = 'Please give a decscription of the activity taking place during your Club Day. For example come and try sessions, welcome for new coaches, volunteers and officials.',
  id = 'ID',
  lat = 'Lat',
  long = 'Long',
  job = 'Job title'
}

export type Partner = {
  [P in PartnerHeader]: string
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

  const activities: Activity[] = XLSX.utils.sheet_to_json(actSheet);
  const partners: Partner[] = XLSX.utils.sheet_to_json(partnersSheet);

  return {activities: activities, partners: partners};
}

export function checkRows<T>(rows: T[], headers: typeof ActivityHeader | typeof PartnerHeader): string[] {
  const errors:string[] = [];
  rows.forEach((row: T, i) => {
    Object.entries(headers).forEach(([key, columnHeader]) => {
      if (!row.hasOwnProperty(columnHeader) && columnHeader !== PartnerHeader.surname) {
        errors.push(`Row#${i}, column '${columnHeader}' is not specified`);
      }
    });
  });
  return errors;
}