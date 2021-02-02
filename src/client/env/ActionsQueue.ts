/**
 * Manages a queue of messages to send to the server
 */
import { Connection, SendCommandRequest } from './Connection';
export type ActionCallback = (err: string | null, res: {}) => void;
export class ActionsQueue {
    static guiActions: Promise<any> = Promise.resolve();

    protected static getGUIActionPromise(action: string, connection: Connection, cb: ActionCallback) {
        return new Promise((resolve, reject) => {
            const req: SendCommandRequest = {
                type: "sendCommand",
                command: action
            };
            if (connection) {
                connection?.sendRequest(req, (err: string | null, res: {}) => {
                    if (cb) {
                        if (err) {
                            console.warn("[actions-queue] Warning: ", err);
                            resolve(null);
                        } else {
                            cb(err, res);
                            // console.log(res);
                            resolve(res);
                        }
                    }
                });
            } else {
                console.warn(`[actions-queue] Warning: connection is null`);
                resolve(req);
            }
        });
    }

    /**
     * Queue the next gui action onto the promise chain. This ensures that actions are
     * executed on the server in the same order as they are sent on the client
     * @param {string} action the concatenation of button action and function name to call in pvs on the server
     * e.g., "click_bigUP"
     */
    static queueGUIAction (action: string, connection: Connection, cb: ActionCallback) {
        ActionsQueue.guiActions = ActionsQueue.guiActions.then((res) => {
            return ActionsQueue.getGUIActionPromise(action, connection, cb);
        });
    };

    static sendINIT (connection: Connection, cb: ActionCallback) {
        return ActionsQueue.queueGUIAction("", connection, cb);
    };

    static send (action: string, connection: Connection, cb: ActionCallback) {
        return ActionsQueue.queueGUIAction(action, connection, cb);
    };

}
