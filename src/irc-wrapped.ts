import { Channel, User, UserMessage } from "@akaiv/core";
import { IRCClient } from "./irc-client";

/*
 * Created on Wed Oct 09 2019
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

export class IRCChannel extends Channel {

    private name: string;
    
    constructor(client: IRCClient, name: string) {
        super(client, client.nameToID(name));

        this.name = name;
    }

    get Name() {
        return this.name;
    }

}

export class IRCUser extends User {

    private name: string;

    constructor(client: IRCClient, name: string) {
        super(client, client.nameToID(name));

        this.name = name;
    }

    get Client() {
        return super.Client as IRCClient;
    }

    get Name() {
        return this.name;
    }

    get HasDMChannel() {
        return true;
    }

    async getDMChannel(): Promise<Channel> {
        return this.Client.getPMChannel(this);
    }

}

export class IRCMessage extends UserMessage {
    
    get Editable() {
        return false;
    }

    get Deletable() {
        return false;
    }

    editText(text: string): Promise<UserMessage> {
        throw new Error("Editing is not allowed.");
    }

    delete(): Promise<boolean> {
        throw new Error("Deleting is not allowed.");
    }


}