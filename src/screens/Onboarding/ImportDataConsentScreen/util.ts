import {AusweisRequestedInfoItem, IconMap, keyMappings, MappableKeys} from './constants';

export type MappablePayload = Record<MappableKeys, any>;

export function convertFromPIDPayload(properties: MappablePayload): AusweisRequestedInfoItem[] {
  const humanReadablePayload: AusweisRequestedInfoItem[] = [];
  const {nationalities, country, locality, postal_code, street_address, address, ...objectToMap} = keyMappings;
  Object.entries(objectToMap).forEach(([k, label]) => {
    const mappedValue = properties[k];
    const hasValue = !!mappedValue;
    if (hasValue) {
      humanReadablePayload.push({
        label: label,
        icon: IconMap[k],
        data: mappedValue,
      });
    }
  });

  const hasNationalities = properties['nationalities'];
  if (!!hasNationalities) humanReadablePayload.push(extractNationalityFromPayload(hasNationalities));
  humanReadablePayload.push(extractAddressFromPayload(properties));

  return humanReadablePayload;
}

export function extractNationalityFromPayload(nationalities: string[]): AusweisRequestedInfoItem {
  return {
    label: keyMappings['nationalities'],
    data: nationalities.join(', '),
    icon: IconMap['nationalities'],
  };
}

export function extractAddressFromPayload(properties: MappablePayload): AusweisRequestedInfoItem {
  const country = properties['country'];
  const locality = properties['locality'];
  const street_address = properties['street_address'];
  const postal_code = properties['postal_code'];

  let value = '';
  if (street_address) value += street_address + ' ';
  if (postal_code) value += postal_code + ' ';
  if (locality) value += locality + ' ';
  if (country) value += country + ' ';

  return {
    label: keyMappings['address'],
    data: value,
    icon: IconMap['address'],
  };
}
