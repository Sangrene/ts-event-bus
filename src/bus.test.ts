import chai from "chai";
import spies from "chai-spies";
import { EventBus, Callback } from ".";
chai.use(spies);
const expect = chai.expect;

describe("Event bus", () => {
  const idGenerator = () => "id";
  it("Doesn't receive a message published to channel not subscribed to", () => {
    const bus = new EventBus(idGenerator);
    const callback: Callback<{ truc: string }> = (message) => {};
    const spiedCallback = chai.spy(callback);

    bus.subscribe<{ truc: string }>({ queue: "queue", callback: spiedCallback });

    bus.publish("notqueue", { truc: "truc" });

    expect(spiedCallback).to.not.have.been.called.once;
  });
  it("Receives the message published to a channel which is subscribed to", () => {
    const bus = new EventBus(idGenerator);
    const callback: Callback<{ truc: string }> = (message) => {};
    const spiedCallback = chai.spy(callback);

    bus.subscribe<{ truc: string }>({ queue: "queue", callback: spiedCallback });

    bus.publish("queue", { truc: "truc" });

    expect(spiedCallback).to.have.been.called.once;
  });

  it("Can unsubscribe to a channel", () => {
    const bus = new EventBus(idGenerator);
    const callback: Callback<{ truc: string }> = (message) => {};
    const spiedCallback = chai.spy(callback);

    const { unsubscribe } = bus.subscribe<{ truc: string }>({ queue: "queue", callback: spiedCallback });
    unsubscribe();
    bus.publish("queue", { truc: "truc" });

    expect(spiedCallback).to.not.have.been.called.once;
  });
});
