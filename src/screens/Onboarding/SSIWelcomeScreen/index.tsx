import React, {useState} from 'react';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {SSIWelcomeViewTitleTextStyled as TitleCaption, SSIButtonBottomContainerStyled as ButtonContainer} from '../../../styles/components';

type Country = {
  key: string;
  name: string;
  flag: string;
};

const countryData: Country[] = [
  {key: 'DE', name: 'Germany', flag: 'https://flagcdn.com/w320/de.png'},
  {key: 'FR', name: 'France', flag: 'https://flagcdn.com/w320/fr.png'},
  {key: 'IT', name: 'Italy', flag: 'https://flagcdn.com/w320/it.png'},
  {key: 'ES', name: 'Spain', flag: 'https://flagcdn.com/w320/es.png'},
  {key: 'NL', name: 'Netherlands', flag: 'https://flagcdn.com/w320/nl.png'},
  {key: 'BE', name: 'Belgium', flag: 'https://flagcdn.com/w320/be.png'},
  {key: 'CH', name: 'Switzerland', flag: 'https://flagcdn.com/w320/ch.png'},
  {key: 'AT', name: 'Austria', flag: 'https://flagcdn.com/w320/at.png'},
  {key: 'GR', name: 'Greece', flag: 'https://flagcdn.com/w320/gr.png'},
];

const App = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const renderItem = ({item}: {item: Country}) => (
    <TouchableOpacity style={styles.item} onPress={() => setSelectedCountry(item.key)}>
      <Image source={{uri: item.flag}} style={styles.flag} />
      <Text style={styles.countryText}>{item.name}</Text>
      <View style={selectedCountry === item.key ? styles.selectedCircle : styles.circle}>
        {selectedCountry === item.key && <View style={styles.innerCircle} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Create Wallet</Text>
      <TitleCaption>Select Country</TitleCaption>
      <TextInput placeholder="Search" placeholderTextColor="#B0B0B0" style={styles.searchInput} />
      <FlatList data={countryData} renderItem={renderItem} keyExtractor={item => item.key} />
      <ButtonContainer>
        <PrimaryButton style={{height: 42, width: 300}} caption="Continue" onPress={() => console.log('Continue')} />
      </ButtonContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1E2630',
  },
  headerText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginVertical: 10,
  },
  stepText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'right',
    marginVertical: 10,
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 10,
  },
  searchInput: {
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 16,
    color: 'white',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#404D7A',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3642',
  },
  flag: {
    width: 17,
    height: 12,
    marginRight: 10,
  },
  countryText: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FBFBFB',
  },
  selectedCircle: {
    width: 18,
    height: 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FBFBFB',
  },
  innerCircle: {
    width: 9,
    height: 9,
    borderRadius: 6,
    backgroundColor: '#0B81FF',
  },
  continueButton: {
    backgroundColor: '#7C4DFF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  continueText: {
    color: 'white',
    fontSize: 18,
  },
});

export default App;
