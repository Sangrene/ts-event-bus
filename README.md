# TS-simple-event-bus

A simple event bus that implements a pub / sub pattern. Fully typed.

## Use cases

Simple publish and subscribe:

```typescript
import { EventBus, Callback } from "ts-simple-event-bus";
import { uuid } from "uuid";

type MessagePayload = {
  a: string;
  b: number;
};

// Use a function to generate a unique id.
const bus = new EventBus(uuid);
//
const callback: Callback<MessagePayload> = (message) => {
  console.log(message.id, message.a, message.b);
};

bus.subscribe<MessagePayload>({ queue: "queue", callback });

bus.publish<MessagePayload>({ queue: "queue", { a: "a", b: 1 } });
```

Waiting for a response:

```typescript
const bus = new EventBus(idGenerator);
const responseQueueName = "event-response";
bus.subscribe({
  queue: "event-request",
  callback: (msg, id) => {
    bus.publish({ queue: responseQueueName, message: { event: "response" }, id });
  },
});
const result = await bus.publishAndWaitForResponse({
  queue: "event-request",
  responseQueue: responseQueueName,
  message: { event: "request" },
  timeout: 1000,
});
// result will be { event: "response" }
```
