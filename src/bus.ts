type Queue = string;

export type Message<T = any> = T;

export type Subscription<T> = {
  id: string;
  queue: Queue;
  callback: Callback<T>;
};

export type Callback<T> = (message: Message<T>, id: string) => void;

export type IdGenerator = () => string;

export class MessageTimeoutError extends Error {
  constructor() {
    super("Message timeout error");
  }
}
export class EventBus {
  private subcriptions: Subscription<any>[] = [];
  private idGenerator: IdGenerator;

  constructor(idGenerator: IdGenerator) {
    this.idGenerator = idGenerator;
  }

  publish<T>({ queue, message, id }: { queue: Queue; message: Message<T>; id?: string }) {
    this.subcriptions.forEach((sub) => {
      if (sub.queue === queue) {
        sub.callback(message, id);
      }
    });
  }

  subscribe<T = any>(subscription: Omit<Subscription<T>, "id">) {
    const id = this.idGenerator();
    this.subcriptions.push({ ...subscription, id });
    return {
      unsubscribe: () => {
        this.subcriptions = this.subcriptions.filter((sub) => sub.id !== id);
        console.log("unsubscribed from", subscription.queue);
      },
    };
  }

  publishAndWaitForResponse<Req, Rep>({
    message,
    queue,
    responseQueue,
    timeout = 5000,
  }: {
    queue: Queue;
    responseQueue: string;
    message: Message<Req>;
    timeout?: number;
  }): Promise<Rep> {
    return new Promise((res, rej) => {
      const msgId = this.idGenerator();
      const timeoutId = setTimeout(() => {
        rej(new MessageTimeoutError());
      }, timeout);

      this.subscribe<Rep>({
        queue: responseQueue,
        callback: (handledMessage, id) => {
          if (id === msgId) {
            clearTimeout(timeoutId);
            res(handledMessage);
          }
        },
      });

      this.publish<Req>({ queue, message, id: msgId });
    });
  }
}
