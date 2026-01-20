import { useState } from 'react';
import { Stack } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import {
  useTodoGetTodosQuery,
  useTodoCreateTodoMutation,
  useTodoUpdateTodoMutation,
  useTodoDeleteTodoMutation,
} from '@/hooks/_generated/todo.service';

export default function TodoApp() {
  const [newTodo, setNewTodo] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useTodoGetTodosQuery({});

  const createMutation = useTodoCreateTodoMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Todo', 'GetTodos'] });
      setNewTodo('');
    },
  });

  const updateMutation = useTodoUpdateTodoMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Todo', 'GetTodos'] });
    },
  });

  const deleteMutation = useTodoDeleteTodoMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Todo', 'GetTodos'] });
    },
  });

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      createMutation.mutate({ title: newTodo.trim() });
    }
  };

  const handleToggle = (id: string, completed: boolean) => {
    updateMutation.mutate({ id, completed: !completed });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id });
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: 'Todo App' }} />

      <View className="p-4">
        <View className="flex-row gap-2 mb-4">
          <TextInput
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3"
            placeholder="Add a new todo..."
            value={newTodo}
            onChangeText={setNewTodo}
            onSubmitEditing={handleAddTodo}
          />
          <TouchableOpacity
            className="bg-indigo-500 rounded-lg px-4 justify-center"
            onPress={handleAddTodo}
            disabled={createMutation.isPending}>
            <Text className="text-white font-semibold">Add</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" className="mt-8" />
        ) : (
          <FlatList
            data={data?.todos ?? []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="flex-row items-center py-3 border-b border-gray-100">
                <TouchableOpacity
                  className="mr-3"
                  onPress={() => handleToggle(item.id, item.completed)}>
                  <View
                    className={`w-6 h-6 rounded border-2 items-center justify-center ${
                      item.completed
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'border-gray-300'
                    }`}>
                    {item.completed && <Text className="text-white text-xs">✓</Text>}
                  </View>
                </TouchableOpacity>

                <Text
                  className={`flex-1 text-base ${
                    item.completed ? 'text-gray-400 line-through' : 'text-gray-800'
                  }`}>
                  {item.title}
                </Text>

                <TouchableOpacity
                  className="p-2"
                  onPress={() => handleDelete(item.id)}>
                  <Text className="text-red-500">Delete</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text className="text-gray-400 text-center mt-8">
                No todos yet. Add one above!
              </Text>
            }
          />
        )}
      </View>
    </View>
  );
}
