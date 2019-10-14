import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import ReactChat from "../src/index"

function InitChat() {
    const [inited, setInited] = useState({
        loading: true,
        unit: 1,
        lesson: 1,
        conversationId: '',
        botKey: '',
        startMessage: ''
    })
    useEffect(() => {
        fetch(
            'http://localhost:5056/api/bots/initialize/',
            {
                method: "POST",
                body: JSON.stringify({
                    unit: 1,
                    lesson: 1,
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
            setInited({ ...inited, loading: false, ...d })
        })
    }, [])

    return null
    // return inited.loading ? null : <ReactChat
    //     title='lesson greeting'
    //     welcome='Welcome to lesson greeting'
    //     startMessage={inited.startMessage}
    //     conversationId={inited.conversationId}
    //     chatBotApi={`http://localhost:5056/api/bots/${inited.botKey}/chat`}
    //     speechTextApi={`http://localhost:5056/api/bots/${inited.botKey}/chat`}
    //     // speechTextApi='https://miroservice.azurewebsites.net/api/speech'
    //     defaultVoiceInput={false}
    // ></ReactChat>
}

ReactDOM.render(<ReactChat
    chatInitApi='http://marvinui.azurewebsites.net/api/bots/initialize/'
    chatApi='https://marvinui.azurewebsites.net/api/bots/{botkey}/chat'
    title='Unit 4 Story 2'
    unit={4}
    chatType='story'
    chatNum={2}
/>, document.getElementById("react-chat-container"))