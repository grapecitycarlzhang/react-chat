import React from "react";
import { useState, useEffect } from "react";
import ReactChat from "react-chat/components/connected-chat";
export { ReactChat }
export default function InitializedChat({ chatInitApi, chatApi, unit, chatType, chatNum, title, welcome = '', defaultVoiceInput = false }) {
    const [inited, setInited] = useState({
        loading: true,
        unit: 0,
        chatType: '',
        chatNum: 0,
        conversationId: '',
        botKey: '',
        startMessage: '',
        chatApi: ''
    })
    useEffect(() => {
        fetch(
            chatInitApi,
            {
                method: "POST",
                body: JSON.stringify({
                    unit: unit,
                    chatType: chatType,
                    chatNum: chatNum,
                    startTime: new Date(),
                    timezone: new Date().getTimezoneOffset(),
                    isDaylightSavingTime: false,
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ).then(response => {
            if (response.ok) {
                return response.json()
            }

        }).then(d => {
            setInited({ ...inited, loading: false, ...d, chatApi: chatApi.toLowerCase().replace('{botkey}', d.botKey) })
        })
    }, [])

    return inited.loading ? null : <ReactChat
        title={title}
        welcome={welcome}
        startMessage={inited.startMessage}
        conversationId={inited.conversationId}
        chatApi={inited.chatApi}
        defaultVoiceInput={defaultVoiceInput}
    />

}
