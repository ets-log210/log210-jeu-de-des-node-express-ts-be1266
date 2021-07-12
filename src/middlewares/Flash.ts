import type { Middleware } from '.';

type FlashMessage = {
    message: string;
    category?: string;
}

export default class Flash {
    private readonly _messages: FlashMessage[] = [];

    /**
     * Gets the length of the queue.
     */
    public get length() {
        return this._messages.length;
    }

    /**
     * Gets a array of FlashMessage.
     * @param categories If set, filter messages by categories.
     * @returns a array of FlashMessages.
     */
    public messages(...categories: string[]) {
        const fn = (f: FlashMessage) => {
            return categories.includes(f.category);
        };

        return categories.length
            ? this._messages.filter(fn)
            : [...this._messages];
    }

    /**
     * Expose helper function onto the req context
     */
    public static middleware: Middleware = (req, res, next) => {
        if (!req.flash) {
            if (!req.session)
                throw new Error('The flash middleware needs session support.');

            let flash = new Flash();
            req.session.flashMessageQueue = flash;
            req.flash = flash.flash.bind(flash);
        }

        res.locals.flashMessageQueue = req.session.flashMessageQueue;

        next();
    }


    /**
     * Push a message under the given category
     * into the messages queue.
     */
    public flash(message: string, category?: string) {
        const flashMessage: FlashMessage = {
            message: message,
            category: category
        };

        this._messages.push(flashMessage);
    }

    /**
     * Removes the first message from the queue and returns it.
     * If the queue is empty, undefined is returned and the queue is not modified.
     *
     * @returns the first message from the queue.
     */
    public shift() {
        return this._messages.shift();
    }

    /**
     * Check if there is any flashed message.
     *
     * @returns `true` if there is any flashed message.
     */
    public hasMessage() {
        return this._messages.length > 0;
    }
}

// declaration mergin for session objets
declare module 'express-session' {
    export interface SessionData {
        flashMessageQueue?: Flash
    }
}

// declaration mergin for helper function
declare module 'express' {
    export interface Request {
        flash: (message: string, category?: string) => void
    }
}

