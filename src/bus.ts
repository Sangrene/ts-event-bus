import { nanoid } from "nanoid";

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

export class EventBus {
  private subcriptions: Subscription<any>[] = [];

  publish(queue: Queue, message: Message) {
    this.subcriptions.every((sub) => {
      if (sub.queue === queue) {
        sub.callback(message);
      }
    });
  }

  subscribe<T = any>(subscription: Omit<Subscription<T>, "id">) {
    const id = nanoid();
    this.subcriptions.push({ ...subscription, id });
    return {
      unsubscribe: () => {
        this.subcriptions = this.subcriptions.filter((sub) => sub.id !== id);
      },
    };
  }
}

