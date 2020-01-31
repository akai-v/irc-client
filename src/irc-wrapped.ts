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

    get Client() {
        return super.Client as IRCClient;
    }

    get Name() {
        return this.name;
    }

    async getUserList() {
        let nameList = await new Promise<string[]>((resolve) => this.Client.Internal.once(`names#${this.name}`, resolve));

        return nameList.map((name) => this.Client.getWrappedUser(name));
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

    get HasAvatar() {
        return false;
    }

    async getAvatarURL(): Promise<string> {
        throw new Error(`IRC User doesn't have avatar`);
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

    async delete(): Promise<boolean> {
        return false;
    }


}