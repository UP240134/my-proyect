import { useState, useEffect, useCallback , } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter , useFocusEffect } from 'expo-router';



interface Tareas {
  id: number;
  title: string;
  completed: boolean;
  descrption: string;
}

export default function Index() {
  const [tareas, setTareas] = useState<Tareas[]>([]);
  const [nuevaTarea, setNuevaTarea] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState(''); // <-- NUEVO ESTADO
  

  const API_URL = "http://10.0.2.2:3000"; 
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      getTareas();
    }, [])
  );

  const getTareas = async () => {
    try {
      const response = await fetch(API_URL + "/todos", {
        method: "GET"
      });
    
      if (response.ok) {
        const jsonResponse = await response.json();
        setTareas(jsonResponse.data); 
      } else {
        throw new Error(`Error no se pudieron obtener las tareas`);
      } 
    } catch (error) {
      Alert.alert(`Ocurrió un error al llamar la API: ${error}`);
    }
  };

  const postTarea = async () => {
    if (!nuevaTarea || nuevaTarea.trim() === '') {
       return Alert.alert('Aviso', 'No puedes mandar una tarea sin título');
    }

    try {
      const response = await fetch("http://10.0.2.2:3000/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: nuevaTarea, 
          description: nuevaDescripcion // <-- AHORA MANDAMOS LA DESCRIPCIÓN
        }) 
      });
      
      const jsonResponse = await response.json();

      if (response.ok) {
        setTareas([...tareas, jsonResponse.data]);
        setNuevaTarea(''); 
        setNuevaDescripcion(''); // <-- LIMPIAMOS EL CAMPO
      } else {
        Alert.alert('Error', 'No se pudo crear la tarea');
      }
    } catch (error) {
      Alert.alert('Error de red', `No se pudo conectar: ${(error as Error).message}`);
    }
  };
  const getTareaById = async (id: number) => {
    const urlExacta = `http://10.0.2.2:3000/todos/${id}`;

    try {
      const response = await fetch(urlExacta, {
        method: "GET"
      });
      
      const jsonResponse = await response.json();

      if (response.ok) {
        // Extraemos la tarea de la propiedad .data
        const tarea = jsonResponse.data;
        
        const estado = tarea.completed ? "✅ Completada" : "⏳ Pendiente";
        const descripcion = tarea.description ? tarea.description : "No especificada";

        Alert.alert(
          "Detalles de la Tarea",
          `Nombre: ${tarea.title}\nDescripción: ${descripcion}\nEstado: ${estado}`
        );
      } else {
        Alert.alert('Error', 'No se pudo obtener la tarea');
      }
    } catch (error) {
      Alert.alert('Error de red', `No se pudo conectar:${(error as Error).message}`);
    }
  };

  const deleteTarea = async (id: number) => {
    const urlExacta = `http://10.0.2.2:3000/todos/${id}`;

    try {
      const response = await fetch(urlExacta, {
        method: "DELETE"
      });
      
      const jsonResponse = await response.json();

      if (response.ok) {
        setTareas(tareas.filter(tarea => tarea.id !== id));
        console.log(`Tarea con id ${id} borrada exitosamente.`);
        Alert.alert('Éxito', 'Tarea borrada correctamente ');
      } else {
        console.log("Error del servidor al borrar:", jsonResponse);
        Alert.alert('Rechazado por la API', JSON.stringify(jsonResponse));
      }
    } catch (error) {
      Alert.alert('Error de red', `No se pudo conectar: ${(error as Error).message}`);
    }

    const toggleTarea = async (id: number) => {
    try {
      const response = await fetch(`http://10.0.2.2:3000/todos/${id}/toggle`, {
        method: "PATCH"
      });
      
      if (response.ok) {
        const jsonResponse = await response.json();
        setTareas(tareas.map(tarea => 
          tarea.id === id ? jsonResponse.data : tarea
        ));
      } else {
        Alert.alert('Error', 'No se pudo cambiar el estado de la tarea');
      }
    } catch (error) {
      Alert.alert('Error de red', `No se pudo conectar: ${(error as Error).message}`);
    }
  };
  };

  const toggleTarea = async (id: number) => {
    try {
      const response = await fetch(`http://10.0.2.2:3000/todos/${id}/toggle`, {
        method: "PATCH"
      });
      
      const jsonResponse = await response.json(); // Leemos qué nos contestó la API

      if (response.ok) {
        setTareas(tareas.map(tarea => 
          tarea.id === id ? jsonResponse.data : tarea
        ));
      } else {
        console.log("Error al hacer toggle:", jsonResponse);
        Alert.alert('Rechazado por la API', JSON.stringify(jsonResponse));
      }
    } catch (error) {
      Alert.alert('Error de red', `No se pudo conectar: ${(error as Error).message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis Tareas</Text>
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input}
          placeholder="¿Qué necesitas hacer?"
          value={nuevaTarea}
          onChangeText={setNuevaTarea}
        />
        <Button title="Agregar" onPress={postTarea} />
      </View>

      <FlatList 
        data={tareas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.tareaItem}>
            
          
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              
              
              <TouchableOpacity onPress={() => toggleTarea(item.id)}>
                <View style={{
                  width: 24,
                  height: 24,
                  borderWidth: 2,
                  borderColor: '#000',
                  backgroundColor: item.completed ? '#4CAF50' : '#fff',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 10,
                  borderRadius: 4
                }}>
                  {item.completed && <Text style={{color: '#fff', fontWeight: 'bold'}}>✓</Text>}
                </View>
              </TouchableOpacity>

              
              <Text style={{ 
                flex: 1, 
                fontSize: 16,
                textDecorationLine: item.completed ? 'line-through' : 'none', 
                color: item.completed ? 'gray' : 'black' 
              }}>
                {item.title}
              </Text>
            </View>
            
            
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button 
                title="EDITAR" 
                color="#f59e0b" // Un color naranja/amarillo
                onPress={() => router.push(`/editar?id=${item.id}`)} 
              />
              
              <Button 
                title="Ver" 
                color="blue" 
                onPress={() => router.push(`/detalles?id=${item.id}`)} 
              />
              <Button 
                title="Borrar" 
                color="red" 
                onPress={() => deleteTarea(item.id)} 
              />
            </View>

          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', marginRight: 10, padding: 10 },
  tareaItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderColor: '#eee' }
});