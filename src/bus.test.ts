import chai from "chai";
import spies from "chai-spies";
import { EventBus, Callback, MessageTimeoutError } from ".";
import chaiAsPromised from "chai-as-promised";
import { nanoid } from "nanoid";
chai.use(spies);
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Event bus", () => {
  const idGenerator = nanoid;
  it("Doesn't receive a message published to channel not subscribed to", () => {
    type BusType = {
      queue: {
        truc: string;
      };
    };
    const bus = new EventBus<BusType>(idGenerator);
    const callback: Callback<{ truc: string }> = (message) => {};
    const spiedCallback = chai.spy(callback);

    bus.subscribe({ queue: "queue", callback: spiedCallback });

    //@ts-expect-error
    bus.publish({ queue: "notqueue", message: { truc: "truc" } });

    expect(spiedCallback).to.not.have.been.called.once;
  });
  it("Receives the message published to a channel which is subscribed to", () => {
    type BusType = {
      queue: {
        truc: string;
      };
    };
    const bus = new EventBus<BusType>(idGenerator);
    const callback: Callback<{ truc: string }> = (message) => {};
    const spiedCallback = chai.spy(callback);

    bus.subscribe({ queue: "queue", callback: spiedCallback });

    bus.publish({ queue: "queue", message: { truc: "truc" } });

    expect(spiedCallback).to.have.been.called.once;
  });

  it("Can unsubscribe to a channel", () => {
    type BusType = {
      queue: {
        truc: string;
      };
    };
    const bus = new EventBus<BusType>(idGenerator);
    const callback: Callback<{ truc: string }> = (message) => {};
    const spiedCallback = chai.spy(callback);

    const { unsubscribe } = bus.subscribe({ queue: "queue", callback: spiedCallback });
    unsubscribe();
    bus.publish({ queue: "queue", message: { truc: "truc" } });

    expect(spiedCallback).to.not.have.been.called.once;
  });

  it("Can publish and wait for response", async () => {
    type BusType = {
      "event-request": {
        truc: string;
      };
      "event-response": {
        truc: string;
      };
    };
    const bus = new EventBus<BusType>(idGenerator);
    const responseQueueName = "event-response";
    bus.subscribe({
      queue: "event-request",
      callback: (msg, id) => {
        bus.publish({ queue: responseQueueName, message: { truc: "response" }, id });
      },
    });
    const result = await bus.publishAndWaitForResponse({
      queue: "event-request",
      responseQueue: responseQueueName,
      message: { truc: "request" },
      timeout: 1000,
    });
    expect(result).to.deep.equal({ truc: "response" });
  });

  it("Will throw MessageTimeoutError if publishAndWaitForResponse does not complete in time", async () => {
    type BusType = {
      "event-request": {
        truc: string;
      };
      "event-response": {
        truc: string;
      };
    };
    const bus = new EventBus<BusType>(idGenerator);
    await expect(
      bus.publishAndWaitForResponse({
        queue: "event-request",
        responseQueue: "event-response",
        message: { truc: "truc" },
        timeout: 1000,
      }),
    ).to.be.rejectedWith(MessageTimeoutError);
  });

  it("Can handle Promise response", async () => {
    type BusType = {
      "event-request": {
        truc: string;
      };
      "event-response": {
        trac: string;
      };
    };
    const bus = new EventBus<BusType>(idGenerator);
    const responseQueueName = "event-response";
    bus.subscribe({
      queue: "event-request",
      callback: (msg, id) => {
        return new Promise((req, rej) => {
          const timeoutId = setTimeout(() => {
            bus.publish({ queue: responseQueueName, message: { trac: "response" }, id });
            req();
            clearTimeout(timeoutId);
          }, 1000);
        });
      },
    });
    const result = await bus.publishAndWaitForResponse({
      queue: "event-request",
      responseQueue: responseQueueName,
      message: { truc: "request" },
      timeout: 2000,
    });
    expect(result).to.deep.equal({ trac: "response" });
  });
});