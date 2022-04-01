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
    const bus = new EventBus(idGenerator);
    const callback: Callback<{ truc: string }> = (message) => {};
    const spiedCallback = chai.spy(callback);

    bus.subscribe<{ truc: string }>({ queue: "queue", callback: spiedCallback });

    bus.publish<{ truc: string }>({ queue: "notqueue", message: { truc: "truc" } });

    expect(spiedCallback).to.not.have.been.called.once;
  });
  it("Receives the message published to a channel which is subscribed to", () => {
    const bus = new EventBus(idGenerator);
    const callback: Callback<{ truc: string }> = (message) => {};
    const spiedCallback = chai.spy(callback);

    bus.subscribe<{ truc: string }>({ queue: "queue", callback: spiedCallback });

    bus.publish({ queue: "queue", message: { truc: "truc" } });

    expect(spiedCallback).to.have.been.called.once;
  });

  it("Can unsubscribe to a channel", () => {
    const bus = new EventBus(idGenerator);
    const callback: Callback<{ truc: string }> = (message) => {};
    const spiedCallback = chai.spy(callback);

    const { unsubscribe } = bus.subscribe<{ truc: string }>({ queue: "queue", callback: spiedCallback });
    unsubscribe();
    bus.publish({ queue: "queue", message: { truc: "truc" } });

    expect(spiedCallback).to.not.have.been.called.once;
  });

  it("Can publish and wait for response", async () => {
    const bus = new EventBus(idGenerator);
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
    const bus = new EventBus(idGenerator);
    await expect(
      bus.publishAndWaitForResponse({
        queue: "event-request",
        responseQueue: "event-response",
        message: { truc: "truc" },
        timeout: 1000,
      }),
    ).to.be.rejectedWith(MessageTimeoutError);
  });
});
