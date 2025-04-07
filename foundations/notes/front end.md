# js

# ts

- Introduction to TypeScript


- Setting up the development environment
- Creating your first TypeScript program
- Configuring the TypeScript compiler
- Debugging TypeScript applications

typescript is a superset of JavaScript that essentially javascript with type checking.

cons:
we have to give our code to the typescript compiler to compile and translate into javascript this process is called **transpilation**.

# react

### what's  virtual DOM? how react actually created the virtual DOM.

- Creating a virtual representation of the UI (virtual DOM).
- Using the diffing algorithm to compare the new and old virtual DOM.
- Efficiently updating the real DOM based on minimal changes.

```js
function App() {
  return <h1>Hello, World!</h1>;
}
```
React creates a virtual DOM object for the element: { type: 'h1', props: { children: 'Hello, World!' } }.


### How `useContext` works in conjunction with `createContext` and `Context.Provider` to manage global state or shared data.

### what is Callback Function?

A callback function is a function that is **passed as a parameter** to another function and is executed by that function at an appropriate time.

```js
function executeCallback(callback: () => void) {
  console.log("ready to call callback...");
  callback(); // execute callback fun
}

executeCallback(() => {
  console.log("I'm callback fun");
});


// setUsers的回调函数prevUsers =>{} 的参数 prevUsers 表示更新前的用户列表
setUsers(prevUsers => 
// map的回调函数user =>{} 的参数 user 表示更新前的用户列表中的每个用户
  prevUsers?.map(user => 
    user.id === id ? { ...user, ...updates } : user
  ) || null
);
```

## component communication

### Props (Parent to Child)

### Callback Functions (Child to Parent)

### Context hook (Global State)

###  Slots？

Slots are a mechanism for Content Distribution or Content Projection. They allow you to create a component where parts of its content can be defined and populated by the parent component that uses it.

在react中，Slots就是将JSX 作为 props 传递给子组件

核心目的：

提高组件的复用性和灵活性：组件定义骨架和行为，具体内容由外部传入。
解耦父子组件的内容依赖：子组件不需要知道父组件会传入什么具体内容，只需要提供“坑位”。
创建更复杂的布局组件：如布局框架、对话框、列表项等，这些组件的结构固定，但填充的内容各不相同。

## HOOKS

| **Hook**            | **Purpose** |
|---------------------|------------|
| **`useState`**         | Manages component state. |
| **`useEffect`**        | Handles side effects (e.g., data fetching, subscriptions). |
| **`useContext`**       | Accesses global state (avoids prop drilling). |
| `useRef`           | References DOM elements and stores mutable values without triggering re-renders. |
| `useReducer`       | Manages complex state logic (similar to Redux). |
| `useMemo`          | Caches computed values to optimize performance. |
| `useCallback`      | Caches function instances to prevent unnecessary re-renders. |
| `useLayoutEffect`  | Runs synchronously after DOM updates but before the browser paints. |
| `useImperativeHandle` | Customizes the values exposed when using `ref` with `forwardRef`. |
| `useId`            | Generates unique IDs for accessibility and form elements. |


# next.js  

### `create-react-app` vs `NextJS` vs `Vite`

https://youtu.be/mLNq3SanPkk


## **⏳ Which One Should You Choose?**
| Feature                 | CRA 🏗 | Next.js 🌍 | Vite ⚡ |
|-------------------------|--------|-----------|--------|
| **Performance (Dev)**   | 🚶‍♂️ Slow | 🚄 Fast | ⚡ Very Fast |
| **Performance (Build)** | 🐢 Slow | ⚡ Fast | ⚡ Very Fast |
| **SSR Support**         | ❌ No  | ✅ Yes | ❌ No |
| **Static Site Generation** | ❌ No | ✅ Yes | ❌ No |
| **API Routes**          | ❌ No | ✅ Yes | ❌ No |
| **Code Splitting**      | ❌ No (manual) | ✅ Automatic | ✅ Automatic |
| **Ease of Use**         | ✅ Easy | ⚠️ Medium | ✅ Easy |
| **Best For**            | Small React apps | SEO-heavy & full-stack apps | Performance-driven SPAs |

SEO (Search Engine Optimization):

✅ Good for SEO:  
Server-side rendering (SSR) or static site generation (SSG)  

❌ Bad for SEO:  
Client-side rendering (CSR) (because search engines struggle with JavaScript-heavy sites)

```bash
npx create-next-app
npm create vite
```

### Server Components VS Client Components

`app/` 中默认是服务端组件,客户端组件（Client） 需要手动声明 `"use client"` 


##  如何选择？

| 如果你要... | 选择组件类型 |
|-------------|--------------|
| 显示静态内容 | ✅ 服务端组件 |
| 数据展示、SSR 页面 | ✅ 服务端组件 |
| 使用 Hook 或处理事件 | ✅ 客户端组件 |
| 表单交互、动画、导航 | ✅ 客户端组件 |
| 只负责渲染，不交互 | ❌ 不要写成客户端组件（没必要） |



- ✅ 默认用服务端组件，**性能更优**
- ✅ 客户端组件只用于交互逻辑，不要滥用
- ✅ 客户端组件可以嵌套在服务端组件里
