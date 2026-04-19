import { describe, expect, it } from "vitest";
import { createInMemoryProgressBus, type ProgressEvent } from "./progress";

describe("ProgressBus", () => {
  it("subscribe receives events for the matching jobId", () => {
    const bus = createInMemoryProgressBus();
    const received: ProgressEvent[] = [];
    bus.subscribe("job-1", (ev) => received.push(ev));
    bus.publish({ jobId: "job-1", state: "running", at: 1, progress: 0.5 });
    bus.publish({ jobId: "job-2", state: "running", at: 1 });
    expect(received).toHaveLength(1);
    expect(received[0]!.jobId).toBe("job-1");
  });

  it("subscribeAll receives every event", () => {
    const bus = createInMemoryProgressBus();
    const all: string[] = [];
    bus.subscribeAll((ev) => all.push(ev.jobId));
    bus.publish({ jobId: "a", state: "queued", at: 1 });
    bus.publish({ jobId: "b", state: "running", at: 1 });
    expect(all).toEqual(["a", "b"]);
  });

  it("unsubscribe stops further events", () => {
    const bus = createInMemoryProgressBus();
    const seen: ProgressEvent[] = [];
    const unsub = bus.subscribe("x", (ev) => seen.push(ev));
    bus.publish({ jobId: "x", state: "running", at: 1 });
    unsub();
    bus.publish({ jobId: "x", state: "succeeded", at: 2 });
    expect(seen).toHaveLength(1);
  });

  it("listener errors do not break the bus", () => {
    const bus = createInMemoryProgressBus();
    bus.subscribe("x", () => {
      throw new Error("boom");
    });
    const ok: ProgressEvent[] = [];
    bus.subscribe("x", (ev) => ok.push(ev));
    expect(() =>
      bus.publish({ jobId: "x", state: "running", at: 1 }),
    ).not.toThrow();
    expect(ok).toHaveLength(1);
  });
});
