import React, { useState, useRef, useCallback } from "react";
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
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const handleToggleCamera = useCallback(() => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }, []);

  const handleTakePhoto = useCallback(async () => {
    if (cameraRef.current) {
      setIsLoading(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        if (photo && photo.uri) {
          setImageUri(photo.uri);
          setIsCameraActive(false);
        }
      } catch (error) {
        Alert.alert(
          "Erro ao tirar foto",
          "Não foi possível capturar a imagem."
        );
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const handleGetLocation = useCallback(async () => {
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
  }, []);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.message}>
          Precisamos da sua permissão para usar a câmera
        </Text>
        <Button onPress={requestPermission} title="Conceder Permissão" />
      </View>
    );
  }

  if (isCameraActive) {
    return (
      <View style={styles.container}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setIsCameraActive(false)}
            >
              <Text style={styles.text}>Fechar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.takePhotoButton}
              onPress={handleTakePhoto}
            >
              <Text style={[styles.text, { fontWeight: "bold" }]}>
                Tirar Foto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleToggleCamera}
            >
              <Text style={styles.text}>Inverter</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <StatusBar style="auto" />
      <Text style={styles.header}>Foto e Localização</Text>

      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>Sua foto aparecerá aqui</Text>
        )}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Digite algo sobre a foto/local..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <View style={styles.actionButtonContainer}>
        <Button
          title="Tirar Foto"
          onPress={() => setIsCameraActive(true)}
          disabled={isLoading}
        />
        <Button
          title={isLoading ? "Carregando..." : "Minha Localização"}
          onPress={handleGetLocation}
          disabled={isLoading}
        />
      </View>

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
            {isLoading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              "O mapa aparecerá aqui"
            )}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    alignItems: "center",
    paddingTop: 50,
  },
  containerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  imageContainer: {
    width: "100%",
    height: 250,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  placeholderText: {
    color: "#888",
  },
  input: {
    width: "100%",
    height: 80,
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  actionButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
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
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.6)",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  cameraButton: {
    padding: 10,
    borderRadius: 25,
    minWidth: 90,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  takePhotoButton: {
    backgroundColor: "#319ef8",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  message: {
    textAlign: "center",
    paddingBottom: 20,
  },
});
