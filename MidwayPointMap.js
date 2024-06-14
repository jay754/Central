import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Button, ScrollView, Platform, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const GOOGLE_MAPS_APIKEY = '';

const MidwayPointMap = () => {
  const [location1, setLocation1] = useState(null);
  const [location2, setLocation2] = useState(null);
  const [midpoint, setMidpoint] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [places, setPlaces] = useState([]);
  
  const location1Ref = useRef(null);
  const location2Ref = useRef(null);

  const calculateMidpoint = (loc1, loc2) => {
    const lat = (loc1.latitude + loc2.latitude) / 2;
    const lng = (loc1.longitude + loc2.longitude) / 2;
    return { latitude: lat, longitude: lng };
  };

  const calculateRegion = (loc1, loc2) => {
    const mid = calculateMidpoint(loc1, loc2);
    const latitudeDelta = Math.abs(loc1.latitude - loc2.latitude) * 2;
    const longitudeDelta = Math.abs(loc1.longitude - loc2.longitude) * 2;
    return {
      latitude: mid.latitude,
      longitude: mid.longitude,
      latitudeDelta,
      longitudeDelta,
    };
  };

  const handleLocationSelect = (data, details, setter) => {
    const location = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng
    };
    setter(location);

    if (location1 && location2) {
      setRegion(calculateRegion(location1, location2));
    } else if (location1 && !location2) {
      setRegion(calculateRegion(location1, location));
    } else if (!location1 && location2) {
      setRegion(calculateRegion(location, location2));
    }
  };

  const handleCalculateMidpoint = () => {
    if (location1 && location2) {
      console.log(location1)

      const midpoint = calculateMidpoint(location1, location2);
      setMidpoint(midpoint);
    }
  };

  useEffect(() => {
    if (location1 && location2) {
      setRegion(calculateRegion(location1, location2));
    }
  }, [location1, location2]);

  return (
    <View style={styles.container}>
      <View style={styles.autocompleteContainer}>
        <GooglePlacesAutocomplete
          ref={location1Ref}
          placeholder="Search Location 1"
          onPress={(data, details = null) => handleLocationSelect(data, details, setLocation1)}
          query={{
            key: '',
            language: 'en',
          }}
          fetchDetails={true}
          styles={{ textInput: styles.textInput }}
          textInputProps={{
            onFocus: () => location1Ref.current?.setAddressText(''),
          }}
        />
        <GooglePlacesAutocomplete
          ref={location2Ref}
          placeholder="Search Location 2"
          onPress={(data, details = null) => handleLocationSelect(data, details, setLocation2)}
          query={{
            key: '',
            language: 'en',
          }}
          fetchDetails={true}
          styles={{ textInput: styles.textInput }}
          textInputProps={{
            onFocus: () => location2Ref.current?.setAddressText(''),
          }}
        />
        <Button title="Find Midpoint" onPress={handleCalculateMidpoint} />
      </View>
      <MapView style={styles.map} region={region}>
        {location1 && <Marker coordinate={location1} title="Location 1" />}
        {location2 && <Marker coordinate={location2} title="Location 2" />}
        {midpoint && <Marker coordinate={midpoint} title="Midpoint" pinColor="blue" />}
        {places.map((place, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            }}
            title={place.name}
            description={place.vicinity}
          />
        ))}
      </MapView>
      {midpoint && (
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesText}>Midpoint Coordinates:</Text>
          <Text style={styles.coordinatesText}>Latitude: {midpoint.latitude.toFixed(5)}</Text>
          <Text style={styles.coordinatesText}>Longitude: {midpoint.longitude.toFixed(5)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  autocompleteContainer: {
    position: 'absolute',
    width: '100%',
    top: 0,
    zIndex: 1,
    padding: 10,
    backgroundColor: 'white',
  },
  textInput: {
    height: 40,
    borderColor: '#888',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    ...(Platform.OS === 'ios' && Platform.isPad && {
      height: 50, // Adjust height for iPad
    }),
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  coordinatesContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    elevation: 3,
  },
  coordinatesText: {
    fontSize: 16,
  },
});

export default MidwayPointMap;