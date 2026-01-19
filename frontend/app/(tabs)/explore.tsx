import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  useTodoGetTodosQuery,
  useTodoCreateTodoMutation,
  useTodoUpdateTodoMutation,
  useTodoDeleteTodoMutation,
} from "@/hooks/_generated/todo.service";

export default function TodoScreen() {
  const [newTodo, setNewTodo] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useTodoGetTodosQuery({});

  const createTodo = useTodoCreateTodoMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Todo", "GetTodos"] });
      setNewTodo("");
    },
  });

  const updateTodo = useTodoUpdateTodoMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Todo", "GetTodos"] });
    },
  });

  const deleteTodo = useTodoDeleteTodoMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Todo", "GetTodos"] });
    },
  });

  const handleAdd = () => {
    if (newTodo.trim()) {
      createTodo.mutate({ title: newTodo.trim() });
    }
  };

  const handleToggle = (id: string, completed: boolean) => {
    updateTodo.mutate({ id, completed: !completed });
  };

  const handleDelete = (id: string) => {
    deleteTodo.mutate({ id });
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Error: {error.message}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Todos
      </ThemedText>

      <ThemedView style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a todo..."
          placeholderTextColor="#888"
          value={newTodo}
          onChangeText={setNewTodo}
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAdd}
          disabled={createTodo.isPending}
        >
          <ThemedText style={styles.addButtonText}>+</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <FlatList
        data={data?.todos ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThemedView style={styles.todoItem}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => handleToggle(item.id, item.completed)}
            >
              <ThemedText>{item.completed ? "[x]" : "[ ]"}</ThemedText>
            </TouchableOpacity>
            <ThemedText
              style={[styles.todoText, item.completed && styles.completed]}
            >
              {item.title}
            </ThemedText>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <ThemedText style={styles.deleteText}>X</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>No todos yet</ThemedText>
        }
      />

      <ThemedText style={styles.total}>Total: {data?.total ?? 0}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#fff",
  },
  addButton: {
    backgroundColor: "#007AFF",
    width: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  checkbox: {
    marginRight: 12,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
  },
  completed: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  deleteText: {
    color: "#FF3B30",
    fontWeight: "bold",
    paddingHorizontal: 8,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.5,
    marginTop: 40,
  },
  total: {
    textAlign: "center",
    marginTop: 20,
    opacity: 0.7,
  },
});
