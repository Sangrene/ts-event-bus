type Queue = string;

export type Message<T = any> = T;

export type Subscription<T> = {
  id: string;
  queue: keyof T;
  callback: Callback<T>;
};

export type Callback<T> = (message: Message<T>, id?: string) => void | Promise<void>;

export type IdGenerator = () => string;

export class MessageTimeoutError extends Error {
  constructor(message?: Message) {
    super("Message timeout error");
    this.message = `Message timeout error on message ${message}`;
  }
}

export class EventBus<T> {
  private subcriptions: Subscription<any>[] = [];
  private idGenerator: IdGenerator;

  constructor(idGenerator: IdGenerator) {
    this.idGenerator = idGenerator;
  }

  async publish<Q extends keyof T>({ queue, message, id }: { queue: Q; message: T[Q]; id?: string }) {
    this.subcriptions.forEach(async (sub) => {
      if (sub.queue === queue) {
        sub.callback(message, id);
      }
    });
  }

  subscribe<Q extends keyof T>({
    queue,
    callback,
  }: {
    queue: Q;
    callback: (message: T[Q] & { id?: string }, id?: string) => void | Promise<void>;
  }) {
    const id = this.idGenerator();
    this.subcriptions.push({ queue, callback, id });
    return {
      unsubscribe: () => {
        this.subcriptions = this.subcriptions.filter((sub) => sub.id !== id);
      },
    };
  }

  publishAndWaitForResponse<Q extends keyof T, RQ extends keyof T>({
    message,
    queue,
    responseQueue,
    timeout = 5000,
  }: {
    queue: Q;
    responseQueue: RQ;
    message: T[Q] & { id?: string };
    timeout?: number;
  }): Promise<T[RQ]> {
    return new Promise((res, rej) => {
      const msgId = this.idGenerator();
      const timeoutId = setTimeout(() => {
        rej(new MessageTimeoutError());
      }, timeout);

      this.subscribe({
        queue: responseQueue,
        callback: (handledMessage, id) => {
          if (id === msgId) {
            clearTimeout(timeoutId);
            res(handledMessage);
          }
        },
      });

      this.publish({ queue, message, id: msgId });
    });
  }
}
