import { IRCClient } from "./irc-client";
import { TemplateHandler, RichMessageTemplate, AttachmentTemplate, Channel, UserMessage } from "@akaiv/core";
import * as request from "request-promise";

/*
 * Created on Wed Oct 09 2019
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

export class AttachmentTemplateHandler extends TemplateHandler<IRCClient> {
    
    canHandle(template: RichMessageTemplate): boolean {
        return template && template instanceof AttachmentTemplate;
    }
    
    async send(template: AttachmentTemplate, channel: Channel): Promise<UserMessage[]> {
        let text = template.Text;

        for (let attachment of template.AttachmentList) {
            try {
            let res = await request('https://file.io?expires=1', {
                formData: {
                    file: {
                        value: attachment.Buffer,
                        options: {
                            filename: attachment.Name
                        }
                    }
                }
            });

            let obj = JSON.parse(res);

            if (obj.success) {
                throw new Error(`Cannot upload file. received ${res}`);
            }

            text += `${attachment.Name} (${attachment.Type}): ${obj.link}\n`;

            } catch(e) {
                // SKIP
            }
        }

        return this.Client.sendText(text, channel);
    }

    
}