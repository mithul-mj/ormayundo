import { __rest } from "tslib";
import { QueueBase } from './queue-base';
/**
 * The QueueEventsProducer class is used for publishing custom events.
 */
export class QueueEventsProducer extends QueueBase {
    constructor(name, opts = {
        connection: {},
    }, backendFactory) {
        super(name, Object.assign({ blockingConnection: false }, opts), backendFactory);
        this.opts = opts;
    }
    /**
     * Publish custom event to be processed in QueueEvents.
     * @param argsObj - Event payload
     * @param maxEvents - Max quantity of events to be saved
     */
    async publishEvent(argsObj, maxEvents = 1000) {
        const { eventName } = argsObj, restArgs = __rest(argsObj, ["eventName"]);
        const fields = Object.assign({ event: eventName }, restArgs);
        await this.backend.publishEvent(fields, maxEvents);
    }
    /**
     * Closes the connection and returns a promise that resolves when the connection is closed.
     */
    async close() {
        if (!this.closing) {
            this.closing = this.backend.close();
        }
        await this.closing;
    }
}
