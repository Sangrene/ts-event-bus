type Queue = string;

export type Message<T = any> = {
  id: string;
} & T;

export type Subscription<T> = {
  id: string;
  queue: Queue;
  callback: Callback<T>;
};

export type Callback<T> = (message: Message<T>) => void;

export type IdGenerator = () => string;

export class EventBus {
  private subcriptions: Subscription<any>[] = [];
  private idGenerator: IdGenerator;

  constructor(idGenerator: () => string) {
    this.idGenerator = idGenerator;
  }

  publish<T>(queue: Queue, message: Omit<Message<T>, "id">) {
    this.subcriptions.every((sub) => {
      if (sub.queue === queue) {
        sub.callback(message);
      }
    });
  }

  subscribe<T = any>(subscription: Omit<Subscription<T>, "id">) {
    const id = this.idGenerator();
    this.subcriptions.push({ ...subscription, id });
    return {
      unsubscribe: () => {
        this.subcriptions = this.subcriptions.filter((sub) => sub.id !== id);
      },
    };
  }
}
