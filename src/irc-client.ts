import { BaseClient, ClientUser, Bot, ClientHandler, Channel, User, UserMessage } from "@akaiv/core";
import { Client as InternalClient } from "irc";
import { IRCChannel, IRCUser, IRCMessage } from "./irc-wrapped";
import NodeIRC = require("irc");
import { AttachmentTemplateHandler } from "./irc-template-handler";
import { prototype } from "events";

/*
 * Created on Wed Oct 09 2019
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

export class IRCClient extends BaseClient {
    
    private url: string;

    private internal: InternalClient;

    private connected: boolean;

    private channelPrefix: string;

    private channelMap: Map<string, IRCChannel>;
    private userMap: Map<string, IRCUser>;

    constructor({ url, channelList = new Array<string>(), channelPrefix = '&#', username, realName = username, port = 6667, secured = false, password = '' }: {
        url: string,
        channelList: string[],
        channelPrefix: string,
        username: string,
        realName: string,
        port: number,
        secured: boolean,
        password: string
    }) {
        super();

        this.channelMap = new Map();
        this.userMap = new Map();

        this.url = url;

        this.channelPrefix = channelPrefix;

        this.internal = new InternalClient(this.url, username, {
            autoConnect: false,
            channels: channelList,
            channelPrefixes: this.channelPrefix,
            realName: realName,
            port: port,
            secure: secured,
            password: password
        });

        this.internal.on('message', this.listenMessage.bind(this));

        this.connected = false;

        this.RichHandlerList.push(new AttachmentTemplateHandler(this));
    }

    get ClientId(): string {
        return 'irc';
    }

    get ClientName(): string {
        return 'IRC';
    }

    get Internal() {
        return this.internal;
    }

    get IrcURL() {
        return this.url;
    }

    get UserName() {
        return this.Internal.nick;
    }

    get Connected() {
        return this.connected;
    }

    get ChannelList(): Channel[] {
        return Array.from(this.channelMap.values());
    }

    nameToID(name: string) {
        return name.toLowerCase();
    }

    protected createClientUser(): ClientUser {
        return new IRCClientUser(this, this.nameToID(this.UserName));
    }

    protected createHandler(bot: Bot): ClientHandler<BaseClient> {
        return new IRCClientHandler(this, bot);
    }

    protected startClient(): Promise<void> {
        return new Promise<void> ((resolve, reject) => {
            this.Internal.connect(0, (e: NodeIRC.IMessage) => {
                this.Internal.once('registered', (msg: NodeIRC.IMessage) => {
                    resolve();
                });
            });
        });
    }

    protected stopClient(): Promise<void> {
        return new Promise<void> ((resolve, reject) => {
            this.Internal.disconnect('', resolve);
        });
    }

    getWrappedUser(name: string) {
        let wrapped = this.userMap.get(name);

        if (wrapped) {
            return wrapped;
        }

        wrapped = new IRCUser(this, name);

        this.userMap.set(name, wrapped);

        return wrapped;
    }

    getWrappedChannel(name: string) {
        let wrapped = this.channelMap.get(name);

        if (wrapped) {
            return wrapped;
        }

        wrapped = new IRCChannel(this, name);

        this.channelMap.set(name, wrapped);

        return wrapped;
    }

    isValidChannel(channel: Channel): boolean {
        return channel && this.channelMap.get(channel.Name) === channel;
    }

    isValidUser(user: User): boolean {
        return user && this.userMap.get(user.Name) === user;
    }

    getPMChannel(user: User) {
        return this.getWrappedChannel(user.Name);
    }

    async sendText(text: string, channel: Channel): Promise<UserMessage[]> {
        this.Internal.say(channel.Name, text);

        return [ new IRCMessage(this.ClientUser, channel, text) ];
    }

    protected listenMessage(nick: string, to: string, text: string, rawMessage: NodeIRC.IMessage) {
        let user = this.getWrappedUser(nick);
        let channel = this.getWrappedChannel(to);

        let message = new IRCMessage(user, channel, text, []);
    
        this.messageReceived(message);
    }

}

export class IRCClientUser extends ClientUser {

    constructor(client: IRCClient, id: string) {
        super(client, id);
    }

    get Client() {
        return super.Client as IRCClient;
    }

    get Name() {
        return this.Client.UserName;
    }

    get Connected() {
        return this.Client.Connected;
    }

    get HasAvatar() {
        return false;
    }

    async getAvatarURL(): Promise<string> {
        throw new Error(`IRC User doesn't have avatar`);
    }

}

export class IRCClientHandler extends ClientHandler<IRCClient> {

}