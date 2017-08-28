# mup-disk
Plugin for Meteor Up to view and reduce disk usage.

Install with
```bash
npm install mup-disk
```

Add to list of plugins in your mup config:
```js
module.exports = {
  plugins: ['mup-disk'],
  // rest of config
}
```

### Use

`mup disk show` Shows total disk usage, usage by app, and usage by docker.

`mup disk clean` Runs `docker system prune -af`, and deletes the app's `last/bundle` folder


