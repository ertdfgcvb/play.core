# play.core

Core files, example and demos of the live-code ASCII playground:  
[play.ertdfgcvb.xyz](https://play.ertdfgcvb.xyz)

Examples and demos:  
[play.ertdfgcvb.xyz/abc.html#source:examples](https://play.ertdfgcvb.xyz/abc.html#source:examples)

Embedding examples:  
[single](https://play.ertdfgcvb.xyz/tests/single.html)  
[multi](https://play.ertdfgcvb.xyz/tests/multi.html)  

Playground manual, API and resources:  
[play.ertdfgcvb.xyz/abc.html](https://play.ertdfgcvb.xyz/abc.html)

## Installation & usage

To install this package:

```shell
npm install https://github.com/ertdfgcvb/play.core
```

To import and run one of the examples:

```javascript
import { run } from "play.core/src/run.js";
import * as program from "play.core/src/programs/demos/spiral.js";

const settings = {
  fps: 60,
  element: document.querySelector("pre"),
};

run(program, settings).catch(function(e) {
  console.warn(e.message);
  console.log(e.error);
});
```
