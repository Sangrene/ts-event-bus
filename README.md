# TS-simple-event-bus

A simple event bus that implements a pub / sub pattern. Fully typed.

## Use cases

```typescript
import { EventBus, Callback } from "ts-simple-event-bus";

type MessagePayload = {
  a: string;
  b: number;
};

const idGenerator = () => "id";
// Use a function to generate a unique id.
const bus = new EventBus(idGenerator);
//
const callback: Callback<MessagePayload> = (message) => {
  console.log(message.id, message.a, message.b);
};

bus.subscribe<MessagePayload>({ queue: "queue", callback });

bus.publish<MessagePayload>("queue", { a: "a", b: 1 });
```
