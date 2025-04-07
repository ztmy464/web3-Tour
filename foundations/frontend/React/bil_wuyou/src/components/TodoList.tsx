// components/TodoList.tsx
import React from "react";
import TodoItem from "./TodoItem";
import { Todo } from "@/types";

interface TodoListProps {
  todos: Todo[];
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  children?: React.ReactNode; // 添加 children prop，类型为 React.ReactNode，设为可选 (?)
}

function TodoList({ todos, toggleTodo, deleteTodo, children }: TodoListProps) {
  return (
    <div>
      {/*如果列表为空，渲染 children，否则渲染列表 */}
      {todos.length === 0
        ? children 
        : todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              toggleTodo={toggleTodo}
              deleteTodo={deleteTodo}
            />
          ))}
    </div>
  );
}

export default TodoList;
