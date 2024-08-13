import {translate} from '../../../localization/Localization';

type Icon = 'person' | 'gender' | 'birthday' | 'nationality' | 'birthplace' | 'address';

export const InfoSchemaImages = {
  person: require('../../../assets/images/person.png'),
  gender: require('../../../assets/images/gender.png'),
  birthday: require('../../../assets/images/birthday.png'),
  birthplace: require('../../../assets/images/birthplace.png'),
  address: require('../../../assets/images/address.png'),
  nationality: require('../../../assets/images/nationality.png'),
} satisfies {[key in Icon]: string};

export type AusweisRequestedInfoItem = {
  label: string;
  icon: Icon;
  data?: string;
};

export const AusweisRequestedInfoSchema = [
  {
    label: translate('import_data_consent_label_given_name'),
    icon: 'person',
  },
  {
    label: translate('import_data_consent_label_family_name'),
    icon: 'person',
  },
  {
    label: translate('import_data_consent_label_also_known_as'),
    icon: 'person',
  },
  {
    label: translate('import_data_consent_label_gender'),
    icon: 'gender',
  },
  {
    label: translate('import_data_consent_label_birthdate'),
    icon: 'birthday',
  },
  {
    label: translate('import_data_consent_label_birthplace'),
    icon: 'birthplace',
  },
  {
    label: translate('import_data_consent_label_nationality'),
    icon: 'nationality',
  },
  {
    label: translate('import_data_consent_label_address'),
    icon: 'address',
  },
] satisfies readonly {label: string; icon: Icon}[];
