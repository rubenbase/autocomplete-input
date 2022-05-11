1. What is the difference between Component and PureComponent? give an example where it might break my app.

A Component will rerender every time the parent rerenders. If the child component is a
PureComponent it will rerender IF the props changed (does a shallow comparison). Issue is, it does a shallow comparison, so if you have an array ['whatever', 'whatever2'] and mutate one of those items, the
PureComponent won't react as if that changed, it will compare the old array and new array see they are
the same array hence it won't rerender which is not what we want.

2. Context + ShouldComponentUpdate might be dangerous. Can think of why is that?

Because shouldComponentUpdate will have logic to determine if the component and it's children should be rendered or not. It also cuts the propagation of the context so children might not get the latest context. You can get around this by using dependency injection though, for example in Vodafone we used MobX observables to avoid this issue.

3. Describe 3 ways to pass information from a component to its PARENT.

Pass a callback function as prop (check the onSelect implementation on the autocomplete)
Via context, you can update something in the child, the parent will rerender if that context is consumed.
You can use observables, the parent can subscribe to events sent by a child.

4. Give 2 ways to prevent components from re-rendering.

If you use useState it will rerender the component, if you want to store data and change it without rerendering the component when the data is changed you can use useRef. For example Formik (not the alpha they are launching soon) uses state not refs, so on every change it causes rerenders. On the other side, react-hook-form uses refs hence the performance is way better because it avoids those rerenders on every change.

Using useMemo to memoize values or useCallback to memoize functions. If you declare a function without this it will cause a rerender when passed to a child every time.

5. What is a fragment and why do we need it? Give an example where it might
   break my app.

React jsx needs to be enclosed in a tag, you can't return sibling elements like:

```
return (
 <div></div>
 <div></div>
)
```

because internally react can't parse this. A fragment is used to enclose a group of sibling elements. Before you had to do it with another html element which maybe you didn't want to add to the DOM but you had to add it so React could parse the jsx. Now you can use a Fragment which will allow you to pass a `key` props if you need it for lists and you can use it to group the sibling elements like:

```
return (
 <Fragment>
  <div></div>
  <div></div>
 </Fragment>
)
```

or

```
return (
 <>
  <div></div>
  <div></div>
 </>
)
```

It might break the app if you're using styles expecting to have the sibling elements inside another element and expect a Fragment to output a DOM element wrapping them. Also in a list if you don't provide a `key`.

6. Give 3 examples of the HOC pattern.

HOC is higher order component.

1 Useful to split the UI and logic in separate places, for example I can use a HOC to fetch the data and then pass it to the UI component. This way it is easier to do the unit tests and we have separation of concerns, this is related to the container pattern which is we fetch logic in a parent component and pass it to child UI component.

2 For composability, rehuse in different places or compose multiple ones. I might need access to the router props, redux store, logged in user data etc in different components so I can use a HOC or HOCs to connect and get the different data and pass it to the component that wants it.

3 To create a HOC for displayName as when debugging HOCs can be hard when not doing this approach as the same HOC can be used in multiple places. This way we can set different displayNames for each based on the component that is currently using the HOC at that time.

7. what's the difference in handling exceptions in promises, callbacks and async...await.

With the callback approach usually is the first param of the callbak the one that holds the value for the error and then we need to check with a condition if it's empty or actually has an error:

```
whatever("text", function(err, data) {
  if(err) {
      // handle error
  }

  // all good, do something with data
});
```

Now this is difficult to maintain as if we have multiple chained operations, the next needs to be inside the previous one and we end up with the famous callback hell.

With promises, in order to create async operations improves, we can create a promise:

```
new Promise((resolve, reject) => {
    setTimeout(() => {
        reject(new Error());
    }
});
```

resolve is called to return the data and reject to error.

then we can handle the error by calling the promise we created and using `catch(e)` or can also use try{}catch(){} depending on how are we throwing the error.

The improvement against callbacks is that we can chain multiple promises using grouped `then(result)` with one `catch` at the end that catches any error and avoid the callback hell or else we're going to keep having the same indentation issue if instead of chaining the `then()` calls we nest them.

```
const func = () => {
    apiFetch()
        .then(apiFetch2)
        .then(apiFetch3)
        .catch(e => { // handle error })
}
```

if the promises are not related with each other it's just better to use `Promise.all`.

async...await is syntax sugar that makes a function return a Promise<T>.

The way to handle error is with try{}catch(e){}.

If the function is `async` we can then `await` the result. This will make the next line not be ran until we get back the result or we error which will send us to the `catch()` avoiding then the rest of the code inside the `try{}`

```
const func = async () => {
    try{
        const res = await apiFetch()
        const res2 = await apiFetch2(res)
        // ...other stuff
    }catch(e){
        //handle error
    }
}

```

8. How many arguments does setState take and why is it async.

- has 2 arguments, the one does the update the second is optional and is a callback that runs after the update is done.

As the 1st argument it can take:

- can take an object to change the state in an async way. It's async because react tries to batch multiple state changes for better performance.
- if we need to have access to the prevState or props we can pass a fuction as the 1st argument, that function has 2 arguments `prevState` and `props` that we can use to update the state.

9. List the steps needed to migrate a Class to Function Component.

- Replace the `class` component for a `function` component
- As it no longer is a class the class methods need to be now functions.
- There's no render method, the jsx in a functional component should be directly returned
- There's no `this.`. For example `this.props` is now `props`. The functions are called directly without the `this` too so no need to have the bindings (Unless you created the methods as arrow functions then you probably don't have bindings).
- There's no constructor to set up the initial state, now we have a function called useState. Obviously this also changes the way we set state.
- Change the lifecycle methods to the new ones, for exampe `componentDidMount` is `useEffect` now.
- HOCs are usually replaced with custom hooks.
- React API changes for example context.

10. List a few ways styles can be used with components.

- Inline styles with `<div style={{ border: '1px solid red' }}>..</div>`
- css classNames `<div className="css-classname">..</div>`
  - Here I like to split it different ways.
  - Utility classes like tailwind + PostCSS
  - CSS Modules classes to avoid conflict with other react components.
  - Regular CSS classes or preprocessors classes
- js-in-css: Generate a react component with injected styles via javascript.

11. How to render an HTML string coming from the server

With dangerouslySetInnerHTML but we need to sanitize the value before setting it for security reasons (XSS attacks),
