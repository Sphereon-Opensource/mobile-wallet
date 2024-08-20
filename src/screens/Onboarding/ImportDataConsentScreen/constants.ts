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

export const AusweisRequestedInfoSchema: AusweisRequestedInfoItem[] = [
  {
    label: 'given_name',
    icon: 'person',
  },
  {
    label: 'family_name',
    icon: 'person',
  },
  {
    label: 'also_known_as',
    icon: 'person',
  },
  {
    label: 'gender',
    icon: 'gender',
  },
  {
    label: 'birthdate',
    icon: 'birthday',
  },
  {
    label: 'birthplace',
    icon: 'birthplace',
  },
  {
    label: 'nationality',
    icon: 'nationality',
  },
  {
    label: 'address',
    icon: 'address',
  },
];
