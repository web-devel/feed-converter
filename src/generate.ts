import {Activity, activityHeaders, ParsingRes, Partner, partnerHeaders} from "./parse";
import moment from "moment";

export function generateXML({partners, activities}: ParsingRes) {
  return '' +
`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<feed>
    <partners/>
    <locations>
      ${generateLocations(partners)}
    </locations>
    <activities>
      ${generateActivities(activities)}
    </activities>
</feed>
`
}

function generateLocations(partners: Partner[]) {
  return partners.reduce((locationsStr, partner)=>
    locationsStr += `
        <location external_id="${safe(partner[partnerHeaders.id])}" external_partner_id="${safe(partner[partnerHeaders.id])}">
            <name>${safe(partner[partnerHeaders.club])}</name>
            <location_type value="26"/>
            <address_line1>${safe(partner[partnerHeaders.addr1])}</address_line1>
            <city>${safe(partner[partnerHeaders.addr2])}</city>
            <postcode>${safe(partner[partnerHeaders.postcode])}</postcode>
            <latitude>${safe(partner[partnerHeaders.lat])}</latitude>
            <longitude>${safe(partner[partnerHeaders.long])}</longitude>
        </location>`, '');
}

function generateOccurrances(act: Activity) {
  const time = act[activityHeaders.time];
  const startDateRaw = act[activityHeaders.startDate];
  const endDateRaw = act[activityHeaders.endDate];

  if (!time || !startDateRaw || !endDateRaw) {
    return '';
  }

  let startDate = moment(startDateRaw, 'DD/MM/YY');
  let endDate = moment(endDateRaw, 'DD/MM/YY');
  const interval = parseTimeInterVal(time);

  if (!interval || !startDate.isValid() || !endDate.isValid()) {
    return '';
  }

  startDate = startDate.startOf('day');
  endDate = endDate.startOf('day');

  let res = ``;

  while(startDate.diff(endDate) <= 0) {
    const day = startDate.clone();
    day.hours();
    res += `<times>
                    <start_time>${day.hours(interval.start.hours()).minutes(interval.start.minutes()).format('YYYY-MM-DDTHH:mm:ss')}</start_time>
                    <finish_time>${day.hours(interval.end.hours()).minutes(interval.end.minutes()).format('YYYY-MM-DDTHH:mm:ss')}</finish_time>
                </times>`;
    startDate.add(7,'days');
  }


  return res
}

export function parseTimeInterVal(str: string): {start:moment.Moment, end:moment.Moment} | null {
  const [whole, start, end] = /(\d\d:\d\d) - (\d\d:\d\d)/.exec(str);
  if (!start || !end) return null;
  return {
    start: moment(start, 'HH:mm'),
    end: moment(end,'HH:mm')
  };
}

function generateActivities(activities: Activity[]) {
  return activities.reduce((actStr, activity) =>
    actStr += `
        <activity external_id="${safe(activity[activityHeaders.idActivity])}" external_location_id="${safe(activity[activityHeaders.idLocation])}" external_partner_id="${safe(activity[activityHeaders.idLocation])}">
            <title>${safe(activity[activityHeaders.event])}</title>
            <short_description>${safe(activity[activityHeaders.shortDescription])}</short_description>
            <project_id value="37"/>
            <description>
                ${safe(activity[activityHeaders.longDescription])}
            </description>
            <is_free>0</is_free>
            <cost_information>${safe(activity[activityHeaders.cost])}</cost_information>
            <occurrences>
                ${generateOccurrances(activity)}
            </occurrences>
            <category value="84"/>
            <suitable_for>
                <any_age>0</any_age>
                <s0-4>0</s0-4>
                <s5-6>0</s5-6>
                <s7-10>0</s7-10>
                <s11-13>0</s11-13>
                <s14-15>0</s14-15>
                <s16-17>1</s16-17>
                <s18>1</s18>
            </suitable_for>
            <family_friendly>0</family_friendly>
            <activity_type>EVENT</activity_type>
            <contact>
                <contact_email>${safe(activity[activityHeaders.email])}</contact_email>
                <contact_phone>${safe(activity[activityHeaders.telephone])}</contact_phone>
            </contact>
            <photo>
                <photo_url>${safe(activity[activityHeaders.image])}</photo_url>
                <photo_description>${safe(activity[activityHeaders.imageDescription])}</photo_description>
            </photo>
        </activity>
    `, '')
}


function safe(unsafe):string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}