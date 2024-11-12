import {AusweisRequestedInfoItem, IconMap, keyMappings, MappableKeys} from './constants';

export type MappablePayload = Record<MappableKeys, any>;

export type Mode = 'import' | 'disclose';

function formatValue(value: any): string {
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    // Handle nested objects by taking their values
    return Object.values(value).join(', ');
  }
  return String(value);
}

export function convertFromPIDPayload(properties: MappablePayload, mode: Mode): AusweisRequestedInfoItem[] {
  const humanReadablePayload: AusweisRequestedInfoItem[] = [];
  const {nationalities, country, locality, postal_code, street_address, address, ...objectToMap} = keyMappings;

  Object.entries(objectToMap).forEach(([k, label]) => {
    const mappedValue = properties[k];
    const hasValue = !!mappedValue;
    if (hasValue) {
      humanReadablePayload.push({
        label: label,
        icon: IconMap[k],
        data: formatValue(mappedValue),
      });
    }
  });

  const hasNationalities = properties['nationalities'];
  if (!!hasNationalities) humanReadablePayload.push(extractNationalityFromPayload(hasNationalities));
  humanReadablePayload.push(extractAddressFromPayload(properties));

  if (mode === 'disclose') {
    const ageEntries = Object.entries(properties).filter(([key, value]) => /^(\d+|age_over_\d+)$/.test(key) && typeof value === 'boolean');
    ageEntries.forEach(([age, isOver]) => {
      humanReadablePayload.push(extractAgeValuesFromPayload(age, isOver));
    });
  }

  return humanReadablePayload;
}

function extractAgeValuesFromPayload(age: string, isOver: boolean): AusweisRequestedInfoItem {
  return {
    label: keyMappings['age_in_years'],
    data: `Age over ${age.replace('age_over_', '')}: ${isOver ? 'yes' : 'no'}`,
    icon: IconMap['age_in_years'],
  };
}

export function extractNationalityFromPayload(nationalities: string[]): AusweisRequestedInfoItem {
  return {
    label: keyMappings['nationalities'],
    data: nationalities.join(', '),
    icon: IconMap['nationalities'],
  };
}

type SdjwtAddressField = 'country' | 'locality' | 'street_address' | 'postal_code';
type MdocAddressField = 'resident_country' | 'resident_city' | 'resident_street' | 'resident_postal_code';

const sdjwtAddressFields: SdjwtAddressField[] = ['street_address', 'postal_code', 'locality', 'country'];
const mdocAddressFields: MdocAddressField[] = ['resident_street', 'resident_postal_code', 'resident_city', 'resident_country'];

export function extractAddressFromPayload(properties: MappablePayload): AusweisRequestedInfoItem {
  const extractFields = (properties: MappablePayload, fields: (SdjwtAddressField | MdocAddressField)[]) => {
    return fields
      .map(field => {
        const value = properties[field];
        return value ? formatValue(value) : '';
      })
      .filter(Boolean)
      .join(', ');
  };

  const values = [extractFields(properties, sdjwtAddressFields), extractFields(properties, mdocAddressFields)].filter(Boolean);

  if (values.length === 0 && 'address' in properties) {
    values.push(extractFields(properties['address'], sdjwtAddressFields));
  }

  return {
    label: keyMappings['address'],
    data: values.join(' ').trim(),
    icon: IconMap['address'],
  };
}
