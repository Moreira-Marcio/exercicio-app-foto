import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

export default function App() {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      // Request camera and media library permissions
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (
        cameraPermission.status !== "granted" ||
        mediaLibraryPermission.status !== "granted"
      ) {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de permissão para acessar a câmera e a galeria de fotos para que isso funcione!"
        );
      }

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permissão para acessar a localização foi negada");
        return;
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const getLocation = async () => {
    try {
      let locationData = await Location.getCurrentPositionAsync({});
      setLocation(locationData);
      setErrorMsg(null);
    } catch (error) {
      setErrorMsg("Erro ao obter a localização: " + error);
      setLocation(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App de Foto e Localização</Text>

      <View style={styles.buttonContainer}>
        <Button title="Escolher Foto da Galeria" onPress={pickImage} />
        <Button title="Tirar Foto" onPress={takePhoto} />
      </View>

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <View style={styles.buttonContainer}>
        <Button title="Obter Localização" onPress={getLocation} />
      </View>

      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      {location && (
        <View style={styles.locationContainer}>
          <Text>Latitude: {location.coords.latitude}</Text>
          <Text>Longitude: {location.coords.longitude}</Text>
          <Text>Altitude: {location.coords.altitude}</Text>
          <Text>Precisão: {location.coords.accuracy} metros</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: 20,
  },
  locationContainer: {
    marginTop: 20,
    alignItems: "flex-start",
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
});
