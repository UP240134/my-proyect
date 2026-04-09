import { View, Text, StyleSheet, Button, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter , } from 'expo-router';
import { useEffect, useState } from 'react';

export default function EditarScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [completada, setCompletada] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getTareaActual();
  }, [id]);

  const getTareaActual = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:3000/todos/${id}`);
      const jsonResponse = await response.json();
      
      if (response.ok) {
        const tarea = jsonResponse.data;
        setTitulo(tarea.title);
        setDescripcion(tarea.description ? tarea.description : '');
        setCompletada(tarea.completed);
      } else {
        Alert.alert("Error", "No se pudo cargar la tarea a editar");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const guardarCambios = async () => {
    if (!titulo || titulo.trim() === '') {
      return Alert.alert('Aviso', 'El título no puede estar vacío');
    }

    try {
      const response = await fetch(`http://10.0.2.2:3000/todos/${id}`, {
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: titulo, 
          description: descripcion,
          completed: completada 
        }) 
      });

      if (response.ok) {
        Alert.alert("Éxito", "Tarea actualizada correctamente", [
          { text: "OK", onPress: () => router.back() }
        ]);
      } else {
        const err = await response.json();
        Alert.alert('Error al guardar', JSON.stringify(err));
      }
    } catch (error) {
      Alert.alert('Error de red', `No se pudo conectar: ${(error as Error).message}`);
    }
  };

  if (cargando) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Editar Tarea</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Título:</Text>
        <TextInput 
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
        />

        <Text style={styles.label}>Descripción:</Text>
        <TextInput 
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          value={descripcion}
          onChangeText={setDescripcion}
          multiline={true}
        />

        <View style={{ marginTop: 20, gap: 10 }}>
          <Button title="GUARDAR CAMBIOS" color="green" onPress={guardarCambios} />
          <Button title="CANCELAR" color="gray" onPress={() => router.back()} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: { padding: 20, backgroundColor: '#f9f9f9', borderRadius: 10, borderWidth: 1, borderColor: '#ddd' },
  label: { fontSize: 16, fontWeight: 'bold', color: '#555', marginTop: 10, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, backgroundColor: '#fff', fontSize: 16 }
});