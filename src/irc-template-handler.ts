import { IRCClient } from "./irc-client";
import { TemplateHandler, RichMessageTemplate, AttachmentTemplate, Channel, UserMessage, AttachmentType } from "@akaiv/core";
import * as request from "request-promise";

/*
 * Created on Wed Oct 09 2019
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

export class AttachmentTemplateHandler extends TemplateHandler<IRCClient> {
    
    canHandle(template: RichMessageTemplate): boolean {
        return template && template.TemplateName === 'attachment';
    }
    
    async send(template: AttachmentTemplate, channel: Channel): Promise<UserMessage[]> {
        let text = template.Text;

        if (template.AttachmentList.length > 0) {
            text += '\n';
        }

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
                },
                method: 'POST'
            });

            let obj = JSON.parse(res);

            if (!obj.success) {
                throw new Error(`Cannot upload file. received ${res}`);
            }

            text += `\n${attachment.Name} (${AttachmentType[attachment.Type]}): ${obj.link}`;

            } catch(e) {
                // SKIP
            }
        }

        return this.Client.sendText(text, channel);
    }

    
}