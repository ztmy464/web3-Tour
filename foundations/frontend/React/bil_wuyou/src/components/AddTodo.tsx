// components/AddTodo.tsx
import React, { useState } from 'react';

interface AddTodoProps {
  addTodo: (text: string) => void;
}
function AddTodo ({ addTodo }: AddTodoProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTodo(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="添加新事项"
      />
      <button type="submit">添加</button> 
    </form>
  );
};

export default AddTodo;