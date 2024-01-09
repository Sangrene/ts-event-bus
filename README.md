# TS-simple-event-bus
![npm](https://img.shields.io/npm/v/ts-simple-event-bus)

A simple event bus that implements a pub / sub pattern. Fully typed.


### Version 2.XX
Version 2 adds a typing that is defined once at the bus initialisation.
## Use cases

Simple publish and subscribe:

```typescript
import { EventBus, Callback } from "ts-simple-event-bus";
import { uuid } from "uuid";

// The typing is a nested object with queue names as keys and message payload as value
type EventBusTyping = {
  queue: {
    a: string;
    b: number;
  }
};

// Use a function to generate a unique id. You should provide the typing as well
const bus = new EventBus<EventBusTyping>(uuid);

bus.subscribe({ queue: "queue", callback: (message) => {
  console.log(message.id, message.a, message.b);
} });

bus.publish({ queue: "queue", { a: "a", b: 1 } });
```

Waiting for a response:

```typescript
type EventBusTyping = {
  queue: {
    a: string;
    b: number;
  }
};
const bus = new EventBus<EventBusTyping>(idGenerator);
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


### Version 1.XX
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
