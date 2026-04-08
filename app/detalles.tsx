import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

interface Tarea {
  id: number;
  title: string;
  completed: boolean;
  description?: string; 
}

export default function DetallesScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  const [tarea, setTarea] = useState<Tarea | null>(null);

  useEffect(() => {
    getTareaById();
  }, [id]);

  const getTareaById = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:3000/todos/${id}`);
      const jsonResponse = await response.json();
      
      if (response.ok) {
        setTarea(jsonResponse.data);
      } else {
        alert("No se pudo cargar la tarea");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!tarea) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Detalles de la Tarea</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>ID de la tarea:</Text>
        <Text style={styles.value}>{tarea.id}</Text>

        <Text style={styles.label}>Nombre:</Text>
        <Text style={styles.value}>{tarea.title}</Text>

        {/* --- ESTO ES LO QUE AGREGAMOS --- */}
        <Text style={styles.label}>Descripción:</Text>
        <Text style={styles.value}>
          {tarea.description ? tarea.description : "No especificada"}
        </Text>
        {/* -------------------------------- */}

        <Text style={styles.label}>Estado:</Text>
        <Text style={styles.value}>{tarea.completed ? "✅ Completada" : "⏳ Pendiente"}</Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="Volver a la lista" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: { padding: 20, backgroundColor: '#f9f9f9', borderRadius: 10, borderWidth: 1, borderColor: '#ddd' },
  label: { fontSize: 16, fontWeight: 'bold', color: '#555', marginTop: 10 },
  value: { fontSize: 18, marginBottom: 10 }
});