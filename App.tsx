import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export default function App() {
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTakePhoto = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    if (cameraPermission.status !== "granted") {
      Alert.alert(
        "Permissão Negada",
        "Você precisa permitir o uso da câmera para tirar fotos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      allowsEditing: false,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleGetLocation = async () => {
    setIsLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão Negada", "Permissão de localização é necessária!");
      setIsLoading(false);
      return;
    }

    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível obter a localização.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.header}>Foto </Text>

      {}
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>Sua foto aparecerá aqui</Text>
        )}
      </View>

      {}
      <TextInput
        style={styles.input}
        placeholder="Digite algo sobre a foto/local..."
        value={description}
        onChangeText={setDescription}
      />

      {}
      <View style={styles.buttonContainer}>
        <Button title="Tirar Foto" onPress={handleTakePhoto} />
        <Button title="Minha Localização" onPress={handleGetLocation} />
      </View>

      {}
      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Local da Foto"
            />
          </MapView>
        ) : (
          <Text style={styles.placeholderText}>
            {isLoading ? "Carregando mapa..." : "O mapa aparecerá aqui"}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#030303",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  imageContainer: {
    width: "100%",
    height: 300,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#57575a",
    borderRadius: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  placeholderText: {
    color: "#999",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#4d4646",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    borderRadius: 10,
  },
  mapContainer: {
    width: "100%",
    height: 300,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  map: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
});
