import React, {useState} from 'react';
import {View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image} from 'react-native';

const countryData = [
  {key: 'DE', name: 'Germany', flag: 'https://flagcdn.com/w320/de.png'},
  {key: 'FR', name: 'France', flag: 'https://flagcdn.com/w320/fr.png'},
  {key: 'IT', name: 'Italy', flag: 'https://flagcdn.com/w320/it.png'},
  {key: 'ES', name: 'Spain', flag: 'https://flagcdn.com/w320/es.png'},
  {key: 'NL', name: 'Netherlands', flag: 'https://flagcdn.com/w320/nl.png'},
  {key: 'BE', name: 'Belgium', flag: 'https://flagcdn.com/w320/be.png'},
  {key: 'CH', name: 'Switzerland', flag: 'https://flagcdn.com/w320/ch.png'},
  {key: 'AT', name: 'Austria', flag: 'https://flagcdn.com/w320/at.png'},
];

const App = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);

  const renderItem = ({item}) => (
    <TouchableOpacity style={styles.item} onPress={() => setSelectedCountry(item.key)}>
      <Image source={{uri: item.flag}} style={styles.flag} />
      <Text style={styles.countryText}>{item.name}</Text>
      <View style={selectedCountry === item.key ? styles.selectedCircle : styles.circle} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Create Wallet</Text>
      <Text style={styles.title}>Select country</Text>
      <TextInput placeholder="Search" placeholderTextColor="#B0B0B0" style={styles.searchInput} />
      <FlatList data={countryData} renderItem={renderItem} keyExtractor={item => item.key} />
      <TouchableOpacity style={styles.continueButton}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
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
    backgroundColor: '#2A3642',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: 'white',
    marginBottom: 20,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2A3642',
  },
  selectedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
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
