// components/TodoItem.tsx
import React from 'react';
import { Todo } from '@/types';

interface TodoItemProps {
  todo: Todo;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, toggleTodo, deleteTodo }) => {
  return (
    <div>
      <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
        {todo.text}
      </span>
      <button onClick={() => toggleTodo(todo.id)}>
        {todo.completed ? '撤销' : '完成'} 
      </button>
      <button onClick={() => deleteTodo(todo.id)}>删除</button>
    </div>
  );
};

export default TodoItem;